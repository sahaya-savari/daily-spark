import { Check, Flame, AlertTriangle, Undo2 } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';

interface StreakCardProps {
  streak: Streak;
  status: StreakStatus;
  onComplete: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onEdit?: () => void;
  index?: number;
}

export const StreakCard = ({ streak, status, onComplete, onUndo, canUndo, onEdit, index = 0 }: StreakCardProps) => {
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';
  const isPending = status === 'pending';
  
  // Show undo button if completed today and undo is available
  const showUndo = isCompleted && canUndo;

  return (
    <div className={cn(
      "w-full rounded-xl p-4 transition-colors",
      "bg-card border border-border shadow-sm",
      isCompleted && "border-success/50 bg-success/5",
      isAtRisk && "border-destructive/50 bg-destructive/5"
    )}>
      <div className="flex items-center gap-3">
        {/* Emoji with status indicator */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            "bg-muted"
          )}>
            {streak.emoji}
          </div>
          
          {/* Status badge */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
            isCompleted && "bg-success",
            isAtRisk && "bg-destructive",
            isPending && "fire-gradient"
          )}>
            {isCompleted ? (
              <Check className="w-3 h-3 text-white" />
            ) : isAtRisk ? (
              <AlertTriangle className="w-3 h-3 text-white" />
            ) : (
              <Flame className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <button
          onClick={showUndo ? undefined : (isCompleted ? onEdit : onComplete)}
          disabled={showUndo}
          className={cn(
            "flex-1 min-w-0 text-left",
            !showUndo && "touch-target active:opacity-70 transition-opacity"
          )}
        >
          <h3 className="font-medium text-foreground truncate">{streak.name}</h3>
          <p className={cn(
            "text-sm",
            isCompleted && "text-success",
            isAtRisk && "text-destructive",
            isPending && "text-primary"
          )}>
            {isCompleted ? "Done today ✓" : isAtRisk ? "Streak broken" : "Tap to complete"}
          </p>
        </button>

        {/* Undo button (shown when completed today) */}
        {showUndo && onUndo && (
          <button
            onClick={onUndo}
            className={cn(
              "px-3 py-2 rounded-lg touch-target",
              "bg-muted hover:bg-muted/80 active:bg-muted",
              "border border-border",
              "flex items-center gap-2",
              "text-sm font-medium text-foreground",
              "transition-colors"
            )}
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        )}

        {/* Streak count (shown when no undo button) */}
        {!showUndo && (
          <div className="text-right flex-shrink-0">
            <div className={cn(
              "flex items-center gap-1",
              streak.currentStreak > 0 ? "text-primary" : "text-muted-foreground"
            )}>
              <Flame className="w-4 h-4" />
              <span className="text-xl font-bold">{streak.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {streak.bestStreak}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
