import { cn } from "@/lib/utils";

const LEVEL_CLASS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;

/**
 * GitHub-style activity grid. `levels` is oldest-first, one entry per day;
 * columns are weeks.
 */
export function Heatmap({
  levels,
  labels,
  className,
  cellClassName,
}: {
  levels: number[];
  labels?: string[];
  className?: string;
  cellClassName?: string;
}) {
  const weeks: number[][] = [];
  for (let i = 0; i < levels.length; i += 7) weeks.push(levels.slice(i, i + 7));
  return (
    <div className={cn("flex", weeks.length > 16 ? "gap-[3px]" : "gap-1", className)} role="img" aria-label="Activity heatmap">
      {weeks.map((w, wi) => (
        <div key={wi} className={cn("flex flex-1 flex-col", weeks.length > 16 ? "gap-[3px]" : "gap-1")}>
          {w.map((lvl, di) => (
            <div
              key={di}
              title={labels?.[wi * 7 + di]}
              className={cn(weeks.length > 16 ? "aspect-square rounded-[3px] sm:rounded-[4px]" : "aspect-square rounded-[5px] sm:rounded-[6px]", LEVEL_CLASS[lvl] ?? LEVEL_CLASS[0], cellClassName)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  className,
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-heat-0" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          className="fill-none stroke-ember transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
