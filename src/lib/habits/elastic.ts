import type { Habit, ElasticTargets } from "./types";
import { isDoneOn, isArchived } from "./logic";
import { addDays } from "./dates";

export type ElasticTier = "none" | "mini" | "plus" | "elite";

export interface ElasticProgress {
  tier: ElasticTier;
  current: number;
  mini: number;
  plus: number;
  elite: number;
  percent: number; // 0 to 100+
  bonusStrength: number;
  isStreakSaved: boolean;
}

/**
 * Resolves or infers multi-tier thresholds for any habit.
 */
export function resolveElasticTargets(habit: Habit): ElasticTargets {
  if (habit.elasticTargets) {
    return habit.elasticTargets;
  }

  if (habit.kind === "quantitative" && habit.targetValue && habit.targetValue > 0) {
    const plus = habit.targetValue;
    const mini = Math.max(1, Math.round(plus * 0.33));
    const elite = Math.round(plus * 1.5);
    return { mini, plus, elite, unit: habit.unit };
  }

  if (habit.subtasks && habit.subtasks.length > 0) {
    const total = habit.subtasks.length;
    return {
      mini: 1,
      plus: total,
      elite: total + 1, // Stretch bonus
      unit: "subtasks",
    };
  }

  // Standard boolean habit
  return {
    mini: 1,
    plus: 1,
    elite: 2,
    unit: "completion",
  };
}

/**
 * Computes current progress value on a given date.
 */
export function getHabitCurrentValue(habit: Habit, dateKey: string): number {
  if (habit.kind === "quantitative") {
    return habit.quantitativeValues?.[dateKey] || (isDoneOn(habit, dateKey) ? habit.targetValue || 1 : 0);
  }

  if (habit.subtasks && habit.subtasks.length > 0) {
    return habit.subtaskCompletions?.[dateKey]?.length || (isDoneOn(habit, dateKey) ? habit.subtasks.length : 0);
  }

  return isDoneOn(habit, dateKey) ? 1 : 0;
}

/**
 * Evaluates the elastic tier achieved on a given date.
 */
export function getElasticProgress(habit: Habit, dateKey: string): ElasticProgress {
  const targets = resolveElasticTargets(habit);
  const current = getHabitCurrentValue(habit, dateKey);

  let tier: ElasticTier = "none";
  let bonusStrength = 0;

  if (current >= targets.elite) {
    tier = "elite";
    bonusStrength = 30;
  } else if (current >= targets.plus) {
    tier = "plus";
    bonusStrength = 15;
  } else if (current >= targets.mini) {
    tier = "mini";
    bonusStrength = 5;
  }

  const percent = targets.plus > 0 ? Math.round((current / targets.plus) * 100) : 0;
  const isStreakSaved = tier !== "none" || isDoneOn(habit, dateKey);

  return {
    tier,
    current,
    mini: targets.mini,
    plus: targets.plus,
    elite: targets.elite,
    percent,
    bonusStrength,
    isStreakSaved,
  };
}

/**
 * The Two-Day Rule ("Never Miss Twice") detector:
 * Identifies habits that missed yesterday and have not yet been logged today,
 * placing them in an "At-Risk" state with an actionable Mini recovery suggestion.
 */
export function getAtRiskHabits(habits: Habit[], today: string): Habit[] {
  const yesterday = addDays(today, -1);
  const dayBeforeYesterday = addDays(today, -2);

  return habits.filter((h) => {
    if (isArchived(h) || Boolean(h.isPaused)) return false;
    // Already completed today? Then not at risk!
    if (isDoneOn(h, today)) return false;

    // Did they miss yesterday?
    const completedYesterday = isDoneOn(h, yesterday);
    if (completedYesterday) return false;

    // Under the Two-Day Rule ("Never Miss Twice"), a habit is at risk today
    // if and only if it had active momentum on the day before yesterday and missed yesterday.
    const completedDayBefore = isDoneOn(h, dayBeforeYesterday);
    return completedDayBefore;
  });
}

/**
 * Formats a friendly low-friction Mini target suggestion to save streak.
 */
export function getMiniRecoveryPrompt(habit: Habit): string {
  const targets = resolveElasticTargets(habit);
  if (habit.kind === "quantitative") {
    return `Do just ${targets.mini} ${targets.unit || "units"} today to keep your spark alive!`;
  }
  if (habit.subtasks && habit.subtasks.length > 0) {
    return `Complete just 1 subtask to protect your streak today!`;
  }
  return `Spend 2 focused minutes on ${habit.name} to never miss twice!`;
}
