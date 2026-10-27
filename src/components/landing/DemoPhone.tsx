import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Bell, Check, ChartColumn, ChevronRight, Download, Flame, House, ListChecks, Plus, Settings2, Star, Upload,
} from "lucide-react";
import { Heatmap, ProgressRing } from "@/components/habits/Heatmap";
import { HabitIcon, HABIT_ICONS, getIcon } from "@/lib/habits/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/*
 * Landing-page demo. Screens are laid out at 390×844 (a real phone) and
 * scaled into the device frame. Uses sample data only - never the real store.
 */

const W = 390;
const H = 844;

interface DemoHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  done: boolean;
}

const INITIAL: DemoHabit[] = [
  { id: "1", name: "Read 20 minutes", icon: "read", color: "fire", streak: 12, done: true },
  { id: "2", name: "Drink water", icon: "water", color: "ocean", streak: 31, done: true },
  { id: "3", name: "Evening walk", icon: "run", color: "forest", streak: 4, done: false },
  { id: "4", name: "Meditate", icon: "mindful", color: "purple", streak: 0, done: false },
];

function seeded(n: number, seed = 7): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    out.push(r < 0.2 ? 0 : r < 0.36 ? 1 : r < 0.56 ? 2 : r < 0.78 ? 3 : 4);
  }
  return out;
}
const HEAT = seeded(84);

const h = (d: DemoHabit) => ({ icon: d.icon, emoji: "", color: d.color });

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

