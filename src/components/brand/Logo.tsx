import { cn } from "@/lib/utils";

/**
 * Botanical Spark mark: the official, immutable Daily Spark brand asset.
 * Features a golden botanical sprout with a radiant 4-point ember diamond spark
 * on a smoked slate tile.
 *
 * Colors are locked to signature brand values (#EC894C spark, #BF7245 gold sprout, #1C1D22 tile)
 * so the brand identity remains consistent and authentic across all theme presets (Classic, Minimal, Expressive).
 */
export function SparkMark({
  className,
  sparkColor = "#EC894C",
  sproutColor = "#BF7245",
}: {
  className?: string;
  sparkColor?: string;
  sproutColor?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="#1C1D22" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
      {/* Botanical sprout: stem + two leaves */}
      <path
        d="M16 27c.6-4.4-.7-8.1-3.9-11.3"
        fill="none"
        stroke={sproutColor}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M12.1 15.7c-3.1-1-5.2.2-6 3.1 2.9.6 5.2-.7 6-3.1Z" fill={sproutColor} />
      <path d="M14.2 18.4c2.9-1.2 5.2-.3 6.3 2.6-2.8.8-5.2-.4-6.3-2.6Z" fill={sproutColor} />
      {/* Radiant 4-point diamond spark */}
      <path
        d="M16 3.2c.62 4.5 2.3 6.2 6.8 6.8-4.5.6-6.18 2.3-6.8 6.8-.62-4.5-2.3-6.2-6.8-6.8 4.5-.6 6.18-2.3 6.8-6.8Z"
        fill={sparkColor}
      />
      <circle cx="24.6" cy="6.4" r="1.3" fill={sparkColor} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SparkMark />
      <b className="font-display text-[19px] font-bold normal-case tracking-[0.02em] text-foreground">
        Daily Spark
      </b>
    </span>
  );
}
