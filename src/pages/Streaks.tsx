import { Flame } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { StreakCard } from '@/components/StreakCard';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';

const StreaksPage = () => {
  const { streaks, completeStreak, undoStreak, canUndoAction } = useStreaks();

  // Sort by status
  const sortedStreaks = [...streaks].sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, 'at-risk': 2 };
    return statusOrder[getStreakStatus(a)] - statusOrder[getStreakStatus(b)];
  });

  const pendingCount = streaks.filter(s => getStreakStatus(s) === 'pending').length;
  const completedCount = streaks.filter(s => getStreakStatus(s) === 'completed').length;

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
                  canUndo={undoCheck.canUndo}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default StreaksPage;
