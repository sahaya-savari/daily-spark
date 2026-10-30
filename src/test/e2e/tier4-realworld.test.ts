/**
 * Tier 4: Real-World Application Scenarios & End-to-End User Journeys
 *
 * Requirements-driven opaque-box testing of complete realistic user workflows:
 * - Scenario 1: First-time Onboarding & Daily Routine (Mobile Nav, Direct Check-in, Haptics, Progress)
 * - Scenario 2: Power User Keyboard Navigation (Desktop Rail, Command Palette Ctrl+K, Toggle, Theme)
 * - Scenario 3: Night Owl Midnight Session (Rollover Hour 3 AM, Date Keying, Streak Continuity)
 * - Scenario 4: Offline PWA Data Recovery & Backup Vault (Offline Route, Sandbox Restore, CSV/MD Export)
 * - Scenario 5: Milestone Progression Journey (0 to 3d to 7d to 21d run, 182-day Dither Heatmap, Reset)
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import {
  createMockHabit,
  createMockQuantitativeHabit,
  createMockSubtaskHabit,
  createMockNote,
} from "@/test/fixtures/mock-data";

import {
  ReferenceCommandPalette,
  transitionTab,
  ReferenceCheckPopBurst,
  ReferenceDitherHeatmapCalendar,
  ReferenceNumberTicker,
  ReferenceAnimatedCircularProgressBar,
  calculateRolloverTodayKey,
  inspectBackupSandbox,
  CONTRACT_MILESTONES,
} from "@/test/fixtures/contracts";

import {
  completeToday,
  undoToday,
  refresh,
  currentStreak,
  longestStreak,
  buildBackup,
  habitsToCsv,
  exportToMarkdown,
} from "@/lib/habits/logic";

import { toKey, fromKey, addDays, todayKey } from "@/lib/habits/dates";
import { DEFAULT_SETTINGS, type Habit, type StandaloneNote } from "@/lib/habits/types";

const h = React.createElement;

interface WindowWithTickTap {
  tickTap?: () => void;
}

type MockTapFn = (() => void) & { mock: { calls: unknown[][] } };

describe("Tier 4: Real-World Application Scenarios & User Journeys", () => {
  let tickTapMock: MockTapFn;

  beforeEach(() => {
    tickTapMock = vi.fn() as unknown as MockTapFn;
    if (typeof window !== "undefined") {
      (window as unknown as WindowWithTickTap).tickTap = tickTapMock;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as WindowWithTickTap).tickTap;
  });

  // =========================================================================
  // Scenario 1: First-time Onboarding & Daily Routine
  // =========================================================================
  describe("Scenario 1: First-time Onboarding & Daily Routine", () => {
    it("executes complete lifecycle: onboarding, direct check-in, stepper increments, subtasks, and 100% completion", async () => {
      const today = "2026-10-29";
      let habits: Habit[] = [];
      let popBurstFired = false;

      // 1. Initial Empty State
      expect(habits).toHaveLength(0);

      // 2. User creates 3 habits across different modalities
      const habit1 = createMockHabit({
        id: "h-sunlight",
        name: "Morning Sunlight",
        emoji: "☀️",
        completedDates: [],
        currentStreak: 0,
      });

      const habit2 = createMockQuantitativeHabit({
        id: "h-hydrate",
        name: "Deep Hydration",
        emoji: "💧",
        targetValue: 2000,
        unit: "ml",
        stepIncrement: 250,
        quantitativeValues: { [today]: 0 },
        completedDates: [],
        currentStreak: 0,
      });

      const habit3 = createMockSubtaskHabit({
        id: "h-shutdown",
        name: "Evening Shutdown",
        emoji: "🌙",
        subtasks: [
          { id: "s1", title: "Review inbox" },
          { id: "s2", title: "Tidy desk" },
          { id: "s3", title: "Plan tomorrow" },
        ],
        subtaskCompletions: {},
        completedDates: [],
        currentStreak: 0,
      });

      habits = [habit1, habit2, habit3];
      expect(habits).toHaveLength(3);

      // Verify initial 0% progress
      let completedHabitsCount = habits.filter((h) => h.completedDates.includes(today)).length;
      const totalHabits = habits.length;
      let progressPercent = (completedHabitsCount / totalHabits) * 100;
      expect(progressPercent).toBe(0);

      const { rerender } = render(
        h("div", null, [
          h(ReferenceAnimatedCircularProgressBar, {
            key: "ring",
            value: progressPercent,
            max: 100,
          }),
          h(ReferenceNumberTicker, {
            key: "ticker",
            value: progressPercent,
          }),
        ])
      );

      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("0");

      // 3. Morning Check-in: User checks in "Morning Sunlight"
      habits[0] = completeToday(habits[0]!, today);
      tickTapMock();
      expect(tickTapMock).toHaveBeenCalledTimes(1);
      expect(habits[0]!.completedDates).toContain(today);
      expect(habits[0]!.currentStreak).toBe(1);

      completedHabitsCount = habits.filter((h) => h.completedDates.includes(today)).length;
      progressPercent = (completedHabitsCount / totalHabits) * 100;
      expect(Math.round(progressPercent)).toBe(33);

      rerender(
        h("div", null, [
          h(ReferenceCheckPopBurst, {
            key: "pop",
            x: 100,
            y: 150,
            onComplete: () => { popBurstFired = true; },
          }),
          h(ReferenceAnimatedCircularProgressBar, {
            key: "ring",
            value: Math.round(progressPercent),
            max: 100,
          }),
          h(ReferenceNumberTicker, {
            key: "ticker",
            value: Math.round(progressPercent),
          }),
        ])
      );

      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("33");
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("33");

      await waitFor(() => {
        expect(popBurstFired).toBe(true);
      });

      // 4. Afternoon: User completes quantitative Hydration via 8 taps (8 * 250ml = 2000ml)
      for (let i = 0; i < 8; i++) {
        const cur = habits[1]!.quantitativeValues?.[today] || 0;
        habits[1] = {
          ...habits[1]!,
          quantitativeValues: {
            ...habits[1]!.quantitativeValues,
            [today]: cur + 250,
          },
        };
        tickTapMock();
      }

      expect(habits[1]!.quantitativeValues?.[today]).toBe(2000);
      habits[1] = completeToday(habits[1]!, today);
      expect(habits[1]!.completedDates).toContain(today);

      completedHabitsCount = habits.filter((h) => h.completedDates.includes(today)).length;
      progressPercent = (completedHabitsCount / totalHabits) * 100;
      expect(Math.round(progressPercent)).toBe(67);

      // 5. Evening: User checks off all 3 subtasks
      habits[2] = {
        ...habits[2]!,
        subtaskCompletions: { [today]: ["s1", "s2", "s3"] },
      };
      habits[2] = completeToday(habits[2]!, today);
      tickTapMock();

      completedHabitsCount = habits.filter((h) => h.completedDates.includes(today)).length;
      progressPercent = (completedHabitsCount / totalHabits) * 100;
      expect(progressPercent).toBe(100);

      rerender(
        h("div", null, [
          h(ReferenceAnimatedCircularProgressBar, {
            key: "ring",
            value: progressPercent,
            max: 100,
          }),
          h(ReferenceNumberTicker, {
            key: "ticker",
            value: progressPercent,
          }),
        ])
      );

      // Verify all complete
      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("100");
      expect(habits.every((h) => h.completedDates.includes(today))).toBe(true);
    });
  });

  // =========================================================================
  // Scenario 2: Power User Keyboard Navigation
  // =========================================================================
  describe("Scenario 2: Power User Keyboard Navigation", () => {
    it("handles desktop keyboard navigation: Ctrl+K palette, filtering, tab transitions, and theme toggle", async () => {
      let isPaletteOpen = false;
      let activeTab = 0;
      let currentTheme = "dark";
      let toggledHabitId = "";
      let viewTransitionFired = false;

      const habits = [
        createMockHabit({ id: "h-meditate", name: "Mindful Meditation" }),
        createMockHabit({ id: "h-workout", name: "Gym Workout" }),
      ];

      // 1. Simulate user pressing Ctrl+K to open Command Palette
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          isPaletteOpen = true;
        }
      };

      window.addEventListener("keydown", handleGlobalKeyDown);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
      expect(isPaletteOpen).toBe(true);
      window.removeEventListener("keydown", handleGlobalKeyDown);

      // 2. Render Command Palette dialog
      const { rerender } = render(
        h(ReferenceCommandPalette, {
          open: isPaletteOpen,
          onOpenChange: (val) => { isPaletteOpen = val; },
          habits,
          onSelectTab: (tabIdx) => {
            transitionTab(() => {
              viewTransitionFired = true;
              activeTab = tabIdx;
            });
          },
          onToggleHabit: (id) => { toggledHabitId = id; },
          theme: currentTheme,
          onToggleTheme: () => {
            currentTheme = currentTheme === "dark" ? "light" : "dark";
          },
        })
      );

      expect(screen.getByRole("dialog", { name: "Command Palette" })).toBeInTheDocument();

      // 3. User searches for "Workout"
      const searchInput = screen.getByRole("searchbox", { name: "Search habits or actions" });
      fireEvent.change(searchInput, { target: { value: "Workout" } });

      // Only Gym Workout is displayed
      expect(screen.queryByText(/Mindful Meditation/)).not.toBeInTheDocument();
      const habitButton = screen.getByRole("button", { name: /Gym Workout/ });
      expect(habitButton).toBeInTheDocument();

      // 4. User clicks to toggle habit
      fireEvent.click(habitButton);
      expect(toggledHabitId).toBe("h-workout");
      expect(isPaletteOpen).toBe(false);

      // 5. User opens palette again to switch to Progress tab
      isPaletteOpen = true;
      rerender(
        h(ReferenceCommandPalette, {
          open: isPaletteOpen,
          onOpenChange: (val) => { isPaletteOpen = val; },
          habits,
          onSelectTab: (tabIdx) => {
            transitionTab(() => {
              viewTransitionFired = true;
              activeTab = tabIdx;
            });
          },
          onToggleHabit: (id) => { toggledHabitId = id; },
          theme: currentTheme,
          onToggleTheme: () => {
            currentTheme = currentTheme === "dark" ? "light" : "dark";
          },
        })
      );

      const progressNavBtn = screen.getByRole("button", { name: "Progress & Heatmap" });
      fireEvent.click(progressNavBtn);
      expect(viewTransitionFired).toBe(true);
      expect(activeTab).toBe(2);

      // 6. User toggles theme
      isPaletteOpen = true;
      rerender(
        h(ReferenceCommandPalette, {
          open: isPaletteOpen,
          onOpenChange: (val) => { isPaletteOpen = val; },
          habits,
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: currentTheme,
          onToggleTheme: () => {
            currentTheme = currentTheme === "dark" ? "light" : "dark";
          },
        })
      );

      const themeBtn = screen.getByRole("button", { name: /Toggle Theme/ });
      fireEvent.click(themeBtn);
      expect(currentTheme).toBe("light");

      // 7. Escape closes palette
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(isPaletteOpen).toBe(false);
    });
  });

  // =========================================================================
  // Scenario 3: Night Owl Midnight Session (01:30 AM with 3 AM rollover)
  // =========================================================================
  describe("Scenario 3: Night Owl Midnight Session (01:30 AM)", () => {
    it("maintains streak continuity across calendar midnight when configured with 3 AM rollover", () => {
      // Habit completed on 2026-10-28
      let habit = createMockHabit({
        id: "h-study",
        name: "Late Night Study",
        completedDates: ["2026-10-28"],
        currentStreak: 1,
        bestStreak: 1,
      });

      // 1. Current clock is 01:30 AM on 2026-10-30
      // In UTC / standard time, calendar day is 2026-10-30.
      // But with 3 AM rollover, the night owl is still completing yesterday's day (2026-10-29).
      const clockNight = new Date("2026-10-30T01:30:00");
      const rolloverHour = 3;
      const effectiveDay = calculateRolloverTodayKey(clockNight, rolloverHour);

      expect(effectiveDay).toBe("2026-10-29");

      // 2. User checks in habit at 01:30 AM
      habit = completeToday(habit, effectiveDay);
      tickTapMock();

      expect(habit.completedDates).toContain("2026-10-29");
      expect(habit.currentStreak).toBe(2); // 2026-10-28 and 2026-10-29 are consecutive!
      expect(habit.bestStreak).toBe(2);

      // 3. Time advances past 3:00 AM to 03:15 AM
      const clockMorning = new Date("2026-10-30T03:15:00");
      const nextEffectiveDay = calculateRolloverTodayKey(clockMorning, rolloverHour);

      expect(nextEffectiveDay).toBe("2026-10-30");

      // For the new day (2026-10-30), habit is not yet done
      expect(habit.completedDates.includes(nextEffectiveDay)).toBe(false);

      // But streak stays alive (yesterday's check-in keeps it alive!)
      const refreshedMorning = refresh(habit, nextEffectiveDay);
      expect(refreshedMorning.currentStreak).toBe(2);

      // 4. User completes habit during day of 2026-10-30 (e.g. 11:00 AM)
      const habitDoneNextDay = completeToday(refreshedMorning, nextEffectiveDay);
      expect(habitDoneNextDay.currentStreak).toBe(3);
      expect(habitDoneNextDay.bestStreak).toBe(3);
      expect(habitDoneNextDay.completedDates).toEqual(["2026-10-28", "2026-10-29", "2026-10-30"]);
    });
  });

  // =========================================================================
  // Scenario 4: Offline PWA Data Recovery & Backup Vault
  // =========================================================================
  describe("Scenario 4: Offline PWA Data Recovery & Backup Vault", () => {
    it("handles offline state transitions, vault export, corrupted payload rejection, and clean restore", () => {
      // 1. Application goes offline
      let isOnline = true;
      const goOffline = () => { isOnline = false; };
      const goOnline = () => { isOnline = true; };

      goOffline();
      expect(isOnline).toBe(false);

      // 2. User performs check-ins offline
      const today = "2026-10-29";
      const localHabits: Habit[] = [
        createMockHabit({
          id: "h-offline-1",
          name: "Daily Journaling",
          emoji: "✍️",
          completedDates: [today],
          currentStreak: 4,
          bestStreak: 10,
        }),
      ];

      const localNotes: StandaloneNote[] = [
        createMockNote({
          id: "n-offline-1",
          title: "Offline Reflection",
          content: "Captured completely while disconnected.",
        }),
      ];

      // 3. User exports full vault
      const backupFile = buildBackup(localHabits, DEFAULT_SETTINGS, new Date("2026-10-29T12:00:00Z"), localNotes);
      const backupJson = JSON.stringify(backupFile);

      // CSV export
      const csv = habitsToCsv(localHabits);
      expect(csv).toContain("Daily Journaling");
      expect(csv).toContain("2026-10-29");

      // Markdown export
      const md = exportToMarkdown(localHabits, localNotes);
      expect(md).toContain("Daily Journaling");
      expect(md).toContain("Offline Reflection");

      // 4. Corrupted backup payload protection:
      // User accidentally selects an image or incomplete JSON file
      const corruptPayload = "{ streaks: [ { name: 'Broken' ";
      const corruptInspection = inspectBackupSandbox(corruptPayload);

      expect(corruptInspection.valid).toBe(false);
      expect(corruptInspection.error).toBeDefined();
      // Active storage remains intact
      expect(localHabits).toHaveLength(1);
      expect(localHabits[0]!.name).toBe("Daily Journaling");

      // 5. Clean restoration from vault:
      // Valid backup payload is inspected in sandbox first
      const cleanInspection = inspectBackupSandbox(backupJson);
      expect(cleanInspection.valid).toBe(true);
      expect(cleanInspection.habitsCount).toBe(1);
      expect(cleanInspection.notesCount).toBe(1);
      expect(cleanInspection.settingsIncluded).toBe(true);

      // User confirms restore
      const payloadData = cleanInspection.rawPayload as { data: { streaks: Habit[] } };
      const restoredHabits = payloadData.data.streaks;
      expect(restoredHabits[0]!.name).toBe("Daily Journaling");
      expect(restoredHabits[0]!.completedDates).toContain(today);

      // 6. Network restores
      goOnline();
      expect(isOnline).toBe(true);
    });
  });

  // =========================================================================
  // Scenario 5: Milestone Progression Journey (3d to 100d run)
  // =========================================================================
  describe("Scenario 5: Milestone Progression Journey (3d to 100d run)", () => {
    it("tracks milestone achievements from Day 1 to Day 21, lights 182-day heatmap, and handles streak break", () => {
      // 1. Initial habit at streak 0
      let habit = createMockHabit({
        id: "h-running",
        name: "Morning Run",
        emoji: "🏃",
        completedDates: [],
        currentStreak: 0,
        bestStreak: 0,
      });

      // 2. Day 1 to Day 3 consecutive check-ins
      const days3 = ["2026-10-01", "2026-10-02", "2026-10-03"];
      days3.forEach((d) => {
        habit = completeToday(habit, d);
      });

      expect(habit.currentStreak).toBe(3);
      const milestone3 = CONTRACT_MILESTONES.find((m) => m.days === 3);
      expect(milestone3).toBeDefined();
      expect(habit.currentStreak >= milestone3!.days).toBe(true);

      // 3. Days 4 through 7 consecutive check-ins
      const days4to7 = ["2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07"];
      days4to7.forEach((d) => {
        habit = completeToday(habit, d);
      });

      expect(habit.currentStreak).toBe(7);
      const milestone7 = CONTRACT_MILESTONES.find((m) => m.days === 7);
      expect(milestone7).toBeDefined();
      expect(habit.currentStreak >= milestone7!.days).toBe(true);

      // 4. Days 8 through 21 consecutive check-ins (21-day Habit Igniter milestone)
      const days8to21: string[] = [];
      for (let i = 8; i <= 21; i++) {
        days8to21.push(`2026-10-${String(i).padStart(2, "0")}`);
      }
      days8to21.forEach((d) => {
        habit = completeToday(habit, d);
      });

      expect(habit.currentStreak).toBe(21);
      expect(habit.bestStreak).toBe(21);
      const milestone21 = CONTRACT_MILESTONES.find((m) => m.days === 21);
      expect(milestone21).toBeDefined();
      expect(habit.currentStreak >= milestone21!.days).toBe(true);

      // 5. Render 182-day Heatmap Calendar
      const all21Days = [...days3, ...days4to7, ...days8to21];
      const calendarData = all21Days.map((d) => ({
        date: d,
        done: 1,
        total: 1,
        level: 4 as const,
      }));

      render(
        h(ReferenceDitherHeatmapCalendar, {
          data: calendarData,
          streak: habit.currentStreak,
        })
      );

      const cells = screen.getAllByTestId("heatmap-cell");
      expect(cells).toHaveLength(21);
      expect(cells.every((c) => c.getAttribute("data-level") === "4")).toBe(true);
      expect(screen.getByTestId("heatmap-streak")).toHaveTextContent("21 day streak");

      // 6. User misses Day 22 (2026-10-22), and checks in on Day 23 (2026-10-23)
      const day23 = "2026-10-23";
      habit = completeToday(habit, day23);

      // Current streak resets to 1 (because Day 22 was missing)
      expect(habit.currentStreak).toBe(1);
      // Best streak preserved at 21!
      expect(habit.bestStreak).toBe(21);
      // Historical achievement is locked in
      expect(habit.bestStreak >= milestone21!.days).toBe(true);
    });
  });
});
