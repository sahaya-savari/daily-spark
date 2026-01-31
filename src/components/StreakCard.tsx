import { Check, Flame, AlertTriangle } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';

interface StreakCardProps {
  streak: Streak;
  status: StreakStatus;
  onComplete: () => void;
  onEdit?: () => void;
  index?: number;
}

export const StreakCard = ({ streak, status, onComplete, onEdit, index = 0 }: StreakCardProps) => {
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';
  const isPending = status === 'pending';

  return (
    <button
      onClick={isCompleted ? onEdit : onComplete}
      className={cn(
        "w-full text-left rounded-xl p-4 transition-colors touch-target",
        "bg-card border border-border shadow-sm",
        "active:bg-muted",
        isCompleted && "border-success/50 bg-success/5",
        isAtRisk && "border-destructive/50 bg-destructive/5"
      )}
    >
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
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{streak.name}</h3>
          <p className={cn(
            "text-sm",
            isCompleted && "text-success",
            isAtRisk && "text-destructive",
            isPending && "text-primary"
          )}>
            {isCompleted ? "Done today ✓" : isAtRisk ? "Streak broken" : "Tap to complete"}
          </p>
        </div>

        {/* Streak count */}
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
      </div>
    </button>
  );
};
