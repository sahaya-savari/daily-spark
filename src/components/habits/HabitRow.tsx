import { Link } from "@tanstack/react-router";
import { Check, Flame, Star } from "lucide-react";
import { toast } from "sonner";
import { habitActions } from "@/lib/habits/store";
import { statusOf } from "@/lib/habits/logic";
import { HabitIcon } from "@/lib/habits/icons";
import type { Habit } from "@/lib/habits/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Today list item: tap the tick to check in, tap again to undo. */
export function HabitRow({ habit, today }: { habit: Habit; today: string }) {
  const status = statusOf(habit, today);
  const done = status === "done";

  function toggle() {
    const r = habitActions.toggleToday(habit.id);
    if (r === "done") {
      navigator.vibrate?.(12);
    } else if (r === "undone") {
      toast("Today's check-in undone", {
        action: { label: "Redo", onClick: () => habitActions.toggleToday(habit.id) },
      });
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl bg-surface p-4">
      <Link to="/app/habits/$id" params={{ id: habit.id }} className="flex min-w-0 flex-1 items-center gap-3">
        <HabitIcon habit={habit} />
        <span className="min-w-0 flex-1">
          <span className={cn("flex items-center gap-1.5 font-mono text-[15px] font-semibold", done && "text-muted-foreground")}>
            <span className="break-words">{habit.name}</span>
            {habit.isStarred && <Star className="size-3.5 shrink-0 fill-gold text-gold" />}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-faint">
            <Flame className={cn("size-3", habit.currentStreak > 0 && "text-ember")} />
            {habit.currentStreak} day{habit.currentStreak === 1 ? "" : "s"}
            {status === "broken" && <span> · fresh start</span>}
          </span>
          <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-2">
            <span className={cn("block h-full rounded-full transition-[width] duration-500", done ? "w-full bg-ember" : "w-0 bg-ember")} />
          </span>
        </span>
      </Link>
      <Button
        variant="ghost"
        type="button"
        onClick={toggle}
        aria-pressed={done}
        aria-label={done ? `Undo ${habit.name} for today` : `Mark ${habit.name} done for today`}
        className={cn(
          "check-orb grid size-12 shrink-0 place-items-center rounded-full p-0",
          done ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-surface-2 text-faint hover:bg-accent",
        )}
      >
        <Check className="size-[18px]" strokeWidth={3} />
      </Button>
    </div>
  );
}
