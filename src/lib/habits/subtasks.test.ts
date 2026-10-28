import { describe, it, expect } from "vitest";
import {
  toggleSubtask,
  getSubtaskProgress,
  addSubtaskToHabit,
  removeSubtaskFromHabit,
} from "./subtasks";
import type { Habit } from "./types";

function mockHabitWithSubtasks(): Habit {
  return {
    id: "sub-1",
    name: "Morning Routine",
    emoji: "🌅",
    createdAt: "2026-01-01",
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    subtasks: [
      { id: "s1", title: "Make Bed" },
      { id: "s2", title: "Drink Water" },
      { id: "s3", title: "5min Journal" },
    ],
  };
}

describe("Subtask Checklist Engine", () => {
  const today = "2026-04-01";

  it("adds and removes subtask items", () => {
    let habit = mockHabitWithSubtasks();
    habit = addSubtaskToHabit(habit, "Brush Teeth");
    expect(habit.subtasks?.length).toBe(4);
    expect(habit.subtasks?.at(-1)?.title).toBe("Brush Teeth");

    habit = removeSubtaskFromHabit(habit, "s1");
    expect(habit.subtasks?.length).toBe(3);
    expect(habit.subtasks?.some((s) => s.id === "s1")).toBe(false);
  });

  it("calculates progress percentage accurately", () => {
    let habit = mockHabitWithSubtasks();
    expect(getSubtaskProgress(habit, today)).toEqual({
      completed: 0,
      total: 3,
      allDone: false,
      percentage: 0,
    });

    habit = toggleSubtask(habit, "s1", today, today);
    expect(getSubtaskProgress(habit, today)).toEqual({
      completed: 1,
      total: 3,
      allDone: false,
      percentage: 33,
    });
  });

  it("auto-completes parent habit when all subtasks are finished", () => {
    let habit = mockHabitWithSubtasks();
    expect(habit.completedDates).not.toContain(today);

    habit = toggleSubtask(habit, "s1", today, today);
    expect(habit.completedDates).not.toContain(today);

    habit = toggleSubtask(habit, "s2", today, today);
    expect(habit.completedDates).not.toContain(today);

    // Toggle 3rd and final subtask
    habit = toggleSubtask(habit, "s3", today, today);
    // Habit should now be auto-completed!
    expect(habit.completedDates).toContain(today);
    expect(habit.currentStreak).toBe(1);

    // Uncheck one subtask -> habit uncompletes
    habit = toggleSubtask(habit, "s3", today, today);
    expect(habit.completedDates).not.toContain(today);
    expect(habit.currentStreak).toBe(0);
  });
});

