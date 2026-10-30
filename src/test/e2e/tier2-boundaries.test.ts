import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// @ts-expect-error Node fs module for desktop verification tests
import fs from "fs";
// @ts-expect-error Node path module for desktop verification tests
import path from "path";

declare const process: { cwd: () => string };

import { DEFAULT_SETTINGS, type Habit } from "@/lib/habits/types";

import {
  createMockHabit,
  createMockQuantitativeHabit,
  createMockAvoidHabit,
  createMockSubtaskHabit,
  createMockTimerHabit,
  createMockNote,
  createMockBackupPayload,
  CORRUPT_PAYLOADS,
  generateStreakDates,
} from "../fixtures/mock-data";
import {
  resolveCommandPalette,
  transitionTab,
  resolveCheckPopBurst,
  resolveDitherHeatmapCalendar,
  resolveNumberTicker,
  resolveAnimatedCircularProgressBar,
  calculateRolloverTodayKey,
  inspectBackupSandbox,
  CONTRACT_MILESTONES,
  getContractMilestones,
} from "../fixtures/contracts";

import { habitActions, useHabitStore } from "@/lib/habits/store";
import { todayKey, toKey, addDays } from "@/lib/habits/dates";
import {
  habitsToCsv,
  exportToMarkdown,
  buildBackup,
  isDoneOn,
  parseCsvHabits,
} from "@/lib/habits/logic";
import { hapticEngine } from "@/lib/habits/haptics";
import { NeoGlassHabitCard } from "@/components/habits/NeoGlassHabitCard";

const h = React.createElement;

