import React, { useMemo } from "react";
import { Activity, Brain, Clock, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calculateCircadianCurve, calculateHabitStacking } from "@/lib/habits/circadian";
import type { Habit } from "@/lib/habits/types";

interface CircadianAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
}

export const CircadianAnalyticsDialog: React.FC<CircadianAnalyticsDialogProps> = ({
  open,
  onOpenChange,
  habits,
}) => {
  const curve = useMemo(() => calculateCircadianCurve(habits), [habits]);
  const correlations = useMemo(() => calculateHabitStacking(habits, 2), [habits]);

  const maxDensity = useMemo(
    () => Math.max(...curve.map((b) => b.smoothedDensity), 0.01),
    [curve]
  );

  const peakBin = useMemo(
    () => curve.reduce((max, b) => (b.smoothedDensity > max.smoothedDensity ? b : max), curve[0]),
    [curve]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#090A14]/95 border-white/10 text-white backdrop-blur-2xl p-6 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white tracking-wide">
                Circadian Rhythm & Habit Stacking
              </DialogTitle>
              <p className="text-xs text-white/50">
                Offline biological timing analysis & conditional correlations
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Peak Focus Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider block">
                Peak Circadian Velocity
              </span>
              <p className="text-sm font-medium text-white/90 mt-0.5">
                {peakBin && peakBin.smoothedDensity > 0
                  ? `Your highest momentum occurs around ${peakBin.label} – ${String(
                      (peakBin.hour + 2) % 24
                    ).padStart(2, "0")}:00.`
                  : "Log completions across multiple days to reveal your biological peak window."}
              </p>
            </div>
          </div>

          {/* 24-Hour Circadian Histogram with Gaussian Smoothing */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/70">24-Hour Circadian Curve</span>
              <span className="text-[11px] text-white/40">Gaussian Kernel Smoothed</span>
            </div>

            <div className="flex items-end gap-1 h-32 pt-4 px-1">
              {curve.map((bin) => {
                const heightPercent = Math.max(8, Math.round((bin.smoothedDensity / maxDensity) * 100));
                const isPeak = bin.hour === peakBin?.hour && bin.smoothedDensity > 0;

                return (
                  <div
                    key={bin.hour}
                    className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isPeak
                          ? "bg-gradient-to-t from-cyan-500 to-amber-400 shadow-lg shadow-cyan-500/50"
                          : bin.smoothedDensity > 0
                          ? "bg-cyan-500/60 hover:bg-cyan-400"
                          : "bg-white/5"
                      }`}
                    />
                    {bin.hour % 4 === 0 && (
                      <span className="text-[9px] text-white/40 mt-1 select-none font-mono">
                        {bin.hour}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit Stacking Correlations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Habit Stacking Correlations (P(B|A))
              </h4>
            </div>

            {correlations.length > 0 ? (
              <div className="space-y-2">
                {correlations.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-white/90">
                        <span>{c.triggerHabitName}</span>
                        <ArrowRight className="w-3 h-3 text-white/40" />
                        <span className="text-purple-300">{c.targetHabitName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px]">
                        {c.confidence}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      {c.insightText}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/50">
                Complete multiple habits on the same days to generate automated stacking correlations.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

