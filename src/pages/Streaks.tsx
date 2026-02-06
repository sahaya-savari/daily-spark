import { useState, useCallback } from 'react';
import { Flame, List } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { StreakCard } from '@/components/StreakCard';
import { EditStreakDialog } from '@/components/EditStreakDialog';
import { StreakListManager } from '@/components/StreakListManager';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { getStreakStatus } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
import { saveReminder, scheduleReminder, unscheduleReminder } from '@/services/reminderService';
import { DEFAULT_LIST_ID } from '@/types/streak';
import { Reminder } from '@/types/reminder';
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

const StreaksPage = () => {
  const { streaks, lists, completeStreak, undoStreak, deleteStreak, editStreak, toggleStar, createList, renameList, deleteList, canUndoAction } = useStreaksContext();
  const { toast } = useToast();
  const [streakToDelete, setStreakToDelete] = useState<string | null>(null);
  const [editDialogState, setEditDialogState] = useState({ isOpen: false, streakId: null as string | null });
  const [activeListId, setActiveListId] = useState<string>(DEFAULT_LIST_ID);

  // Sort by status
  const sortedStreaks = [...streaks].sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, 'at-risk': 2 };
    return statusOrder[getStreakStatus(a)] - statusOrder[getStreakStatus(b)];
  });

  const pendingCount = streaks.filter(s => getStreakStatus(s) === 'pending').length;
  const completedCount = streaks.filter(s => getStreakStatus(s) === 'completed').length;

  const handleDeleteStreak = useCallback((id: string) => {
    setStreakToDelete(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (streakToDelete) {
      deleteStreak(streakToDelete);
      setStreakToDelete(null);
    }
  }, [streakToDelete, deleteStreak]);

  const cancelDelete = useCallback(() => {
    setStreakToDelete(null);
  }, []);

  const handleOpenEditDialog = useCallback((streakId: string) => {
    setEditDialogState({ isOpen: true, streakId });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogState({ isOpen: false, streakId: null });
  }, []);

  const handleEditStreak = useCallback((updates: { name: string; emoji: string; description: string; listId: string; isStarred: boolean; reminder?: Reminder }) => {
    if (editDialogState.streakId) {
      editStreak(editDialogState.streakId, updates);
      if (updates.reminder) {
        const reminder = updates.reminder;
        saveReminder(editDialogState.streakId, reminder);
        if (reminder.enabled) {
          const streak = streaks.find(s => s.id === editDialogState.streakId);
          if (streak) {
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

  const handleShareStreak = useCallback((streakId: string) => {
    const streak = streaks.find(s => s.id === streakId);
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
  }, [streaks, toast]);

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="content-width px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl fire-gradient flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">All Streaks</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{streaks.length} done
            </div>
          </div>
        </div>
      </header>

      <main className="content-width px-4 py-4">
        {/* List Management Section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <List className="w-4 h-4" />
              Organize Your Streaks
            </h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create lists to organize your streaks (e.g., Work, Personal, Health).
            </p>
            <StreakListManager
              lists={lists}
              activeListId={activeListId}
              onListChange={setActiveListId}
              onCreateList={createList}
              onRenameList={renameList}
              onDeleteList={deleteList}
            />
          </div>
        </section>

        {/* Status summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-success">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-destructive">
              {streaks.filter(s => getStreakStatus(s) === 'at-risk').length}
            </p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
        </div>

        {/* All streaks list */}
        {streaks.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No streaks yet</p>
            <p className="text-sm text-muted-foreground">Go to Home to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStreaks.map((streak, index) => {
              const undoCheck = canUndoAction(streak.id);
              return (
                <StreakCard
                  key={streak.id}
                  streak={streak}
                  status={getStreakStatus(streak)}
                  onComplete={() => completeStreak(streak.id)}
                  onUndo={() => undoStreak(streak.id)}
                  onDelete={() => handleDeleteStreak(streak.id)}
                  onEdit={() => handleOpenEditDialog(streak.id)}
                  onShare={() => handleShareStreak(streak.id)}
                  onToggleStar={() => toggleStar(streak.id)}
                  canUndo={undoCheck.canUndo}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={streakToDelete !== null} onOpenChange={cancelDelete}>
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
          streak={streaks.find(s => s.id === editDialogState.streakId)!}
          lists={lists}
          existingStreakNames={streaks
            .filter(s => s.id !== editDialogState.streakId)
            .map(s => s.name)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default StreaksPage;
