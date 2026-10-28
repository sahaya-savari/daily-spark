import { describe, it, expect } from "vitest";
import { calculateCleanStreak, calculateMoneySaved, logRelapse, undoRelapse } from "./avoid";
import { addDays } from "./dates";
import type { Habit } from "./types";

function mockAvoidHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "a1",
    name: "Quit Vaping",
    emoji: "🚭",
    createdAt: "2026-03-01",
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    kind: "avoid",
    dailyCost: 15,
    relapses: [],
    ...overrides,
  };
}

describe("Avoid / Quit Habits Engine", () => {
  const today = "2026-03-31"; // 31 days since March 1

  it("calculates clean streak when no relapses exist", () => {
    const habit = mockAvoidHabit();
    const clean = calculateCleanStreak(habit, today);
    expect(clean).toBe(31);
  });

  it("resets streak to 0 if a relapse occurred today", () => {
    const habit = mockAvoidHabit({
      relapses: [{ date: today, cost: 20, reason: "party" }],
    });
    const clean = calculateCleanStreak(habit, today);
    expect(clean).toBe(0);
  });

  it("calculates clean streak since the most recent relapse", () => {
    const relapseDate = addDays(today, -5); // relapse 5 days ago
    const habit = mockAvoidHabit({
      relapses: [{ date: relapseDate }],
    });
    const clean = calculateCleanStreak(habit, today);
    expect(clean).toBe(5);
  });

  it("skips neutral vacation days without breaking the clean streak", () => {
    const vacationDay = addDays(today, -3);
    const habit = mockAvoidHabit({
      vacationRanges: [{ start: vacationDay, end: vacationDay }],
    });
    // Vacation day is bridged: clean days count excludes the neutral day but does not break the streak
    const clean = calculateCleanStreak(habit, today);
    expect(clean).toBe(30);
  });

  it("calculates money saved accurately subtracting relapse costs", () => {
    const habit = mockAvoidHabit({
      dailyCost: 10,
      relapses: [
        { date: addDays(today, -10), cost: 15 },
        { date: addDays(today, -20), cost: 25 },
      ],
    });
    // 31 days - 2 relapse days = 29 clean days * $10 = $290 gross.
    // Relapse costs = $40. Net saved = $250.
    const saved = calculateMoneySaved(habit, today);
    expect(saved).toBe(250);
  });

  it("logs and undoes relapses properly while preserving bestStreak", () => {
    let habit = mockAvoidHabit({ bestStreak: 10 });
    habit = logRelapse(habit, today, 15, "Stress", today);
    expect(habit.relapses?.length).toBe(1);
    expect(habit.currentStreak).toBe(0);
    expect(habit.bestStreak).toBe(31);

    habit = undoRelapse(habit, today, today);
    expect(habit.relapses?.length).toBe(0);
    expect(habit.currentStreak).toBe(31);
    expect(habit.bestStreak).toBe(31);
  });

  it("handles ISO createdAt timestamp strings seamlessly on creation day", () => {
    const habit = mockAvoidHabit({
      createdAt: `${today}T12:34:56.789Z`,
    });
    const clean = calculateCleanStreak(habit, today);
    expect(clean).toBe(1);
  });
});

