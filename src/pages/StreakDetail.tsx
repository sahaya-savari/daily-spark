import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, MoreVertical, Trash2, Edit2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RenameStreakDialog } from '@/components/RenameStreakDialog';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const StreakDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { streaks, editStreak, completeStreak, undoStreak, deleteStreak, getStreakStatus: getStatus, canUndoAction } = useStreaks();
  const { toast } = useToast();
  
  const streak = streaks.find(s => s.id === id);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [renameDialogState, setRenameDialogState] = useState({ isOpen: false, streakId: null as string | null });

  useEffect(() => {
    if (streak?.notes) {
      setNotes(streak.notes);
    }
  }, [streak?.notes]);

  if (!streak) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Streak not found</h2>
          <p className="text-muted-foreground mb-4">This streak may have been deleted.</p>
          <Button onClick={() => navigate('/')} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatus(streak);
  const undoCheck = canUndoAction(streak.id);
  const isCompleted = status === 'completed';

  const handleNotesBlur = () => {
    if (notes !== streak.notes) {
      setIsSavingNotes(true);
      editStreak(streak.id, { notes: notes.trim() });
      setTimeout(() => setIsSavingNotes(false), 500);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteStreak(streak.id);
    navigate('/');
  };

  const handleOpenRenameDialog = useCallback(() => {
    setRenameDialogState({ isOpen: true, streakId: streak.id });
  }, [streak.id]);

  const handleCloseRenameDialog = useCallback(() => {
    setRenameDialogState({ isOpen: false, streakId: null });
  }, []);

  const handleRenameStreak = useCallback((newName: string) => {
    if (renameDialogState.streakId) {
      editStreak(renameDialogState.streakId, { name: newName });
      toast({
        title: 'Streak renamed',
        description: `Updated to "${newName}"`,
        duration: 2000,
      });
      handleCloseRenameDialog();
    }
  }, [renameDialogState.streakId, editStreak, toast, handleCloseRenameDialog]);

  const handleShareStreak = useCallback(() => {
    if (!streak) return;

    const shareText = `🔥 ${streak.currentStreak}-day streak!\nHabit: ${streak.name}\nBuilt with Daily Spark`;

    if (navigator.share) {
      navigator.share({
        title: 'My Streak on Daily Spark',
        text: shareText,
      }).catch(() => {
        // User cancelled share, no error needed
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'Share text is ready to paste',
          duration: 2000,
        });
      }).catch(() => {
        toast({
          title: 'Failed to copy',
          description: 'Please try again',
          variant: 'destructive',
          duration: 2000,
        });
      });
    }
  }, [streak, toast]);

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleToggleCompletion = () => {
    if (isCompleted && undoCheck.canUndo) {
      undoStreak(streak.id);
    } else if (!isCompleted) {
      completeStreak(streak.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="content-width px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/')}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Streak Details</h1>
          
          {/* Delete Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleOpenRenameDialog}
                className="cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShareStreak}
                className="cursor-pointer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Streak
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-width px-4 py-6 space-y-6">
        
        {/* Streak Header Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-start gap-4">
            {/* Emoji */}
            <div className="w-16 h-16 rounded-xl fire-gradient flex items-center justify-center text-4xl flex-shrink-0">
              {streak.emoji}
            </div>
            
            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <h2 className={cn(
                "text-2xl font-bold mb-1",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {streak.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed today
                  </span>
                ) : status === 'at-risk' ? (
                  <span className="inline-flex items-center gap-1 text-sm text-destructive font-medium">
                    <Circle className="w-4 h-4" />
                    Streak at risk
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground font-medium">
                    <Circle className="w-4 h-4" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-3xl font-bold fire-text mb-1">{streak.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-3xl font-bold text-foreground mb-1">{streak.bestStreak}</div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          {/* Created Date */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-base font-medium text-foreground">
                  {formatDate(streak.createdAt)} at {formatTime(streak.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Last Completed */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Last Completed</div>
                <div className="text-base font-medium text-foreground">
                  {formatDate(streak.lastCompletedDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Completions */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Total Completions</div>
                <div className="text-base font-medium text-foreground">
                  {streak.completedDates.length} {streak.completedDates.length === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <label htmlFor="streak-notes" className="text-sm font-medium text-muted-foreground mb-3 block">
            Notes & Description
          </label>
          <Textarea
            id="streak-notes"
            placeholder="Add notes about your streak, motivation, or tips..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className="min-h-32 resize-none bg-muted border-0 rounded-lg"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{notes.length}/500</span>
            {isSavingNotes && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>
            )}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-4 safe-bottom"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="content-width mx-auto">
          <Button
            size="lg"
            onClick={handleToggleCompletion}
            disabled={isCompleted && !undoCheck.canUndo}
            className={cn(
              "w-full h-14 text-base font-semibold rounded-xl shadow-lg transition-all touch-manipulation",
              isCompleted && undoCheck.canUndo
                ? "bg-muted hover:bg-muted/80 text-foreground"
                : "fire-gradient text-white hover:shadow-xl"
            )}
          >
            {isCompleted ? (
              undoCheck.canUndo ? (
                <>
                  <Circle className="w-5 h-5 mr-2" />
                  Mark as Incomplete
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Already Completed
                </>
              )
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark as Complete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete streak?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this streak and all its progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename streak dialog */}
      {renameDialogState.streakId && (
        <RenameStreakDialog
          isOpen={renameDialogState.isOpen}
          onClose={handleCloseRenameDialog}
          onRename={handleRenameStreak}
          currentName={streak?.name || ''}
          existingStreakNames={streaks
            .filter(s => s.id !== renameDialogState.streakId)
            .map(s => s.name)}
        />
      )}
    </div>
  );
};

export default StreakDetail;
