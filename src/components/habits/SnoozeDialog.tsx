import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, BellOff } from "lucide-react";
import { type Habit } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

export type SnoozePreset = "30min" | "1hour" | "tomorrow" | "custom";

export function calculateSnoozeTimestamp(preset: SnoozePreset, customHours = 2, now = Date.now()): number {
  switch (preset) {
    case "30min":
      return now + 30 * 60 * 1000;
    case "1hour":
      return now + 60 * 60 * 1000;
    case "tomorrow": {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.getTime();
    }
    case "custom":
      return now + Math.max(1, customHours) * 60 * 60 * 1000;
  }
}

interface SnoozeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onSnooze: (habitId: string, until: number) => void;
  onClearSnooze?: (habitId: string) => void;
}

export function SnoozeDialog({
  open,
  onOpenChange,
  habit,
  onSnooze,
  onClearSnooze,
}: SnoozeDialogProps) {
  const [preset, setPreset] = useState<SnoozePreset>("1hour");
  const [customHours, setCustomHours] = useState(2);

  if (!habit) return null;

  const isCurrentlySnoozed =
    Boolean(habit.snoozedUntil) && Date.now() < (habit.snoozedUntil ?? 0);

  const handleConfirm = () => {
    const timestamp = calculateSnoozeTimestamp(preset, customHours);
    onSnooze(habit.id, timestamp);
    onOpenChange(false);
  };

  const handleClear = () => {
    if (onClearSnooze) {
      onClearSnooze(habit.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="size-4 text-ember" />
            Snooze Habit Reminder
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Temporarily pause reminders for &ldquo;{habit.name}&rdquo; without breaking your streak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          {isCurrentlySnoozed && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-border/40 text-xs">
              <div>
                <p className="font-semibold text-ember">Currently Snoozed</p>
                <p className="text-[11px] text-faint">
                  Until {new Date(habit.snoozedUntil!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
              >
                <BellOff className="size-3.5 mr-1" /> Clear
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "30min", label: "30 Minutes", desc: "Quick pause" },
              { id: "1hour", label: "1 Hour", desc: "Short delay" },
              { id: "tomorrow", label: "Tomorrow 9 AM", desc: "Next morning" },
              { id: "custom", label: "Custom Hours", desc: "Choose duration" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreset(opt.id as SnoozePreset)}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all",
                  preset === opt.id
                    ? "bg-surface-2 border-ember text-foreground shadow-sm font-semibold"
                    : "border-border/40 text-faint hover:text-foreground hover:bg-surface-2/40"
                )}
              >
                <p className="text-xs">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-2">
              <span className="text-xs text-muted-foreground">Hours to snooze:</span>
              <Input
                type="number"
                min={1}
                max={24}
                value={customHours}
                onChange={(e) => setCustomHours(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-8 text-xs text-center"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} className="bg-ember text-white hover:bg-ember/90">
            Confirm Snooze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
