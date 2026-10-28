import { completeToday, undoToday, togglePastDay } from "./logic";
import type { Habit, SubtaskItem } from "./types";

/**
 * Checks if a specific subtask is completed on a given date.
 */
export function isSubtaskCompleted(habit: Habit, subtaskId: string, dateKey: string): boolean {
  const completedList = habit.subtaskCompletions?.[dateKey];
  return Array.isArray(completedList) && completedList.includes(subtaskId);
}

/**
 * Returns progress of subtasks for a given day:
 * { completed: number, total: number, allDone: boolean }
 */
export function getSubtaskProgress(habit: Habit, dateKey: string): {
  completed: number;
  total: number;
  allDone: boolean;
  percentage: number;
} {
  const subtasks = habit.subtasks || [];
  if (subtasks.length === 0) {
    return { completed: 0, total: 0, allDone: false, percentage: 0 };
  }

  const completedList = habit.subtaskCompletions?.[dateKey] || [];
  const completed = subtasks.filter((s) => completedList.includes(s.id)).length;
  const total = subtasks.length;
  const allDone = completed === total;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, allDone, percentage };
}

/**
 * Toggles a subtask for a specific date.
 * If all subtasks become completed, automatically completes the parent habit!
 * If an already-completed habit has a subtask unchecked, uncompletes the parent habit.
 */
export function toggleSubtask(
  habit: Habit,
  subtaskId: string,
  dateKey: string,
  today: string
): Habit {
  const subtasks = habit.subtasks || [];
  const existingList = habit.subtaskCompletions?.[dateKey] || [];
  const isAlreadyDone = existingList.includes(subtaskId);

  const nextList = isAlreadyDone
    ? existingList.filter((id) => id !== subtaskId)
    : [...existingList, subtaskId];

  const nextSubtaskCompletions = {
    ...(habit.subtaskCompletions || {}),
    [dateKey]: nextList,
  };

  const updatedHabit: Habit = {
    ...habit,
    subtaskCompletions: nextSubtaskCompletions,
  };

  const allCompletedNow = subtasks.length > 0 && subtasks.every((s) => nextList.includes(s.id));
  const habitCurrentlyDone = updatedHabit.completedDates.includes(dateKey);

  if (allCompletedNow && !habitCurrentlyDone) {
    // Auto-complete habit!
    return dateKey === today
      ? completeToday(updatedHabit, today)
      : togglePastDay(updatedHabit, dateKey, today);
  } else if (!allCompletedNow && isAlreadyDone && habitCurrentlyDone) {
    // Subtask unchecked: uncomplete habit
    return dateKey === today
      ? undoToday(updatedHabit, today)
      : togglePastDay(updatedHabit, dateKey, today);
  }

  return updatedHabit;
}

/**
 * Adds a new subtask definition to a habit.
 */
export function addSubtaskToHabit(habit: Habit, title: string): Habit {
  const trimmed = title.trim();
  if (!trimmed) return habit;

  const newItem: SubtaskItem = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: trimmed,
  };

  return {
    ...habit,
    subtasks: [...(habit.subtasks || []), newItem],
  };
}

/**
 * Removes a subtask definition from a habit.
 */
export function removeSubtaskFromHabit(habit: Habit, subtaskId: string): Habit {
  return {
    ...habit,
    subtasks: (habit.subtasks || []).filter((s) => s.id !== subtaskId),
  };
}

