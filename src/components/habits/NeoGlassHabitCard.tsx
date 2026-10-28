import React, { useState } from "react";
import {
  Flame,
  Check,
  Plus,
  Minus,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  DollarSign,
  Palmtree,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { calculateHabitStrength, isNeutralOn } from "@/lib/habits/strength";
import { getQuantProgress, getQuickAddOptions } from "@/lib/habits/quantitative";
import { calculateCleanStreak, calculateMoneySaved } from "@/lib/habits/avoid";
import { getSubtaskProgress, isSubtaskCompleted } from "@/lib/habits/subtasks";
import { HabitIcon } from "@/lib/habits/icons";
import { COLOR_SWATCH, type Habit } from "@/lib/habits/types";
import { getElasticProgress } from "@/lib/habits/elastic";
import { ElasticProgressRing } from "./ElasticProgressRing";
import { formatCueAnchor } from "@/lib/habits/cueAnchor";
import { hapticEngine } from "@/lib/habits/haptics";

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
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [relapseCost, setRelapseCost] = useState("");
  const [relapseReason, setRelapseReason] = useState("");

  const kind = habit.kind || "boolean";
  const hadRelapseToday = habit.relapses?.some((r) => r.date === today);
  const isVacationToday = isNeutralOn(habit, today);
  const isDoneToday = kind === "avoid"
    ? !hadRelapseToday && !isVacationToday
    : habit.completedDates.includes(today);
  const strength = calculateHabitStrength(habit, today);

  // Avoid metrics
  const cleanStreak = calculateCleanStreak(habit, today);
  const moneySaved = calculateMoneySaved(habit, today);

  // Quantitative metrics
  const currentQuant = habit.quantitativeValues?.[today] ?? (isDoneToday ? (habit.targetValue || 1) : 0);
  const targetQuant = habit.targetValue || 1;
  const quantProgress = getQuantProgress(currentQuant, targetQuant);
  const quickChips = getQuickAddOptions(targetQuant, habit.stepIncrement);

  // Subtask metrics
  const subtaskProgress = getSubtaskProgress(habit, today);
  const hasSubtasks = habit.subtasks && habit.subtasks.length > 0;

  const accentColor = (habit.color && COLOR_SWATCH[habit.color]) || "#38BDF8";
  const elasticProgress = getElasticProgress(habit, today);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-4 ${
        isDoneToday
          ? "border-emerald-500/30 bg-[#070B14]/90 shadow-lg shadow-emerald-950/20"
          : "border-white/10 bg-[#0B0C16]/85 hover:border-white/20"
      } backdrop-blur-2xl shadow-xl`}
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Top subtle highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Main Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
            }}
          >
            <HabitIcon habit={habit} className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                {habit.name}
              </h3>
              {habit.isStarred && (
                <Star className="w-3.5 h-3.5 fill-gold text-gold shrink-0" />
              )}
              {isVacationToday && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-medium flex items-center gap-1">
                  <Palmtree className="w-2.5 h-2.5" /> Vacation
                </span>
              )}
            </div>

            {habit.cueText && (
              <p className="text-[11px] text-ember/90 font-medium truncate mt-0.5">
                ⚓ After {habit.cueText}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              {kind === "avoid" ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    {cleanStreak}d clean
                  </span>
                  {moneySaved > 0 && (
                    <span className="text-white/40 font-mono text-[11px]">
                      • ${moneySaved} saved
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-ember font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-ember text-ember" />
                    {habit.currentStreak}d streak
                  </span>
                  {habit.bestStreak > 0 && (
                    <span className="text-white/40 text-[11px]">
                      • Best: {habit.bestStreak}d
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Radial Strength Dial & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Radial Momentum HUD Gauge */}
          <div
            className="relative w-9 h-9 flex items-center justify-center cursor-help"
            title={`Habit Strength Score: ${strength.score}% (${strength.tier})`}
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                className="stroke-white/10"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                stroke={strength.color}
                strokeWidth="2.5"
                strokeDasharray="94.25"
                strokeDashoffset={94.25 - (94.25 * strength.score) / 100}
                strokeLinecap="round"
                fill="none"
                style={{
                  filter: `drop-shadow(0 0 4px ${strength.glowColor})`,
                }}
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-white/90">
              {strength.score}
            </span>
          </div>

          {/* Focus Timer Launch Button */}
          <button
            onClick={() => onOpenFocusTimer(habit)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
            title="Open Focus Timer"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Action Checkmark / Done Button */}
          {kind === "boolean" && (
            <button
              onClick={() => onToggleToday(habit.id)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isDoneToday
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10"
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {kind === "avoid" && (
            <button
              onClick={() => {
                if (hadRelapseToday) {
                  onUndoRelapse(habit.id);
                } else {
                  setShowRelapseModal(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hadRelapseToday
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
              }`}
            >
              {hadRelapseToday ? "Relapse Logged" : "Stay Clean"}
            </button>
          )}
        </div>
      </div>

      {/* Quantitative Multi-Lap HUD & Quick-Add Chips */}
      {kind === "quantitative" && (
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">
              {currentQuant} / {targetQuant} {habit.unit || ""}
              {quantProgress.laps > 1 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                  Lap {quantProgress.laps}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-cyan-400 font-semibold">
                {quantProgress.totalPercent}%
              </span>
              <ElasticProgressRing progress={elasticProgress} size={28} strokeWidth={2.5} showBadge={false} />
            </div>
          </div>

          {/* Segmented Futuristic Progress Bar */}
          <div className="grid grid-cols-10 gap-1 h-2 w-full">
            {Array.from({ length: 10 }).map((_, i) => {
              const segThreshold = (i + 1) * 10;
              const isFilledLap1 = quantProgress.totalPercent >= segThreshold;
              const isFilledLap2Plus = quantProgress.totalPercent >= 100 + segThreshold;

              return (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    isFilledLap2Plus
                      ? "bg-purple-400 shadow-sm shadow-purple-400/80"
                      : isFilledLap1
                      ? "bg-cyan-400 shadow-sm shadow-cyan-400/80"
                      : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>

          {/* Quick-add chips */}
          <div className="flex items-center gap-1.5 pt-1">
            {quickChips.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  hapticEngine.tickTap();
                  onQuantIncrement(habit.id, amount);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] font-medium text-white/80 hover:text-white border border-white/5 transition-all flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                {amount} {habit.unit || ""}
              </button>
            ))}
            <button
              onClick={() => {
                hapticEngine.tickTap();
                onQuantIncrement(habit.id, -(quickChips[0] || 1));
              }}
              disabled={currentQuant <= 0}
              className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] text-white/50 hover:text-white border border-white/5 transition-all disabled:opacity-30 ml-auto"
              title="Undo last step"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Checklist Subtasks Accordion */}
      {hasSubtasks && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="w-full flex items-center justify-between text-xs text-white/60 hover:text-white transition-colors py-1"
          >
            <span className="flex items-center gap-1.5 font-medium">
              Subtasks ({subtaskProgress.completed}/{subtaskProgress.total})
              {subtaskProgress.allDone && (
                <span className="text-emerald-400 font-semibold">• All Complete</span>
              )}
            </span>
            {showSubtasks ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showSubtasks && (
            <div className="mt-2 space-y-1.5 pl-1">
              {habit.subtasks!.map((sub) => {
                const done = isSubtaskCompleted(habit, sub.id, today);
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      hapticEngine.doubleClack();
                      onToggleSubtask(habit.id, sub.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-left transition-all"
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/30 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        done ? "line-through text-white/40" : "text-white/80"
                      }`}
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

      {/* Relapse Dialog Modal for Avoid Habit */}
      {showRelapseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F111E] border border-white/10 p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-semibold text-sm">Log Relapse</h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Honesty is the catalyst for growth. Logging a relapse resets your clean streak for today but preserves your long-term strength momentum.
            </p>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Estimated Cost Spent ($)</label>
              <input
                type="number"
                placeholder="0"
                value={relapseCost}
                onChange={(e) => setRelapseCost(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Reason / Trigger (Optional)</label>
              <input
                type="text"
                placeholder="Stress, social event..."
                value={relapseReason}
                onChange={(e) => setRelapseReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowRelapseModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  hapticEngine.gentleThud();
                  onLogRelapse(habit.id, Number(relapseCost) || 0, relapseReason);
                  setShowRelapseModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 font-semibold text-xs text-white"
              >
                Confirm Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

