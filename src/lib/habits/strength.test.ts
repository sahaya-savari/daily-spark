import { describe, it, expect } from "vitest";
import { calculateHabitStrength, isNeutralOn, getDayValue } from "./strength";
import { addDays } from "./dates";
import type { Habit } from "./types";

function mockHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Meditation",
    emoji: "🧘",
    createdAt: "2026-01-01",
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    ...overrides,
  };
}

describe("Habit Strength Score calculation", () => {
  const today = "2026-04-01";

  it("returns 0 score when no completions exist", () => {
    const habit = mockHabit();
    const result = calculateHabitStrength(habit, today);
    expect(result.score).toBe(0);
    expect(result.tier).toBe("starting");
  });

  it("returns 100 score when completed every day for 90 days", () => {
    const completedDates = Array.from({ length: 90 }, (_, i) => addDays(today, -i));
    const habit = mockHabit({ completedDates });
    const result = calculateHabitStrength(habit, today);
    expect(result.score).toBe(100);
    expect(result.tier).toBe("mastery");
  });

  it("applies exponential decay weight (recent days weigh much more than older days)", () => {
    // 12 days recent vs 12 days 60 days ago
    const recentHabit = mockHabit({
      completedDates: Array.from({ length: 12 }, (_, i) => addDays(today, -i)),
    });
    const oldHabit = mockHabit({
      completedDates: Array.from({ length: 12 }, (_, i) => addDays(today, -60 - i)),
    });

    const recentScore = calculateHabitStrength(recentHabit, today).score;
    const oldScore = calculateHabitStrength(oldHabit, today).score;

    expect(recentScore).toBeGreaterThan(oldScore);
    expect(recentScore).toBeGreaterThan(40);
  });

  it("correctly handles quantitative fractional values", () => {
    const habit = mockHabit({
      kind: "quantitative",
      targetValue: 10,
      quantitativeValues: {
        [today]: 5, // 50%
        [addDays(today, -1)]: 10, // 100%
      },
    });

    expect(getDayValue(habit, today)).toBe(0.5);
    expect(getDayValue(habit, addDays(today, -1))).toBe(1.0);
    expect(getDayValue(habit, addDays(today, -2))).toBe(0.0);
  });

  it("correctly handles avoid / quit habit relapse days", () => {
    const habit = mockHabit({
      kind: "avoid",
      relapses: [{ date: today, cost: 15, reason: "stress" }],
    });

    expect(getDayValue(habit, today)).toBe(0.0);
    expect(getDayValue(habit, addDays(today, -1))).toBe(1.0);
  });

  it("skips neutral vacation days from both numerator and denominator", () => {
    const habit = mockHabit({
      vacationRanges: [
        { start: addDays(today, -5), end: addDays(today, -1), reason: "Trip" },
      ],
      completedDates: [today, addDays(today, -6)],
    });

    expect(isNeutralOn(habit, addDays(today, -3))).toBe(true);
    expect(isNeutralOn(habit, today)).toBe(false);

    const result = calculateHabitStrength(habit, today);
    // 90 total minus 5 vacation days = 85 evaluated days
    expect(result.evaluatedDays).toBe(85);
  });
});

