import type { Habit } from "./types";
import { normalizeDates } from "./logic";
import { addDays } from "./dates";

export interface LongestRunRecord {
  habitId: string;
  habitName: string;
  emoji: string;
  streakLength: number;
  startDate: string;
  endDate: string;
}

export interface ArchaeologyReport {
  longestRun: LongestRunRecord | null;
  totalLifetimeCompletions: number;
  resilienceScore: number; // 0 to 100 percentage
  totalMissedDayRecoveries: number;
  totalSingleMisses: number;
  oldestRecordedDate: string | null;
  activeHabitCount: number;
}

/**
 * Computes consecutive streaks with exact start and end date boundaries.
 */
export function findLongestStreakRun(habit: Habit): { length: number; start: string; end: string } | null {
  const dates = normalizeDates(habit.completedDates || []);
  if (dates.length === 0) return null;

  let maxLen = 0;
  let maxStart = dates[0];
  let maxEnd = dates[0];

  let currentLen = 1;
  let currentStart = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];

    if (curr === addDays(prev, 1)) {
      currentLen++;
    } else {
      if (currentLen > maxLen) {
        maxLen = currentLen;
        maxStart = currentStart;
        maxEnd = prev;
      }
      currentLen = 1;
      currentStart = curr;
    }
  }

  if (currentLen > maxLen) {
    maxLen = currentLen;
    maxStart = currentStart;
    maxEnd = dates[dates.length - 1];
  }

  return {
    length: maxLen,
    start: maxStart,
    end: maxEnd,
  };
}

/**
 * Calculates the user's Comeback Resilience Score:
 * Counts whenever a habit was completed on day D-2, missed on day D-1,
 * and successfully recovered on day D.
 */
export function calculateResilienceScore(habits: Habit[]): {
  score: number;
  recoveries: number;
  singleMisses: number;
} {
  let recoveries = 0;
  let singleMisses = 0;

  for (const habit of habits) {
    const dateSet = new Set(habit.completedDates || []);
    const dates = normalizeDates(habit.completedDates || []);

    for (const date of dates) {
      const yesterday = addDays(date, -1);
      const dayBefore = addDays(date, -2);

      // If completed dayBefore, missed yesterday, and completed today: recovery!
      if (dateSet.has(dayBefore) && !dateSet.has(yesterday)) {
        recoveries++;
        singleMisses++;
      }
    }

    // Also check for unresolved single misses
    for (const date of dates) {
      const tomorrow = addDays(date, 1);
      const dayAfter = addDays(date, 2);
      if (!dateSet.has(tomorrow) && !dateSet.has(dayAfter)) {
        // Multi-day gap, not a single miss
      } else if (!dateSet.has(tomorrow) && dateSet.has(dayAfter)) {
        // Already counted in the recovery loop above
      }
    }
  }

  const score = singleMisses > 0 ? Math.min(100, Math.round((recoveries / singleMisses) * 100)) : 100;

  return {
    score,
    recoveries,
    singleMisses,
  };
}

/**
 * Compiles a complete Milestone Archaeology report for the user.
 */
export function generateArchaeologyReport(habits: Habit[]): ArchaeologyReport {
  let bestRun: LongestRunRecord | null = null;
  let totalCompletions = 0;
  let oldestDate: string | null = null;

  for (const habit of habits) {
    totalCompletions += (habit.completedDates || []).length;

    const run = findLongestStreakRun(habit);
    if (run && (!bestRun || run.length > bestRun.streakLength)) {
      bestRun = {
        habitId: habit.id,
        habitName: habit.name,
        emoji: habit.emoji,
        streakLength: run.length,
        startDate: run.start,
        endDate: run.end,
      };
    }

    for (const d of habit.completedDates || []) {
      if (!oldestDate || d < oldestDate) {
        oldestDate = d;
      }
    }
  }

  const resilience = calculateResilienceScore(habits);

  return {
    longestRun: bestRun,
    totalLifetimeCompletions: totalCompletions,
    resilienceScore: resilience.score,
    totalMissedDayRecoveries: resilience.recoveries,
    totalSingleMisses: resilience.singleMisses,
    oldestRecordedDate: oldestDate,
    activeHabitCount: habits.filter((h) => !h.archivedAt).length,
  };
}
