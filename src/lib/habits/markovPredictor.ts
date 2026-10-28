import type { Habit } from "./types";
import { isDoneOn } from "./logic";
import { extractCompletionHour } from "./circadian";

export interface HabitPrediction {
  habitId: string;
  habitName: string;
  emoji: string;
  confidencePercent: number;
  reason: string;
}

/**
 * Builds a first-order Markov sequence transition matrix across all completed dates.
 * For each day, orders habits by their completion timestamp and increments transition counts.
 */
export function buildMarkovTransitions(habits: Habit[]): Map<string, Map<string, number>> {
  const transitions = new Map<string, Map<string, number>>();

  // Collect all distinct completed dates
  const allDates = new Set<string>();
  for (const h of habits) {
    for (const d of h.completedDates || []) {
      allDates.add(d);
    }
  }

  for (const date of allDates) {
    // Collect habits completed on this date along with their completion time
    const completedOnDate: Array<{ id: string; hour: number }> = [];

    for (const habit of habits) {
      if (isDoneOn(habit, date)) {
        const hour = extractCompletionHour(habit, date);
        completedOnDate.push({ id: habit.id, hour });
      }
    }

    // Sort chronologically by completion hour
    completedOnDate.sort((a, b) => a.hour - b.hour);

    // Record sequential transitions: A -> B
    for (let i = 0; i < completedOnDate.length - 1; i++) {
      const fromId = completedOnDate[i].id;
      const toId = completedOnDate[i + 1].id;

      if (fromId === toId) continue;

      if (!transitions.has(fromId)) {
        transitions.set(fromId, new Map());
      }
      const fromMap = transitions.get(fromId)!;
      fromMap.set(toId, (fromMap.get(toId) || 0) + 1);
    }
  }

  return transitions;
}

/**
 * Predicts the most probable next habit to complete given a currently completed habit ID.
 * Filters out habits that are already completed today or archived.
 */
export function predictNextHabit(
  completedHabitId: string,
  habits: Habit[],
  today?: string
): HabitPrediction | null {
  const activeHabits = habits.filter((h) => !h.archivedAt && !h.isPaused);
  const habitMap = new Map<string, Habit>(habits.map((h) => [h.id, h]));
  const transitions = buildMarkovTransitions(activeHabits);

  const fromMap = transitions.get(completedHabitId);
  if (!fromMap || fromMap.size === 0) {
    // If no exact sequence transitions exist, fallback to general cue or uncompleted habit
    return null;
  }

  let totalTransitions = 0;
  for (const count of fromMap.values()) {
    totalTransitions += count;
  }

  if (totalTransitions === 0) return null;

  // Rank candidate target habits
  let bestTargetId: string | null = null;
  let highestCount = 0;

  for (const [targetId, count] of fromMap.entries()) {
    const targetHabit = habitMap.get(targetId);
    if (!targetHabit || targetHabit.archivedAt || targetHabit.isPaused) continue;

    // Skip if already done today
    if (today && isDoneOn(targetHabit, today)) continue;

    if (count > highestCount) {
      highestCount = count;
      bestTargetId = targetId;
    }
  }

  if (!bestTargetId) return null;

  const targetHabit = habitMap.get(bestTargetId)!;
  const currentHabit = habitMap.get(completedHabitId);
  const confidence = Math.round((highestCount / totalTransitions) * 100);

  return {
    habitId: targetHabit.id,
    habitName: targetHabit.name,
    emoji: targetHabit.emoji,
    confidencePercent: confidence,
    reason: currentHabit
      ? `You typically complete "${targetHabit.name}" right after "${currentHabit.name}" (${confidence}% frequency)`
      : `Next in routine (${confidence}% historical match)`,
  };
}
