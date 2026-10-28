import { addDays, isValidKey } from "./dates";
import { isNeutralOn } from "./strength";
import type { Habit, VacationRange } from "./types";

/**
 * Calculates current streak while skipping neutral vacation days.
 * If today isn't completed and isn't neutral, checks if yesterday was completed/neutral.
 */
export function currentStreakWithNeutral(
  dates: string[],
  habit: Habit,
  today: string
): number {
  if (!isValidKey(today)) return 0;
  const set = new Set(dates);

  let cursor = today;
  // If today is not done and not neutral, start checking from yesterday
  if (!set.has(cursor) && !isNeutralOn(habit, cursor)) {
    cursor = addDays(today, -1);
  }

  const minDate = habit.createdAt ? habit.createdAt.slice(0, 10) : addDays(today, -3650);

  let count = 0;
  let iterations = 0;
  while (cursor >= minDate && iterations < 3650) {
    iterations++;
    if (isNeutralOn(habit, cursor)) {
      // Neutral day bridges the streak without breaking it and without incrementing the done counter
      cursor = addDays(cursor, -1);
      continue;
    }

    if (set.has(cursor)) {
      count++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return count;
}

/**
 * Adds a vacation range to a habit and recomputes streak continuity.
 */
export function addVacationRange(
  habit: Habit,
  start: string,
  end: string,
  reason?: string,
  today: string = end
): Habit {
  if (!isValidKey(start) || !isValidKey(end)) return habit;

  const safeStart = start <= end ? start : end;
  const safeEnd = start <= end ? end : start;

  const newRange: VacationRange = {
    start: safeStart,
    end: safeEnd,
    reason: reason?.trim() ? reason.trim() : undefined,
  };

  const nextRanges = [...(habit.vacationRanges || []), newRange].sort((a, b) =>
    a.start.localeCompare(b.start)
  );

  const updatedHabit: Habit = {
    ...habit,
    vacationRanges: nextRanges,
  };

  const cur = currentStreakWithNeutral(updatedHabit.completedDates, updatedHabit, today);

  return {
    ...updatedHabit,
    currentStreak: cur,
    bestStreak: Math.max(habit.bestStreak || 0, cur),
  };
}

/**
 * Removes a vacation range by index.
 */
export function removeVacationRange(
  habit: Habit,
  index: number,
  today: string
): Habit {
  const existing = habit.vacationRanges || [];
  if (index < 0 || index >= existing.length) return habit;

  const nextRanges = existing.filter((_, idx) => idx !== index);
  const updatedHabit: Habit = {
    ...habit,
    vacationRanges: nextRanges,
  };

  const cur = currentStreakWithNeutral(updatedHabit.completedDates, updatedHabit, today);

  return {
    ...updatedHabit,
    currentStreak: cur,
    bestStreak: Math.max(habit.bestStreak || 0, cur),
  };
}

