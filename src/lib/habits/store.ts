import { useSyncExternalStore } from "react";
import { todayKey, addDays } from "./dates";
import {
  completeToday,
  createHabit,
  refresh,
  undoToday,
  togglePastDay,
  verifyAndHealIntegrity,
  reorderHabits,
  reorderHabitsByIds,
  pauseHabit,
  resumeHabit,
  applyGrace,
} from "./logic";
import { setQuantValue, incrementQuantValue } from "./quantitative";
import { logRelapse as logHabitRelapse, undoRelapse as undoHabitRelapse } from "./avoid";
import { toggleSubtask as toggleHabitSubtask, addSubtaskToHabit, removeSubtaskFromHabit } from "./subtasks";
import { addVacationRange as addHabitVacation, removeVacationRange as removeHabitVacation } from "./vacation";
import { mergeVaultHabits } from "./vaultSync";
import { syncWidgetData } from "./widgetBridge";
import {
  reconcileNativeReminders,
  requestNotificationPermission,
} from "./reminders";
import { DEFAULT_SETTINGS, type Habit, type HabitCollection, type HabitSettings } from "./types";

/**
 * Local-only habit store. Data lives in this browser/device's localStorage under the
 * standard keys the original Daily Spark used, so nothing leaves the device.
 */
export const STORAGE_KEYS = {
  habits: "streakflame_streaks",
  settings: "streakflame_settings",
  lastBackup: "streakflame_last_backup",
  autoBackupHistory: "streakflame_autobackup_history",
  recoveryStash: "streakflame_recovery_stash",
  collections: "streakflame_collections",
} as const;

export interface LocalBackupSnapshot {
  date: string;
  timestamp: string;
  habits: Habit[];
  settings: HabitSettings;
  collections?: HabitCollection[];
}

export interface HabitState {
  loaded: boolean;
  habits: Habit[];
  collections: HabitCollection[];
  settings: HabitSettings;
}

const SERVER_STATE: HabitState = { loaded: false, habits: [], collections: [], settings: DEFAULT_SETTINGS };
let state: HabitState = SERVER_STATE;
const listeners = new Set<() => void>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveRollingBackup(habits: Habit[], settings: HabitSettings, collections: HabitCollection[]) {
  if (typeof window === "undefined" || habits.length === 0) return;
  if (settings.autoBackupHistoryEnabled === false) return;
  try {
    const today = todayKey();
    const history = readJson<LocalBackupSnapshot[]>(STORAGE_KEYS.autoBackupHistory, []);
    const filtered = history.filter((s) => s.date !== today);
    const updated: LocalBackupSnapshot[] = [
      {
        date: today,
        timestamp: new Date().toISOString(),
        habits,
        settings,
        collections,
      },
      ...filtered,
    ].slice(0, 7);
    localStorage.setItem(STORAGE_KEYS.autoBackupHistory, JSON.stringify(updated));
  } catch (e) {
    console.error("[daily-spark] could not save rolling backup", e);
  }
}

function load() {
  if (state.loaded || typeof window === "undefined") return;
  const today = todayKey();
  let raw: unknown = [];
  try {
    const item = localStorage.getItem(STORAGE_KEYS.habits);
    if (item) {
      raw = JSON.parse(item);
    }
  } catch {
    try {
      const corrupt = localStorage.getItem(STORAGE_KEYS.habits);
      if (corrupt) {
        localStorage.setItem(STORAGE_KEYS.recoveryStash, corrupt);
      }
    } catch {
      /* ignore */
    }
    raw = [];
  }

  const rawArray = Array.isArray(raw) ? raw : [];
  const candidateHabits: Habit[] = [];
  const corruptObjects: unknown[] = [];

  for (const item of rawArray) {
    if (item && typeof item === "object") {
      candidateHabits.push(item as Habit);
    } else {
      corruptObjects.push(item);
    }
  }

  if (corruptObjects.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEYS.recoveryStash, JSON.stringify(corruptObjects));
    } catch {
      /* ignore */
    }
  }

  const { healed, issuesFound } = verifyAndHealIntegrity(candidateHabits, today);
  const settings = { ...DEFAULT_SETTINGS, ...readJson<Partial<HabitSettings>>(STORAGE_KEYS.settings, {}) };
  const habitIds = new Set(healed.map((habit) => habit.id));
  const rawCollections = readJson<HabitCollection[]>(STORAGE_KEYS.collections, []);
  const collections = (Array.isArray(rawCollections) ? rawCollections : [])
    .filter((collection) => collection && typeof collection.id === "string" && typeof collection.name === "string")
    .map((collection, index): HabitCollection => ({
      ...collection,
      name: collection.name.trim() || "Untitled Collection",
      icon: typeof collection.icon === "string" ? collection.icon : "folder",
      color: typeof collection.color === "string" ? collection.color : "fire",
      habitIds: Array.isArray(collection.habitIds) ? collection.habitIds.filter((id) => habitIds.has(id)) : [],
      orderIndex: typeof collection.orderIndex === "number" ? collection.orderIndex : index,
      startMode: collection.startMode === "guided" ? "guided" : "list",
      createdAt: collection.createdAt || new Date().toISOString(),
      updatedAt: collection.updatedAt || new Date().toISOString(),
    }));
  state = { loaded: true, habits: healed, collections, settings };

  if (issuesFound > 0 || corruptObjects.length > 0) {
    persist();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(state.habits));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
    localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(state.collections));
    saveRollingBackup(state.habits, state.settings, state.collections);
    syncWidgetData(state.habits, state.settings).catch((error) => {
      console.error("[daily-spark] could not sync widget data", error);
    });
    reconcileNativeReminders(state.habits, state.settings).catch((error) => {
      console.error("[daily-spark] could not reconcile reminders", error);
    });
  } catch (e) {
    console.error("[daily-spark] could not save", e);
  }
}