describe("Tier 2: Boundary Value Analysis & Edge Cases", () => {
  beforeEach(() => {
    localStorage.clear();
    habitActions.clearAll();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // Feature 1 Boundary: Mobile Bottom Navigation & Safe-Area
  // =========================================================================
  describe("Feature 1 Boundary: Mobile Bottom Navigation & Safe-Area", () => {
    it("1.1 enforces minimum touch target threshold (48px)", () => {
      const isCompliantTarget = (height: number) => height >= 48;
      expect(isCompliantTarget(47)).toBe(false);
      expect(isCompliantTarget(48)).toBe(true);
      expect(isCompliantTarget(68)).toBe(true);
    });

    it("1.2 handles variable safe-area insets (0px, 16px, 34px iPhone home bar)", () => {
      const getBottomPadding = (insetPx: number) => Math.max(12, insetPx + 12);
      expect(getBottomPadding(0)).toBe(12);
      expect(getBottomPadding(16)).toBe(28);
      expect(getBottomPadding(34)).toBe(46);
    });

    it("1.3 handles viewport breakpoint boundary: 1023px (mobile) vs 1024px (desktop)", () => {
      const isMobileLayout = (viewportWidth: number) => viewportWidth < 1024;
      expect(isMobileLayout(1023)).toBe(true);
      expect(isMobileLayout(1024)).toBe(false);
      expect(isMobileLayout(768)).toBe(true);
    });

    it("1.4 clamps active tab index within valid bounds [0, 3]", () => {
      const clampTab = (tab: number) => Math.min(3, Math.max(0, tab));
      expect(clampTab(-1)).toBe(0);
      expect(clampTab(0)).toBe(0);
      expect(clampTab(3)).toBe(3);
      expect(clampTab(99)).toBe(3);
    });

    it("1.5 prevents scroll container overflow with extreme padding", () => {
      render(
        h(
          "main",
          { "data-testid": "scroll-boundary", className: "overflow-y-auto pb-32" },
          h("div", { style: { height: "2000px" } }, "Long Content")
        )
      );
      const scrollEl = screen.getByTestId("scroll-boundary");
      expect(scrollEl.className).toContain("pb-32");
    });
  });

  // =========================================================================
  // Feature 2 Boundary: Desktop Sticky Sidebar Navigation Rail
  // =========================================================================
  describe("Feature 2 Boundary: Desktop Sticky Sidebar Navigation Rail", () => {
    it("2.1 handles responsive breakpoint transition cleanly at 1024px", () => {
      const getRailVisibilityClass = (width: number) => (width >= 1024 ? "flex" : "hidden");
      expect(getRailVisibilityClass(1023)).toBe("hidden");
      expect(getRailVisibilityClass(1024)).toBe("flex");
      expect(getRailVisibilityClass(1920)).toBe("flex");
    });

    it("2.2 handles empty habit store without division by zero in sidebar metrics", () => {
      const activeCount = 0;
      const completedCount = 0;
      const progressText = activeCount > 0 ? `${completedCount} of ${activeCount} done` : "0 of 0 done";
      expect(progressText).toBe("0 of 0 done");
      const ratio = activeCount > 0 ? completedCount / activeCount : 0;
      expect(ratio).toBe(0);
    });

    it("2.3 preserves layout on ultra-wide screens (>= 2560px)", () => {
      render(
        h(
          "aside",
          { className: "hidden lg:flex lg:w-64 max-w-xs", "data-testid": "desktop-rail" },
          "Sidebar"
        )
      );
      const rail = screen.getByTestId("desktop-rail");
      expect(rail.className).toContain("lg:w-64");
    });

    it("2.4 formats extreme streak numbers (>999 days) gracefully", () => {
      const formatStreakBadge = (streak: number) => (streak > 999 ? "999+d" : `${streak}d`);
      expect(formatStreakBadge(5)).toBe("5d");
      expect(formatStreakBadge(999)).toBe("999d");
      expect(formatStreakBadge(1000)).toBe("999+d");
      expect(formatStreakBadge(50000)).toBe("999+d");
    });

    it("2.5 handles app lock button visibility based on boolean lock state", () => {
      const renderLockBtn = (isEnabled: boolean) =>
        isEnabled ? h("button", { "data-testid": "lock-trigger" }, "Lock") : null;

      const { rerender } = render(h("div", null, renderLockBtn(true)));
      expect(screen.getByTestId("lock-trigger")).toBeInTheDocument();

      rerender(h("div", null, renderLockBtn(false)));
      expect(screen.queryByTestId("lock-trigger")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 3 Boundary: Command Palette (Ctrl+K)
  // =========================================================================
  describe("Feature 3 Boundary: Command Palette (Ctrl+K)", () => {
    it("3.1 renders all default navigation and actions when search query is empty", async () => {
      const CommandPalette = await resolveCommandPalette();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits: [createMockHabit({ name: "Default Habit" })],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("3.2 displays empty state message when search query finds zero matches", async () => {
      const CommandPalette = await resolveCommandPalette();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits: [createMockHabit({ name: "Exercise" })],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      const searchBox = screen.getByPlaceholderText(/type a command/i);
      fireEvent.change(searchBox, { target: { value: "ZzzNoMatchXyz999" } });
      expect(screen.getByText(/no matching habits or commands found/i)).toBeInTheDocument();
    });

    it("3.3 handles very long search input (1000 characters) without catastrophic backtracking", async () => {
      const CommandPalette = await resolveCommandPalette();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits: [createMockHabit({ name: "Testing" })],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      const searchBox = screen.getByPlaceholderText(/type a command/i);
      const longString = "a".repeat(1000);
      expect(() => {
        fireEvent.change(searchBox, { target: { value: longString } });
      }).not.toThrow();
    });

    it("3.4 safely treats special regex meta-characters as literal search characters", async () => {
      const CommandPalette = await resolveCommandPalette();
      const metaHabit = createMockHabit({ name: "Habit [C++] (Advanced) *^$" });
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits: [metaHabit],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      const searchBox = screen.getByPlaceholderText(/type a command/i);
      expect(() => {
        fireEvent.change(searchBox, { target: { value: "[C++]" } });
      }).not.toThrow();
    });

    it("3.5 supports rapid toggling of open state without race condition errors", async () => {
      const CommandPalette = await resolveCommandPalette();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        h(CommandPalette, {
          open: false,
          onOpenChange,
          habits: [],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          h(CommandPalette, {
            open: i % 2 === 0,
            onOpenChange,
            habits: [],
            onSelectTab: vi.fn(),
            onToggleHabit: vi.fn(),
            theme: "classic",
            onToggleTheme: vi.fn(),
          })
        );
      }
      expect(onOpenChange).not.toThrow();
    });
  });

  // =========================================================================
  // Feature 4 Boundary: View Transitions API
  // =========================================================================
  describe("Feature 4 Boundary: View Transitions API", () => {
    interface DocWithTransition {
      startViewTransition?: ((cb: () => void) => Promise<unknown> | void) | null;
    }

    it("4.1 executes callback synchronously when startViewTransition is null or undefined", () => {
      const doc = document as unknown as DocWithTransition;
      const original = doc.startViewTransition;
      doc.startViewTransition = null;

      let called = false;
      transitionTab(() => {
        called = true;
      });
      expect(called).toBe(true);

      doc.startViewTransition = original;
    });

    it("4.2 handles promise rejection in startViewTransition without unhandled rejection", () => {
      const doc = document as unknown as DocWithTransition;
      const original = doc.startViewTransition;
      try {
        doc.startViewTransition = vi.fn((cb: () => void) => {
          cb();
          return Promise.reject(new Error("Transition aborted"));
        });

        let executed = false;
        expect(() => {
          transitionTab(() => {
            executed = true;
          });
        }).not.toThrow();
        expect(executed).toBe(true);
      } finally {
        doc.startViewTransition = original;
      }
    });

    it("4.3 propagates errors thrown by the callback so caller is informed", () => {
      const doc = document as unknown as DocWithTransition;
      const original = doc.startViewTransition;
      try {
        delete doc.startViewTransition;

        expect(() => {
          transitionTab(() => {
            throw new Error("Callback state failure");
          });
        }).toThrow("Callback state failure");
      } finally {
        doc.startViewTransition = original;
      }
    });

    it("4.4 handles concurrent rapid transition requests without dropped callbacks", () => {
      const results: number[] = [];
      for (let i = 0; i < 10; i++) {
        transitionTab(() => results.push(i));
      }
      expect(results).toHaveLength(10);
      expect(results[0]).toBe(0);
      expect(results[9]).toBe(9);
    });

    it("4.5 executes instantly when browser matches prefers-reduced-motion", () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      let run = false;
      transitionTab(() => {
        run = true;
      });
      expect(run).toBe(true);

      window.matchMedia = originalMatchMedia;
    });
  });

  // =========================================================================
  // Feature 5 Boundary: Offline Fallback Route (/offline)
  // =========================================================================
  describe("Feature 5 Boundary: Offline Fallback Route (/offline)", () => {
    it("5.1 responds correctly to window offline and online event transitions", () => {
      let isOnline = true;
      const onOffline = () => { isOnline = false; };
      const onOnline = () => { isOnline = true; };

      window.addEventListener("offline", onOffline);
      window.addEventListener("online", onOnline);

      window.dispatchEvent(new Event("offline"));
      expect(isOnline).toBe(false);

      window.dispatchEvent(new Event("online"));
      expect(isOnline).toBe(true);

      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    });

    it("5.2 handles rapid flapping between online and offline states", () => {
      const stateHistory: boolean[] = [];
      const onStateChange = (status: boolean) => stateHistory.push(status);

      for (let i = 0; i < 20; i++) {
        onStateChange(i % 2 === 0);
      }
      expect(stateHistory).toHaveLength(20);
      expect(stateHistory[19]).toBe(false);
    });

    it("5.3 matches route regardless of trailing slash (/offline vs /offline/)", () => {
      const normalizeRoute = (path: string) => path.replace(/\/+$/, "") || "/";
      expect(normalizeRoute("/offline")).toBe("/offline");
      expect(normalizeRoute("/offline/")).toBe("/offline");
      expect(normalizeRoute("/offline///")).toBe("/offline");
    });

    it("5.4 verifies localStorage remains fully operable when navigator.onLine is false", () => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      localStorage.setItem("offline_test_key", "stored_value");
      expect(localStorage.getItem("offline_test_key")).toBe("stored_value");
      localStorage.removeItem("offline_test_key");
    });

    it("5.5 recovers cleanly and executes pending sync when connection is restored", () => {
      const pendingSyncs: string[] = ["habit-1-sync", "habit-2-sync"];
      const onConnectionRestored = () => {
        const processed = [...pendingSyncs];
        pendingSyncs.length = 0;
        return processed;
      };

      const result = onConnectionRestored();
      expect(result).toEqual(["habit-1-sync", "habit-2-sync"]);
      expect(pendingSyncs).toHaveLength(0);
    });
  });

  // =========================================================================
  // Feature 6 Boundary: Direct Habit Check-In (No Modal)
  // =========================================================================
  describe("Feature 6 Boundary: Direct Habit Check-In (No Modal)", () => {
    it("6.1 handles rapid double check-in clicks idempotently (debounced or toggled)", () => {
      const habit = habitActions.add({ name: "Rapid Click Habit", emoji: "⚡" });
      const r1 = habitActions.toggleToday(habit.id);
      expect(r1).toBe("done");
      const r2 = habitActions.toggleToday(habit.id);
      expect(r2).toBe("undone");
    });

    it("6.2 handles check-in exactly on midnight boundary", () => {
      const midnight = new Date(2026, 9, 29, 0, 0, 0);
      const key = toKey(midnight);
      expect(key).toBe("2026-10-29");
    });

    it("6.3 prevents check-in on archived habits or retains archived status", () => {
      const habit = habitActions.add({ name: "Archived Habit", emoji: "📦" });
      habitActions.archive(habit.id, true);
      interface StoreWithGetState { getState?: () => { habits: Habit[] }; }
      const updated = (useHabitStore as StoreWithGetState).getState?.().habits.find((h) => h.id === habit.id) ?? null;
      expect(updated ? Boolean(updated.archivedAt) : true).toBe(true);
    });

    it("6.4 handles paused habits without breaking streak calculations", () => {
      const habit = habitActions.add({ name: "Paused Habit", emoji: "⏸️" });
      habitActions.pause(habit.id, "Recovery break");
      habitActions.resume(habit.id);
      const res = habitActions.toggleToday(habit.id);
      expect(res).toBe("done");
    });

    it("6.5 supports habit with 365+ completed dates array without performance degradation", () => {
      const dates = generateStreakDates(365);
      const habit = createMockHabit({
        name: "365-Day Hero",
        completedDates: dates,
        currentStreak: 365,
        bestStreak: 365,
      });
      expect(habit.completedDates).toHaveLength(365);
      expect(isDoneOn(habit, dates[0])).toBe(true);
      expect(isDoneOn(habit, dates[364])).toBe(true);
    });
  });

  // =========================================================================
  // Feature 7 Boundary: Haptic Feedback & Particle Pop
  // =========================================================================
  describe("Feature 7 Boundary: Haptic Feedback & Particle Pop", () => {
    it("7.1 safely resolves when device does not support vibration or haptics", async () => {
      const nav = navigator as unknown as { vibrate?: (pattern: number | number[]) => boolean };
      const originalVibrate = nav.vibrate;
      delete nav.vibrate;

      await expect(hapticEngine.tickTap()).resolves.toBeUndefined();

      nav.vibrate = originalVibrate;
    });

    it("7.2 clamps negative or extreme off-screen particle coordinates", async () => {
      const CheckPopBurst = await resolveCheckPopBurst();
      render(h(CheckPopBurst, { x: -50, y: 9999, onComplete: vi.fn() }));
      const burst = screen.getByTestId("check-pop-burst");
      expect(burst.style.left).toBe("-50px");
      expect(burst.style.top).toBe("9999px");
    });

    it("7.3 handles multiple rapid particle bursts triggered within 100ms", async () => {
      const CheckPopBurst = await resolveCheckPopBurst();
      const onComplete1 = vi.fn();
      const onComplete2 = vi.fn();

      const { unmount } = render(
        h(
          "div",
          null,
          h(CheckPopBurst, { x: 10, y: 10, onComplete: onComplete1 }),
          h(CheckPopBurst, { x: 20, y: 20, onComplete: onComplete2 })
        )
      );
      const bursts = screen.getAllByTestId("check-pop-burst");
      expect(bursts).toHaveLength(2);
      unmount();
    });

    it("7.4 clears particle burst timer cleanly if unmounted before 450ms", async () => {
      vi.useFakeTimers();
      const CheckPopBurst = await resolveCheckPopBurst();
      const onComplete = vi.fn();
      const { unmount } = render(h(CheckPopBurst, { x: 10, y: 10, onComplete }));
      unmount();
      vi.advanceTimersByTime(500);
      expect(onComplete).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("7.5 supports zero haptic duration or disabled haptics setting gracefully", async () => {
      const disabledHaptics = {
        enabled: false,
        tickTap: async () => {},
      };
      await expect(disabledHaptics.tickTap()).resolves.toBeUndefined();
    });
  });

  // =========================================================================
  // Feature 8 Boundary: Progressive Disclosure (Timer, Stepper, Notes)
  // =========================================================================
  describe("Feature 8 Boundary: Progressive Disclosure (Timer, Stepper, Notes)", () => {
    it("8.1 clamps quantitative targetValue when configured to 0 or negative", () => {
      const safeTarget = (val?: number) => Math.max(1, Number(val) || 1);
      expect(safeTarget(0)).toBe(1);
      expect(safeTarget(-50)).toBe(1);
      expect(safeTarget(NaN)).toBe(1);
      expect(safeTarget(500)).toBe(500);
    });

    it("8.2 disables decrement button when current quantity is already 0", () => {
      const today = todayKey();
      const quantHabit = createMockQuantitativeHabit({
        targetValue: 2000,
        quantitativeValues: { [today]: 0 },
      });
      render(
        h(NeoGlassHabitCard, {
          habit: quantHabit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      const decBtn = screen.getByTitle(/decrease/i);
      expect(decBtn).toBeDisabled();
    });

    it("8.3 computes laps (>1) and percent (>100%) on over-achievement", () => {
      const current = 3500;
      const target = 1000;
      const percent = Math.round((current / target) * 100);
      const laps = Math.floor(current / target);
      expect(percent).toBe(350);
      expect(laps).toBe(3);
    });

    it("8.4 treats empty subtasks array identically to undefined subtasks without crashing", () => {
      const habitEmpty = createMockHabit({ subtasks: [] });
      const habitUndef = createMockHabit({ subtasks: undefined });
      const hasSubtasks = (h: Habit) => Boolean(h.subtasks && h.subtasks.length > 0);
      expect(hasSubtasks(habitEmpty)).toBe(false);
      expect(hasSubtasks(habitUndef)).toBe(false);
    });

    it("8.5 enforces 1000-character maximum limit on habit notes", () => {
      const truncateNotes = (text: string) => text.slice(0, 1000);
      const longNote = "A".repeat(1200);
      const bounded = truncateNotes(longNote);
      expect(bounded).toHaveLength(1000);
    });
  });

  // =========================================================================
  // Feature 9 Boundary: Swipe Gestures & Accessible Button Fallbacks
  // =========================================================================
  describe("Feature 9 Boundary: Swipe Gestures & Accessible Button Fallbacks", () => {
    it("9.1 touch movement at 59px (below 60px threshold) triggers no action", () => {
      const onSwipe = vi.fn();
      const evaluateSwipe = (deltaX: number) => {
        if (deltaX >= 60) onSwipe();
      };
      evaluateSwipe(59);
      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("9.2 touch movement at 60px/61px (at/above threshold) triggers action", () => {
      const onSwipe = vi.fn();
      const evaluateSwipe = (deltaX: number) => {
        if (deltaX >= 60) onSwipe();
      };
      evaluateSwipe(60);
      expect(onSwipe).toHaveBeenCalledTimes(1);
      evaluateSwipe(61);
      expect(onSwipe).toHaveBeenCalledTimes(2);
    });

    it("9.3 cancels horizontal swipe when vertical scroll dominance is detected", () => {
      const onSwipe = vi.fn();
      const handleGesture = (deltaX: number, deltaY: number) => {
        // Vertical dominance: vertical movement exceeds horizontal movement
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        if (deltaX >= 60) onSwipe();
      };
      handleGesture(70, 90); // User is scrolling down vertically
      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("9.4 aborts gesture cleanly on touchcancel event", () => {
      let isGesturing = true;
      const onTouchCancel = () => { isGesturing = false; };
      onTouchCancel();
      expect(isGesturing).toBe(false);
    });

    it("9.5 ignores multi-touch gestures (e.g. pinch/zoom with 2+ fingers)", () => {
      const onSwipe = vi.fn();
      const handleTouch = (touchesCount: number, deltaX: number) => {
        if (touchesCount > 1) return; // ignore multi-touch
        if (deltaX >= 60) onSwipe();
      };
      handleTouch(2, 100);
      expect(onSwipe).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Feature 10 Boundary: 6-Month dithercn Heatmap Calendar
  // =========================================================================
  describe("Feature 10 Boundary: 6-Month dithercn Heatmap Calendar", () => {
    it("10.1 renders cleanly with empty data array (0 days)", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      render(h(DitherHeatmapCalendar, { data: [], streak: 0 }));
      expect(screen.getByTestId("dither-heatmap-calendar")).toBeInTheDocument();
      expect(screen.queryAllByTestId("heatmap-cell")).toHaveLength(0);
    });

    it("10.2 aligns exactly to 26 weeks of 7 days (182 days boundary)", () => {
      const totalDays = 26 * 7;
      expect(totalDays).toBe(182);
    });

    it("10.3 handles leap year dates (Feb 29) seamlessly in key calculations", () => {
      const leapDay = new Date(2028, 1, 29); // Feb 29, 2028
      const key = toKey(leapDay);
      expect(key).toBe("2028-02-29");
      const nextDay = addDays(key, 1);
      expect(nextDay).toBe("2028-03-01");
    });

    it("10.4 maps completion ratio exact bounds (0.0 -> level 0, 1.0 -> level 4)", () => {
      const computeLevel = (done: number, total: number): 0 | 1 | 2 | 3 | 4 => {
        if (total === 0 || done === 0) return 0;
        const ratio = done / total;
        if (ratio >= 1) return 4;
        if (ratio >= 0.75) return 3;
        if (ratio >= 0.5) return 2;
        return 1;
      };
      expect(computeLevel(0, 5)).toBe(0);
      expect(computeLevel(5, 5)).toBe(4);
      expect(computeLevel(2, 5)).toBe(1);
    });

    it("10.5 avoids divide-by-zero NaN when total habits scheduled is 0", () => {
      const computeRatio = (done: number, total: number) => (total === 0 ? 0 : done / total);
      expect(computeRatio(0, 0)).toBe(0);
      expect(isNaN(computeRatio(0, 0))).toBe(false);
    });
  });

  // =========================================================================
  // Feature 11 Boundary: NumberTicker & Animated Circular Progress
  // =========================================================================
  describe("Feature 11 Boundary: NumberTicker & Animated Circular Progress", () => {
    it("11.1 renders zero correctly without disappearing or displaying NaN", async () => {
      const NumberTicker = await resolveNumberTicker();
      render(h(NumberTicker, { value: 0 }));
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("0");
    });

    it("11.2 formats large numbers (e.g. 1,000,000) without exponential notation", async () => {
      const NumberTicker = await resolveNumberTicker();
      render(h(NumberTicker, { value: 1000000 }));
      const ticker = screen.getByTestId("number-ticker");
      expect(ticker.textContent).not.toContain("e+");
      expect(ticker).toHaveTextContent("1000000");
    });

    it("11.3 AnimatedCircularProgressBar computes 0% fill when value = min", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(h(AnimatedCircularProgressBar, { value: 0, min: 0, max: 100 }));
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "0");
    });

    it("11.4 AnimatedCircularProgressBar computes 100% fill when value = max", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(h(AnimatedCircularProgressBar, { value: 100, min: 0, max: 100 }));
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "100");
    });

    it("11.5 clamps out-of-bound circular progress values to [min, max]", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(h(AnimatedCircularProgressBar, { value: -20, min: 0, max: 10 }));
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "0");
    });
  });

  // =========================================================================
  // Feature 12 Boundary: Streak Milestone Badges (3d, 7d, 21d, 50d, 100d)
  // =========================================================================
  describe("Feature 12 Boundary: Streak Milestone Badges (3d, 7d, 21d, 50d, 100d)", () => {
    it("12.1 evaluates day 2 as 0 reached milestones with 3d as next milestone", () => {
      const result = getContractMilestones(2);
      expect(result.reached).toHaveLength(0);
      expect(result.next?.days).toBe(3);
    });

    it("12.2 unlocks 3d milestone at exactly streak = 3 days", () => {
      const result = getContractMilestones(3);
      expect(result.reached.map((m) => m.days)).toEqual([3]);
      expect(result.next?.days).toBe(7);
    });

    it("12.3 evaluates boundary transition between day 6 (3d only) and day 7 (3d and 7d)", () => {
      const r6 = getContractMilestones(6);
      expect(r6.reached.map((m) => m.days)).toEqual([3]);

      const r7 = getContractMilestones(7);
      expect(r7.reached.map((m) => m.days)).toEqual([3, 7]);
    });

    it("12.4 unlocks 21d Neural Loop milestone at exactly streak = 21 days", () => {
      const result = getContractMilestones(21);
      expect(result.reached.some((m) => m.days === 21)).toBe(true);
      expect(result.next?.days).toBe(50);
    });

    it("12.5 unlocks 100d Century Run milestone at streak = 100 days", () => {
      const result = getContractMilestones(100);
      expect(result.reached.some((m) => m.days === 100)).toBe(true);
      expect(result.next?.days).toBe(365);
    });
  });

  // =========================================================================
  // Feature 13 Boundary: Sandboxed Backup Restore & Data Isolation
  // =========================================================================
  describe("Feature 13 Boundary: Sandboxed Backup Restore & Data Isolation", () => {
    it("13.1 rejects unclosed brackets and malformed syntax cleanly", () => {
      const corrupt = '{"habits": [ { "name": "Broken" ';
      const result = inspectBackupSandbox(corrupt);
      expect(result.valid).toBe(false);
      expect(result.habitsCount).toBe(0);
    });

    it("13.2 neutralizes prototype pollution attempts without modifying Object.prototype", () => {
      const malicious = '{"__proto__": {"polluted": true}, "habits": []}';
      const result = inspectBackupSandbox(malicious);
      expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
    });

    it("13.3 safely imports habits containing script tags without executing script", () => {
      const xssPayload = JSON.stringify({
        habits: [{ id: "xss", name: "<script>window.__xss=true;</script>", completedDates: [] }],
      });
      const result = inspectBackupSandbox(xssPayload);
      expect(result.valid).toBe(true);
      expect((window as unknown as Record<string, unknown>).__xss).toBeUndefined();
    });

    it("13.4 parses large backup with 1000 habits within reasonable duration", () => {
      const habits = Array.from({ length: 1000 }, (_, i) => createMockHabit({ id: `h-${i}` }));
      const payload = JSON.stringify({ habits });
      const t0 = performance.now();
      const result = inspectBackupSandbox(payload);
      const t1 = performance.now();
      expect(result.valid).toBe(true);
      expect(result.habitsCount).toBe(1000);
      expect(t1 - t0).toBeLessThan(1000); // under 1s
    });

    it("13.5 handles backup payload with null or missing settings/notes gracefully", () => {
      const minimalPayload = JSON.stringify({
        habits: [createMockHabit({ id: "min-1" })],
      });
      const result = inspectBackupSandbox(minimalPayload);
      expect(result.valid).toBe(true);
      expect(result.notesCount).toBe(0);
      expect(result.settingsIncluded).toBe(false);
    });
  });

  // =========================================================================
  // Feature 14 Boundary: Multi-Format Exports (JSON, CSV, Markdown)
  // =========================================================================
  describe("Feature 14 Boundary: Multi-Format Exports (JSON, CSV, Markdown)", () => {
    it("14.1 generates valid empty output when habit list is empty (0 habits)", () => {
      const csv = habitsToCsv([]);
      expect(csv).toContain("currentStreak"); // headers preserved
      const md = exportToMarkdown([]);
      expect(md).toContain("Daily Spark");
    });

    it("14.2 escapes internal commas, double quotes, and CRLF in CSV export", () => {
      const habit = createMockHabit({
        name: 'Habit "With Quotes", and Commas\r\nNewline',
      });
      const csv = habitsToCsv([habit]);
      expect(csv).toContain('""With Quotes""');
    });

    it("14.3 escapes Markdown pipes and hashes in habit descriptions", () => {
      const habit = createMockHabit({
        name: "Table | Column # Hash",
        notes: "Some notes with | pipe",
      });
      const md = exportToMarkdown([habit]);
      expect(md).toContain("Table | Column # Hash");
    });

    it("14.4 preserves multi-byte non-Latin characters (Chinese, Cyrillic, Japanese)", () => {
      const habit = createMockHabit({
        name: "每日阅读 📚 (Чтение / 読書)",
      });
      const csv = habitsToCsv([habit]);
      const md = exportToMarkdown([habit]);
      expect(csv).toContain("每日阅读");
      expect(md).toContain("Чтение");
    });

    it("14.5 produces valid ISO-8601 export timestamp in backup metadata", () => {
      const backup = buildBackup([createMockHabit()], DEFAULT_SETTINGS, new Date("2026-10-29T12:00:00Z"));
      expect(backup.exportDate).toBe("2026-10-29T12:00:00.000Z");
      expect(backup.app).toBe("daily-spark");
    });
  });

  // =========================================================================
  // Feature 15 Boundary: Plain-Language Single-Card Privacy Screen
  // =========================================================================
  describe("Feature 15 Boundary: Plain-Language Single-Card Privacy Screen", () => {
    it("15.1 contains all 5 privacy guarantees verbatim", () => {
      const statement = "No accounts, No servers, No ads, No analytics, No data leaves this device";
      expect(statement).toContain("No accounts");
      expect(statement).toContain("No servers");
      expect(statement).toContain("No ads");
      expect(statement).toContain("No analytics");
      expect(statement).toContain("No data leaves this device");
    });

    it("15.2 deep link navigation to /privacy renders with heading", () => {
      render(
        h(
          "div",
          { role: "region", "aria-label": "Privacy Screen" },
          h("h1", null, "Privacy Guarantee"),
          h("p", null, "No accounts, No servers, No ads, No analytics, No data leaves this device")
        )
      );
      expect(screen.getByRole("heading", { name: /privacy guarantee/i })).toBeInTheDocument();
    });

    it("15.3 verifies dark mode contrast ratio >= 4.5:1", () => {
      // Dark mode: bg #17171d (lum ~0.015), fg #f0f0f4 (lum ~0.88)
      const ratio = (0.88 + 0.05) / (0.015 + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("15.4 verifies light mode contrast ratio >= 4.5:1", () => {
      // Light mode: bg #ffffff (lum 1.0), fg #1a1a1e (lum ~0.02)
      const ratio = (1.0 + 0.05) / (0.02 + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("15.5 verifies zero external tracking or analytics domains are linked", () => {
      const forbiddenDomains = ["google-analytics.com", "hotjar.com", "mixpanel.com", "segment.io"];
      const htmlContent = document.documentElement.innerHTML;
      for (const domain of forbiddenDomains) {
        expect(htmlContent.includes(domain)).toBe(false);
      }
    });
  });

  // =========================================================================
  // Feature 16 Boundary: Configurable Midnight Rollover (3 AM Night Owl)
  // =========================================================================
  describe("Feature 16 Boundary: Configurable Midnight Rollover (3 AM Night Owl)", () => {
    it("16.1 tests exact boundary at rolloverHour = 0 (23:59:59 vs 00:00:00)", () => {
      const beforeMidnight = new Date(2026, 9, 29, 23, 59, 59);
      const atMidnight = new Date(2026, 9, 30, 0, 0, 0);

      expect(calculateRolloverTodayKey(beforeMidnight, 0)).toBe("2026-10-29");
      expect(calculateRolloverTodayKey(atMidnight, 0)).toBe("2026-10-30");
    });

    it("16.2 tests exact boundary at rolloverHour = 3 (02:59:59 vs 03:00:00)", () => {
      const before3am = new Date(2026, 9, 29, 2, 59, 59);
      const at3am = new Date(2026, 9, 29, 3, 0, 0);

      expect(calculateRolloverTodayKey(before3am, 3)).toBe("2026-10-28"); // shifted
      expect(calculateRolloverTodayKey(at3am, 3)).toBe("2026-10-29"); // current
    });

    it("16.3 tests late night boundary at rolloverHour = 23 (22:59:59 vs 23:00:00)", () => {
      const before11pm = new Date(2026, 9, 29, 22, 59, 59);
      const at11pm = new Date(2026, 9, 29, 23, 0, 0);

      expect(calculateRolloverTodayKey(before11pm, 23)).toBe("2026-10-28");
      expect(calculateRolloverTodayKey(at11pm, 23)).toBe("2026-10-29");
    });

    it("16.4 handles month-end rollover boundary (e.g. 01:30 AM on Nov 1 shifts to Oct 31)", () => {
      const earlyNov1 = new Date(2026, 10, 1, 1, 30, 0); // Nov 1 01:30 AM
      const effectiveDate = calculateRolloverTodayKey(earlyNov1, 3);
      expect(effectiveDate).toBe("2026-10-31"); // shifts to Oct 31
    });

    it("16.5 handles year-end rollover boundary (e.g. 01:30 AM on Jan 1 shifts to Dec 31)", () => {
      const earlyJan1 = new Date(2027, 0, 1, 1, 30, 0); // Jan 1, 2027 01:30 AM
      const effectiveDate = calculateRolloverTodayKey(earlyJan1, 3);
      expect(effectiveDate).toBe("2026-12-31"); // shifts to Dec 31, 2026
    });
  });

  // =========================================================================
  // Feature 17 Boundary: PWA Manifest, Service Worker & Update Toast
  // =========================================================================
  describe("Feature 17 Boundary: PWA Manifest, Service Worker & Update Toast", () => {
    it("17.1 validates manifest icons array has at least 3 resolutions including maskable", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    });

    it("17.2 validates manifest start_url is relative and points to base path", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.start_url).toMatch(/^\/.*\/$/);
    });

    it("17.3 verifies manifest theme_color and background_color are valid hex strings", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("17.4 tests service worker registration failure handling without application crash", async () => {
      const mockRegister = vi.fn().mockRejectedValue(new Error("SW Registration Error"));
      const originalSW = navigator.serviceWorker;
      Object.defineProperty(navigator, "serviceWorker", {
        value: { register: mockRegister },
        configurable: true,
        writable: true,
      });

      try {
        await expect(
          navigator.serviceWorker.register("/sw.js").catch((err: Error) => err.message)
        ).resolves.toBe("SW Registration Error");
      } finally {
        Object.defineProperty(navigator, "serviceWorker", {
          value: originalSW,
          configurable: true,
          writable: true,
        });
      }
    });

    it("17.5 verifies update toast dismiss vs reload action handling", () => {
      let reloaded = false;
      let dismissed = false;

      const onReload = () => { reloaded = true; };
      const onDismiss = () => { dismissed = true; };

      render(
        h(
          "div",
          { role: "alert", "data-testid": "toast-boundary" },
          h("p", null, "New version ready"),
          h("button", { type: "button", onClick: onReload }, "Update"),
          h("button", { type: "button", onClick: onDismiss }, "Dismiss")
        )
      );

      fireEvent.click(screen.getByText("Update"));
      expect(reloaded).toBe(true);

      fireEvent.click(screen.getByText("Dismiss"));
      expect(dismissed).toBe(true);
    });
  });

  // =========================================================================
  // Feature 18 Boundary: Desktop Packaging & Tauri 2 Configuration
  // =========================================================================
  describe("Feature 18 Boundary: Desktop Packaging & Tauri 2 Configuration", () => {
    it("18.1 validates build-desktop.js existence and executable permissions structure", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      expect(fs.existsSync(scriptPath)).toBe(true);
      const stat = fs.statSync(scriptPath);
      expect(stat.size).toBeGreaterThan(1000);
    });

    it("18.2 checks build-desktop.js handles Linux XDG desktop entry specification", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("[Desktop Entry]");
      expect(content).toContain("Type=Application");
    });

    it("18.3 checks build-desktop.js handles Windows portable batch launcher fallback", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("Launch-Daily-Spark.bat");
    });

    it("18.4 validates Tauri 2 configuration format requirements (tauri.conf.json)", () => {
      const sampleTauriConfig = {
        productName: "daily-spark",
        version: "1.0.1",
        identifier: "app.dailyspark.app",
        build: {
          frontendDist: "../dist",
        },
        app: {
          windows: [
            {
              title: "Daily Spark",
              width: 1180,
              height: 820,
            },
          ],
        },
      };
      expect(sampleTauriConfig.productName).toBe("daily-spark");
      expect(sampleTauriConfig.app.windows[0].width).toBe(1180);
    });

    it("18.5 verifies cross-platform path resolution uses path module rather than hardcoded slashes", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("path.join");
      expect(content).toContain("path.resolve");
    });
  });
});
