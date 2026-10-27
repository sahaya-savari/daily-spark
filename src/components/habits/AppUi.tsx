import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 pb-5">
      <div className="min-w-0">
        {eyebrow && <p className="kicker">{eyebrow}</p>}
        <h1 className="mt-0.5 font-display text-[28px] font-extrabold leading-tight tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl border-0 bg-surface p-[18px]", className)}>{children}</div>;
}

export function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Panel className="p-4">
      <p className="kicker">{label}</p>
      <p className={cn("mt-1 text-[26px] font-extrabold leading-none tabular-nums", accent && "text-ember")}>{value}</p>
    </Panel>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-[18px] bg-ember-soft text-ember">
        <Icon className="size-6" strokeWidth={1.9} />
      </span>
      <p className="mt-5 text-xl font-extrabold">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  );
}

export function LoadingList() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[72px] animate-pulse rounded-3xl bg-surface" />
      ))}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full border-0 bg-surface p-1" role="tablist">
      {options.map((o) => (
        <Button variant="ghost"
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-[13px] font-bold transition-colors",
            value === o.value ? "bg-surface-2 text-foreground" : "text-faint hover:text-muted-foreground",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-faint">{o.count}</span>}
        </Button>
      ))}
    </div>
  );
}

/** White pill — the app's primary action, as in the reference. */
export const primaryBtn =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-extrabold text-primary-foreground transition-transform active:scale-[0.975] hover:bg-primary/90";
export const smallPrimaryBtn =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-extrabold text-primary-foreground transition-transform active:scale-[0.97] hover:bg-primary/90";
export const ghostBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold transition-colors hover:border-border-hi hover:bg-surface-2 disabled:opacity-40";
