import React from "react";

export interface DitherHeatmapCalendarProps {
  data: Array<{ date: string; done: number; total: number; level: 0 | 1 | 2 | 3 | 4 }>;
  streak: number;
  className?: string;
}

/**
 * 6-Month dithercn Heatmap Calendar rendering 182 days (26 weeks) of habit momentum.
 * Conforms to PROJECT.md § Progress Surfaces ↔ Habit Store
 * and contracts.tsx:ReferenceDitherHeatmapCalendar.
 */
export const DitherHeatmapCalendar: React.FC<DitherHeatmapCalendarProps> = ({
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
                  ? "color-mix(in srgb, var(--ember) 25%, transparent)"
                  : day.level === 2
                  ? "color-mix(in srgb, var(--ember) 50%, transparent)"
                  : day.level === 3
                  ? "color-mix(in srgb, var(--ember) 75%, transparent)"
                  : "var(--dither-bloom, var(--ember))",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DitherHeatmapCalendar;

