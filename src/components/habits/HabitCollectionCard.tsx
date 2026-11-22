import { FolderOpen, MoreHorizontal, Pin, Play } from "lucide-react";
import type { CSSProperties } from "react";
import type { Habit, HabitCollection } from "@/lib/habits/types";
import { isDoneOn, isHabitDueToday } from "@/lib/habits/logic";
import { COLOR_SWATCH } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

interface HabitCollectionCardProps {
  collection: HabitCollection;
  habits: Habit[];
  today: string;
  onOpen: () => void;
  onStart: () => void;
  onEdit: () => void;
  compact?: boolean;
}

export function HabitCollectionCard({
  collection,
  habits,
  today,
  onOpen,
  onStart,
  onEdit,
  compact = false,
}: HabitCollectionCardProps) {
  const members = collection.habitIds
    .map((id) => habits.find((habit) => habit.id === id))
    .filter((habit): habit is Habit => Boolean(habit));
  const due = members.filter((habit) => isHabitDueToday(habit, today) || isDoneOn(habit, today));
  const completed = due.filter((habit) => isDoneOn(habit, today)).length;
  const percentage = due.length > 0 ? Math.round((completed / due.length) * 100) : 0;
  const accent = COLOR_SWATCH[collection.color] || COLOR_SWATCH.fire;

  return (
    <article
      className={cn(
        "group relative isolate flex shrink-0 flex-col overflow-hidden rounded-[26px] border border-border/50 bg-surface shadow-sm",
        compact ? "w-[246px] min-h-[188px]" : "min-h-[210px] w-full",
      )}
      style={{ "--collection-accent": accent } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-8 translate-y-[-10px] rounded-[18px] border border-white/10 bg-[color-mix(in_srgb,var(--collection-accent)_38%,var(--surface))] opacity-70" />
      <div className="pointer-events-none absolute inset-x-3 top-3 h-8 rounded-[20px] border border-white/10 bg-[color-mix(in_srgb,var(--collection-accent)_24%,var(--surface-2))]" />

      <div className="relative z-10 mt-6 flex flex-1 flex-col rounded-t-[24px] border-t border-white/10 bg-surface px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-xl">
            <div className="flex items-center gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-2 text-[color:var(--collection-accent)]">
                <FolderOpen aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-extrabold text-foreground">{collection.name}</h3>
                <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                  {members.length} {members.length === 1 ? "habit" : "habits"} · {completed}/{due.length || 0} today
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${collection.name}`}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>{due.length === 0 ? "Nothing scheduled today" : `${percentage}% complete`}</span>
            {collection.isPinned && <Pin aria-label="Pinned collection" className="size-3.5 text-[color:var(--collection-accent)]" />}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-[color:var(--collection-accent)] transition-[width] duration-300" style={{ width: `${percentage}%` }} />
          </div>
          <p className="line-clamp-1 min-h-4 text-[11px] text-faint">
            {collection.description || members.slice(0, 3).map((habit) => habit.name).join(" · ") || "Add habits to build this routine"}
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={due.length === 0}
          className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface-2 text-sm font-bold text-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--collection-accent)_18%,var(--surface-2))] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <Play aria-hidden="true" className="size-4 fill-current" />
          {completed === due.length && due.length > 0 ? "Review routine" : "Start routine"}
        </button>
      </div>
    </article>
  );
}
