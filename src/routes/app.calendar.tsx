import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useHabitStore } from "@/lib/habits/store";
import { formatLong, toKey, todayKey } from "@/lib/habits/dates";
import { dayRatio, heatLevel } from "@/lib/habits/logic";
import { HabitIcon } from "@/lib/habits/icons";
import { EmptyState, LoadingList, PageHeader, Panel } from "@/components/habits/AppUi";
import { ProgressTabs } from "@/components/habits/ProgressTabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Daily Spark" },
      { name: "description", content: "See every day at a glance: habits done out of total." },
      { property: "og:title", content: "Calendar — Daily Spark" },
      { property: "og:description", content: "See every day at a glance: habits done out of total." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarPage,
});

const LEVEL_BG = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];

function CalendarPage() {
  const { loaded, habits } = useHabitStore();
  const today = todayKey();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(today);

  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7;
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysIn; d++) out.push(toKey(new Date(month.getFullYear(), month.getMonth(), d)));
    return out;
  }, [month]);

  const now = new Date();
  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  const sel = dayRatio(habits, selected);
  const selDone = habits.filter((h) => h.completedDates.includes(selected));
  const perfect = cells.filter((c) => {
    if (!c || c > today) return false;
    const r = dayRatio(habits, c);
    return r.total > 0 && r.done === r.total;
  }).length;

  return (
    <>
      <PageHeader eyebrow="Progress" title="Calendar" />
      <ProgressTabs />
      {!loaded ? (
        <LoadingList />
      ) : habits.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No history yet" body="Check in on a habit and your days will start filling in here." />
      ) : (
        <div className="flex flex-col gap-5">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[17px] font-extrabold" suppressHydrationWarning>
                {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" aria-label="Previous month" onClick={() => shift(-1)} className="grid size-9 place-items-center rounded-full bg-surface-2 hover:bg-border">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="ghost"
                  aria-label="Next month"
                  disabled={isCurrentMonth}
                  onClick={() => shift(1)}
                  className="grid size-9 place-items-center rounded-full bg-surface-2 hover:bg-border disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="pb-1 text-[11px] font-semibold text-faint">
                  {d}
                </span>
              ))}
              {cells.map((c, i) => {
                if (!c) return <span key={`e${i}`} />;
                const future = c > today;
                const r = dayRatio(habits, c);
                const lvl = future ? -1 : heatLevel(r.done, r.total);
                return (
                  <Button variant="ghost"
                    key={c}
                    disabled={future}
                    onClick={() => setSelected(c)}
                    aria-label={`${c}: ${r.done} of ${r.total} done`}
                    className={cn(
                      "grid aspect-square place-items-center h-auto rounded-full p-0 text-[13px] font-bold transition-transform hover:scale-105 disabled:hover:scale-100",
                      future ? "text-faint/60" : LEVEL_BG[lvl],
                      lvl >= 3 && "text-primary-foreground",
                      c === today && "shadow-[inset_0_0_0_2px_var(--ember)]",
                      c === selected && c !== today && "shadow-[inset_0_0_0_2px_var(--foreground)]",
                    )}
                  >
                    {Number(c.slice(8))}
                  </Button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-faint">
              None
              {LEVEL_BG.map((b) => (
                <span key={b} className={cn("size-3 rounded-[3px]", b)} />
              ))}
              All done
            </div>
          </Panel>

          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <Panel>
              <p className="kicker" suppressHydrationWarning>{formatLong(selected)}</p>
              <p className="mt-1 text-[26px] font-extrabold leading-none tabular-nums">
                {sel.done}
                <span className="text-faint"> / {sel.total}</span>
              </p>
            </Panel>
            <Panel className="min-w-28 text-center">
              <p className="kicker">Perfect</p>
              <p className="mt-1 text-[26px] font-extrabold leading-none text-gold">{perfect}</p>
            </Panel>
          </div>

          <Panel className="px-4 py-1">
            {selDone.length === 0 ? (
              <p className="py-3.5 text-sm font-semibold text-muted-foreground">Nothing checked in that day. That's okay.</p>
            ) : (
              <ul>
                {selDone.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
                    <HabitIcon habit={h} size="sm" />
                    <span className="flex-1 truncate text-sm font-bold">{h.name}</span>
                    <Check className="size-4 text-ember" strokeWidth={3} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
