import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { CommandPalette } from "@/components/app/CommandPalette";
import { MobileBottomNav } from "@/components/app/MobileBottomNav";
import { transitionTab } from "@/lib/viewTransition";
import { detectAppLauncher, isStandaloneApp } from "@/lib/launcher";
import type { Habit } from "@/lib/habits/types";

// =============================================================================
// Challenger Stress Test Suite: Milestone 1 — Shell & Navigation
// =============================================================================

describe("Empirical Challenger — Milestone 1 Stress Suite", () => {
  // ---------------------------------------------------------------------------
  // 1. CommandPalette Stress & Edge Cases
  // ---------------------------------------------------------------------------
  describe("Target 1: CommandPalette Edge Cases & Stress", () => {
    const createMockHabit = (id: string, name: string, overrides: Partial<Habit> = {}): Habit => ({
      id,
      name,
      emoji: "⚡",
      createdAt: "2026-01-01T00:00:00.000Z",
      currentStreak: 3,
      longestStreak: 10,
      bestStreak: 10,
      lastCompletedDate: null,
      history: {},
      completedDates: [],
      ...overrides,
    });

    it("resiliently handles empty search query, extreme inputs, and special regex characters", () => {
      const habits = [createMockHabit("h1", "Read books"), createMockHabit("h2", "Drink water")];
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={habits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
          onOpenAddHabit={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/type a command/i) as HTMLInputElement;

      // 1. Rapid successive typings
      const hostileQueries = [
        "", // Empty query
        "   ", // Whitespace only
        "⚡", // Emoji only
        ".*+?^${}()|[]\\", // Regex special chars
        "<script>alert('xss')</script>", // HTML/XSS payload
        "'; DROP TABLE habits;--", // SQL injection string
        "a".repeat(1000), // 1000-character string
        "non_existent_habit_xyz_1234567890", // Guaranteed mismatch
      ];

      for (const query of hostileQueries) {
        act(() => {
          fireEvent.change(input, { target: { value: query } });
        });
        expect(input.value).toBe(query);
      }

      // Final hostile query should safely show CommandEmpty
      expect(screen.getByText(/no matching habits or commands found/i)).toBeInTheDocument();
    });

    it("survives malformed habit objects: null/undefined fields, negative streak, missing dates", () => {
      const malformedHabits: Habit[] = [
        createMockHabit("m1", "", { emoji: "", category: undefined, notes: undefined }),
        createMockHabit("m2", "Broken Dates", { completedDates: undefined as unknown as string[] }),
        createMockHabit("m3", "Negative Streak", { currentStreak: -10 }),
        createMockHabit("m4", "Archived Habit", { archivedAt: "2026-01-01T00:00:00.000Z" }),
      ];

      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={malformedHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      // Archived habit must be excluded
      expect(screen.queryByText("Archived Habit")).not.toBeInTheDocument();

      // Negative streak should not crash or render fire badge (currentStreak <= 0)
      expect(screen.getByText("Negative Streak")).toBeInTheDocument();
      expect(screen.queryByText(/-10d/i)).not.toBeInTheDocument();

      // Broken dates habit should render safely without throwing
      expect(screen.getByText("Broken Dates")).toBeInTheDocument();
    });

    it("handles large habit collections (200 habits) without degradation or crash", () => {
      const bulkHabits: Habit[] = Array.from({ length: 200 }, (_, i) =>
        createMockHabit(`bulk-${i}`, `Habit Item ${i}`, {
          emoji: i % 2 === 0 ? "🔥" : "💧",
          currentStreak: i,
        })
      );

      const { container } = render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={bulkHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Habit Item 0")).toBeInTheDocument();
    });

    it("executes rapid habit toggling without race conditions", () => {
      const onToggleHabit = vi.fn();
      const onOpenChange = vi.fn();
      const habit = createMockHabit("toggle-test", "Hydration");

      const { rerender } = render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          habits={[habit]}
          onSelectTab={vi.fn()}
          onToggleHabit={onToggleHabit}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      const habitItem = screen.getByText("Hydration");

      // Rapidly fire 10 clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(habitItem);
      }

      expect(onToggleHabit).toHaveBeenCalledTimes(10);
      expect(onToggleHabit).toHaveBeenLastCalledWith("toggle-test");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("handles platform-specific keyboard shortcuts detection (Mac vs Non-Mac)", () => {
      const originalNavigator = window.navigator;

      // Mock Windows environment
      Object.defineProperty(window, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", platform: "Win32" },
        configurable: true,
      });

      const { rerender } = render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={[]}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText("Alt+1")).toBeInTheDocument();

      // Mock macOS environment
      Object.defineProperty(window, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel" },
        configurable: true,
      });

      rerender(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={[]}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText("⌘1")).toBeInTheDocument();

      Object.defineProperty(window, "navigator", { value: originalNavigator, configurable: true });
    });

    it("safely handles unknown or invalid theme names in appearance group", () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={[]}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="unrecognized_custom_theme_mode"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText("Toggle Theme")).toBeInTheDocument();
      expect(screen.getByText(/Current: unrecognized_custom_theme_mode/i)).toBeInTheDocument();
    });

    it("safely functions when optional onOpenAddHabit is omitted", () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={[]}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.queryByText("Create New Habit")).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. MobileBottomNav Stress & Edge Cases
  // ---------------------------------------------------------------------------
  describe("Target 2: MobileBottomNav Edge Cases & Stress", () => {
    it("handles out-of-bounds activeTab values without crashing (-1, 10, NaN)", () => {
      const { rerender } = render(
        <MobileBottomNav
          activeTab={-1}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );

      // Verify no button has aria-current="page"
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => {
        expect(btn).not.toHaveAttribute("aria-current", "page");
      });

      // Extreme positive index
      rerender(
        <MobileBottomNav
          activeTab={999}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );
      buttons.forEach((btn) => {
        expect(btn).not.toHaveAttribute("aria-current", "page");
      });

      // NaN
      rerender(
        <MobileBottomNav
          activeTab={NaN}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );
      buttons.forEach((btn) => {
        expect(btn).not.toHaveAttribute("aria-current", "page");
      });
    });

    it("verifies embedded mode layout classes and visibility overrides", () => {
      const { rerender } = render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
          embedded={false}
        />
      );

      const nav = screen.getByRole("navigation");
      expect(nav.className).toContain("lg:hidden");
      expect(nav.className).toContain("fixed");

      // Embedded mode
      rerender(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
          embedded={true}
        />
      );

      expect(nav.className).not.toContain("lg:hidden");
      expect(nav.className).toContain("absolute");
      expect(nav.className).toContain("inset-x-3");
      expect(nav.className).toContain("bottom-3");
    });

    it("handles rapid touch/pointer events and sequential tab switching", () => {
      const onTabChange = vi.fn();
      const onAddClick = vi.fn();

      render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={onTabChange}
          onAddClick={onAddClick}
        />
      );

      const habitsBtn = screen.getByRole("button", { name: /^habits$/i });
      const progressBtn = screen.getByRole("button", { name: /^progress$/i });
      const settingsBtn = screen.getByRole("button", { name: /^settings$/i });
      const addBtn = screen.getByRole("button", { name: /add new habit/i });

      // Dispatch mixed pointer/touch events
      fireEvent.touchStart(habitsBtn);
      fireEvent.click(habitsBtn);

      fireEvent.touchStart(progressBtn);
      fireEvent.click(progressBtn);

      fireEvent.touchStart(settingsBtn);
      fireEvent.click(settingsBtn);

      fireEvent.click(addBtn);

      expect(onTabChange).toHaveBeenCalledWith(1);
      expect(onTabChange).toHaveBeenCalledWith(2);
      expect(onTabChange).toHaveBeenCalledWith(3);
      expect(onAddClick).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. viewTransition.ts Stress & Edge Cases
  // ---------------------------------------------------------------------------
  describe("Target 3: viewTransition Edge Cases & Stress", () => {
    it("handles throwing callback gracefully in synchronous fallback mode", () => {
      const explosiveCallback = () => {
        throw new Error("Callback exploded!");
      };

      // In fallback mode, error propagates as standard synchronous execution
      expect(() => transitionTab(explosiveCallback)).toThrow("Callback exploded!");
    });

    it("handles startViewTransition DOMException gracefully and executes callback via catch block", () => {
      const callback = vi.fn();

      // Mock startViewTransition throwing DOMException (e.g. invalid document state)
      const mockStartViewTransition = vi.fn().mockImplementation(() => {
        throw new Error("DOMException: View transition aborted");
      });
      (document as unknown as { startViewTransition: unknown }).startViewTransition = mockStartViewTransition;

      try {
        transitionTab(callback);
        // Even when startViewTransition throws, the safety catch block must execute callback
        expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
      } finally {
        delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      }
    });

    it("handles concurrent transitionTab calls without race conditions or locks", () => {
      const calls: number[] = [];
      const mockStartViewTransition = vi.fn().mockImplementation((fn: () => void) => fn());
      (document as unknown as { startViewTransition: unknown }).startViewTransition = mockStartViewTransition;

      try {
        // Hammer 20 transition calls concurrently
        for (let i = 0; i < 20; i++) {
          transitionTab(() => {
            calls.push(i);
          });
        }

        expect(calls).toHaveLength(20);
        expect(mockStartViewTransition).toHaveBeenCalledTimes(20);
      } finally {
        delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      }
    });

    it("handles window.matchMedia being undefined or throwing unexpected exceptions", () => {
      const originalMatchMedia = window.matchMedia;
      const callback = vi.fn();

      // 1. matchMedia undefined
      (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
      transitionTab(callback);
      expect(callback).toHaveBeenCalledTimes(1);

      // 2. matchMedia throwing
      (window as unknown as { matchMedia?: unknown }).matchMedia = vi.fn().mockImplementation(() => {
        throw new Error("SecurityError: matchMedia blocked");
      });

      // viewTransition should safely fall back
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      const callback2 = vi.fn();
      transitionTab(callback2);
      expect(callback2).toHaveBeenCalledTimes(1);

      window.matchMedia = originalMatchMedia;
    });
  });

  // ---------------------------------------------------------------------------
  // 4. launcher.ts Stress & Edge Cases
  // ---------------------------------------------------------------------------
  describe("Target 4: launcher Edge Cases & Stress", () => {
    const originalLocation = window.location;
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      (window as unknown as { location: unknown }).location = originalLocation;
      window.matchMedia = originalMatchMedia;
      delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
      delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
      delete (window as unknown as { androidBridge?: unknown }).androidBridge;
      delete (window as unknown as { Capacitor?: unknown }).Capacitor;
      delete (window.navigator as unknown as { standalone?: unknown }).standalone;
    });

    it("resiliently parses malformed query parameters and prototype pollution strings", () => {
      const hostileSearches = [
        "?mode=app&mode=web", // Duplicate params
        "?__proto__[polluted]=true&constructor[prototype][x]=1", // Prototype pollution attempt
        "?mode=%E0%A4%A", // Malformed URI encoding
        "?search=" + "a".repeat(50000), // Huge query string
        "?launcher=true&app=1&source=pwa", // Multi-flag hit
      ];

      for (const search of hostileSearches) {
        delete (window as unknown as { location: unknown }).location;
        (window as unknown as { location: unknown }).location = { search };

        expect(() => detectAppLauncher()).not.toThrow();
      }

      // Verify Object prototype was not polluted
      expect((Object.prototype as unknown as { polluted?: unknown }).polluted).toBeUndefined();
    });

    it("evaluates query parameter flags strictly (negative/invalid values return web-landing)", () => {
      const negativeSearches = [
        "?mode=landing",
        "?mode=browser",
        "?app=false",
        "?app=0",
        "?launcher=false",
        "?launcher=0",
        "?source=web",
        "?random_param=true",
      ];

      for (const search of negativeSearches) {
        delete (window as unknown as { location: unknown }).location;
        (window as unknown as { location: unknown }).location = { search };

        const res = detectAppLauncher();
        expect(res.isApp).toBe(false);
        expect(res.mode).toBe("web-landing");
      }
    });

    it("detects Tauri 2 desktop shell via __TAURI_INTERNALS__", () => {
      (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {};
      const res = detectAppLauncher();
      expect(res.isApp).toBe(true);
      expect(res.mode).toBe("tauri");
      expect(isStandaloneApp()).toBe(true);
    });

    it("detects iOS Safari homescreen standalone mode (navigator.standalone)", () => {
      (window.navigator as unknown as { standalone: boolean }).standalone = true;
      const res = detectAppLauncher();
      expect(res.isApp).toBe(true);
      expect(res.mode).toBe("pwa-standalone");
      expect(isStandaloneApp()).toBe(true);
    });

    it("detects Android bridge window global", () => {
      (window as unknown as { androidBridge: unknown }).androidBridge = {};
      const res = detectAppLauncher();
      expect(res.isApp).toBe(true);
      expect(res.mode).toBe("native");
      expect(isStandaloneApp()).toBe(true);
    });

    it("detects window-controls-overlay, minimal-ui, and fullscreen display-modes", () => {
      const modes = ["window-controls-overlay", "minimal-ui", "fullscreen"];

      for (const mode of modes) {
        window.matchMedia = vi.fn().mockImplementation((q: string) => ({
          matches: q.includes(`display-mode: ${mode}`),
          media: q,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }));

        const res = detectAppLauncher();
        expect(res.isApp).toBe(true);
        expect(res.mode).toBe("pwa-standalone");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. DailySparkApp Shell & Navigation Integration Stress
  // ---------------------------------------------------------------------------
  describe("Target 5: DailySparkApp Shell & Navigation Integration Stress", () => {
    it("handles global Ctrl+K and Cmd+K keyboard shortcut toggles", async () => {
      const { DailySparkApp } = await import("@/components/app/DailySparkApp");
      render(<DailySparkApp embedded={false} />);

      // Palette should initially be closed
      expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();

      // Fire Ctrl+K
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
      expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();

      // Fire Ctrl+K again to toggle
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
      expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();

      // Fire Cmd+K (metaKey)
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
    });

    it("verifies safe-area padding class on main container in DailySparkApp", async () => {
      const { DailySparkApp } = await import("@/components/app/DailySparkApp");
      const { container } = render(<DailySparkApp embedded={false} />);

      const rootContainer = container.firstElementChild as HTMLElement;
      expect(rootContainer).not.toBeNull();
      expect(rootContainer.className).toContain("pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]");
      expect(rootContainer.className).toContain("lg:pb-0");
    });

    it("synchronizes tab state between MobileBottomNav, desktop rail, and active view", async () => {
      const { DailySparkApp } = await import("@/components/app/DailySparkApp");
      render(<DailySparkApp embedded={false} />);

      // Switch to Habits tab via MobileBottomNav
      const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
      const habitsMobileBtn = within(mobileNav).getByRole("button", { name: /^habits$/i });
      fireEvent.click(habitsMobileBtn);

      // Verify active view is Habits
      expect(habitsMobileBtn).toHaveAttribute("aria-current", "page");

      // Verify desktop nav also reflects active Habits tab
      const desktopNav = screen.getByRole("navigation", { name: /desktop navigation/i });
      const habitsDesktopBtn = desktopNav.querySelector("button:nth-child(2)") as HTMLButtonElement;
      expect(habitsDesktopBtn).toHaveAttribute("aria-current", "page");
    });

    it("opens Add Habit dialog when center FAB is clicked on MobileBottomNav", async () => {
      const { DailySparkApp } = await import("@/components/app/DailySparkApp");
      render(<DailySparkApp embedded={false} />);

      const fab = screen.getByRole("button", { name: /add new habit/i });
      fireEvent.click(fab);

      expect(screen.getByText("Create New Habit")).toBeInTheDocument();
    });
  });
});

