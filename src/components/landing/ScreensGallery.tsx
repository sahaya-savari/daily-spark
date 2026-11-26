import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckSquare,
  Clock,
  Download,
  Flame,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { type BackupInspection, createHabit } from "@/lib/habits/logic";
import { DEFAULT_SETTINGS } from "@/lib/habits/types";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { useReveal } from "@/hooks/use-reveal";
import {
  Card,
  CalendarScreen,
  DEMO_HABITS,
  DesktopPreview,
  HabitScreen,
  HomeScreen,
  MiniPhone,
  NewHabitScreen,
  ProgressScreen,
  Screen,
  SettingsScreen,
} from "@/components/landing/DemoPhone";

const BackupPreviewDialog = lazy(() =>
  import("@/components/habits/BackupPreviewDialog").then(
    ({ BackupPreviewDialog: Dialog }) => ({ default: Dialog }),
  ),
);
const AppLockDialog = lazy(() =>
  import("@/components/habits/AppLockDialog").then(
    ({ AppLockDialog: Dialog }) => ({ default: Dialog }),
  ),
);

function PlannerScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={0} onNav={onNav}>
      <div>
        <p className="kicker">Today</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Day planner
        </p>
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
        <Button type="button" variant="outline" className="w-full">
          Add task
        </Button>
      </Card>
      <Card className="space-y-2">
        <p className="text-[13px] font-bold">Task details</p>
        <p className="text-[11px] text-muted-foreground">
          Set a due date and optionally link a routine.
        </p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">
          Due date · Routine
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="text-[13px] font-bold">Upcoming</p>
        <p className="rounded-xl bg-surface-2 p-2.5 text-[11px]">
          Review notes · Tomorrow
        </p>
      </Card>
    </Screen>
  );
}

function ScheduleScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={-1} onNav={onNav}>
      <div>
        <p className="kicker">New habit · Schedule</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Choose a rhythm
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Every day", "Weekly goal", "Selected days"].map((item, index) => (
          <div
            key={item}
            className={cn(
              "rounded-xl border p-2 text-center text-[10px] font-bold",
              index === 1
                ? "border-ember bg-ember-soft text-ember"
                : "border-border bg-surface text-muted-foreground",
            )}
          >
            {item}
          </div>
        ))}
      </div>
      <Card className="space-y-3">
        <p className="kicker">Tracking type</p>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-[13px] font-bold">Quantitative</p>
          <p className="text-[11px] text-muted-foreground">
            Target · units · step size
          </p>
        </div>
        <div className="flex justify-between rounded-xl bg-surface-2 p-3 text-[11px]">
          <span>Goal</span>
          <strong>3 days per week</strong>
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="kicker">Advanced options</p>
        <p className="text-[12px]">Subtasks · notes · reminders</p>
      </Card>
      <p className="text-center text-[11px] text-faint">
        Simple setup stays available in Quick.
      </p>
    </Screen>
  );
}

function PreferencesScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Preferences</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Your daily rhythm
        </p>
      </div>
      <Card className="space-y-3 p-3.5">
        <div className="flex items-center gap-2.5">
          <Bell className="size-4 text-ember" />
          <div className="flex-1">
            <p className="text-[12px] font-bold">Daily reminders</p>
            <p className="text-[10px] text-faint">
              Set a time and pre-task notice
            </p>
          </div>
          <span className="rounded-full bg-ember-soft px-2 py-1 text-[10px] font-bold text-ember">
            On
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px]">
          <span>Pre-task reminder</span>
          <strong>5 minutes</strong>
        </div>
      </Card>
      <Card className="space-y-3 p-3.5">
        <p className="text-[12px] font-bold">Today &amp; calendar</p>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Day planner</span>
          <strong className="text-ember">On</strong>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Completed habits</span>
          <strong>Move to bottom</strong>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-2 p-2.5 text-[11px]">
          <span>Week starts</span>
          <strong>Monday</strong>
        </div>
      </Card>
      <Card className="space-y-2 p-3.5">
        <p className="text-[12px] font-bold">Focus &amp; quiet hours</p>
        <p className="text-[11px] text-muted-foreground">
          Daily focus goal · Mute completed reminders · Quiet hours
        </p>
      </Card>
    </Screen>
  );
}

function BackupScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Data &amp; Backups</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Your data, your choice
        </p>
      </div>
      <Card className="space-y-2.5 p-3.5">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-ember" />
          <div>
            <p className="text-[13px] font-bold">Export backup</p>
            <p className="text-[10px] text-faint">
              JSON · CSV · TSV · Markdown · Vault
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border/40 pt-2.5">
          <ShieldCheck className="size-5 text-ember" />
          <div>
            <p className="text-[13px] font-bold">Inspect &amp; restore</p>
            <p className="text-[10px] text-faint">
              Preview, then Merge or Replace
            </p>
          </div>
        </div>
      </Card>
      <Card className="space-y-2.5 p-3.5">
        <p className="text-[13px] font-bold">Local snapshots</p>
        <p className="text-[11px] text-muted-foreground">
          Automatic rolling history · up to 7 days
        </p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">
          Saved on this device
        </div>
      </Card>
      <Card className="space-y-2.5 p-3.5">
        <p className="text-[13px] font-bold">
          Portable folder backups · Android
        </p>
        <p className="text-[11px] text-muted-foreground">
          Choose a folder · Daily or weekly · Back up now
        </p>
        <div className="rounded-xl bg-surface-2 p-2.5 text-[11px]">
          Disconnect folder is available when connected.
        </div>
      </Card>
    </Screen>
  );
}

function DeviceTransferScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">Settings · Device Transfer</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Move data privately
        </p>
      </div>
      <Card className="space-y-3 p-4">
        <div className="grid size-11 place-items-center rounded-xl bg-ember-soft text-ember">
          <QrCode className="size-5" />
        </div>
        <div>
          <p className="text-[14px] font-bold">Air-Gapped QR Transfer</p>
          <p className="text-[11px] text-muted-foreground">
            Transfer encrypted records without a network connection.
          </p>
        </div>
        <Button type="button" variant="outline" className="w-full">
          Open QR transfer
        </Button>
      </Card>
      <Card className="space-y-3 p-4">
        <div className="grid size-11 place-items-center rounded-xl bg-ember-soft text-ember">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-[14px] font-bold">Encrypted Peer Vault Sync</p>
          <p className="text-[11px] text-muted-foreground">
            Exchange encrypted vault files between devices.
          </p>
        </div>
        <Button type="button" variant="outline" className="w-full">
          Open vault sync
        </Button>
      </Card>
      <p className="text-center text-[11px] text-faint">
        No account or cloud service required.
      </p>
    </Screen>
  );
}

function WidgetsScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
  return (
    <Screen active={3} onNav={onNav}>
      <div>
        <p className="kicker">About Daily Spark · Android</p>
        <p className="font-display text-[26px] font-bold leading-tight">
          Home screen widgets
        </p>
      </div>
      <Card className="space-y-3 p-3.5">
        {[
          ["Today", "Upcoming habits and current streak"],
          ["Streak", "Current streak at a glance"],
          ["Heatmap", "Recent activity in theme colors"],
        ].map(([title, detail]) => (
          <div
            key={title}
            className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
          >
            <Smartphone className="size-5 shrink-0 text-ember" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold">{title}</p>
              <p className="text-[10px] text-faint">{detail}</p>
            </div>
            <span className="text-[10px] font-bold text-ember">Add</span>
          </div>
        ))}
      </Card>
      <Button type="button" variant="outline" className="w-full">
        Refresh widgets
      </Button>
      <p className="text-center text-[11px] text-faint">
        Launcher confirmation or widget picker.
      </p>
    </Screen>
  );
}

