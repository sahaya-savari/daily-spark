import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

export function SparkMark({
  className,
}: {
  className?: string;
  themed?: boolean;
  sparkColor?: string;
  sproutColor?: string;
}) {
  return (
    <img
      src={`${SITE.basePath}logo-6.png`}
      alt=""
      aria-hidden="true"
      className={cn("size-7 shrink-0 rounded-[22%] object-cover select-none", className)}
    />
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
