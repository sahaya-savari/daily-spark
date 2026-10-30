import React, { useMemo } from "react";
import { Activity, Brain, Clock, ArrowRight } from "lucide-react";
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
      <DialogContent className="max-w-lg bg-surface border-border/40 text-foreground backdrop-blur-2xl p-6 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ember-soft border border-ember/20 flex items-center justify-center text-ember">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-wide">
                Circadian Rhythm & Habit Stacking
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Offline biological timing analysis & conditional correlations
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Peak Focus Callout */}
          <div className="p-4 rounded-2xl bg-surface-2/80 border border-border/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ember-soft flex items-center justify-center text-ember shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-ember font-semibold uppercase tracking-wider block">
                Peak Circadian Velocity
              </span>
              <p className="text-sm font-medium text-foreground/90 mt-0.5">
                {peakBin && peakBin.smoothedDensity > 0
                  ? `Your highest momentum occurs around ${peakBin.label} – ${String(
                      (peakBin.hour + 2) % 24
                    ).padStart(2, "0")}:00.`
                  : "Log completions across multiple days to reveal your biological peak window."}
              </p>
            </div>
          </div>

          {/* 24-Hour Circadian Histogram with Gaussian Smoothing */}
          <div className="p-4 rounded-2xl bg-surface-2/50 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">24-Hour Circadian Curve</span>
              <span className="text-[11px] text-faint">Gaussian Kernel Smoothed</span>
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
                          ? "bg-gradient-to-t from-ember to-amber-500 shadow-lg shadow-ember/30"
                          : bin.smoothedDensity > 0
                          ? "bg-ember/60 hover:bg-ember"
                          : "bg-surface-2"
                      }`}
                    />
                    {bin.hour % 4 === 0 && (
                      <span className="text-[9px] text-muted-foreground mt-1 select-none font-mono">
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
              <Brain className="w-4 h-4 text-ember" />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Habit Stacking Correlations (P(B|A))
              </h4>
            </div>

            {correlations.length > 0 ? (
              <div className="space-y-2">
                {correlations.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-surface-2/50 border border-border/40 hover:border-ember/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-foreground/90">
                        <span>{c.triggerHabitName}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-ember">{c.targetHabitName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-ember-soft text-ember font-bold text-[11px]">
                        {c.confidence}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {c.insightText}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-2/30 border border-border/40 text-center text-xs text-muted-foreground">
                Complete multiple habits on the same days to generate automated stacking correlations.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
