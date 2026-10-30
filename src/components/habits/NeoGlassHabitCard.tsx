import React, { useState } from "react";
import {
  PixelFire,
  PixelStar,
  PixelCheck,
  PixelClock,
  PixelPlus,
  PixelMinus,
  PixelChevronDown,
  PixelChevronUp,
  PixelAlertTriangle,
  PixelCheckCircle,
  PixelSparkles,
  PixelPen,
  PixelBook,
} from "@/components/ui/pixel-icon";
import { getQuantProgress, getQuickAddOptions } from "@/lib/habits/quantitative";
import { calculateCleanStreak, calculateMoneySaved } from "@/lib/habits/avoid";
import { getSubtaskProgress, isSubtaskCompleted } from "@/lib/habits/subtasks";
import { HabitIcon } from "@/lib/habits/icons";
import { COLOR_SWATCH, type Habit } from "@/lib/habits/types";
import { isNeutralOn } from "@/lib/habits/strength";
import { hapticEngine } from "@/lib/habits/haptics";
import { cn } from "@/lib/utils";
import { CheckPopBurst } from "./CheckPopBurst";
import { DitherNumber } from "@/components/dithercn/dither-number";

interface NeoGlassHabitCardProps {
  habit: Habit;
  today: string;
  onToggleToday: (habitId: string) => void;
  onQuantIncrement: (habitId: string, delta: number) => void;
  onLogRelapse: (habitId: string, cost?: number, reason?: string) => void;
  onUndoRelapse: (habitId: string) => void;
  onToggleSubtask: (habitId: string, subtaskId: string) => void;
  onOpenFocusTimer: (habit: Habit) => void;
  onToggleStar?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

export const NeoGlassHabitCard: React.FC<NeoGlassHabitCardProps> = ({
  habit,
  today,
  onToggleToday,
  onQuantIncrement,
  onLogRelapse,
  onUndoRelapse,
  onToggleSubtask,
  onOpenFocusTimer,
  onToggleStar,
  onEdit,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [relapseCost, setRelapseCost] = useState("");
  const [relapseReason, setRelapseReason] = useState("");
  const [burstCoords, setBurstCoords] = useState<{ x: number; y: number } | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const kind = habit.kind || "boolean";
  const hadRelapseToday = habit.relapses?.some((r) => r.date === today);
  const isVacationToday = isNeutralOn(habit, today);
  const isDoneToday =
    kind === "avoid"
      ? !hadRelapseToday && !isVacationToday
      : habit.completedDates.includes(today);

  // Avoid metrics
  const cleanStreak = calculateCleanStreak(habit, today);
  const moneySaved = calculateMoneySaved(habit, today);

  // Progressive disclosure capabilities
  const hasTimer = Boolean(
    (habit as Record<string, unknown>).hasTimer === true ||
    (typeof (habit as Record<string, unknown>).timerDuration === "number" &&
      Number((habit as Record<string, unknown>).timerDuration) > 0) ||
    (typeof (habit as Record<string, unknown>).timerSec === "number" &&
      Number((habit as Record<string, unknown>).timerSec) > 0) ||
    (typeof habit.totalFocusMinutes === "number" && habit.totalFocusMinutes > 0)
  );

  const isQuantitative =
    kind === "quantitative" ||
    (habit as Record<string, unknown>).targetType === "number" ||
    (typeof habit.targetValue === "number" && habit.targetValue > 1 && kind !== "avoid");

  const noteText = (habit.notes || habit.description || "").trim();
  const hasNotes = Boolean(
    noteText.length > 0 ||
    ((habit as Record<string, unknown>).notesLog &&
      Object.keys((habit as Record<string, unknown>).notesLog as object).length > 0)
  );

  // Quantitative metrics
  const currentQuant =
    habit.quantitativeValues?.[today] ??
    (isDoneToday ? habit.targetValue || 1 : 0);
  const targetQuant = habit.targetValue || 1;
  const quantProgress = getQuantProgress(currentQuant, targetQuant);
  const quickChips = getQuickAddOptions(targetQuant, habit.stepIncrement);

  // Subtask metrics
  const subtaskProgress = getSubtaskProgress(habit, today);
  const hasSubtasks = habit.subtasks && habit.subtasks.length > 0;

  const accentColor = (habit.color && COLOR_SWATCH[habit.color]) || "#bf7245";

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const clampedDelta = Math.max(-100, Math.min(100, deltaX));
      setSwipeOffset(clampedDelta);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX;
    const deltaY = touchStartY !== null ? endY - touchStartY : 0;

    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const SWIPE_THRESHOLD = 60;

    if (isHorizontal) {
      if (deltaX > SWIPE_THRESHOLD) {
        hapticEngine.tickTap();
        onToggleToday(habit.id);
      } else if (deltaX < -SWIPE_THRESHOLD) {
        hapticEngine.tickTap();
        onEdit?.(habit);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const handleTouchCancel = () => {
    setTouchStartX(null);
    setTouchStartY(null);
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  return (
    <div
      data-testid="neo-glass-habit-card"
      className={cn(
        "group relative overflow-hidden rounded-3xl border transition-all duration-300",
        isDoneToday
          ? "border-ember/40 bg-surface/95 shadow-md shadow-ember/10"
          : "border-border/40 bg-surface hover:border-border/80"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Top subtle highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Swipe action visual indicators */}
      {swipeOffset > 20 && (
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center gap-1.5 text-xs font-bold text-primary">
          <PixelCheck className="size-4" />
          <span>Check in</span>
        </div>
      )}
      {swipeOffset < -20 && (
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-1.5 text-xs font-bold text-ember">
          <span>Edit</span>
          <PixelPen className="size-4" />
        </div>
      )}

      <div
        style={{
          transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? "none" : "transform 200ms ease-out",
        }}
        className="p-4"
      >
        {/* Main Card Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-surface-2 transition-transform group-hover:scale-105"
              style={{
                borderColor: `${accentColor}40`,
              }}
            >
              <HabitIcon habit={habit} className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="truncate font-mono text-[14.5px] font-semibold text-foreground">
                  {habit.name}
                </h3>
                {habit.isStarred && (
                  <button
                    type="button"
                    onClick={() => onToggleStar?.(habit.id)}
                    aria-label="Starred habit"
                    className="focus-visible:outline-none"
                  >
                    <PixelStar className="size-3.5 fill-gold text-gold shrink-0" />
                  </button>
                )}
                {isVacationToday && (
                  <span className="flex items-center gap-1 rounded-full border border-border/40 bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-faint">
                    <PixelSparkles className="size-2.5 text-ember" /> Vacation
                  </span>
                )}
              </div>

              {habit.cueText && (
                <p className="mt-0.5 truncate text-[11px] font-medium text-ember">
                  ⚓ After {habit.cueText}
                </p>
              )}

              {/* Progressive Disclosure: Notes indicator */}
              {hasNotes && (
                <p
                  data-testid="habit-notes-indicator"
                  className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-faint"
                  title={noteText}
                  aria-label={`Notes: ${noteText}`}
                >
                  <PixelBook className="size-3 text-ember shrink-0" />
                  <span className="truncate">{noteText}</span>
                </p>
              )}

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {kind === "avoid" ? (
                  <span className="flex items-center gap-1 font-semibold text-ember">
                    <PixelFire className="size-3 text-ember" />
                    <DitherNumber value={cleanStreak} suffix="d clean" />
                    {moneySaved > 0 && (
                      <span className="ml-1 text-[11px] text-faint">
                        · ${moneySaved} saved
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold text-faint">
                    <PixelFire
                      className={cn(
                        "size-3",
                        habit.currentStreak > 0 && "text-ember"
                      )}
                    />{" "}
                    <DitherNumber value={habit.currentStreak} suffix=" days" />
                    {habit.category && (
                      <span className="ml-1 rounded-full bg-surface-2 px-1.5 py-0.2 text-[10px] text-faint">
                        #{habit.category}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button & Timer & Edit fallback */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Progressive Disclosure: Focus Timer Button */}
            {hasTimer && (
              <button
                type="button"
                onClick={() => onOpenFocusTimer(habit)}
                className="grid size-9 place-items-center rounded-xl bg-surface-2 text-faint transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
                title="Start Focus Timer"
                aria-label="Start Focus Timer"
              >
                <PixelClock className="size-4" />
              </button>
            )}

            {/* Accessible visible button fallback for Edit */}
            <button
              type="button"
              onClick={() => onEdit?.(habit)}
              className="grid size-9 place-items-center rounded-xl bg-surface-2 text-faint transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
              title={`Edit ${habit.name}`}
              aria-label={`Edit ${habit.name}`}
            >
              <PixelPen className="size-4" />
            </button>

            {kind === "boolean" && (
              <button
                type="button"
                onClick={(e) => {
                  hapticEngine.tickTap();
                  if (!isDoneToday) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX && e.clientX > 0) ? e.clientX : rect.left + rect.width / 2;
                    const y = (e.clientY && e.clientY > 0) ? e.clientY : rect.top + rect.height / 2;
                    setBurstCoords({ x, y });
                  }
                  onToggleToday(habit.id);
                }}
                aria-label={`Toggle ${habit.name}`}
                className={cn(
                  "check-orb grid size-12 shrink-0 place-items-center rounded-full p-0 transition-transform active:scale-95 cursor-pointer",
                  isDoneToday
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border border-border/40 bg-surface-2 text-faint hover:text-foreground"
                )}
              >
                <PixelCheck className="size-4" />
              </button>
            )}

            {kind === "avoid" && (
              <button
                type="button"
                onClick={() => {
                  if (hadRelapseToday) {
                    onUndoRelapse(habit.id);
                  } else {
                    setShowRelapseModal(true);
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  hadRelapseToday
                    ? "border border-destructive/40 bg-destructive/20 text-destructive-foreground"
                    : "border border-ember/30 bg-ember-soft text-ember hover:bg-ember/25"
                )}
              >
                {hadRelapseToday ? "Relapse Logged" : "Stay Clean"}
              </button>
            )}
          </div>
        </div>

        {/* Quantitative Progress & Stepper */}
        {isQuantitative && (
          <div className="mt-3.5 space-y-2 border-t border-border/30 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground/85">
                <DitherNumber value={currentQuant} /> / <DitherNumber value={targetQuant} /> {habit.unit || ""}
                {quantProgress.laps > 1 && (
                  <span className="ml-1.5 rounded-full bg-ember-soft px-1.5 py-0.2 text-[10px] font-bold text-ember">
                    Lap {quantProgress.laps}
                  </span>
                )}
              </span>
              <span className="font-mono font-semibold text-ember">
                <DitherNumber value={quantProgress.totalPercent} suffix="%" />
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-heat-2 to-ember transition-all duration-300"
                style={{
                  width: `${Math.min(100, quantProgress.totalPercent)}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  hapticEngine.tickTap();
                  onQuantIncrement(habit.id, -(quickChips[0] || 1));
                }}
                disabled={currentQuant <= 0}
                className="flex size-7 items-center justify-center rounded-lg border border-border/40 bg-surface-2 text-faint transition-colors hover:text-foreground disabled:opacity-30 cursor-pointer"
                title="Decrease"
                aria-label="Decrease"
              >
                <PixelMinus className="size-3.5" />
              </button>
              {quickChips.slice(0, 3).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    hapticEngine.tickTap();
                    onQuantIncrement(habit.id, amount);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-border/40 bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface cursor-pointer"
                  title={`Increase by ${amount}`}
                  aria-label={`Increment by ${amount}`}
                >
                  <PixelPlus className="size-3 text-ember" />
                  {amount} {habit.unit || ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks Accordion */}
        {hasSubtasks && (
          <div className="mt-3 border-t border-border/30 pt-2">
            <button
              type="button"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex w-full items-center justify-between py-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                Subtasks ({subtaskProgress.completed}/{subtaskProgress.total})
                {subtaskProgress.allDone && (
                  <span className="font-semibold text-ember">· All Complete</span>
                )}
              </span>
              {showSubtasks ? (
                <PixelChevronUp className="size-3.5" />
              ) : (
                <PixelChevronDown className="size-3.5" />
              )}
            </button>

            {showSubtasks && (
              <div className="mt-2 space-y-1.5 pl-1">
                {habit.subtasks!.map((sub) => {
                  const done = isSubtaskCompleted(habit, sub.id, today);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        hapticEngine.doubleClack();
                        onToggleSubtask(habit.id, sub.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl bg-surface-2/60 px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2 cursor-pointer"
                    >
                      {done ? (
                        <PixelCheckCircle className="size-4 shrink-0 text-ember" />
                      ) : (
                        <span className="size-4 shrink-0 rounded-sm border-2 border-faint/60" />
                      )}
                      <span
                        className={cn(
                          "text-xs",
                          done
                            ? "text-muted-foreground line-through"
                            : "text-foreground/90"
                        )}
                      >
                        {sub.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relapse Dialog Modal */}
      {showRelapseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border/60 bg-surface p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-ember">
              <PixelAlertTriangle className="size-5 text-ember" />
              <h4 className="text-sm font-semibold">Log Relapse</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Honesty is the catalyst for growth. Logging a relapse resets your clean streak for today but preserves your overall history.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Estimated Cost Spent ($)
              </label>
              <input
                type="number"
                placeholder="0"
                value={relapseCost}
                onChange={(e) => setRelapseCost(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-surface-2 px-3 py-1.5 text-xs text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Reason / Trigger (Optional)
              </label>
              <input
                type="text"
                placeholder="Stress, social event..."
                value={relapseReason}
                onChange={(e) => setRelapseReason(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-surface-2 px-3 py-1.5 text-xs text-foreground"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRelapseModal(false)}
                className="flex-1 rounded-xl bg-surface-2 py-2 text-xs font-semibold text-foreground hover:bg-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticEngine.gentleThud();
                  onLogRelapse(habit.id, Number(relapseCost) || 0, relapseReason);
                  setShowRelapseModal(false);
                }}
                className="flex-1 rounded-xl bg-ember py-2 text-xs font-semibold text-white hover:bg-ember/90 cursor-pointer"
              >
                Confirm Log
              </button>
            </div>
          </div>
        </div>
      )}

      {burstCoords && (
        <CheckPopBurst
          x={burstCoords.x}
          y={burstCoords.y}
          onComplete={() => setBurstCoords(null)}
        />
      )}
    </div>
  );
};