function set(next: Partial<HabitState>) {
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.habits || e.key === STORAGE_KEYS.settings || e.key === STORAGE_KEYS.collections) {
      state = { ...state, loaded: false };
      load();
      listeners.forEach((l) => l());
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useHabitStore(): HabitState {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

function mapHabit(id: string, fn: (h: Habit) => Habit) {
  set({ habits: state.habits.map((h) => (h.id === id ? fn(h) : h)) });
}

export const habitActions = {
  add(input: Pick<Habit, "name" | "emoji"> & Partial<Habit>): Habit {
    load();
    const h = createHabit(input, todayKey());
    set({ habits: [...state.habits, h] });
    return h;
  },
  update(id: string, patch: Partial<Habit>) {
    mapHabit(id, (h) => ({ ...h, ...patch, id: h.id }));
  },
  toggleToday(id: string): "done" | "undone" | null {
    const today = todayKey();
    const h = state.habits.find((x) => x.id === id);
    if (!h) return null;
    const done = h.completedDates.includes(today);
    mapHabit(id, (x) => (done ? undoToday(x, today) : completeToday(x, today)));
    return done ? "undone" : "done";
  },
  togglePastDay(id: string, targetDate: string) {
    const today = todayKey();
    mapHabit(id, (h) => togglePastDay(h, targetDate, today));
  },
  star(id: string) {
    mapHabit(id, (h) => ({ ...h, isStarred: !h.isStarred }));
  },
  archive(id: string, archived: boolean) {
    mapHabit(id, (h) => ({ ...h, archivedAt: archived ? new Date().toISOString() : null }));
  },
  remove(id: string) {
    set({
      habits: state.habits.filter((h) => h.id !== id),
      collections: state.collections.map((collection) => ({
        ...collection,
        habitIds: collection.habitIds.filter((habitId) => habitId !== id),
      })),
    });
  },
  reorder(orderedIdsOrSource: string[] | string, targetId?: string) {
    load();
    if (Array.isArray(orderedIdsOrSource)) {
      set({ habits: reorderHabitsByIds(state.habits, orderedIdsOrSource) });
    } else if (typeof orderedIdsOrSource === "string" && typeof targetId === "string") {
      set({ habits: reorderHabits(state.habits, orderedIdsOrSource, targetId) });
    }
  },
  bulkArchive(ids: string[], archive: boolean) {
    load();
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    set({
      habits: state.habits.map((h) =>
        idSet.has(h.id) ? { ...h, archivedAt: archive ? now : null } : h,
      ),
    });
  },
  bulkStar(ids: string[], star: boolean) {
    load();
    const idSet = new Set(ids);
    set({
      habits: state.habits.map((h) =>
        idSet.has(h.id) ? { ...h, isStarred: star } : h,
      ),
    });
  },
  bulkDelete(ids: string[]) {
    load();
    const idSet = new Set(ids);
    set({
      habits: state.habits.filter((h) => !idSet.has(h.id)),
      collections: state.collections.map((collection) => ({
        ...collection,
        habitIds: collection.habitIds.filter((habitId) => !idSet.has(habitId)),
      })),
    });
  },
  updateNotes(id: string, notes: string) {
    mapHabit(id, (h) => ({ ...h, notes: notes.slice(0, 1000) }));
  },
  pause(id: string, reason?: string) {
    const today = todayKey();
    mapHabit(id, (h) => pauseHabit(h, reason, today));
  },
  resume(id: string) {
    const today = todayKey();
    mapHabit(id, (h) => resumeHabit(h, today));
  },
  applyGrace(id: string, type: "weekly" | "monthly") {
    const today = todayKey();
    mapHabit(id, (h) => applyGrace(h, type, today));
  },
  snooze(id: string, until: number) {
    mapHabit(id, (h) => ({ ...h, snoozedUntil: until }));
  },
  clearSnooze(id: string) {
    mapHabit(id, (h) => ({ ...h, snoozedUntil: undefined }));
  },
  updateSettings(patch: Partial<HabitSettings>) {
    load();
    set({ settings: { ...state.settings, ...patch } });
    if (patch.enabled === true) {
      requestNotificationPermission()
        .then((granted) => {
          if (!granted) {
            console.warn("[daily-spark] notification permission was not granted");
            return;
          }
          return reconcileNativeReminders(state.habits, state.settings);
        })
        .catch((error) => {
          console.error("[daily-spark] could not enable reminders", error);
        });
    }
  },
  replaceAll(habits: Habit[], settings: HabitSettings, collections: HabitCollection[] = state.collections) {
    set({ loaded: true, habits, collections, settings });
  },
  clearAll() {
    set({ loaded: true, habits: [], collections: [], settings: DEFAULT_SETTINGS });
  },
  addCollection(input: Pick<HabitCollection, "name"> & Partial<HabitCollection>): HabitCollection {
    load();
    const now = new Date().toISOString();
    const collection: HabitCollection = {
      id: input.id || `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      icon: input.icon || "folder",
      color: input.color || "fire",
      habitIds: Array.from(new Set(input.habitIds || [])).filter((id) => state.habits.some((habit) => habit.id === id)),
      orderIndex: input.orderIndex ?? state.collections.length,
      isPinned: input.isPinned ?? false,
      startMode: input.startMode || "list",
      createdAt: input.createdAt || now,
      updatedAt: now,
    };
    set({ collections: [...state.collections, collection] });
    return collection;
  },
  updateCollection(id: string, patch: Partial<HabitCollection>) {
    load();
    set({
      collections: state.collections.map((collection) =>
        collection.id === id
          ? {
              ...collection,
              ...patch,
              id: collection.id,
              name: patch.name?.trim() || collection.name,
              habitIds: patch.habitIds
                ? Array.from(new Set(patch.habitIds)).filter((habitId) => state.habits.some((habit) => habit.id === habitId))
                : collection.habitIds,
              updatedAt: new Date().toISOString(),
            }
          : collection,
      ),
    });
  },
  removeCollection(id: string) {
    load();
    set({ collections: state.collections.filter((collection) => collection.id !== id) });
  },
  reload() {
    state = { ...SERVER_STATE };
    load();
    listeners.forEach((l) => l());
  },
  markBackedUp() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.lastBackup, new Date().toISOString());
    } catch {
      /* ignore */
    }
  },
  lastBackup(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.lastBackup);
    } catch {
      return null;
    }
  },
  getRollingBackups(): LocalBackupSnapshot[] {
    if (typeof window === "undefined") return [];
    return readJson<LocalBackupSnapshot[]>(STORAGE_KEYS.autoBackupHistory, []);
  },
  restoreRollingBackup(index: number) {
    const history = habitActions.getRollingBackups();
    const target = history[index];
    if (target) {
      habitActions.replaceAll(target.habits, target.settings, target.collections ?? []);
    }
  },
  // Phase 4 & 5 additions
  setQuant(id: string, dateKey: string, value: number) {
    const today = todayKey();
    mapHabit(id, (h) => setQuantValue(h, dateKey, value, today));
  },
  incrementQuant(id: string, dateKey: string, delta: number) {
    const today = todayKey();
    mapHabit(id, (h) => incrementQuantValue(h, dateKey, delta, today));
  },
  logRelapse(id: string, dateKey: string, cost?: number, reason?: string) {
    const today = todayKey();
    mapHabit(id, (h) => logHabitRelapse(h, dateKey, cost, reason, today));
  },
  undoRelapse(id: string, dateKey: string) {
    const today = todayKey();
    mapHabit(id, (h) => undoHabitRelapse(h, dateKey, today));
  },
  toggleSubtask(id: string, subtaskId: string, dateKey: string) {
    const today = todayKey();
    mapHabit(id, (h) => toggleHabitSubtask(h, subtaskId, dateKey, today));
  },
  addSubtask(id: string, title: string) {
    mapHabit(id, (h) => addSubtaskToHabit(h, title));
  },
  removeSubtask(id: string, subtaskId: string) {
    mapHabit(id, (h) => removeSubtaskFromHabit(h, subtaskId));
  },
  addVacation(id: string, start: string, end: string, reason?: string) {
    const today = todayKey();
    mapHabit(id, (h) => addHabitVacation(h, start, end, reason, today));
  },
  removeVacation(id: string, index: number) {
    const today = todayKey();
    mapHabit(id, (h) => removeHabitVacation(h, index, today));
  },
  addFocusMinutes(id: string, minutes: number) {
    mapHabit(id, (h) => ({
      ...h,
      totalFocusMinutes: (h.totalFocusMinutes || 0) + minutes,
    }));
  },
  mergeHabits(remoteHabits: Habit[]) {
    load();
    const merged = mergeVaultHabits(state.habits, remoteHabits);
    set({ habits: merged });
  },
  seedDemoIfEmpty() {
    load();
    if (state.habits.length > 0) return;
    if (typeof window !== "undefined" && localStorage.getItem("streakflame_cleared_by_user") === "1") {
      return;
    }
    const today = todayKey();
    const demoHabits = getInitialSeedHabits(today);
    const now = new Date().toISOString();
    const demoCollections: HabitCollection[] = [
      {
        id: "demo-morning-reset",
        name: "Morning reset",
        description: "Hydrate, focus, and start with intention.",
        icon: "folder",
        color: "ocean",
        habitIds: ["demo-water", "demo-read"],
        orderIndex: 0,
        isPinned: true,
        startMode: "guided",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "demo-evening-wind-down",
        name: "Evening wind-down",
        description: "A light routine to close the day.",
        icon: "folder",
        color: "violet",
        habitIds: ["demo-walk"],
        orderIndex: 1,
        isPinned: true,
        startMode: "list",
        createdAt: now,
        updatedAt: now,
      },
    ];
    set({ habits: demoHabits, collections: demoCollections });
  },
};

export function getInitialSeedHabits(today: string): Habit[] {
  const pastDates12 = Array.from({ length: 12 }, (_, i) => addDays(today, -i));
  const pastDates31 = Array.from({ length: 31 }, (_, i) => addDays(today, -i));
  const pastDates4 = Array.from({ length: 4 }, (_, i) => addDays(today, -(i + 1)));

  return [
    refresh({
      ...createHabit({
        id: "demo-read",
        name: "Read 20 minutes",
        emoji: "📚",
        icon: "read",
        color: "fire",
        category: "study",
        isStarred: true,
        notes: "Chapter 3: How to build good habits.",
        completedDates: pastDates12,
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-water",
        name: "Drink water",
        emoji: "💧",
        icon: "water",
        color: "ocean",
        category: "health",
        isStarred: true,
        kind: "quantitative",
        targetValue: 2000,
        unit: "ml",
        stepIncrement: 250,
        quantitativeValues: { [today]: 1250 },
        completedDates: pastDates31,
        notes: "Target 2.5L daily with a pinch of lemon.",
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-nosugar",
        name: "No Sugary Drinks",
        emoji: "🛡️",
        icon: "shield",
        color: "ember",
        category: "health",
        kind: "avoid",
        dailyCost: 5,
        startDate: addDays(today, -14),
        relapses: [],
        completedDates: Array.from({ length: 14 }, (_, i) => addDays(today, -i)),
        notes: "Clean streak! Saving $5 every day without soda.",
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-routine",
        name: "Morning Routine",
        emoji: "✨",
        icon: "sparkles",
        color: "gold",
        category: "daily",
        subtasks: [
          { id: "sub-1", title: "Make bed" },
          { id: "sub-2", title: "5 min stretch" },
          { id: "sub-3", title: "Glass of water" },
        ],
        subtaskCompletions: {
          [today]: ["sub-1", "sub-2"],
        },
        completedDates: [addDays(today, -1)],
        notes: "Small checklist to start the day with clarity.",
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-walk",
        name: "Evening walk",
        emoji: "🚶",
        icon: "run",
        color: "forest",
        category: "health",
        completedDates: pastDates4,
        notes: "Gentle 30-min walk after dinner.",
      }, today),
    }, today),
  ];
}
