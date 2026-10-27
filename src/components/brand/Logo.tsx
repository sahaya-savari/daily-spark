import { cn } from "@/lib/utils";

/**
 * Botanical Spark mark: a flowing sprout base in brass/gold with a radiant
 * 4-point ember spark diamond rising from it, on a smoked slate tile.
 */
export function SparkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <rect width="32" height="32" rx="8" className="fill-surface-2" />
      {/* sprout: stem + two leaves */}
      <path
        d="M16 27c.6-4.4-.7-8.1-3.9-11.3"
        fill="none"
        className="stroke-gold"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M12.1 15.7c-3.1-1-5.2.2-6 3.1 2.9.6 5.2-.7 6-3.1Z" className="fill-gold" />
      <path d="M14.2 18.4c2.9-1.2 5.2-.3 6.3 2.6-2.8.8-5.2-.4-6.3-2.6Z" className="fill-gold" />
      {/* radiant 4-point spark */}
      <path
        d="M16 3.2c.62 4.5 2.3 6.2 6.8 6.8-4.5.6-6.18 2.3-6.8 6.8-.62-4.5-2.3-6.2-6.8-6.8 4.5-.6 6.18-2.3 6.8-6.8Z"
        className="fill-ember"
      />
      <circle cx="24.6" cy="6.4" r="1.3" className="fill-gold" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SparkMark />
      <b className="font-display text-[19px] font-bold normal-case tracking-[0.02em]">Daily Spark</b>
    </span>
  );
}
