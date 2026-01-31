import { useState, useEffect, useCallback } from 'react';
import { Streak, StreakStats, StreakStatus } from '@/types/streak';

const STORAGE_KEY = 'streakflame_streaks';

// Get today's date in YYYY-MM-DD format (local timezone)
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Get yesterday's date in YYYY-MM-DD format
export const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Check if a date string is today
export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  return dateString === getTodayDate();
};

// Check if a date string is yesterday
export const isYesterday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  return dateString === getYesterdayDate();
};

// Get streak status
export const getStreakStatus = (streak: Streak): StreakStatus => {
  if (isToday(streak.lastCompletedDate)) {
    return 'completed';
  }
  if (isYesterday(streak.lastCompletedDate) || streak.lastCompletedDate === null) {
    return 'pending';
  }
  return 'at-risk';
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useStreaks = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load streaks from localStorage
  useEffect(() => {
    const loadStreaks = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Streak[];
          // Recalculate current streaks based on dates
          const updated = parsed.map(streak => recalculateStreak(streak));
          setStreaks(updated);
        }
      } catch (error) {
        console.error('Failed to load streaks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStreaks();
  }, []);

  // Save streaks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streaks));
    }
  }, [streaks, isLoading]);

  // Recalculate streak count based on completion history
  const recalculateStreak = (streak: Streak): Streak => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    // If never completed, streak is 0
    if (!streak.lastCompletedDate) {
      return { ...streak, currentStreak: 0 };
    }
    
    // If completed today, streak is valid
    if (streak.lastCompletedDate === today) {
      return streak;
    }
    
    // If completed yesterday, streak is still valid (waiting for today)
    if (streak.lastCompletedDate === yesterday) {
      return streak;
    }
    
    // Otherwise, streak is broken - reset to 0
    return { ...streak, currentStreak: 0 };
  };

  // Add a new streak
  const addStreak = useCallback((name: string, emoji: string, color?: string) => {
    const newStreak: Streak = {
      id: generateId(),
      name,
      emoji,
      createdAt: getTodayDate(),
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completedDates: [],
      color,
    };
    setStreaks(prev => [...prev, newStreak]);
    return newStreak;
  }, []);

  // Complete a streak for today
  const completeStreak = useCallback((id: string): boolean => {
    const today = getTodayDate();
    let wasCompleted = false;
    
    setStreaks(prev => prev.map(streak => {
      if (streak.id !== id) return streak;
      
      // Already completed today - do nothing
      if (streak.lastCompletedDate === today) {
        return streak;
      }
      
      wasCompleted = true;
      const yesterday = getYesterdayDate();
      
      // Calculate new streak count
      let newCurrentStreak: number;
      if (streak.lastCompletedDate === yesterday || streak.lastCompletedDate === null) {
        // Continue or start streak
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Streak was broken, start fresh
        newCurrentStreak = 1;
      }
      
      const newBestStreak = Math.max(streak.bestStreak, newCurrentStreak);
      
      return {
        ...streak,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: today,
        completedDates: [...streak.completedDates, today],
      };
    }));
    
    return wasCompleted;
  }, []);

  // Delete a streak
  const deleteStreak = useCallback((id: string) => {
    setStreaks(prev => prev.filter(streak => streak.id !== id));
  }, []);

  // Edit a streak
  const editStreak = useCallback((id: string, updates: Partial<Pick<Streak, 'name' | 'emoji' | 'color'>>) => {
    setStreaks(prev => prev.map(streak => 
      streak.id === id ? { ...streak, ...updates } : streak
    ));
  }, []);

  // Get stats
  const getStats = useCallback((): StreakStats => {
    const today = getTodayDate();
    const activeStreaks = streaks.filter(s => getStreakStatus(s) !== 'at-risk').length;
    const totalCompletions = streaks.reduce((sum, s) => sum + s.completedDates.length, 0);
    const longestStreak = Math.max(0, ...streaks.map(s => s.bestStreak));
    
    // Calculate weekly completion rate
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weeklyCompletions = streaks.reduce((sum, s) => {
      return sum + s.completedDates.filter(d => d >= weekAgoStr).length;
    }, 0);
    const possibleWeeklyCompletions = streaks.length * 7;
    const weeklyCompletionRate = possibleWeeklyCompletions > 0 
      ? Math.round((weeklyCompletions / possibleWeeklyCompletions) * 100) 
      : 0;
    
    // Calculate monthly completion rate
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    const monthlyCompletions = streaks.reduce((sum, s) => {
      return sum + s.completedDates.filter(d => d >= monthAgoStr).length;
    }, 0);
    const possibleMonthlyCompletions = streaks.length * 30;
    const monthlyCompletionRate = possibleMonthlyCompletions > 0 
      ? Math.round((monthlyCompletions / possibleMonthlyCompletions) * 100) 
      : 0;
    
    return {
      totalStreaks: streaks.length,
      activeStreaks,
      totalCompletions,
      longestStreak,
      weeklyCompletionRate,
      monthlyCompletionRate,
    };
  }, [streaks]);

  return {
    streaks,
    isLoading,
    addStreak,
    completeStreak,
    deleteStreak,
    editStreak,
    getStats,
    getStreakStatus,
  };
};

