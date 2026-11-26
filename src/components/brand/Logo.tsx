import { useId } from "react";
import { cn } from "@/lib/utils";

export function SparkMark({
  className,
  themed = false,
  sparkColor = "#FBBF24",
  sproutColor = "#F472B6",
}: {
  className?: string;
  themed?: boolean;
  sparkColor?: string;
  sproutColor?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const bgId = `ds-bg-${uid}`;
  const leftId = `ds-left-${uid}`;
  const rightId = `ds-right-${uid}`;
  const sparkId = `ds-spark-${uid}`;

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={bgId} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themed ? "var(--surface)" : "#1E1136"} />
          <stop offset="55%" stopColor={themed ? "var(--surface-2)" : "#2D1638"} />
          <stop offset="100%" stopColor={themed ? "var(--surface-2)" : "#4C2040"} />
        </linearGradient>
        <linearGradient id={leftId} x1="6" y1="27" x2="15" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themed ? "var(--ember)" : "#7C3AED"} />
          <stop offset="55%" stopColor={themed ? "var(--ember)" : "#A855F7"} />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id={rightId} x1="17" y1="27" x2="26" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={sproutColor} />
          <stop offset="55%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#FBCFE8" />
        </linearGradient>
        <linearGradient id={sparkId} x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor={sparkColor} />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect
        width="32"
        height="32"
        rx="8.5"
        fill={`url(#${bgId})`}
        stroke="rgba(244, 114, 182, 0.32)"
        strokeWidth="1"
      />
      {/* Left interlocking amethyst ribbon */}
      <path
        d="M15.1 4.6V10.9C15.1 12.6 13.7 13.9 12.1 15.1C10.5 16.3 10.5 18.7 12.4 20.1L15.1 22.1V27.4L9.2 21.8C6.5 19.2 6.5 13.0 9.4 10.2L15.1 4.6Z"
        fill={`url(#${leftId})`}
        fillOpacity="0.92"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Right interlocking rose-pink ribbon */}
      <path
        d="M16.9 4.6V10.9C16.9 12.6 18.3 13.9 19.9 15.1C21.5 16.3 21.5 18.7 19.6 20.1L16.9 22.1V27.4L22.8 21.8C25.5 19.2 25.5 13.0 22.6 10.2L16.9 4.6Z"
        fill={`url(#${rightId})`}
        fillOpacity="0.92"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Luminous 4-point gold core spark */}
      <path
        d="M16 12.4C16.45 14.9 17.1 15.55 19.6 16C17.1 16.45 16.45 17.1 16 19.6C15.55 17.1 14.9 16.45 12.4 16C14.9 15.55 15.55 14.9 16 12.4Z"
        fill={`url(#${sparkId})`}
      />
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
