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
