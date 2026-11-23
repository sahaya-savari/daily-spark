import { useMemo, useState } from "react";
import { addDays } from "@/lib/habits/dates";
import { dayRatio } from "@/lib/habits/logic";
import type { Habit, HabitCollection } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

const periods = [
  { label: "Week", days: 7, bucketSize: 1 },
  { label: "Month", days: 30, bucketSize: 5 },
  { label: "Year", days: 365, bucketSize: 31 },
] as const;
const dateLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

function label(day: string) {
  return dateLabel.format(new Date(`${day}T12:00:00Z`));
}

export function ProgressSummary({ habits, collections, today, onOpenDay }: {
  habits: Habit[];
  collections: HabitCollection[];
  today: string;
  onOpenDay: (day: string, habitIds: string[] | null) => void;
}) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [scope, setScope] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const period = periods[periodIndex] ?? periods[0];
  const scopedHabits = useMemo(() => {
    if (scope.startsWith("habit:")) return habits.filter((habit) => habit.id === scope.slice(6));
    if (scope.startsWith("routine:")) {
      const ids = new Set(collections.find((collection) => collection.id === scope.slice(8))?.habitIds);
      return habits.filter((habit) => ids.has(habit.id));
    }
    return habits;
  }, [habits, collections, scope]);
  const days = useMemo(() => Array.from({ length: period.days }, (_, index) => {
    const day = addDays(today, index - period.days + 1);
    return { day, ...dayRatio(scopedHabits, day) };
  }), [period, scopedHabits, today]);
  const totals = days.reduce((sum, day) => ({ done: sum.done + day.done, total: sum.total + day.total }), { done: 0, total: 0 });
  const buckets = Array.from({ length: Math.ceil(days.length / period.bucketSize) }, (_, index) => {
    const entries = days.slice(index * period.bucketSize, (index + 1) * period.bucketSize);
    return entries.reduce(
      (sum, day) => ({ ...sum, done: sum.done + day.done, total: sum.total + day.total }),
      { entries, done: 0, total: 0 },
    );
  });
  const openDay = (day: string) => onOpenDay(day, scope ? scopedHabits.map(({ id }) => id) : null);
  const detail = selectedBucket === null ? undefined : buckets[selectedBucket];

  return (
    <section aria-label="Completion summary" className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-4">
      <div className="flex flex-wrap gap-2">
        {periods.map(({ label: text }, index) => (
          <button key={text} type="button" aria-pressed={index === periodIndex}
            className={cn("min-h-11 rounded-xl border border-border px-3 text-sm font-semibold", index === periodIndex && "border-ember bg-surface-2 text-ember")}
            onClick={() => { setPeriodIndex(index); setSelectedBucket(null); }}>{text}</button>
        ))}
      </div>
      <label className="block min-w-0 space-y-1 text-sm">
        <span>Show progress for</span>
        <select className="block min-h-11 w-full rounded-xl border border-border bg-surface-2 px-2" value={scope} onChange={(event) => { setScope(event.target.value); setSelectedBucket(null); }}>
          <option value="">All habits</option>
          {habits.length > 0 && <optgroup label="Habits">{habits.map((habit) => <option key={habit.id} value={`habit:${habit.id}`}>{habit.name}</option>)}</optgroup>}
          {collections.length > 0 && <optgroup label="Routines">{collections.map((collection) => <option key={collection.id} value={`routine:${collection.id}`}>{collection.name}</option>)}</optgroup>}
        </select>
      </label>
      <div>
        <p className="text-2xl font-bold text-ember">{totals.total ? `${Math.round(100 * totals.done / totals.total)}%` : "No scheduled habits"}</p>
        <p className="text-sm text-muted-foreground">{totals.done} of {totals.total} opportunities completed</p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Progress by date">
        {buckets.map(({ entries, done, total }, index) => {
          const first = entries[0].day;
          const last = entries[entries.length - 1].day;
          const range = first === last ? label(first) : `${label(first)} – ${label(last)}`;
          return (
            <button key={first} type="button" aria-pressed={index === selectedBucket}
              aria-label={`${range}: ${total ? `${done} of ${total} completed` : "Unscheduled"}`}
              className={cn("min-h-11 min-w-11 rounded-lg border border-border px-2 py-1 text-xs", done > 0 && "bg-ember/15 text-ember", index === selectedBucket && "ring-2 ring-ember")}
              onClick={() => { if (first === last) openDay(first); else setSelectedBucket(index); }}>
              <span className="block">{label(first)}</span>
              <span className="block">{total ? `${done}/${total}` : "—"}</span>
            </button>
          );
        })}
      </div>
      {detail && (
        <ul aria-label="Days in selected period" className="divide-y divide-border">
          {detail.entries.map(({ day, done, total }) => (
            <li key={day}>
              <button type="button" onClick={() => openDay(day)} className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 text-left text-sm">
                <span>{label(day)}</span>
                <span className="text-muted-foreground">{total ? `${done} completed · ${total - done} missed` : "Unscheduled"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
