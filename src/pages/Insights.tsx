import { ArrowLeft, Flame, Calendar, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { formatLocalDate, getDaysAgo } from '@/lib/dateUtils';

const Insights = () => {
  const { streaks, getStats } = useStreaksContext();
  const stats = getStats();

  // Calculate weekly data for the chart
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatLocalDate(date);
      
      const completions = streaks.filter(s => 
        s.completedDates.includes(dateStr)
      ).length;

      data.push({
        day: days[date.getDay()],
        completions,
        total: streaks.length,
        percentage: streaks.length > 0 ? Math.round((completions / streaks.length) * 100) : 0,
      });
    }

    return data;
  };

  const weeklyData = getWeeklyData();
  const maxCompletions = Math.max(...weeklyData.map(d => d.completions), 1);

  // Get top streaks
  const topStreaks = [...streaks]
    .sort((a, b) => b.bestStreak - a.bestStreak)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="content-width px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-xl active:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Insights</h1>
          </div>
        </div>
      </header>

      <main className="content-width px-4 py-4 space-y-6">
        {/* Summary cards */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <Flame className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.longestStreak}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <Award className="w-6 h-6 text-secondary mb-2" />
              <p className="text-2xl font-bold text-secondary">{stats.totalCompletions}</p>
              <p className="text-sm text-muted-foreground">Total Completions</p>
            </div>
          </div>
        </section>

        {/* Weekly activity chart */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            This Week
          </h2>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-end justify-between gap-2 h-24">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md fire-gradient transition-all"
                    style={{ 
                      height: `${Math.max((day.completions / maxCompletions) * 100, day.completions > 0 ? 8 : 4)}%`,
                      minHeight: day.completions > 0 ? 8 : 4
                    }}
                  />
                  <span className={cn(
                    "text-xs",
                    index === 6 ? "font-semibold text-primary" : "text-muted-foreground"
                  )}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly completion</span>
              <span className="font-semibold text-primary">{stats.weeklyCompletionRate}%</span>
            </div>
          </div>
        </section>

        {/* Top streaks */}
        {topStreaks.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Top Streaks
            </h2>
            <div className="space-y-2">
              {topStreaks.map((streak, index) => (
                <div
                  key={streak.id}
                  className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 && "fire-gradient text-white",
                    index === 1 && "bg-secondary text-white",
                    index === 2 && "bg-accent text-white",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{streak.emoji}</span>
                      <span className="font-medium text-foreground truncate">{streak.name}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{streak.bestStreak}</p>
                    <p className="text-xs text-muted-foreground">best</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {streaks.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Start tracking streaks to see insights here.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Insights;
