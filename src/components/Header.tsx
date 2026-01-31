import { Flame } from 'lucide-react';

interface HeaderProps {
  totalStreak: number;
}

export const Header = ({ totalStreak }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
      <div className="content-width px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl fire-gradient flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Daily Spark</h1>
          </div>

          {/* Total streak counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{totalStreak}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
      </div>
    </header>
  );
};
