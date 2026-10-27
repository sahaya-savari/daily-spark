import { describe, expect, it } from "vitest";
import {
  completeToday,
  createHabit,
  currentStreak,
  dayRatio,
  parseBackup,
  BackupError,
  undoToday,
  buildBackup,
} from "./logic";
import { DEFAULT_SETTINGS } from "./types";

const TODAY = "2026-10-26";

describe("streak rules", () => {
  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-10-24", "2026-10-25", "2026-10-26"], TODAY)).toBe(3);
  });

  it("keeps the streak alive when only yesterday is done", () => {
    expect(currentStreak(["2026-10-24", "2026-10-25"], TODAY)).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(currentStreak(["2026-10-22", "2026-10-23"], TODAY)).toBe(0);
  });

  it("allows only one completion per day", () => {
    const h = createHabit({ name: "Read", emoji: "📚" }, TODAY);
    const once = completeToday(h, TODAY);
    const twice = completeToday(once, TODAY);
    expect(twice.completedDates).toEqual([TODAY]);
    expect(twice.currentStreak).toBe(1);
  });

  it("undo removes only today's completion", () => {
    const h = { ...createHabit({ name: "Walk", emoji: "🏃" }, "2026-10-20"), completedDates: ["2026-10-25"] };
    const done = completeToday(h, TODAY);
    expect(done.currentStreak).toBe(2);
    const undone = undoToday(done, TODAY);
    expect(undone.completedDates).toEqual(["2026-10-25"]);
    expect(undone.currentStreak).toBe(1);
    expect(undone.bestStreak).toBe(1);
  });
});

describe("calendar ratio", () => {
  it("counts done habits over habits that existed that day", () => {
    const a = { ...createHabit({ name: "A", emoji: "🔥" }, "2026-10-01"), completedDates: [TODAY] };
    const b = createHabit({ name: "B", emoji: "🔥" }, "2026-10-01");
    const later = createHabit({ name: "C", emoji: "🔥" }, "2026-10-27");
    expect(dayRatio([a, b, later], TODAY)).toEqual({ done: 1, total: 2 });
  });
});

describe("backup restore", () => {
  it("restores the old app's export format", () => {
    const file = JSON.stringify({
      version: "1",
      exportDate: "2026-02-01T10:00:00Z",
      data: {
        streaks: [{ id: "x1", name: "Water", emoji: "💧", createdAt: "2026-01-01", currentStreak: 2, bestStreak: 9, lastCompletedDate: "2026-10-26", completedDates: ["2026-10-25", "2026-10-26", "2026-10-26"] }],
        settings: { enabled: true, defaultTime: "07:30" },
      },
    });
    const r = parseBackup(file, TODAY);
    expect(r.habits).toHaveLength(1);
    expect(r.habits[0]!.completedDates).toEqual(["2026-10-25", "2026-10-26"]);
    expect(r.habits[0]!.currentStreak).toBe(2);
    expect(r.habits[0]!.bestStreak).toBe(9);
    expect(r.settings.defaultTime).toBe("07:30");
  });

  it("restores the README schema (title / history / archived / starred)", () => {
    const file = JSON.stringify({
      version: "1",
      data: { streaks: [{ id: "r1", title: "Journal", emoji: "📝", history: ["2026-10-26"], archived: true, starred: true }] },
    });
    const h = parseBackup(file, TODAY).habits[0]!;
    expect(h.name).toBe("Journal");
    expect(h.completedDates).toEqual(["2026-10-26"]);
    expect(h.isStarred).toBe(true);
    expect(h.archivedAt).toBeTruthy();
  });

  it("skips duplicate ids and nameless rows", () => {
    const r = parseBackup(JSON.stringify([{ id: "a", name: "A" }, { id: "a", name: "A again" }, { id: "b" }]), TODAY);
    expect(r.habits).toHaveLength(1);
    expect(r.skipped).toBe(2);
  });

  it("rejects files that aren't backups", () => {
    expect(() => parseBackup("not json", TODAY)).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ hello: 1 }), TODAY)).toThrow(BackupError);
  });

  it("round-trips its own export", () => {
    const h = completeToday(createHabit({ name: "Stretch", emoji: "🧘" }, TODAY), TODAY);
    const text = JSON.stringify(buildBackup([h], DEFAULT_SETTINGS));
    expect(parseBackup(text, TODAY).habits[0]).toMatchObject({ id: h.id, name: "Stretch", completedDates: [TODAY] });
  });
});
