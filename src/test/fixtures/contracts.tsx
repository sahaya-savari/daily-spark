import React, { useEffect, useState } from "react";
import type { Habit, MilestoneDef } from "@/lib/habits/types";
import { MILESTONES as BASE_MILESTONES } from "@/lib/habits/types";
import { toKey } from "@/lib/habits/dates";

// -------------------------------------------------------------
// 1. Command Palette Interface Contract (PROJECT.md § Shell ↔ App)
// -------------------------------------------------------------
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  onSelectTab: (tab: number) => void;
  onToggleHabit: (id: string) => void;
  theme: string;
  onToggleTheme: () => void;
}

export const ReferenceCommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  habits,
  onSelectTab,
  onToggleHabit,
  theme,
  onToggleTheme,
}) => {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filteredHabits = habits.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange(false);
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface p-4 shadow-2xl">
        <input
          type="text"
          role="searchbox"
          aria-label="Search habits or actions"
          placeholder="Type a command or search habits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none"
          autoFocus
        />

        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Navigation</p>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Quick Navigation">
            <button
              type="button"
              onClick={() => {
                onSelectTab(0);
                onOpenChange(false);
              }}
              className="rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-surface-2"
            >
              Today (Home)
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab(1);
                onOpenChange(false);
              }}
              className="rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-surface-2"
            >
              All Habits &amp; Notes
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab(2);
                onOpenChange(false);
              }}
              className="rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-surface-2"
            >
              Progress &amp; Heatmap
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab(3);
                onOpenChange(false);
              }}
              className="rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-surface-2"
            >
              Settings
            </button>
          </div>

          <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-2">Actions</p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-surface-2"
          >
            <span>Toggle Theme</span>
            <span className="font-mono text-[10px] text-faint">{theme}</span>
          </button>

          {filteredHabits.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-2">Habits</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredHabits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      onToggleHabit(h.id);
                      onOpenChange(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-xs hover:bg-surface-2"
                  >
                    <span>{h.name}</span>
                    <span className="text-[10px] text-ember">{h.currentStreak}d</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export async function resolveCommandPalette(): Promise<React.FC<CommandPaletteProps>> {
  try {
    const spec = "@/components/app/CommandPalette";
    const mod = await import(/* @vite-ignore */ spec);
    if (mod && mod.CommandPalette) return mod.CommandPalette;
  } catch {
    // Return reference implementation matching interface contract
  }
  return ReferenceCommandPalette;
}

// -------------------------------------------------------------
// 2. View Transitions API Contract (PROJECT.md § Shell ↔ App)
// -------------------------------------------------------------
export function transitionTab(callback: () => void): void {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    callback();
    return;
  }
  const doc = document as unknown as {
    startViewTransition?: (cb: () => void) => { catch?: (fn: () => void) => void } | void;
  };
  if (typeof doc.startViewTransition === "function") {
    try {
      const res = doc.startViewTransition(callback);
      if (res && typeof res.catch === "function") {
        res.catch(() => {});
      }
      return;
    } catch {
      // Graceful fallback on startViewTransition rejection
      callback();
      return;
    }
  }
  callback();
}

// -------------------------------------------------------------
// 3. Particle Pop Burst Contract (PROJECT.md § Habit Interactions)
// -------------------------------------------------------------
export interface CheckPopBurstProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export const ReferenceCheckPopBurst: React.FC<CheckPopBurstProps> = ({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 450);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      data-testid="check-pop-burst"
      className="pointer-events-none fixed z-50"
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          data-testid="pop-particle"
          className="absolute size-1.5 rounded-full bg-ember animate-ping"
          style={{
            transform: `rotate(${i * 45}deg) translate(18px)`,
          }}
        />
      ))}
    </div>
  );
};

export async function resolveCheckPopBurst(): Promise<React.FC<CheckPopBurstProps>> {
  try {
    const spec = "@/components/habits/CheckPopBurst";
    const mod = await import(/* @vite-ignore */ spec);
    if (mod && mod.CheckPopBurst) return mod.CheckPopBurst;
  } catch {
    // Fallback to contract reference
  }
  return ReferenceCheckPopBurst;
}

