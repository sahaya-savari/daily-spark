import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Archive,
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flame,
  HeartHandshake,
  House,
  ListChecks,
  Lock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { App as CapacitorApp } from "@capacitor/app";
import { Dialog as CapacitorDialog } from "@capacitor/dialog";
import { Share } from "@capacitor/share";

import { useHabitStore, habitActions } from "@/lib/habits/store";
import { useNotesStore } from "@/lib/habits/notes";
import { useAppLockStore, lockActions } from "@/lib/habits/lock";
import {
  todayKey,
  addDays,
  formatDisplayDate,
  monthMatrix,
  formatMonthYear,
  addMonths,
} from "@/lib/habits/dates";
import {
  isDoneOn,
  isArchived,
  dayRatio,
  totalCompletions,
  inspectBackup,
  habitsToCsv,
  parseCsvHabits,
  buildBackup,
  isHabitDueToday,
  getMilestones,
  exportToMarkdown,
  type BackupInspection,
} from "@/lib/habits/logic";
import {
  CURATED_CATEGORIES,
  DEFAULT_SETTINGS,
  MILESTONES,
  type Habit,
  COLOR_SWATCH,
} from "@/lib/habits/types";
import { HabitIcon, HABIT_ICONS, getIcon } from "@/lib/habits/icons";
import { Heatmap } from "@/components/habits/Heatmap";
import { NotesView } from "@/components/habits/NotesView";
import { HabitSearchFilter, type StatusFilter } from "@/components/habits/HabitSearchFilter";
import { BackupPreviewDialog } from "@/components/habits/BackupPreviewDialog";
import { AppLockDialog } from "@/components/habits/AppLockDialog";
import { SnoozeDialog } from "@/components/habits/SnoozeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Haptic feedback trigger for mobile
async function triggerLightHaptic() {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      /* ignore */
    }
  }
}

