import { useState, useCallback } from 'react';
import { Plus, Flame } from 'lucide-react';
import { Header } from '@/components/Header';
import { StreakCard } from '@/components/StreakCard';
import { RenameStreakDialog } from '@/components/RenameStreakDialog';
import { StatsCards } from '@/components/StatsCards';
import { EmptyState } from '@/components/EmptyState';
import { Celebration } from '@/components/Celebration';
import { BottomNav } from '@/components/BottomNav';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
import { useModal } from '@/contexts/ModalContext';
import { Button } from '@/components/ui/button';
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

const Index = () => {
  const { 
    streaks, 
    isLoading, 
    completeStreak,
    undoStreak,
    deleteStreak,
    editStreak,
    canUndoAction,
    getStats 
  } = useStreaks();
  const { toast } = useToast();
  const { openAddStreak, isAddStreakOpen } = useModal();
  
  const [renameDialogState, setRenameDialogState] = useState<{ isOpen: boolean; streakId: string | null }>({ isOpen: false, streakId: null });
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakToDelete, setStreakToDelete] = useState<string | null>(null);

  const stats = getStats();
  const totalStreakDays = streaks.reduce((sum, s) => sum + s.currentStreak, 0);

  const handleCompleteStreak = useCallback((id: string) => {
    const wasCompleted = completeStreak(id);
    if (wasCompleted) {
      setShowCelebration(true);
    }
  }, [completeStreak]);

  const handleUndoStreak = useCallback((id: string) => {
    undoStreak(id);
  }, [undoStreak]);

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

  // Sort streaks: pending first, then completed, then at-risk
  const sortedStreaks = [...streaks].sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, 'at-risk': 2 };
    return statusOrder[getStreakStatus(a)] - statusOrder[getStreakStatus(b)];
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl fire-gradient flex items-center justify-center">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-nav">
      <Header totalStreak={totalStreakDays} />
      
      <main className="content-width px-4 py-4">
        {/* Stats section */}
        {streaks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-3">Your Progress</h2>
            <StatsCards stats={stats} />
          </section>
        )}

        {/* Streaks section */}
        <section>
          {streaks.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Today's Streaks</h2>
              <span className="text-sm text-muted-foreground">
                {stats.activeStreaks}/{stats.totalStreaks} active
              </span>
            </div>
          )}

          <EmptyState hasStreaks={streaks.length > 0} />

          <div className="space-y-3">
            {sortedStreaks.map((streak, index) => {
              const undoCheck = canUndoAction(streak.id);
              return (
                <StreakCard
                  key={streak.id}
                  streak={streak}
                  status={getStreakStatus(streak)}
                  onComplete={() => handleCompleteStreak(streak.id)}
                  onUndo={() => handleUndoStreak(streak.id)}
                  onDelete={() => handleDeleteStreak(streak.id)}
                  onRename={() => handleOpenRenameDialog(streak.id)}
                  onShare={() => handleShareStreak(streak.id)}
                  canUndo={undoCheck.canUndo}
                  index={index}
                />
              );
            })}
          </div>
        </section>

        {/* Add streak button - always visible at bottom of content */}
        <div className="mt-6 pb-4">
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium fire-gradient text-white rounded-xl shadow-md"
            onClick={openAddStreak}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Streak
          </Button>
        </div>
      </main>

      {/* Celebration animation */}
      <Celebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

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

      {/* Bottom navigation - Hidden when modal is open */}
      {!isAddStreakOpen && <BottomNav />}
    </div>
  );
};

export default Index;