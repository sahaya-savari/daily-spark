import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, MoreVertical, Trash2, Edit2, Share2, Bell, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EditStreakDialog } from '@/components/EditStreakDialog';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { getStreakStatus } from '@/hooks/useStreaks';
import { getReminder } from '@/services/reminderService';
import { useToast } from '@/hooks/use-toast';
import { saveReminder, scheduleReminder, unscheduleReminder } from '@/services/reminderService';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getRepeatModeDisplay, getNextReminderTime } from '@/lib/reminderUtils';
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
  const { streaks, lists, editStreak, completeStreak, undoStreak, deleteStreak, toggleStar, getStreakStatus: getStatus, canUndoAction } = useStreaksContext();
  const { toast } = useToast();
  
  const streak = streaks.find(s => s.id === id);
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editDialogState, setEditDialogState] = useState({ isOpen: false, streakId: null as string | null });

  useEffect(() => {
    if (streak?.notes) {
      setNotes(streak.notes);
    }
    if (streak?.description) {
      setDescription(streak.description);
    }
    if (streak?.scheduledDate) {
      setScheduledDate(streak.scheduledDate);
    }
    if (streak?.scheduledTime) {
      setScheduledTime(streak.scheduledTime);
    }
  }, [streak?.notes, streak?.description, streak?.scheduledDate, streak?.scheduledTime]);

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
    if (notes !== streak.notes || description !== streak.description || scheduledDate !== streak.scheduledDate || scheduledTime !== streak.scheduledTime) {
      setIsSavingNotes(true);
      editStreak(streak.id, { 
        notes: notes.trim(),
        description: description.trim(),
        scheduledDate,
        scheduledTime,
      });
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

  const handleOpenEditDialog = useCallback(() => {
    setEditDialogState({ isOpen: true, streakId: streak.id });
  }, [streak.id]);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogState({ isOpen: false, streakId: null });
  }, []);

  const handleEditStreak = useCallback((updates: { name: string; emoji: string; description: string; listId: string; isStarred: boolean; reminder?: any }) => {
    if (editDialogState.streakId) {
      editStreak(editDialogState.streakId, updates);
      if (updates.reminder) {
        const reminder = updates.reminder;
        saveReminder(editDialogState.streakId, reminder);
        if (reminder.enabled) {
          const currentStreak = streaks.find(s => s.id === editDialogState.streakId);
          if (currentStreak) {
            scheduleReminder(editDialogState.streakId, updates.name, updates.emoji, reminder, () => {});
          }
        } else {
          unscheduleReminder(editDialogState.streakId);
        }
      }
      toast({
        title: 'Streak updated',
        description: 'Changes saved successfully',
        duration: 2000,
      });
      handleCloseEditDialog();
    }
  }, [editDialogState.streakId, editStreak, streaks, toast, handleCloseEditDialog]);

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
                onClick={() => toggleStar(streak.id)}
                className="cursor-pointer"
              >
                <Star className={cn("w-4 h-4 mr-2", streak.isStarred && "fill-current")} />
                {streak.isStarred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem
                  onClick={handleOpenEditDialog}
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

        {/* Reminder Section */}
        {streak.reminderEnabled && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Reminder</h3>
            </div>
            
            <div className="space-y-3">
              {(() => {
                const reminder = getReminder(streak.id);
                const repeatMode = getRepeatModeDisplay(reminder);
                const nextReminder = getNextReminderTime(reminder);
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Repeat pattern:</span>
                      <span className="text-sm font-medium text-foreground">{repeatMode}</span>
                    </div>
                    
                    {reminder?.time && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Time:</span>
                        <span className="text-sm font-medium text-foreground">{reminder.time}</span>
                      </div>
                    )}
                    
                    {nextReminder && (
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Next reminder:</span>
                        <span className="text-sm font-medium text-primary">
                          {nextReminder.date} at {nextReminder.time}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

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

        {/* Description */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <label htmlFor="streak-description" className="text-sm font-medium text-muted-foreground mb-3 block">
            Description
          </label>
          <Textarea
            id="streak-description"
            placeholder="What is this streak about? What are you trying to achieve?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleNotesBlur}
            className="min-h-24 resize-none bg-muted border-0 rounded-lg"
            maxLength={300}
          />
          <div className="text-xs text-muted-foreground mt-2">{description.length}/300</div>
        </div>

        {/* Schedule/Reschedule */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border">
            <label htmlFor="scheduled-date" className="text-sm font-medium text-muted-foreground mb-3 block">
              Scheduled Date (optional)
            </label>
            <Input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              onBlur={handleNotesBlur}
              className="bg-muted border-0 h-10"
            />
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <label htmlFor="scheduled-time" className="text-sm font-medium text-muted-foreground mb-3 block">
              Scheduled Time (optional)
            </label>
            <Input
              id="scheduled-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              onBlur={handleNotesBlur}
              className="bg-muted border-0 h-10"
            />
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

      {/* Edit streak dialog */}
      {editDialogState.streakId && (
        <EditStreakDialog
          isOpen={editDialogState.isOpen}
          onClose={handleCloseEditDialog}
          onSave={handleEditStreak}
          streak={streak!}
          lists={lists}
          existingStreakNames={streaks
            .filter(s => s.id !== editDialogState.streakId)
            .map(s => s.name)}
        />
      )}
    </div>
  );
};

export default StreakDetail;
