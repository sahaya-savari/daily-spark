import { useEffect, useMemo, useState } from "react";
import { Check, FolderOpen, Play, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HabitIcon } from "@/lib/habits/icons";
import { isDoneOn, isHabitDueToday } from "@/lib/habits/logic";
import { COLOR_OPTIONS, COLOR_SWATCH, type Habit, type HabitCollection } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

interface EditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: HabitCollection | null;
  habits: Habit[];
  onSave: (value: Pick<HabitCollection, "name"> & Partial<HabitCollection>) => void;
  onDelete: (id: string) => void;
}

export function CollectionEditorDialog({ open, onOpenChange, collection, habits, onSave, onDelete }: EditorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("fire");
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [startMode, setStartMode] = useState<"guided" | "list">("list");

  useEffect(() => {
    setName(collection?.name || "");
    setDescription(collection?.description || "");
    setColor(collection?.color || "fire");
    setHabitIds(collection?.habitIds || []);
    setIsPinned(Boolean(collection?.isPinned));
    setStartMode(collection?.startMode || "list");
  }, [collection, open]);

  const toggleHabit = (id: string) => setHabitIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "Create a collection"}</DialogTitle>
          <DialogDescription>Group habits into a calm routine without changing the habits themselves.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-semibold">
            Collection name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Morning reset" maxLength={48} />
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            Short description
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A focused start to the day" maxLength={140} rows={2} />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Accent</legend>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  aria-label={`${option.name} accent`}
                  aria-pressed={color === option.value}
                  className={cn("grid size-11 place-items-center rounded-full border-2 transition-transform", color === option.value ? "scale-105 border-foreground" : "border-transparent")}
                  style={{ backgroundColor: COLOR_SWATCH[option.value] }}
                >
                  {color === option.value && <Check aria-hidden="true" className="size-4 text-black/70" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Habits</legend>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-border/50 bg-surface p-2">
              {habits.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Create a habit first, then add it to this collection.</p>
              ) : habits.map((habit) => {
                const selected = habitIds.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleHabit(habit.id)}
                    aria-pressed={selected}
                    className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors", selected ? "bg-ember-soft" : "hover:bg-surface-2")}
                  >
                    <HabitIcon habit={{ icon: habit.icon, emoji: habit.emoji, color: habit.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{habit.name}</span>
                    <span className={cn("grid size-6 place-items-center rounded-full border", selected ? "border-ember bg-ember text-white" : "border-border")}>
                      {selected && <Check aria-hidden="true" className="size-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-3">
            <div><p className="text-sm font-semibold">Pin on Today</p><p className="text-xs text-muted-foreground">Show this collection near the top of your daily flow.</p></div>
            <Switch checked={isPinned} onCheckedChange={setIsPinned} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-3">
            <div><p className="text-sm font-semibold">Guided routine</p><p className="text-xs text-muted-foreground">Present one scheduled habit at a time.</p></div>
            <Switch checked={startMode === "guided"} onCheckedChange={(checked) => setStartMode(checked ? "guided" : "list")} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {collection ? <Button type="button" variant="destructive" onClick={() => { onDelete(collection.id); onOpenChange(false); }}><Trash2 className="mr-2 size-4" />Delete</Button> : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" disabled={!name.trim()} onClick={() => { onSave({ name: name.trim(), description: description.trim() || undefined, color, icon: "folder", habitIds, isPinned, startMode }); onOpenChange(false); }}>Save collection</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RunnerProps {
  collection: HabitCollection | null;
  habits: Habit[];
  today: string;
  onToggle: (habitId: string) => void;
  onClose: () => void;
}

export function CollectionRunnerDialog({ collection, habits, today, onToggle, onClose }: RunnerProps) {
  const due = useMemo(() => !collection ? [] : collection.habitIds
    .map((id) => habits.find((habit) => habit.id === id))
    .filter((habit): habit is Habit => Boolean(habit))
    .filter((habit) => isHabitDueToday(habit, today) || isDoneOn(habit, today)), [collection, habits, today]);
  const completed = due.filter((habit) => isDoneOn(habit, today)).length;
  const next = due.find((habit) => !isDoneOn(habit, today));

  return (
    <Dialog open={Boolean(collection)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="inset-0 h-[100dvh] max-h-none w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-background p-4 pt-[calc(env(safe-area-inset-top)+20px)] sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:p-6">
        <DialogHeader>
          <div className="mb-2 flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-ember-soft text-ember"><FolderOpen className="size-5" /></span><button type="button" onClick={onClose} aria-label="Close routine" className="grid size-11 place-items-center rounded-full bg-surface"><X className="size-5" /></button></div>
          <DialogTitle className="text-left text-2xl">{collection?.name}</DialogTitle>
          <DialogDescription className="text-left">{completed} of {due.length} scheduled habits complete</DialogDescription>
        </DialogHeader>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-ember transition-[width]" style={{ width: `${due.length ? (completed / due.length) * 100 : 0}%` }} /></div>
        {next && collection?.startMode === "guided" && (
          <button type="button" onClick={() => onToggle(next.id)} className="rounded-3xl border border-ember/25 bg-surface p-5 text-left shadow-sm">
            <p className="kicker">Next up</p><div className="mt-3 flex items-center gap-3"><HabitIcon habit={{ icon: next.icon, emoji: next.emoji, color: next.color }} /><span className="flex-1 text-lg font-bold">{next.name}</span><span className="grid size-12 place-items-center rounded-full bg-ember text-white"><Play className="size-5 fill-current" /></span></div>
          </button>
        )}
        <div className="space-y-2">
          {due.map((habit) => {
            const done = isDoneOn(habit, today);
            return <button key={habit.id} type="button" onClick={() => onToggle(habit.id)} className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border/50 bg-surface px-3 text-left"><HabitIcon habit={{ icon: habit.icon, emoji: habit.emoji, color: habit.color }} /><span className={cn("flex-1 font-semibold", done && "text-muted-foreground line-through")}>{habit.name}</span><span className={cn("grid size-9 place-items-center rounded-full border", done ? "border-ember bg-ember text-white" : "border-border")} >{done && <Check className="size-4" />}</span></button>;
          })}
          {due.length === 0 && <p className="rounded-2xl bg-surface p-5 text-sm text-muted-foreground">Nothing in this collection is scheduled for today.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
