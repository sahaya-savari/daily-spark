import React from "react";
import type { ElasticProgress } from "@/lib/habits/elastic";
import { cn } from "@/lib/utils";

interface ElasticProgressRingProps {
  progress: ElasticProgress;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showBadge?: boolean;
}

export const ElasticProgressRing: React.FC<ElasticProgressRingProps> = ({
  progress,
  size = 54,
  strokeWidth = 4,
  className,
  showBadge = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Mini threshold offset
  const miniFraction = Math.min(1, progress.mini / Math.max(1, progress.plus));
  const currentFraction = Math.min(2, progress.current / Math.max(1, progress.plus));
  const strokeDashoffset = Math.max(0, circumference - (circumference * Math.min(1, currentFraction)));

  const isElite = progress.tier === "elite";
  const isPlus = progress.tier === "plus";
  const isMini = progress.tier === "mini";

  const colorClass = isElite
    ? "stroke-purple-400 text-purple-400"
    : isPlus
    ? "stroke-emerald-400 text-emerald-400"
    : isMini
    ? "stroke-amber-400 text-amber-400"
    : "stroke-muted text-muted-foreground";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-surface-2 fill-none"
        />

        {/* Mini target tick marker */}
        {miniFraction < 1 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={circumference - (circumference * miniFraction)}
            className="stroke-amber-500/50 fill-none"
          />
        )}

        {/* Main dynamic progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 fill-none", colorClass)}
          style={{
            filter: isElite
              ? "drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))"
              : isPlus
              ? "drop-shadow(0 0 4px rgba(52, 211, 153, 0.4))"
              : undefined,
          }}
        />
      </svg>

      {/* Center percentage or tier badge */}
      {showBadge && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={cn(
              "text-[10px] font-bold font-mono leading-none tracking-tight",
              isElite
                ? "text-purple-400"
                : isPlus
                ? "text-emerald-400"
                : isMini
                ? "text-amber-400"
                : "text-faint"
            )}
          >
            {isElite ? "ELITE" : isPlus ? "100%" : isMini ? "MINI" : `${progress.percent}%`}
          </span>
        </div>
      )}
    </div>
  );
};
