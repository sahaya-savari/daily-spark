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
import { THEME_CONFIGS } from "@/lib/habits/appearance";
import {
  CalendarCheck2,
  CheckSquare,
  Plus,
  BarChart3,
  Settings,
  Calendar,
  Flame,
  Star,
  Check,
  Lock,
  ShieldCheck,
  Download,
  Clock,
  Sparkles,
  ArrowRight,
  Palette,
  Sliders,
  Database,
  QrCode,
  Smartphone,
  ListTodo,
  Bell,
} from "lucide-react";

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

/** Large hero device with side keys and a soft 3D tilt, inspired by GymMane hardware styling. */
export function Device({ children, tilt }: { children: React.ReactNode; tilt?: { x: number; y: number } }) {
  const [innerRef, innerWidth] = useAutoWidth<HTMLDivElement>(280);
  return (
    <div
      className="relative w-[285px] sm:w-[320px] md:w-[340px] max-w-[calc(100vw-2rem)] rounded-[46px] p-[10px] transition-transform duration-500 shadow-2xl"
      style={{
        background: "linear-gradient(155deg, #3a3a3a 0%, #121212 26%, #0b0b0b 62%, #2c2c2c 100%)",
        boxShadow: "0 60px 90px -40px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06), inset 0 0 0 1px rgba(0,0,0,.6)",
        transform: tilt ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
      }}
    >
      <span className="absolute -left-[3px] top-[132px] h-[42px] w-[3px] rounded-[3px] bg-gradient-to-b from-[#3a3a3a] to-[#151515]" />
      <span className="absolute -left-[3px] top-[184px] h-[42px] w-[3px] rounded-[3px] bg-gradient-to-b from-[#3a3a3a] to-[#151515]" />
      <span className="absolute -right-[3px] top-[168px] h-[62px] w-[3px] rounded-[3px] bg-gradient-to-b from-[#3a3a3a] to-[#151515]" />
      <div ref={innerRef} className="relative overflow-hidden rounded-[37px] bg-[#0A0A0A] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <span className="pointer-events-none absolute left-1/2 top-3 z-40 h-[19px] w-[74px] -translate-x-1/2 rounded-[12px] bg-[#000] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
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
      className="relative w-[208px] rounded-[36px] p-[8px] transition-transform duration-300 group-hover:-translate-y-2"
      style={{
        background: "linear-gradient(155deg, #3a3a3a 0%, #121212 26%, #0b0b0b 62%, #2c2c2c 100%)",
        boxShadow: "0 40px 62px -34px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06)",
      }}
    >
      <span className="absolute left-1/2 top-[9px] z-10 h-[13px] w-[52px] -translate-x-1/2 rounded-[9px] bg-[#000] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
      <div className="overflow-hidden rounded-[29px] bg-[#0A0A0A]">
        <Scaled width={194}>{children}</Scaled>
      </div>
    </div>
  );
}

export function DesktopPreview() {
  const sampleHabits = [
    { name: "Read 20 minutes", detail: "Study · 12 day streak", done: true },
    { name: "Drink water", detail: "Health · 7 day streak", done: true },
    { name: "Evening walk", detail: "Health · 4 day streak", done: false },
    { name: "Meditate", detail: "Mindfulness · New habit", done: false },
  ];
  const navItems = [
    { label: "Today", Icon: CalendarCheck2, active: true },
    { label: "Habits", Icon: CheckSquare, active: false },
    { label: "Progress & Stats", Icon: BarChart3, active: false },
    { label: "Settings", Icon: Settings, active: false },
  ];

  return (
    <div
      role="img"
      aria-label="Illustrative desktop workspace with a sidebar, daily habit list, and weekly progress panel"
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1016] shadow-2xl"
    >
      <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-[#11141B] px-4 text-xs text-[#A0A6B4]">
        <span className="size-2.5 rounded-full bg-[#EC6A5E]" />
        <span className="size-2.5 rounded-full bg-[#F4BF4F]" />
        <span className="size-2.5 rounded-full bg-[#61C554]" />
        <span className="ml-3 font-medium">Daily Spark · Desktop workspace</span>
      </div>
      <div className="grid min-h-[400px] grid-cols-[150px_minmax(0,1fr)_220px]">
        <aside className="flex flex-col justify-between border-r border-white/10 bg-[#11141B] p-4">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-ember/15 text-ember">
                <Sparkles aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Daily Spark</p>
                <p className="text-[10px] text-[#8A92A3]">Calm &amp; Offline</p>
              </div>
            </div>
            <nav aria-label="Preview desktop navigation" className="space-y-1.5">
              {navItems.map(({ label, Icon, active }) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold",
                    active ? "bg-ember text-white" : "text-[#A0A6B4]",
                  )}
                >
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </nav>
            <div className="mt-4 rounded-lg border border-ember/25 bg-ember/10 px-2.5 py-2 text-center text-[11px] font-bold text-ember">
              + New habit
            </div>
          </div>
          <p className="border-t border-white/10 pt-3 text-[10px] text-[#8A92A3]">
            Sample data · not a real account
          </p>
        </aside>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A92A3]">Today</p>
              <h3 className="mt-1 text-xl font-bold text-white">Today’s habits</h3>
            </div>
            <div className="rounded-full border border-ember/25 bg-ember/10 px-3 py-1.5 text-[11px] font-semibold text-ember">
              2 of 4 completed
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#151922] p-3">
              <p className="text-[10px] font-semibold text-[#8A92A3]">CURRENT STREAK</p>
              <p className="mt-1 text-lg font-bold text-white">12 days</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#151922] p-3">
              <p className="text-[10px] font-semibold text-[#8A92A3]">WEEKLY PROGRESS</p>
              <p className="mt-1 text-lg font-bold text-white">78%</p>
            </div>
          </div>

          <section aria-label="Sample daily habits" className="mt-5 space-y-2.5">
            {sampleHabits.map(({ name, detail, done }) => (
              <div
                key={name}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#151922] px-3 py-2.5"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border",
                    done ? "border-ember bg-ember text-[#111318]" : "border-white/20 text-transparent",
                  )}
                >
                  <Check aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{name}</p>
                  <p className="truncate text-[10px] text-[#8A92A3]">{detail}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="border-l border-white/10 bg-[#11141B] p-4">
          <h3 className="text-sm font-bold text-white">This week</h3>
          <p className="mt-1 text-[10px] text-[#8A92A3]">Your steady progress</p>
          <div className="mt-5 flex h-28 items-end justify-between gap-2">
            {[42, 64, 54, 80, 68, 92, 75].map((height, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span
                  className={cn("w-full rounded-t-sm", index === 5 ? "bg-ember" : "bg-ember/45")}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[9px] text-[#8A92A3]">{["S", "M", "T", "W", "T", "F", "S"][index]}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-[#151922] p-3">
            <p className="text-[10px] font-semibold text-[#8A92A3]">BEST STREAK</p>
            <p className="mt-1 text-base font-bold text-white">31 days</p>
          </div>
        </aside>
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
  { id: 0, label: "Today", Icon: CalendarCheck2 },
  { id: 1, label: "Habits", Icon: CheckSquare },
  null,
  { id: 2, label: "Progress", Icon: BarChart3 },
  { id: 3, label: "Settings", Icon: Settings },
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
              style={{ boxShadow: "0 4px 22px var(--ember-glow)" }}
              className="size-13 shrink-0 rounded-full bg-gradient-to-tr from-ember to-heat-4 text-white border border-ember/30 hover:brightness-110 active:scale-95 flex items-center justify-center p-0 mx-1"
            >
              <Plus className="size-6 text-white" strokeWidth={2.5} />
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
            next ? "bg-primary text-primary-foreground font-bold shadow-sm" : "bg-surface-2 text-faint",
          )}
        >
          <Check className="size-4" strokeWidth={2.5} /> {next ? "Check in" : "See you tomorrow"}
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
                  {full ? <Check className="size-3.5" strokeWidth={2.5} /> : <span className="text-[10px] font-extrabold">{week[i]}</span>}
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
                  {x.starred && <Star className="size-3.5 fill-gold text-gold shrink-0" />}
                </div>
                <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                  <Flame className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                </p>
                <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className={cn("h-full rounded-full bg-gradient-to-r from-ember to-heat-4 transition-[width] duration-500", x.done ? "w-full" : "w-0")} />
                </div>
              </div>
              <Button variant="ghost"
                type="button"
                tabIndex={onToggle ? 0 : -1}
                aria-label={x.done ? `Mark ${x.name} incomplete for today` : `Mark ${x.name} complete for today`}
                aria-pressed={x.done}
                onClick={() => onToggle?.(x.id)}
                className={cn(
                  "check-orb grid size-12 shrink-0 place-items-center rounded-full p-0",
                  x.done ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-surface-2 text-faint",
                )}
              >
                <Check className="size-4" strokeWidth={2.5} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Card className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker">Optional</p>
            <p className="text-[16px] font-extrabold">Day planner</p>
          </div>
          <ListTodo className="size-5 text-ember" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 p-2.5 text-[12px]">
          <CheckSquare className="size-4 text-ember" />
          <span className="flex-1">Pack a lunch</span>
          <span className="text-faint">Done</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 p-2.5 text-[12px]">
          <span className="size-4 rounded border border-border" />
          <span className="flex-1">Read before bed</span>
          <span className="text-faint">Edit</span>
        </div>
      </Card>

      <button
        type="button"
        tabIndex={onNav ? 0 : -1}
        onClick={() => onNav?.(2)}
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
        <ArrowRight className="size-4 text-faint" />
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
                  else if (pct >= 0.5) heatClass = "bg-heat-3 text-[var(--ember-foreground,#FFFFFF)] font-medium";
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
              <Check className="size-3.5 text-ember" strokeWidth={2.5} /> Complete Missed Yesterday (+1 Streak)
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
                        {x.starred && <Star className="size-3 fill-gold text-gold shrink-0" />}
                        {x.archived && <span className="text-[10px] text-faint border px-1 rounded">Archived</span>}
                      </div>
                      <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                        <Flame className={cn("size-3", x.streak > 0 && "text-ember")} /> {x.streak} days
                        {x.category && <span className="text-[10px] bg-surface-2 px-1.5 py-0.2 rounded-full">#{x.category}</span>}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-faint shrink-0" />
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
  const [selectedIcon, setSelectedIcon] = useState("run");
  const [selectedColor, setSelectedColor] = useState("fire");

  const colors = [
    { id: "fire", hex: "#EC894C", label: "Fire" },
    { id: "gold", hex: "#F59E0B", label: "Gold" },
    { id: "forest", hex: "#4ADE80", label: "Forest" },
    { id: "ocean", hex: "#38BDF8", label: "Ocean" },
    { id: "purple", hex: "#8B5CF6", label: "Violet" },
    { id: "rose", hex: "#FB7185", label: "Rose" },
  ];

  const activeColorHex = colors.find((c) => c.id === selectedColor)?.hex || "#EC894C";

  return (
    <Screen active={-1} onNav={onNav}>
      <div>
        <p className="kicker">New habit</p>
        <p className="font-display text-[26px] font-bold leading-tight">What will you show up for?</p>
      </div>
      <div className="flex h-12 items-center rounded-2xl border-0 bg-surface-2 px-4 text-[15px] font-semibold text-foreground">
        <span>Stretch 10 minutes</span>
        <span className="ml-0.5 h-5 w-px pulse-dot" style={{ backgroundColor: activeColorHex }} />
      </div>
      <div className="flex rounded-xl bg-surface p-1 text-[11px] font-bold">
        <span className="flex-1 rounded-lg bg-surface-2 py-2 text-center">Quick</span>
        <span className="flex-1 py-2 text-center text-faint">Schedule</span>
        <span className="flex-1 py-2 text-center text-faint">Advanced</span>
      </div>
      <Card className="p-3.5 space-y-3">
        <div>
          <p className="kicker mb-2">Habit icon · {HABIT_ICONS.find(({ key }) => key === selectedIcon)?.label}</p>
          <div className="grid grid-cols-6 gap-1.5">
            {HABIT_ICONS.map(({ key, label, Icon }) => {
              const isSelected = selectedIcon === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedIcon(key)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-[12px] transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface-2 shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
                  )}
                  style={{
                    color: isSelected ? activeColorHex : undefined,
                    boxShadow: isSelected ? `inset 0 0 0 1.5px ${activeColorHex}` : undefined,
                  }}
                >
                  <Icon className="size-5" strokeWidth={1.9} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div>
          <p className="kicker mb-2">Color</p>
          <div className="flex items-center justify-between gap-1.5 px-0.5">
            {colors.map((c) => {
              const isSelected = selectedColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  aria-label={c.label}
                  className={cn(
                    "size-7.5 rounded-full transition-transform cursor-pointer flex items-center justify-center",
                    isSelected
                      ? "scale-115 ring-2 ring-white ring-offset-2 ring-offset-surface shadow-md"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="size-3 text-black stroke-[3.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-extrabold text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
        style={{
          backgroundColor: activeColorHex,
          boxShadow: `0 4px 20px ${activeColorHex}55`,
        }}
      >
        Add habit
      </button>
    </Screen>
  );
}

export function PlannerScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={0} onNav={onNav}>
      <div>
        <p className="kicker">Today</p>
        <p className="font-display text-[26px] font-bold leading-tight">Day planner</p>
      </div>
      <Card className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold">Today</span>
          <span className="text-[11px] text-faint">2 tasks</span>
        </div>
        <div className="flex items-center gap-2 border-t border-border/40 pt-2.5 text-[12px]">
          <CheckSquare className="size-4 text-ember" />
          <span className="flex-1">Plan the week</span>
          <span className="text-faint">Done</span>
        </div>
        <div className="flex items-center gap-2 border-t border-border/40 pt-2.5 text-[12px]">
          <span className="size-4 rounded border border-border" />
          <span className="flex-1">Read 20 minutes</span>
          <span className="text-faint">Edit</span>
        </div>
        <Button type="button" variant="outline" className="w-full">Add task</Button>
      </Card>
      <Card className="space-y-2">
        <p className="text-[13px] font-bold">Task details</p>
        <p className="text-[11px] text-muted-foreground">Set a due date and optionally link a routine.</p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">Due date · Routine</div>
      </Card>
      <Card className="space-y-2">
        <p className="text-[13px] font-bold">Upcoming</p>
        <p className="rounded-xl bg-surface-2 p-2.5 text-[11px]">Review notes · Tomorrow</p>
      </Card>
    </Screen>
  );
}

export function ScheduleScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={-1} onNav={onNav}>
      <div>
        <p className="kicker">New habit · Schedule</p>
        <p className="font-display text-[26px] font-bold leading-tight">Choose a rhythm</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Every day", "Weekly goal", "Selected days"].map((item, index) => (
          <div key={item} className={cn("rounded-xl border p-2 text-center text-[10px] font-bold", index === 1 ? "border-ember bg-ember-soft text-ember" : "border-border bg-surface text-muted-foreground")}>
            {item}
          </div>
        ))}
      </div>
      <Card className="space-y-3">
        <p className="kicker">Tracking type</p>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-[13px] font-bold">Quantitative</p>
          <p className="text-[11px] text-muted-foreground">Target · units · step size</p>
        </div>
        <div className="flex justify-between rounded-xl bg-surface-2 p-3 text-[11px]">
          <span>Goal</span><strong>3 days per week</strong>
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="kicker">Advanced options</p>
        <p className="text-[12px]">Subtasks · notes · reminders</p>
      </Card>
      <p className="text-center text-[11px] text-faint">Simple setup stays available in Quick.</p>
    </Screen>
  );
}

export function SettingsScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  const categories = [
    { title: "Appearance", Icon: Palette, detail: "Themes and typography" },
    { title: "Preferences", Icon: Sliders, detail: "Reminders and planner" },
    { title: "Privacy & Security", Icon: Lock, detail: "PIN or biometrics" },
    { title: "Data & Backups", Icon: Database, detail: "Export and restore" },
    { title: "Device Transfer", Icon: QrCode, detail: "Offline transfer" },
    { title: "About & Support", Icon: Sparkles, detail: "Version and widgets" },
  ];

  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Daily Spark</p>
        <p className="font-display text-[26px] font-bold leading-tight">Settings</p>
      </div>
      <Card className="space-y-2.5 p-3">
        {categories.map(({ title, Icon, detail }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
            <Icon className="size-4 shrink-0 text-ember" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold">{title}</p>
              <p className="text-[10px] text-faint">{detail}</p>
            </div>
            <ArrowRight className="size-3.5 text-faint" />
          </div>
        ))}
      </Card>
      <p className="text-center text-[11px] text-faint">Open a category to see its settings.</p>
    </Screen>
  );
}

export function PreferencesScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Preferences</p>
        <p className="font-display text-[26px] font-bold leading-tight">Your daily rhythm</p>
      </div>
      <Card className="space-y-3 p-3.5">
        <div className="flex items-center gap-2.5">
          <Bell className="size-4 text-ember" />
          <div className="flex-1">
            <p className="text-[12px] font-bold">Daily reminders</p>
            <p className="text-[10px] text-faint">Set a time and pre-task notice</p>
          </div>
          <span className="rounded-full bg-ember-soft px-2 py-1 text-[10px] font-bold text-ember">On</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px]">
          <span>Pre-task reminder</span><strong>5 minutes</strong>
        </div>
      </Card>
      <Card className="space-y-3 p-3.5">
        <p className="text-[12px] font-bold">Today &amp; calendar</p>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Day planner</span><strong className="text-ember">On</strong>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Completed habits</span><strong>Move to bottom</strong>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Week starts</span><strong>Monday</strong>
        </div>
      </Card>
      <Card className="space-y-2 p-3.5">
        <p className="text-[12px] font-bold">Focus &amp; quiet hours</p>
        <p className="text-[11px] text-muted-foreground">Daily focus goal · Mute completed reminders · Quiet hours</p>
      </Card>
    </Screen>
  );
}

