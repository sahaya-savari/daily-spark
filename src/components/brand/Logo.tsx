import { useId } from "react";
import { cn } from "@/lib/utils";

export function SparkMark({
  className,
  sparkColor = "#FF8A4C",
  sproutColor: _sproutColor,
}: {
  className?: string;
  sparkColor?: string;
  sproutColor?: string;
}) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={gradientId} x1="7" y1="4" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB45C" />
          <stop offset="1" stopColor={sparkColor} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#15131A" stroke="rgba(255,255,255,.13)" />
      <path d="M17.5 4.8c.5 4-2.6 5.7-4.7 8.1-1.7 1.9-2.8 3.8-2.8 6.5 0 4.2 2.8 7.1 6.8 7.1 4.2 0 7.2-3 7.2-7.3 0-3.8-2.2-7.2-6.5-10.9.3 2.8-.4 4.3-1.9 5.6.2-3.5-1.1-6.2-4-8.5.2 3.1-1.2 5.2-3 7.4" fill={`url(#${gradientId})`} />
      <path d="m12.7 19 2.5 2.5 5-5.2" fill="none" stroke="#FFFFFF" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.6 5.2v3.5M23.85 6.95h3.5" stroke="#FFD79A" strokeWidth="1.35" strokeLinecap="round" />
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
