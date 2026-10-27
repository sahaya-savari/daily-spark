import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Flame, Plus, Sprout } from "lucide-react";
import { toast } from "sonner";
import { habitActions, useHabitStore } from "@/lib/habits/store";
import { addDays, formatLong, fromKey, lastNDays, todayKey } from "@/lib/habits/dates";
import { completionRate, dayRatio, heatLevel, isArchived, overallStreak } from "@/lib/habits/logic";
import { getIcon, iconKeyFor } from "@/lib/habits/icons";
import { HabitRow } from "@/components/habits/HabitRow";
import { EmptyState, LoadingList, Panel, primaryBtn } from "@/components/habits/AppUi";
import { useOpenAddHabit } from "@/components/habits/add-habit-context";
import { Heatmap, ProgressRing } from "@/components/habits/Heatmap";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Today — Daily Spark" },
      { name: "description", content: "Check in on today's habits." },
      { property: "og:title", content: "Today — Daily Spark" },
      { property: "og:description", content: "Check in on today's habits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Today,
});

function Today() {
  const { loaded, habits } = useHabitStore();
  const openAdd = useOpenAddHabit();
  const [today, setToday] = useState(() => todayKey());

  useEffect(() => {
    const t = window.setInterval(() => setToday(todayKey()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const active = useMemo(
    () => habits.filter((h) => !isArchived(h)).sort((a, b) => Number(!!b.isStarred) - Number(!!a.isStarred)),
    [habits],
  );
  const pending = active.filter((h) => !h.completedDates.includes(today));
  const doneCount = active.length - pending.length;
  const streak = overallStreak(habits, today);
  const next = pending[0];

  const celebrated = useRef<string | null>(null);
  useEffect(() => {
    if (!loaded || active.length === 0) return;
    if (pending.length === 0) {
      if (celebrated.current === "armed") toast.success("Perfect day", { description: "Everything's done. Rest easy." });
      celebrated.current = today;
    } else {
      celebrated.current = "armed";
    }
  }, [loaded, active.length, pending.length, today]);

  const dow = (fromKey(today).getDay() + 6) % 7;
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - dow));
  const heatDays = lastNDays(addDays(today, 6 - dow), 12 * 7);
  const heat = heatDays.map((d) => (d > today ? 0 : heatLevel(dayRatio(habits, d).done, dayRatio(habits, d).total)));
  const weekChecks = week.filter((d) => d <= today).reduce((n, d) => n + dayRatio(habits, d).done, 0);
  const best = active.reduce((m, h) => Math.max(m, h.bestStreak), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="kicker">Today</p>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight" suppressHydrationWarning>
            {loaded ? formatLong(today) : "\u00a0"}
          </h1>
        </div>
        {loaded && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-3 py-1.5 text-xs font-bold text-ember"
            title="Days in a row with at least one check-in"
          >
            <Flame className="size-3.5" /> {streak}
          </span>
        )}
      </div>

      {!loaded ? (
        <LoadingList />
      ) : active.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title={habits.length ? "Everything's archived" : "Start with one habit"}
          body={
            habits.length
              ? "Bring a habit back from the Habits tab, or add a new one."
              : "Pick one small thing you want to do every day. You can add more later."
          }
          action={
            <Button className={primaryBtn} onClick={openAdd}>
              <Plus className="size-4" strokeWidth={2.6} /> Add a habit
            </Button>
          }
        />
      ) : (
        <>
          <FocusCard
            next={next}
            done={doneCount}
            total={active.length}
            onCheck={() => {
              if (!next) return;
              habitActions.toggleToday(next.id);
              navigator.vibrate?.(12);
            }}
          />

          <Panel className="py-4">
            <div className="flex justify-between">
              {week.map((d) => {
                const r = dayRatio(habits, d);
                const full = r.total > 0 && r.done === r.total;
                const some = r.done > 0;
                const future = d > today;
                return (
                  <div key={d} className="flex flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold text-faint">
                      {fromKey(d).toLocaleDateString(undefined, { weekday: "narrow" })}
                    </span>
                    <span
                      className={cn(
                        "grid size-[30px] place-items-center rounded-full",
                        full ? "bg-primary text-primary-foreground" : some ? "bg-ember-soft text-ember" : "bg-surface-2",
                        future && "opacity-50",
                        d === today && !full && "shadow-[inset_0_0_0_2px_var(--ember)]",
                      )}
                    >
                      {full && <Check className="size-3.5" strokeWidth={3} />}
                      {!full && some && <span className="text-[10px] font-extrabold">{r.done}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <section>
            <h2 className="mb-2.5 text-[17px] font-extrabold">This week</h2>
            <Panel className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 px-4 py-[15px]">
              <WeekStat label="Check-ins" value={weekChecks} />
              <WeekStat label="Rate" value={`${completionRate(habits, today, dow + 1)}`} unit="%" />
              <WeekStat label="Best" value={best} unit="d" />
              <div className="flex flex-col items-center gap-0.5">
                <ProgressRing value={active.length ? doneCount / active.length : 0} size={36} stroke={4} />
                <span className="text-[10.5px] font-bold text-muted-foreground">
                  {doneCount}/{active.length}
                </span>
              </div>
            </Panel>
          </section>

          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold">Habits</h2>
              <Link to="/app/habits" className="flex items-center text-xs font-bold text-faint hover:text-foreground">
                Manage <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {active.map((h) => (
                <HabitRow key={h.id} habit={h} today={today} />
              ))}
              <Button
                variant="ghost"
                onClick={openAdd}
                className="h-12 w-full rounded-full bg-surface text-xs font-semibold text-muted-foreground hover:bg-surface-2"
              >
                + Add habit
              </Button>
            </div>
          </section>

          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold">Activity</h2>
              <Link to="/app/insights" className="flex items-center text-xs font-bold text-faint hover:text-foreground">
                Progress <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <Panel>
              <Heatmap levels={heat} labels={heatDays} />
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

function WeekStat({ label, value, unit }: { label: string; value: React.ReactNode; unit?: string }) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="mt-0.5 text-[22px] font-extrabold leading-tight tabular-nums">
        {value}
        {unit && <small className="ml-0.5 text-xs font-semibold text-muted-foreground">{unit}</small>}
      </p>
    </div>
  );
}

function FocusCard({
  next,
  done,
  total,
  onCheck,
}: {
  next: ReturnType<typeof useHabitStore>["habits"][number] | undefined;
  done: number;
  total: number;
  onCheck: () => void;
}) {
  const Ghost = next ? getIcon(iconKeyFor(next)) : Check;
  return (
    <div className="relative overflow-hidden rounded-3xl border-0 bg-surface p-[22px]">
      <Ghost aria-hidden className="pointer-events-none absolute -right-4 -top-4 size-36 text-foreground opacity-[0.07]" strokeWidth={1.3} />
      <p className="kicker">{next ? "Next up" : "Today"}</p>
      <p className="mt-1 break-words font-mono text-[26px] font-semibold leading-tight">
        {next ? next.name : "All done"}
      </p>
      <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">
        {next
          ? `${done} of ${total} done · ${next.currentStreak} day streak`
          : "Perfect day. Nothing else to do."}
      </p>
      <Button
        onClick={onCheck}
        disabled={!next}
        className={cn(primaryBtn, "mt-5 disabled:bg-surface-2 disabled:text-faint")}
      >
        <Check className="size-4" strokeWidth={3} /> {next ? "Check in" : "See you tomorrow"}
      </Button>
    </div>
  );
}