export function BackupScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Data &amp; Backups</p>
        <p className="font-display text-[26px] font-bold leading-tight">Your data, your choice</p>
      </div>
      <Card className="space-y-2.5 p-3.5">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-ember" />
          <div><p className="text-[13px] font-bold">Export backup</p><p className="text-[10px] text-faint">JSON · CSV · TSV · Markdown · Vault</p></div>
        </div>
        <div className="flex items-center gap-3 border-t border-border/40 pt-2.5">
          <ShieldCheck className="size-5 text-ember" />
          <div><p className="text-[13px] font-bold">Inspect &amp; restore</p><p className="text-[10px] text-faint">Preview, then Merge or Replace</p></div>
        </div>
      </Card>
      <Card className="space-y-2.5 p-3.5">
        <p className="text-[13px] font-bold">Local snapshots</p>
        <p className="text-[11px] text-muted-foreground">Automatic rolling history · up to 7 days</p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">Saved on this device</div>
      </Card>
      <Card className="space-y-2.5 p-3.5">
        <p className="text-[13px] font-bold">Portable folder backups · Android</p>
        <p className="text-[11px] text-muted-foreground">Choose a folder · Daily or weekly · Back up now</p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">Disconnect folder is available when connected.</div>
      </Card>
    </Screen>
  );
}

