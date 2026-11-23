import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isDoneOn } from "@/lib/habits/logic";
import { habitActions } from "@/lib/habits/store";
import type { Habit } from "@/lib/habits/types";

export function HabitDayEditor({ habit, day, onClose }: { habit: Habit; day: string; onClose: () => void }) {
  const [completed, setCompleted] = useState(() => isDoneOn(habit, day));
  const [amount, setAmount] = useState(() => String(habit.quantitativeValues?.[day] ?? 0));
  const [note, setNote] = useState(() => habit.dayNotes?.[day] ?? "");
  const [error, setError] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const undo = habitActions.editHistoryDay(habit.id, day, { completed, amount: Number(amount), note });
    if (!undo) {
      setError("This day could not be saved. Check the date and recorded value.");
      return;
    }
    onClose();
    toast.success(`Saved check-in for ${day}`, {
      action: { label: "Undo", onClick: () => {
        if (!undo()) toast.info("This habit changed again. Open the day to edit it.");
      } },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit check-in</DialogTitle>
          <DialogDescription className="break-words">{habit.name} · {day}</DialogDescription>
        </DialogHeader>
        <form className="min-w-0 space-y-4" onSubmit={save}>
          {habit.kind === "quantitative" ? (
            <label className="block space-y-1 text-sm">
              <span>Recorded amount {habit.unit ? `(${habit.unit})` : ""}</span>
              <Input aria-label="Recorded amount" type="number" min="0" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
          ) : (
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input aria-label={habit.kind === "avoid" ? "No relapse on this day" : "Completed"} type="checkbox" className="size-5 accent-primary" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />
              {habit.kind === "avoid" ? "No relapse on this day" : "Completed"}
            </label>
          )}
          <label className="block space-y-1 text-sm">
            <span>Day note</span>
            <textarea aria-label="Day note" className="min-h-24 w-full rounded-xl border border-border bg-surface-2 p-3" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save day</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
