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
import { DEFAULT_SETTINGS, type Habit, type HabitSettings } from "./types";

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
} as const;

export interface LocalBackupSnapshot {
  date: string;
  timestamp: string;
  habits: Habit[];
  settings: HabitSettings;
}

export interface HabitState {
  loaded: boolean;
  habits: Habit[];
  settings: HabitSettings;
}

const SERVER_STATE: HabitState = { loaded: false, habits: [], settings: DEFAULT_SETTINGS };
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

function saveRollingBackup(habits: Habit[], settings: HabitSettings) {
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
  state = { loaded: true, habits: healed, settings };

  if (issuesFound > 0 || corruptObjects.length > 0) {
    persist();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(state.habits));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
    saveRollingBackup(state.habits, state.settings);
    syncWidgetData(state.habits, state.settings).catch(() => {});
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
    if (e.key === STORAGE_KEYS.habits || e.key === STORAGE_KEYS.settings) {
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
  checkInToday(id: string): "done" | "already-done" | null {
    const today = todayKey();
    const h = state.habits.find((x) => x.id === id);
    if (!h) return null;
    if (h.completedDates.includes(today)) return "already-done";
    mapHabit(id, (x) => completeToday(x, today));
    return "done";
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
    set({ habits: state.habits.filter((h) => h.id !== id) });
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
    set({ habits: state.habits.filter((h) => !idSet.has(h.id)) });
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
  },
  replaceAll(habits: Habit[], settings: HabitSettings) {
    set({ loaded: true, habits, settings });
  },
  clearAll() {
    set({ loaded: true, habits: [], settings: DEFAULT_SETTINGS });
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
      habitActions.replaceAll(target.habits, target.settings);
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
    const isLegacyDemoSet =
      state.habits.length > 0 &&
      state.habits.every((habit) => habit.id.startsWith("demo-")) &&
      !state.habits.some((habit) => habit.id === "demo-duolingo");
    if (state.habits.length > 0 && !isLegacyDemoSet) return;
    if (typeof window !== "undefined" && localStorage.getItem("streakflame_cleared_by_user") === "1") {
      return;
    }
    const today = todayKey();
    const demoHabits = getInitialSeedHabits(today);
    set({ habits: demoHabits });
  },
};

export function getInitialSeedHabits(today: string): Habit[] {
  const previousFourDays = Array.from({ length: 4 }, (_, i) => addDays(today, -(i + 1)));
  const previousTwoDays = Array.from({ length: 2 }, (_, i) => addDays(today, -(i + 1)));

  return [
    refresh({
      ...createHabit({
        id: "demo-duolingo",
        name: "Duolingo lesson",
        emoji: "🦉",
        description: "Complete one lesson",
        icon: "sparkles",
        color: "fire",
        category: "learning",
        isStarred: true,
        reminderEnabled: true,
        reminderTime: "19:00",
        completedDates: previousFourDays,
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-read",
        name: "Read 10 pages",
        emoji: "📖",
        description: "A little progress every day",
        icon: "read",
        color: "gold",
        category: "learning",
        completedDates: previousTwoDays,
      }, today),
    }, today),
    refresh({
      ...createHabit({
        id: "demo-journal",
        name: "Write one sentence",
        emoji: "✍️",
        description: "Keep the chain alive",
        icon: "edit",
        color: "ocean",
        category: "daily",
        completedDates: [],
      }, today),
    }, today),
  ];
}