export function DailySparkApp() {
  const { habits, settings } = useHabitStore();
  const { notes } = useNotesStore();
  const { isLocked, isEnabled: isLockEnabled } = useAppLockStore();
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [subTab, setSubTab] = useState<"habits" | "notes">("habits");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Filter state for Habits tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Today Focus state
  const [todayFocus, setTodayFocus] = useState<boolean>(false);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [backupInspection, setBackupInspection] = useState<BackupInspection | null>(null);
  const [isBackupPreviewOpen, setIsBackupPreviewOpen] = useState(false);
  const [isAppLockDialogOpen, setIsAppLockDialogOpen] = useState(false);
  const [streakToDelete, setStreakToDelete] = useState<Habit | null>(null);
  const [snoozeHabit, setSnoozeHabit] = useState<Habit | null>(null);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayKey());

  const today = todayKey();

  // Keep state ref updated for hardware back button handler
  const appStateRef = useRef({
    selectedHabit,
    streakToDelete,
    snoozeHabit,
    isAddOpen,
    isBackupPreviewOpen,
    isAppLockDialogOpen,
    activeTab,
  });

  useEffect(() => {
    appStateRef.current = {
      selectedHabit,
      streakToDelete,
      snoozeHabit,
      isAddOpen,
      isBackupPreviewOpen,
      isAppLockDialogOpen,
      activeTab,
    };
  });

  // Android hardware back-button listener (registered once on mount)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let sub: { remove: () => void } | null = null;
    const registerListener = async () => {
      sub = await CapacitorApp.addListener("backButton", async () => {
        const s = appStateRef.current;
        if (s.streakToDelete) {
          setStreakToDelete(null);
          return;
        }
        if (s.snoozeHabit) {
          setSnoozeHabit(null);
          return;
        }
        if (s.selectedHabit) {
          setSelectedHabit(null);
          return;
        }
        if (s.isAddOpen) {
          setIsAddOpen(false);
          return;
        }
        if (s.isBackupPreviewOpen) {
          setIsBackupPreviewOpen(false);
          return;
        }
        if (s.isAppLockDialogOpen) {
          setIsAppLockDialogOpen(false);
          return;
        }
        if (s.activeTab !== 0) {
          setActiveTab(0);
          return;
        }
        // Exit app confirmation on home tab
        const { value } = await CapacitorDialog.confirm({
          title: "Exit Daily Spark?",
          message: "Do you really want to close the app?",
          okButtonTitle: "Exit",
          cancelButtonTitle: "Cancel",
        });
        if (value) {
          CapacitorApp.exitApp();
        }
      });
    };
    registerListener();

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  // Reactively track selected habit across updates
  const currentSelectedHabit = useMemo(
    () => (selectedHabit ? habits.find((h) => h.id === selectedHabit.id) ?? selectedHabit : null),
    [habits, selectedHabit]
  );

  // Active / filtered habits
  const activeHabits = useMemo(() => habits.filter((h) => !isArchived(h)), [habits]);

  const displayedHabits = useMemo(() => {
    return habits.filter((h) => {
      if (statusFilter === "active" && isArchived(h)) return false;
      if (statusFilter === "archived" && !isArchived(h)) return false;
      if (statusFilter === "starred" && !h.isStarred) return false;
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
  }, [habits, statusFilter, categoryFilter, searchQuery]);

  // Today view habits
  const todayHabits = useMemo(() => {
    const list = activeHabits;
    if (todayFocus) {
      return list.filter((h) => !isDoneOn(h, today) && isHabitDueToday(h, today));
    }
    // Starred first, then by orderIndex or creation
    return [...list].sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    });
  }, [activeHabits, todayFocus, today]);

  const todayCompletedCount = useMemo(
    () => activeHabits.filter((h) => isDoneOn(h, today)).length,
    [activeHabits, today]
  );

  const nextHabit = useMemo(
    () => activeHabits.find((h) => !isDoneOn(h, today) && isHabitDueToday(h, today)),
    [activeHabits, today]
  );

  // Available categories
  const availableCategories = useMemo(() => {
    const fromHabits = habits.map((h) => h.category).filter(Boolean) as string[];
    const curated = CURATED_CATEGORIES.map((c) => c.id);
    return Array.from(new Set([...curated, ...fromHabits]));
  }, [habits]);

  // Check-in toggle handler
  const handleToggleHabit = (id: string) => {
    triggerLightHaptic();
    habitActions.toggleToday(id);
  };

  // Export full JSON backup
  const handleExportBackup = async () => {
    const backupData = buildBackup(habits, settings, new Date(), notes);
    const jsonStr = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `daily_spark_backup_${dateStr}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: "Daily Spark Backup",
          text: jsonStr,
          dialogTitle: "Save Daily Spark Backup",
        });
        habitActions.markBackedUp();
        return;
      } catch {
        /* fallback to browser download */
      }
    }

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    habitActions.markBackedUp();
  };

  // Export Markdown summary
  const handleExportMarkdown = () => {
    const md = exportToMarkdown(habits, notes);
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_spark_export_${dateStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = habitsToCsv(habits);
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_spark_habits_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File import handler (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      if (file.name.endsWith(".csv")) {
        const result = parseCsvHabits(content, today, habits);
        for (const h of result.habits) {
          habitActions.add(h);
        }
      } else {
        try {
          const inspection = inspectBackup(content, today);
          setBackupInspection(inspection);
          setIsBackupPreviewOpen(true);
        } catch (err: unknown) {
          alert((err as Error).message || "Invalid backup file");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 7-day mini progress week calculations
  const weekDays = useMemo(() => {
    const days: { label: string; date: string; done: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const ratio = dayRatio(habits, d);
      const dayName = new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "narrow" });
      days.push({ label: dayName, date: d, done: ratio.done, total: ratio.total });
    }
    return days;
  }, [habits, today]);

  // Heatmap 84-day activity levels
  const heatmapData = useMemo(() => {
    const levels: number[] = [];
    const labels: string[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = addDays(today, -i);
      const ratio = dayRatio(habits, d);
      labels.push(`${d}: ${ratio.done}/${ratio.total}`);
      if (ratio.total === 0 || ratio.done === 0) {
        levels.push(0);
      } else {
        const pct = ratio.done / ratio.total;
        if (pct === 1) levels.push(4);
        else if (pct >= 0.66) levels.push(3);
        else if (pct >= 0.33) levels.push(2);
        else levels.push(1);
      }
    }
    return { levels, labels };
  }, [habits, today]);

  // Overall progress stats
  const progressStats = useMemo(() => {
    let last7Done = 0;
    let last7Total = 0;
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const r = dayRatio(habits, d);
      last7Done += r.done;
      last7Total += r.total;
    }
    const last7Pct = last7Total > 0 ? Math.round((last7Done / last7Total) * 100) : 0;

    let last30Done = 0;
    let last30Total = 0;
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      const r = dayRatio(habits, d);
      last30Done += r.done;
      last30Total += r.total;
    }
    const last30Pct = last30Total > 0 ? Math.round((last30Done / last30Total) * 100) : 0;

    // Consecutive active days (global streak)
    let globalStreak = 0;
    let cursor = today;
    const rToday = dayRatio(habits, cursor);
    if (rToday.done === 0) {
      cursor = addDays(today, -1);
    }
    while (true) {
      const r = dayRatio(habits, cursor);
      if (r.done > 0) {
        globalStreak++;
        cursor = addDays(cursor, -1);
      } else {
        break;
      }
    }

    const totalCompletionsCount = totalCompletions(habits);

    return { last7Pct, last30Pct, globalStreak, totalCompletionsCount };
  }, [habits, today]);

  // If app is locked, present the full-screen PIN entry screen (after all hooks run)
  if (isLocked) {
    const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setUnlockError(null);
      const ok = await lockActions.unlock(unlockPin);
      if (!ok) {
        setUnlockError("Incorrect PIN. Please try again.");
      } else {
        setUnlockPin("");
      }
    };

    const handleBiometric = async () => {
      const ok = await lockActions.authenticateBiometric();
      if (!ok) {
        setUnlockError("Biometrics unavailable or authentication failed.");
      }
    };

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-foreground font-app selection:bg-ember/30">
        <div className="w-full max-w-sm rounded-3xl border border-border/50 bg-surface p-7 shadow-2xl space-y-6 text-center backdrop-blur-md">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ember-soft text-ember shadow-sm">
            <Lock className="size-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Daily Spark Locked</h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Enter your 4-digit PIN to access your habits, journal, and personal progress.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="flex justify-center">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                value={unlockPin}
                onChange={(e) => {
                  setUnlockError(null);
                  setUnlockPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                }}
                placeholder="••••"
                className="w-40 text-center text-3xl tracking-[0.4em] font-mono bg-surface-2 border-border/60 h-14"
              />
            </div>

            {unlockError && (
              <p className="text-xs text-destructive font-medium animate-in fade-in">
                {unlockError}
              </p>
            )}

            <Button
              type="submit"
              disabled={unlockPin.length !== 4}
              className="w-full h-11 bg-ember text-white hover:bg-ember/90 font-bold"
            >
              Unlock Daily Spark
            </Button>
          </form>

          {Capacitor.isNativePlatform() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBiometric}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Use Fingerprint / Biometrics
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-background font-app text-[14px] leading-[1.45] text-foreground flex flex-col justify-between selection:bg-ember/30 pb-28">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-surface/85 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-ember-soft text-ember shadow-sm">
            <Flame className="size-4" />
          </span>
          <div>
            <h1 className="font-display text-[15px] font-bold leading-none tracking-tight">Daily Spark</h1>
            <p className="text-[10px] font-medium text-muted-foreground">Calm &amp; Offline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progressStats.globalStreak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2.5 py-1 text-xs font-bold text-ember">
              <Flame className="size-3.5 fill-ember/20" /> {progressStats.globalStreak}
            </span>
          )}

          {isLockEnabled && (
            <button
              type="button"
              onClick={() => setIsAppLockDialogOpen(true)}
              className="grid size-8 place-items-center rounded-lg bg-surface-2 text-faint hover:text-foreground"
              title="App Lock Settings"
            >
              <Lock className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4">
        {/* ============================================================== */}
        {/* TAB 0: TODAY (HOME)                                            */}
        {/* ============================================================== */}
        {activeTab === 0 && (
          <div className="space-y-4">
            {/* Today Header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="kicker">Today</p>
                <p className="text-[20px] font-extrabold tracking-tight">
                  {formatDisplayDate(today)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTodayFocus(!todayFocus)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  todayFocus
                    ? "bg-ember text-white shadow-sm"
                    : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80"
                )}
              >
                <Sparkles className="size-3" />
                {todayFocus ? "Pending only" : "All habits"}
              </button>
            </div>

            {/* Next Up Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-surface p-5 shadow-sm">
              <p className="kicker">{nextHabit ? "Next up" : "Daily status"}</p>
              <p className="font-mono text-[24px] font-semibold leading-tight mt-1">
                {nextHabit ? nextHabit.name : "All caught up"}
              </p>
              <p className="text-[12.5px] font-medium text-muted-foreground mt-1">
                {nextHabit
                  ? `${todayCompletedCount} of ${activeHabits.length} completed · ${nextHabit.currentStreak} day streak`
                  : activeHabits.length === 0
                  ? "Tap the + button below to create your first habit."
                  : "Perfect day! You have completed all scheduled habits."}
              </p>

              {nextHabit && (
                <Button
                  onClick={() => handleToggleHabit(nextHabit.id)}
                  className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
                >
                  <Check className="size-4" strokeWidth={3} /> Check in now
                </Button>
              )}
            </div>

            {/* Mini 7-Day Consistency Bar */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <div className="flex justify-between items-center">
                {weekDays.map((d, i) => {
                  const isToday = d.date === today;
                  const isPerfect = d.total > 0 && d.done === d.total;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className={cn("text-[11px] font-semibold", isToday ? "text-ember font-bold" : "text-faint")}>
                        {d.label}
                      </span>
                      <span
                        className={cn(
                          "grid size-[30px] place-items-center rounded-full text-[10px] font-bold transition-all",
                          isPerfect
                            ? "bg-primary text-primary-foreground"
                            : d.done > 0
                            ? "bg-ember-soft text-ember"
                            : "bg-surface-2 text-faint",
                          isToday && !isPerfect && "ring-2 ring-ember"
                        )}
                      >
                        {isPerfect ? <Check className="size-3.5" strokeWidth={3} /> : d.done}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Habits List */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[16px] font-bold">Habits for Today</p>
                <span className="text-xs font-semibold text-faint">
                  {todayCompletedCount}/{activeHabits.length} done
                </span>
              </div>

              {todayHabits.length === 0 ? (
                <div className="rounded-3xl border border-border/40 bg-surface p-8 text-center text-muted-foreground">
                  <Sparkles className="mx-auto size-8 text-ember mb-2 opacity-80" />
                  <p className="font-semibold text-sm">No pending habits for today</p>
                  <p className="text-xs text-faint mt-1">
                    {todayFocus ? "All habits scheduled for today are complete." : "Add a habit to get started."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayHabits.map((h) => {
                    const done = isDoneOn(h, today);
                    const due = isHabitDueToday(h, today);
                    return (
                      <div
                        key={h.id}
                        className={cn(
                          "flex items-center gap-3 rounded-3xl border border-border/40 bg-surface p-4 transition-all hover:border-border",
                          done && "opacity-90"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedHabit(h)}
                          className="shrink-0 focus:outline-none"
                        >
                          <HabitIcon habit={{ icon: h.icon, emoji: h.emoji, color: h.color }} />
                        </button>

                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => setSelectedHabit(h)}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={cn("break-words font-mono text-[14px] font-semibold", done && "text-muted-foreground line-through decoration-ember/60")}>
                              {h.name}
                            </p>
                            {h.isStarred && <Star className="size-3 fill-gold text-gold shrink-0" />}
                            {h.category && (
                              <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded-full text-muted-foreground">
                                #{h.category}
                              </span>
                            )}
                            {!due && !h.isPaused && (
                              <span className="text-[10px] bg-surface-2 text-faint px-1.5 py-0.5 rounded-full">
                                Rest day
                              </span>
                            )}
                            {h.isPaused && (
                              <span className="text-[10px] bg-surface-2 text-ember px-1.5 py-0.5 rounded-full">
                                Paused
                              </span>
                            )}
                            {h.snoozedUntil && Date.now() < h.snoozedUntil && (
                              <span className="text-[10px] bg-ember-soft text-ember font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Clock className="size-2.5" /> Snoozed
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint mt-0.5">
                            <Flame className={cn("size-3", h.currentStreak > 0 && "text-ember")} /> {h.currentStreak} days streak
                            {h.bestStreak > 0 && ` · Best: ${h.bestStreak}`}
                          </p>
                        </div>

                        {/* Quick Snooze Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSnoozeHabit(h);
                          }}
                          aria-label={`Snooze reminder for ${h.name}`}
                          className="size-8 shrink-0 rounded-full text-faint hover:text-foreground"
                          title="Snooze Reminder"
                        >
                          <Clock className="size-3.5" />
                        </Button>

                        {/* Check-In Orb Button */}
                        <Button
                          variant="ghost"
                          onClick={() => handleToggleHabit(h.id)}
                          aria-label={`Mark ${h.name} as ${done ? "incomplete" : "complete"}`}
                          className={cn(
                            "check-orb grid size-12 shrink-0 place-items-center rounded-full p-0 transition-transform active:scale-90",
                            done
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-surface-2 text-faint hover:text-foreground"
                          )}
                        >
                          <Check className="size-4" strokeWidth={3} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: HABITS & STANDALONE NOTES                               */}
        {/* ============================================================== */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="kicker">Overview</p>
                <p className="font-display text-[22px] font-bold leading-tight">
                  {subTab === "habits" ? "All Habits" : "Standalone Notes"}
                </p>
              </div>
              <span className="text-xs font-semibold text-faint">
                {subTab === "habits" ? `${displayedHabits.length} habits` : `${notes.length} entries`}
              </span>
            </div>

            {/* Subtab Segmented Switcher */}
            <div className="flex rounded-full bg-surface border border-border/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setSubTab("habits");
                  setSelectedHabit(null);
                }}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
                  subTab === "habits"
                    ? "bg-surface-2 text-foreground shadow-sm"
                    : "text-faint hover:text-muted-foreground"
                )}
              >
                Habits ({habits.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubTab("notes");
                  setSelectedHabit(null);
                }}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all",
                  subTab === "notes"
                    ? "bg-surface-2 text-ember shadow-sm"
                    : "text-faint hover:text-muted-foreground"
                )}
              >
                Notes &amp; Journal ({notes.length})
              </button>
            </div>

            {subTab === "notes" ? (
              <NotesView />
            ) : (
              <div className="space-y-3">
                <HabitSearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  selectedCategory={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  availableCategories={availableCategories}
                  isSelectionMode={isSelectionMode}
                  onToggleSelectionMode={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds(new Set());
                  }}
                  selectedIds={selectedIds}
                  onSelectAll={() => setSelectedIds(new Set(displayedHabits.map((h) => h.id)))}
                  onDeselectAll={() => setSelectedIds(new Set())}
                  onBulkStar={(star) => {
                    habitActions.bulkStar(Array.from(selectedIds), star);
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                  }}
                  onBulkArchive={(archive) => {
                    habitActions.bulkArchive(Array.from(selectedIds), archive);
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                  }}
                  onBulkDelete={() => {
                    habitActions.bulkDelete(Array.from(selectedIds));
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                  }}
                  filteredCount={displayedHabits.length}
                />

                <div className="space-y-3 pt-1">
                  {displayedHabits.length === 0 ? (
                    <div className="rounded-3xl border border-border/40 bg-surface p-8 text-center text-faint">
                      No habits match your filters.
                    </div>
                  ) : (
                    displayedHabits.map((h) => (
                      <div
                        key={h.id}
                        className="flex w-full items-center gap-3 rounded-3xl border border-border/40 bg-surface p-4 text-left transition-colors hover:bg-surface-2/60"
                      >
                        {isSelectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(h.id)}
                            onChange={() => {
                              const next = new Set(selectedIds);
                              if (next.has(h.id)) next.delete(h.id);
                              else next.add(h.id);
                              setSelectedIds(next);
                            }}
                            className="size-4 accent-primary rounded cursor-pointer shrink-0"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedHabit(h)}
                          className="flex flex-1 items-center gap-3 min-w-0 text-left focus:outline-none"
                        >
                          <HabitIcon habit={{ icon: h.icon, emoji: h.emoji, color: h.color }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="break-words font-mono text-[14px] font-semibold">{h.name}</p>
                              {h.isStarred && <Star className="size-3 fill-gold text-gold shrink-0" />}
                              {isArchived(h) && (
                                <span className="text-[10px] text-faint border px-1 rounded">Archived</span>
                              )}
                              {h.isPaused && (
                                <span className="text-[10px] bg-surface-2 text-ember px-1.5 py-0.2 rounded-full">
                                  Paused
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-[11.5px] font-semibold text-faint mt-0.5">
                              <Flame className={cn("size-3", h.currentStreak > 0 && "text-ember")} /> {h.currentStreak} days
                              {h.category && (
                                <span className="text-[10px] bg-surface-2 px-1.5 py-0.2 rounded-full">
                                  #{h.category}
                                </span>
                              )}
                            </p>
                          </div>
                          <ChevronRight className="size-4 text-faint shrink-0" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PROGRESS & INSIGHTS                                     */}
        {/* ============================================================== */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div>
              <p className="kicker">Insights</p>
              <p className="font-display text-[22px] font-bold leading-tight">Progress &amp; Activity</p>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-3xl border border-border/40 bg-surface p-4">
                <p className="kicker">Last 7 days</p>
                <p className="text-[26px] font-extrabold text-ember">{progressStats.last7Pct}%</p>
                <p className="text-[11px] text-faint">Consistency rate</p>
              </div>

              <div className="rounded-3xl border border-border/40 bg-surface p-4">
                <p className="kicker">Last 30 days</p>
                <p className="text-[26px] font-extrabold">{progressStats.last30Pct}%</p>
                <p className="text-[11px] text-faint">Monthly rate</p>
              </div>

              <div className="rounded-3xl border border-border/40 bg-surface p-4">
                <p className="kicker">Days in a row</p>
                <p className="text-[26px] font-extrabold text-gold">{progressStats.globalStreak}</p>
                <p className="text-[11px] text-faint">Active habit streak</p>
              </div>

              <div className="rounded-3xl border border-border/40 bg-surface p-4">
                <p className="kicker">Check-ins</p>
                <p className="text-[26px] font-extrabold">{progressStats.totalCompletionsCount}</p>
                <p className="text-[11px] text-faint">Total completions</p>
              </div>
            </div>

            {/* 6-Month Real Heatmap */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[15px] font-bold">Activity Heatmap</p>
                <span className="text-[11px] font-medium text-faint">Past 12 weeks</span>
              </div>
              <Heatmap levels={heatmapData.levels} labels={heatmapData.labels} />
            </div>

            {/* Calm Milestones Showcase */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[15px] font-bold">Milestones</p>
                <span className="text-xs font-semibold text-ember">Quiet recognition</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                {MILESTONES.map((m) => {
                  const unlocked = habits.some((h) => h.bestStreak >= m.days);
                  return (
                    <div
                      key={m.days}
                      className={cn(
                        "rounded-2xl p-2.5 border transition-all",
                        unlocked
                          ? "bg-surface-2 border-ember/30 text-foreground"
                          : "bg-surface border-border/30 opacity-40 text-faint"
                      )}
                    >
                      <span className="text-xl block mb-1">{m.badge}</span>
                      <span className="text-[11px] font-bold block">{m.days}d</span>
                      <span className="text-[9px] text-faint block truncate">{m.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-Habit Consistency Bars */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <p className="mb-3 text-[15px] font-bold">Habit Consistency</p>
              <div className="space-y-3">
                {activeHabits.map((h) => {
                  const total = h.completedDates.length;
                  const pct = Math.min(100, Math.round((total / 30) * 100));
                  return (
                    <div key={h.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{h.emoji}</span>
                          <span className="truncate">{h.name}</span>
                        </span>
                        <span className="text-muted-foreground shrink-0">{h.currentStreak}d ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full bg-ember rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CALENDAR                                                */}
        {/* ============================================================== */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="kicker">Calendar</p>
                <p className="font-display text-[22px] font-bold leading-tight">
                  {formatMonthYear(currentMonthDate)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonthDate((prev) => addMonths(prev, -1))}
                  className="size-8 rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonthDate((prev) => addMonths(prev, 1))}
                  className="size-8 rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Monthly Calendar Grid */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[11px] font-semibold text-faint">
                    {d}
                  </span>
                ))}
              </div>

                {monthMatrix(currentMonthDate).map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1.5 text-center">
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <span key={di} />;
                      const dayNum = parseInt(dateStr.slice(8), 10);
                      const ratio = dayRatio(habits, dateStr);
                      const isToday = dateStr === today;
                      const isSelected = dateStr === selectedCalendarDate;
                      const isFuture = dateStr > today;

                      let heatClass = "bg-surface-2 text-faint";
                      if (!isFuture && ratio.total > 0 && ratio.done > 0) {
                        const pct = ratio.done / ratio.total;
                        if (pct === 1) heatClass = "bg-primary text-primary-foreground font-bold";
                        else if (pct >= 0.6) heatClass = "bg-heat-3 text-white font-bold";
                        else if (pct >= 0.3) heatClass = "bg-heat-2 text-foreground font-medium";
                        else heatClass = "bg-heat-1 text-foreground";
                      }

                      return (
                        <button
                          key={di}
                          type="button"
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={cn(
                            "grid aspect-square place-items-center rounded-xl text-[12px] transition-all",
                            heatClass,
                            isSelected && "ring-2 ring-ember shadow-sm scale-105",
                            isToday && !isSelected && "ring-1 ring-ember/60"
                          )}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>

            {/* Selected Date Breakdown */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="kicker">{formatDisplayDate(selectedCalendarDate)}</p>
                <span className="text-xs font-semibold text-faint">
                  {dayRatio(habits, selectedCalendarDate).done}/{dayRatio(habits, selectedCalendarDate).total} Done
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeHabits.map((h) => {
                  const done = isDoneOn(h, selectedCalendarDate);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-b-0 text-xs"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{h.emoji}</span>
                        <span className={cn("truncate font-medium", done && "text-foreground font-semibold")}>
                          {h.name}
                        </span>
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          habitActions.togglePastDay(h.id, selectedCalendarDate);
                        }}
                        className={cn(
                          "h-7 px-2.5 rounded-full text-[11px] font-bold",
                          done ? "text-primary bg-primary/10" : "text-faint hover:text-foreground"
                        )}
                      >
                        {done ? "Completed" : "Mark Done"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SETTINGS                                                */}
        {/* ============================================================== */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div>
              <p className="kicker">Settings</p>
              <p className="font-display text-[22px] font-bold leading-tight">Preferences &amp; Backups</p>
            </div>

            {/* Backup & Restore Card */}
            <div>
              <p className="kicker mb-2">Data &amp; Backups</p>
              <div className="rounded-3xl border border-border/40 bg-surface p-2 space-y-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-surface-2 transition-colors"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <Download className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Export Full Backup (.json)</p>
                    <p className="text-xs text-faint">Includes all streaks, history, and journal notes</p>
                  </div>
                  <ChevronRight className="size-4 text-faint" />
                </button>

                <label className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-surface-2 transition-colors cursor-pointer">
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <Upload className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Inspect &amp; Restore Backup</p>
                    <p className="text-xs text-faint">Safe preview dialog before restoring data</p>
                  </div>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <ChevronRight className="size-4 text-faint" />
                </label>

                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-surface-2 transition-colors"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <FileText className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Export Markdown Summary</p>
                    <p className="text-xs text-faint">Data freedom: readable report for Obsidian/Notion</p>
                  </div>
                  <ChevronRight className="size-4 text-faint" />
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-surface-2 transition-colors"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <Share2 className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Export CSV</p>
                    <p className="text-xs text-faint">Spreadsheet format for habits</p>
                  </div>
                  <ChevronRight className="size-4 text-faint" />
                </button>
              </div>
            </div>

            {/* Privacy & App Lock */}
            <div>
              <p className="kicker mb-2">Privacy &amp; Security</p>
              <div className="rounded-3xl border border-border/40 bg-surface p-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsAppLockDialogOpen(true)}
                  className="flex w-full items-center gap-3 text-left hover:bg-surface-2 rounded-2xl p-2 transition-colors"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <Lock className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">App Lock &amp; PIN</p>
                    <p className="text-xs text-faint">
                      {isLockEnabled ? "PIN enabled · 5-minute timeout" : "Protect habits and notes with a 4-digit PIN"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-faint" />
                </button>

                <div className="flex items-center justify-between p-2">
                  <div>
                    <p className="font-semibold text-sm">Auto Local Snapshots</p>
                    <p className="text-xs text-faint">Rolling 7-day backup points on this device</p>
                  </div>
                  <Switch
                    checked={settings.autoBackupHistoryEnabled !== false}
                    onCheckedChange={(checked) =>
                      habitActions.updateSettings({ autoBackupHistoryEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div>
              <p className="kicker mb-2">Reminders</p>
              <div className="rounded-3xl border border-border/40 bg-surface p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                    <Bell className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm">Gentle Reminders</p>
                    <p className="text-xs text-faint">Local notification at chosen time</p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => habitActions.updateSettings({ enabled: checked })}
                />
              </div>
            </div>

            {/* App Info & Principles */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Sparkles className="size-4 text-ember" /> Daily Spark v1.0.3
              </div>
              <p>No login · No ads · No tracking · Works 100% offline.</p>
              <p className="text-[11px] text-faint">
                Your data stays exclusively on your device. Export regular backups to prevent accidental data loss.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed inset-x-4 bottom-3 z-30 mx-auto max-w-lg flex h-[68px] items-center justify-between rounded-full border border-border/40 bg-surface/90 px-3 backdrop-blur-xl shadow-lg">
        <Button
          variant="ghost"
          onClick={() => setActiveTab(0)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[10px] font-semibold transition-colors",
            activeTab === 0 ? "text-ember font-bold" : "text-faint hover:text-foreground"
          )}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 0 && "bg-ember-soft")}>
            <House className="size-4" />
          </span>
          Today
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveTab(1)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[10px] font-semibold transition-colors",
            activeTab === 1 ? "text-ember font-bold" : "text-faint hover:text-foreground"
          )}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 1 && "bg-ember-soft")}>
            <ListChecks className="size-4" />
          </span>
          Habits
        </Button>

        {/* Center Floating Action Button (FAB) */}
        <Button
          variant="fab"
          size="fab"
          onClick={() => setIsAddOpen(true)}
          className="size-12 shrink-0 rounded-full bg-ember text-white shadow-md hover:bg-ember/90 mx-1 flex items-center justify-center"
          aria-label="Add new habit"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveTab(2)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[10px] font-semibold transition-colors",
            activeTab === 2 ? "text-ember font-bold" : "text-faint hover:text-foreground"
          )}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 2 && "bg-ember-soft")}>
            <ChartColumn className="size-4" />
          </span>
          Progress
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveTab(3)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[10px] font-semibold transition-colors",
            activeTab === 3 ? "text-ember font-bold" : "text-faint hover:text-foreground"
          )}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 3 && "bg-ember-soft")}>
            <CalendarIcon className="size-4" />
          </span>
          Calendar
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveTab(4)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[10px] font-semibold transition-colors",
            activeTab === 4 ? "text-ember font-bold" : "text-faint hover:text-foreground"
          )}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 4 && "bg-ember-soft")}>
            <Settings2 className="size-4" />
          </span>
          Settings
        </Button>
      </nav>

      {/* ============================================================== */}
      {/* DIALOG: ADD NEW HABIT                                          */}
      {/* ============================================================== */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-card text-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Create New Habit</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              What daily or weekly rhythm will you show up for?
            </DialogDescription>
          </DialogHeader>

          <AddHabitForm
            onAdd={(h) => {
              habitActions.add(h);
              setIsAddOpen(false);
            }}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIALOG: HABIT DETAIL VIEW                                      */}
      {/* ============================================================== */}
      {currentSelectedHabit && (
        <Dialog open={Boolean(currentSelectedHabit)} onOpenChange={(o) => !o && setSelectedHabit(null)}>
          <DialogContent className="max-w-md bg-card text-foreground border-border max-h-[90vh] overflow-y-auto">
            <HabitDetailModal
              habit={currentSelectedHabit}
              onClose={() => setSelectedHabit(null)}
              onSnooze={(h) => setSnoozeHabit(h)}
              onDelete={(h) => setStreakToDelete(h)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Habit Confirmation Dialog */}
      <Dialog open={Boolean(streakToDelete)} onOpenChange={(o) => !o && setStreakToDelete(null)}>
        <DialogContent className="max-w-sm bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-4" /> Delete Habit?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete &ldquo;{streakToDelete?.name}&rdquo;?
              This will remove its streak record and all past completion history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStreakToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (streakToDelete) {
                  habitActions.remove(streakToDelete.id);
                  if (selectedHabit?.id === streakToDelete.id) {
                    setSelectedHabit(null);
                  }
                  setStreakToDelete(null);
                }
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snooze Dialog */}
      <SnoozeDialog
        open={Boolean(snoozeHabit)}
        onOpenChange={(o) => !o && setSnoozeHabit(null)}
        habit={snoozeHabit}
        onSnooze={(id, until) => habitActions.snooze(id, until)}
        onClearSnooze={(id) => habitActions.clearSnooze(id)}
      />

      {/* Backup Preview Dialog */}
      <BackupPreviewDialog
        open={isBackupPreviewOpen}
        onOpenChange={setIsBackupPreviewOpen}
        inspection={backupInspection}
        onConfirmRestore={(ins) => {
          habitActions.replaceAll(ins.parsed.habits, ins.parsed.settings);
          setIsBackupPreviewOpen(false);
          setBackupInspection(null);
        }}
      />

      {/* App Lock Dialog */}
      <AppLockDialog
        open={isAppLockDialogOpen}
        onOpenChange={setIsAppLockDialogOpen}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponent: Add Habit Form                                       */
/* ------------------------------------------------------------------ */
function AddHabitForm({
  onAdd,
  onCancel,
}: {
  onAdd: (habit: Partial<Habit> & { name: string; emoji: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("flame");
  const [color, setColor] = useState("fire");
  const [category, setCategory] = useState("daily");
  const [frequencyType, setFrequencyType] = useState<"daily" | "weekly_target" | "specific_days">("daily");
  const [targetDays, setTargetDays] = useState(3);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      emoji: "🔥",
      icon,
      color,
      category,
      frequencyType,
      targetDaysPerWeek: frequencyType === "weekly_target" ? targetDays : undefined,
      customDays: frequencyType === "specific_days" ? selectedDays : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Habit Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Read 20 minutes, Morning walk"
          required
          autoFocus
          className="text-sm bg-surface-2"
        />
      </div>

      {/* Icon Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Icon</label>
        <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1 bg-surface-2 rounded-xl">
          {HABIT_ICONS.slice(0, 18).map(({ key, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setIcon(key)}
              className={cn(
                "grid aspect-square place-items-center rounded-lg text-muted-foreground transition-all",
                icon === key && "bg-ember text-white shadow-sm"
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Life Space / Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CURATED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setColor(cat.color);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold border transition-all",
                category === cat.id
                  ? "bg-ember text-white border-ember shadow-sm"
                  : "bg-surface-2 border-border/50 text-faint hover:text-foreground"
              )}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Schedule &amp; Frequency</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "daily", label: "Every Day" },
            { id: "weekly_target", label: "Weekly Goal" },
            { id: "specific_days", label: "Selected Days" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrequencyType(f.id as typeof frequencyType)}
              className={cn(
                "rounded-xl p-2 text-xs font-bold border transition-all",
                frequencyType === f.id
                  ? "bg-surface-2 border-ember text-foreground shadow-sm"
                  : "border-border/30 text-faint hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {frequencyType === "weekly_target" && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-2 mt-2">
            <span className="text-xs text-muted-foreground">Target days per week:</span>
            <div className="flex items-center gap-2 font-bold">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTargetDays(n)}
                  className={cn(
                    "size-6 rounded-full text-xs grid place-items-center",
                    targetDays === n ? "bg-ember text-white" : "text-faint hover:text-foreground"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {frequencyType === "specific_days" && (
          <div className="p-2 rounded-xl bg-surface-2 mt-2 space-y-1.5">
            <span className="text-xs text-muted-foreground block">Select Active Days:</span>
            <div className="grid grid-cols-7 gap-1">
              {[
                { day: 0, label: "Sun" },
                { day: 1, label: "Mon" },
                { day: 2, label: "Tue" },
                { day: 3, label: "Wed" },
                { day: 4, label: "Thu" },
                { day: 5, label: "Fri" },
                { day: 6, label: "Sat" },
              ].map(({ day, label }) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter((d) => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day].sort());
                      }
                    }}
                    className={cn(
                      "py-1.5 rounded-lg text-xs font-bold transition-colors",
                      isSelected
                        ? "bg-ember text-white"
                        : "bg-surface text-faint hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Guideline / Reflection Note</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
          placeholder="e.g. Keep it light, after dinner walk."
          className="text-xs min-h-[60px] bg-surface-2 resize-none"
        />
      </div>

      <DialogFooter className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-ember text-white hover:bg-ember/90">
          Add Habit
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponent: Habit Detail Modal                                   */
/* ------------------------------------------------------------------ */
function HabitDetailModal({
  habit,
  onClose,
  onSnooze,
  onDelete,
}: {
  habit: Habit;
  onClose: () => void;
  onSnooze: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}) {
  const [notes, setNotes] = useState(habit.notes ?? "");
  const [isPaused, setIsPaused] = useState(Boolean(habit.isPaused));
  const today = todayKey();
  const milestones = getMilestones(habit.bestStreak);

  // Compute recent 14 days for quick check-in fill-in
  const recent14Days = useMemo(() => {
    const list: { dateStr: string; label: string; dayNum: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const dayNum = parseInt(d.slice(8), 10);
      const dayName = new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "narrow" });
      list.push({ dateStr: d, label: dayName, dayNum });
    }
    return list;
  }, [today]);

  const handleSaveNotes = () => {
    habitActions.updateNotes(habit.id, notes);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      habitActions.resume(habit.id);
      setIsPaused(false);
    } else {
      habitActions.pause(habit.id, "User paused");
      setIsPaused(true);
    }
  };

  const handleApplyGrace = () => {
    habitActions.applyGrace(habit.id, "weekly");
  };

  const isCurrentlySnoozed =
    Boolean(habit.snoozedUntil) && Date.now() < (habit.snoozedUntil ?? 0);

  return (
    <div className="space-y-4 pt-1 text-sm">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <HabitIcon habit={{ icon: habit.icon, emoji: habit.emoji, color: habit.color }} size="lg" />
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-display text-xl truncate">{habit.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Created on {habit.createdAt} {habit.category ? `· #${habit.category}` : ""}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Streak Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-[22px] font-extrabold text-ember leading-none">{habit.currentStreak}</p>
          <p className="kicker mt-1">Current</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-[22px] font-extrabold leading-none">{habit.bestStreak}</p>
          <p className="kicker mt-1">Best</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-[22px] font-extrabold leading-none">{habit.completedDates.length}</p>
          <p className="kicker mt-1">Total</p>
        </div>
      </div>

      {/* 14-Day Completion History (Fill-in) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Recent 14 Days Check-In
          </label>
          <span className="text-[10px] text-faint">Tap past day to toggle</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-surface-2 text-center">
          {recent14Days.map(({ dateStr, label, dayNum }) => {
            const isDone = habit.completedDates.includes(dateStr);
            const isToday = dateStr === today;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  triggerLightHaptic();
                  habitActions.togglePastDay(habit.id, dateStr);
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-xl text-xs transition-all",
                  isDone
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-surface text-faint hover:text-foreground",
                  isToday && !isDone && "ring-1 ring-ember"
                )}
                title={`${dateStr}: ${isDone ? "Completed" : "Missed (tap to fill)"}`}
              >
                <span className="text-[9px] uppercase opacity-75">{label}</span>
                <span className="text-[11px] font-bold mt-0.5">{dayNum}</span>
                <span className="mt-0.5 text-[10px]">{isDone ? "✓" : "○"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Forgive Yesterday with Weekly Grace */}
      <div className="rounded-2xl border border-border/40 bg-surface-2/60 p-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-xs">Missed yesterday?</p>
          <p className="text-[11px] text-faint">Forgive with weekly grace allowance</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleApplyGrace}
          className="text-xs font-bold gap-1 text-ember border-ember/30 hover:bg-ember/10"
        >
          <HeartHandshake className="size-3.5" /> Forgive
        </Button>
      </div>

      {/* Vacation / Pause Mode */}
      <div className="rounded-2xl border border-border/40 bg-surface-2/60 p-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-xs">Vacation / Pause Habit</p>
          <p className="text-[11px] text-faint">Freeze streak safely during travel or illness</p>
        </div>
        <Button
          variant={isPaused ? "default" : "outline"}
          size="sm"
          onClick={handleTogglePause}
          className={cn(
            "text-xs font-bold gap-1",
            isPaused ? "bg-ember text-white" : "border-border text-faint hover:text-foreground"
          )}
        >
          {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      {/* Snooze Reminder */}
      <div className="rounded-2xl border border-border/40 bg-surface-2/60 p-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-xs">Snooze Notification</p>
          <p className="text-[11px] text-faint">
            {isCurrentlySnoozed
              ? `Snoozed until ${new Date(habit.snoozedUntil!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Temporarily delay reminders today"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSnooze(habit)}
          className="text-xs font-bold gap-1 border-border text-faint hover:text-foreground"
        >
          <Clock className="size-3.5" />
          {isCurrentlySnoozed ? "Change" : "Snooze"}
        </Button>
      </div>

      {/* Per-Streak Notes */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-muted-foreground uppercase">Habit Guidelines &amp; Reflection</label>
          <span className="text-[10px] text-faint">{notes.length}/1000</span>
        </div>
        <Textarea
          value={notes}
          maxLength={1000}
          onBlur={handleSaveNotes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record reminders, triggers, or personal guidelines for this habit..."
          className="text-xs min-h-[80px] bg-surface-2 resize-none"
        />
      </div>

      {/* Milestones for this habit */}
      {milestones.reached.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Milestones Unlocked</label>
          <div className="flex flex-wrap gap-2">
            {milestones.reached.map((m) => (
              <span
                key={m.days}
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold border border-ember/20 text-ember"
              >
                <span>{m.badge}</span> {m.days} Days ({m.title})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            habitActions.star(habit.id);
            onClose();
          }}
          className="text-xs gap-1.5 font-semibold text-faint hover:text-gold"
        >
          <Star className={cn("size-3.5", habit.isStarred && "fill-gold text-gold")} />
          {habit.isStarred ? "Starred" : "Star"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            habitActions.archive(habit.id, !isArchived(habit));
            onClose();
          }}
          className="text-xs gap-1.5 font-semibold text-faint hover:text-foreground"
        >
          <Archive className="size-3.5" />
          {isArchived(habit) ? "Unarchive" : "Archive"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(habit)}
          className="text-xs gap-1.5 font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
