const FOCUS_KEY = 'streakflame_todayFocus';

export const getTodayFocusEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem(FOCUS_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    return false;
  }
};

export const setTodayFocusEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(FOCUS_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('[Focus] Failed to save focus mode:', error);
  }
};

export const shouldShowStreakInTodayFocus = (
  lastCompletedDate: string | null,
  scheduledDate?: string
): boolean => {
  const today = new Date().toISOString().split('T')[0];
  
  // Show if scheduled for today
  if (scheduledDate === today) return true;
  
  // Show if not completed today (pending or at-risk)
  if (lastCompletedDate !== today) return true;
  
  // Hide if already completed today
  return false;
};
