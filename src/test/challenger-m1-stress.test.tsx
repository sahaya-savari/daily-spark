import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { MobileBottomNav } from "@/components/app/MobileBottomNav";
import { CommandPalette } from "@/components/app/CommandPalette";
import { transitionTab } from "@/lib/viewTransition";
import { OfflinePage, Route as OfflineRoute } from "@/routes/offline";
import { DailySparkApp } from "@/components/app/DailySparkApp";
import type { Habit } from "@/lib/habits/types";

describe("Empirical Challenger M1-2: Stress & Boundary Verification", () => {
  // =========================================================================
  // 1. Responsive Layout Boundaries: 320px, 390px, 768px, 1023px, 1024px, 1280px
  // =========================================================================
  describe("1. Responsive Layout Boundaries", () => {
    it("1.1 enforces strict >=48px touch targets and safe-area padding at 320px width", () => {
      // At 320px width (e.g. iPhone SE 1st gen), container max width is restricted to 288px
      const { container } = render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
          embedded={false}
        />
      );

      const nav = container.querySelector("nav");
      expect(nav).not.toBeNull();
      // Class checks
      expect(nav?.className).toContain("bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))]");
      expect(nav?.className).toContain("w-[calc(100%-2rem)]");
      expect(nav?.className).toContain("max-w-lg");
      expect(nav?.className).toContain("lg:hidden");

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-\[48px\]/);
        expect(btn.className).toMatch(/min-w-\[48px\]/);
      });
    });

    it("1.2 verifies structural class-toggles across all boundary viewports in DailySparkApp", () => {
      const { container } = render(<DailySparkApp embedded={false} />);

      // Root container responsive padding
      const rootDiv = container.firstElementChild as HTMLElement;
      expect(rootDiv.className).toContain("pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]");
      expect(rootDiv.className).toContain("lg:pb-0");
      expect(rootDiv.className).toContain("lg:flex-row");

      // Desktop navigation rail (<aside>): hidden on <1024px (320px, 390px, 768px, 1023px), flex on >=1024px (1024px, 1280px)
      const desktopRail = container.querySelector("aside");
      expect(desktopRail).not.toBeNull();
      expect(desktopRail?.className).toContain("hidden");
      expect(desktopRail?.className).toContain("lg:flex");
      expect(desktopRail?.className).toContain("w-64");
      expect(desktopRail?.className).toContain("sticky");

      // Mobile header: visible on <1024px, hidden on >=1024px
      const mobileHeader = container.querySelector("header");
      expect(mobileHeader).not.toBeNull();
      expect(mobileHeader?.className).toContain("lg:hidden");

      // Mobile bottom nav: visible on <1024px, hidden on >=1024px
      const mobileNav = container.querySelector("nav[aria-label='Mobile navigation']");
      expect(mobileNav).not.toBeNull();
      expect(mobileNav?.className).toContain("lg:hidden");

      // Main container responsive max-width and padding
      const main = container.querySelector("main");
      expect(main).not.toBeNull();
      expect(main?.className).toContain("max-w-lg");
      expect(main?.className).toContain("lg:max-w-4xl");
      expect(main?.className).toContain("lg:px-8");
    });

    it("1.3 verifies embedded phone mode disables sticky desktop rail and fixes dimensions", () => {
      const { container } = render(<DailySparkApp embedded={true} />);

      // In embedded mode, desktop sidebar rail must NOT be rendered
      const desktopRail = container.querySelector("aside");
      expect(desktopRail).toBeNull();

      // Mobile nav should be embedded (absolute inset-x-3 bottom-3)
      const mobileNav = container.querySelector("nav[aria-label='Mobile navigation']");
      expect(mobileNav).not.toBeNull();
      expect(mobileNav?.className).toContain("absolute");
      expect(mobileNav?.className).toContain("bottom-3");
      expect(mobileNav?.className).not.toContain("lg:hidden");
    });
  });

  // =========================================================================
  // 2. Offline Route Behavior
  // =========================================================================
  describe("2. Offline Route Behavior", () => {
    let originalOnLine: boolean;

    beforeEach(() => {
      originalOnLine = navigator.onLine;
    });

    afterEach(() => {
      Object.defineProperty(navigator, "onLine", {
        value: originalOnLine,
        configurable: true,
      });
    });

    it("2.1 renders offline state with ember indicator when navigator.onLine is false", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });

      render(<OfflinePage />);
      expect(screen.getByText("You're Offline")).toBeInTheDocument();
      expect(screen.getByText("Offline Mode Active")).toBeInTheDocument();
      expect(screen.getByText(/Daily Spark is built 100% offline-first/i)).toBeInTheDocument();
      expect(screen.getByText("Habits saved locally to device storage")).toBeInTheDocument();
      expect(screen.getByText("Streaks calculate without remote servers")).toBeInTheDocument();
      expect(screen.getByText("Zero trackers, zero ads, zero sync latency")).toBeInTheDocument();
    });

    it("2.2 updates dynamically to 'Connection Restored' when online event fires", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });

      render(<OfflinePage />);
      expect(screen.getByText("Offline Mode Active")).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event("online"));
      });

      expect(screen.getByText("Connection Restored")).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event("offline"));
      });

      expect(screen.getByText("Offline Mode Active")).toBeInTheDocument();
    });

    it("2.3 provides action controls: 'Open Habits' link to '/' and reload button", () => {
      render(<OfflinePage />);
      const openHabitsLink = screen.getByRole("link", { name: /open habits/i });
      expect(openHabitsLink).toHaveAttribute("href", "/");

      const checkConnBtn = screen.getByRole("button", { name: /check connection/i });
      expect(checkConnBtn).toBeInTheDocument();
    });

    it("2.4 route definition includes noindex meta and canonical link", () => {
      const headOptions = OfflineRoute.options.head as unknown as () => {
        meta?: Array<Record<string, string>>;
        links?: Array<Record<string, string>>;
      };
      const headResult = headOptions ? headOptions() : null;
      expect(headResult).toBeDefined();

      const robotsMeta = headResult?.meta?.find((m) => m.name === "robots");
      expect(robotsMeta).toEqual({ name: "robots", content: "noindex" });

      const canonicalLink = headResult?.links?.find((l) => l.rel === "canonical");
      expect(canonicalLink?.href).toContain("/offline");
    });
  });

  // =========================================================================
  // 3. View Transitions Resilience & Fallbacks
  // =========================================================================
  describe("3. View Transitions Resilience & Error Fallbacks", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("3.1 falls back to synchronous callback execution if startViewTransition throws", () => {
      const mockCallback = vi.fn();

      // Mock startViewTransition throwing an exception
      Object.defineProperty(document, "startViewTransition", {
        value: () => {
          throw new Error("Simulated transition failure");
        },
        configurable: true,
        writable: true,
      });

      expect(() => {
        transitionTab(mockCallback);
      }).not.toThrow();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("3.2 respects prefers-reduced-motion: reduce without invoking startViewTransition", () => {
      const mockCallback = vi.fn();
      const mockStartViewTransition = vi.fn();

      Object.defineProperty(document, "startViewTransition", {
        value: mockStartViewTransition,
        configurable: true,
        writable: true,
      });

      // Mock matchMedia returning matches: true
      vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
        return {
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        } as unknown as MediaQueryList;
      });

      transitionTab(mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockStartViewTransition).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. Command Palette Stress & Edge Cases
  // =========================================================================
  describe("4. Command Palette Stress & Edge Cases", () => {
    it("4.1 handles empty habits array without rendering errors", () => {
      const onSelectTab = vi.fn();
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={[]}
          onSelectTab={onSelectTab}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Appearance")).toBeInTheDocument();
      expect(screen.queryByText(/Habits \(Check-in/i)).toBeNull();
    });

    it("4.2 handles habits with missing or null attributes without crashing", () => {
      const edgeHabits: Habit[] = [
        {
          id: "edge-1",
          name: "Habit Without Emoji",
          emoji: "",
          createdAt: "2026-01-01T00:00:00.000Z",
          currentStreak: 0,
          longestStreak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
          history: {},
          completedDates: [],
        },
        {
          id: "edge-2",
          name: "High Streak Habit",
          emoji: "🔥",
          category: "Fitness",
          notes: "Very long note describing the daily habit routine",
          createdAt: "2026-01-01T00:00:00.000Z",
          currentStreak: 999,
          longestStreak: 999,
          bestStreak: 999,
          lastCompletedDate: null,
          history: {},
          completedDates: [],
        },
      ];

      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={edgeHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText("Habit Without Emoji")).toBeInTheDocument();
      expect(screen.getByText("High Streak Habit")).toBeInTheDocument();
      expect(screen.getByText("999d")).toBeInTheDocument();
    });

    it("4.3 toggling theme triggers onToggleTheme and closes dialog", () => {
      const onToggleTheme = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          habits={[]}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={onToggleTheme}
        />
      );

      const themeItem = screen.getByText("Toggle Theme");
      fireEvent.click(themeItem);

      expect(onToggleTheme).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
