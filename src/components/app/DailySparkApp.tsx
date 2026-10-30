import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PixelHome,
  PixelCheckList,
  PixelPlus,
  PixelMinus,
  PixelChart,
  PixelSettings,
  PixelCalendar,
  PixelFire,
  PixelStar,
  PixelCheck,
  PixelLock,
  PixelTrophy,
  PixelDownload,
  PixelUpload,
  PixelShieldCheck,
  PixelClose,
  PixelClock,
  PixelSparkles,
  PixelSearch,
  PixelArrowLeft,
  PixelArrowRight,
  PixelChevronLeft,
  PixelChevronRight,
  PixelChevronDown,
  PixelChevronUp,
  PixelTrash,
  PixelArchive,
  PixelRotateCcw,
  PixelPlay,
  PixelPause,
  PixelBell,
  PixelShare,
  PixelAlertTriangle,
  PixelCog,
  PixelHeart,
  PixelNotebook,
  PixelQrCode,
} from "@/components/ui/pixel-icon";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { App as CapacitorApp } from "@capacitor/app";
import { Dialog as CapacitorDialog } from "@capacitor/dialog";
import { Share } from "@capacitor/share";

import { useHabitStore, habitActions } from "@/lib/habits/store";
import { useNotesStore, noteActions } from "@/lib/habits/notes";
import { useAppLockStore, lockActions } from "@/lib/habits/lock";
import {
  todayKey,
  toKey,
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
  inspectBackupSandbox,
  habitsToCsv,
  habitsToTsv,
  parseCsvHabits,
  parseTsvHabits,
  parseMarkdownHabits,
  buildBackup,
  isHabitDueToday,
  getMilestones,
  exportToMarkdown,
  type BackupInspection,
} from "@/lib/habits/logic";
import { encryptVault, decryptVault } from "@/lib/habits/vaultSync";
import {
  CURATED_CATEGORIES,
  DEFAULT_SETTINGS,
  MILESTONES,
  type Habit,
  COLOR_SWATCH,
  COLOR_OPTIONS,
} from "@/lib/habits/types";
import { HabitIcon, HABIT_ICONS, getIcon } from "@/lib/habits/icons";
import { Heatmap } from "@/components/habits/Heatmap";
import { NotesView } from "@/components/habits/NotesView";
import { HabitSearchFilter, type StatusFilter } from "@/components/habits/HabitSearchFilter";
import { BackupPreviewDialog } from "@/components/habits/BackupPreviewDialog";
import { AppLockDialog } from "@/components/habits/AppLockDialog";
import { SnoozeDialog } from "@/components/habits/SnoozeDialog";
import { NeoGlassHabitCard } from "@/components/habits/NeoGlassHabitCard";
import { FocusTimerDialog } from "@/components/habits/FocusTimerDialog";
import { UniversalImportDialog } from "@/components/habits/UniversalImportDialog";
import { VaultSyncDialog } from "@/components/habits/VaultSyncDialog";
import { AppearanceSwitcher } from "@/components/habits/AppearanceSwitcher";
import { AirGappedSyncDialog } from "@/components/habits/AirGappedSyncDialog";
import { ShareCardDialog } from "@/components/habits/ShareCardDialog";
import { getAtRiskHabits, getMiniRecoveryPrompt } from "@/lib/habits/elastic";
import { predictNextHabit } from "@/lib/habits/markovPredictor";
import { generateFrictionDiagnostics } from "@/lib/habits/bottleneckDetector";
import { generateArchaeologyReport } from "@/lib/habits/archaeology";
import { getStoredTheme, applyThemeToDocument, setStoredTheme, type ThemeMode } from "@/lib/habits/appearance";
import { calculateCircadianWarmth } from "@/lib/habits/circadianGlide";
import { hapticEngine } from "@/lib/habits/haptics";
import { ModernSettingsView } from "@/components/settings/ModernSettingsView";
import { SparkMark } from "@/components/brand/Logo";
import { MobileBottomNav } from "@/components/app/MobileBottomNav";
import { CommandPalette } from "@/components/app/CommandPalette";
import { CheckPopBurst } from "@/components/habits/CheckPopBurst";
import { DitherHeatmapCalendar } from "@/components/habits/DitherHeatmapCalendar";
import { Avatar } from "@/components/dithercn/avatar";
import { useAvatarProfile } from "@/lib/habits/avatar";
import { THEME_CONFIGS } from "@/lib/habits/appearance";
import { ScrambleText } from "@/components/dithercn/scramble-text";
import { EmptyState } from "@/components/dithercn/empty-state";
import { DitherNumber } from "@/components/dithercn/dither-number";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { transitionTab } from "@/lib/viewTransition";
import { registerServiceWorker, UpdateToast } from "@/lib/pwa";
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
  await hapticEngine.tickTap();
}

