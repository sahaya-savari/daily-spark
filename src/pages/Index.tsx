import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Flame, Star, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StreakCard } from '@/components/StreakCard';
import { EditStreakDialog } from '@/components/EditStreakDialog';
import { SnoozeDialog } from '@/components/SnoozeDialog';
import { GraceDialog } from '@/components/GraceDialog';
import { StatsCards } from '@/components/StatsCards';
import { EmptyState } from '@/components/EmptyState';
import { Celebration } from '@/components/Celebration';
import { BottomNav } from '@/components/BottomNav';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { getStreakStatus } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
import { saveReminder, scheduleReminder, unscheduleReminder } from '@/services/reminderService';
import { snoozeStreak } from '@/services/snoozeService';
import { useWeeklyGrace as applyWeeklyGrace, useMonthlyGrace as applyMonthlyGrace, getGraceStatus } from '@/services/graceService';
import { getTodayFocusEnabled } from '@/services/focusService';
import { triggerHapticLight } from '@/services/hapticService';
import { useModal } from '@/contexts/ModalContext';
import { Button } from '@/components/ui/button';
import { DEFAULT_LIST_ID } from '@/types/streak';
import { Reminder } from '@/types/reminder';
import { getColorFromListColor } from '@/lib/utils';
import { calculateGlobalStreak } from '@/services/globalStreakService';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const location = useLocation();
  const { 
    streaks, 
    lists,
    isLoading, 
    completeStreak,
    undoStreak,
    deleteStreak,
    editStreak,
    toggleStar,
    moveStreakToList,
    createList,
    renameList,
    deleteList,
    canUndoAction,
    getStats 
  } = useStreaksContext();
  const { toast } = useToast();
  const { openAddStreak, isAddStreakOpen, setAddStreakOpen } = useModal();
  
  const [activeListId, setActiveListId] = useState<string>(DEFAULT_LIST_ID);
  const [editDialogState, setEditDialogState] = useState<{ isOpen: boolean; streakId: string | null }>({ isOpen: false, streakId: null });
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakToDelete, setStreakToDelete] = useState<string | null>(null);
  const [snoozeDialogState, setSnoozeDialogState] = useState<{ isOpen: boolean; streakId: string | null }>({ isOpen: false, streakId: null });
  const [graceDialogState, setGraceDialogState] = useState<{ isOpen: boolean; streakId: string | null }>({ isOpen: false, streakId: null });
  const [todayFocusEnabled, setTodayFocusEnabled] = useState(getTodayFocusEnabled());

  // BUG FIX 1: Ensure page scrolls to top on mount so Add button is visible
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Refresh state when navigating to Home page
  useEffect(() => {
    const currentState = getTodayFocusEnabled();
    setTodayFocusEnabled(currentState);
    console.log('[Home] Refreshing state on navigation:', currentState);
  }, [location.pathname]);

  // Refresh Today Focus state when component mounts or becomes visible
  useEffect(() => {
    // Update state on mount
    const currentState = getTodayFocusEnabled();
    setTodayFocusEnabled(currentState);
    console.log('[Home] Today Focus state on mount:', currentState);
    
    // Update state when page becomes visible (user returns from Settings)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newState = getTodayFocusEnabled();
        setTodayFocusEnabled(newState);
        console.log('[Home] Today Focus state on visibility:', newState);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      console.log('[Home] Today Focus changed via event:', customEvent.detail.enabled);
      setTodayFocusEnabled(customEvent.detail.enabled);
    };
    window.addEventListener('todayFocusChanged', handler);
    return () => window.removeEventListener('todayFocusChanged', handler);
  }, []);

  // Debug: log todayFocusEnabled whenever it changes
  useEffect(() => {
    console.log('[Home] todayFocusEnabled state updated:', todayFocusEnabled);
  }, [todayFocusEnabled]);

  // BUG FIX 2: Reset activeListId if current list is deleted
  useEffect(() => {
    const listExists = lists.some(l => l.id === activeListId);
    if (!listExists) {
      setActiveListId(DEFAULT_LIST_ID);
    }
  }, [lists, activeListId]);

  // BUG FIX 2: Close edit dialog if streak is deleted
  useEffect(() => {
    if (editDialogState.streakId) {
      const streakExists = streaks.some(s => s.id === editDialogState.streakId);
      if (!streakExists) {
        setEditDialogState({ isOpen: false, streakId: null });
      }
    }
  }, [streaks, editDialogState.streakId]);

  const stats = getStats();
  
  // BUG FIX 3: Calculate global streak correctly - ONE day = ONE increment
  const totalStreakDays = calculateGlobalStreak();

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

  const handleOpenEditDialog = useCallback((streakId: string) => {
    setEditDialogState({ isOpen: true, streakId });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogState({ isOpen: false, streakId: null });
  }, []);

  const handleSnooze = useCallback((streakId: string) => {
    setSnoozeDialogState({ isOpen: true, streakId });
  }, []);

  const handleConfirmSnooze = useCallback((until: number) => {
    if (snoozeDialogState.streakId) {
      snoozeStreak(snoozeDialogState.streakId, until);
      toast({
        title: 'Reminder Snoozed',
        description: 'You\'ll be reminded later',
        duration: 2000,
      });
      setSnoozeDialogState({ isOpen: false, streakId: null });
    }
  }, [snoozeDialogState.streakId, toast]);

  const handleUseGrace = useCallback((streakId: string) => {
    setGraceDialogState({ isOpen: true, streakId });
  }, []);

  const handleGraceWeekly = useCallback(() => {
    if (graceDialogState.streakId) {
      const success = applyWeeklyGrace(graceDialogState.streakId);
      if (success) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        editStreak(graceDialogState.streakId, { lastCompletedDate: yesterdayStr });
        toast({
          title: 'Weekly Grace Used',
          description: 'Streak restored to yesterday',
          duration: 2000,
        });
      }
      setGraceDialogState({ isOpen: false, streakId: null });
    }
  }, [graceDialogState.streakId, editStreak, toast]);

  const handleGraceMonthly = useCallback(() => {
    if (graceDialogState.streakId) {
      const success = applyMonthlyGrace(graceDialogState.streakId);
      if (success) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        editStreak(graceDialogState.streakId, { lastCompletedDate: yesterdayStr });
        toast({
          title: 'Monthly Grace Used',
          description: 'Full streak restored',
          duration: 2000,
        });
      }
      setGraceDialogState({ isOpen: false, streakId: null });
    }
  }, [graceDialogState.streakId, editStreak, toast]);

  const handleToggleStar = useCallback((streakId: string) => {
    toggleStar(streakId);
    triggerHapticLight();
  }, [toggleStar]);

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

  const activeList = lists.find(l => l.id === activeListId);
  
  // Single derived structure - computed once per render
  const derivedStreaks = useMemo(() => {
    // Sort function for streaks
    const sortStreaks = (streakList: typeof streaks) => {
      return [...streakList].sort((a, b) => {
        if (a.isStarred !== b.isStarred) {
          return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
        }
        const statusOrder = { pending: 0, completed: 1, 'at-risk': 2 };
        return statusOrder[getStreakStatus(a)] - statusOrder[getStreakStatus(b)];
      });
    };

    let baseStreaks = streaks;
    
    // Apply today focus filter if enabled - show only incomplete streaks
    if (todayFocusEnabled) {
      const today = new Date().toISOString().split('T')[0];
      baseStreaks = streaks.filter(s => s.lastCompletedDate !== today);
      console.log('[Home] Today Focus filtered:', baseStreaks.length, 'of', streaks.length, 'streaks');
    }

    // Today's streaks (all streaks, sorted)
    const today = sortStreaks(baseStreaks);

    // List-filtered streaks
    const filtered = baseStreaks.filter(
      s => s.listId === activeListId || (!s.listId && activeListId === DEFAULT_LIST_ID)
    );
    const list = sortStreaks(filtered);

    return { today, list };
  }, [streaks, activeListId, todayFocusEnabled]);

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
        {/* Today Focus Mode Indicator */}
        {todayFocusEnabled && (
          <div className="mb-6 p-4 rounded-2xl bg-card border border-orange-500/30">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Today Focus Enabled
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Showing only today's tasks
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats section */}
        {streaks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-3">Your Progress</h2>
            <StatsCards stats={stats} />
          </section>
        )}

        {/* Today's Streaks Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Today's Streaks</h2>
            <span className="text-sm text-muted-foreground">
              {stats.activeStreaks}/{stats.totalStreaks} active
            </span>
          </div>

          {derivedStreaks.today.length === 0 ? (
            <EmptyState hasStreaks={false} />
          ) : (
            <div className="space-y-3">
              {derivedStreaks.today.map((streak, index) => {
                const undoCheck = canUndoAction(streak.id);
                const graceStatus = getGraceStatus(streak.id);
                const showGrace = getStreakStatus(streak) === 'at-risk' && 
                                  (graceStatus.weeklyAvailable || graceStatus.monthlyAvailable);
                
                return (
                  <StreakCard
                    key={streak.id}
                    streak={streak}
                    status={getStreakStatus(streak)}
                    onComplete={() => handleCompleteStreak(streak.id)}
                    onUndo={() => handleUndoStreak(streak.id)}
                    onDelete={() => handleDeleteStreak(streak.id)}
                    onEdit={() => handleOpenEditDialog(streak.id)}
                    onToggleStar={() => handleToggleStar(streak.id)}
                    onSnooze={() => handleSnooze(streak.id)}
                    onUseGrace={showGrace ? () => handleUseGrace(streak.id) : undefined}
                    canUndo={undoCheck.canUndo}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* All Streaks Section with List Filter */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">All Streaks</h2>
            {lists && lists.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                    <span>{activeList?.name || 'My Streaks'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {lists.map(list => (
                    <DropdownMenuItem
                      key={list.id}
                      onClick={() => setActiveListId(list.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getColorFromListColor(list.color)
                          }}
                        />
                        <span>{list.name}</span>
                      </div>
                      {list.id === activeListId && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {derivedStreaks.list.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No streaks in this list
            </div>
          ) : (
            <div className="space-y-3">
              {derivedStreaks.list.map((streak, index) => {
                const undoCheck = canUndoAction(streak.id);
                return (
                  <StreakCard
                    key={streak.id}
                    streak={streak}
                    status={getStreakStatus(streak)}
                    onComplete={() => handleCompleteStreak(streak.id)}
                    onUndo={() => handleUndoStreak(streak.id)}
                    onDelete={() => handleDeleteStreak(streak.id)}
                    onEdit={() => handleOpenEditDialog(streak.id)}
                    onToggleStar={() => handleToggleStar(streak.id)}
                    onSnooze={() => handleSnooze(streak.id)}
                    canUndo={undoCheck.canUndo}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Add streak button - single primary CTA */}
        <div className="mt-4 pb-4">
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

      {/* Snooze dialog */}
      {snoozeDialogState.streakId && (
        <SnoozeDialog
          isOpen={snoozeDialogState.isOpen}
          onClose={() => setSnoozeDialogState({ isOpen: false, streakId: null })}
          onSnooze={handleConfirmSnooze}
          streakName={streaks.find(s => s.id === snoozeDialogState.streakId)?.name || ''}
        />
      )}

      {/* Grace dialog */}
      {graceDialogState.streakId && (
        <GraceDialog
          isOpen={graceDialogState.isOpen}
          onClose={() => setGraceDialogState({ isOpen: false, streakId: null })}
          onUseWeekly={handleGraceWeekly}
          onUseMonthly={handleGraceMonthly}
          weeklyAvailable={getGraceStatus(graceDialogState.streakId).weeklyAvailable}
          monthlyAvailable={getGraceStatus(graceDialogState.streakId).monthlyAvailable}
          streakName={streaks.find(s => s.id === graceDialogState.streakId)?.name || ''}
        />
      )}

      {/* Bottom navigation - Hidden when modal is open */}
      <BottomNav />
    </div>
  );
};

export default Index;