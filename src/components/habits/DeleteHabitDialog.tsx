import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { habitActions } from "@/lib/habits/store";
import type { Habit } from "@/lib/habits/types";

export function DeleteHabitDialog({
  habit,
  onClose,
  onDeleted,
}: {
  habit: Habit | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  return (
    <AlertDialog open={!!habit} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="rounded-3xl bg-surface font-app">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-app text-2xl font-extrabold">Delete {habit?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the habit and its {habit?.completedDates.length ?? 0} check-ins from this device. If you just
            want a break, archive it instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (!habit) return;
              habitActions.remove(habit.id);
              toast(`${habit.name} deleted`);
              onClose();
              onDeleted?.();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
