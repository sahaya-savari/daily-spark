import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useStreaks } from '@/hooks/useStreaks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const { streaks } = useStreaks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all completion dates across all streaks
  const allCompletions = useMemo(() => {
    const completions = new Map<string, number>();
    streaks.forEach(streak => {
      streak.completedDates.forEach(date => {
        completions.set(date, (completions.get(date) || 0) + 1);
      });
    });
    return completions;
  }, [streaks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: Date | null; day: number; completions: number }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, day: 0, completions: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const completions = allCompletions.get(dateString) || 0;
      days.push({ date, day, completions });
    }

    return days;
  }, [year, month, allCompletions]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="content-width px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-xl active:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Calendar</h1>
          </div>
        </div>
      </header>

      <main className="content-width px-4 py-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="touch-target"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="touch-target"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="bg-card border border-border rounded-xl p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => {
              if (!dayInfo.date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateString = dayInfo.date.toISOString().split('T')[0];
              const isToday = dateString === today;
              const hasCompletions = dayInfo.completions > 0;
              const maxStreaks = streaks.length || 1;
              const completionRatio = dayInfo.completions / maxStreaks;

              return (
                <div
                  key={dateString}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative",
                    isToday && "ring-2 ring-primary",
                    hasCompletions && "bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isToday && "text-primary",
                    hasCompletions && "text-primary"
                  )}>
                    {dayInfo.day}
                  </span>
                  {hasCompletions && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Flame className={cn(
                        "w-3 h-3",
                        completionRatio >= 1 ? "text-primary" : "text-primary/60"
                      )} />
                      {dayInfo.completions > 1 && (
                        <span className="text-[10px] text-primary font-medium">
                          {dayInfo.completions}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-card border border-border rounded-xl">
          <h3 className="text-sm font-medium text-foreground mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary" />
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </div>

        {/* Monthly stats */}
        <div className="mt-4 p-3 bg-card border border-border rounded-xl">
          <h3 className="text-sm font-medium text-foreground mb-2">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {Array.from(allCompletions.entries())
                  .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total completions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">
                {new Set(
                  Array.from(allCompletions.entries())
                    .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                    .map(([date]) => date)
                ).size}
              </p>
              <p className="text-xs text-muted-foreground">Active days</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CalendarPage;
