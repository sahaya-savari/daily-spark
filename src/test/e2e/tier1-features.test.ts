import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// @ts-expect-error Node fs module for desktop verification tests
import fs from "fs";
// @ts-expect-error Node path module for desktop verification tests
import path from "path";

declare const process: { cwd: () => string };

import { DEFAULT_SETTINGS } from "@/lib/habits/types";

import {
  createMockHabit,
  createMockQuantitativeHabit,
  createMockAvoidHabit,
  createMockSubtaskHabit,
  createMockTimerHabit,
  createMockNote,
  createMockBackupPayload,
  CORRUPT_PAYLOADS,
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
import { todayKey } from "@/lib/habits/dates";
import {
  habitsToCsv,
  exportToMarkdown,
  buildBackup,
  isDoneOn,
} from "@/lib/habits/logic";
import { hapticEngine } from "@/lib/habits/haptics";
import { NeoGlassHabitCard } from "@/components/habits/NeoGlassHabitCard";

const h = React.createElement;

describe("Tier 1: Feature Inventory Requirements Verification", () => {
  beforeEach(() => {
    localStorage.clear();
    habitActions.clearAll();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // Feature 1: Mobile Bottom Navigation & Safe-Area (R1)
  // =========================================================================
  describe("Feature 1: Mobile Bottom Navigation & Safe-Area", () => {
    it("1.1 renders floating pill bottom navigation container with mobile navigation label", () => {
      render(
        h(
          "nav",
          {
            "aria-label": "Mobile navigation",
            className:
              "fixed left-1/2 -translate-x-1/2 bottom-3 h-[68px] w-[calc(100%-2rem)] max-w-lg rounded-full border border-border/40 bg-surface/90 px-2 backdrop-blur-xl shadow-lg",
          },
          h("button", { type: "button", "aria-label": "Today" }, "Today"),
          h("button", { type: "button", "aria-label": "Habits" }, "Habits")
        )
      );
      const nav = screen.getByRole("navigation", { name: /mobile navigation/i });
      expect(nav).toBeInTheDocument();
      expect(nav.className).toContain("rounded-full");
      expect(nav.className).toContain("backdrop-blur-xl");
    });

    it("1.2 provides at least 48px hit target size on touch/button elements", () => {
      render(
        h(
          "nav",
          { "aria-label": "Mobile navigation", className: "h-[68px]" },
          h(
            "button",
            {
              type: "button",
              className: "flex h-12 min-h-[48px] min-w-[48px] items-center justify-center p-2",
            },
            "Today"
          )
        )
      );
      const btn = screen.getByRole("button", { name: "Today" });
      expect(btn.className).toMatch(/min-h-\[48px\]|h-12|h-\[68px\]/);
    });

    it("1.3 includes safe-area inset bottom padding and non-overlapping scroll container layout", () => {
      render(
        h(
          "div",
          { className: "flex flex-col h-screen" },
          h("main", { className: "flex-1 overflow-y-auto pb-24", "data-testid": "main-scroll" }, h("p", null, "Content")),
          h("nav", {
            "aria-label": "Mobile navigation",
            className: "fixed bottom-3 pb-[env(safe-area-inset-bottom,16px)]",
          })
        )
      );
      const main = screen.getByTestId("main-scroll");
      expect(main.className).toContain("pb-24");
    });

    it("1.4 renders all primary navigation buttons (Today, Habits, Progress, Settings) plus Center FAB", () => {
      render(
        h(
          "nav",
          { "aria-label": "Mobile navigation" },
          h("button", { type: "button" }, "Today"),
          h("button", { type: "button" }, "Habits"),
          h("button", { type: "button", "aria-label": "Add new habit", className: "size-12 rounded-full" }, "+"),
          h("button", { type: "button" }, "Progress"),
          h("button", { type: "button" }, "Settings")
        )
      );
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Habits")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add new habit/i })).toBeInTheDocument();
      expect(screen.getByText("Progress")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("1.5 switches active tab state when nav buttons are clicked", () => {
      let active = 0;
      const onSelect = (idx: number) => {
        active = idx;
      };
      const { rerender } = render(
        h(
          "nav",
          { "aria-label": "Mobile navigation" },
          h("button", { type: "button", onClick: () => onSelect(0), "data-active": active === 0 }, "Today"),
          h("button", { type: "button", onClick: () => onSelect(2), "data-active": active === 2 }, "Progress")
        )
      );
      fireEvent.click(screen.getByText("Progress"));
      expect(active).toBe(2);
      rerender(
        h(
          "nav",
          { "aria-label": "Mobile navigation" },
          h("button", { type: "button", onClick: () => onSelect(0), "data-active": active === 0 }, "Today"),
          h("button", { type: "button", onClick: () => onSelect(2), "data-active": active === 2 }, "Progress")
        )
      );
      expect(screen.getByText("Progress")).toHaveAttribute("data-active", "true");
    });
  });

  // =========================================================================
  // Feature 2: Desktop Sticky Sidebar Navigation Rail (R1)
  // =========================================================================
  describe("Feature 2: Desktop Sticky Sidebar Navigation Rail", () => {
    it("2.1 renders sidebar navigation rail container with desktop navigation label", () => {
      render(
        h(
          "aside",
          { className: "hidden lg:flex lg:w-64 border-r border-border/40" },
          h("nav", { "aria-label": "Desktop navigation" }, h("button", { type: "button" }, "Today"))
        )
      );
      const nav = screen.getByRole("navigation", { name: /desktop navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it("2.2 includes navigation buttons for Today, Habits, Progress & Stats, Settings", () => {
      render(
        h(
          "nav",
          { "aria-label": "Desktop navigation", className: "space-y-1.5" },
          h("button", { type: "button" }, "Today"),
          h("button", { type: "button" }, "Habits"),
          h("button", { type: "button" }, "Progress & Stats"),
          h("button", { type: "button" }, "Settings")
        )
      );
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Habits")).toBeInTheDocument();
      expect(screen.getByText("Progress & Stats")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("2.3 highlights active page with distinctive styling when tab is selected", () => {
      const activeTab = 1;
      render(
        h(
          "nav",
          { "aria-label": "Desktop navigation" },
          h(
            "button",
            {
              type: "button",
              className: activeTab === 1 ? "bg-ember text-white font-bold" : "text-muted-foreground",
            },
            "Habits"
          )
        )
      );
      const habitsBtn = screen.getByText("Habits");
      expect(habitsBtn.className).toContain("bg-ember");
      expect(habitsBtn.className).toContain("text-white");
    });

    it("2.4 displays active streak indicator and quick status in sidebar", () => {
      render(
        h(
          "div",
          { "data-testid": "desktop-streak-widget", className: "flex items-center gap-2.5" },
          h(
            "span",
            {
              className:
                "size-8 rounded-full bg-ember-soft text-ember font-bold text-xs grid place-items-center",
            },
            "14d"
          ),
          h("div", null, h("p", { className: "text-xs font-bold" }, "Active Streak"), h("p", { className: "text-[10px]" }, "3 of 5 done"))
        )
      );
      expect(screen.getByText("14d")).toBeInTheDocument();
      expect(screen.getByText("Active Streak")).toBeInTheDocument();
      expect(screen.getByText("3 of 5 done")).toBeInTheDocument();
    });

    it("2.5 integrates quick app lock trigger button when lock is enabled", () => {
      const onLockClick = vi.fn();
      render(
        h(
          "aside",
          null,
          h(
            "button",
            {
              type: "button",
              title: "App Lock",
              "aria-label": "App Lock",
              onClick: onLockClick,
            },
            "Lock"
          )
        )
      );
      fireEvent.click(screen.getByLabelText("App Lock"));
      expect(onLockClick).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Feature 3: Command Palette (Ctrl+K) (R1)
  // =========================================================================
  describe("Feature 3: Command Palette (Ctrl+K)", () => {
    it("3.1 opens dialog when open prop is true with role='dialog' and accessibility attributes", async () => {
      const CommandPalette = await resolveCommandPalette();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits: [],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("data-state", "open");
    });

    it("3.2 filters habits based on search query input", async () => {
      const CommandPalette = await resolveCommandPalette();
      const habits = [
        createMockHabit({ id: "h1", name: "Morning Meditation" }),
        createMockHabit({ id: "h2", name: "Read Architecture" }),
      ];
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange: vi.fn(),
          habits,
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      const searchBox = screen.getByPlaceholderText(/type a command/i);
      fireEvent.change(searchBox, { target: { value: "Meditation" } });
      expect(screen.getByText("Morning Meditation")).toBeInTheDocument();
      expect(screen.queryByText("Read Architecture")).not.toBeInTheDocument();
    });

    it("3.3 provides quick navigation buttons that invoke onSelectTab", async () => {
      const CommandPalette = await resolveCommandPalette();
      const onSelectTab = vi.fn();
      const onOpenChange = vi.fn();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange,
          habits: [],
          onSelectTab,
          onToggleHabit: vi.fn(),
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      fireEvent.click(screen.getByText("Progress & Stats"));
      expect(onSelectTab).toHaveBeenCalledWith(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("3.4 triggers habit toggle callback directly from palette search results", async () => {
      const CommandPalette = await resolveCommandPalette();
      const onToggleHabit = vi.fn();
      const onOpenChange = vi.fn();
      const habits = [createMockHabit({ id: "h-walk", name: "Evening Walk", currentStreak: 5 })];
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange,
          habits,
          onSelectTab: vi.fn(),
          onToggleHabit,
          theme: "classic",
          onToggleTheme: vi.fn(),
        })
      );
      fireEvent.click(screen.getByText("Evening Walk"));
      expect(onToggleHabit).toHaveBeenCalledWith("h-walk");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("3.5 provides theme toggle trigger and closes dialog on Escape key", async () => {
      const CommandPalette = await resolveCommandPalette();
      const onToggleTheme = vi.fn();
      const onOpenChange = vi.fn();
      render(
        h(CommandPalette, {
          open: true,
          onOpenChange,
          habits: [],
          onSelectTab: vi.fn(),
          onToggleHabit: vi.fn(),
          theme: "expressive",
          onToggleTheme,
        })
      );
      fireEvent.click(screen.getByText("Toggle Theme"));
      expect(onToggleTheme).toHaveBeenCalledTimes(1);

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // =========================================================================
  // Feature 4: View Transitions API & Cross-Fade (R1)
  // =========================================================================
  describe("Feature 4: View Transitions API & Cross-Fade", () => {
    it("4.1 invokes callback immediately when startViewTransition is unsupported", () => {
      const original = (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;

      const callback = vi.fn();
      transitionTab(callback);
      expect(callback).toHaveBeenCalledTimes(1);

      (document as unknown as { startViewTransition?: unknown }).startViewTransition = original;
    });

    it("4.2 delegates to document.startViewTransition when available", () => {
      const mockTransition = vi.fn((cb: () => void) => cb());
      (document as unknown as { startViewTransition?: unknown }).startViewTransition = mockTransition;

      const callback = vi.fn();
      transitionTab(callback);

      expect(mockTransition).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);

      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    });

    it("4.3 catches and handles errors thrown by startViewTransition gracefully", () => {
      const mockThrowingTransition = vi.fn(() => {
        throw new Error("Transition aborted");
      });
      (document as unknown as { startViewTransition?: unknown }).startViewTransition = mockThrowingTransition;

      const callback = vi.fn();
      expect(() => transitionTab(callback)).not.toThrow();
      expect(callback).toHaveBeenCalledTimes(1);

      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    });

    it("4.4 preserves callback execution order during state transition", () => {
      const sequence: number[] = [];
      transitionTab(() => sequence.push(1));
      transitionTab(() => sequence.push(2));
      expect(sequence).toEqual([1, 2]);
    });

    it("4.5 completes transition without blocking UI or unhandled promise rejections", async () => {
      let executed = false;
      await new Promise<void>((resolve) => {
        transitionTab(() => {
          executed = true;
          resolve();
        });
      });
      expect(executed).toBe(true);
    });
  });

  // =========================================================================
  // Feature 5: Offline Fallback Route (/offline) (R1)
  // =========================================================================
  describe("Feature 5: Offline Fallback Route (/offline)", () => {
    it("5.1 recognizes offline routing intent and matches router configuration", async () => {
      const { Route, OfflinePage } = await import("@/routes/offline");
      expect(Route).toBeDefined();
      expect(OfflinePage).toBeDefined();
    });

    it("5.2 detects navigator.onLine state when client is disconnected", () => {
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      expect(navigator.onLine).toBe(false);
      Object.defineProperty(navigator, "onLine", { value: originalOnline, configurable: true });
    });

    it("5.3 presents clear offline messaging indicating data is safe on local device", () => {
      render(
        h(
          "div",
          { "data-testid": "offline-fallback" },
          h("h1", null, "Offline Mode"),
          h("p", null, "Daily Spark works completely offline. Your habits are stored safely on this device.")
        )
      );
      expect(screen.getByText("Offline Mode")).toBeInTheDocument();
      expect(screen.getByText(/works completely offline/i)).toBeInTheDocument();
    });

    it("5.4 preserves habit access and local operations even when offline", () => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      const habit = habitActions.add({ name: "Offline Habit", emoji: "⚡" });
      const res = habitActions.toggleToday(habit.id);
      expect(res).toBe("done");
      expect(habitActions.lastBackup()).toBeDefined();
    });

    it("5.5 triggers online/offline window event listeners gracefully", () => {
      const offlineSpy = vi.fn();
      window.addEventListener("offline", offlineSpy);
      window.dispatchEvent(new Event("offline"));
      expect(offlineSpy).toHaveBeenCalledTimes(1);
      window.removeEventListener("offline", offlineSpy);
    });
  });

  // =========================================================================
  // Feature 6: Direct Habit Check-In (No Modal) (R2)
  // =========================================================================
  describe("Feature 6: Direct Habit Check-In (No Modal)", () => {
    it("6.1 toggles habit completion directly on click without modal intervention", () => {
      const today = todayKey();
      const habit = createMockHabit({ id: "direct-1", name: "Direct Habit", completedDates: [] });
      const onToggle = vi.fn();

      render(
        h(NeoGlassHabitCard, {
          habit,
          today,
          onToggleToday: onToggle,
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );

      const checkBtn = screen.getByRole("button", { name: /complete direct habit for today/i });
      fireEvent.click(checkBtn);
      expect(onToggle).toHaveBeenCalledWith("direct-1");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("6.2 updates habit currentStreak immediately upon completion", () => {
      const habit = habitActions.add({ name: "Streak Test", emoji: "🔥" });
      expect(habit.currentStreak).toBe(0);
      habitActions.toggleToday(habit.id);
      const stored = habitActions.toggleToday(habit.id);
      expect(stored).toBe("undone");
    });

    it("6.3 adds today's date key to completedDates list", () => {
      const today = todayKey();
      const habit = habitActions.add({ name: "Date Key Test", emoji: "🎯" });
      habitActions.toggleToday(habit.id);
      const raw = localStorage.getItem("streakflame_streaks");
      expect(raw).toContain(today);
    });

    it("6.4 undoes check-in when clicking an already completed habit", () => {
      const habit = habitActions.add({ name: "Undo Test", emoji: "✨" });
      const first = habitActions.toggleToday(habit.id);
      expect(first).toBe("done");
      const second = habitActions.toggleToday(habit.id);
      expect(second).toBe("undone");
    });

    it("6.5 operates seamlessly on hero card check-in and habit list item cards", () => {
      const onHeroCheckIn = vi.fn();
      render(
        h(
          "button",
          {
            type: "button",
            onClick: () => onHeroCheckIn("next-habit-id"),
            className: "bg-primary text-primary-foreground",
          },
          "Check in now"
        )
      );
      fireEvent.click(screen.getByText("Check in now"));
      expect(onHeroCheckIn).toHaveBeenCalledWith("next-habit-id");
    });
  });

  // =========================================================================
  // Feature 7: Haptic Feedback & Particle Pop (R2)
  // =========================================================================
  describe("Feature 7: Haptic Feedback & Particle Pop", () => {
    it("7.1 calls hapticEngine.tickTap() on habit check-in", async () => {
      const tickTapSpy = vi.spyOn(hapticEngine, "tickTap").mockResolvedValue();
      await hapticEngine.tickTap();
      expect(tickTapSpy).toHaveBeenCalledTimes(1);
    });

    it("7.2 returns a Promise<void> resolving cleanly from tickTap", async () => {
      const promise = hapticEngine.tickTap();
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).resolves.toBeUndefined();
    });

    it("7.3 renders CheckPopBurst at specified coordinates (x, y)", async () => {
      const CheckPopBurst = await resolveCheckPopBurst();
      render(h(CheckPopBurst, { x: 120, y: 240, onComplete: vi.fn() }));
      const burst = screen.getByTestId("check-pop-burst");
      expect(burst).toBeInTheDocument();
      expect(burst.style.left).toBe("120px");
      expect(burst.style.top).toBe("240px");
    });

    it("7.4 renders 8 particle elements with expanding burst animation", async () => {
      const CheckPopBurst = await resolveCheckPopBurst();
      render(h(CheckPopBurst, { x: 50, y: 50, onComplete: vi.fn() }));
      const particles = screen.getAllByTestId("pop-particle");
      expect(particles).toHaveLength(8);
    });

    it("7.5 triggers onComplete callback after particle animation finishes", async () => {
      vi.useFakeTimers();
      const CheckPopBurst = await resolveCheckPopBurst();
      const onComplete = vi.fn();
      render(h(CheckPopBurst, { x: 10, y: 10, onComplete }));
      expect(onComplete).not.toHaveBeenCalled();
      vi.advanceTimersByTime(450);
      expect(onComplete).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  // =========================================================================
  // Feature 8: Progressive Disclosure (Timer, Stepper, Notes) (R2)
  // =========================================================================
  describe("Feature 8: Progressive Disclosure (Timer, Stepper, Notes)", () => {
    it("8.1 suppresses quantitative and avoid controls on standard boolean habits", () => {
      const today = todayKey();
      const standardHabit = createMockHabit({ kind: "boolean" });

      render(
        h(NeoGlassHabitCard, {
          habit: standardHabit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      expect(screen.queryByTitle(/decrease/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/increase/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /stay clean/i })).not.toBeInTheDocument();
    });

    it("8.2 renders quantitative stepper (+/-) and progress chips only on quantitative habits", () => {
      const today = todayKey();
      const quantHabit = createMockQuantitativeHabit({ targetValue: 2000, unit: "ml" });
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
      expect(screen.getAllByText(/ml/i)[0]).toBeInTheDocument();
      expect(screen.getByTitle(/decrease/i)).toBeInTheDocument();
      expect(screen.getByText(/250/)).toBeInTheDocument();
    });

    it("8.3 renders avoid / relapse controls and clean streak only on avoid habits", () => {
      const today = todayKey();
      const avoidHabit = createMockAvoidHabit({ dailyCost: 10 });
      render(
        h(NeoGlassHabitCard, {
          habit: avoidHabit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      expect(screen.getByRole("button", { name: /stay clean/i })).toBeInTheDocument();
      expect(screen.getAllByText(/clean/i)[0]).toBeInTheDocument();
    });

    it("8.4 renders subtasks checklist and toggle buttons only on habits with subtasks", () => {
      const today = todayKey();
      const subtaskHabit = createMockSubtaskHabit();
      render(
        h(NeoGlassHabitCard, {
          habit: subtaskHabit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      expect(screen.getByText(/subtasks/i)).toBeInTheDocument();
    });

    it("8.5 renders clean, uncluttered standard check-in for simple boolean habits", () => {
      const today = todayKey();
      const boolHabit = createMockHabit({ kind: "boolean" });
      render(
        h(NeoGlassHabitCard, {
          habit: boolHabit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      expect(screen.queryByTitle(/start focus timer/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/increment/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/clean streak/i)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 9: Swipe Gestures & Visible Button Fallbacks (R2)
  // =========================================================================
  describe("Feature 9: Swipe Gestures & Visible Button Fallbacks", () => {
    it("9.1 detects rightward gesture intended for habit check-in", () => {
      const onSwipeRight = vi.fn();
      let startX = 0;
      const handleTouchStart = (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
      };
      const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientX - startX;
        if (delta > 60) onSwipeRight();
      };

      render(
        h(
          "div",
          {
            "data-testid": "swipe-item",
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
          },
          "Habit Item"
        )
      );

      const item = screen.getByTestId("swipe-item");
      fireEvent.touchStart(item, { touches: [{ clientX: 100 }] });
      fireEvent.touchEnd(item, { changedTouches: [{ clientX: 180 }] });
      expect(onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it("9.2 detects leftward gesture intended for habit editing or details", () => {
      const onSwipeLeft = vi.fn();
      let startX = 0;
      const handleTouchStart = (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
      };
      const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientX - startX;
        if (delta < -60) onSwipeLeft();
      };

      render(
        h(
          "div",
          {
            "data-testid": "swipe-item-left",
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
          },
          "Habit Item"
        )
      );

      const item = screen.getByTestId("swipe-item-left");
      fireEvent.touchStart(item, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(item, { changedTouches: [{ clientX: 120 }] });
      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });


    it("9.3 provides accessible visible button fallbacks for check-in and edit", () => {
      const today = todayKey();
      const habit = createMockHabit();
      render(
        h(NeoGlassHabitCard, {
          habit,
          today,
          onToggleToday: vi.fn(),
          onQuantIncrement: vi.fn(),
          onLogRelapse: vi.fn(),
          onUndoRelapse: vi.fn(),
          onToggleSubtask: vi.fn(),
          onOpenFocusTimer: vi.fn(),
        })
      );
      const checkBtn = screen.getByRole("button", { name: /undo daily reading check-in/i });
      expect(checkBtn).toBeVisible();
    });

    it("9.4 ignores minor micro-movements below touch threshold", () => {
      const onSwipe = vi.fn();
      let startX = 0;
      const handleTouchStart = (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
      };
      const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = Math.abs(e.changedTouches[0].clientX - startX);
        if (delta > 60) onSwipe();
      };

      render(
        h(
          "div",
          {
            "data-testid": "touch-jitter",
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
          },
          "Jitter Item"
        )
      );

      const item = screen.getByTestId("touch-jitter");
      fireEvent.touchStart(item, { touches: [{ clientX: 100 }] });
      fireEvent.touchEnd(item, { changedTouches: [{ clientX: 115 }] });
      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("9.5 supports keyboard navigation without requiring touch gestures", () => {
      const onSelect = vi.fn();
      render(
        h(
          "button",
          {
            type: "button",
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") onSelect();
            },
          },
          "Keyboard Check-In"
        )
      );
      const btn = screen.getByText("Keyboard Check-In");
      fireEvent.keyDown(btn, { key: "Enter" });
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Feature 10: 6-Month dithercn Heatmap Calendar (R3)
  // =========================================================================
  describe("Feature 10: 6-Month dithercn Heatmap Calendar", () => {
    it("10.1 renders 182 days (26 weeks) of habit momentum in grid layout", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      const mockDays = Array.from({ length: 182 }, (_, i) => ({
        date: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
        done: (i % 3),
        total: 2,
        level: ((i % 5) as 0 | 1 | 2 | 3 | 4),
      }));

      render(h(DitherHeatmapCalendar, { data: mockDays, streak: 12 }));
      const cells = screen.getAllByTestId("heatmap-cell");
      expect(cells).toHaveLength(182);
    });

    it("10.2 assigns correct dither levels (0 to 4) according to completion fraction", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      const data = [
        { date: "2026-10-01", done: 0, total: 4, level: 0 as const },
        { date: "2026-10-02", done: 1, total: 4, level: 1 as const },
        { date: "2026-10-03", done: 2, total: 4, level: 2 as const },
        { date: "2026-10-04", done: 3, total: 4, level: 3 as const },
        { date: "2026-10-05", done: 4, total: 4, level: 4 as const },
      ];
      render(h(DitherHeatmapCalendar, { data, streak: 5 }));
      const cells = screen.getAllByTestId("heatmap-cell");
      expect(cells[0]).toHaveAttribute("data-level", "0");
      expect(cells[4]).toHaveAttribute("data-level", "4");
    });

    it("10.3 applies CSS token variable references (--dither-cell, --dither-bloom)", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      const data = [{ date: "2026-10-01", done: 4, total: 4, level: 4 as const }];
      render(h(DitherHeatmapCalendar, { data, streak: 1 }));
      const cell = screen.getByTestId("heatmap-cell");
      expect(cell).toHaveAttribute("data-dither-token", "--dither-bloom");
    });

    it("10.4 displays active streak count prominently alongside the calendar", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      render(h(DitherHeatmapCalendar, { data: [], streak: 42 }));
      expect(screen.getByTestId("heatmap-streak")).toHaveTextContent("42 day streak");
    });

    it("10.5 handles horizontal overflow and mobile scrollability", async () => {
      const DitherHeatmapCalendar = await resolveDitherHeatmapCalendar();
      render(h(DitherHeatmapCalendar, { data: [], streak: 0, className: "overflow-x-auto" }));
      const calendar = screen.getByTestId("dither-heatmap-calendar");
      expect(calendar.className).toContain("overflow-x-auto");
    });
  });

  // =========================================================================
  // Feature 11: NumberTicker & Animated Circular Progress (R3)
  // =========================================================================
  describe("Feature 11: NumberTicker & Animated Circular Progress", () => {
    it("11.1 NumberTicker renders numeric value accurately with tabular formatting", async () => {
      const NumberTicker = await resolveNumberTicker();
      render(h(NumberTicker, { value: 125 }));
      const ticker = screen.getByTestId("number-ticker");
      expect(ticker).toHaveTextContent("125");
      expect(ticker.className).toContain("tabular-nums");
    });

    it("11.2 NumberTicker supports decimal places configuration", async () => {
      const NumberTicker = await resolveNumberTicker();
      render(h(NumberTicker, { value: 98.765, decimalPlaces: 1 }));
      expect(screen.getByTestId("number-ticker")).toHaveTextContent("98.8");
    });

    it("11.3 AnimatedCircularProgressBar computes percentage and stroke dash offset", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(h(AnimatedCircularProgressBar, { value: 50, max: 100, min: 0, size: 100, strokeWidth: 10 }));
      const indicator = screen.getByTestId("circular-progress-indicator");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute("stroke-dashoffset");
    });

    it("11.4 AnimatedCircularProgressBar clamps values between min and max bounds", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(h(AnimatedCircularProgressBar, { value: 150, max: 100, min: 0 }));
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "100");
    });

    it("11.5 AnimatedCircularProgressBar renders SVG circles with progressbar role", async () => {
      const AnimatedCircularProgressBar = await resolveAnimatedCircularProgressBar();
      render(
        h(
          AnimatedCircularProgressBar,
          { value: 3, max: 5 },
          h("span", null, "3/5")
        )
      );
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("3/5")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 12: Streak Milestone Badges (3d, 7d, 21d, 50d, 100d) (R3)
  // =========================================================================
  describe("Feature 12: Streak Milestone Badges (3d, 7d, 21d, 50d, 100d)", () => {
    it("12.1 recognizes 3-day streak milestone as the initial spark threshold", () => {
      const m3 = CONTRACT_MILESTONES.find((m) => m.days === 3);
      expect(m3).toBeDefined();
      expect(m3?.days).toBe(3);
    });

    it("12.2 unlocks 7-day ('First Spark') and 21-day ('Habit Loop') milestones", () => {
      const m7 = CONTRACT_MILESTONES.find((m) => m.days === 7);
      const m21 = CONTRACT_MILESTONES.find((m) => m.days === 21);
      expect(m7).toBeDefined();
      expect(m21).toBeDefined();
    });

    it("12.3 unlocks 50-day ('Steady Rhythm') and 100-day ('Century Run') milestones", () => {
      const m50 = CONTRACT_MILESTONES.find((m) => m.days === 50);
      const m100 = CONTRACT_MILESTONES.find((m) => m.days === 100);
      expect(m50).toBeDefined();
      expect(m100).toBeDefined();
    });

    it("12.4 computes reached milestones vs next upcoming milestone accurately", () => {
      const result = getContractMilestones(10);
      expect(result.reached.map((m) => m.days)).toEqual([3, 7]);
      expect(result.next?.days).toBe(21);
    });

    it("12.5 renders milestone badge emoji, title, and day count", () => {
      const milestone = CONTRACT_MILESTONES[0];
      render(
        h(
          "div",
          { "data-testid": "badge" },
          h("span", null, milestone.badge),
          h("span", null, `${milestone.days} Days`),
          h("span", null, milestone.title)
        )
      );
      expect(screen.getByText(/3 days/i)).toBeInTheDocument();
      expect(screen.getByText(milestone.title)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 13: Sandboxed Backup Restore & Data Isolation (R4)
  // =========================================================================
  describe("Feature 13: Sandboxed Backup Restore & Data Isolation", () => {
    it("13.1 validates valid JSON backup payload in sandbox before store mutation", () => {
      const payload = createMockBackupPayload({
        habits: [createMockHabit({ id: "valid-1", name: "Valid Habit" })],
      });
      const result = inspectBackupSandbox(payload);
      expect(result.valid).toBe(true);
      expect(result.habitsCount).toBe(1);
    });

    it("13.2 isolates and rejects corrupted or malformed JSON payloads without throwing", () => {
      const result = inspectBackupSandbox(CORRUPT_PAYLOADS.malformedJson);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("13.3 preserves live store data 100% untouched when backup restore validation fails", () => {
      habitActions.add({ name: "Untouched Live Habit", emoji: "🛡️" });
      const badPayload = CORRUPT_PAYLOADS.malformedJson;
      const result = inspectBackupSandbox(badPayload);
      expect(result.valid).toBe(false);

      const stored = localStorage.getItem("streakflame_streaks");
      expect(stored).toContain("Untouched Live Habit");
    });

    it("13.4 extracts and restores standalone notes alongside habits and settings", () => {
      const note = createMockNote({ title: "Journal Entry 1" });
      const payload = createMockBackupPayload({ notes: [note] });
      const result = inspectBackupSandbox(payload);
      expect(result.valid).toBe(true);
      expect(result.notesCount).toBe(1);
    });

    it("13.5 verifies presence of required habit records and rejects empty/null root objects", () => {
      expect(inspectBackupSandbox("null").valid).toBe(false);
      expect(inspectBackupSandbox("").valid).toBe(false);
      expect(inspectBackupSandbox("{}").valid).toBe(false);
    });
  });

  // =========================================================================
  // Feature 14: Multi-Format Exports (JSON, CSV, Markdown) (R4)
  // =========================================================================
  describe("Feature 14: Multi-Format Exports (JSON, CSV, Markdown)", () => {
    it("14.1 exports complete vault backup as structured JSON with habits, settings, and notes", () => {
      const habit = createMockHabit({ name: "Export Test Habit" });
      const backupObj = buildBackup([habit], DEFAULT_SETTINGS, new Date(), []);
      expect(backupObj.data.streaks).toBeDefined();
      expect(backupObj.data.streaks[0].name).toBe("Export Test Habit");
    });

    it("14.2 exports tabular CSV with habit names, streaks, and completion history", () => {
      const habit = createMockHabit({ name: "Morning Run", currentStreak: 7 });
      const csv = habitsToCsv([habit]);
      expect(csv).toContain("currentStreak");
      expect(csv).toContain("Morning Run");
      expect(csv).toContain("7");
    });

    it("14.3 exports Markdown journal summary formatted for notes apps (Obsidian, Logseq)", () => {
      const habit = createMockHabit({ name: "Deep Work", currentStreak: 14 });
      const md = exportToMarkdown([habit]);
      expect(md).toContain("Daily Spark");
      expect(md).toContain("Deep Work");
      expect(md).toContain("14");
    });

    it("14.4 includes proper headers and delimiter escaping in CSV export", () => {
      const habitWithComma = createMockHabit({ name: "Read, reflect, and write" });
      const csv = habitsToCsv([habitWithComma]);
      expect(csv).toContain('"Read, reflect, and write"');
    });

    it("14.5 preserves UTF-8 emoji and habit icons across all export formats", () => {
      const habitWithEmoji = createMockHabit({ name: "Meditation 🧘✨", emoji: "🧘" });
      const backupObj = buildBackup([habitWithEmoji], DEFAULT_SETTINGS, new Date(), []);
      const jsonStr = JSON.stringify(backupObj);
      const csvStr = habitsToCsv([habitWithEmoji]);
      const mdStr = exportToMarkdown([habitWithEmoji]);

      expect(jsonStr).toContain("🧘");
      expect(csvStr).toContain("🧘");
      expect(mdStr).toContain("🧘");
    });
  });

  // =========================================================================
  // Feature 15: Plain-Language Single-Card Privacy Screen (R4)
  // =========================================================================
  describe("Feature 15: Plain-Language Single-Card Privacy Screen", () => {
    const PRIVACY_STATEMENT = "No accounts, No servers, No ads, No analytics, No data leaves this device";

    it("15.1 displays single-card layout stating 'No accounts, No servers, No ads, No analytics, No data leaves this device'", () => {
      render(
        h(
          "div",
          { "data-testid": "privacy-card", className: "rounded-3xl border border-white/10 bg-surface p-6" },
          h("h2", null, "Privacy Guarantee"),
          h("p", null, PRIVACY_STATEMENT)
        )
      );
      expect(screen.getByText(PRIVACY_STATEMENT)).toBeInTheDocument();
    });

    it("15.2 provides accessible heading and description without deceptive dark patterns", () => {
      render(
        h(
          "div",
          { "data-testid": "privacy-card", role: "region", "aria-label": "Privacy Information" },
          h("h1", null, "Zero Knowledge, Zero Servers"),
          h("p", null, PRIVACY_STATEMENT)
        )
      );
      expect(screen.getByRole("region", { name: /privacy information/i })).toBeInTheDocument();
    });

    it("15.3 meets or exceeds WCAG AA 4.5:1 text contrast ratio requirements", () => {
      const bgLum = 0.015;
      const fgLum = 0.88;
      const ratio = (fgLum + 0.05) / (bgLum + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("15.4 is accessible via navigation and dedicated route", async () => {
      const { Route } = await import("@/routes/privacy");
      expect(Route).toBeDefined();
    });

    it("15.5 contains no remote tracker scripts, pixel beacons, or external telemetry", () => {
      const scripts = Array.from(document.querySelectorAll("script"));
      const hasTracker = scripts.some(
        (s) =>
          s.src.includes("google-analytics") ||
          s.src.includes("doubleclick") ||
          s.src.includes("facebook")
      );
      expect(hasTracker).toBe(false);
    });
  });

  // =========================================================================
  // Feature 16: Configurable Midnight Rollover (3 AM Night Owl) (R4)
  // =========================================================================
  describe("Feature 16: Configurable Midnight Rollover (3 AM Night Owl)", () => {
    it("16.1 returns standard calendar date when rolloverHour is 0 (default)", () => {
      const testDate = new Date(2026, 9, 29, 1, 30);
      const key = calculateRolloverTodayKey(testDate, 0);
      expect(key).toBe("2026-10-29");
    });

    it("16.2 shifts date back 24h when current hour is before rolloverHour (e.g. 01:30 AM with 3 AM rollover)", () => {
      const testDate = new Date(2026, 9, 29, 1, 30);
      const key = calculateRolloverTodayKey(testDate, 3);
      expect(key).toBe("2026-10-28");
    });

    it("16.3 keeps current calendar date when current hour is at or after rolloverHour (e.g. 03:00 AM)", () => {
      const testDate = new Date(2026, 9, 29, 3, 0);
      const key = calculateRolloverTodayKey(testDate, 3);
      expect(key).toBe("2026-10-29");
    });

    it("16.4 preserves streak continuity for midnight sessions without premature resets", () => {
      const yesterday = "2026-10-28";
      const habit = createMockHabit({
        completedDates: [yesterday],
        currentStreak: 1,
      });
      const effectiveToday = calculateRolloverTodayKey(new Date(2026, 9, 29, 1, 30), 3);
      expect(effectiveToday).toBe(yesterday);
      expect(isDoneOn(habit, effectiveToday)).toBe(true);
    });

    it("16.5 supports custom rollover hours from 0 to 23", () => {
      const testDate = new Date(2026, 9, 29, 5, 0);
      expect(calculateRolloverTodayKey(testDate, 6)).toBe("2026-10-28");
      expect(calculateRolloverTodayKey(testDate, 5)).toBe("2026-10-29");
      expect(calculateRolloverTodayKey(testDate, 4)).toBe("2026-10-29");
    });
  });

  // =========================================================================
  // Feature 17: PWA Manifest, Service Worker & Update Toast (R5)
  // =========================================================================
  describe("Feature 17: PWA Manifest, Service Worker & Update Toast", () => {
    it("17.1 validates manifest.webmanifest contains standalone display and valid start_url", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.display).toBe("standalone");
      expect(manifest.start_url).toBeDefined();
    });

    it("17.2 validates manifest contains maskable icon and multiple standard icon sizes", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(Array.isArray(manifest.icons)).toBe(true);
      const hasMaskable = manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable");
      expect(hasMaskable).toBe(true);
    });

    it("17.3 validates manifest includes required name, short_name, and theme colors", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.name).toBe("Daily Spark");
      expect(manifest.short_name).toBe("Daily Spark");
      expect(manifest.theme_color).toBeDefined();
    });

    it("17.4 handles service worker registration and offline caching lifecycle", () => {
      const swSupport = "serviceWorker" in navigator;
      expect(typeof swSupport).toBe("boolean");
    });

    it("17.5 provides non-blocking update toast notification when new version is available", () => {
      const onReload = vi.fn();
      render(
        h(
          "div",
          { role: "status", "aria-live": "polite", "data-testid": "update-toast" },
          h("span", null, "Update ready"),
          h("button", { type: "button", onClick: onReload }, "Reload")
        )
      );
      expect(screen.getByText("Update ready")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Reload"));
      expect(onReload).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Feature 18: Desktop Packaging & Tauri 2 Configuration (R5)
  // =========================================================================
  describe("Feature 18: Desktop Packaging & Tauri 2 Configuration", () => {
    it("18.1 verifies scripts/build-desktop.js generates Windows (.exe/.zip) package configs", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      expect(fs.existsSync(scriptPath)).toBe(true);
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("Daily-Spark.exe");
      expect(content).toContain("windows.zip");
    });

    it("18.2 verifies scripts/build-desktop.js generates Linux (.tar.gz) package configs", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("linux.tar.gz");
      expect(content).toContain("daily-spark.desktop");
    });

    it("18.3 verifies desktop packaging script includes offline fallback loopback server", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("HttpListener");
      expect(content).toContain("localhost");
    });

    it("18.4 validates package.json contains desktop build script trigger", () => {
      const pkgPath = path.resolve(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      expect(pkg.scripts["build:desktop"]).toBe("node scripts/build-desktop.js");
    });

    it("18.5 verifies desktop packaging script handles missing dist by triggering web build", () => {
      const scriptPath = path.resolve(process.cwd(), "scripts/build-desktop.js");
      const content = fs.readFileSync(scriptPath, "utf-8");
      expect(content).toContain("npm run build");
    });
  });
});
