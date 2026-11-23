import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { habitActions, useHabitStore } from "@/lib/habits/store";
import { newId } from "@/lib/habits/logic";
import type { PlannerTask } from "@/lib/habits/types";

export function TodayPlanner({ today }: { today: string }) {
  const { settings, collections } = useHabitStore();
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState(today);
  const [routineId, setRoutineId] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const tasks = Array.isArray(settings.plannerTasks) ? settings.plannerTasks.filter((task) =>
    task && typeof task.id === "string" && typeof task.title === "string"
  ) : [];
  const routineNames = new Map(collections.map(({ id, name }) => [id, name]));
  const overdue = tasks.filter((task) => !task.completedOn && task.dueOn && task.dueOn < today);
  const current = tasks.filter((task) => task.completedOn === today || (!task.completedOn && (!task.dueOn || task.dueOn === today)));
  const upcoming = tasks.filter((task) => !task.completedOn && task.dueOn && task.dueOn > today)
    .sort((a, b) => (a.dueOn ?? "").localeCompare(b.dueOn ?? ""));

  const completedEarlier = tasks.filter((task) => task.completedOn && task.completedOn < today)
    .sort((a, b) => (b.completedOn ?? "").localeCompare(a.completedOn ?? ""));

  function begin(task?: PlannerTask) {
    setEditing(task?.id ?? "");
    setTitle(task?.title ?? "");
    setDueOn(task ? task.dueOn ?? "" : today);
    setRoutineId(task?.routineId && routineNames.has(task.routineId) ? task.routineId : "");
  }

  function remove(task: PlannerTask) {
    habitActions.updatePlannerTasks((items) => items.filter((item) => item.id !== task.id));
    setEditing(null);
    toast("Task removed", { action: {
      label: "Undo",
      onClick: () => habitActions.updatePlannerTasks((items) => items.some(({ id }) => id === task.id) ? items : [...items, task]),
    } });
  }

  function update(id: string, patch: Partial<PlannerTask>) {
    habitActions.updatePlannerTasks((items) => items.map((task) => task.id === id ? { ...task, ...patch } : task));
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (editing === null) return;
    const fields = { title: trimmed, dueOn: dueOn || null, routineId: routineId || null };
    if (editing) update(editing, fields);
    else habitActions.updatePlannerTasks((items) => [...items, { id: newId(), ...fields, completedOn: null }]);
    setEditing(null);
  }

  return (
    <section aria-labelledby="today-planner-title" className="min-w-0 space-y-3 rounded-3xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="today-planner-title" className="text-base font-bold">Day planner</h2>
        {editing === null && <Button variant="outline" onClick={() => begin()}>Add task</Button>}
      </div>
      {editing !== null && (
        <form onSubmit={add} className="space-y-2">
          <Input aria-label="Task name" placeholder="Task name" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} />
          <label className="flex flex-wrap items-center gap-2 text-sm">
            Due date
            <Input className="w-auto max-w-full" type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
          </label>
          {collections.length > 0 && (
            <label className="flex flex-wrap items-center gap-2 text-sm">
              Routine
              <select className="min-h-11 max-w-full rounded-xl border border-border bg-surface px-3" value={routineId} onChange={(event) => setRoutineId(event.target.value)}>
                <option value="">No routine</option>
                {collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
              </select>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Save task</Button>
            {editing && tasks.some((task) => task.id === editing) && (
              <Button type="button" variant="ghost" className="text-destructive" onClick={() => {
                const task = tasks.find(({ id }) => id === editing);
                if (task) remove(task);
              }}>Remove task</Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Overdue</h3>
          {overdue.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{task.title}</span>
              <div className="flex flex-wrap gap-1">
                <Button variant="outline" onClick={() => update(task.id, { dueOn: today })}>Move to today</Button>
                <Button variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => begin(task)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {current.length === 0 && <p className="text-sm text-muted-foreground">No tasks due today.</p>}
      {current.map((task) => (
        <div key={task.id} className="flex min-h-11 min-w-0 items-center justify-between gap-2 border-t border-border py-2">
          <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3">
          <input aria-label={`${task.completedOn ? "Undo completion for" : "Complete"} ${task.title}`} type="checkbox" className="size-5 shrink-0 accent-primary" checked={Boolean(task.completedOn)} onChange={(event) => update(task.id, { completedOn: event.target.checked ? today : null })} />
          <span className="min-w-0 text-sm [overflow-wrap:anywhere]">
            <span className={task.completedOn ? "line-through text-muted-foreground" : undefined}>{task.title}</span>
            {task.completedOn && <span className="ml-2 text-xs text-muted-foreground">Done</span>}
            {routineNames.get(task.routineId ?? "") && (
              <span className="block text-xs text-muted-foreground">
                {routineNames.get(task.routineId ?? "")}
              </span>
            )}
          </span>
          </label>
          <Button variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => begin(task)}>Edit</Button>
        </div>
      ))}
      {upcoming.length > 0 && (
        <details className="border-t border-border pt-2">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Upcoming ({upcoming.length})</summary>
          <ul className="space-y-2">
            {upcoming.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="min-w-0 [overflow-wrap:anywhere]">{task.title}</span>
                <time dateTime={task.dueOn ?? undefined} className="text-muted-foreground">{task.dueOn}</time>
                <Button variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => begin(task)}>Edit</Button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {completedEarlier.length > 0 && (
        <details className="border-t border-border pt-2">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Completed earlier ({completedEarlier.length})</summary>
          <ul className="space-y-2">
            {completedEarlier.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="min-w-0 [overflow-wrap:anywhere]">{task.title}</span>
                <Button variant="ghost" onClick={() => update(task.id, { completedOn: null, dueOn: today })}>Reopen today</Button>
                <Button variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => begin(task)}>Edit</Button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
