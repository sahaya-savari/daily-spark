import { describe, expect, it, beforeEach } from "vitest";
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