export function DailySparkApp({ embedded = false }: { embedded?: boolean } = {}) {
  const { habits, settings } = useHabitStore();
  const { notes } = useNotesStore();
  const { isLocked, isEnabled: isLockEnabled, isBiometricEnabled } = useAppLockStore();
  const [avatarProfile] = useAvatarProfile();
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Auto-prompt biometrics on lock screen
  useEffect(() => {
    if (isLocked && isBiometricEnabled) {
      const timer = setTimeout(() => {
        lockActions.authenticateBiometric().then((ok) => {
          if (ok) {
            setUnlockPin("");
            setUnlockError(null);
          }
        });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBiometricEnabled]);

  useEffect(() => {
    habitActions.seedDemoIfEmpty();
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const warmth = settings.solarCircadianGlide !== false ? calculateCircadianWarmth() : 0;
    applyThemeToDocument(settings.themeMode || getStoredTheme(), warmth);
  }, [settings.themeMode, settings.solarCircadianGlide]);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [subTab, setSubTab] = useState<"habits" | "notes">("habits");
  const [progressSubTab, setProgressSubTab] = useState<"overview" | "calendar">("overview");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Filter state for Habits tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Today Focus state
  const [todayFocus, setTodayFocus] = useState<boolean>(false);
  const [lastCheckedHabitId, setLastCheckedHabitId] = useState<string | null>(null);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [backupInspection, setBackupInspection] = useState<BackupInspection | null>(null);
  const [isBackupPreviewOpen, setIsBackupPreviewOpen] = useState(false);
  const [isAppLockDialogOpen, setIsAppLockDialogOpen] = useState(false);
  const [streakToDelete, setStreakToDelete] = useState<Habit | null>(null);
  const [snoozeHabit, setSnoozeHabit] = useState<Habit | null>(null);
  // Phase 4 & 5 Dialogs
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusHabit, setFocusHabit] = useState<Habit | null>(null);
  const [isUniversalImportOpen, setIsUniversalImportOpen] = useState(false);
  const [isVaultSyncOpen, setIsVaultSyncOpen] = useState(false);
  // Phase 6 & 7 Dialogs
  const [isAirGappedOpen, setIsAirGappedOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayKey());

  const rolloverHour = (settings.rolloverHour as number | undefined) ?? 0;
  const today = useMemo(() => todayKey(new Date(), rolloverHour), [rolloverHour]);

  const handleSelectTab = (tab: number) => {
    if (tab === activeTab) return;
    triggerLightHaptic();
    transitionTab(() => {
      setActiveTab(tab);
    });
  };

  const handleToggleTheme = () => {
    const modes: ThemeMode[] = ["classic", "minimal", "expressive"];
    const currentMode = (settings.themeMode || getStoredTheme()) as ThemeMode;
    const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
    setStoredTheme(nextMode);
    habitActions.updateSettings({ themeMode: nextMode });
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keep state ref updated for hardware back button handler
  const appStateRef = useRef({
    selectedHabit,
    streakToDelete,
    snoozeHabit,
    isAddOpen,
    isCommandPaletteOpen,
    isBackupPreviewOpen,
    isAppLockDialogOpen,
    isAirGappedOpen,
    isShareCardOpen,
    activeTab,
    handleSelectTab,
  });

  useEffect(() => {
    appStateRef.current = {
      selectedHabit,
      streakToDelete,
      snoozeHabit,
      isAddOpen,
      isCommandPaletteOpen,
      isBackupPreviewOpen,
      isAppLockDialogOpen,
      isAirGappedOpen,
      isShareCardOpen,
      activeTab,
      handleSelectTab,
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
        if (s.isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (s.isAddOpen) {
          setIsAddOpen(false);
          return;
        }
        if (s.isAirGappedOpen) {
          setIsAirGappedOpen(false);
          return;
        }
        if (s.isShareCardOpen) {
          setIsShareCardOpen(false);
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
          s.handleSelectTab(0);
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

  // 182-day (26 weeks) momentum history for dithercn heatmap calendar
  const momentumDays = useMemo(() => {
    const result: Array<{ date: string; done: number; total: number; level: 0 | 1 | 2 | 3 | 4 }> = [];
    const now = new Date();
    const totalDays = 182;
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toKey(d);
      let done = 0;
      let total = 0;
      for (const h of habits) {
        if (!isArchived(h) && !h.isPaused) {
          total++;
          if (isDoneOn(h, key)) done++;
        }
      }
      const ratio = total > 0 ? done / total : 0;
      const level: 0 | 1 | 2 | 3 | 4 =
        ratio === 0 ? 0 : ratio >= 1 ? 4 : ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : 1;
      result.push({ date: key, done, total, level });
    }
    return result;
  }, [habits]);

  // Check-in toggle handler and particle burst state
  const [heroBurst, setHeroBurst] = useState<{ x: number; y: number } | null>(null);

  const handleToggleHabit = (id: string) => {
    setLastCheckedHabitId(id);
    habitActions.toggleToday(id);
  };

  // Phase 6 & 7 computed metrics
  const atRiskHabits = useMemo(() => getAtRiskHabits(habits, today), [habits, today]);
  const markovSuggestion = useMemo(() => {
    if (lastCheckedHabitId) {
      return predictNextHabit(lastCheckedHabitId, habits, today);
    }
    if (nextHabit) {
      return predictNextHabit(nextHabit.id, habits, today);
    }
    return null;
  }, [lastCheckedHabitId, nextHabit, habits, today]);
  const frictionAnomalies = useMemo(() => generateFrictionDiagnostics(habits, today), [habits, today]);
  const archaeology = useMemo(() => generateArchaeologyReport(habits), [habits]);

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

  // Export CSV (habits + notes)
  const handleExportCsv = () => {
    const csv = habitsToCsv(habits, notes);
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_spark_habits_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export TSV (habits + notes)
  const handleExportTsv = () => {
    const tsv = habitsToTsv(habits, notes);
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_spark_habits_${dateStr}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Encrypted Vault (.vault)
  const handleExportVault = async () => {
    const passphrase = prompt("Set a passphrase to encrypt your Daily Spark vault:", "daily-spark-vault") || "daily-spark-vault";
    try {
      const encrypted = await encryptVault(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          habits,
          notes,
          settings,
        },
        passphrase
      );
      const jsonStr = JSON.stringify(encrypted, null, 2);
      const dateStr = new Date().toISOString().slice(0, 10);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily_spark_vault_${dateStr}.vault`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to encrypt vault: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // File import handler (JSON, CSV, TSV, MD, VAULT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith(".csv")) {
        const result = parseCsvHabits(content, today, habits);
        for (const h of result.habits) {
          habitActions.add(h);
        }
        if (result.notes) {
          for (const n of result.notes) {
            noteActions.addNote(n);
          }
        }
        alert(`Successfully imported ${result.habits.length} habits${result.notes ? ` and ${result.notes.length} notes` : ""}.`);
      } else if (file.name.endsWith(".tsv")) {
        const result = parseTsvHabits(content, today, habits);
        for (const h of result.habits) {
          habitActions.add(h);
        }
        if (result.notes) {
          for (const n of result.notes) {
            noteActions.addNote(n);
          }
        }
        alert(`Successfully imported ${result.habits.length} habits${result.notes ? ` and ${result.notes.length} notes` : ""}.`);
      } else if (file.name.endsWith(".md")) {
        const result = parseMarkdownHabits(content, today, habits);
        for (const h of result.habits) {
          habitActions.add(h);
        }
        for (const n of result.notes) {
          noteActions.addNote(n);
        }
        alert(`Successfully imported ${result.habits.length} habits and ${result.notes.length} notes from Markdown.`);
      } else if (file.name.endsWith(".vault")) {
        const passphrase = prompt("Enter the passphrase for this encrypted vault:") || "";
        if (!passphrase) return;
        try {
          const pkg = JSON.parse(content);
          const decrypted = await decryptVault(pkg, passphrase);
          habitActions.mergeHabits(decrypted.habits || []);
          if (decrypted.notes && decrypted.notes.length > 0) {
            noteActions.mergeNotes(decrypted.notes);
          }
          alert(`Vault successfully decrypted and restored (${decrypted.habits?.length || 0} habits${decrypted.notes ? ` and ${decrypted.notes.length} notes` : ""})!`);
        } catch (err) {
          alert("Could not decrypt vault: " + (err instanceof Error ? err.message : "Incorrect passphrase"));
        }
      } else {
        const sandbox = inspectBackupSandbox(content);
        if (!sandbox.valid) {
          alert(sandbox.error || "Invalid backup file");
          return;
        }
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
      } else {
        setUnlockPin("");
        setUnlockError(null);
      }
    };

    return (
      <div
        className={cn(
          "w-full bg-background flex flex-col items-center justify-center p-6 text-foreground font-app selection:bg-ember/30",
          embedded ? "h-[844px] overflow-hidden" : "min-h-screen"
        )}
      >
        <div className="w-full max-w-sm rounded-3xl border border-border/50 bg-surface p-7 shadow-2xl space-y-6 text-center backdrop-blur-md">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ember-soft text-ember shadow-sm">
            <PixelLock className="size-7" />
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBiometric}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 w-full pt-1"
          >
            <span>Unlock with Biometrics (Fingerprint / Face ID)</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full bg-background bg-dots font-app text-[14px] leading-[1.45] text-foreground flex flex-col justify-between selection:bg-ember/30",
        embedded ? "h-[844px] overflow-hidden select-none" : "min-h-screen flex flex-col lg:flex-row pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
      )}
    >
      {embedded && (
        <div className="flex h-11 items-center justify-between px-6 text-[13px] font-semibold select-none pt-2 shrink-0">
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
      )}
      {/* Desktop Sidebar Navigation Rail (matching Image 4 on wide viewports) */}
      {!embedded && (
        <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border/40 bg-surface/80 backdrop-blur-md p-5 shrink-0 min-h-screen sticky top-0 h-screen select-none">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <SparkMark className="size-8" />
              <div>
                <h1 className="font-display text-[17px] font-bold text-foreground">Daily Spark</h1>
                <p className="text-[11px] text-muted-foreground">Calm &amp; Offline</p>
              </div>
            </div>

            {/* Command Palette Quick Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-surface-2/60 px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground hover:border-ember/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
              aria-label="Open command palette (Ctrl+K or Cmd+K)"
            >
              <span className="flex items-center gap-2">
                <PixelSearch className="size-3.5 text-muted-foreground" />
                <span>Search or jump to...</span>
              </span>
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-surface px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform) ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>

            <nav className="space-y-1.5" aria-label="Desktop navigation">
              <button
                type="button"
                onClick={() => handleSelectTab(0)}
                aria-current={activeTab === 0 ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer",
                  activeTab === 0
                    ? "bg-ember text-white shadow-md shadow-ember/20 font-bold"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <PixelHome className="size-4.5" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab(1)}
                aria-current={activeTab === 1 ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer",
                  activeTab === 1
                    ? "bg-ember text-white shadow-md shadow-ember/20 font-bold"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <PixelCheckList className="size-4.5" />
                <span>Habits</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab(2)}
                aria-current={activeTab === 2 ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer",
                  activeTab === 2
                    ? "bg-ember text-white shadow-md shadow-ember/20 font-bold"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <PixelChart className="size-4.5" />
                <span>Progress &amp; Stats</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab(3)}
                aria-current={activeTab === 3 ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer",
                  activeTab === 3
                    ? "bg-ember text-white shadow-md shadow-ember/20 font-bold"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <PixelSettings className="size-4.5" />
                <span>Settings</span>
              </button>

              {/* Desktop New Habit Button */}
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ember/15 border border-ember/30 px-3.5 py-2.5 text-xs font-bold text-ember transition-all hover:bg-ember hover:text-white shadow-sm hover:shadow-ember/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
              >
                <PixelPlus className="size-3.5" />
                <span>New Habit</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <span className="size-8 rounded-full bg-ember-soft text-ember font-bold text-xs grid place-items-center border border-ember/25">
                  <DitherNumber value={progressStats.globalStreak} suffix="d" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">Active Streak</p>
                  <p className="text-[10px] text-muted-foreground">{todayCompletedCount} of {activeHabits.length} done</p>
                </div>
              </div>
              {isLockEnabled && (
                <button
                  type="button"
                  onClick={() => setIsAppLockDialogOpen(true)}
                  className="p-1.5 rounded-lg text-faint hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                  title="App Lock"
                  aria-label="App Lock"
                >
                  <PixelLock className="size-4" />
                </button>
              )}
            </div>

            {/* User Profile Card */}
            <button
              type="button"
              onClick={() => handleSelectTab(3)}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-surface-2/60 border border-white/5 hover:bg-surface-2 hover:border-ember/20 transition-all cursor-pointer text-left w-full group"
              title="Settings & Profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  name={avatarProfile.name}
                  size={34}
                  shape={avatarProfile.shape}
                  fill={avatarProfile.fill}
                  status={avatarProfile.status}
                  color={settings.themeMode ? THEME_CONFIGS[settings.themeMode]?.accent : "orange"}
                  bloom="off"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-ember transition-colors">
                    {avatarProfile.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize truncate">
                    {avatarProfile.status} · {avatarProfile.fill}
                  </p>
                </div>
              </div>
              <PixelChevronRight className="size-3.5 text-faint group-hover:text-foreground transition-colors shrink-0" />
            </button>
          </div>
        </aside>
      )}

      {/* Top Header Bar (Mobile only) */}
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-border/40 bg-surface/85 backdrop-blur-md shrink-0 px-4", !embedded && "lg:hidden",
          embedded ? "h-12" : "pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))]"
        )}
      >
        <div className={cn("mx-auto flex w-full max-w-lg items-center justify-between", embedded ? "h-full" : "h-14")}>
          <div className="flex items-center gap-2.5">
            <SparkMark className="size-8" />
            <div>
              <h1 className="font-display text-[16px] font-bold leading-tight tracking-[0.04em] text-foreground">Daily Spark</h1>
              <p className="text-[10px] font-medium text-muted-foreground">Calm &amp; Offline</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {progressStats.globalStreak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-2.5 py-1 text-xs font-bold text-ember">
                <PixelFire className="size-3.5 fill-ember/20" />
                <DitherNumber value={progressStats.globalStreak} suffix="d" />
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="grid min-h-[44px] min-w-[44px] size-11 place-items-center rounded-xl bg-surface-2 text-faint hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
              title="Search and commands (Ctrl+K)"
              aria-label="Open command palette"
            >
              <PixelSearch className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab(3)}
              className="size-9 rounded-full cursor-pointer overflow-hidden border border-white/10 hover:border-ember transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember shrink-0 flex items-center justify-center bg-surface-2"
              title="Profile & Settings"
              aria-label="Profile and Settings"
            >
              <Avatar
                name={avatarProfile.name}
                size={34}
                shape={avatarProfile.shape}
                fill={avatarProfile.fill}
                status={avatarProfile.status}
                color={settings.themeMode ? THEME_CONFIGS[settings.themeMode]?.accent : "orange"}
              />
            </button>

            {isLockEnabled && (
              <button
                type="button"
                onClick={() => setIsAppLockDialogOpen(true)}
                className="grid min-h-[44px] min-w-[44px] size-11 place-items-center rounded-xl bg-surface-2 text-faint hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
                title="App Lock Settings"
                aria-label="App Lock Settings"
              >
                <PixelLock className="size-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={cn(
          "mx-auto w-full max-w-lg flex-1 px-4", !embedded && "lg:max-w-4xl lg:px-8",
          embedded ? "overflow-y-auto overscroll-contain scrollbar-none pt-3 pb-24" : "pt-4"
        )}
      >
        <div key={activeTab} className="tab-pane-transition">
        {/* ============================================================== */}
        {/* TAB 0: TODAY (HOME)                                            */}
        {/* ============================================================== */}
        {activeTab === 0 && (
          <div className="space-y-4">
            {/* Today Header */}
            <div className="flex items-end justify-between">
              <div>
                <ScrambleText as="p" className="kicker" trigger="in-view">
                  Today
                </ScrambleText>
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
                <PixelSparkles className="size-3" />
                {todayFocus ? "Pending only" : "All habits"}
              </button>
            </div>

            {/* Next Up Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="kicker">{nextHabit ? "Next up" : "Daily status"}</p>
                  <p className="font-mono text-[24px] font-semibold leading-tight mt-1 truncate">
                    {nextHabit ? nextHabit.name : "All caught up"}
                  </p>
                  <p className="text-[12.5px] font-medium text-muted-foreground mt-1">
                    {nextHabit
                      ? `${todayCompletedCount} of ${activeHabits.length} completed · ${nextHabit.currentStreak} day streak`
                      : activeHabits.length === 0
                      ? "Tap the + button below to create your first habit."
                      : "Perfect day! You have completed all scheduled habits."}
                  </p>
                </div>
                <AnimatedCircularProgressBar
                  value={todayCompletedCount}
                  max={activeHabits.length || 1}
                  size={52}
                  strokeWidth={5}
                >
                  <span className="text-[11px] font-mono font-bold text-foreground">
                    {todayCompletedCount}/{activeHabits.length}
                  </span>
                </AnimatedCircularProgressBar>
              </div>

              {nextHabit && (
                <Button
                  onClick={(e) => {
                    hapticEngine.tickTap();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX && e.clientX > 0 ? e.clientX : rect.left + rect.width / 2;
                    const y = e.clientY && e.clientY > 0 ? e.clientY : rect.top + rect.height / 2;
                    setHeroBurst({ x, y });
                    handleToggleHabit(nextHabit.id);
                  }}
                  className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground shadow-md transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <PixelCheck className="size-4" /> Check in now
                </Button>
              )}
            </div>

            {/* The Two-Day Rule Gentle Banner */}
            {atRiskHabits.length > 0 && (
              <div className="rounded-2xl border border-ember/25 bg-ember/10 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <PixelFire className="size-4 text-ember shrink-0" />
                  <span className="truncate text-foreground/90 font-medium">Missed yesterday: <strong className="text-foreground">{atRiskHabits[0].name}</strong></span>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    hapticEngine.tickTap();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX && e.clientX > 0 ? e.clientX : rect.left + rect.width / 2;
                    const y = e.clientY && e.clientY > 0 ? e.clientY : rect.top + rect.height / 2;
                    setHeroBurst({ x, y });
                    handleToggleHabit(atRiskHabits[0].id);
                  }}
                  className="h-7 rounded-full bg-ember text-white text-[11px] font-bold px-3 shrink-0 hover:bg-ember/90 cursor-pointer"
                >
                  Check In
                </Button>
              </div>
            )}

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
                        {isPerfect ? <PixelCheck className="size-3.5" /> : d.done}
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
                <EmptyState
                  illustration={todayFocus ? "planet" : "box"}
                  title={todayFocus ? "All habits completed!" : "No habits for today"}
                  description={
                    todayFocus
                      ? "You've crushed all your scheduled habits for today."
                      : "Tap the button below to add your first habit and ignite your spark."
                  }
                  action={
                    todayFocus ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTodayFocus(false)}
                        className="rounded-full"
                      >
                        Show all habits
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-full bg-ember text-white hover:bg-ember/90 cursor-pointer"
                      >
                        <PixelPlus className="size-3.5 mr-1.5" />
                        Add Habit
                      </Button>
                    )
                  }
                  color="orange"
                  className="rounded-3xl border border-border/40 bg-surface py-8"
                />
              ) : (
                <div className="space-y-3">
                  {todayHabits.map((h) => (
                    <NeoGlassHabitCard
                      key={h.id}
                      habit={h}
                      today={today}
                      onToggleToday={(id) => {
                        handleToggleHabit(id);
                      }}
                      onQuantIncrement={(id, delta) => {
                        triggerLightHaptic();
                        habitActions.incrementQuant(id, today, delta);
                      }}
                      onLogRelapse={(id, cost, reason) => {
                        triggerLightHaptic();
                        habitActions.logRelapse(id, today, cost, reason);
                      }}
                      onUndoRelapse={(id) => {
                        triggerLightHaptic();
                        habitActions.undoRelapse(id, today);
                      }}
                      onToggleSubtask={(id, subtaskId) => {
                        triggerLightHaptic();
                        habitActions.toggleSubtask(id, subtaskId, today);
                      }}
                      onOpenFocusTimer={(targetHabit) => {
                        setFocusHabit(targetHabit);
                        setIsFocusTimerOpen(true);
                      }}
                      onToggleStar={(id) => habitActions.star(id)}
                      onEdit={(targetHabit) => setSelectedHabit(targetHabit)}
                    />
                  ))}
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
                <ScrambleText as="p" className="kicker" trigger="in-view">
                  Habits
                </ScrambleText>
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
                    <EmptyState
                      illustration="search"
                      title="No habits match your filters"
                      description={
                        searchQuery
                          ? `No results found for "${searchQuery}". Try clearing filters or searching for something else.`
                          : "No habits found in this category or status."
                      }
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setCategoryFilter(null);
                          }}
                          className="rounded-full cursor-pointer"
                        >
                          Clear all filters
                        </Button>
                      }
                      color="orange"
                      className="rounded-3xl border border-border/40 bg-surface py-8"
                    />
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
                              {h.isStarred && <PixelStar className="size-3.5 fill-gold text-gold shrink-0" />}
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
                              <PixelFire className={cn("size-3", h.currentStreak > 0 && "text-ember")} /> <DitherNumber value={h.currentStreak} suffix=" days" />
                              {h.category && (
                                <span className="text-[10px] bg-surface-2 px-1.5 py-0.2 rounded-full">
                                  #{h.category}
                                </span>
                              )}
                            </p>
                          </div>
                          <PixelChevronRight className="size-4 text-faint shrink-0" />
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
        {/* TAB 2: PROGRESS & ANALYTICS                                    */}
        {/* ============================================================== */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <ScrambleText as="p" className="kicker" trigger="in-view">
                  Analytics
                </ScrambleText>
                <p className="font-display text-[22px] font-bold leading-tight">
                  {progressSubTab === "overview" ? "Insights & Momentum" : formatMonthYear(currentMonthDate)}
                </p>
              </div>

              {progressSubTab === "calendar" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonthDate((prev) => addMonths(prev, -1))}
                    className="size-8 rounded-full"
                  >
                    <PixelChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonthDate((prev) => addMonths(prev, 1))}
                    className="size-8 rounded-full"
                  >
                    <PixelChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Segmented Switcher: Overview vs Calendar */}
            <div className="flex rounded-full bg-surface p-1 border border-border/40">
              <button
                type="button"
                onClick={() => setProgressSubTab("overview")}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-center text-xs font-normal transition-all",
                  progressSubTab === "overview"
                    ? "bg-surface-2 text-foreground border border-white/10"
                    : "text-faint hover:text-muted-foreground"
                )}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setProgressSubTab("calendar")}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-center text-xs font-normal transition-all",
                  progressSubTab === "calendar"
                    ? "bg-surface-2 text-ember border border-ember/20"
                    : "text-faint hover:text-muted-foreground"
                )}
              >
                Calendar
              </button>
            </div>

            {progressSubTab === "overview" ? (
              <div className="space-y-4">

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
                <p className="text-[26px] font-extrabold text-gold">
                  <DitherNumber value={progressStats.globalStreak} />
                </p>
                <p className="text-[11px] text-faint">Active habit streak</p>
              </div>

              <div className="rounded-3xl border border-border/40 bg-surface p-4">
                <p className="kicker">Check-ins</p>
                <p className="text-[26px] font-extrabold">
                  <DitherNumber value={progressStats.totalCompletionsCount} />
                </p>
                <p className="text-[11px] text-faint">Total completions</p>
              </div>
            </div>

            {/* 6-Month Dither Momentum Calendar */}
            <DitherHeatmapCalendar
              data={momentumDays}
              streak={progressStats.globalStreak}
              className="w-full"
            />

            {/* Calm Milestones Showcase */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[15px] font-bold">Milestones</p>
                <span className="text-xs font-semibold text-ember">Quiet recognition</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                {MILESTONES.map((m) => {
                  const unlocked = habits.some((h) => h.bestStreak >= m.days);
                  return (
                    <div
                      key={m.days}
                      data-testid="milestone-badge"
                      className={cn(
                        "rounded-2xl p-3 border transition-all flex flex-col items-center justify-center",
                        unlocked
                          ? "bg-surface-2 border-ember/30 text-foreground shadow-sm"
                          : "bg-surface border-border/30 opacity-40 text-faint"
                      )}
                    >
                      <span className="text-2xl block mb-1">{m.badge}</span>
                      <span className="text-xs font-bold text-ember block">{m.days} Days</span>
                      <span className="text-xs font-semibold text-foreground block truncate mt-0.5">{m.title}</span>
                      <p className="text-[10px] text-faint mt-1 line-clamp-2">{m.description}</p>
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
        ) : (
          <div className="space-y-4">
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
                        if (pct === 1) heatClass = "bg-ember text-white font-bold";
                        else if (pct >= 0.75) heatClass = "bg-heat-3 text-white font-bold";
                        else if (pct >= 0.5) heatClass = "bg-heat-2 text-foreground font-medium";
                        else heatClass = "bg-heat-1 text-foreground";
                      }

                      return (
                        <button
                          key={di}
                          type="button"
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={cn(
                            "flex flex-col items-center justify-center aspect-square rounded-xl p-1 text-[12px] transition-all",
                            heatClass,
                            isSelected && "ring-2 ring-ember shadow-sm scale-105",
                            isToday && !isSelected && "ring-2 ring-ember"
                          )}
                        >
                          <span className="font-bold leading-none">{dayNum}</span>
                          {!isFuture && ratio.total > 0 ? (
                            <span className="text-[9px] font-medium opacity-85 leading-none mt-0.5">
                              {ratio.done}/{ratio.total}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>

            {/* Calendar Legend (matching previous app) */}
            <div className="rounded-3xl border border-border/40 bg-surface p-4 space-y-2.5">
              <p className="font-semibold text-xs text-foreground">Legend</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-surface-2 border border-border/40" />
                  <span>0/x — No completions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-heat-1 border border-border/30" />
                  <span>1–2/x — Few completions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-heat-3 border border-border/30" />
                  <span>3–4/x — Most completions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-primary" />
                  <span>x/x — All completed</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="size-3 rounded ring-2 ring-ember bg-transparent" />
                  <span>Today</span>
                </div>
              </div>
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
      </div>
    )}

    {/* ============================================================== */}
    {/* TAB 3: SETTINGS                                                */}
    {/* ============================================================== */}
        {activeTab === 3 && (
          <ModernSettingsView
            onExportBackup={handleExportBackup}
            onFileUpload={handleFileUpload}
            onExportMarkdown={handleExportMarkdown}
            onExportCsv={handleExportCsv}
            onExportTsv={handleExportTsv}
            onExportVault={handleExportVault}
            onOpenAirGapped={() => setIsAirGappedOpen(true)}
            onOpenVaultSync={() => setIsVaultSyncOpen(true)}
            onOpenAppLock={() => setIsAppLockDialogOpen(true)}
            embedded={embedded}
          />
        )}
        </div>
      </main>

      {/* Floating Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleSelectTab}
        onAddClick={() => setIsAddOpen(true)}
        embedded={embedded}
      />

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
              <PixelTrash className="size-4" /> Delete Habit?
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
                  hapticEngine.gentleThud();
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
          if (ins.notes && ins.notes.length > 0) {
            noteActions.replaceAll(ins.notes);
          }
          setIsBackupPreviewOpen(false);
          setBackupInspection(null);
        }}
      />

      {/* App Lock Dialog */}
      <AppLockDialog
        open={isAppLockDialogOpen}
        onOpenChange={setIsAppLockDialogOpen}
      />

      {/* Focus Timer Dialog */}
      <FocusTimerDialog
        open={isFocusTimerOpen}
        onOpenChange={setIsFocusTimerOpen}
        habit={focusHabit}
        onCompleteHabit={(habitId, durationMinutes) => {
          handleToggleHabit(habitId);
          habitActions.addFocusMinutes(habitId, durationMinutes);
        }}
      />

      {/* Universal Multi-Format Importer Dialog */}
      <UniversalImportDialog
        open={isUniversalImportOpen}
        onOpenChange={setIsUniversalImportOpen}
        onImportHabits={(imported) => {
          habitActions.mergeHabits(imported);
        }}
      />

      {/* Encrypted Vault Sync Dialog */}
      <VaultSyncDialog
        open={isVaultSyncOpen}
        onOpenChange={setIsVaultSyncOpen}
        habits={habits}
        notes={notes}
        settings={settings}
        onSyncComplete={(mergedHabits, mergedNotes) => {
          habitActions.replaceAll(mergedHabits, settings);
          if (mergedNotes && mergedNotes.length > 0) {
            noteActions.replaceAll(mergedNotes);
          }
        }}
      />

      {/* Air-Gapped Optical QR Handshake Dialog */}
      <AirGappedSyncDialog
        open={isAirGappedOpen}
        onOpenChange={setIsAirGappedOpen}
      />

      {/* Spotify-Wrapped Style Share Card Dialog */}
      <ShareCardDialog
        open={isShareCardOpen}
        onOpenChange={setIsShareCardOpen}
      />

      {/* Global Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        habits={activeHabits}
        onSelectTab={(tab) => {
          handleSelectTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onToggleHabit={(id) => {
          hapticEngine.tickTap();
          handleToggleHabit(id);
          setIsCommandPaletteOpen(false);
        }}
        theme={settings.themeMode || getStoredTheme()}
        onToggleTheme={handleToggleTheme}
        onOpenAddHabit={() => {
          setIsAddOpen(true);
          setIsCommandPaletteOpen(false);
        }}
      />

      {heroBurst && (
        <CheckPopBurst
          x={heroBurst.x}
          y={heroBurst.y}
          onComplete={() => setHeroBurst(null)}
        />
      )}

      <UpdateToast />
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
  const [tier, setTier] = useState<"simple" | "standard" | "advanced">("simple");
  const [name, setName] = useState("");
  const [color, setColor] = useState("fire");
  const [kind, setKind] = useState<"boolean" | "quantitative" | "avoid">("boolean");
  const [targetValue, setTargetValue] = useState<number>(2000);
  const [unit, setUnit] = useState("ml");
  const [stepIncrement, setStepIncrement] = useState<number>(250);
  const [dailyCost, setDailyCost] = useState<number>(15);
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const [icon, setIcon] = useState("flame");
  const [category, setCategory] = useState("daily");
  const [frequencyType, setFrequencyType] = useState<"daily" | "weekly_target" | "specific_days">("daily");
  const [targetDays, setTargetDays] = useState(3);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: newSubtaskTitle.trim() },
    ]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const activeSparkColor = COLOR_SWATCH[color] || "#EC894C";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      emoji: "🔥",
      kind,
      targetValue: kind === "quantitative" ? targetValue : undefined,
      unit: kind === "quantitative" ? unit : undefined,
      stepIncrement: kind === "quantitative" ? stepIncrement : undefined,
      dailyCost: kind === "avoid" ? dailyCost : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      icon,
      color,
      category,
      frequencyType,
      targetDaysPerWeek: frequencyType === "weekly_target" ? targetDays : undefined,
      customDays: frequencyType === "specific_days" ? selectedDays : undefined,
      notes: notes.trim() || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-sm">
      {/* 3-Tier Progressive Tabs */}
      <div className="flex rounded-xl bg-surface-2 p-1 border border-white/5">
        <button
          type="button"
          onClick={() => setTier("simple")}
          className={cn(
            "flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            tier === "simple"
              ? "bg-surface text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ⚡ Simple (5-sec)
        </button>
        <button
          type="button"
          onClick={() => setTier("standard")}
          className={cn(
            "flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            tier === "standard"
              ? "bg-surface text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Standard
        </button>
        <button
          type="button"
          onClick={() => setTier("advanced")}
          className={cn(
            "flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            tier === "advanced"
              ? "bg-surface text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Advanced
        </button>
      </div>

      {/* Live Tinted SparkMark Preview */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border border-white/5">
        <div className="grid size-11 place-items-center rounded-xl bg-surface border border-white/10 shadow-sm shrink-0">
          <SparkMark className="size-7" sparkColor={activeSparkColor} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-foreground truncate">
            {name.trim() || "Your habit name"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {tier === "simple"
              ? "Quick 5-second setup"
              : tier === "standard"
              ? `${frequencyType === "daily" ? "Daily rhythm" : "Scheduled rhythm"}`
              : "Advanced metrics & friction tracking"}
          </p>
        </div>
      </div>

      {/* Habit Name Input (All Tiers) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Habit Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Read 20 minutes, Morning walk"
          required
          autoFocus
          className="text-sm bg-surface-2 rounded-xl"
        />
      </div>

      {/* Habit Color Picker (All Tiers - Tints the Spark Mark) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
          <span>Habit Spark Color</span>
          <span className="text-[10px] text-muted-foreground capitalize">{color}</span>
        </label>
        <div className="flex items-center gap-2 pt-0.5">
          {COLOR_OPTIONS.map((c) => {
            const swatch = COLOR_SWATCH[c.value];
            const isSelected = color === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  "size-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center",
                  isSelected
                    ? "scale-110 border-white shadow-md ring-2 ring-ember/40"
                    : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                )}
                style={{ backgroundColor: swatch }}
                title={c.name}
                aria-label={`Color ${c.name}`}
              >
                {isSelected && <span className="size-2 rounded-full bg-white shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* STANDARD & ADVANCED TIERS: Targets, Units & Frequency */}
      {tier !== "simple" && (
        <>
          {/* Tracking Type */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Tracking Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "boolean", label: "Standard", desc: "Done / Not done" },
                { id: "quantitative", label: "Quantitative", desc: "Target & units" },
                { id: "avoid", label: "Avoid / Quit", desc: "Clean streak & cost" },
              ].map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id as typeof kind)}
                  className={cn(
                    "rounded-xl p-2 text-left border transition-all cursor-pointer",
                    kind === k.id
                      ? "bg-surface-2 border-ember text-foreground shadow-sm"
                      : "border-border/30 text-faint hover:text-foreground"
                  )}
                >
                  <span className="text-xs font-bold block">{k.label}</span>
                  <span className="text-[10px] text-faint block">{k.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantitative Settings */}
          {kind === "quantitative" && (
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-surface-2 border border-border/40">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Target Goal</label>
                <Input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value) || 1)}
                  className="h-8 text-xs bg-surface rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Unit Label</label>
                <Input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ml, pages, min"
                  className="h-8 text-xs bg-surface rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Step (+)</label>
                <Input
                  type="number"
                  value={stepIncrement}
                  onChange={(e) => setStepIncrement(Number(e.target.value) || 1)}
                  className="h-8 text-xs bg-surface rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Schedule & Frequency */}
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
                    "rounded-xl p-2 text-xs font-bold border transition-all cursor-pointer",
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
                        "size-6 rounded-full text-xs grid place-items-center cursor-pointer",
                        targetDays === n ? "bg-ember text-white" : "text-faint hover:text-foreground"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ADVANCED TIER ONLY: Quit/Avoid Cost Tracker, Subtasks, Day Mask, Friction Notes */}
      {tier === "advanced" && (
        <div className="space-y-4 pt-1 border-t border-white/5">
          {/* Avoid / Quit Cost Tracker */}
          {kind === "avoid" && (
            <div className="p-3 rounded-2xl bg-surface-2 border border-border/40">
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Daily Cost Saved ($ / day)
              </label>
              <Input
                type="number"
                value={dailyCost}
                onChange={(e) => setDailyCost(Number(e.target.value) || 0)}
                placeholder="e.g. 15"
                className="h-8 text-xs bg-surface rounded-lg"
              />
            </div>
          )}

          {/* Subtasks Checklist */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Subtasks Checklist (Optional)
            </label>
            <div className="flex gap-1.5">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="e.g. Put on shoes, Fill water bottle..."
                className="text-xs h-8 bg-surface-2 rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                className="h-8 px-2.5 text-xs rounded-xl"
              >
                Add Step
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1 pt-1">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-surface-2">
                    <span>• {st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-faint hover:text-destructive cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day Mask (Specific Days) */}
          <div className="p-2.5 rounded-xl bg-surface-2 space-y-1.5">
            <span className="text-xs text-muted-foreground block font-semibold">Active Day Mask:</span>
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
                      "py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
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

          {/* Friction / Guideline Reflection Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Friction Notes &amp; Anchor Cues
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              placeholder="e.g. Put shoes next to front door. Keep it light, after dinner walk."
              className="text-xs min-h-[60px] bg-surface-2 resize-none rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Progressive Tier Helper Link */}
      {tier === "simple" && (
        <button
          type="button"
          onClick={() => setTier("standard")}
          className="text-xs text-ember hover:underline font-semibold block pt-1 cursor-pointer"
        >
          More Options (Target, schedule &amp; units) →
        </button>
      )}
      {tier === "standard" && (
        <button
          type="button"
          onClick={() => setTier("advanced")}
          className="text-xs text-ember hover:underline font-semibold block pt-1 cursor-pointer"
        >
          Advanced Options (Subtasks, avoid costs &amp; friction notes) →
        </button>
      )}

      {/* Daily Reminder Time Picker */}
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelClock className="size-4 text-ember" />
            <div>
              <p className="font-semibold text-xs text-foreground">Daily Reminder</p>
              <p className="text-[11px] text-muted-foreground">Notification at a set time</p>
            </div>
          </div>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
          />
        </div>
        {reminderEnabled && (
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-xs text-muted-foreground">Reminder time:</span>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-32 h-8 text-xs bg-surface text-center font-mono rounded-lg"
            />
          </div>
        )}
      </div>

      <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-white/5">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-ember text-white hover:bg-ember/90 shadow-md">
          Create Habit
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
  const [showVacationInput, setShowVacationInput] = useState(false);
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");
  const [vacReason, setVacReason] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(habit.reminderEnabled));
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || "09:00");
  const today = todayKey();
  const milestones = getMilestones(habit.bestStreak);

  const handleToggleReminder = (enabled: boolean) => {
    setReminderEnabled(enabled);
    habitActions.update(habit.id, {
      reminderEnabled: enabled,
      reminderTime: enabled ? reminderTime : undefined,
    });
  };

  const handleTimeChange = (newTime: string) => {
    setReminderTime(newTime);
    if (reminderEnabled) {
      habitActions.update(habit.id, { reminderTime: newTime });
    }
  };

  const handleAddVacation = () => {
    if (!vacStart || !vacEnd) return;
    habitActions.addVacation(habit.id, vacStart, vacEnd, vacReason);
    setVacStart("");
    setVacEnd("");
    setVacReason("");
    setShowVacationInput(false);
  };

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
          <PixelHeart className="size-3.5" /> Forgive
        </Button>
      </div>

      {/* Vacation / Pause Mode & Multi-period Vacation Ranges */}
      <div className="rounded-2xl border border-border/40 bg-surface-2/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-xs flex items-center gap-1.5">
              <PixelSparkles className="size-3.5 text-ember" /> Vacation &amp; Pause
            </p>
            <p className="text-[11px] text-faint">Freeze streak safely during travel or illness</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVacationInput(!showVacationInput)}
              className="text-xs font-bold gap-1 border-border text-faint hover:text-foreground"
            >
              <PixelPlus className="size-3" /> Interval
            </Button>
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={handleTogglePause}
              className={cn(
                "text-xs font-bold gap-1",
                isPaused ? "bg-ember text-white" : "border-border text-faint hover:text-foreground"
              )}
            >
              {isPaused ? <PixelPlay className="size-3.5" /> : <PixelPause className="size-3.5" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          </div>
        </div>

        {/* Form to add a vacation range */}
        {showVacationInput && (
          <div className="p-2.5 rounded-xl bg-surface border border-border/40 space-y-2 text-xs">
            <p className="font-semibold text-[11px] text-muted-foreground uppercase">Add Vacation Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-faint block mb-0.5">Start Date</label>
                <Input
                  type="date"
                  value={vacStart}
                  onChange={(e) => setVacStart(e.target.value)}
                  className="h-7 text-xs bg-surface-2"
                />
              </div>
              <div>
                <label className="text-[10px] text-faint block mb-0.5">End Date</label>
                <Input
                  type="date"
                  value={vacEnd}
                  onChange={(e) => setVacEnd(e.target.value)}
                  className="h-7 text-xs bg-surface-2"
                />
              </div>
            </div>
            <Input
              type="text"
              placeholder="Reason (optional, e.g. Summer holiday, flu)"
              value={vacReason}
              onChange={(e) => setVacReason(e.target.value)}
              className="h-7 text-xs bg-surface-2"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVacationInput(false)}
                className="h-7 px-2 text-xs text-faint"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddVacation}
                disabled={!vacStart || !vacEnd}
                className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Range
              </Button>
            </div>
          </div>
        )}

        {/* Existing vacation ranges list */}
        {habit.vacationRanges && habit.vacationRanges.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border/20">
            <p className="text-[10px] font-semibold text-faint uppercase">Scheduled Vacations</p>
            {habit.vacationRanges.map((vr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-surface/60 border border-border/20"
              >
                <span className="font-mono text-[11px] text-ember">
                  {vr.start} → {vr.end}
                  {vr.reason && <span className="font-sans text-faint ml-1.5 font-normal">({vr.reason})</span>}
                </span>
                <button
                  type="button"
                  onClick={() => habitActions.removeVacation(habit.id, idx)}
                  className="text-faint hover:text-destructive text-xs ml-2"
                  title="Remove vacation range"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Reminder Time Picker */}
      <div className="rounded-2xl border border-border/40 bg-surface-2/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelClock className="size-4 text-ember" />
            <div>
              <p className="font-semibold text-xs">Daily Reminder</p>
              <p className="text-[11px] text-faint">
                {reminderEnabled ? `Scheduled for ${reminderTime} daily` : "Enable daily reminder alert"}
              </p>
            </div>
          </div>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={handleToggleReminder}
          />
        </div>
        {reminderEnabled && (
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-xs text-muted-foreground">Alert time:</span>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-32 h-8 text-xs bg-surface text-center font-mono rounded-lg"
            />
          </div>
        )}
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
          <PixelClock className="size-3.5" />
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
          <PixelStar className={cn("size-3.5", habit.isStarred && "fill-gold text-gold")} />
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
          <PixelArchive className="size-3.5" />
          {isArchived(habit) ? "Unarchive" : "Archive"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(habit)}
          className="text-xs gap-1.5 font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <PixelTrash className="size-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
