import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import { useHabitStore } from "@/lib/habits/store";
import { lastNDays, todayKey, fromKey, addDays } from "@/lib/habits/dates";
import { completionRate, dayRatio, heatLevel, isArchived, overallStreak, totalCompletions } from "@/lib/habits/logic";
import { HabitIcon } from "@/lib/habits/icons";
import { COLOR_SWATCH } from "@/lib/habits/types";
import { EmptyState, LoadingList, PageHeader, Panel, Stat } from "@/components/habits/AppUi";
import { ProgressTabs } from "@/components/habits/ProgressTabs";
import { Heatmap } from "@/components/habits/Heatmap";

export const Route = createFileRoute("/app/insights")({
  head: () => ({
    meta: [
      { title: "Progress — Daily Spark" },
      { name: "description", content: "Your consistency over time: rates, streaks and a 6-month activity map." },
      { property: "og:title", content: "Progress — Daily Spark" },
      { property: "og:description", content: "Your consistency over time: rates, streaks and a 6-month activity map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { loaded, habits } = useHabitStore();
  const today = todayKey();

  const data = useMemo(() => {
    const dow = (fromKey(today).getDay() + 6) % 7;
    const days = lastNDays(addDays(today, 6 - dow), 26 * 7);
    let perfect = 0;
    const levels = days.map((d) => {
      if (d > today) return 0;
      const r = dayRatio(habits, d);
      if (r.total > 0 && r.done === r.total) perfect++;
      return heatLevel(r.done, r.total);
    });
    const per = habits
      .filter((h) => !isArchived(h))
      .map((h) => {
        const last30 = lastNDays(today, 30).filter((d) => d >= h.createdAt);
        const done = last30.filter((d) => h.completedDates.includes(d)).length;
        return { h, pct: last30.length ? Math.round((done / last30.length) * 100) : 0 };
      })
      .sort((a, b) => b.pct - a.pct);
    return { days, levels, perfect, per };
  }, [habits, today]);

  return (
    <>
      <PageHeader eyebrow="Progress" title="Overview" />
      <ProgressTabs />
      {!loaded ? (
        <LoadingList />
      ) : habits.length === 0 ? (
        <EmptyState icon={ChartColumn} title="Nothing to show yet" body="Your patterns appear here after a few days of check-ins." />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="Last 7 days" value={`${completionRate(habits, today, 7)}%`} accent />
            <Stat label="Last 30 days" value={`${completionRate(habits, today, 30)}%`} />
            <Stat label="Days in a row" value={overallStreak(habits, today)} />
            <Stat label="Check-ins" value={totalCompletions(habits)} />
          </div>

          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[17px] font-extrabold">Activity · 6 months</h2>
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <span className="size-[7px] rounded-full bg-gold" /> {data.perfect} perfect days
              </span>
            </div>
            <Panel>
              <Heatmap levels={data.levels} labels={data.days} />
            </Panel>
          </section>

          <section>
            <h2 className="mb-2.5 text-[17px] font-extrabold">Consistency · 30 days</h2>
            <Panel className="px-4 py-1">
              {data.per.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">No active habits.</p>
              ) : (
                <ul>
                  {data.per.map(({ h, pct }) => (
                    <li key={h.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                      <HabitIcon habit={h} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                          <span className="truncate font-bold">{h.name}</span>
                          <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-heat-0">
                          <div
                            className="h-full rounded-full transition-[width]"
                            style={{ width: `${pct}%`, backgroundColor: COLOR_SWATCH[h.color ?? "fire"] ?? COLOR_SWATCH["fire"] }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </section>
        </div>
      )}
    </>
  );
}
