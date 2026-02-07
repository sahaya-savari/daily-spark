import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface CelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const Celebration = ({ isVisible, onComplete }: CelebrationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Success overlay */}
      <div className="absolute inset-0 bg-success/10" />
      
      {/* Central message */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl fire-gradient flex items-center justify-center mx-auto mb-3 shadow-md">
          <Flame className="w-10 h-10 text-white" />
        </div>
        <p className="text-xl font-bold text-foreground">Streak Continued! 🔥</p>
        <p className="text-sm text-muted-foreground mt-1">Keep it up!</p>
      </div>
    </div>
  );
};
