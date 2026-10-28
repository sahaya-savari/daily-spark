import { addDays, isValidKey } from "./dates";
import { isNeutralOn } from "./strength";
import type { Habit, RelapseEntry } from "./types";

/**
 * Calculates consecutive clean days backwards from today, skipping neutral vacation days.
 */
export function calculateCleanStreak(habit: Habit, today: string): number {
  if (!isValidKey(today) || !habit.createdAt) return 0;
  const createdDateKey = habit.createdAt.slice(0, 10);

  const relapseDates = new Set((habit.relapses || []).map((r) => r.date));
  let cursor = today;
  let cleanDays = 0;

  // If today had a relapse, current clean streak is 0
  if (relapseDates.has(today)) {
    return 0;
  }

  while (cursor >= createdDateKey) {
    if (isNeutralOn(habit, cursor)) {
      // Bridge vacation days without incrementing or resetting streak
      cursor = addDays(cursor, -1);
      continue;
    }

    if (relapseDates.has(cursor)) {
      break;
    }

    cleanDays++;
    cursor = addDays(cursor, -1);
  }

  return cleanDays;
}

/**
 * Calculates total clean days since habit inception (excluding relapse days and neutral days).
 */
export function calculateTotalCleanDays(habit: Habit, today: string): number {
  if (!isValidKey(today) || !habit.createdAt) return 0;
  const createdDateKey = habit.createdAt.slice(0, 10);
  const relapseDates = new Set((habit.relapses || []).map((r) => r.date));
  let cursor = today;
  let total = 0;

  while (cursor >= createdDateKey) {
    if (!isNeutralOn(habit, cursor) && !relapseDates.has(cursor)) {
      total++;
    }
    cursor = addDays(cursor, -1);
  }

  return total;
}

/**
 * Calculates total money saved for an avoid habit:
 * Total Clean Days * dailyCost - sum(relapse costs)
 */
export function calculateMoneySaved(habit: Habit, today: string): number {
  const dailyCost = habit.dailyCost || 0;
  if (dailyCost <= 0) return 0;

  const cleanDays = calculateTotalCleanDays(habit, today);
  const relapseCosts = (habit.relapses || []).reduce((acc, r) => acc + (r.cost || 0), 0);

  const grossSaved = cleanDays * dailyCost;
  return Math.max(0, grossSaved - relapseCosts);
}

/**
 * Logs a relapse for an avoid habit on a specific date.
 */
export function logRelapse(
  habit: Habit,
  dateKey: string,
  cost = 0,
  reason?: string,
  today: string = dateKey
): Habit {
  const newEntry: RelapseEntry = {
    date: dateKey,
    timestamp: new Date().toISOString(),
    cost: cost > 0 ? cost : undefined,
    reason: reason?.trim() ? reason.trim() : undefined,
  };

  const existingRelapses = habit.relapses || [];
  const nextRelapses = [...existingRelapses.filter((r) => r.date !== dateKey), newEntry].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const streakBeforeRelapse = calculateCleanStreak(habit, today);
  const updatedHabit: Habit = {
    ...habit,
    relapses: nextRelapses,
  };

  const clean = calculateCleanStreak(updatedHabit, today);

  return {
    ...updatedHabit,
    currentStreak: clean,
    bestStreak: Math.max(habit.bestStreak || 0, streakBeforeRelapse, clean),
  };
}

/**
 * Removes a relapse record for a specific date (undo mistake).
 */
export function undoRelapse(
  habit: Habit,
  dateKey: string,
  today: string = dateKey
): Habit {
  const nextRelapses = (habit.relapses || []).filter((r) => r.date !== dateKey);
  const updatedHabit: Habit = {
    ...habit,
    relapses: nextRelapses,
  };

  const clean = calculateCleanStreak(updatedHabit, today);

  return {
    ...updatedHabit,
    currentStreak: clean,
    bestStreak: Math.max(habit.bestStreak || 0, clean),
  };
}

