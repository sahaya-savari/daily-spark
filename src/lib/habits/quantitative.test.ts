import { describe, it, expect } from "vitest";
import { getQuantProgress, setQuantValue, incrementQuantValue, getQuickAddOptions } from "./quantitative";
import type { Habit } from "./types";

function mockQuantHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "q1",
    name: "Water Intake",
    emoji: "💧",
    createdAt: "2026-01-01",
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    kind: "quantitative",
    targetValue: 2000,
    unit: "ml",
    stepIncrement: 250,
    quantitativeValues: {},
    ...overrides,
  };
}

describe("Quantitative Habits Engine", () => {
  const today = "2026-04-01";

  it("calculates laps and fraction accurately", () => {
    // 0 out of 2000
    const p0 = getQuantProgress(0, 2000);
    expect(p0.laps).toBe(0);
    expect(p0.fraction).toBe(0);
    expect(p0.reachedGoal).toBe(false);

    // 1000 out of 2000 (Lap 0, 50%)
    const p1 = getQuantProgress(1000, 2000);
    expect(p1.laps).toBe(0);
    expect(p1.fraction).toBe(0.5);
    expect(p1.reachedGoal).toBe(false);

    // 2000 out of 2000 (Lap 1, 0% overflow)
    const p2 = getQuantProgress(2000, 2000);
    expect(p2.laps).toBe(1);
    expect(p2.fraction).toBe(0);
    expect(p2.reachedGoal).toBe(true);
    expect(p2.exceededGoal).toBe(false);

    // 3000 out of 2000 (Lap 1, 50% overflow into Lap 2)
    const p3 = getQuantProgress(3000, 2000);
    expect(p3.laps).toBe(1);
    expect(p3.fraction).toBe(0.5);
    expect(p3.reachedGoal).toBe(true);
    expect(p3.exceededGoal).toBe(true);
    expect(p3.totalPercent).toBe(150);
  });

  it("updates completedDates when target is reached or fallen below", () => {
    let habit = mockQuantHabit({ targetValue: 2000 });

    // Add 1000ml -> not reached yet
    habit = setQuantValue(habit, today, 1000, today);
    expect(habit.completedDates).not.toContain(today);
    expect(habit.currentStreak).toBe(0);

    // Add another 1000ml (total 2000ml) -> reached!
    habit = incrementQuantValue(habit, today, 1000, today);
    expect(habit.completedDates).toContain(today);
    expect(habit.currentStreak).toBe(1);

    // Decrement back down to 1500ml -> uncompleted
    habit = incrementQuantValue(habit, today, -500, today);
    expect(habit.completedDates).not.toContain(today);
    expect(habit.currentStreak).toBe(0);
  });

  it("generates intelligent quick-add increments", () => {
    expect(getQuickAddOptions(2000, 250)).toEqual([250, 500, 1000]);
    expect(getQuickAddOptions(50)).toEqual([5, 10, 20]);
    expect(getQuickAddOptions(5)).toEqual([1, 2, 5]);
  });
});
