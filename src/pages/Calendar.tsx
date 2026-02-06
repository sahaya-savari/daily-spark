import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatLocalDate, getTodayDate } from '@/lib/dateUtils';

const CalendarPage = () => {
  const { streaks } = useStreaksContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all completion dates across all streaks with active streak count
  const allCompletions = useMemo(() => {
    const completions = new Map<string, number>();
    const activeStreaks = new Map<string, number>();
    
    streaks.forEach(streak => {
      const createdDate = streak.createdAt;
      
      // For each date from creation onward, mark streak as active
      const createdDateObj = new Date(createdDate);
      const today = new Date();
      
      for (let d = new Date(createdDateObj); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = formatLocalDate(d);
        activeStreaks.set(dateStr, (activeStreaks.get(dateStr) || 0) + 1);
      }
      
      // Count completions
      streak.completedDates.forEach(date => {
        completions.set(date, (completions.get(date) || 0) + 1);
      });
    });
    
    return { completions, activeStreaks };
  }, [streaks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: Date | null; day: number; completed: number; active: number }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, day: 0, completed: 0, active: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatLocalDate(date);
      const completed = allCompletions.completions.get(dateString) || 0;
      const active = allCompletions.activeStreaks.get(dateString) || 0;
      days.push({ date, day, completed, active });
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

  const today = getTodayDate();

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
        <div className="bg-card border border-border rounded-xl p-2 sm:p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1 sm:mb-2">
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
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((dayInfo, index) => {
              if (!dayInfo.date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateString = formatLocalDate(dayInfo.date);
              const isToday = dateString === today;
              const { completed, active } = dayInfo;
              
              // Determine color based on completion count and ratio
              let bgColor = "bg-muted";
              let textColor = "text-muted-foreground";
              
              if (active > 0) {
                if (completed === 0) {
                  // 0/x → Grey
                  bgColor = "bg-gray-200 dark:bg-gray-700";
                  textColor = "text-gray-600 dark:text-gray-300";
                } else if (completed <= 2) {
                  // 1-2/x → Red
                  bgColor = "bg-destructive/20";
                  textColor = "text-destructive";
                } else if (completed <= 4) {
                  // 3-4/x → Orange
                  bgColor = "bg-orange-200 dark:bg-orange-900/30";
                  textColor = "text-orange-600 dark:text-orange-400";
                } else if (completed === active) {
                  // x/x → Green (all completed)
                  bgColor = "bg-success/20";
                  textColor = "text-success";
                } else {
                  // 5+ but not all → Primary/default
                  bgColor = "bg-primary/10";
                  textColor = "text-primary";
                }
              }

              return (
                <div
                  key={dateString}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative",
                    bgColor,
                    isToday && "ring-2 ring-primary",
                  )}
                >
                  <span className={cn(
                    "font-medium text-foreground text-sm sm:text-base",
                    isToday && "text-primary font-bold",
                  )}>
                    {dayInfo.day}
                  </span>
                  {active > 0 && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {completed}/{active}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-card border border-border rounded-xl">
          <h3 className="text-sm font-medium text-foreground mb-2">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
              <span className="text-muted-foreground">0/x — No completions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/20" />
              <span className="text-muted-foreground">1–2/x — Few completions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-900/30" />
              <span className="text-muted-foreground">3–4/x — Most completions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success/20" />
              <span className="text-muted-foreground">x/x — All completed</span>
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
                {Array.from(allCompletions.completions.entries())
                  .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total completions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">
                {new Set(
                  Array.from(allCompletions.completions.entries())
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
