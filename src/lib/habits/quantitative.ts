import { normalizeDates } from "./logic";
import { currentStreak, longestStreak } from "./logic";
import type { Habit, QuantProgress } from "./types";

/**
 * Calculates laps and fractional completion from current value and target value.
 */
export function getQuantProgress(current: number, target: number): QuantProgress {
  if (target <= 0) {
    return {
      laps: current > 0 ? 1 : 0,
      fraction: current > 0 ? 1 : 0,
      reachedGoal: current > 0,
      exceededGoal: false,
      totalPercent: current > 0 ? 100 : 0,
    };
  }

  const safeCurrent = Math.max(0, current);
  const laps = Math.floor(safeCurrent / target);
  let fraction: number;

  if (laps === 0) {
    fraction = safeCurrent / target;
  } else {
    fraction = (safeCurrent % target) / target;
  }

  const reachedGoal = laps >= 1;
  const exceededGoal = laps >= 1 && fraction > 0.005;
  const totalPercent = Math.round((safeCurrent / target) * 100);

  return {
    laps,
    fraction,
    reachedGoal,
    exceededGoal,
    totalPercent,
  };
}

/**
 * Updates a habit with a new quantitative value for a specific date.
 * If value >= targetValue, adds date to completedDates.
 * If value < targetValue, removes date from completedDates.
 * Recalculates streak counters deterministically.
 */
export function setQuantValue(
  habit: Habit,
  dateKey: string,
  value: number,
  today: string
): Habit {
  const target = habit.targetValue || 1;
  const safeValue = Math.max(0, Number(value.toFixed(2)));
  const nextQuantValues = {
    ...(habit.quantitativeValues || {}),
    [dateKey]: safeValue,
  };

  const isCompleted = safeValue >= target;
  let nextCompletedDates: string[];
  const nextCompletionTimes = { ...(habit.completionTimes || {}) };

  if (isCompleted) {
    nextCompletedDates = habit.completedDates.includes(dateKey)
      ? habit.completedDates
      : [...habit.completedDates, dateKey];
    if (!nextCompletionTimes[dateKey]) {
      nextCompletionTimes[dateKey] = new Date().toISOString();
    }
  } else {
    nextCompletedDates = habit.completedDates.filter((d) => d !== dateKey);
    delete nextCompletionTimes[dateKey];
  }

  const sortedDates = normalizeDates(nextCompletedDates);
  const cur = currentStreak(sortedDates, today);
  const longest = longestStreak(sortedDates);
  const best = Math.max(habit.bestStreak || 0, longest, cur);

  return {
    ...habit,
    quantitativeValues: nextQuantValues,
    completedDates: sortedDates,
    completionTimes: nextCompletionTimes,
    currentStreak: cur,
    bestStreak: best,
    lastCompletedDate: sortedDates.at(-1) ?? null,
  };
}

/**
 * Increments or decrements the quantitative value for a specific date by delta.
 */
export function incrementQuantValue(
  habit: Habit,
  dateKey: string,
  delta: number,
  today: string
): Habit {
  const currentVal = habit.quantitativeValues?.[dateKey] ?? 0;
  return setQuantValue(habit, dateKey, currentVal + delta, today);
}

/**
 * Returns sensible default quick-add increments based on habit unit and target.
 */
export function getQuickAddOptions(target: number, step?: number): number[] {
  if (step && step > 0) {
    return [step, step * 2, step * 4];
  }
  if (target >= 1000) {
    return [250, 500, 1000];
  }
  if (target >= 100) {
    return [10, 25, 50];
  }
  if (target >= 20) {
    return [5, 10, 20];
  }
  if (target >= 5) {
    return [1, 2, 5];
  }
  return [1, 2, 3];
}
