import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { MobileBottomNav } from "@/components/app/MobileBottomNav";
import { CommandPalette } from "@/components/app/CommandPalette";
import { transitionTab } from "@/lib/viewTransition";
import { detectAppLauncher, isStandaloneApp } from "@/lib/launcher";
import { OfflinePage } from "@/routes/offline";
import { RootPage } from "@/routes/index";
import { LazyLandingPage } from "@/components/landing/LazyLandingPage";
import { DailySparkApp } from "@/components/app/DailySparkApp";
import { StandaloneApp } from "@/components/app/StandaloneApp";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import type { Habit } from "@/lib/habits/types";

describe("Milestone 1 — Shell & Navigation Tests", () => {
  // =========================================================================
  // Feature 1: Mobile Bottom Navigation & Safe-Area Padding
  // =========================================================================
  describe("Feature 1: Mobile Bottom Nav", () => {
    it("renders navigation landmark with aria-label", () => {
      render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );
      const nav = screen.getByRole("navigation", { name: /mobile navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it("applies safe-area inset bottom padding to floating pill positioning", () => {
      render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );
      const nav = screen.getByRole("navigation", { name: /mobile navigation/i });
      expect(nav.className).toContain("bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))]");
    });

    it("enforces >=48px hit targets on all 5 interactive buttons", () => {
      render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={vi.fn()}
        />
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-\[48px\]/);
        expect(btn.className).toMatch(/min-w-\[48px\]/);
      });
    });

    it("marks active tab with aria-current='page' and triggers onTabChange", () => {
      const onTabChange = vi.fn();
      render(
        <MobileBottomNav
          activeTab={1}
          onTabChange={onTabChange}
          onAddClick={vi.fn()}
        />
      );
      const habitsTab = screen.getByRole("button", { name: /^habits$/i });
      expect(habitsTab).toHaveAttribute("aria-current", "page");

      const todayTab = screen.getByRole("button", { name: /^today$/i });
      expect(todayTab).not.toHaveAttribute("aria-current");

      fireEvent.click(todayTab);
      expect(onTabChange).toHaveBeenCalledWith(0);
    });

    it("triggers onAddClick when center FAB is tapped", () => {
      const onAddClick = vi.fn();
      render(
        <MobileBottomNav
          activeTab={0}
          onTabChange={vi.fn()}
          onAddClick={onAddClick}
        />
      );
      const addBtn = screen.getByRole("button", { name: /add new habit/i });
      fireEvent.click(addBtn);
      expect(onAddClick).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Feature 2: Desktop Navigation Rail (>=1024px)
  // =========================================================================
  describe("Feature 2: Desktop Sidebar Navigation Rail", () => {
    it("renders desktop sidebar navigation landmark", () => {
      render(<DailySparkApp embedded={false} />);
      const desktopNav = screen.getByRole("navigation", { name: /desktop navigation/i });
      expect(desktopNav).toBeInTheDocument();
    });

    it("marks active page with aria-current='page' and updates on tab switch", () => {
      render(<DailySparkApp embedded={false} />);
      const desktopNav = screen.getByRole("navigation", { name: /desktop navigation/i });
      const todayBtn = desktopNav.querySelector("button:nth-child(1)") as HTMLButtonElement;
      const habitsBtn = desktopNav.querySelector("button:nth-child(2)") as HTMLButtonElement;

      expect(todayBtn).toHaveAttribute("aria-current", "page");
      expect(habitsBtn).not.toHaveAttribute("aria-current");

      fireEvent.click(habitsBtn);
      expect(habitsBtn).toHaveAttribute("aria-current", "page");
      expect(todayBtn).not.toHaveAttribute("aria-current");
    });

    it("renders command palette quick trigger button in desktop sidebar", () => {
      render(<DailySparkApp embedded={false} />);
      const searchTrigger = screen.getByRole("button", {
        name: /open command palette \(ctrl\+k or cmd\+k\)/i,
      });
      expect(searchTrigger).toBeInTheDocument();

      fireEvent.click(searchTrigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Command Palette")).toBeInTheDocument();
    });

    it("renders '+ New Habit' button in desktop sidebar navigation rail", () => {
      render(<DailySparkApp embedded={false} />);
      const desktopNav = screen.getByRole("navigation", { name: /desktop navigation/i });
      const newHabitBtn = within(desktopNav).getByRole("button", { name: /new habit/i });
      expect(newHabitBtn).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 3: Command Palette
  // =========================================================================
  describe("Feature 3: Command Palette (Ctrl+K / Cmd+K)", () => {
    const mockHabits: Habit[] = [
      {
        id: "h1",
        name: "Morning Meditation",
        emoji: "🧘",
        createdAt: "2026-01-01T00:00:00.000Z",
        currentStreak: 5,
        longestStreak: 12,
        bestStreak: 12,
        lastCompletedDate: null,
        history: {},
        completedDates: [],
      },
      {
        id: "h2",
        name: "Evening Reading",
        emoji: "📚",
        createdAt: "2026-01-01T00:00:00.000Z",
        currentStreak: 0,
        longestStreak: 4,
        bestStreak: 4,
        lastCompletedDate: null,
        history: {},
        completedDates: [],
      },
    ];

    it("renders command palette dialog when open", () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={mockHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
    });

    it("includes accessible screen reader title and description", () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          habits={mockHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );
      expect(screen.getByText("Command Palette")).toBeInTheDocument();
      expect(
        screen.getByText(/quick navigation, habit check-in, and appearance settings/i)
      ).toBeInTheDocument();
    });

    it("supports navigation item selection and invokes onSelectTab", () => {
      const onSelectTab = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          habits={mockHabits}
          onSelectTab={onSelectTab}
          onToggleHabit={vi.fn()}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );
      const habitsItem = screen.getByText("Habits");
      fireEvent.click(habitsItem);
      expect(onSelectTab).toHaveBeenCalledWith(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("displays active habits and triggers onToggleHabit on selection", () => {
      const onToggleHabit = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          habits={mockHabits}
          onSelectTab={vi.fn()}
          onToggleHabit={onToggleHabit}
          theme="classic"
          onToggleTheme={vi.fn()}
        />
      );
      expect(screen.getByText("Morning Meditation")).toBeInTheDocument();
      const habitItem = screen.getByText("Morning Meditation");
      fireEvent.click(habitItem);
      expect(onToggleHabit).toHaveBeenCalledWith("h1");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("supports theme toggle from command palette", () => {
      const onToggleTheme = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          habits={mockHabits}
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

  // =========================================================================
  // Feature 4: View Transitions API
  // =========================================================================
  describe("Feature 4: View Transitions API Integration", () => {
    it("executes callback synchronously when View Transitions API is not available", () => {
      const callback = vi.fn();
      transitionTab(callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("honors prefers-reduced-motion and executes callback directly without animation", () => {
      const callback = vi.fn();
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      try {
        transitionTab(callback);
        expect(callback).toHaveBeenCalledTimes(1);
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });

    it("uses document.startViewTransition when available in browser", () => {
      const callback = vi.fn();
      const mockStartViewTransition = vi.fn().mockImplementation((fn: () => void) => fn());
      (document as unknown as { startViewTransition: unknown }).startViewTransition = mockStartViewTransition;

      try {
        transitionTab(callback);
        expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
      } finally {
        delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
      }
    });
  });

  // =========================================================================
  // Feature 5: Dedicated Offline Fallback Route (/offline)
  // =========================================================================
  describe("Feature 5: Offline Fallback Route", () => {
    it("matches /offline route in router routeTree", () => {
      const router = createRouter({ routeTree });
      const offlineMatch = router.matchRoutes("/offline");
      expect(offlineMatch.at(-1)?.routeId).toBe("/offline");
    });

    it("renders offline status page with reassurance", () => {
      render(<OfflinePage />);
      expect(screen.getByText("You're Offline")).toBeInTheDocument();
      expect(
        screen.getByText(/Daily Spark is built 100% offline-first/i)
      ).toBeInTheDocument();
    });

    it("displays offline trust badges (local storage, no servers, zero trackers)", () => {
      render(<OfflinePage />);
      expect(
        screen.getByText("Habits saved locally to device storage")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Streaks calculate without remote servers")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Zero trackers, zero ads, zero sync latency")
      ).toBeInTheDocument();
    });

    it("provides action button to return to habits", () => {
      render(<OfflinePage />);
      const link = screen.getByRole("link", { name: /open habits/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });

    it("updates live network indicator on online and offline events", () => {
      render(<OfflinePage />);
      fireEvent(window, new Event("online"));
      expect(screen.getByText("Connection Restored")).toBeInTheDocument();

      fireEvent(window, new Event("offline"));
      expect(screen.getByText("Offline Mode Active")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Feature 6: Standalone App Launcher Detection
  // =========================================================================
  describe("Feature 6: Standalone Launcher Detection", () => {
    const originalLocation = window.location;
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      Object.defineProperty(window, "location", { value: originalLocation, writable: true, configurable: true });
      window.matchMedia = originalMatchMedia;
      delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
      delete (window as unknown as { androidBridge?: unknown }).androidBridge;
    });

    it("detects web landing mode in standard browser window", () => {
      const res = detectAppLauncher();
      expect(res.isApp).toBe(false);
      expect(res.mode).toBe("web-landing");
      expect(isStandaloneApp()).toBe(false);
    });

    it("detects PWA standalone display mode via matchMedia", () => {
      window.matchMedia = vi.fn().mockImplementation((q: string) => ({
        matches: q.includes("display-mode: standalone"),
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
      expect(isStandaloneApp()).toBe(true);
    });

    it("detects URL launcher query parameters (?mode=app)", () => {
      delete (window as unknown as { location: unknown }).location;
      (window as unknown as { location: unknown }).location = {
        search: "?mode=app",
      };

      const res = detectAppLauncher();
      expect(res.isApp).toBe(true);
      expect(res.mode).toBe("pwa-param");
      expect(isStandaloneApp()).toBe(true);
    });

    it("detects desktop Tauri runner environment", () => {
      (window as unknown as { __TAURI__: unknown }).__TAURI__ = {};
      const res = detectAppLauncher();
      expect(res.isApp).toBe(true);
      expect(res.mode).toBe("tauri");
      expect(isStandaloneApp()).toBe(true);
    });

    it("RootPage uses the lazy landing page on web and DailySparkApp on standalone", () => {
      // 1. Web browser
      const webResult = RootPage();
      expect(webResult.type).toBe(LazyLandingPage);

      // 2. Standalone app (?mode=app)
      delete (window as unknown as { location: unknown }).location;
      (window as unknown as { location: unknown }).location = {
        search: "?mode=app",
      };
      const appResult = RootPage();
      expect(appResult.type).toBe(StandaloneApp);
    });
  });
});
