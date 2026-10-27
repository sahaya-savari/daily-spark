import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Archive, ArchiveRestore, ArrowLeft, Bell, Check, Pencil, SearchX, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { habitActions, useHabitStore } from "@/lib/habits/store";
import { formatShort, fromKey, addDays, lastNDays, todayKey } from "@/lib/habits/dates";
import { isArchived } from "@/lib/habits/logic";
import { HabitIcon } from "@/lib/habits/icons";
import { HabitDialog } from "@/components/habits/HabitDialog";
import { DeleteHabitDialog } from "@/components/habits/DeleteHabitDialog";
import { EmptyState, LoadingList, Panel, ghostBtn, primaryBtn } from "@/components/habits/AppUi";
import { Heatmap } from "@/components/habits/Heatmap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/habits/$id")({
  head: () => ({
    meta: [
      { title: "Habit — Daily Spark" },
      { name: "description", content: "Streak, history and settings for one habit." },
      { property: "og:title", content: "Habit — Daily Spark" },
      { property: "og:description", content: "Streak, history and settings for one habit." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HabitDetail,
});

function HabitDetail() {
  const { id } = Route.useParams();
  const { loaded, habits } = useHabitStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const habit = habits.find((h) => h.id === id);

  if (!loaded) return <LoadingList />;
  if (!habit)
    return (
      <EmptyState
        icon={SearchX}
        title="Habit not found"
        body="It may have been deleted, or it lives on another device."
        action={
          <Link to="/app/habits" className={primaryBtn}>
            All habits
          </Link>
        }
      />
    );

  const today = todayKey();
  const doneToday = habit.completedDates.includes(today);
  const dow = (fromKey(today).getDay() + 6) % 7;
  const days = lastNDays(addDays(today, 6 - dow), 7 * 16);
  const set = new Set(habit.completedDates);
  const levels = days.map((d) => (set.has(d) ? 4 : 0));
  const recent = [...habit.completedDates].reverse().slice(0, 10);
  const archived = isArchived(habit);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link to="/app/habits" className="inline-flex items-center gap-1.5 text-sm font-bold text-faint hover:text-foreground">
          <ArrowLeft className="size-4" /> Habits
        </Link>
        <Button variant="ghost"
          aria-label={habit.isStarred ? "Unstar" : "Star"}
          onClick={() => habitActions.star(habit.id)}
          className="grid size-10 place-items-center rounded-full border border-border bg-surface hover:bg-surface-2"
        >
          <Star className={cn("size-4", habit.isStarred ? "fill-gold text-gold" : "text-faint")} />
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-0 bg-surface p-[22px]">
        <HabitIcon habit={habit} size="lg" />
        <p className="kicker mt-4">Since {formatShort(habit.createdAt)}{archived && " · Archived"}</p>
        <h1 className="mt-0.5 break-words font-mono text-[26px] font-extrabold leading-tight tracking-tight">{habit.name}</h1>
        {(habit.notes || habit.description) && (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{habit.notes || habit.description}</p>
        )}
        {!archived && (
          <Button variant="ghost"
            onClick={() => {
              const r = habitActions.toggleToday(habit.id);
              if (r === "done") navigator.vibrate?.(12);
            }}
            className={cn(primaryBtn, "mt-5", doneToday && "bg-surface-2 text-foreground hover:bg-surface-2/80")}
          >
            <Check className="size-4" strokeWidth={3} />
            {doneToday ? "Done today · tap to undo" : "Check in today"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          ["Current", habit.currentStreak, true],
          ["Best", habit.bestStreak, false],
          ["Total", habit.completedDates.length, false],
        ].map(([k, v, accent]) => (
          <Panel key={k as string} className="p-3.5 text-center">
            <p className={cn("text-[26px] font-extrabold leading-none tabular-nums", accent && "text-ember")}>{v as number}</p>
            <p className="kicker mt-1.5">{k as string}</p>
          </Panel>
        ))}
      </div>

      <section>
        <h2 className="mb-2.5 text-[17px] font-extrabold">Last 16 weeks</h2>
        <Panel>
          <Heatmap levels={levels} labels={days} />
        </Panel>
      </section>

      <Panel className="px-4 py-1">
        <div className="flex items-center gap-3 border-b border-border py-3">
          <span className="grid size-9 place-items-center rounded-[11px] bg-ember-soft text-ember">
            <Bell className="size-4" />
          </span>
          <span className="flex-1 text-sm font-bold">Reminder</span>
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            {habit.reminderEnabled && habit.reminderTime ? habit.reminderTime : "Off"}
          </span>
        </div>
        <div className="py-3">
          <p className="kicker mb-2">Recent check-ins</p>
          {recent.length === 0 ? (
            <p className="text-sm font-semibold text-muted-foreground">None yet. Today's a good day to start.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {recent.map((d) => (
                <li key={d} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold">
                  {formatShort(d)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className={ghostBtn} onClick={() => setEditing(true)}>
          <Pencil className="size-4" /> Edit
        </Button>
        <Button variant="ghost"
          className={ghostBtn}
          onClick={() => {
            habitActions.archive(habit.id, !archived);
            toast(archived ? `${habit.name} is active again` : `${habit.name} archived`);
          }}
        >
          {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
          {archived ? "Restore" : "Archive"}
        </Button>
        <Button variant="ghost" className={cn(ghostBtn, "text-destructive")} onClick={() => setDeleting(true)}>
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>

      <HabitDialog open={editing} onOpenChange={setEditing} habit={habit} />
      <DeleteHabitDialog
        habit={deleting ? habit : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => navigate({ to: "/app/habits" })}
      />
    </div>
  );
}
