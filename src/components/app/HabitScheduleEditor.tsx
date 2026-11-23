import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addDays } from "@/lib/habits/dates";
import { isHabitDueToday } from "@/lib/habits/logic";
import { changeSchedule, scheduleOn } from "@/lib/habits/schedule";
import { habitActions } from "@/lib/habits/store";
import type { Habit } from "@/lib/habits/types";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitScheduleEditor({ habit, today }: { habit: Habit; today: string }) {
  const schedule = scheduleOn(habit, today);
  const [frequencyType, setFrequencyType] = useState(schedule.frequencyType ?? "daily");
  const [customDays, setCustomDays] = useState(schedule.customDays ?? []);
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(schedule.targetDaysPerWeek ?? 1);
  const [saved, setSaved] = useState(false);
  const valid = frequencyType !== "specific_days" || customDays.length > 0;
  const choice = { frequencyType, customDays, targetDaysPerWeek };
  const preview = changeSchedule({ ...habit, isPaused: false }, choice, today);
  const dates = valid && frequencyType !== "weekly_target"
    ? Array.from({ length: 14 }, (_, index) => addDays(today, index))
        .filter((day) => isHabitDueToday(preview, day)).slice(0, 3)
    : [];

  return (
    <details className="min-w-0 space-y-3 rounded-2xl border border-border bg-surface-2 p-3" onChange={() => setSaved(false)}>
      <summary className="min-h-9 cursor-pointer text-sm font-semibold">Edit schedule</summary>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        if (valid) {
          habitActions.updateSchedule(habit.id, choice);
          setSaved(true);
        }
      }}>
        <label className="block space-y-1 text-sm">
          <span>Frequency</span>
          <select className="block min-h-11 w-full rounded-xl border border-border bg-surface px-2" value={frequencyType} onChange={(event) => setFrequencyType(event.target.value as typeof frequencyType)}>
            <option value="daily">Every day</option>
            <option value="specific_days">Selected weekdays</option>
            <option value="weekly_target">Days per week</option>
          </select>
        </label>
        {frequencyType === "specific_days" && (
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1 text-sm">Days of the week</legend>
            {weekdays.map((day, index) => (
              <label key={day} className="flex min-h-10 items-center gap-1 rounded-lg border border-border px-2 text-sm">
                <input type="checkbox" checked={customDays.includes(index)} onChange={(event) =>
                  setCustomDays(event.target.checked ? [...customDays, index] : customDays.filter((value) => value !== index))
                } />
                {day}
              </label>
            ))}
          </fieldset>
        )}
        {frequencyType === "weekly_target" && (
          <label className="flex flex-wrap items-center gap-2 text-sm">
            Target days
            <select className="min-h-11 rounded-xl border border-border bg-surface px-2" value={targetDaysPerWeek} onChange={(event) => setTargetDaysPerWeek(Number(event.target.value))}>
              {weekdays.map((_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}
            </select>
          </label>
        )}
        <p className="break-words text-xs text-muted-foreground">
          Changes start today. Earlier days keep their previous schedule.
          {dates.length > 0 && ` Next dates: ${dates.join(", ")}.`}
        </p>
        <Button type="submit" disabled={!valid}>Save schedule</Button>
        {saved && <p role="status" className="text-sm text-muted-foreground">Schedule saved.</p>}
      </form>
    </details>
  );
}
