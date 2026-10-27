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
});
