import { DEFAULT_SETTINGS } from "./types";
import { isHabitDueToday } from "./logic";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { habitActions, STORAGE_KEYS } from "./store";

describe("habit store", () => {
  beforeEach(() => {
    localStorage.clear();
    habitActions.clearAll();
  });

  it("adds and persists a habit in localStorage", () => {
    const h = habitActions.add({ name: "Drink Water", emoji: "💧" });
    expect(h.name).toBe("Drink Water");
    expect(h.emoji).toBe("💧");

    const raw = localStorage.getItem(STORAGE_KEYS.habits);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Drink Water");
  });

  it("toggles habit completion today", () => {
    const h = habitActions.add({ name: "Read", emoji: "📚" });
    const res1 = habitActions.toggleToday(h.id);
    expect(res1).toBe("done");

    const res2 = habitActions.toggleToday(h.id);
    expect(res2).toBe("undone");
  });

  it("records and undoes a check-in on the configured logical day", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date(2026, 10, 24, 1, 30));
      habitActions.updateSettings({ rolloverHour: 3 });
      const habit = habitActions.add({ name: "Read", emoji: "R" });
      expect(habitActions.toggleToday(habit.id)).toBe("done");
      const readHabit = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[0];
      expect(readHabit().completedDates).toEqual(["2026-11-23"]);
      expect(habitActions.toggleToday(habit.id)).toBe("undone");
      expect(readHabit().completedDates).toEqual([]);
      vi.setSystemTime(new Date(2026, 10, 24, 3));
      expect(habitActions.toggleToday(habit.id)).toBe("done");
      expect(readHabit().completedDates).toEqual(["2026-11-24"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("saves a history note with completion and undoes both together", () => {
    const habit = habitActions.add({ name: "Read", emoji: "R", createdAt: "2026-10-20" });
    const readHabits = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    const editedDay = "2026-10-25";
    const undo = habitActions.editHistoryDay(habit.id, editedDay, {
      completed: true, amount: 0, note: "Read a chapter",
    });
    expect(readHabits()[0]).toMatchObject({
      completedDates: [editedDay], dayNotes: { [editedDay]: "Read a chapter" },
    });
    expect(undo?.()).toBe(true);
    expect(readHabits()[0].completedDates).toEqual([]);
    expect(readHabits()[0].dayNotes).toBeUndefined();
    expect(habitActions.editHistoryDay(habit.id, "9999-01-01", {
      completed: true, amount: 0, note: "",
    })).toBeNull();
  });

  it("preserves earlier weekday schedules across edits on the same day", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date(2026, 10, 24, 12));
      const habit = habitActions.add({
        name: "Training", emoji: "T", createdAt: "2026-11-20",
        frequencyType: "specific_days", customDays: [1],
      });
      habitActions.updateSchedule(habit.id, { frequencyType: "daily" });
      habitActions.updateSchedule(habit.id, { frequencyType: "specific_days", customDays: [2] });
      const [saved] = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
      expect(isHabitDueToday(saved, "2026-11-22")).toBe(false);
      expect(isHabitDueToday(saved, "2026-11-23")).toBe(true);
      expect(isHabitDueToday(saved, "2026-11-24")).toBe(true);
      expect(isHabitDueToday(saved, "2026-11-30")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("records focus once and never toggles an existing check-in off", () => {
    const habit = habitActions.add({ name: "Read", emoji: "R" });
    habitActions.toggleToday(habit.id);
    const end = Date.now();
    expect(habitActions.recordFocusSession("session", 25, end, habit.id, true)).toBe(true);
    expect(habitActions.recordFocusSession("session", 25, end, habit.id, true)).toBe(false);
    const [saved] = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(saved.totalFocusMinutes).toBe(25);
    expect(saved.completedDates).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)!).focusSessions).toHaveLength(1);
  });

  it("keeps local records on merge and makes a recovery snapshot before replacement", () => {
    const habit = habitActions.add({ name: "Keep", emoji: "K" });
    const backup = { habits: [{ ...habit, name: "Incoming version" }], settings: DEFAULT_SETTINGS };
    habitActions.restoreBackup(backup, "merge");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[0].name).toBe("Keep");
    habitActions.restoreBackup({ ...backup, habits: [] }, "replace");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)).toEqual([]);
    habitActions.restoreRollingBackup(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[0].name).toBe("Keep");
  });

  it("rolls back completed storage writes if a restore write fails", () => {
    const original = habitActions.add({ name: "Keep", emoji: "K" });
    const write = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === STORAGE_KEYS.settings) throw new Error("Storage rejected the write");
      write.call(this, key, value);
    });
    try {
      expect(() => habitActions.restoreBackup({ habits: [], settings: DEFAULT_SETTINGS }, "replace")).toThrow();
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[0].id).toBe(original.id);
    } finally {
      spy.mockRestore();
    }
  });

  it("stars and archives a habit", () => {
    const h = habitActions.add({ name: "Meditate", emoji: "🧘" });
    habitActions.star(h.id);
    habitActions.archive(h.id, true);

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(raw[0].isStarred).toBe(true);
    expect(raw[0].archivedAt).toBeTruthy();

    habitActions.archive(h.id, false);
    const raw2 = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(raw2[0].archivedAt).toBeNull();
  });

  it("tracks last backup timestamp in localStorage", () => {
    expect(habitActions.lastBackup()).toBeNull();
    habitActions.markBackedUp();
    expect(habitActions.lastBackup()).toBeTruthy();
  });

  it("toggles past day completion and updates notes", () => {
    const h = habitActions.add({ name: "Stretch", emoji: "🤸" });
    habitActions.togglePastDay(h.id, "2026-10-25");
    habitActions.updateNotes(h.id, "Focused on hamstring flexibility.");

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(raw[0].completedDates).toContain("2026-10-25");
    expect(raw[0].notes).toBe("Focused on hamstring flexibility.");
  });

  it("reorders habits properly", () => {
    const h1 = habitActions.add({ name: "Habit 1", emoji: "1️⃣" });
    const h2 = habitActions.add({ name: "Habit 2", emoji: "2️⃣" });
    const h3 = habitActions.add({ name: "Habit 3", emoji: "3️⃣" });

    habitActions.reorder([h3.id, h1.id, h2.id]);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored.map((h: { id: string }) => h.id)).toEqual([h3.id, h1.id, h2.id]);
    expect(stored.map((h: { orderIndex: number }) => h.orderIndex)).toEqual([0, 1, 2]);
  });

  it("performs bulk operations: bulkStar, bulkArchive, bulkDelete", () => {
    const h1 = habitActions.add({ name: "Habit 1", emoji: "1️⃣" });
    const h2 = habitActions.add({ name: "Habit 2", emoji: "2️⃣" });
    const h3 = habitActions.add({ name: "Habit 3", emoji: "3️⃣" });

    habitActions.bulkStar([h1.id, h2.id], true);
    let stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored.find((h: { id: string }) => h.id === h1.id).isStarred).toBe(true);
    expect(stored.find((h: { id: string }) => h.id === h2.id).isStarred).toBe(true);
    expect(stored.find((h: { id: string }) => h.id === h3.id).isStarred).toBe(false);

    habitActions.bulkArchive([h1.id], true);
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored.find((h: { id: string }) => h.id === h1.id).archivedAt).toBeTruthy();

    habitActions.bulkDelete([h1.id, h3.id]);
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(h2.id);
  });

  it("persists a five-habit lifecycle including edit, completion, undo, archive, and deletion", () => {
    const habits = [
      habitActions.add({ name: "Read 20 minutes", emoji: "📚" }),
      habitActions.add({ name: "Drink water", emoji: "💧" }),
      habitActions.add({ name: "Evening walk", emoji: "🚶" }),
      habitActions.add({ name: "Meditation", emoji: "🧘" }),
      habitActions.add({ name: "Exercise", emoji: "🏋️" }),
    ];

    habitActions.update(habits[0].id, { name: "Read 30 minutes" });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[0].name).toBe("Read 30 minutes");

    expect(habitActions.toggleToday(habits[1].id)).toBe("done");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[1].completedDates.length).toBe(1);
    expect(habitActions.toggleToday(habits[1].id)).toBe("undone");

    habitActions.archive(habits[2].id, true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)[2].archivedAt).toBeTruthy();

    habitActions.remove(habits[4].id);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored).toHaveLength(4);
    expect(stored.map((habit: { name: string }) => habit.name)).toContain("Read 30 minutes");
  });

  it("stores and restores automatic rolling backups", () => {
    habitActions.add({ name: "Habit A", emoji: "🅰️" });
    const rolling = habitActions.getRollingBackups();
    expect(rolling.length).toBeGreaterThan(0);
    expect(rolling[0]?.habits[0]?.name).toBe("Habit A");

    habitActions.clearAll();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!)).toEqual([]);

    habitActions.restoreRollingBackup(0);
    const restored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(restored).toHaveLength(1);
    expect(restored[0].name).toBe("Habit A");
  });

  it("respects autoBackupHistoryEnabled setting", () => {
    habitActions.updateSettings({ autoBackupHistoryEnabled: false });
    localStorage.removeItem(STORAGE_KEYS.autoBackupHistory);

    habitActions.add({ name: "Habit Without Backup", emoji: "🚫" });
    const rolling = habitActions.getRollingBackups();
    expect(rolling).toHaveLength(0);
  });

  it("stashes corrupt items and heals habits with missing IDs from storage", () => {
    // Write corrupt array with 1 unparseable item and 1 habit missing id
    const corruptPayload = [
      "completely unparseable string entry",
      { name: "Rescued Habit", emoji: "🛟" }, // missing ID
    ];
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(corruptPayload));

    // Force re-load
    habitActions.reload();

    const stash = localStorage.getItem(STORAGE_KEYS.recoveryStash);
    expect(stash).toBeTruthy();
    expect(stash).toContain("completely unparseable string entry");

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Rescued Habit");
    expect(stored[0].id).toBeTruthy(); // ID was healed
  });

  it("handles pause, resume, and applyGrace actions", () => {
    const h = habitActions.add({ name: "Morning Routine", emoji: "🌅" });
    habitActions.pause(h.id, "Taking a break");
    let stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored[0].isPaused).toBe(true);
    expect(stored[0].pauseReason).toBe("Taking a break");

    habitActions.resume(h.id);
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored[0].isPaused).toBe(false);
    expect(stored[0].pauseReason).toBeUndefined();

    habitActions.applyGrace(h.id, "weekly");
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored[0].graceUsedThisWeek).toBe(true);

    const snoozeUntil = Date.now() + 3600000;
    habitActions.snooze(h.id, snoozeUntil);
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored[0].snoozedUntil).toBe(snoozeUntil);

    habitActions.clearSnooze(h.id);
    stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)!);
    expect(stored[0].snoozedUntil).toBeUndefined();
  });
});
