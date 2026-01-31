import { Link, useLocation } from 'react-router-dom';
import { Home, Flame, CalendarDays, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/streaks', icon: Flame, label: 'Streaks' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="content-width flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center touch-target px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                isActive && "text-primary"
              )} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
              
              {isActive && (
                <div className="absolute bottom-1 w-8 h-1 rounded-full fire-gradient" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
