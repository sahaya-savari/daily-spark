import type { Habit, HabitSettings, StandaloneNote } from "@/lib/habits/types";
import { DEFAULT_SETTINGS } from "@/lib/habits/types";
import { todayKey, addDays } from "@/lib/habits/dates";

export function createMockHabit(overrides: Partial<Habit> = {}): Habit {
  const today = overrides.createdAt || todayKey();
  return {
    id: overrides.id || `mock-${Math.random().toString(36).substring(2, 9)}`,
    name: overrides.name || "Daily Reading",
    emoji: overrides.emoji || "📚",
    icon: overrides.icon || "read",
    createdAt: today,
    currentStreak: overrides.currentStreak ?? 1,
    bestStreak: overrides.bestStreak ?? 1,
    lastCompletedDate: overrides.lastCompletedDate !== undefined ? overrides.lastCompletedDate : today,
    completedDates: overrides.completedDates || [today],
    color: overrides.color || "fire",
    category: overrides.category || "study",
    isStarred: overrides.isStarred ?? false,
    archivedAt: overrides.archivedAt ?? null,
    isPaused: overrides.isPaused ?? false,
    notes: overrides.notes ?? "",
    ...overrides,
  };
}

export function createMockQuantitativeHabit(overrides: Partial<Habit> = {}): Habit {
  const today = todayKey();
  return createMockHabit({
    id: "mock-quant",
    name: "Hydration",
    emoji: "💧",
    icon: "water",
    kind: "quantitative",
    targetValue: 2000,
    unit: "ml",
    stepIncrement: 250,
    quantitativeValues: { [today]: 1000 },
    ...overrides,
  });
}

export function createMockAvoidHabit(overrides: Partial<Habit> = {}): Habit {
  const today = todayKey();
  return createMockHabit({
    id: "mock-avoid",
    name: "No Sugary Drinks",
    emoji: "🛡️",
    icon: "shield",
    kind: "avoid",
    dailyCost: 5,
    relapses: [],
    ...overrides,
  });
}

export function createMockSubtaskHabit(overrides: Partial<Habit> = {}): Habit {
  const today = todayKey();
  return createMockHabit({
    id: "mock-subtasks",
    name: "Morning Protocol",
    emoji: "⚡",
    subtasks: [
      { id: "sub-1", title: "Glass of water" },
      { id: "sub-2", title: "5 min stretch" },
      { id: "sub-3", title: "Sunlight exposure" },
    ],
    subtaskCompletions: {
      [today]: ["sub-1"],
    },
    ...overrides,
  });
}

export function createMockTimerHabit(overrides: Partial<Habit> = {}): Habit {
  return createMockHabit({
    id: "mock-timer",
    name: "Deep Meditation",
    emoji: "🧘",
    icon: "meditate",
    totalFocusMinutes: 45,
    ...overrides,
  });
}

export function createMockNote(overrides: Partial<StandaloneNote> = {}): StandaloneNote {
  return {
    id: overrides.id || `note-${Math.random().toString(36).substring(2, 9)}`,
    title: overrides.title || "Reflections on Consistency",
    content: overrides.content || "Showing up every day builds compound identity.",
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    pinned: overrides.pinned ?? false,
    color: overrides.color || "fire",
    ...overrides,
  };
}

export function createMockBackupPayload(options: {
  habits?: Habit[];
  settings?: Partial<HabitSettings>;
  notes?: StandaloneNote[];
} = {}): string {
  const today = todayKey();
  const payload = {
    version: "1.0.1",
    exportedAt: new Date().toISOString(),
    today,
    habits: options.habits || [createMockHabit({ id: "vault-1", name: "Meditate" })],
    settings: { ...DEFAULT_SETTINGS, ...(options.settings || {}) },
    notes: options.notes || [createMockNote({ id: "vault-note-1", title: "Day 1 Notes" })],
  };
  return JSON.stringify(payload, null, 2);
}

export const CORRUPT_PAYLOADS = {
  malformedJson: `{"habits": [ { "id": "1", "name": "Broken"`,
  nullPayload: "null",
  numberPayload: "123456",
  emptyObject: "{}",
  invalidHabitRecord: JSON.stringify({
    habits: [{ nonStandard: 42, missingKeys: true }],
  }),
  prototypePollution: JSON.stringify({
    __proto__: { admin: true },
    habits: [{ id: "safe-1", name: "Safe" }],
  }),
  scriptInjection: JSON.stringify({
    habits: [
      {
        id: "xss-1",
        name: "<script>alert('xss')</script>",
        emoji: "🔥",
        completedDates: ["2026-10-29"],
      },
    ],
  }),
};

export function generateStreakDates(length: number, fromDate: string = todayKey()): string[] {
  return Array.from({ length }, (_, i) => addDays(fromDate, -i)).reverse();
}
