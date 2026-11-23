import { scheduleOn } from "./schedule";
import { addDays, isValidKey } from "./dates";
import type { Habit } from "./types";

export interface StrengthDetails {
  score: number; // 0 to 100
  percentage: number; // 0 to 100
  evaluatedDays: number;
  totalWeight: number;
  tier: "starting" | "building" | "steady" | "mastery";
  color: string;
  glowColor: string;
}

/**
 * Checks whether a given calendar day is considered "neutral" (vacation or explicitly excluded).
 */
export function isNeutralOn(habit: Habit, day: string): boolean {
  if (!habit.vacationRanges || habit.vacationRanges.length === 0) return false;
  for (const range of habit.vacationRanges) {
    if (range.start && range.end && day >= range.start && day <= range.end) {
      return true;
    }
  }
  return false;
}

/**
 * Determines whether a habit is scheduled on a given day (customDays, createdAt check).
 */
export function isScheduledOn(habit: Habit, day: string): boolean {
  if (habit.createdAt && day < habit.createdAt.slice(0, 10)) return false;
  if (habit.archivedAt && day >= habit.archivedAt.slice(0, 10)) return false;

  // Custom days of week check (0=Sun, 1=Mon, ..., 6=Sat)
  const schedule = scheduleOn(habit, day);
  if (schedule.frequencyType === "specific_days" && Array.isArray(schedule.customDays) && schedule.customDays.length > 0) {
    const dateObj = new Date(`${day}T12:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();
    return schedule.customDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Returns value v(day) for the habit on a given date:
 * - boolean / positive: 1.0 if completed, else 0.0
 * - quantitative: min(1.0, count / target)
 * - avoid / negative: 0.0 if a relapse occurred on that day, else 1.0
 */
export function getDayValue(habit: Habit, day: string): number {
  const kind = habit.kind || "boolean";

  if (kind === "avoid") {
    // If a relapse is logged on this date, 0.0; otherwise 1.0
    const hasRelapse = habit.relapses?.some((r) => r.date === day);
    return hasRelapse ? 0.0 : 1.0;
  }

  if (kind === "quantitative") {
    const target = habit.targetValue || 1;
    const count = habit.quantitativeValues?.[day] ?? (habit.completedDates.includes(day) ? target : 0);
    return Math.max(0, Math.min(1.0, count / target));
  }

  // Default boolean / positive
  return habit.completedDates.includes(day) ? 1.0 : 0.0;
}

/**
 * Habit Strength Score Formula:
 * Score = sum_{i=0}^{W-1} w_i * v(day_{-i}) / sum_{i=0}^{W-1} w_i
 * where W = 90 days, H = 12.0 days half-life, w_i = 0.5^(i / H).
 * Neutral and unscheduled days are excluded from both sums.
 */
export function calculateHabitStrength(
  habit: Habit,
  today: string,
  windowDays = 90,
  halfLife = 12.0
): StrengthDetails {
  if (!isValidKey(today)) {
    return {
      score: 0,
      percentage: 0,
      evaluatedDays: 0,
      totalWeight: 0,
      tier: "starting",
      color: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.4)",
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let evaluatedDays = 0;

  for (let i = 0; i < windowDays; i++) {
    const day = addDays(today, -i);

    // Skip if neutral (vacation) or unscheduled
    if (isNeutralOn(habit, day) || !isScheduledOn(habit, day)) {
      continue;
    }

    const weight = Math.pow(0.5, i / halfLife);
    const value = getDayValue(habit, day);

    weightedSum += weight * value;
    totalWeight += weight;
    evaluatedDays++;
  }

  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let tier: StrengthDetails["tier"] = "starting";
  let color = "#F59E0B"; // Amber (0 - 40%)
  let glowColor = "rgba(245, 158, 11, 0.4)";

  if (score >= 80) {
    tier = "mastery";
    color = "#10B981"; // Emerald
    glowColor = "rgba(16, 185, 129, 0.4)";
  } else if (score >= 60) {
    tier = "steady";
    color = "#F29559"; // Sunlit apricot
    glowColor = "rgba(242, 149, 89, 0.4)";
  } else if (score >= 35) {
    tier = "building";
    color = "#38BDF8"; // Cyan
    glowColor = "rgba(56, 189, 248, 0.4)";
  }

  return {
    score,
    percentage: score,
    evaluatedDays,
    totalWeight,
    tier,
    color,
    glowColor,
  };
}

