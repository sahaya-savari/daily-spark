import { useState, useCallback } from 'react';
import { Flame } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { StreakCard } from '@/components/StreakCard';
import { RenameStreakDialog } from '@/components/RenameStreakDialog';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
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
  const { streaks, completeStreak, undoStreak, deleteStreak, editStreak, canUndoAction } = useStreaks();
  const { toast } = useToast();
  const [streakToDelete, setStreakToDelete] = useState<string | null>(null);
  const [renameDialogState, setRenameDialogState] = useState({ isOpen: false, streakId: null as string | null });

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

  const handleOpenRenameDialog = useCallback((streakId: string) => {
    setRenameDialogState({ isOpen: true, streakId });
  }, []);

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
                  onRename={() => handleOpenRenameDialog(streak.id)}
                  onShare={() => handleShareStreak(streak.id)}
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

      {/* Rename streak dialog */}
      {renameDialogState.streakId && (
        <RenameStreakDialog
          isOpen={renameDialogState.isOpen}
          onClose={handleCloseRenameDialog}
          onRename={handleRenameStreak}
          currentName={streaks.find(s => s.id === renameDialogState.streakId)?.name || ''}
          existingStreakNames={streaks
            .filter(s => s.id !== renameDialogState.streakId)
            .map(s => s.name)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default StreaksPage;