function Scaled({ width, children }: { width: number; children: React.ReactNode }) {
  const s = width / W;
  return (
    <div className="relative overflow-hidden" style={{ width, height: H * s, borderRadius: 37 * (width / 310) }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${s})` }}>
        {children}
      </div>
    </div>
  );
}

/** Large hero device with side keys and a soft 3D tilt. */
export function Device({ children, tilt }: { children: React.ReactNode; tilt?: { x: number; y: number } }) {
  return (
    <div
      className="bezel relative w-[290px] max-w-[80vw] rounded-[42px] p-2.5 transition-transform duration-500"
      style={{ transform: tilt ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined }}
    >
      <span className="absolute -left-[3px] top-[116px] h-[38px] w-[3px] rounded-[3px] bg-border-hi" />
      <span className="absolute -left-[3px] top-[162px] h-[38px] w-[3px] rounded-[3px] bg-border-hi" />
      <span className="absolute -right-[3px] top-[148px] h-[54px] w-[3px] rounded-[3px] bg-border-hi" />
      <div className="relative overflow-hidden rounded-[33px] shadow-[inset_0_0_0_1px_oklch(1_0_0/5%)]">
        <span className="absolute left-1/2 top-2.5 z-10 h-[17px] w-[66px] -translate-x-1/2 rounded-xl bg-background shadow-[inset_0_0_0_1px_oklch(1_0_0/6%)]" />
        <Scaled width={270}>{children}</Scaled>
      </div>
    </div>
  );
}

/** Small phone for the screens strip. */
export function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div className="bezel relative w-[208px] rounded-[32px] p-[7px] transition-transform duration-300 group-hover:-translate-y-2">
      <span className="absolute left-1/2 top-[9px] z-10 h-[13px] w-[52px] -translate-x-1/2 rounded-[9px] bg-background" />
      <div className="overflow-hidden rounded-[26px]">
        <Scaled width={194}>{children}</Scaled>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App chrome inside the phone                                         */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "Today", Icon: House },
  { label: "Habits", Icon: ListChecks },
  null,
  { label: "Progress", Icon: ChartColumn },
  { label: "Settings", Icon: Settings2 },
] as const;

const NavCtx = createContext<((i: number) => void) | undefined>(undefined);

function Screen({
  children,
  active,
  onNav: onNavProp,
}: {
  children: React.ReactNode;
  active: number;
  onNav?: ((i: number) => void) | undefined;
}) {
  const ctxNav = useContext(NavCtx);
  const onNav = onNavProp ?? ctxNav;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [active]);

  return (
    <div className="bg-dots relative h-full w-full font-app text-[14px] leading-[1.45] text-foreground">
      <div className="absolute inset-x-0 top-0 z-[6] flex h-12 items-center justify-between px-[26px] text-[13px] font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="flex items-end gap-[2px]">
            {[4, 6, 8, 10].map((x) => (
              <i key={x} className="w-[3px] rounded-[1px] bg-foreground" style={{ height: x }} />
            ))}
          </span>
          <span className="h-[11px] w-[22px] rounded-[3px] border border-foreground/70 p-[1.5px]">
            <i className="block h-full w-3/4 rounded-[1px] bg-foreground" />
          </span>
        </span>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-none absolute inset-0 flex flex-col gap-5 overflow-y-auto [&>*]:shrink-0 overscroll-contain px-5 pb-[116px] pt-[52px]"
      >
        {children}
      </div>
      <div className="nav-float absolute inset-x-3.5 bottom-3.5 z-[6] flex h-[88px] items-center justify-between rounded-full border-0 bg-surface/90 px-3 backdrop-blur-xl">
        {NAV.map((n, i) =>
          n === null ? (
            <Button
              key="go"
              type="button"
              tabIndex={onNav ? 0 : -1}
              aria-label="Add habit"
              onClick={() => onNav?.(5)}
              variant="fab" size="fab" className="shrink-0"
            >
              <Plus className="size-6" strokeWidth={2.6} />
            </Button>
          ) : (
            <Button variant="ghost"
              key={n.label}
              type="button"
              tabIndex={onNav ? 0 : -1}
              onClick={() => onNav?.(i)}
              className={cn(
                "flex h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-full p-0 transition-colors",
                active === i ? "text-ember" : "text-faint",
              )}
            >
              <span className={cn("grid h-8 w-12 place-items-center rounded-full", active === i && "bg-ember-soft")}><n.Icon className="size-5" strokeWidth={active === i ? 2.3 : 2} /></span>
              <span className="text-[9.5px] font-semibold">{n.label}</span>
            </Button>
          ),
        )}
      </div>
    </div>
  );
}

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-3xl border-0 bg-surface p-[18px]", className)}>{children}</div>
);

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

export function HomeScreen({
  habits,
  onToggle,
  onNav,
}: {
  habits: DemoHabit[];
  onToggle?: (id: string) => void;
  onNav?: ((i: number) => void) | undefined;
}) {
  const done = habits.filter((x) => x.done).length;
  const next = habits.find((x) => !x.done);
  const Ghost = next ? getIcon(next.icon) : Check;
  const week = [4, 4, 3, 4, 2, 4, done];
  return (
    <Screen active={0} onNav={onNav}>
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker">Today</p>
          <p className="text-[19px] font-extrabold">Monday 26 Oct</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-[11px] py-1.5 text-xs font-semibold text-ember">
          <Flame className="size-3.5" /> 18
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-0 bg-surface p-[22px]">
        <Ghost className="pointer-events-none absolute -right-2 -top-2 size-[120px] opacity-[0.12]" strokeWidth={1.3} />
        <p className="kicker">{next ? "Next up" : "Today"}</p>
        <p className="font-mono text-[26px] font-semibold leading-[1.15]">{next ? next.name : "All done"}</p>
        <p className="text-[12.5px] font-semibold text-muted-foreground">
          {next ? `${done} of ${habits.length} done · ${next.streak} day streak` : "Perfect day. Rest easy."}
        </p>
        <Button variant="ghost"
          type="button"
          tabIndex={onToggle ? 0 : -1}
          onClick={() => next && onToggle?.(next.id)}
          className={cn(
            "mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-extrabold transition-transform active:scale-[0.975]",
            next ? "bg-primary text-primary-foreground" : "bg-surface-2 text-faint",
          )}
        >
          <Check className="size-4" strokeWidth={3} /> {next ? "Check in" : "See you tomorrow"}
        </Button>
      </div>

      <Card className="py-4">
        <div className="flex justify-between">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
            const full = week[i] === 4;
            return (
              <div key={i} className="flex flex-col items-center gap-[7px]">
                <span className="text-[11px] font-semibold text-faint">{d}</span>
                <span
                  className={cn(
                    "grid size-[30px] place-items-center rounded-full",
                    full ? "bg-primary text-primary-foreground" : (week[i] ?? 0) > 0 ? "bg-ember-soft text-ember" : "bg-surface-2",
                    i === 0 && !full && "shadow-[inset_0_0_0_2px_var(--ember)]",
                  )}
                >
                  {full ? <Check className="size-3.5" strokeWidth={3} /> : <span className="text-[10px] font-extrabold">{week[i]}</span>}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div>
        <p className="mb-2.5 text-[17px] font-extrabold">Habits</p>
        <div className="space-y-3">
          {habits.map((x) => (
            <div key={x.id} className="flex items-center gap-3 rounded-3xl bg-surface p-4">
              <HabitIcon habit={h(x)} />
              <div className="min-w-0 flex-1">
                <p className={cn("break-words font-mono text-[14px] font-semibold", x.done && "text-muted-foreground")}>{x.name}</p>
                <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                  <Flame className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                </p>
                <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className={cn("h-full rounded-full bg-ember transition-[width] duration-500", x.done ? "w-full" : "w-0")} /></div>
              </div>
              <Button variant="ghost"
                type="button"
                tabIndex={onToggle ? 0 : -1}
                aria-label={`Toggle ${x.name}`}
                aria-pressed={x.done}
                onClick={() => onToggle?.(x.id)}
                className={cn(
                  "check-orb grid size-12 shrink-0 place-items-center rounded-full p-0",
                  x.done ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-surface-2 text-faint",
                )}
              >
                <Check className="size-4" strokeWidth={3} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        tabIndex={onNav ? 0 : -1}
        onClick={() => onNav?.(3)}
        className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 text-left transition-colors hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-ember-soft text-ember">
            <Flame className="size-4" />
          </span>
          <div>
            <p className="kicker text-[10px]">Overview</p>
            <p className="font-mono text-sm font-semibold">View 6-Month Activity &amp; Stats</p>
          </div>
        </div>
        <ChevronRight className="size-4 text-faint" />
      </button>
    </Screen>
  );
}

export function ProgressScreen({ onNav }: { onNav?: ((i: number) => void) | undefined }) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Progress</p>
        <p className="font-display text-[26px] font-bold leading-tight">Overview</p>
      </div>
      <div className="grid grid-cols-2 gap-[11px]">
        {[
          ["Last 7 days", "82%", true],
          ["Last 30 days", "76%", false],
          ["Days in a row", "18", false],
          ["Check-ins", "412", false],
        ].map(([k, v, a]) => (
          <Card key={k as string} className="p-4">
            <p className="kicker">{k as string}</p>
            <p className={cn("mt-1 text-[26px] font-extrabold leading-none", a && "text-ember")}>{v as string}</p>
          </Card>
        ))}
      </div>
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[17px] font-extrabold">Activity</p>
          <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-muted-foreground">
            <i className="size-[7px] rounded-full bg-gold" /> 37 perfect days
          </span>
        </div>
        <Card>
          <Heatmap levels={HEAT} />
        </Card>
      </div>
      <div>
        <p className="mb-2.5 text-[17px] font-extrabold">Consistency</p>
        <Card className="px-3.5 py-1">
          {INITIAL.map((x, i) => (
            <div key={x.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
              <HabitIcon habit={h(x)} size="sm" />
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-[13px] font-bold">
                  <span>{x.name}</span>
                  <span className="text-muted-foreground">{[94, 100, 63, 40][i]}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-heat-0">
                  <div className="h-full rounded-full bg-ember" style={{ width: `${[94, 100, 63, 40][i]}%` }} />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </Screen>
  );
}

export function CalendarScreen() {
  const lv = seeded(31, 3);
  return (
    <Screen active={3}>
      <div>
        <p className="kicker">Progress</p>
        <p className="font-display text-[26px] font-bold leading-tight">Calendar</p>
      </div>
      <Card>
        <p className="mb-3 text-[17px] font-extrabold">October 2026</p>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="text-[11px] font-semibold text-faint">{d}</span>
          ))}
          {[0, 1, 2].map((i) => <span key={`e${i}`} />)}
          {Array.from({ length: 31 }, (_, i) => {
            const d = i + 1;
            const l = d > 26 ? -1 : (lv[i] ?? 0);
            return (
              <span
                key={d}
                className={cn(
                  "grid aspect-square place-items-center rounded-[10px] text-[12px] font-bold",
                  l < 0 ? "text-faint/60" : ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"][l],
                  l >= 3 && "text-primary-foreground",
                  d === 26 && "shadow-[inset_0_0_0_2px_var(--ember)]",
                )}
              >
                {d}
              </span>
            );
          })}
        </div>
      </Card>
      <div className="grid grid-cols-[1fr_auto] gap-[11px]">
        <Card>
          <p className="kicker">Mon 26 Oct</p>
          <p className="mt-1 text-[26px] font-extrabold leading-none">2<span className="text-faint"> / 4</span></p>
        </Card>
        <Card className="text-center">
          <p className="kicker">Perfect</p>
          <p className="mt-1 text-[26px] font-extrabold leading-none text-gold">9</p>
        </Card>
      </div>
    </Screen>
  );
}

export function HabitScreen({ onNav }: { onNav?: ((i: number) => void) | undefined }) {
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const [activeHabit, setActiveHabit] = useState<DemoHabit | null>(null);

  const displayed = filter === "starred"
    ? INITIAL.filter((h) => h.id === "1" || h.id === "2")
    : INITIAL;

  return (
    <Screen active={1} onNav={onNav}>
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker">Habits</p>
          <p className="font-display text-[26px] font-bold leading-tight">All Habits</p>
        </div>
        <span className="text-xs font-semibold text-faint">{displayed.length} habits</span>
      </div>

      {/* Segmented Filter: All vs Starred (Favorites) */}
      <div className="flex rounded-full bg-surface p-1">
        <button
          type="button"
          onClick={() => {
            setFilter("all");
            setActiveHabit(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            filter === "all" ? "bg-surface-2 text-foreground shadow-sm" : "text-faint hover:text-muted-foreground",
          )}
        >
          All ({INITIAL.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter("starred");
            setActiveHabit(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            filter === "starred" ? "bg-surface-2 text-ember shadow-sm" : "text-faint hover:text-muted-foreground",
          )}
        >
          ★ Starred (2)
        </button>
      </div>

      {activeHabit ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveHabit(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
          >
            ← Back to habits list
          </button>
          <div className="relative overflow-hidden rounded-3xl border-0 bg-surface p-[22px]">
            <HabitIcon habit={h(activeHabit)} size="lg" />
            <p className="kicker mt-4">Active Habit</p>
            <p className="font-display text-[26px] font-bold leading-tight">{activeHabit.name}</p>
            <p className="text-[12.5px] font-semibold text-muted-foreground">{activeHabit.streak} days current streak</p>
          </div>
          <div className="grid grid-cols-3 gap-[9px]">
            {[
              [String(activeHabit.streak), "Current", true],
              [String(Math.max(activeHabit.streak, 21)), "Best", false],
              [String(activeHabit.streak * 3), "Total", false],
            ].map(([v, k, a]) => (
              <Card key={k as string} className="p-3.5 text-center">
                <p className={cn("text-[26px] font-extrabold leading-none", a && "text-ember")}>{v as string}</p>
                <p className="kicker mt-1.5">{k as string}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((x) => (
            <div
              key={x.id}
              onClick={() => setActiveHabit(x)}
              className="flex cursor-pointer items-center gap-3 rounded-3xl bg-surface p-4 transition-colors hover:bg-surface-2"
            >
              <HabitIcon habit={h(x)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="break-words font-mono text-[14px] font-semibold">{x.name}</p>
                  {(x.id === "1" || x.id === "2") && <Star className="size-3 fill-gold text-gold" />}
                </div>
                <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                  <Flame className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}

export function NewHabitScreen() {
  return (
    <Screen active={-1}>
      <div>
        <p className="kicker">New habit</p>
        <p className="font-display text-[26px] font-bold leading-tight">What will you show up for?</p>
      </div>
      <div className="flex h-12 items-center rounded-2xl border-0 bg-surface-2 px-4 text-[15px] font-semibold">
        Stretch 10 minutes<span className="ml-0.5 h-5 w-px bg-ember pulse-dot" />
      </div>
      <Card className="p-3.5">
        <p className="kicker mb-2.5">Icon</p>
        <div className="grid grid-cols-6 gap-1.5">
          {HABIT_ICONS.slice(0, 18).map(({ key, Icon }) => (
            <span
              key={key}
              className={cn(
                "grid aspect-square place-items-center rounded-[12px] text-muted-foreground",
                key === "mindful" && "bg-surface-2 text-ember shadow-[inset_0_0_0_1.5px_var(--ember)]",
              )}
            >
              <Icon className="size-5" strokeWidth={1.9} />
            </span>
          ))}
        </div>
      </Card>
      <div className="flex h-[52px] items-center justify-center rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground">
        Add habit
      </div>
    </Screen>
  );
}

export function SettingsScreen() {
  return (
    <Screen active={4}>
      <div>
        <p className="kicker">Daily Spark</p>
        <p className="font-display text-[26px] font-bold leading-tight">Settings</p>
      </div>
      <div>
        <p className="kicker mb-2.5">Your data</p>
        <Card className="px-4 py-1">
          {[
            [Download, "Export backup", ".json"],
            [Upload, "Restore from file", "Old backups work"],
          ].map(([Ic, t, s]) => {
            const I = Ic as typeof Download;
            return (
              <div key={t as string} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember"><I className="size-4" /></span>
                <div className="flex-1">
                  <p className="text-[14px] font-bold">{t as string}</p>
                  <p className="text-[11.5px] font-semibold text-faint">{s as string}</p>
                </div>
                <ChevronRight className="size-4 text-faint" />
              </div>
            );
          })}
        </Card>
      </div>
      <div>
        <p className="kicker mb-2.5">Reminders</p>
        <Card className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember"><Bell className="size-4" /></span>
          <span className="flex-1 text-[14px] font-bold">Gentle reminders</span>
          <span className="h-5 w-9 rounded-full bg-primary p-0.5"><i className="ml-auto block size-4 rounded-full bg-background" /></span>
        </Card>
      </div>
      <Card className="flex items-center gap-3 px-4 py-3">
        <Star className="size-4 fill-gold text-gold" />
        <span className="text-[13px] font-semibold text-muted-foreground">No account · No ads · No tracking</span>
      </Card>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Hero demo                                                           */
/* ------------------------------------------------------------------ */

export function DemoPhone() {
  const [tab, setTab] = useState(0);
  const [habits, setHabits] = useState(INITIAL);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (id: string) =>
    setHabits((hs) => hs.map((x) => (x.id === id ? { ...x, done: !x.done, streak: x.streak + (x.done ? -1 : 1) } : x)));
  const nav = (i: number) => setTab(i);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-4 w-full max-w-full overflow-hidden"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ x: -py * 6, y: px * 8 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <NavCtx.Provider value={nav}>
        <Device tilt={tilt}>
          {tab === 0 && <HomeScreen habits={habits} onToggle={toggle} />}
          {tab === 1 && <HabitScreen />}
          {tab === 3 && <ProgressScreen />}
          {tab === 4 && <SettingsScreen />}
          {tab === 5 && <NewHabitScreen />}
        </Device>
      </NavCtx.Provider>
      {tab !== 0 && (
        <Button variant="ghost" type="button" onClick={() => setTab(0)} className="text-[13.5px] text-faint hover:text-foreground">
          ← Back to Today
        </Button>
      )}
      {tab === 0 && (
        <p className="max-w-[280px] sm:max-w-[360px] px-3 text-center text-[12.5px] leading-snug text-faint">
          <span className="text-ember">Live demo.</span> Tap “Check in”, or a tab below. Sample data only.
        </p>
      )}
    </div>
  );
}

export { INITIAL as DEMO_HABITS };
