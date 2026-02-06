import { Check, Flame, AlertTriangle, Undo2, ChevronRight, MoreVertical, Trash2, Edit2, Share2, Bell, Clock, Star, BellOff, Shield } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCallback, memo } from 'react';
import { getReminder } from '@/services/reminderService';
import { getRepeatModeDisplay, getNextReminderTime } from '@/lib/reminderUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StreakCardProps {
  streak: Streak;
  status: StreakStatus;
  onComplete: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onDelete?: () => void;
  onRename?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onToggleStar?: () => void;
  onSnooze?: () => void;
  onUseGrace?: () => void;
  index?: number;
}

export const StreakCard = memo(({ streak, status, onComplete, onUndo, canUndo, onDelete, onRename, onShare, onEdit, onToggleStar, onSnooze, onUseGrace, index = 0 }: StreakCardProps) => {
  const navigate = useNavigate();
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';
  const isPending = status === 'pending';
  
  const reminder = getReminder(streak.id);
  const repeatMode = getRepeatModeDisplay(reminder);
  const nextReminder = getNextReminderTime(reminder);
  
  const showUndo = isCompleted && canUndo;

  const handleCardClick = () => {
    navigate(`/streak/${streak.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showUndo && onUndo) {
      onUndo();
    } else if (!isCompleted) {
      onComplete();
    }
  };

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "w-full rounded-2xl border bg-card shadow-sm",
        "transition-colors cursor-pointer",
        "hover:bg-muted/20",
        isCompleted && "border-success/30 bg-success/5",
        isAtRisk && "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Complete / Undo (Google Tasks style circle) */}
        <button
          onClick={handleActionClick}
          type="button"
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            "border-2 transition-colors touch-manipulation",
            showUndo && "border-muted-foreground/30 bg-muted/40 text-foreground",
            !showUndo && isCompleted && "border-success/40 bg-success/10 text-success",
            !showUndo && !isCompleted && "border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-foreground",
            isAtRisk && !isCompleted && "border-destructive/40 text-destructive"
          )}
          aria-label={showUndo ? "Undo completion" : isCompleted ? "Completed" : "Complete streak"}
        >
          {showUndo ? (
            <Undo2 className="w-5 h-5" />
          ) : isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <span className="block w-2 h-2 rounded-full bg-current opacity-30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl leading-none flex-shrink-0">{streak.emoji}</span>
              <h3
                className={cn(
                  "font-semibold text-foreground truncate",
                  streak.fontSize === 'small' && "text-base",
                  streak.fontSize === 'medium' && "text-lg",
                  streak.fontSize === 'large' && "text-xl",
                  streak.textAlign === 'left' && "text-left",
                  streak.textAlign === 'center' && "text-center",
                  streak.textAlign === 'right' && "text-right"
                )}
              >
                {streak.name}
              </h3>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {onToggleStar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar();
                  }}
                  type="button"
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    "hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={streak.isStarred ? "Unstar" : "Star"}
                >
                  <Star className={cn("w-5 h-5", streak.isStarred && "fill-current text-primary")} />
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    type="button"
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      "hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation",
                      "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label="Streak options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar?.();
                    }}
                    className="cursor-pointer"
                  >
                    <Star className={cn("w-4 h-4 mr-2", streak.isStarred && "fill-current")} />
                    {streak.isStarred ? 'Unstar' : 'Star'}
                  </DropdownMenuItem>
                  {isAtRisk && onUseGrace && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseGrace();
                      }}
                      className="cursor-pointer text-primary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Use Grace
                    </DropdownMenuItem>
                  )}
                  {onSnooze && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onSnooze();
                      }}
                      className="cursor-pointer"
                    >
                      <BellOff className="w-4 h-4 mr-2" />
                      Snooze
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Subtitle line (date/time + repeat) */}
          {nextReminder && (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {nextReminder.date} · {nextReminder.time}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-primary">{repeatMode}</span>
            </div>
          )}

          {/* Notes */}
          {streak.notes && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {streak.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if specific props change
  return (
    prevProps.streak === nextProps.streak &&
    prevProps.status === nextProps.status &&
    prevProps.canUndo === nextProps.canUndo &&
    prevProps.index === nextProps.index &&
    prevProps.onComplete === nextProps.onComplete &&
    prevProps.onUndo === nextProps.onUndo &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onToggleStar === nextProps.onToggleStar &&
    prevProps.onSnooze === nextProps.onSnooze &&
    prevProps.onUseGrace === nextProps.onUseGrace
  );
});

StreakCard.displayName = 'StreakCard';
