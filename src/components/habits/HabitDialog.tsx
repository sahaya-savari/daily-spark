import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, COLOR_SWATCH, type Habit } from "@/lib/habits/types";
import { HABIT_ICONS, emojiForIcon, iconKeyFor } from "@/lib/habits/icons";
import { habitActions, useHabitStore } from "@/lib/habits/store";
import { primaryBtn } from "@/components/habits/AppUi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function HabitDialog({
  open,
  onOpenChange,
  habit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  habit?: Habit | undefined;
}) {
  const { settings } = useHabitStore();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("flame");
  const [color, setColor] = useState<string>("fire");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(false);
  const [time, setTime] = useState("20:00");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setIcon(habit ? iconKeyFor(habit) : "flame");
    setColor(habit?.color ?? "fire");
    setNotes(habit?.notes ?? habit?.description ?? "");
    setReminder(habit?.reminderEnabled ?? false);
    setTime(habit?.reminderTime ?? settings.defaultTime ?? "20:00");
    setError(null);
  }, [open, habit, settings.defaultTime]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Give your habit a name.");
    if (trimmed.length > 60) return setError("Keep the name under 60 characters.");
    const data = {
      name: trimmed,
      icon,
      emoji: emojiForIcon(icon),
      color,
      notes: notes.trim().slice(0, 500) || undefined,
      reminderEnabled: reminder,
      reminderTime: time,
    };
    if (habit) {
      habitActions.update(habit.id, data);
      toast.success("Habit updated");
    } else {
      habitActions.add(data);
      toast.success(`${trimmed} added`);
    }
    if (reminder && !settings.enabled) {
      toast("Reminders are off", { description: "Turn them on in Settings to get notified." });
    }
    onOpenChange(false);
  }

  const tint = COLOR_SWATCH[color] ?? COLOR_SWATCH["fire"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl border-0 bg-surface font-app sm:max-w-md">
        <DialogHeader className="text-left">
          <p className="kicker">{habit ? "Edit" : "New habit"}</p>
          <DialogTitle className="font-display text-2xl font-extrabold">{habit ? habit.name : "What will you show up for?"}</DialogTitle>
          <DialogDescription>One small thing, once a day.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name" className="kicker">Name</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              maxLength={60}
              placeholder="e.g. Read 20 minutes"
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              aria-invalid={!!error}
              className="h-12 rounded-2xl border-0 bg-surface-2 text-base font-semibold"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label className="kicker">Icon</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {HABIT_ICONS.map(({ key, label, Icon }) => (
                <Button variant="ghost"
                  key={key}
                  type="button"
                  title={label}
                  aria-label={`Icon ${label}`}
                  aria-pressed={icon === key}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "grid h-auto aspect-square p-0 place-items-center rounded-[12px] border text-muted-foreground transition-colors",
                    icon === key ? "border-transparent bg-surface-2" : "border-transparent hover:bg-surface-2/60 hover:text-foreground",
                  )}
                  style={icon === key ? { color: tint, boxShadow: `inset 0 0 0 1.5px ${tint}` } : undefined}
                >
                  <Icon className="size-[18px]" strokeWidth={1.9} />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="kicker">Color</Label>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <Button variant="ghost"
                  key={c.value}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={color === c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "size-8 p-0 rounded-full ring-offset-2 ring-offset-surface transition-shadow",
                    color === c.value && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: COLOR_SWATCH[c.value] }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-notes" className="kicker">Notes</Label>
            <Textarea
              id="habit-notes"
              value={notes}
              maxLength={500}
              rows={2}
              placeholder="Why it matters, or how you'll do it (optional)"
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl border-0 bg-surface-2"
            />
          </div>

          <div className="rounded-[16px] border border-border bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="habit-reminder" className="flex items-center gap-2.5 text-sm font-bold">
                <span className="grid size-8 place-items-center rounded-[10px] bg-ember-soft text-ember">
                  <Bell className="size-4" />
                </span>
                Daily reminder
              </Label>
              <Switch id="habit-reminder" checked={reminder} onCheckedChange={setReminder} />
            </div>
            {reminder && (
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-3 h-11 w-32 rounded-2xl border-0 bg-surface font-semibold tabular-nums"
                aria-label="Reminder time"
              />
            )}
          </div>

          <Button variant="ghost" type="submit" className={primaryBtn}>
            {habit ? "Save changes" : "Add habit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
