import { useId } from "react";
import { cn } from "@/lib/utils";

export function SparkMark({
  className,
  themed = false,
  sparkColor = "#FBBF24",
  sproutColor = "#EC4899",
}: {
  className?: string;
  themed?: boolean;
  sparkColor?: string;
  sproutColor?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const bgId = `ds-bg-${uid}`;
  const flameMainId = `ds-flame-main-${uid}`;
  const flameInnerId = `ds-flame-inner-${uid}`;
  const sparkId = `ds-spark-${uid}`;

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={themed ? "var(--surface-2)" : "#151320"} />
          <stop offset="100%" stopColor={themed ? "var(--surface)" : "#090A0D"} />
        </linearGradient>
        <linearGradient id={flameMainId} x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themed ? "var(--ember)" : "#8B5CF6"} />
          <stop offset="55%" stopColor={themed ? "color-mix(in srgb, var(--ember) 65%, #EC4899)" : "#C026D3"} />
          <stop offset="100%" stopColor={sproutColor} />
        </linearGradient>
        <linearGradient id={flameInnerId} x1="8" y1="26" x2="24" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={sparkId} x1="12" y1="11" x2="20" y2="21" gradientUnits="userSpaceOnUse">
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
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1"
      />
      {/* Interlocking glassmorphic flame outer ribbon */}
      <path
        d="M16.2 4.2C20.5 7.8 24.4 12.1 24.4 17.5C24.4 22.7 20.6 26.8 16 26.8C11.4 26.8 7.6 22.7 7.6 17.5C7.6 13.7 9.7 10.6 12.5 8.2C12.2 10.4 12.9 12.2 14.3 13.3C14 9.9 14.7 6.8 16.2 4.2Z"
        fill={`url(#${flameMainId})`}
        fillOpacity="0.88"
        stroke="rgba(255, 255, 255, 0.34)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Translucent interlocking inner facet */}
      <path
        d="M16 11.4C18.9 13.6 21 16.1 21 19.3C21 22.6 18.8 25.1 16 25.1C13.2 25.1 11 22.6 11 19.3C11 16.7 12.5 14.4 14.8 12.8L16 11.4Z"
        fill={`url(#${flameInnerId})`}
        stroke="rgba(255, 255, 255, 0.28)"
        strokeWidth="0.55"
      />
      {/* Luminous 4-point gold core spark */}
      <path
        d="M16 12.6C16.55 15.85 17.65 16.95 20.9 17.5C17.65 18.05 16.55 19.15 16 22.4C15.45 19.15 14.35 18.05 11.1 17.5C14.35 16.95 15.45 15.85 16 12.6Z"
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
