import { Streak, StreakStatus } from '@/types/streak';
import { SingleStreakWidget } from './SingleStreakWidget';
import { MultiStreakGridWidget } from './MultiStreakGridWidget';

interface WidgetPanelProps {
  streaks: Streak[];
  getStreakStatus: (streak: Streak) => StreakStatus;
  onStreakClick?: (streakId: string) => void;
  className?: string;
}

export const WidgetPanel = ({ 
  streaks, 
  getStreakStatus, 
  onStreakClick,
  className 
}: WidgetPanelProps) => {
  if (streaks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          Create streaks to preview widgets here.
        </p>
      </div>
    );
  }

  const streaksWithStatus = streaks.map(streak => ({
    streak,
    status: getStreakStatus(streak)
  }));

  // Get the most important streak (highest current streak)
  const featuredStreak = [...streaksWithStatus]
    .sort((a, b) => b.streak.currentStreak - a.streak.currentStreak)[0];

  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-foreground mb-3">Widget Preview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        These widgets will appear on your home screen
      </p>
      
      <div className="flex flex-wrap gap-3 items-start">
        {/* Single Streak Widget - Small */}
        <div>
          <p className="text-xs text-muted-foreground text-center mb-1">Small</p>
          <SingleStreakWidget
            streak={featuredStreak.streak}
            status={featuredStreak.status}
            size="small"
            onClick={() => onStreakClick?.(featuredStreak.streak.id)}
          />
        </div>

        {/* Single Streak Widget - Medium */}
        <div>
          <p className="text-xs text-muted-foreground text-center mb-1">Medium</p>
          <SingleStreakWidget
            streak={featuredStreak.streak}
            status={featuredStreak.status}
            size="medium"
            onClick={() => onStreakClick?.(featuredStreak.streak.id)}
          />
        </div>

        {/* Multi Streak Grid Widget */}
        {streaks.length > 1 && (
          <div>
            <p className="text-xs text-muted-foreground text-center mb-1">Grid</p>
            <MultiStreakGridWidget
              streaks={streaksWithStatus}
              size="medium"
              maxItems={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};
