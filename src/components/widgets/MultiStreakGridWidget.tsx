import { Flame } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';

interface MultiStreakGridWidgetProps {
  streaks: Array<{ streak: Streak; status: StreakStatus }>;
  onClick?: () => void;
  maxItems?: number;
  size?: 'small' | 'medium' | 'large';
}

export const MultiStreakGridWidget = ({ 
  streaks, 
  onClick,
  maxItems = 5,
  size = 'medium'
}: MultiStreakGridWidgetProps) => {
  // Filter out paused streaks and limit to maxItems
  const displayStreaks = streaks
    .filter(s => !s.streak.isPaused)
    .slice(0, maxItems);

  const sizeClasses = {
    small: 'p-2 gap-1',
    medium: 'p-3 gap-2',
    large: 'p-4 gap-3',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl transition-colors touch-target text-left",
        "bg-card border border-border shadow-sm",
        "active:bg-muted",
        sizeClasses[size]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-foreground">Active Streaks</h3>
        <div className="flex items-center gap-0.5 text-primary">
          <Flame className="w-3 h-3" />
          <span className="text-xs font-bold">
            {displayStreaks.reduce((sum, s) => sum + s.streak.currentStreak, 0)}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1">
        {displayStreaks.map(({ streak, status }) => (
          <StreakGridCell 
            key={streak.id} 
            streak={streak} 
            status={status}
            size={size}
          />
        ))}
      </div>

      {/* Show more indicator */}
      {streaks.length > maxItems && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          +{streaks.length - maxItems} more
        </p>
      )}
    </button>
  );
};

interface StreakGridCellProps {
  streak: Streak;
  status: StreakStatus;
  size: 'small' | 'medium' | 'large';
}

const StreakGridCell = ({ streak, status, size }: StreakGridCellProps) => {
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg p-1",
        "bg-muted/50",
        isCompleted && "bg-success/20",
        isAtRisk && "bg-destructive/20"
      )}
    >
      <span className={cn(
        size === 'small' && 'text-sm',
        size === 'medium' && 'text-base',
        size === 'large' && 'text-lg',
      )}>
        {streak.emoji}
      </span>
      <div className={cn(
        "flex items-center gap-0.5",
        streak.currentStreak > 0 ? "text-primary" : "text-muted-foreground"
      )}>
        <Flame className="w-2 h-2" />
        <span className="text-[10px] font-bold">
          {streak.currentStreak}
        </span>
      </div>
    </div>
  );
};
