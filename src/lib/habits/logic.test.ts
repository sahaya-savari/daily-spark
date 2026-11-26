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
  habitsToCsv,
  habitsToTsv,
  parseTsvHabits,
  parseMarkdownHabits,
  togglePastDay,
  verifyAndHealIntegrity,
  reorderHabits,
  reorderHabitsByIds,
  inspectBackup,
  isHabitDueToday,
  getMilestones,
  pauseHabit,
  resumeHabit,
  applyGrace,
  exportToMarkdown,
  isDoneOn,
} from "./logic";
import { DEFAULT_SETTINGS, type Habit, type HabitCollection, type StandaloneNote } from "./types";

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

  it("excludes paused and unscheduled habits from the daily opportunity count", () => {
    const monday = "2026-10-26";
    const due = createHabit({ name: "Monday", emoji: "M", frequencyType: "specific_days", customDays: [1] }, "2026-10-01");
    const tuesdayOnly = createHabit({ name: "Tuesday", emoji: "T", frequencyType: "specific_days", customDays: [2] }, "2026-10-01");
    const paused = { ...createHabit({ name: "Paused", emoji: "P" }, "2026-10-01"), isPaused: true };

    expect(dayRatio([due, tuesdayOnly, paused], monday)).toEqual({ done: 0, total: 1 });
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

describe("Phase 2: Safe Past-Day Fill-In (togglePastDay)", () => {
  it("toggles past day on and recalculates currentStreak and bestStreak", () => {
    const h = {
      ...createHabit({ name: "Workout", emoji: "💪" }, "2026-10-20"),
      completedDates: ["2026-10-24", "2026-10-26"],
      currentStreak: 1,
      bestStreak: 1,
    };
    // Toggling 2026-10-25 fills the gap, making 24, 25, 26 continuous -> streak 3
    const updated = togglePastDay(h, "2026-10-25", TODAY);
    expect(updated.completedDates).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(updated.currentStreak).toBe(3);
    expect(updated.bestStreak).toBe(3);
    expect(updated.lastCompletedDate).toBe("2026-10-26");
  });

  it("toggles past day off and recalculates currentStreak and bestStreak correctly", () => {
    const h = {
      ...createHabit({ name: "Workout", emoji: "💪" }, "2026-10-20"),
      completedDates: ["2026-10-24", "2026-10-25", "2026-10-26"],
      currentStreak: 3,
      bestStreak: 3,
    };
    // Toggling off 2026-10-25 breaks streak, leaving only today (26) active -> streak 1
    const updated = togglePastDay(h, "2026-10-25", TODAY);
    expect(updated.completedDates).toEqual(["2026-10-24", "2026-10-26"]);
    expect(updated.currentStreak).toBe(1);
    expect(updated.bestStreak).toBe(1);
  });

  it("ignores invalid date strings gracefully", () => {
    const h = createHabit({ name: "Workout", emoji: "💪" }, TODAY);
    const updated = togglePastDay(h, "invalid-date", TODAY);
    expect(updated).toBe(h);
  });

  it("rejects future dates to maintain streak integrity", () => {
    const h = createHabit({ name: "Workout", emoji: "💪" }, TODAY);
    const updated = togglePastDay(h, "2099-01-01", TODAY);
    expect(updated).toBe(h);
    expect(updated.completedDates).toEqual([]);
  });
});

describe("Phase 2: Habit Creation Defaults", () => {
  it("initializes new habit with safe Phase 2 defaults", () => {
    const h = createHabit({ name: "Meditate", emoji: "🧘" }, TODAY);
    expect(h.notes).toBe("");
    expect(h.isPaused).toBe(false);
    expect(h.pausedAt).toBeNull();
    expect(h.category).toBeUndefined();
  });
});

describe("Phase 2: Startup Data Integrity Check & Auto-Healing", () => {
  it("heals duplicate IDs, drifted streak counters, and unsorted/duplicate dates", () => {
    const corruptHabits: Habit[] = [
      {
        id: "duplicate-id",
        name: "Morning Run",
        emoji: "🏃",
        createdAt: "2026-10-20",
        currentStreak: 99, // drifted
        bestStreak: 2,
        lastCompletedDate: null,
        completedDates: ["2026-10-26", "2026-10-24", "2026-10-25", "2026-10-25"], // unsorted & duplicate
      },
      {
        id: "duplicate-id", // duplicate ID
        name: "Reading",
        emoji: "📚",
        createdAt: "2026-10-20",
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
      },
      {
        id: "", // empty ID
        name: "", // empty name
        emoji: "🧘",
        createdAt: "2026-10-20",
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
      },
    ];

    const result = verifyAndHealIntegrity(corruptHabits, TODAY);
    expect(result.issuesFound).toBeGreaterThan(0);
    expect(result.healed).toHaveLength(3);

    const h0 = result.healed[0]!;
    expect(h0.id).toBe("duplicate-id");
    expect(h0.completedDates).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(h0.currentStreak).toBe(3); // corrected from 99
    expect(h0.bestStreak).toBe(3);
    expect(h0.lastCompletedDate).toBe("2026-10-26");
    expect(h0.notes).toBe("");
    expect(h0.orderIndex).toBe(0);

    const h1 = result.healed[1]!;
    expect(h1.id).not.toBe("duplicate-id");
    expect(h1.id).toContain("duplicate-id-dup");

    const h2 = result.healed[2]!;
    expect(h2.id).toBeTruthy();
    expect(h2.name).toBe("Untitled Habit");
  });

  it("truncates notes exceeding 1,000 characters and flags issue", () => {
    const longNotes = "a".repeat(1200);
    const habit = {
      ...createHabit({ name: "Journal", emoji: "📝" }, TODAY),
      notes: longNotes,
    };
    const res = verifyAndHealIntegrity([habit], TODAY);
    expect(res.issuesFound).toBe(1);
    expect(res.healed[0]?.notes?.length).toBe(1000);
  });
});

describe("Phase 2: Safe Deserialization Invariants", () => {
  it("defaults missing Phase 2 fields to notes: '', category: undefined, isPaused: false", () => {
    const rawLegacyJson = JSON.stringify({
      version: "1",
      data: {
        streaks: [
          {
            id: "legacy-1",
            title: "Old Habit",
            emoji: "⭐",
            history: [TODAY],
            archived: false,
            starred: true,
          },
        ],
      },
    });

    const parsed = parseBackup(rawLegacyJson, TODAY);
    const habit = parsed.habits[0]!;
    expect(habit.notes).toBe("");
    expect(habit.category).toBeUndefined();
    expect(habit.isPaused).toBe(false);
    expect(habit.pausedAt).toBeNull();
  });
});

describe("Phase 2: Custom Streak Reordering", () => {
  it("reorders habits moving source to target and updates orderIndex", () => {
    const habits: Habit[] = [
      { ...createHabit({ name: "A", emoji: "1️⃣" }, TODAY), id: "a", orderIndex: 0 },
      { ...createHabit({ name: "B", emoji: "2️⃣" }, TODAY), id: "b", orderIndex: 1 },
      { ...createHabit({ name: "C", emoji: "3️⃣" }, TODAY), id: "c", orderIndex: 2 },
    ];

    // Move 'c' to index of 'a'
    const reordered = reorderHabits(habits, "c", "a");
    expect(reordered.map((h) => h.id)).toEqual(["c", "a", "b"]);
    expect(reordered.map((h) => h.orderIndex)).toEqual([0, 1, 2]);
  });

  it("reorders habits by given list of IDs", () => {
    const habits: Habit[] = [
      { ...createHabit({ name: "A", emoji: "1️⃣" }, TODAY), id: "a" },
      { ...createHabit({ name: "B", emoji: "2️⃣" }, TODAY), id: "b" },
      { ...createHabit({ name: "C", emoji: "3️⃣" }, TODAY), id: "c" },
    ];

    const reordered = reorderHabitsByIds(habits, ["b", "c", "a"]);
    expect(reordered.map((h) => h.id)).toEqual(["b", "c", "a"]);
    expect(reordered.map((h) => h.orderIndex)).toEqual([0, 1, 2]);
  });
});

describe("Phase 2: Backup Preview & Notes Roundtrip", () => {
  it("round-trips habit collections without changing their membership or launch mode", () => {
    const habits = [
      { ...createHabit({ name: "Read", emoji: "book" }, TODAY), id: "read" },
      { ...createHabit({ name: "Water", emoji: "water" }, TODAY), id: "water" },
    ];
    const collections: HabitCollection[] = [{
      id: "morning",
      name: "Morning reset",
      description: "Start with intention",
      icon: "folder",
      color: "ocean",
      habitIds: ["water", "read"],
      orderIndex: 0,
      isPinned: true,
      startMode: "guided",
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-02T08:00:00Z",
    }];

    const backup = buildBackup(habits, DEFAULT_SETTINGS, new Date("2026-10-26T12:00:00Z"), [], collections);
    const restored = parseBackup(JSON.stringify(backup), TODAY);

    expect(restored.collections).toEqual(collections);
  });

  it("inspects backup correctly returning stats and notes", () => {
    const habits: Habit[] = [
      { ...createHabit({ name: "Active Habit", emoji: "🔥" }, TODAY), id: "h1", completedDates: [TODAY] },
      { ...createHabit({ name: "Archived Habit", emoji: "📦" }, TODAY), id: "h2", archivedAt: TODAY },
    ];
    const notes: StandaloneNote[] = [
      {
        id: "n1",
        title: "Reflection",
        content: "Good progress today",
        createdAt: "2026-10-26T10:00:00Z",
        updatedAt: "2026-10-26T10:00:00Z",
        pinned: true,
      },
    ];

    const backupFile = buildBackup(habits, DEFAULT_SETTINGS, new Date("2026-10-26T12:00:00Z"), notes);
    const backupJson = JSON.stringify(backupFile);

    const inspection = inspectBackup(backupJson, TODAY);
    expect(inspection.preview.totalStreaks).toBe(2);
    expect(inspection.preview.activeCount).toBe(1);
    expect(inspection.preview.archivedCount).toBe(1);
    expect(inspection.preview.totalCompletions).toBe(1);
    expect(inspection.preview.notesCount).toBe(1);
    expect(inspection.notes[0]?.title).toBe("Reflection");
    expect(inspection.notes[0]?.pinned).toBe(true);
  });
});

describe("Phase 3: Flexible Frequencies, Milestones & Data Freedom", () => {
  it("evaluates daily habits as always due today when not paused", () => {
    const h = createHabit({ name: "Daily Habit", emoji: "⚡" }, TODAY);
    expect(isHabitDueToday(h, TODAY)).toBe(true);
  });

  it("evaluates specific_days frequency correctly", () => {
    // 2026-10-26 is a Monday (UTC day 1)
    const mondayHabit = {
      ...createHabit({ name: "Gym", emoji: "🏋️" }, TODAY),
      frequencyType: "specific_days" as const,
      customDays: [1, 3, 5], // Mon, Wed, Fri
    };
    expect(isHabitDueToday(mondayHabit, "2026-10-26")).toBe(true); // Monday

    // 2026-10-27 is Tuesday (UTC day 2)
    expect(isHabitDueToday(mondayHabit, "2026-10-27")).toBe(false); // Tuesday
  });

  it("evaluates weekly_target frequency correctly", () => {
    // Target: 2 days per week
    const targetHabit = {
      ...createHabit({ name: "Read Book", emoji: "📚" }, TODAY),
      frequencyType: "weekly_target" as const,
      targetDaysPerWeek: 2,
      completedDates: ["2026-10-26"], // 1 completion in week of Mon 26 Oct
    };
    // 1 < 2, so it is still due later in the week
    expect(isHabitDueToday(targetHabit, "2026-10-27")).toBe(true);

    // If 2 completions exist in the week
    const satisfied = {
      ...targetHabit,
      completedDates: ["2026-10-26", "2026-10-27"],
    };
    // Already met 2/2, so not strictly due on Wednesday unless user checks in
    expect(isHabitDueToday(satisfied, "2026-10-28")).toBe(false);
  });

  it("never marks paused habits as due", () => {
    const h = {
      ...createHabit({ name: "Jogging", emoji: "🏃" }, TODAY),
      isPaused: true,
      pauseReason: "Resting knee",
    };
    expect(isHabitDueToday(h, TODAY)).toBe(false);
  });

  it("calculates calm milestones properly", () => {
    expect(getMilestones(2).reached).toEqual([]);
    expect(getMilestones(2).nextMilestone?.days).toBe(3);

    const m3 = getMilestones(3);
    expect(m3.reached.length).toBe(1);
    expect(m3.reached[0]?.title).toBe("Spark Ignition");
    expect(m3.nextMilestone?.days).toBe(7);

    const m7 = getMilestones(7);
    expect(m7.reached.length).toBe(2);
    expect(m7.reached[1]?.title).toBe("First Spark");
    expect(m7.nextMilestone?.days).toBe(21);

    const m100 = getMilestones(100);
    expect(m100.reached.length).toBe(5); // 3, 7, 21, 50, 100
    expect(m100.nextMilestone?.days).toBe(365);
  });

  it("pauses and resumes habits cleanly preserving streak", () => {
    const h = {
      ...createHabit({ name: "Guitar", emoji: "🎸" }, TODAY),
      currentStreak: 15,
      bestStreak: 15,
    };
    const paused = pauseHabit(h, "Traveling abroad", TODAY);
    expect(paused.isPaused).toBe(true);
    expect(paused.pausedAt).toBe(TODAY);
    expect(paused.pauseReason).toBe("Traveling abroad");
    expect(paused.currentStreak).toBe(15);

    const resumed = resumeHabit(paused, TODAY);
    expect(resumed.isPaused).toBe(false);
    expect(resumed.pausedAt).toBeNull();
    expect(resumed.pauseReason).toBeUndefined();
  });

  it("applies weekly grace to forgive a missed yesterday", () => {
    const h = createHabit({ name: "Drink Water", emoji: "💧" }, TODAY);
    const withGrace = applyGrace(h, "weekly", TODAY);
    expect(withGrace.completedDates).toContain("2026-10-25"); // yesterday
    expect(withGrace.graceUsedThisWeek).toBe(true);
  });

  it("exports habits and notes to clean Markdown format", () => {
    const h = {
      ...createHabit({ name: "Morning Meditation", emoji: "🧘" }, "2026-10-01"),
      currentStreak: 25,
      bestStreak: 25,
      category: "mindfulness",
      notes: "Focus on breath",
    };
    const note: StandaloneNote = {
      id: "note-1",
      title: "Mindfulness Log",
      content: "Feeling calmer this week.",
      createdAt: TODAY,
      updatedAt: TODAY,
      pinned: true,
    };
    const md = exportToMarkdown([h], [note]);
    expect(md).toContain("# 🌱 Daily Spark - Habit & Journal Export");
    expect(md).toContain("### 🧘 Morning Meditation");
    expect(md).toContain("Focus on breath");
    expect(md).toContain("### 📌 Mindfulness Log");
    expect(md).toContain("Feeling calmer this week.");
  });

  it("evaluates isDoneOn accurately for avoid habits", () => {
    const avoidHabit: Habit = {
      ...createHabit({ name: "Quit Smoking", emoji: "🚭" }, "2026-10-01"),
      kind: "avoid",
      relapses: [{ date: "2026-10-15" }],
    };

    expect(isDoneOn(avoidHabit, "2026-10-14")).toBe(true); // Clean day
    expect(isDoneOn(avoidHabit, "2026-10-15")).toBe(false); // Relapse day
    expect(isDoneOn(avoidHabit, "2026-09-20")).toBe(false); // Before creation
    expect(isDoneOn(avoidHabit, "2099-01-01")).toBe(false); // Future date
  });

  it("preserves avoid streaks and vacation ranges during verifyAndHealIntegrity", () => {
    const avoidHabit: Habit = {
      ...createHabit({ name: "No Sugar", emoji: "🍬" }, "2026-10-01"),
      kind: "avoid",
      relapses: [],
      currentStreak: 26,
      bestStreak: 26,
    };

    const vacationHabit: Habit = {
      ...createHabit({ name: "Running", emoji: "🏃" }, "2026-10-20"),
      completedDates: ["2026-10-20", "2026-10-21", "2026-10-24", "2026-10-25", TODAY],
      vacationRanges: [{ start: "2026-10-22", end: "2026-10-23" }],
      currentStreak: 5,
      bestStreak: 5,
    };

    const result = verifyAndHealIntegrity([avoidHabit, vacationHabit], TODAY);
    expect(result.healed[0].currentStreak).toBe(26);
    expect(result.healed[1].currentStreak).toBe(5);
  });

  it("records completion timestamp into completionTimes on check-in", () => {
    const h = createHabit({ name: "Read", emoji: "📚" }, TODAY);
    const completed = completeToday(h, TODAY, "2026-10-26T08:30:00.000Z");
    expect(completed.completionTimes?.[TODAY]).toBe("2026-10-26T08:30:00.000Z");
  });

  describe("5-Format Reliable Backup & Restore (Habits + Notes)", () => {
    const sampleHabit: Habit = {
      ...createHabit({ name: "Daily Meditation", emoji: "🧘" }, "2026-10-01"),
      currentStreak: 3,
      bestStreak: 15,
      completedDates: ["2026-10-24", "2026-10-25", "2026-10-26"],
      notes: "Quiet breath observation",
    };

    const sampleNote: StandaloneNote = {
      id: "note-abc-123",
      title: "Weekly Reflection",
      content: "Consistency felt natural this week.\nLine 2 reflections.\nLine 3 conclusions.",
      createdAt: "2026-10-26T09:00:00.000Z",
      updatedAt: "2026-10-26T09:15:00.000Z",
      pinned: true,
    };

    it("round-trips habits and notes via CSV format preserving completion dates and multi-line notes", () => {
      const csv = habitsToCsv([sampleHabit], [sampleNote]);
      expect(csv).toContain("# NOTES");
      expect(csv).toContain("Daily Meditation");
      expect(csv).toContain("Weekly Reflection");

      const parsed = parseCsvHabits(csv, TODAY);
      expect(parsed.habits.length).toBe(1);
      expect(parsed.habits[0].name).toBe("Daily Meditation");
      expect(parsed.habits[0].completedDates).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
      expect(parsed.habits[0].bestStreak).toBe(15);
      expect(parsed.habits[0].currentStreak).toBe(3);
      expect(parsed.notes?.length).toBe(1);
      expect(parsed.notes?.[0].title).toBe("Weekly Reflection");
      expect(parsed.notes?.[0].content).toBe("Consistency felt natural this week.\nLine 2 reflections.\nLine 3 conclusions.");
    });

    it("round-trips habits and notes via TSV format preserving completion dates and multi-line notes", () => {
      const tsv = habitsToTsv([sampleHabit], [sampleNote]);
      expect(tsv).toContain("# NOTES");
      expect(tsv).toContain("Daily Meditation\t🧘");
      expect(tsv).toContain("Weekly Reflection");

      const parsed = parseTsvHabits(tsv, TODAY);
      expect(parsed.habits.length).toBe(1);
      expect(parsed.habits[0].name).toBe("Daily Meditation");
      expect(parsed.habits[0].completedDates).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
      expect(parsed.habits[0].bestStreak).toBe(15);
      expect(parsed.habits[0].currentStreak).toBe(3);
      expect(parsed.notes?.length).toBe(1);
      expect(parsed.notes?.[0].title).toBe("Weekly Reflection");
      expect(parsed.notes?.[0].content).toBe("Consistency felt natural this week.\nLine 2 reflections.\nLine 3 conclusions.");
    });

    it("parses habits and notes from Markdown format", () => {
      const md = exportToMarkdown([sampleHabit], [sampleNote]);
      const parsed = parseMarkdownHabits(md, TODAY);
      expect(parsed.habits.length).toBe(1);
      expect(parsed.habits[0].name).toBe("Daily Meditation");
      expect(parsed.notes?.length).toBe(1);
      expect(parsed.notes?.[0].title).toBe("Weekly Reflection");
    });
  });
});