function SettingsDetailsScreen({
  onNav,
}: { onNav?: ((i: number) => void) | undefined } = {}) {
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
        <p className="font-display text-[26px] font-bold leading-tight">
          Settings
        </p>
      </div>

      {/* Backup Safety Alert matching DailySparkApp */}
      <div className="rounded-2xl border border-border/80 bg-surface-2 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-ember mt-0.5" />
        <p>
          <strong className="font-semibold text-foreground">
            Keep your backup file safe.
          </strong>{" "}
          It contains your complete streak history, notes, and local settings.
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
              <p className="text-[11.5px] font-semibold text-faint">
                Includes habits and notes (.json)
              </p>
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
              <p className="text-[14px] font-bold">
                Inspect &amp; Restore file
              </p>
              <p className="text-[11.5px] font-semibold text-faint">
                Safe pre-validation preview
              </p>
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
            <p className="text-[11.5px] font-semibold text-faint">
              Stores rolling 7-day backups
            </p>
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
            <p className="text-[11.5px] font-semibold text-faint">
              PIN or biometrics · background lock
            </p>
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
                <p className="text-[11px] text-faint">
                  Get reminded to complete streaks
                </p>
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
                <p className="text-[11px] text-faint">
                  Notify before scheduled time
                </p>
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
                <p className="text-[11px] text-faint">
                  Optional tasks alongside habits
                </p>
              </div>
            </div>
            <Switch checked={false} />
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-3 px-4 py-3">
        <Sparkles className="size-4 text-ember shrink-0" />
        <span className="text-[13px] font-semibold text-muted-foreground">
          Daily Spark · No account · No ads · 100% offline
        </span>
      </Card>

      {backupDialogOpen && (
        <Suspense fallback={null}>
          <BackupPreviewDialog
            open={backupDialogOpen}
            onOpenChange={setBackupDialogOpen}
            inspection={sampleInspection}
            onConfirmRestore={() => {
              setBackupDialogOpen(false);
            }}
          />
        </Suspense>
      )}

      {lockDialogOpen && (
        <Suspense fallback={null}>
          <AppLockDialog
            open={lockDialogOpen}
            onOpenChange={setLockDialogOpen}
          />
        </Suspense>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Hero demo                                                           */
/* ------------------------------------------------------------------ */

const SHOTS = [
  ["Today", <HomeScreen key="h" habits={DEMO_HABITS} />],
  ["Today planner", <PlannerScreen key="planner" />],
  ["Habits", <HabitScreen key="d" />],
  ["New habit", <NewHabitScreen key="n" />],
  ["Schedules & goals", <ScheduleScreen key="schedule" />],
  ["Progress", <ProgressScreen key="p" initialSubTab="overview" />],
  ["Calendar", <CalendarScreen key="c" />],
  ["Settings", <SettingsScreen key="s" />],
  ["Preferences", <PreferencesScreen key="preferences" />],
  ["Data & backups", <BackupScreen key="backups" />],
  ["Device transfer", <DeviceTransferScreen key="transfer" />],
  ["Android widgets", <WidgetsScreen key="widgets" />],
  ["Settings options", <SettingsDetailsScreen key="settings-options" />],
] as const;

// Mount detailed previews as they approach the visible shelf.
function GalleryShot({
  label,
  screen,
  onOpen,
}: {
  label: string;
  screen: ReactNode;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (ready || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <figure
      ref={ref}
      className="group w-[220px] flex-none snap-center sm:w-[250px]"
    >
      <div className="relative">
        <MiniPhone>
          {ready && <Suspense fallback={null}>{screen}</Suspense>}
        </MiniPhone>
        <button
          type="button"
          onClick={(event) => onOpen(event.currentTarget)}
          aria-label={`Enlarge ${label} screen`}
          className="absolute inset-0 block w-full cursor-zoom-in rounded-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        />
      </div>
      <figcaption className="mt-4 text-center text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

export function ScreensGallery({
  screensLoadedOnDemand,
  standalone = false,
}: {
  screensLoadedOnDemand: boolean;
  standalone?: boolean;
}) {
  useReveal();
  const DesktopHeading = standalone ? "h2" : "h3";
  const shelfRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const shelf = shelfRef.current;
    const track = trackRef.current;
    if (!shelf || !track) return;

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("motion-reduce");
    if (reduceMotion || paused || selected !== null) return;

    let rafId = 0;
    let lastTime = performance.now();
    let scrollPos = shelf.scrollLeft;
    const speedPxPerSec = 42;

    const step = (now: number) => {
      const dt = Math.min(now - lastTime, 64);
      lastTime = now;
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth > 0) {
        scrollPos += (speedPxPerSec * dt) / 1000;
        if (scrollPos >= loopWidth) {
          scrollPos -= loopWidth;
        }
        shelf.scrollLeft = scrollPos;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [paused, selected]);

  const movePreview = (direction: number) =>
    setSelected((current) =>
      current === null
        ? null
        : (current + direction + SHOTS.length) % SHOTS.length,
    );

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
      >
        <div
          id="screens-shelf"
          ref={shelfRef}
          role="region"
          aria-label="Screenshot gallery, looping"
          tabIndex={0}
          className="scrollbar-none flex w-full overflow-x-auto overscroll-x-contain pb-8 pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember"
        >
          <div ref={trackRef} className="flex flex-none gap-6 pr-6">
            {SHOTS.map(([label, screen], i) => (
              <GalleryShot
                key={label}
                label={label}
                screen={screen}
                onOpen={(trigger) => {
                  returnFocusRef.current = trigger;
                  setSelected(i);
                }}
              />
            ))}
            <div aria-hidden="true" inert className="flex flex-none gap-6">
              {SHOTS.map(([label, screen]) => (
                <figure
                  key={`loop-${label}`}
                  className="w-[220px] flex-none sm:w-[250px]"
                >
                  <MiniPhone>
                    <Suspense fallback={null}>{screen}</Suspense>
                  </MiniPhone>
                  <figcaption className="mt-4 text-center text-sm font-semibold text-muted-foreground">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-12 left-0 top-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-12 right-0 top-0 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:w-24"
        />
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-1rem)] max-w-[850px] gap-3 border border-border bg-background/95 p-4 pt-12 sm:p-6 sm:pt-12"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              movePreview(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              movePreview(1);
            }
          }}
        >
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => movePreview(-1)}
              aria-label="Previous screen"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <div className="min-w-0 text-center">
              <DialogTitle className="text-xl">
                {selected === null ? "Screen preview" : SHOTS[selected][0]}
              </DialogTitle>
              <DialogDescription className="mt-2 text-xs">
                Illustrative app preview. Use the arrows to explore
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => movePreview(1)}
              aria-label="Next screen"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="mx-auto w-[min(468px,calc(100vw-5rem),calc((100dvh-12rem)*0.46))]">
            {selected !== null && (
              <MiniPhone key={selected}>
                <Suspense fallback={null}>{SHOTS[selected][1]}</Suspense>
              </MiniPhone>
            )}
          </div>
          <p
            aria-live="polite"
            className="text-center font-mono text-xs text-muted-foreground"
          >
            {selected === null ? "" : `${selected + 1} / ${SHOTS.length}`}
          </p>
        </DialogContent>
      </Dialog>
      <section
        aria-labelledby="desktop-preview-title"
        className={`${screensLoadedOnDemand ? "reveal in" : "reveal"} mx-auto mt-12 max-w-[1100px] px-4 pb-10 sm:mt-16 sm:px-6`}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <DesktopHeading
              id="desktop-preview-title"
              className="font-display text-2xl font-bold sm:text-3xl"
            >
              Desktop workspace
            </DesktopHeading>
            <p className="mt-2 max-w-[66ch] text-sm text-muted-foreground sm:text-base">
              The Web App and Windows/Linux desktop packages use a full desktop
              workspace with navigation and side panels - not a stretched phone
              layout. Desktop packages are {SITE.desktop.version}; macOS is not
              yet available.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ember/30 bg-ember/10 px-4 text-sm font-semibold text-ember transition-colors hover:bg-ember/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Open Web App
          </Link>
        </div>
        <div
          role="region"
          aria-label="Desktop workspace preview, horizontally scrollable"
          tabIndex={0}
          className="overflow-x-auto rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="min-w-[760px] lg:min-w-0">
            <DesktopPreview />
          </div>
        </div>
      </section>
    </>
  );
}