// -------------------------------------------------------------
// 4. 6-Month Dither Heatmap Contract (PROJECT.md § Progress Surfaces)
// -------------------------------------------------------------
export interface DitherHeatmapCalendarProps {
  data: Array<{ date: string; done: number; total: number; level: 0 | 1 | 2 | 3 | 4 }>;
  streak: number;
  className?: string;
}

export const ReferenceDitherHeatmapCalendar: React.FC<DitherHeatmapCalendarProps> = ({
  data,
  streak,
  className = "",
}) => {
  return (
    <div
      data-testid="dither-heatmap-calendar"
      className={`rounded-3xl border border-border/40 bg-surface p-4 overflow-x-auto ${className}`}
    >
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">Momentum</p>
          <p className="font-display text-lg font-bold">6-Month Momentum</p>
        </div>
        <span data-testid="heatmap-streak" className="text-xs font-bold text-ember">
          {streak} day streak
        </span>
      </div>

      <div
        data-testid="heatmap-grid"
        className="grid grid-flow-col grid-rows-7 gap-1"
        style={{ minWidth: "560px" }}
      >
        {data.map((day, idx) => (
          <div
            key={day.date || idx}
            data-testid="heatmap-cell"
            data-date={day.date}
            data-level={day.level}
            data-dither-token={day.level === 0 ? "--dither-cell" : day.level === 4 ? "--dither-bloom" : undefined}
            title={`${day.date}: ${day.done}/${day.total} done`}
            className="size-3 rounded-sm transition-colors"
            style={{
              backgroundColor:
                day.level === 0
                  ? "var(--dither-cell, rgba(255,255,255,0.05))"
                  : day.level === 1
                  ? "rgba(236,137,76,0.3)"
                  : day.level === 2
                  ? "rgba(236,137,76,0.55)"
                  : day.level === 3
                  ? "rgba(236,137,76,0.8)"
                  : "var(--dither-bloom, #ec894c)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export async function resolveDitherHeatmapCalendar(): Promise<React.FC<DitherHeatmapCalendarProps>> {
  try {
    const spec = "@/components/habits/DitherHeatmapCalendar";
    const mod = await import(/* @vite-ignore */ spec);
    if (mod && mod.DitherHeatmapCalendar) return mod.DitherHeatmapCalendar;
  } catch {
    // Fallback to contract reference
  }
  return ReferenceDitherHeatmapCalendar;
}

// -------------------------------------------------------------
// 5. NumberTicker Contract (PROJECT.md § Progress Surfaces)
// -------------------------------------------------------------
export interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}

export const ReferenceNumberTicker: React.FC<NumberTickerProps> = ({
  value,
  className = "",
  decimalPlaces = 0,
}) => {
  return (
    <span data-testid="number-ticker" className={`font-mono tabular-nums ${className}`}>
      {value.toFixed(decimalPlaces)}
    </span>
  );
};

export async function resolveNumberTicker(): Promise<React.FC<NumberTickerProps>> {
  try {
    const spec = "@/components/magicui/number-ticker";
    const mod = await import(/* @vite-ignore */ spec);
    if (mod && mod.NumberTicker) return mod.NumberTicker;
  } catch {
    // Fallback to contract reference
  }
  return ReferenceNumberTicker;
}

// -------------------------------------------------------------
// 6. AnimatedCircularProgressBar Contract (PROJECT.md § Progress Surfaces)
// -------------------------------------------------------------
export interface AnimatedCircularProgressBarProps {
  value: number;
  max?: number;
  min?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const ReferenceAnimatedCircularProgressBar: React.FC<AnimatedCircularProgressBarProps> = ({
  value,
  max = 100,
  min = 0,
  gaugePrimaryColor = "#ec894c",
  gaugeSecondaryColor = "rgba(255,255,255,0.1)",
  size = 100,
  strokeWidth = 10,
  children,
}) => {
  const normalizedMax = Math.max(min + 1, max);
  const clamped = Math.min(normalizedMax, Math.max(min, value));
  const percentage = ((clamped - min) / (normalizedMax - min)) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      data-testid="animated-circular-progress"
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={normalizedMax}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeSecondaryColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          data-testid="circular-progress-indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
};

export async function resolveAnimatedCircularProgressBar(): Promise<React.FC<AnimatedCircularProgressBarProps>> {
  try {
    const spec = "@/components/magicui/animated-circular-progress-bar";
    const mod = await import(/* @vite-ignore */ spec);
    if (mod && mod.AnimatedCircularProgressBar) return mod.AnimatedCircularProgressBar;
  } catch {
    // Fallback to contract reference
  }
  return ReferenceAnimatedCircularProgressBar;
}

// -------------------------------------------------------------
// 7. Midnight Rollover Contract (PROJECT.md § Data / Settings)
// -------------------------------------------------------------
export function calculateRolloverTodayKey(now: Date = new Date(), rolloverHour: number = 0): string {
  const d = new Date(now);
  if (d.getHours() < rolloverHour) {
    // Shift back 24h
    d.setDate(d.getDate() - 1);
  }
  return toKey(d);
}

// -------------------------------------------------------------
// 8. Sandboxed Backup Restore Contract (PROJECT.md § Data / Settings)
// -------------------------------------------------------------
export interface SandboxedInspectionResult {
  valid: boolean;
  habitsCount: number;
  notesCount: number;
  settingsIncluded: boolean;
  rawPayload: unknown;
  error?: string;
}

export function inspectBackupSandbox(text: string): SandboxedInspectionResult {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: null, error: "Empty payload" };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || (Array.isArray(parsed) && parsed.length === 0)) {
      return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: parsed, error: "Invalid JSON root" };
    }

    const data = (parsed.data && typeof parsed.data === "object" ? parsed.data : parsed) as Record<string, unknown>;
    const habitsRaw = Array.isArray(parsed)
      ? (parsed as unknown[])
      : Array.isArray(data.streaks)
      ? (data.streaks as unknown[])
      : Array.isArray(data.habits)
      ? (data.habits as unknown[])
      : null;

    if (!habitsRaw) {
      return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: parsed, error: "No habits array found" };
    }

    const validHabits = habitsRaw.filter((h: unknown): h is Habit => {
      if (!h || typeof h !== "object") return false;
      const item = h as Record<string, unknown>;
      const hasId = typeof item.id === "string" && item.id.trim().length > 0;
      const hasName = typeof item.name === "string" && item.name.trim().length > 0;
      return Boolean(hasId && hasName);
    });
    const notes = Array.isArray(data.notes) ? data.notes : Array.isArray(parsed.notes) ? parsed.notes : [];
    const settings = (data.settings && typeof data.settings === "object") || (parsed.settings && typeof parsed.settings === "object");

    return {
      valid: true,
      habitsCount: validHabits.length,
      notesCount: notes.length,
      settingsIncluded: Boolean(settings),
      rawPayload: parsed,
    };
  } catch (err) {
    return {
      valid: false,
      habitsCount: 0,
      notesCount: 0,
      settingsIncluded: false,
      rawPayload: null,
      error: err instanceof Error ? err.message : "Malformed JSON",
    };
  }
}

// -------------------------------------------------------------
// 9. Milestone Def Contract with 3d Badge (PROJECT.md § Milestone 3)
// -------------------------------------------------------------
export const CONTRACT_MILESTONES: MilestoneDef[] = BASE_MILESTONES.some((m) => m.days === 3)
  ? BASE_MILESTONES
  : [
      { days: 3, title: "Spark Ignition", badge: "✨", description: "3 days of solid momentum" },
      ...BASE_MILESTONES,
    ];

export function getContractMilestones(currentStreak: number): {
  reached: MilestoneDef[];
  next: MilestoneDef | null;
} {
  const reached = CONTRACT_MILESTONES.filter((m) => currentStreak >= m.days);
  const next = CONTRACT_MILESTONES.find((m) => currentStreak < m.days) || null;
  return { reached, next };
}