export function DeviceTransferScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Device Transfer</p>
        <p className="font-display text-[26px] font-bold leading-tight">Move data privately</p>
      </div>
      <Card className="space-y-3 p-4">
        <div className="grid size-11 place-items-center rounded-xl bg-ember-soft text-ember"><QrCode className="size-5" /></div>
        <div>
          <p className="text-[14px] font-bold">Air-Gapped QR Transfer</p>
          <p className="text-[11px] text-muted-foreground">Transfer encrypted records without a network connection.</p>
        </div>
        <Button type="button" variant="outline" className="w-full">Open QR transfer</Button>
      </Card>
      <Card className="space-y-3 p-4">
        <div className="grid size-11 place-items-center rounded-xl bg-ember-soft text-ember"><Sparkles className="size-5" /></div>
        <div>
          <p className="text-[14px] font-bold">Encrypted Peer Vault Sync</p>
          <p className="text-[11px] text-muted-foreground">Exchange encrypted vault files between devices.</p>
        </div>
        <Button type="button" variant="outline" className="w-full">Open vault sync</Button>
      </Card>
      <p className="text-center text-[11px] text-faint">No account or cloud service required.</p>
    </Screen>
  );
}

export function WidgetsScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">About Daily Spark · Android</p>
        <p className="font-display text-[26px] font-bold leading-tight">Home screen widgets</p>
      </div>
      <Card className="space-y-3 p-3.5">
        {[
          ["Today", "Upcoming habits and current streak"],
          ["Streak", "Current streak at a glance"],
          ["Heatmap", "Recent activity in theme colors"],
        ].map(([title, detail]) => (
          <div key={title} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <Smartphone className="size-5 shrink-0 text-ember" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold">{title}</p>
              <p className="text-[10px] text-faint">{detail}</p>
            </div>
            <span className="text-[10px] font-bold text-ember">Add</span>
          </div>
        ))}
      </Card>
      <Button type="button" variant="outline" className="w-full">Refresh widgets</Button>
      <p className="text-center text-[11px] text-faint">Launcher confirmation or widget picker.</p>
    </Screen>
  );
}

