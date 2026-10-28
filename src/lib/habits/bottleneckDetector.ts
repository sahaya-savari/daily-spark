import type { Habit } from "./types";
import { isDoneOn } from "./logic";
import { addDays } from "./dates";
import { extractCompletionHour } from "./circadian";

export interface FrictionAnomaly {
  type: "day_of_week" | "time_of_day";
  habitId: string;
  habitName: string;
  emoji: string;
  title: string;
  detail: string;
  recommendation: string;
  severity: "high" | "medium";
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Evaluates completion rates per day-of-week over the last 60 days.
 * Highlights habits with a drop-off rate of >= 50% on specific days.
 */
export function detectDayOfWeekBottlenecks(habits: Habit[], referenceDate: string = new Date().toISOString().slice(0, 10)): FrictionAnomaly[] {
  const anomalies: FrictionAnomaly[] = [];
  const activeHabits = habits.filter((h) => !h.archivedAt && h.completedDates.length >= 7);

  // Analyze the last 8 weeks (56 days)
  const windowDays = 56;
  const daysByWeekday: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (let i = 0; i < windowDays; i++) {
    const d = addDays(referenceDate, -i);
    const dateObj = new Date(d + "T12:00:00Z");
    const dayOfWeek = dateObj.getUTCDay();
    daysByWeekday[dayOfWeek].push(d);
  }

  for (const habit of activeHabits) {
    let overallCompletions = 0;
    for (let i = 0; i < windowDays; i++) {
      const d = addDays(referenceDate, -i);
      if (isDoneOn(habit, d)) {
        overallCompletions++;
      }
    }
    const overallRate = overallCompletions / windowDays;
    if (overallRate < 0.25) continue; // Skip habits that are rarely completed anywhere

    for (let day = 0; day < 7; day++) {
      const dates = daysByWeekday[day];
      if (dates.length === 0) continue;

      let dayCompletions = 0;
      for (const d of dates) {
        if (isDoneOn(habit, d)) {
          dayCompletions++;
        }
      }

      const dayRate = dayCompletions / dates.length;
      const failureRate = Math.round((1 - dayRate) * 100);

      // If completion rate on this day is significantly worse than overall average
      if (overallRate - dayRate >= 0.35 && failureRate >= 50) {
        const dayName = DAY_NAMES[day];
        anomalies.push({
          type: "day_of_week",
          habitId: habit.id,
          habitName: habit.name,
          emoji: habit.emoji,
          title: `High friction on ${dayName}s`,
          detail: `"${habit.name}" has a ${failureRate}% failure rate on ${dayName}s (vs ${Math.round(overallRate * 100)}% overall).`,
          recommendation: `Try setting a reduced Mini target or anchoring "${habit.name}" earlier in your ${dayName} routine.`,
          severity: failureRate >= 70 ? "high" : "medium",
        });
      }
    }
  }

  return anomalies;
}

/**
 * Detects time-of-day completion friction.
 * If habits scheduled late in the evening (after 19:00) suffer higher skip rates,
 * recommends shifting them earlier.
 */
export function detectTimeOfDayBottlenecks(habits: Habit[]): FrictionAnomaly[] {
  const anomalies: FrictionAnomaly[] = [];

  for (const habit of habits) {
    if (habit.archivedAt || !habit.reminderTime) continue;

    const [h] = habit.reminderTime.split(":").map(Number);
    if (!isNaN(h) && h >= 19) {
      // Late evening habit: check completion rate
      const totalDays = habit.completedDates.length;
      if (totalDays >= 5 && habit.currentStreak < 3) {
        anomalies.push({
          type: "time_of_day",
          habitId: habit.id,
          habitName: habit.name,
          emoji: habit.emoji,
          title: `Late schedule friction (${habit.reminderTime})`,
          detail: `Late evening habits face higher cognitive fatigue and are often missed after a busy day.`,
          recommendation: `Try shifting your reminder from ${habit.reminderTime} to an earlier afternoon or post-lunch anchor.`,
          severity: "medium",
        });
      }
    }
  }

  return anomalies;
}

/**
 * Generates combined friction diagnostics report.
 */
export function generateFrictionDiagnostics(habits: Habit[], referenceDate?: string): FrictionAnomaly[] {
  const dayAnomalies = detectDayOfWeekBottlenecks(habits, referenceDate);
  const timeAnomalies = detectTimeOfDayBottlenecks(habits);

  return [...dayAnomalies, ...timeAnomalies];
}
