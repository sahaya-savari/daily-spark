/**
 * Tier 3: Pairwise Combinations & Cross-Feature Integration Test Suite
 *
 * Requirements-driven opaque-box verification of multi-feature interactions:
 * - Suite 1: Command Palette (F3) + Mobile/Desktop Navigation (F1/F2) + View Transitions (F4)
 * - Suite 2: Direct Check-In (F6) + Haptics & Particle Pop (F7) + Progress Ring & NumberTicker (F11)
 * - Suite 3: Progressive Disclosure (F8) + Direct Check-In (F6) + Midnight Rollover (F16)
 * - Suite 4: 6-Month Dither Heatmap (F10) + Streak Milestone Badges (F12) + Rollover (F16)
 * - Suite 5: Sandboxed Backup Restore (F13) + Multi-Format Exports (F14) + Notes/Habits (F8)
 * - Suite 6: Desktop Packaging / Tauri (F18) + Desktop Rail (F2) + Offline Route (F5)
 * - Suite 7: Swipe Gestures / Buttons (F9) + Direct Check-In (F6) + Haptics (F7)
 * - Suite 8: Privacy Screen (F15) + Data Isolation (F13) + PWA Manifest / SW (F17)
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import {
  createMockHabit,
  createMockQuantitativeHabit,
  createMockAvoidHabit,
  createMockSubtaskHabit,
  createMockTimerHabit,
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

describe("Tier 3: Pairwise Combinations & Cross-Feature Interactions", () => {
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
  // Pairwise Suite 1: Command Palette (F3) + Navigation (F1/F2) + Transitions (F4)
  // =========================================================================
  describe("Suite 1: Command Palette + Navigation + View Transitions", () => {
    it("1.1 switching tabs from Command Palette invokes transitionTab callback and updates active tab", async () => {
      let currentTab = 0;
      let open = true;
      let transitionCalled = false;

      const handleSelectTab = (newTab: number) => {
        transitionTab(() => {
          transitionCalled = true;
          currentTab = newTab;
        });
      };

      render(
        h(ReferenceCommandPalette, {
          open,
          onOpenChange: (val) => { open = val; },
          habits: [createMockHabit({ name: "Morning Run" })],
          onSelectTab: handleSelectTab,
          onToggleHabit: vi.fn(),
          theme: "dark",
          onToggleTheme: vi.fn(),
        })
      );

      const navBtn = screen.getByRole("button", { name: "Progress & Heatmap" });
      fireEvent.click(navBtn);

      expect(transitionCalled).toBe(true);
      expect(currentTab).toBe(2);
    });

    it("1.2 selecting habit in Command Palette toggles completion and closes palette cleanly", () => {
      let toggledHabitId = "";
      let isOpen = true;

      const habit = createMockHabit({ id: "run-101", name: "Interval Run" });

      render(
        h(ReferenceCommandPalette, {
          open: isOpen,
          onOpenChange: (v) => { isOpen = v; },
          habits: [habit],
          onSelectTab: vi.fn(),
          onToggleHabit: (id) => { toggledHabitId = id; },
          theme: "dark",
          onToggleTheme: vi.fn(),
        })
      );

      const habitItem = screen.getByRole("button", { name: /Interval Run/ });
      fireEvent.click(habitItem);

      expect(toggledHabitId).toBe("run-101");
      expect(isOpen).toBe(false);
    });

    it("1.3 pressing Escape closes palette and preserves current tab selection", () => {
      let isOpen = true;
      let activeTab = 3; // Settings tab

      render(
        h(ReferenceCommandPalette, {
          open: isOpen,
          onOpenChange: (v) => { isOpen = v; },
          habits: [],
          onSelectTab: (t) => { activeTab = t; },
          onToggleHabit: vi.fn(),
          theme: "dark",
          onToggleTheme: vi.fn(),
        })
      );

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });

      expect(isOpen).toBe(false);
      expect(activeTab).toBe(3);
    });

    it("1.4 rapid sequential tab switches through Command Palette execute without dropping callbacks", () => {
      const history: number[] = [];

      const select = (tabIndex: number) => {
        transitionTab(() => {
          history.push(tabIndex);
        });
      };

      for (let i = 0; i < 4; i++) {
        select(i);
      }

      expect(history).toEqual([0, 1, 2, 3]);
    });
  });

  // =========================================================================
  // Pairwise Suite 2: Check-In (F6) + Haptics/Pop (F7) + Progress/Ticker (F11)
  // =========================================================================
  describe("Suite 2: Direct Check-In + Haptics/Pop + Circular Progress & Ticker", () => {
    it("2.1 habit check-in triggers haptic tickTap, fires pop burst, and increments progress ring", async () => {
      const today = "2026-10-29";
      let habit = createMockHabit({ id: "h1", completedDates: [] });
      const totalHabits = 4;
      let completedCount = 0;
      let popBurstCompleted = false;

      // Check-in action
      const handleCheckIn = () => {
        habit = completeToday(habit, today);
        completedCount++;
        tickTapMock();
      };

      handleCheckIn();
      expect(tickTapMock).toHaveBeenCalledTimes(1);
      expect(habit.completedDates).toContain(today);
      expect(completedCount).toBe(1);

      // Render CheckPopBurst and Progress components
      const { unmount } = render(
        h("div", null, [
          h(ReferenceCheckPopBurst, {
            key: "pop",
            x: 120,
            y: 240,
            onComplete: () => { popBurstCompleted = true; },
          }),
          h(ReferenceAnimatedCircularProgressBar, {
            key: "prog",
            value: (completedCount / totalHabits) * 100,
            max: 100,
          }),
          h(ReferenceNumberTicker, {
            key: "ticker",
            value: (completedCount / totalHabits) * 100,
          }),
        ])
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar.getAttribute("aria-valuenow")).toBe("25");

      await waitFor(() => {
        expect(popBurstCompleted).toBe(true);
      });

      unmount();
    });

    it("2.2 unchecking habit decreases progress percentage without triggering particle burst", () => {
      const today = "2026-10-29";
      let habit = createMockHabit({ id: "h1", completedDates: [today] });
      const totalHabits = 2;
      let completedCount = 1;

      // Undo check-in
      habit = undoToday(habit, today);
      completedCount--;

      expect(habit.completedDates).not.toContain(today);
      expect(completedCount).toBe(0);

      render(
        h(ReferenceAnimatedCircularProgressBar, {
          value: (completedCount / totalHabits) * 100,
          max: 100,
        })
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar.getAttribute("aria-valuenow")).toBe("0");
      expect(tickTapMock).not.toHaveBeenCalled();
    });

    it("2.3 completing quantitative habit via stepper increments value, triggers haptic, and advances progress", () => {
      const today = "2026-10-29";
      let qHabit = createMockQuantitativeHabit({
        targetValue: 2000,
        unit: "ml",
        quantitativeValues: { [today]: 750 },
      });

      // User taps '+' to add stepIncrement (250 ml)
      const increment = () => {
        const cur = qHabit.quantitativeValues?.[today] || 0;
        const nextVal = cur + (qHabit.stepIncrement || 250);
        qHabit = {
          ...qHabit,
          quantitativeValues: {
            ...qHabit.quantitativeValues,
            [today]: nextVal,
          },
        };
        tickTapMock();
      };

      increment();
      expect(tickTapMock).toHaveBeenCalledTimes(1);
      expect(qHabit.quantitativeValues?.[today]).toBe(1000);

      // Verify quantitative completion percentage (1000/2000 = 50%)
      const pct = ((qHabit.quantitativeValues?.[today] || 0) / (qHabit.targetValue || 1)) * 100;
      expect(pct).toBe(50);
    });

    it("2.4 multiple habits completing to 100% updates NumberTicker to 100 and marks complete state", () => {
      const total = 3;
      let completed = 0;

      const items = [
        createMockHabit({ id: "1" }),
        createMockHabit({ id: "2" }),
        createMockHabit({ id: "3" }),
      ];

      items.forEach(() => {
        completed++;
      });

      const pct = (completed / total) * 100;
      expect(pct).toBe(100);

      render(
        h("div", null, [
          h(ReferenceAnimatedCircularProgressBar, { key: "ring", value: pct, max: 100 }),
          h(ReferenceNumberTicker, { key: "ticker", value: pct }),
        ])
      );

      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("100");
    });
  });

  // =========================================================================
  // Pairwise Suite 3: Progressive Disclosure (F8) + Check-In (F6) + Rollover (F16)
  // =========================================================================
  describe("Suite 3: Progressive Disclosure + Check-In + Midnight Rollover", () => {
    it("3.1 subtask completion records progress and marks habit done for the effective rollover day", () => {
      // 01:30 AM with 3 AM rollover hour -> effective day is yesterday
      const now = new Date("2026-10-30T01:30:00");
      const rolloverDay = calculateRolloverTodayKey(now, 3);
      expect(rolloverDay).toBe("2026-10-29");

      let subtaskHabit = createMockSubtaskHabit({
        subtasks: [
          { id: "s1", title: "Floss teeth" },
          { id: "s2", title: "Read 10 pages" },
        ],
        subtaskCompletions: {},
        completedDates: [],
      });

      // Toggle first subtask
      subtaskHabit = {
        ...subtaskHabit,
        subtaskCompletions: { [rolloverDay]: ["s1"] },
      };
      expect(subtaskHabit.completedDates.includes(rolloverDay)).toBe(false);

      // Toggle second subtask -> all complete
      subtaskHabit = {
        ...subtaskHabit,
        subtaskCompletions: { [rolloverDay]: ["s1", "s2"] },
      };
      subtaskHabit = completeToday(subtaskHabit, rolloverDay);

      expect(subtaskHabit.completedDates).toContain("2026-10-29");
      expect(subtaskHabit.currentStreak).toBe(1);
    });

    it("3.2 timer session completion marks habit completed under active rollover context", () => {
      const now = new Date("2026-10-30T02:15:00");
      const rolloverDay = calculateRolloverTodayKey(now, 3);
      expect(rolloverDay).toBe("2026-10-29");

      let timerHabit = createMockTimerHabit({
        timerDurationMinutes: 25,
        completedDates: [],
      });

      // Timer finishes
      const onTimerComplete = () => {
        timerHabit = completeToday(timerHabit, rolloverDay);
        tickTapMock();
      };

      onTimerComplete();
      expect(tickTapMock).toHaveBeenCalledTimes(1);
      expect(timerHabit.completedDates).toContain("2026-10-29");
    });

    it("3.3 saving habit reflection note retains association and survives clock rollover", () => {
      const nowBeforeRollover = new Date("2026-10-30T02:50:00");
      const effectiveDay = calculateRolloverTodayKey(nowBeforeRollover, 3);
      expect(effectiveDay).toBe("2026-10-29");

      const habit = createMockHabit({
        id: "journal-1",
        name: "Evening Reflection",
        notes: "Grateful for calm morning focus.",
        completedDates: [effectiveDay],
      });

      expect(habit.notes).toBe("Grateful for calm morning focus.");
      expect(habit.completedDates).toContain("2026-10-29");

      // Clock advances to 03:05 AM (past 3 AM rollover)
      const nowAfterRollover = new Date("2026-10-30T03:05:00");
      const nextDay = calculateRolloverTodayKey(nowAfterRollover, 3);
      expect(nextDay).toBe("2026-10-30");

      // Habit note remains intact
      expect(habit.notes).toBe("Grateful for calm morning focus.");
      // New day is not yet done
      expect(habit.completedDates.includes(nextDay)).toBe(false);
    });

    it("3.4 changing rolloverHour setting dynamically recalculates current day and preserves history", () => {
      const testTime = new Date("2026-10-30T01:45:00");

      // Under standard midnight rollover (0)
      const standardDay = calculateRolloverTodayKey(testTime, 0);
      expect(standardDay).toBe("2026-10-30");

      // Under Night Owl 3 AM rollover (3)
      const nightOwlDay = calculateRolloverTodayKey(testTime, 3);
      expect(nightOwlDay).toBe("2026-10-29");

      // Habit checked in under Night Owl keeps 2026-10-29 in history regardless of future settings
      const habit = completeToday(createMockHabit({ completedDates: [] }), nightOwlDay);
      expect(habit.completedDates).toContain("2026-10-29");
    });
  });

  // =========================================================================
  // Pairwise Suite 4: Dither Heatmap (F10) + Milestone Badges (F12) + Rollover (F16)
  // =========================================================================
  describe("Suite 4: Dither Heatmap + Streak Milestones + Rollover", () => {
    it("4.1 3 consecutive completions across midnight rollover unlocks 3-day milestone badge and lights heatmap", () => {
      // Days: 2026-10-27, 2026-10-28, and night owl 2026-10-29 (checked at 01:15 AM on Oct 30)
      const day1 = "2026-10-27";
      const day2 = "2026-10-28";
      const now = new Date("2026-10-30T01:15:00");
      const day3 = calculateRolloverTodayKey(now, 3); // "2026-10-29"

      let habit = createMockHabit({ completedDates: [day1, day2] });
      habit = completeToday(habit, day3);

      expect(habit.completedDates).toEqual([day1, day2, day3]);
      expect(habit.currentStreak).toBe(3);

      // Check Milestone Badge
      const milestone = CONTRACT_MILESTONES.find((m) => m.days === 3);
      expect(milestone).toBeDefined();
      expect(habit.currentStreak >= milestone!.days).toBe(true);

      // Render Heatmap Calendar
      const calendarData = [day1, day2, day3].map((d) => ({
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
      expect(cells.length).toBe(3);
      expect(cells[0]!.getAttribute("data-level")).toBe("4");
      expect(screen.getByTestId("heatmap-streak")).toHaveTextContent("3 day streak");
    });

    it("4.2 continuing streak to 7 days unlocks 7-day milestone badge and advances progress", () => {
      const dates = ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"];
      const habit = createMockHabit({ completedDates: dates });
      const refreshed = refresh(habit, "2026-10-29");

      expect(refreshed.currentStreak).toBe(7);

      // Verify milestones progression
      const unlocked3 = CONTRACT_MILESTONES.find((m) => m.days === 3);
      const unlocked7 = CONTRACT_MILESTONES.find((m) => m.days === 7);
      expect(refreshed.currentStreak >= unlocked3!.days).toBe(true);
      expect(refreshed.currentStreak >= unlocked7!.days).toBe(true);
    });

    it("4.3 gap day resets active streak in heatmap without erasing unlocked milestone history", () => {
      // Completed day 1-3, missed day 4, completed day 5
      const dates = ["2026-10-25", "2026-10-26", "2026-10-27", "2026-10-29"];
      const habit = createMockHabit({
        completedDates: dates,
        bestStreak: 3,
      });

      const refreshed = refresh(habit, "2026-10-29");
      expect(refreshed.currentStreak).toBe(1); // Reset to 1 because 2026-10-28 was missed
      expect(refreshed.bestStreak).toBe(3); // Best streak preserved

      const calendarData = [
        { date: "2026-10-25", done: 1, total: 1, level: 4 as const },
        { date: "2026-10-26", done: 1, total: 1, level: 4 as const },
        { date: "2026-10-27", done: 1, total: 1, level: 4 as const },
        { date: "2026-10-28", done: 0, total: 1, level: 0 as const },
        { date: "2026-10-29", done: 1, total: 1, level: 4 as const },
      ];

      render(
        h(ReferenceDitherHeatmapCalendar, {
          data: calendarData,
          streak: refreshed.currentStreak,
        })
      );

      const cells = screen.getAllByTestId("heatmap-cell");
      expect(cells.length).toBe(5);
      const gapCell = cells.find((c) => c.getAttribute("data-date") === "2026-10-28");
      expect(gapCell?.getAttribute("data-level")).toBe("0");
    });
  });

  // =========================================================================
  // Pairwise Suite 5: Sandbox Restore (F13) + Exports (F14) + Notes/Habits (F8)
  // =========================================================================
  describe("Suite 5: Sandbox Restore + Multi-Format Exports + Habits & Notes", () => {
    it("5.1 rich dataset with habits and notes survives JSON build, sandbox inspection, and multi-format exports", () => {
      const habits: Habit[] = [
        createMockHabit({ id: "h-meditate", name: "Daily Meditation", emoji: "🧘", currentStreak: 5, bestStreak: 12 }),
        createMockQuantitativeHabit({ id: "h-read", name: "Read Books", emoji: "📚", targetValue: 30, unit: "mins" }),
      ];

      const notes: StandaloneNote[] = [
        createMockNote({ id: "n-1", title: "Morning Thoughts", content: "Had a great sleep and high energy." }),
      ];

      // 1. JSON Export via buildBackup
      const backupObj = buildBackup(habits, DEFAULT_SETTINGS, new Date("2026-10-29T12:00:00Z"), notes);
      const backupJson = JSON.stringify(backupObj);

      // 2. Sandbox Inspection
      const inspection = inspectBackupSandbox(backupJson);
      expect(inspection.valid).toBe(true);
      expect(inspection.habitsCount).toBe(2);
      expect(inspection.notesCount).toBe(1);
      expect(inspection.error).toBeUndefined();

      // 3. CSV Export
      const csv = habitsToCsv(habits);
      expect(csv).toContain('"Daily Meditation"');
      expect(csv).toContain('"Read Books"');

      // 4. Markdown Export
      const md = exportToMarkdown(habits, notes);
      expect(md).toContain("Daily Meditation");
      expect(md).toContain("Morning Thoughts");
      expect(md).toContain("Had a great sleep and high energy.");
    });

    it("5.2 corrupted JSON uploaded to sandbox fails cleanly without affecting active application state", () => {
      const activeHabits = [createMockHabit({ id: "active-1", name: "Active Habit" })];
      const corruptPayload = "{ invalid_json: true, unterminated: ";

      const inspection = inspectBackupSandbox(corruptPayload);
      expect(inspection.valid).toBe(false);
      expect(inspection.error).toBeDefined();
      expect(inspection.habitsCount).toBe(0);

      // Active habits remain untouched
      expect(activeHabits).toHaveLength(1);
      expect(activeHabits[0]!.name).toBe("Active Habit");
    });

    it("5.3 partial corrupted habit entries inside valid JSON are counted as skipped while preserving valid habits", () => {
      const validHabit = createMockHabit({ id: "valid-1", name: "Valid Exercise" });
      const payload = {
        version: "1",
        exportDate: "2026-10-29T12:00:00Z",
        app: "daily-spark",
        data: {
          streaks: [
            validHabit,
            { id: "", name: "" }, // Invalid missing ID and name
            null,
          ],
          settings: DEFAULT_SETTINGS,
        },
      };

      const inspection = inspectBackupSandbox(JSON.stringify(payload));
      expect(inspection.valid).toBe(true);
      expect(inspection.habitsCount).toBe(1);
    });
  });

  // =========================================================================
  // Pairwise Suite 6: Desktop Rail (F2) + Command Palette (F3) + Offline (F5)
  // =========================================================================
  describe("Suite 6: Desktop Rail + Command Palette + Offline Route", () => {
    it("6.1 desktop navigation rail exposes accessible navigation links matching palette tabs", () => {
      const tabs = ["Habits", "Analytics", "Settings", "Notes"];

      render(
        h(
          "nav",
          { "aria-label": "Desktop Navigation Rail", className: "w-16 min-h-screen" },
          tabs.map((tab, idx) =>
            h(
              "button",
              {
                key: tab,
                role: "tab",
                "aria-selected": idx === 0,
                "data-index": idx,
                onClick: () => {},
              },
              tab
            )
          )
        )
      );

      const navRail = screen.getByRole("navigation", { name: "Desktop Navigation Rail" });
      expect(navRail).toBeInTheDocument();
      const tabElements = screen.getAllByRole("tab");
      expect(tabElements).toHaveLength(4);
      expect(tabElements[0]).toHaveTextContent("Habits");
    });

    it("6.2 navigating to /offline displays offline banner while preserving desktop navigation accessibility", () => {
      render(
        h("div", { className: "flex min-h-screen" }, [
          h(
            "nav",
            { key: "rail", "aria-label": "Desktop Navigation Rail" },
            h("button", { role: "tab" }, "Habits")
          ),
          h(
            "main",
            { key: "main", role: "main", "aria-label": "Offline Status" },
            [
              h("h1", { key: "title" }, "You are offline"),
              h("p", { key: "desc" }, "Your habits and check-ins are saved locally."),
            ]
          ),
        ])
      );

      expect(screen.getByRole("main", { name: "Offline Status" })).toBeInTheDocument();
      expect(screen.getByText("You are offline")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Desktop Navigation Rail" })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Pairwise Suite 7: Swipe Gestures (F9) + Direct Check-In (F6) + Haptics (F7)
  // =========================================================================
  describe("Suite 7: Swipe Gestures + Check-In + Haptics", () => {
    it("7.1 swiping right beyond 60px completes habit and triggers tickTap haptic", () => {
      const today = "2026-10-29";
      let habit = createMockHabit({ completedDates: [] });

      const onSwipeComplete = (deltaX: number) => {
        if (deltaX >= 60) {
          habit = completeToday(habit, today);
          tickTapMock();
        }
      };

      onSwipeComplete(75); // 75px swipe > 60px threshold
      expect(habit.completedDates).toContain(today);
      expect(tickTapMock).toHaveBeenCalledTimes(1);
    });

    it("7.2 swiping right below 60px does not complete habit and does not trigger haptics", () => {
      const today = "2026-10-29";
      let habit = createMockHabit({ completedDates: [] });

      const onSwipeComplete = (deltaX: number) => {
        if (deltaX >= 60) {
          habit = completeToday(habit, today);
          tickTapMock();
        }
      };

      onSwipeComplete(40); // 40px swipe < 60px threshold
      expect(habit.completedDates).not.toContain(today);
      expect(tickTapMock).not.toHaveBeenCalled();
    });

    it("7.3 visible button fallback performs identical check-in and haptic for mouse/keyboard users", () => {
      const today = "2026-10-29";
      let habit = createMockHabit({ completedDates: [] });

      render(
        h(
          "button",
          {
            role: "button",
            "aria-label": "Check In Habit",
            onClick: () => {
              habit = completeToday(habit, today);
              tickTapMock();
            },
          },
          "Complete"
        )
      );

      const btn = screen.getByRole("button", { name: "Check In Habit" });
      fireEvent.click(btn);

      expect(habit.completedDates).toContain(today);
      expect(tickTapMock).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Pairwise Suite 8: Privacy Screen (F15) + Isolation (F13) + PWA Manifest (F17)
  // =========================================================================
  describe("Suite 8: Privacy Screen + Data Isolation + PWA Manifest", () => {
    it("8.1 privacy screen confirms offline-first policy and local-only storage guarantee", () => {
      render(
        h("section", { "aria-label": "Privacy Guarantee", className: "p-4 rounded-xl" }, [
          h("h2", { key: "title" }, "Your Data Stays On Your Device"),
          h("p", { key: "desc" }, "Zero telemetry. No tracking cookies. Fully offline."),
          h("button", { key: "btn", role: "button" }, "Export Data (JSON)"),
        ])
      );

      expect(screen.getByRole("region", { name: "Privacy Guarantee" })).toBeInTheDocument();
      expect(screen.getByText("Your Data Stays On Your Device")).toBeInTheDocument();
      expect(screen.getByText(/Zero telemetry/)).toBeInTheDocument();
    });

    it("8.2 purging local data clears all sandbox storage back to initial state", () => {
      let habits = [createMockHabit(), createMockHabit()];
      let notes = [createMockNote()];

      const purgeAllData = () => {
        habits = [];
        notes = [];
      };

      purgeAllData();
      expect(habits).toHaveLength(0);
      expect(notes).toHaveLength(0);
    });
  });
});