export function SettingsDetailsScreen({ onNav }: { onNav?: ((i: number) => void) | undefined } = {}) {
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
        <ShieldCheck className="size-4 shrink-0 text-ember mt-0.5" />
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
              <Download className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">Export backup</p>
              <p className="text-[11.5px] font-semibold text-faint">Includes habits and notes (.json)</p>
            </div>
            <ArrowRight className="size-4 text-faint" />
          </button>

          <button
            type="button"
            onClick={() => setBackupDialogOpen(true)}
            className="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-none"
          >
            <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember">
              <Download className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">Inspect &amp; Restore file</p>
              <p className="text-[11.5px] font-semibold text-faint">Safe pre-validation preview</p>
            </div>
            <ArrowRight className="size-4 text-faint" />
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
            <Lock className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-bold">App Lock &amp; PIN</p>
            <p className="text-[11.5px] font-semibold text-faint">PIN or biometrics · background lock</p>
          </div>
          <ArrowRight className="size-4 text-faint" />
        </Card>
      </div>

      <div>
        <p className="kicker mb-2.5">Reminders</p>
        <Card className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-ember-soft text-ember">
                <Clock className="size-4" />
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
                <Clock className="size-4" />
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
                <Flame className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold">Day planner</p>
                <p className="text-[11px] text-faint">Optional tasks alongside habits</p>
              </div>
            </div>
            <Switch checked={false} />
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-3 px-4 py-3">
        <Sparkles className="size-4 text-ember shrink-0" />
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
  const [activeTab, setActiveTab] = useState(0);
  const [demoHabits, setDemoHabits] = useState(INITIAL);
  const ref = useRef<HTMLDivElement>(null);
  const currentConfig = THEME_CONFIGS.minimal;
  const onNav = (tab: number) => setActiveTab(tab);
  const onToggle = (id: string) => {
    setDemoHabits((habits) =>
      habits.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit,
      ),
    );
  };

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
        <div
          className="theme-minimal h-full w-full"
          style={{
            "--ember": currentConfig.accent,
            "--primary": currentConfig.accent,
            "--ember-soft": currentConfig.soft,
            "--ember-glow": currentConfig.glow,
            "--heat-0": currentConfig.heat[0],
            "--heat-1": currentConfig.heat[1],
            "--heat-2": currentConfig.heat[2],
            "--heat-3": currentConfig.heat[3],
            "--heat-4": currentConfig.heat[4],
          } as React.CSSProperties}
        >
          {activeTab === 0 && <HomeScreen habits={demoHabits} onToggle={onToggle} onNav={onNav} />}
          {activeTab === 1 && <HabitScreen onNav={onNav} />}
          {activeTab === 2 && <ProgressScreen onNav={onNav} />}
          {activeTab === 3 && <SettingsScreen onNav={onNav} />}
          {activeTab === 4 && <NewHabitScreen onNav={onNav} />}
        </div>
      </Device>
      <p className="max-w-[280px] sm:max-w-[360px] px-3 text-center text-[12.5px] leading-snug text-faint">
        <span className="text-ember font-bold">Interactive sample preview.</span> Explore screens and tap sample habits; this preview never reads or changes your data.
      </p>
    </div>
  );
}

export { INITIAL as DEMO_HABITS };
