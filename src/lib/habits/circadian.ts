import type { Habit } from "./types";

export interface CircadianBin {
  hour: number; // 0 to 23
  label: string; // e.g. "08:00"
  rawCount: number;
  smoothedDensity: number; // Gaussian smoothed intensity
}

export interface StackingCorrelation {
  triggerHabitId: string;
  triggerHabitName: string;
  targetHabitId: string;
  targetHabitName: string;
  confidence: number; // 0 to 100 percentage
  coOccurrences: number;
  triggerTotal: number;
  insightText: string;
}

/**
 * Extracts the hour of completion (0 to 23.99) for a habit on a given date.
 */
export function extractCompletionHour(habit: Habit, dateKey: string): number {
  const timeStr = habit.completionTimes?.[dateKey];
  if (timeStr) {
    if (timeStr.includes("T")) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.getHours() + d.getMinutes() / 60;
      }
    } else if (timeStr.includes(":")) {
      const [h, m] = timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        return h + m / 60;
      }
    }
  }

  // Fallback to reminder time if set, otherwise default to 09:00
  if (habit.reminderTime && habit.reminderTime.includes(":")) {
    const [h, m] = habit.reminderTime.split(":").map(Number);
    if (!isNaN(h)) return h + (m || 0) / 60;
  }

  return 9.0;
}

/**
 * Calculates 24-hour Circadian performance curve using Gaussian kernel smoothing:
 * f(h) = (1 / (N * sigma * sqrt(2*pi))) * sum(exp(-(h - h_i)^2 / (2 * sigma^2)))
 */
export function calculateCircadianCurve(
  habits: Habit[],
  sigma = 1.2
): CircadianBin[] {
  const hours: number[] = [];

  for (const habit of habits) {
    for (const date of habit.completedDates) {
      const h = extractCompletionHour(habit, date);
      hours.push(h);
    }
  }

  const rawBins = new Array(24).fill(0);
  for (const h of hours) {
    const intH = Math.floor(h) % 24;
    rawBins[intH]++;
  }

  const N = hours.length;
  const factor = N > 0 ? 1 / (N * sigma * Math.sqrt(2 * Math.PI)) : 0;
  const twoSigmaSq = 2 * sigma * sigma;

  const result: CircadianBin[] = [];

  for (let h = 0; h < 24; h++) {
    let smoothed = 0;
    if (N > 0) {
      for (const hi of hours) {
        // Handle circular 24-hour wrap around distance
        const diff = Math.abs(h - hi);
        const circularDiff = Math.min(diff, 24 - diff);
        smoothed += Math.exp(-(circularDiff * circularDiff) / twoSigmaSq);
      }
      smoothed *= factor;
    }

    result.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      rawCount: rawBins[h],
      smoothedDensity: Number(smoothed.toFixed(4)),
    });
  }

  return result;
}

/**
 * Computes habit stacking conditional probabilities:
 * P(B | A) = (Days both A and B completed) / (Days A completed)
 */
export function calculateHabitStacking(
  habits: Habit[],
  minOccurrences = 3
): StackingCorrelation[] {
  const activeHabits = habits.filter((h) => !h.archivedAt && h.completedDates.length >= minOccurrences);
  const correlations: StackingCorrelation[] = [];

  for (let i = 0; i < activeHabits.length; i++) {
    const habitA = activeHabits[i];
    const setA = new Set(habitA.completedDates);

    for (let j = 0; j < activeHabits.length; j++) {
      if (i === j) continue;
      const habitB = activeHabits[j];
      const setB = new Set(habitB.completedDates);

      let coOccurrences = 0;
      for (const date of setA) {
        if (setB.has(date)) {
          coOccurrences++;
        }
      }

      if (coOccurrences >= minOccurrences) {
        const prob = (coOccurrences / setA.size) * 100;
        const confidence = Math.round(prob);

        if (confidence >= 60) {
          correlations.push({
            triggerHabitId: habitA.id,
            triggerHabitName: habitA.name,
            targetHabitId: habitB.id,
            targetHabitName: habitB.name,
            confidence,
            coOccurrences,
            triggerTotal: setA.size,
            insightText: `When you complete "${habitA.name}", you also complete "${habitB.name}" ${confidence}% of the time.`,
          });
        }
      }
    }
  }

  return correlations.sort((a, b) => b.confidence - a.confidence);
}

