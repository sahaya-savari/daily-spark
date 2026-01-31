import { useState, useCallback } from 'react';
import { Plus, Flame } from 'lucide-react';
import { Header } from '@/components/Header';
import { StreakCard } from '@/components/StreakCard';
import { AddStreakDialog } from '@/components/AddStreakDialog';
import { StatsCards } from '@/components/StatsCards';
import { EmptyState } from '@/components/EmptyState';
import { Celebration } from '@/components/Celebration';
import { BottomNav } from '@/components/BottomNav';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { 
    streaks, 
    isLoading, 
    addStreak, 
    completeStreak,
    undoStreak,
    canUndoAction,
    getStats 
  } = useStreaks();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const stats = getStats();
  const totalStreakDays = streaks.reduce((sum, s) => sum + s.currentStreak, 0);

  const handleCompleteStreak = useCallback((id: string) => {
    const wasCompleted = completeStreak(id);
    if (wasCompleted) {
      setShowCelebration(true);
    }
  }, [completeStreak]);

  const handleAddStreak = useCallback((name: string, emoji: string) => {
    addStreak(name, emoji);
  }, [addStreak]);

  const handleUndoStreak = useCallback((id: string) => {
    undoStreak(id);
  }, [undoStreak]);

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
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Streak
          </Button>
        </div>
      </main>

      {/* Add streak dialog */}
      <AddStreakDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStreak}
        existingStreakNames={streaks.map(s => s.name)}
      />

      {/* Celebration animation */}
      <Celebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
