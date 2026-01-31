import { Check, Flame, AlertTriangle, Undo2, ChevronRight, MoreVertical, Trash2, Edit2, Share2 } from 'lucide-react';
import { Streak, StreakStatus } from '@/types/streak';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
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
  index?: number;
}

export const StreakCard = ({ streak, status, onComplete, onUndo, canUndo, onDelete, onRename, onShare, index = 0 }: StreakCardProps) => {
  const navigate = useNavigate();
  const isCompleted = status === 'completed';
  const isAtRisk = status === 'at-risk';
  const isPending = status === 'pending';
  
  // Show undo button if completed today and undo is available
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

  const handleRenameClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRename) {
      onRename();
    }
  }, [onRename]);

  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    }
  }, [onShare]);

  return (
    <button
      onClick={handleCardClick}
      className={cn(
        "w-full rounded-xl p-4 transition-all touch-manipulation",
        "bg-card border border-border shadow-sm",
        "hover:shadow-md active:scale-[0.98]",
        "text-left",
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

        {/* Action Area */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Action Button */}
          {!isCompleted || showUndo ? (
            <button
              onClick={handleActionClick}
              className={cn(
                "px-4 py-2 rounded-lg touch-manipulation",
                "border border-border transition-colors",
                showUndo 
                  ? "bg-muted hover:bg-muted/80 text-foreground"
                  : "fire-gradient text-white hover:shadow-lg"
              )}
            >
              {showUndo ? (
                <div className="flex items-center gap-2">
                  <Undo2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Undo</span>
                </div>
              ) : (
                <span className="text-sm font-medium">Complete</span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="text-xl font-bold">{streak.currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Best: {streak.bestStreak}
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          )}

          {/* Delete Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation",
                  "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Streak options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleRenameClick}
                className="cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShareClick}
                className="cursor-pointer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
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
    </button>
  );
};
