import { Flame, TrendingUp, Calendar, Target } from 'lucide-react';
import { StreakStats } from '@/types/streak';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  stats: StreakStats;
}

export const StatsCards = ({ stats }: StatsCardProps) => {
  const statItems = [
    {
      label: 'Active',
      value: stats.activeStreaks,
      total: stats.totalStreaks,
      icon: Flame,
      color: 'text-primary',
    },
    {
      label: 'Best',
      value: stats.longestStreak,
      suffix: 'd',
      icon: TrendingUp,
      color: 'text-secondary',
    },
    {
      label: 'Week',
      value: stats.weeklyCompletionRate,
      suffix: '%',
      icon: Calendar,
      color: 'text-accent',
    },
    {
      label: 'Month',
      value: stats.monthlyCompletionRate,
      suffix: '%',
      icon: Target,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-card border border-border rounded-xl p-3 text-center"
        >
          <item.icon className={cn("w-4 h-4 mx-auto mb-1", item.color)} />
          <div className="flex items-baseline justify-center gap-0.5">
            <span className={cn("text-lg font-bold", item.color)}>
              {item.value}
            </span>
            {item.total !== undefined && (
              <span className="text-xs text-muted-foreground">
                /{item.total}
              </span>
            )}
            {item.suffix && (
              <span className="text-xs text-muted-foreground">
                {item.suffix}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
};
