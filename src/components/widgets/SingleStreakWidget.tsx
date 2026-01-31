import { Flame } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';

interface SingleStreakWidgetProps {
  streak: Streak;
  status: StreakStatus;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const SingleStreakWidget = ({ 
  streak, 
  status, 
  onClick,
  size = 'medium' 
}: SingleStreakWidgetProps) => {
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';
  const isPaused = streak.isPaused;

  const sizeClasses = {
    small: 'w-20 h-20 p-2',
    medium: 'w-28 h-28 p-3',
    large: 'w-36 h-36 p-4',
  };

  const emojiSizes = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  const countSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl flex flex-col items-center justify-center gap-1 transition-colors touch-target",
        "bg-card border border-border shadow-sm",
        "active:bg-muted",
        sizeClasses[size],
        isCompleted && "border-success/50 bg-success/5",
        isAtRisk && "border-destructive/50 bg-destructive/5",
        isPaused && "opacity-60"
      )}
    >
      <span className={cn(emojiSizes[size])}>{streak.emoji}</span>
      
      <p className={cn(
        "font-medium text-foreground truncate max-w-full text-center",
        size === 'small' && 'text-[10px]',
        size === 'medium' && 'text-xs',
        size === 'large' && 'text-sm',
      )}>
        {streak.name}
      </p>
      
      <div className={cn(
        "flex items-center gap-0.5",
        streak.currentStreak > 0 ? "text-primary" : "text-muted-foreground"
      )}>
        <Flame className={cn(
          streak.currentStreak > 0 ? "text-primary" : "text-muted-foreground",
          size === 'small' && 'w-3 h-3',
          size === 'medium' && 'w-4 h-4',
          size === 'large' && 'w-5 h-5',
        )} />
        <span className={cn("font-bold", countSizes[size])}>
          {streak.currentStreak}
        </span>
      </div>

      {isPaused && (
        <span className="text-[10px] text-muted-foreground">Paused</span>
      )}
    </button>
  );
};
