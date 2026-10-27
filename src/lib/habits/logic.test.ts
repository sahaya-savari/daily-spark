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
  buildStrictBackup,
  parseCsvHabits,
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

  it("builds and restores strict README backup schema conforming to rules", () => {
    const h1 = {
      ...createHabit({ name: "Morning Jog", emoji: "🏃" }, "2026-10-20"),
      completedDates: ["2026-10-24", "2026-10-25", "2026-10-26"],
      currentStreak: 3,
      bestStreak: 7,
      isStarred: true,
    };
    const h2 = {
      ...createHabit({ name: "Meditation", emoji: "🧘" }, "2026-10-20"),
      completedDates: [],
      currentStreak: 0,
      bestStreak: 5,
      archivedAt: "2026-10-25",
    };

    const strict = buildStrictBackup([h1, h2], { ...DEFAULT_SETTINGS, defaultTime: "21:00" }, new Date("2026-10-26T12:00:00Z"));
    expect(strict.version).toBe("1");
    expect(strict.exportDate).toBe("2026-10-26");
    expect(strict.data.streaks).toHaveLength(2);

    const s1 = strict.data.streaks[0]!;
    expect(s1.title).toBe("Morning Jog");
    expect(s1.emoji).toBe("🏃");
    expect(s1.currentStreak).toBe(3);
    expect(s1.history).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(s1.history.length).toBe(s1.currentStreak);
    expect(s1.lastCompletedDate).toBe("2026-10-26");
    expect(s1.starred).toBe(true);
    expect(s1.archived).toBe(false);

    const s2 = strict.data.streaks[1]!;
    expect(s2.currentStreak).toBe(0);
    expect(s2.history).toEqual([]);
    expect(s2.lastCompletedDate).toBeNull();
    expect(s2.archived).toBe(true);

    const restored = parseBackup(JSON.stringify(strict), TODAY);
    expect(restored.habits).toHaveLength(2);
    expect(restored.habits[0]!.name).toBe("Morning Jog");
    expect(restored.habits[0]!.currentStreak).toBe(3);
    expect(restored.habits[1]!.archivedAt).toBeTruthy();
  });
});

describe("CSV import logic", () => {
  it("imports name,emoji format from README", () => {
    const csv = `name,emoji\nMorning Jog,🏃\nRead 30 mins,📚\nDrink Water,💧\nMeditate,🧘`;
    const res = parseCsvHabits(csv, TODAY);
    expect(res.added).toBe(4);
    expect(res.skipped).toBe(0);
    expect(res.habits[0]!.name).toBe("Morning Jog");
    expect(res.habits[0]!.emoji).toBe("🏃");
    expect(res.habits[0]!.currentStreak).toBe(0);
    expect(res.habits[0]!.completedDates).toEqual([]);
  });

  it("imports title,start_date,current_count format", () => {
    const csv = `title,start_date,current_count\nDuolingo,2025-12-10,56\nGym,2026-01-01,36`;
    const res = parseCsvHabits(csv, TODAY);
    expect(res.added).toBe(2);
    expect(res.habits[0]!.name).toBe("Duolingo");
    expect(res.habits[0]!.createdAt).toBe("2025-12-10");
  });

  it("never overwrites existing habits", () => {
    const existing = [createHabit({ name: "Morning Jog", emoji: "🏃" }, "2026-01-01")];
    const csv = `name,emoji\nMorning Jog,🏃\nNew Habit,✨`;
    const res = parseCsvHabits(csv, TODAY, existing);
    expect(res.added).toBe(1);
    expect(res.skipped).toBe(1);
    expect(res.habits[0]!.name).toBe("New Habit");
  });

  it("handles empty or whitespace lines gracefully", () => {
    const csv = `name,emoji\n\n   \nWalk Dog,🐕\n`;
    const res = parseCsvHabits(csv, TODAY);
    expect(res.added).toBe(1);
    expect(res.habits[0]!.name).toBe("Walk Dog");
  });
});
