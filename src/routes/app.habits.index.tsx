import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Plus, Sprout, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { isArchived } from "@/lib/habits/logic";
import { HabitIcon } from "@/lib/habits/icons";
import type { Habit } from "@/lib/habits/types";
import { HabitDialog } from "@/components/habits/HabitDialog";
import { EmptyState, LoadingList, PageHeader, Panel, Segmented, primaryBtn, smallPrimaryBtn } from "@/components/habits/AppUi";
import { useOpenAddHabit } from "@/components/habits/add-habit-context";
import { DeleteHabitDialog } from "@/components/habits/DeleteHabitDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/habits/")({
  head: () => ({
    meta: [
      { title: "Habits — Daily Spark" },
      { name: "description", content: "All your habits: active, starred and archived." },
      { property: "og:title", content: "Habits — Daily Spark" },
      { property: "og:description", content: "All your habits: active, starred and archived." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Habits,
});

type Tab = "active" | "starred" | "archived";

function Habits() {
  const { loaded, habits } = useHabitStore();
  const openAdd = useOpenAddHabit();
  const [tab, setTab] = useState<Tab>("active");
  const [editing, setEditing] = useState<Habit | undefined>();
  const [deleting, setDeleting] = useState<Habit | null>(null);

  const lists = useMemo(
    () => ({
      active: habits.filter((h) => !isArchived(h)),
      starred: habits.filter((h) => !isArchived(h) && h.isStarred),
      archived: habits.filter(isArchived),
    }),
    [habits],
  );
  const shown = lists[tab];

  return (
    <>
      <PageHeader
        eyebrow={loaded ? `${lists.active.length} active` : "\u00a0"}
        title="Habits"
        action={
          <Button variant="ghost" className={smallPrimaryBtn} onClick={openAdd}>
            <Plus className="size-4" strokeWidth={2.6} /> New
          </Button>
        }
      />

      <div className="mb-5">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: "Active", count: lists.active.length },
            { value: "starred", label: "Starred", count: lists.starred.length },
            { value: "archived", label: "Archived", count: lists.archived.length },
          ]}
        />
      </div>

      {!loaded ? (
        <LoadingList />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={tab === "archived" ? Archive : tab === "starred" ? Star : Sprout}
          title={tab === "archived" ? "Nothing archived" : tab === "starred" ? "No starred habits" : "No habits yet"}
          body={
            tab === "archived"
              ? "Archive a habit to pause it without losing its history."
              : tab === "starred"
                ? "Star the habits that matter most — they stay at the top of Today."
                : "Add your first habit to get started."
          }
          action={
            tab === "active" ? (
              <Button variant="ghost" className={primaryBtn} onClick={openAdd}>
                <Plus className="size-4" strokeWidth={2.6} /> Add a habit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div>
          <ul className="space-y-3">
            {shown.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-3xl bg-surface p-4">
                <Link to="/app/habits/$id" params={{ id: h.id }} className="flex min-w-0 flex-1 items-center gap-3">
                  <HabitIcon habit={h} />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold">{h.name}</span>
                    <span className="text-xs font-semibold text-faint">
                      {h.currentStreak} now · best {h.bestStreak} · {h.completedDates.length} total
                    </span>
                  </span>
                </Link>
                <Button variant="ghost"
                  aria-label={h.isStarred ? "Unstar" : "Star"}
                  onClick={() => habitActions.star(h.id)}
                  className="grid size-9 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Star className={cn("size-4", h.isStarred ? "fill-gold text-gold" : "text-faint")} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="More actions"
                    className="grid size-9 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-app">
                    <DropdownMenuItem onSelect={() => setEditing(h)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    {isArchived(h) ? (
                      <DropdownMenuItem
                        onSelect={() => {
                          habitActions.archive(h.id, false);
                          toast.success(`${h.name} is active again`);
                        }}
                      >
                        <ArchiveRestore /> Restore
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => {
                          habitActions.archive(h.id, true);
                          toast(`${h.name} archived`, {
                            action: { label: "Undo", onClick: () => habitActions.archive(h.id, false) },
                          });
                        }}
                      >
                        <Archive /> Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleting(h)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        </div>
      )}

      <HabitDialog open={!!editing} onOpenChange={(o) => !o && setEditing(undefined)} habit={editing} />
      <DeleteHabitDialog habit={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
