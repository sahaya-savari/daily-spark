import { isValidKey } from "./dates";
import type { DatedHabitSchedule, Habit, HabitSchedule } from "./types";

function baseline(habit: Habit): DatedHabitSchedule {
  return {
    effectiveOn: "",
    frequencyType: habit.frequencyType,
    customDays: habit.customDays,
    targetDaysPerWeek: habit.targetDaysPerWeek,
  };
}

function history(habit: Habit): DatedHabitSchedule[] {
  if (!Array.isArray(habit.scheduleHistory)) return [];
  return habit.scheduleHistory.filter((entry) =>
    entry && (entry.effectiveOn === "" || isValidKey(entry.effectiveOn)) &&
    (entry.frequencyType === undefined || ["daily", "specific_days", "weekly_target"].includes(entry.frequencyType))
  );
}

export function scheduleOn(habit: Habit, day: string): DatedHabitSchedule {
  let active = baseline(habit);
  for (const entry of history(habit)) {
    if (entry.effectiveOn <= day && entry.effectiveOn >= active.effectiveOn) active = entry;
  }
  return active;
}

export function changeSchedule(habit: Habit, schedule: HabitSchedule, day: string): Habit {
  if (!isValidKey(day)) return habit;
  const customDays = [...new Set(schedule.customDays ?? [])].filter((value) => Number.isInteger(value) && value >= 0 && value <= 6).sort();
  if (schedule.frequencyType === "specific_days" && customDays.length === 0) return habit;
  const next: HabitSchedule = {
    frequencyType: schedule.frequencyType ?? "daily",
    customDays: schedule.frequencyType === "specific_days" ? customDays : undefined,
    targetDaysPerWeek: schedule.frequencyType === "weekly_target" ? Math.min(7, Math.max(1, Math.round(schedule.targetDaysPerWeek || 1))) : undefined,
  };
  const entries = history(habit);
  const original = entries.some((entry) => entry.effectiveOn === "") ? entries : [baseline(habit), ...entries];
  return {
    ...habit,
    ...next,
    scheduleHistory: [...original.filter((entry) => entry.effectiveOn < day), { ...next, effectiveOn: day }],
  };
}
