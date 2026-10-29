import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Heatmap } from "@/components/habits/Heatmap";
import { HabitIcon, HABIT_ICONS, getIcon } from "@/lib/habits/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BackupPreviewDialog } from "@/components/habits/BackupPreviewDialog";
import { AppLockDialog } from "@/components/habits/AppLockDialog";
import { NotesView } from "@/components/habits/NotesView";
import { HabitSearchFilter, type StatusFilter } from "@/components/habits/HabitSearchFilter";
import { type BackupInspection, createHabit } from "@/lib/habits/logic";
import { DEFAULT_SETTINGS } from "@/lib/habits/types";
import { DailySparkApp } from "@/components/app/DailySparkApp";
import {
  PixelHome,
  PixelCheckList,
  PixelPlus,
  PixelChart,
  PixelSettings,
  PixelCalendar,
  PixelFire,
  PixelStar,
  PixelCheck,
  PixelLock,
  PixelShieldCheck,
  PixelDownload,
  PixelClock,
  PixelSparkles,
  PixelArrowRight,
} from "@/components/ui/pixel-icon";

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
  notes?: string;
  category?: string;
  archived?: boolean;
  starred?: boolean;
}

const INITIAL: DemoHabit[] = [
  { id: "1", name: "Read 20 minutes", icon: "read", color: "fire", streak: 12, done: true, notes: "Chapter 3: How to build good habits.", category: "study", starred: true },
  { id: "2", name: "Drink water", icon: "water", color: "ocean", streak: 31, done: true, notes: "Target 2.5L daily with a pinch of lemon.", category: "health", starred: true },
  { id: "3", name: "Evening walk", icon: "run", color: "forest", streak: 4, done: false, notes: "Gentle 30-min walk after dinner.", category: "health" },
  { id: "4", name: "Meditate", icon: "mindful", color: "purple", streak: 0, done: false, notes: "Calm breathwork practice.", category: "mindfulness" },
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
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${s})`, ...({ "--phone-scale": s } as React.CSSProperties) }}
      >
        {children}
      </div>
    </div>
  );
}

/** Measures the available box so the phone screen can shrink instead of clipping. */
function useAutoWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const next = Math.round(el.clientWidth);
      if (next > 0) setWidth((prev) => (prev === next ? prev : next));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Large hero device with side keys and a soft 3D tilt. */
export function Device({ children, tilt }: { children: React.ReactNode; tilt?: { x: number; y: number } }) {
  const [innerRef, innerWidth] = useAutoWidth<HTMLDivElement>(280);
  return (
    <div
      className="bezel relative w-[285px] sm:w-[310px] max-w-[calc(100vw-2rem)] rounded-[38px] p-2.5 transition-transform duration-500 shadow-2xl"
      style={{ transform: tilt ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined }}
    >
      <span className="absolute -left-[3px] top-[116px] h-[38px] w-[3px] rounded-[3px] bg-neutral-700/80 border-r border-black/40" />
      <span className="absolute -left-[3px] top-[162px] h-[38px] w-[3px] rounded-[3px] bg-neutral-700/80 border-r border-black/40" />
      <span className="absolute -right-[3px] top-[148px] h-[54px] w-[3px] rounded-[3px] bg-neutral-700/80 border-l border-black/40" />
      <div ref={innerRef} className="relative overflow-hidden rounded-[33px] shadow-[inset_0_0_0_1px_oklch(1_0_0/5%)]">
        <span className="pointer-events-none absolute left-1/2 top-2.5 z-40 h-[17px] w-[66px] -translate-x-1/2 rounded-xl bg-background shadow-[inset_0_0_0_1px_oklch(1_0_0/6%)]" />
        <Scaled width={innerWidth}>{children}</Scaled>
      </div>
    </div>
  );
}

/** Small phone for the screens rail. Purely decorative: hidden from AT and inert. */
export function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      inert
      className="bezel relative w-[208px] rounded-[32px] p-[7px] transition-transform duration-300 group-hover:-translate-y-2"
    >
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

interface NavItem {
  id: number;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const NAV: (NavItem | null)[] = [
  { id: 0, label: "Today", Icon: PixelHome },
  { id: 1, label: "Habits", Icon: PixelCheckList },
  null,
  { id: 2, label: "Progress", Icon: PixelChart },
  { id: 3, label: "Settings", Icon: PixelSettings },
];

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
      <div className="nav-float absolute inset-x-3.5 bottom-3.5 z-[6] flex h-[80px] items-center justify-between rounded-full border border-border/40 bg-surface/90 px-3 backdrop-blur-xl">
        {NAV.map((n, idx) =>
          n === null ? (
            <Button
              key="go"
              type="button"
              tabIndex={onNav ? 0 : -1}
              aria-hidden={onNav ? undefined : true}
              aria-label="Add habit"
              onClick={() => onNav?.(4)}
              variant="fab"
              size="fab"
              className="size-13 shrink-0 rounded-full bg-gradient-to-tr from-ember to-heat-4 text-white shadow-[0_4px_18px_rgba(236,137,76,0.35)] border border-ember/30 hover:brightness-110 active:scale-95 flex items-center justify-center p-0 mx-1"
            >
              <PixelPlus className="size-6 text-white" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              key={n.label || idx}
              type="button"
              tabIndex={onNav ? 0 : -1}
              aria-hidden={onNav ? undefined : true}
              onClick={() => onNav?.(n.id)}
              className={cn(
                "flex h-[58px] min-w-0 flex-1 flex-col items-center justify-center gap-[2px] rounded-full p-0 transition-colors",
                active === n.id ? "text-ember font-bold" : "text-faint hover:text-foreground",
              )}
            >
              <span className={cn("grid h-7 w-12 place-items-center rounded-full", active === n.id && "bg-ember-soft")}>
                <n.Icon className="size-5" />
              </span>
              <span className="text-[11px] font-bold">{n.label}</span>
            </Button>
          ),
        )}
      </div>
    </div>
  );
}

const Card = ({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <div onClick={onClick} className={cn("rounded-3xl border-0 bg-surface p-[18px]", className)}>
    {children}
  </div>
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
  const Ghost = next ? getIcon(next.icon) : PixelCheck;
  const week = [4, 4, 3, 4, 2, 4, done];
  return (
    <Screen active={0} onNav={onNav}>
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker">Today</p>
          <p className="text-[19px] font-extrabold">Monday 26 Oct</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-[11px] py-1.5 text-xs font-semibold text-ember">
          <PixelFire className="size-3.5" /> 18
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
            next ? "bg-primary text-primary-foreground font-bold shadow-sm" : "bg-surface-2 text-faint",
          )}
        >
          <PixelCheck className="size-4" /> {next ? "Check in" : "See you tomorrow"}
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
                    full ? "bg-primary text-primary-foreground font-bold" : (week[i] ?? 0) > 0 ? "bg-ember-soft text-ember" : "bg-surface-2",
                    i === 0 && !full && "shadow-[inset_0_0_0_2px_var(--ember)]",
                  )}
                >
                  {full ? <PixelCheck className="size-3.5" /> : <span className="text-[10px] font-extrabold">{week[i]}</span>}
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
                <div className="flex items-center gap-1.5">
                  <p className={cn("break-words font-mono text-[14px] font-semibold", x.done && "text-muted-foreground")}>{x.name}</p>
                  {x.starred && <PixelStar className="size-3.5 fill-gold text-gold shrink-0" />}
                </div>
                <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                  <PixelFire className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                </p>
                <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className={cn("h-full rounded-full bg-gradient-to-r from-ember to-heat-4 transition-[width] duration-500", x.done ? "w-full" : "w-0")} />
                </div>
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
                <PixelCheck className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        tabIndex={onNav ? 0 : -1}
        onClick={() => onNav?.(2)}
        className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 text-left transition-colors hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-ember-soft text-ember">
            <PixelFire className="size-4" />
          </span>
          <div>
            <p className="kicker text-[10px]">Overview</p>
            <p className="font-mono text-sm font-semibold">View 6-Month Activity &amp; Stats</p>
          </div>
        </div>
        <PixelArrowRight className="size-4 text-faint" />
      </button>
    </Screen>
  );
}

export function ProgressScreen({
  onNav,
  initialSubTab = "overview",
}: {
  onNav?: ((i: number) => void) | undefined;
  initialSubTab?: "overview" | "calendar";
}) {
  const [subTab, setSubTab] = useState<"overview" | "calendar">(initialSubTab);

  const sampleRatios = [
    { done: 4, total: 4 }, { done: 3, total: 4 }, { done: 2, total: 4 }, { done: 4, total: 4 },
    { done: 1, total: 4 }, { done: 4, total: 4 }, { done: 3, total: 4 }, { done: 4, total: 4 },
    { done: 0, total: 4 }, { done: 2, total: 4 }, { done: 4, total: 4 }, { done: 3, total: 4 },
    { done: 4, total: 4 }, { done: 4, total: 4 }, { done: 1, total: 4 }, { done: 3, total: 4 },
    { done: 4, total: 4 }, { done: 2, total: 4 }, { done: 4, total: 4 }, { done: 3, total: 4 },
    { done: 4, total: 4 }, { done: 1, total: 4 }, { done: 3, total: 4 }, { done: 4, total: 4 },
    { done: 2, total: 4 }, { done: 2, total: 4 },
  ];

  return (
    <Screen active={2} onNav={onNav}>
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker">Progress &amp; Analytics</p>
          <p className="font-display text-[26px] font-bold leading-tight">
            {subTab === "overview" ? "Insights & Momentum" : "October 2026"}
          </p>
        </div>
        <span className="text-xs font-semibold text-faint">
          {subTab === "overview" ? "412 check-ins" : "Month view"}
        </span>
      </div>

      {/* Segmented Switcher: Overview vs Calendar */}
      <div className="flex rounded-full bg-surface p-1 border border-border/40">
        <button
          type="button"
          onClick={() => setSubTab("overview")}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            subTab === "overview"
              ? "bg-surface-2 text-foreground shadow-sm"
              : "text-faint hover:text-muted-foreground",
          )}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setSubTab("calendar")}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            subTab === "calendar"
              ? "bg-surface-2 text-ember shadow-sm"
              : "text-faint hover:text-muted-foreground",
          )}
        >
          Calendar
        </button>
      </div>

      {subTab === "overview" ? (
        <>
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
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ember to-heat-4"
                        style={{ width: `${[94, 100, 63, 40][i]}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      ) : (
        <>
          <Card>
            <p className="mb-3 text-[17px] font-extrabold">October 2026</p>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[11px] font-semibold text-faint">{d}</span>
              ))}
              {[0, 1, 2].map((i) => <span key={`e${i}`} />)}
              {Array.from({ length: 31 }, (_, i) => {
                const d = i + 1;
                const isFuture = d > 26;
                const isToday = d === 26;
                const ratio = !isFuture ? (sampleRatios[i] ?? { done: 0, total: 4 }) : null;
                let heatClass = "bg-surface-2 text-faint";
                if (!isFuture && ratio && ratio.done > 0) {
                  const pct = ratio.done / ratio.total;
                  if (pct === 1) heatClass = "bg-primary text-primary-foreground font-bold";
                  else if (pct >= 0.5) heatClass = "bg-heat-3 text-white font-medium";
                  else if (pct >= 0.25) heatClass = "bg-heat-2 text-foreground font-medium";
                  else heatClass = "bg-heat-1 text-foreground";
                }
                return (
                  <div
                    key={d}
                    className={cn(
                      "flex flex-col items-center justify-center aspect-square rounded-[10px] p-0.5 text-[11px] transition-all",
                      isFuture ? "text-faint-dim bg-surface-2/40" : heatClass,
                      isToday && "ring-2 ring-ember shadow-sm scale-105",
                    )}
                  >
                    <span className="font-bold leading-none">{d}</span>
                    {!isFuture && ratio ? (
                      <span className="text-[8.5px] font-medium opacity-85 leading-none mt-0.5">
                        {ratio.done}/{ratio.total}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-3.5 space-y-2">
            <p className="font-semibold text-xs text-foreground">Legend</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-surface-2 border border-border/40" />
                <span>0/x — No completions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-heat-1 border border-border/30" />
                <span>1–2/x — Few completions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-heat-3 border border-border/30" />
                <span>3–4/x — Most completions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-primary" />
                <span>x/x — All completed</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="size-2.5 rounded ring-2 ring-ember bg-transparent" />
                <span>Today</span>
              </div>
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
        </>
      )}
    </Screen>
  );
}

export function CalendarScreen({ onNav }: { onNav?: ((i: number) => void) | undefined }) {
  return <ProgressScreen onNav={onNav} initialSubTab="calendar" />;
}

export function HabitScreen({ onNav }: { onNav?: ((i: number) => void) | undefined }) {
  const [subTab, setSubTab] = useState<"habits" | "notes">("habits");
  const [habitsList, setHabitsList] = useState<DemoHabit[]>(INITIAL);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeHabit, setActiveHabit] = useState<DemoHabit | null>(null);

  const displayed = habitsList.filter((h) => {
    if (statusFilter === "active" && h.archived) return false;
    if (statusFilter === "archived" && !h.archived) return false;
    if (statusFilter === "starred" && !h.starred) return false;
    if (categoryFilter && h.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchNotes = h.notes?.toLowerCase().includes(q) ?? false;
      const matchCat = h.category?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchNotes && !matchCat) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(habitsList.map((h) => h.category).filter(Boolean))) as string[];

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <Screen active={1} onNav={onNav}>
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker">Habits &amp; Reflections</p>
          <p className="font-display text-[26px] font-bold leading-tight">
            {subTab === "habits" ? "All Habits" : "Standalone Notes"}
          </p>
        </div>
        <span className="text-xs font-semibold text-faint">
          {subTab === "habits" ? `${displayed.length} habits` : "Reflections"}
        </span>
      </div>

      {/* Subtab Segmented Switcher: Habits vs Standalone Notes */}
      <div className="flex rounded-full bg-surface p-1">
        <button
          type="button"
          onClick={() => {
            setSubTab("habits");
            setActiveHabit(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            subTab === "habits" ? "bg-surface-2 text-foreground shadow-sm" : "text-faint hover:text-muted-foreground",
          )}
        >
          Habits ({habitsList.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setSubTab("notes");
            setActiveHabit(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
            subTab === "notes" ? "bg-surface-2 text-ember shadow-sm" : "text-faint hover:text-muted-foreground",
          )}
        >
          Notes &amp; Journal
        </button>
      </div>

      {subTab === "notes" ? (
        <NotesView />
      ) : activeHabit ? (
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

          {/* Safe Past-Day Fill-in (Phase 2) */}
          <Card className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Past-Day Fill-In</span>
              <span className="text-[11px] text-faint">Yesterday: Sun 25 Oct</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveHabit((prev) => (prev ? { ...prev, streak: prev.streak + 1 } : null));
                setHabitsList((prev) =>
                  prev.map((x) => (x.id === activeHabit.id ? { ...x, streak: x.streak + 1 } : x)),
                );
              }}
              className="w-full text-xs gap-1.5 font-semibold text-ember border-ember/20 hover:bg-ember/10"
            >
              <PixelCheck className="size-3.5 text-ember" /> Complete Missed Yesterday (+1 Streak)
            </Button>
          </Card>

          {/* Phase 2: Per-Streak Notes with Auto-Save and Character Limit */}
          <Card className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Habit Notes &amp; Guidelines</span>
              <span className="text-[11px] text-faint">{(activeHabit.notes?.length ?? 0)} / 1000</span>
            </div>
            <Textarea
              value={activeHabit.notes ?? ""}
              maxLength={1000}
              placeholder="Record guidelines, reflections, or triggers for this habit..."
              onChange={(e) => {
                const val = e.target.value.slice(0, 1000);
                setActiveHabit((prev) => (prev ? { ...prev, notes: val } : null));
                setHabitsList((prev) =>
                  prev.map((x) => (x.id === activeHabit.id ? { ...x, notes: val } : x)),
                );
              }}
              className="min-h-[85px] text-xs resize-none bg-surface-2 border-border text-foreground"
            />
            <p className="text-[10px] text-muted-foreground">Auto-saved offline to device storage.</p>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          <HabitSearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            availableCategories={categories}
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds(new Set());
            }}
            selectedIds={selectedIds}
            onSelectAll={() => setSelectedIds(new Set(displayed.map((h) => h.id)))}
            onDeselectAll={() => setSelectedIds(new Set())}
            onBulkStar={(star) => {
              setHabitsList((hs) =>
                hs.map((h) => (selectedIds.has(h.id) ? { ...h, starred: star } : h)),
              );
              setSelectedIds(new Set());
              setIsSelectionMode(false);
            }}
            onBulkArchive={(archive) => {
              setHabitsList((hs) =>
                hs.map((h) => (selectedIds.has(h.id) ? { ...h, archived: archive } : h)),
              );
              setSelectedIds(new Set());
              setIsSelectionMode(false);
            }}
            onBulkDelete={() => {
              setHabitsList((hs) => hs.filter((h) => !selectedIds.has(h.id)));
              setSelectedIds(new Set());
              setIsSelectionMode(false);
            }}
            filteredCount={displayed.length}
          />

          <div className="space-y-3 pt-1">
            {displayed.length === 0 ? (
              <p className="text-center text-xs py-8 text-faint">No habits match your filters.</p>
            ) : (
              displayed.map((x) => (
                <div
                  key={x.id}
                  className="flex w-full items-center gap-3 rounded-3xl bg-surface p-4 text-left transition-colors hover:bg-surface-2"
                >
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(x.id)}
                      onChange={() => handleToggleSelect(x.id)}
                      className="size-4 accent-primary rounded cursor-pointer shrink-0"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveHabit(x)}
                    className="flex flex-1 items-center gap-3 min-w-0 text-left focus-visible:outline-none"
                  >
                    <HabitIcon habit={h(x)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="break-words font-mono text-[14px] font-semibold">{x.name}</p>
                        {x.starred && <PixelStar className="size-3 fill-gold text-gold shrink-0" />}
                        {x.archived && <span className="text-[10px] text-faint border px-1 rounded">Archived</span>}
                      </div>
                      <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                        <PixelFire className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                        {x.category && <span className="text-[10px] bg-surface-2 px-1.5 py-0.2 rounded-full">#{x.category}</span>}
                      </p>
                    </div>
                    <PixelArrowRight className="size-4 text-faint shrink-0" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}

export function NewHabitScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={-1} onNav={onNav}>
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

export function SettingsScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [autoRolling, setAutoRolling] = useState(true);

  const sampleInspection: BackupInspection = {
    parsed: {
      version: "1",
      habits: [
        {
          ...createHabit({ name: "Read 20 mins", emoji: "📚" }, "2026-10-26"),
          id: "b1",
          currentStreak: 12,
          completedDates: ["2026-10-25", "2026-10-26"],
        },
        {
          ...createHabit({ name: "Morning Run", emoji: "🏃" }, "2026-10-26"),
          id: "b2",
          currentStreak: 5,
          completedDates: ["2026-10-26"],
        },
      ],
      settings: DEFAULT_SETTINGS,
      skipped: 0,
      exportDate: "2026-10-26T12:00:00.000Z",
    },
    preview: {
      version: "1",
      exportDate: "2026-10-26",
      totalStreaks: 4,
      activeCount: 3,
      archivedCount: 1,
      totalCompletions: 48,
      notesCount: 2,
      settings: DEFAULT_SETTINGS,
    },
    notes: [
      {
        id: "sn1",
        title: "Study Log",
        content: "Weekly reflection notes",
        createdAt: "2026-10-26",
        updatedAt: "2026-10-26",
        pinned: true,
      },
    ],
  };

  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Daily Spark</p>
        <p className="font-display text-[26px] font-bold leading-tight">Settings</p>
      </div>

      {/* Backup Safety Alert matching DailySparkApp */}
      <div className="rounded-2xl border border-border/80 bg-surface-2 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
        <PixelShieldCheck className="size-4 shrink-0 text-ember mt-0.5" />
        <p>
          <strong className="font-semibold text-foreground">Keep your backup file safe.</strong> It contains your complete streak history, notes, and local settings.
        </p>
      </div>

      <div>
        <p className="kicker mb-2.5">Your data &amp; Backups</p>
        <Card className="px-4 py-1">
          <button
            type="button"
            className="flex w-full items-center gap-3 border-b border-border py-3 text-left focus-visible:outline-none"
          >
            <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember">
              <PixelDownload className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">Export backup</p>
              <p className="text-[11.5px] font-semibold text-faint">Includes habits and notes (.json)</p>
            </div>
            <PixelArrowRight className="size-4 text-faint" />
          </button>

          <button
            type="button"
            onClick={() => setBackupDialogOpen(true)}
            className="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-none"
          >
            <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember">
              <PixelDownload className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">Inspect &amp; Restore file</p>
              <p className="text-[11.5px] font-semibold text-faint">Safe pre-validation preview</p>
            </div>
            <PixelArrowRight className="size-4 text-faint" />
          </button>
        </Card>
      </div>

      <div>
        <p className="kicker mb-2.5">Safety &amp; Local History</p>
        <Card className="flex items-center justify-between px-4 py-3">
          <div className="pr-2">
            <p className="text-[14px] font-bold">Auto local snapshots</p>
            <p className="text-[11.5px] font-semibold text-faint">Stores rolling 7-day backups</p>
          </div>
          <Switch checked={autoRolling} onCheckedChange={setAutoRolling} />
        </Card>
      </div>

      <div>
        <p className="kicker mb-2.5">Privacy &amp; Security</p>
        <Card
          onClick={() => setLockDialogOpen(true)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember">
            <PixelLock className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-bold">App Lock &amp; PIN</p>
            <p className="text-[11.5px] font-semibold text-faint">SHA-256 protected with 5-min timeout</p>
          </div>
          <PixelArrowRight className="size-4 text-faint" />
        </Card>
      </div>

      <div>
        <p className="kicker mb-2.5">Reminders</p>
        <Card className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-ember-soft text-ember">
                <PixelClock className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold">Daily Reminders</p>
                <p className="text-[11px] text-faint">Get reminded to complete streaks</p>
              </div>
            </div>
            <Switch checked={true} />
          </div>

          <div className="flex items-center justify-between border-t border-border/30 pt-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-surface-2 text-faint">
                <PixelClock className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold">Pre-task Reminder</p>
                <p className="text-[11px] text-faint">Notify before scheduled time</p>
              </div>
            </div>
            <span className="rounded-xl border border-border/50 bg-surface-2 px-2 py-1 text-[11px] font-medium text-foreground">
              5 mins before
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/30 pt-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-surface-2 text-ember">
                <PixelFire className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold">Today Focus Mode</p>
                <p className="text-[11px] text-faint">Show only today's tasks</p>
              </div>
            </div>
            <Switch checked={false} />
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-3 px-4 py-3">
        <PixelSparkles className="size-4 text-ember shrink-0" />
        <span className="text-[13px] font-semibold text-muted-foreground">Daily Spark · No account · No ads · 100% offline</span>
      </Card>

      <BackupPreviewDialog
        open={backupDialogOpen}
        onOpenChange={setBackupDialogOpen}
        inspection={sampleInspection}
        onConfirmRestore={() => {
          setBackupDialogOpen(false);
        }}
      />

      <AppLockDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Hero demo                                                           */
/* ------------------------------------------------------------------ */

export function DemoPhone() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      id="demo-phone"
      className="flex flex-col items-center gap-4 w-full max-w-full"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ x: -py * 5, y: px * 6 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <Device tilt={tilt}>
        <DailySparkApp embedded />
      </Device>
      <p className="max-w-[280px] sm:max-w-[360px] px-3 text-center text-[12.5px] leading-snug text-faint">
        <span className="text-ember font-bold">Interactive live app.</span> Tap habits, start focus timer, track laps, or check progress. 100% offline.
      </p>
    </div>
  );
}

export { INITIAL as DEMO_HABITS };
