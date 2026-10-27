import { useSyncExternalStore } from "react";
import { todayKey } from "./dates";
import {
  completeToday,
  createHabit,
  refresh,
  undoToday,
} from "./logic";
import { DEFAULT_SETTINGS, type Habit, type HabitSettings } from "./types";

/**
 * Local-only habit store. Data lives in this browser's localStorage under the
 * same keys the original Daily Spark used, so nothing leaves the device.
 */
export const STORAGE_KEYS = {
  habits: "streakflame_streaks",
  settings: "streakflame_settings",
  lastBackup: "streakflame_last_backup",
} as const;

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
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function load() {
  if (state.loaded || typeof window === "undefined") return;
  const today = todayKey();
  const raw = readJson<unknown>(STORAGE_KEYS.habits, []);
  const habits = (Array.isArray(raw) ? raw : [])
    .filter((h): h is Habit => !!h && typeof h === "object" && typeof (h as Habit).id === "string")
    .map((h) => refresh({ ...h, completedDates: h.completedDates ?? [] }, today));
  const settings = { ...DEFAULT_SETTINGS, ...readJson<Partial<HabitSettings>>(STORAGE_KEYS.settings, {}) };
  state = { loaded: true, habits, settings };
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(state.habits));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
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
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
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
  add(input: Pick<Habit, "name" | "emoji"> & Partial<Habit>) {
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
  star(id: string) {
    mapHabit(id, (h) => ({ ...h, isStarred: !h.isStarred }));
  },
  archive(id: string, archived: boolean) {
    mapHabit(id, (h) => ({ ...h, archivedAt: archived ? new Date().toISOString() : null }));
  },
  remove(id: string) {
    set({ habits: state.habits.filter((h) => h.id !== id) });
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
  markBackedUp() {
    try {
      localStorage.setItem(STORAGE_KEYS.lastBackup, new Date().toISOString());
    } catch {
      /* ignore */
    }
  },
  lastBackup(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastBackup);
    } catch {
      return null;
    }
  },
};
