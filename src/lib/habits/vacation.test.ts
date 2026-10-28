import { describe, it, expect } from "vitest";
import { currentStreakWithNeutral, addVacationRange, removeVacationRange } from "./vacation";
import { addDays } from "./dates";
import type { Habit } from "./types";

function mockHabit(): Habit {
  return {
    id: "v1",
    name: "Guitar Practice",
    emoji: "🎸",
    createdAt: "2026-01-01",
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    vacationRanges: [],
  };
}

describe("Vacation and Neutral Interval Engine", () => {
  const today = "2026-04-10";

  it("bridges vacation days without resetting streak", () => {
    // Completed: April 10 (today), April 9, then vacation April 6-8 (3 days), then completed April 5, 4, 3
    const habit: Habit = {
      ...mockHabit(),
      vacationRanges: [{ start: "2026-04-06", end: "2026-04-08", reason: "Camping" }],
      completedDates: [
        "2026-04-03",
        "2026-04-04",
        "2026-04-05",
        "2026-04-09",
        "2026-04-10",
      ],
    };

    const streak = currentStreakWithNeutral(habit.completedDates, habit, today);
    // 2 days (9, 10) + 3 days (3, 4, 5) = 5 completed days connected across the 3-day vacation bridge
    expect(streak).toBe(5);
  });

  it("handles when today is within a vacation range", () => {
    // Today is vacation, yesterday was vacation, April 8 was done, April 7 was done
    const habit: Habit = {
      ...mockHabit(),
      vacationRanges: [{ start: "2026-04-09", end: "2026-04-11", reason: "Conference" }],
      completedDates: ["2026-04-07", "2026-04-08"],
    };

    const streak = currentStreakWithNeutral(habit.completedDates, habit, today);
    expect(streak).toBe(2);
  });

  it("adds and removes vacation ranges dynamically", () => {
    let habit = mockHabit();
    habit = addVacationRange(habit, "2026-05-01", "2026-05-07", "Summer Trip", today);
    expect(habit.vacationRanges?.length).toBe(1);
    expect(habit.vacationRanges?.[0].reason).toBe("Summer Trip");

    habit = removeVacationRange(habit, 0, today);
    expect(habit.vacationRanges?.length).toBe(0);
  });
});

