import { Capacitor } from '@capacitor/core';
import { Reminder } from '@/types/reminder';

const REMINDERS_KEY = 'streakflame_reminders';
const isDev = import.meta.env.DEV;

const scheduledReminders = new Map<string, NodeJS.Timeout>();

const getPlatform = () => Capacitor.getPlatform();
const isNativePlatform = () => getPlatform() !== 'web';
const isAndroid = () => getPlatform() === 'android';

const getGlobalNotificationsEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem('streakflame_notifications');
    if (!stored) {
      return false;
    }
    const parsed = JSON.parse(stored) as { enabled?: boolean };
    return Boolean(parsed.enabled);
  } catch (error) {
    return false;
  }
};

// Cancel native notifications for a specific streak
const cancelNativeNotificationsForStreak = async (streakId: string): Promise<void> => {
  if (!isAndroid()) {
    return;
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(n => n.extra?.streakId === streakId);
    
    if (toCancel.length === 0) {
      return;
    }

    await LocalNotifications.cancel({
      notifications: toCancel.map(n => ({ id: n.id }))
    });
    if (isDev) {
      console.log('[Reminder] Cancelled', toCancel.length, 'notifications for streak:', streakId);
    }
  } catch (error) {
    console.error('[Reminder] Failed to cancel notifications:', error);
  }
};

export const calculateNextReminderTime = (
  time: string,
  repeatDays: boolean[]
): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  
  const nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);

  if (nextDate <= now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  const dayOfWeek = nextDate.getDay();
  
  if (repeatDays[dayOfWeek]) {
    return nextDate.getTime();
  }

  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(nextDate);
    checkDate.setDate(checkDate.getDate() + i);
    const checkDay = checkDate.getDay();
    
    if (repeatDays[checkDay]) {
      checkDate.setHours(hours, minutes, 0, 0);
      return checkDate.getTime();
    }
  }

  return nextDate.getTime();
};

// Fire web notification (web platform only)
export const fireNotification = (
  streakName: string,
  streakEmoji: string,
  description: string
): void => {
  if (isNativePlatform()) {
    return; // Native notifications are handled by notificationService
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = `${streakEmoji} Time for ${streakName}`;
  const options: NotificationOptions = {
    body: description || 'Keep your streak going!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `streak-${streakName}`,
    requireInteraction: false,
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options,
    });
  } else if ('Notification' in window) {
    new Notification(title, options);
  }
};

// Schedule reminder - only for web platform
// Android reminders are handled by notificationService.scheduleNotifications()
export const scheduleReminder = (
  streakId: string,
  streakName: string,
  streakEmoji: string,
  reminder: Reminder,
  onFire: () => void
): void => {
  if (!reminder.enabled) {
    return;
  }

  if (!getGlobalNotificationsEnabled()) {
    return;
  }

  if (isAndroid()) {
    // Android notifications are handled by notificationService
    // This function is only for web platform timers
    return;
  }

  const existingTimeout = scheduledReminders.get(streakId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const nextFireTime = calculateNextReminderTime(reminder.time, reminder.repeatDays);
  const delay = nextFireTime - Date.now();

  if (delay < 0) {
    const nextNextFireTime = calculateNextReminderTime(
      reminder.time,
      reminder.repeatDays
    );
    const nextDelay = nextNextFireTime - Date.now();
    
    const timeoutId = setTimeout(() => {
      fireNotification(streakName, streakEmoji, reminder.description);
      onFire();
      scheduleReminder(streakId, streakName, streakEmoji, reminder, onFire);
    }, nextDelay);

    scheduledReminders.set(streakId, timeoutId);
    return;
  }

  const timeoutId = setTimeout(() => {
    fireNotification(streakName, streakEmoji, reminder.description);
    onFire();
    scheduleReminder(streakId, streakName, streakEmoji, reminder, onFire);
  }, delay);

  scheduledReminders.set(streakId, timeoutId);
};

// Unschedule reminder
export const unscheduleReminder = (streakId: string): void => {
  if (isAndroid()) {
    // Cancel via Capacitor
    void cancelNativeNotificationsForStreak(streakId);
    return;
  }

  const timeoutId = scheduledReminders.get(streakId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledReminders.delete(streakId);
  }
};

// Save reminder to localStorage
export const saveReminder = (streakId: string, reminder: Reminder): void => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  reminders[streakId] = reminder;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  if (isDev) {
    console.log('[Reminder] Saved reminder for streak:', streakId);
  }
};

// Get reminder from localStorage
export const getReminder = (streakId: string): Reminder | null => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  return reminders[streakId] || null;
};

// Delete reminder from localStorage
export const deleteReminder = (streakId: string): void => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  delete reminders[streakId];
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  unscheduleReminder(streakId);
  if (isDev) {
    console.log('[Reminder] Deleted reminder for streak:', streakId);
  }
};

// Initialize all reminders (web platform only)
export const initializeAllReminders = (
  streaks: Array<{
    id: string;
    name: string;
    emoji: string;
  }>,
  onReminderFire: (streakId: string) => void
): void => {
  if (isAndroid()) {
    // Android reminders are initialized by notificationService
    return;
  }

  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );

  streaks.forEach((streak) => {
    const reminder = reminders[streak.id];
    if (reminder && reminder.enabled) {
      scheduleReminder(
        streak.id,
        streak.name,
        streak.emoji,
        reminder,
        () => onReminderFire(streak.id)
      );
    }
  });
};

// Clear all reminders
export const clearAllReminders = (): void => {
  // Cancel web platform timers
  scheduledReminders.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  scheduledReminders.clear();

  // Note: Android notifications are cancelled by notificationService
  if (isDev) {
    console.log('[Reminder] Cleared all reminders');
  }
};

