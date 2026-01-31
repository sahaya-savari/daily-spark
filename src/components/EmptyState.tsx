import { Flame } from 'lucide-react';

interface EmptyStateProps {
  hasStreaks: boolean;
}

export const EmptyState = ({ hasStreaks }: EmptyStateProps) => {
  if (hasStreaks) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl fire-gradient flex items-center justify-center mb-4 shadow-md">
        <Flame className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-xl font-bold text-foreground mb-2">
        Start Your First Streak
      </h2>
      <p className="text-muted-foreground max-w-xs mb-6 text-sm">
        Build habits that stick. Tap the button below to create your first daily streak.
      </p>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Complete daily to build your streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>Watch your consistency grow</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Never break the chain</span>
        </div>
      </div>
    </div>
  );
};
