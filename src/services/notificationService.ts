import { Streak } from '@/types/streak';
import { getTodayDate, isToday } from '@/lib/dateUtils';

const NOTIFICATION_STORAGE_KEY = 'streakflame_notifications';
const SENT_REMINDERS_KEY = 'streakflame_sent_reminders';

export interface NotificationSettings {
  enabled: boolean;
  defaultTime: string; // HH:MM format
  respectDND: boolean;
}

interface ScheduledNotification {
  streakId: string;
  scheduledTime: string; // ISO string
  reminderTime: string; // HH:MM format
}

interface SentReminder {
  streakId: string;
  date: string; // YYYY-MM-DD
  sentAt: string; // ISO string
}

// Get stored notification settings
export const getNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Silently fail - return defaults
  }
  return {
    enabled: false,
    defaultTime: '20:00',
    respectDND: true,
  };
};

// Save notification settings
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
};

// Get sent reminders for today
const getSentReminders = (): SentReminder[] => {
  try {
    const stored = localStorage.getItem(SENT_REMINDERS_KEY);
    if (stored) {
      const reminders = JSON.parse(stored) as SentReminder[];
      // Clean up old reminders (keep only today's)
      const today = getTodayDate();
      return reminders.filter(r => r.date === today);
    }
  } catch (e) {
    // Silently fail - return empty array
  }
  return [];
};

// Mark reminder as sent
const markReminderSent = (streakId: string): void => {
  const today = getTodayDate();
  const sentReminders = getSentReminders();
  
  // Check if already sent today
  if (sentReminders.some(r => r.streakId === streakId && r.date === today)) {
    return;
  }
  
  sentReminders.push({
    streakId,
    date: today,
    sentAt: new Date().toISOString(),
  });
  
  localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(sentReminders));
};

// Check if reminder was already sent today
export const wasReminderSentToday = (streakId: string): boolean => {
  const today = getTodayDate();
  const sentReminders = getSentReminders();
  return sentReminders.some(r => r.streakId === streakId && r.date === today);
};

// Cancel pending reminder for a streak
export const cancelPendingReminder = (streakId: string): void => {
  // In a real implementation, this would cancel native notifications
  // For web, we just mark it as handled
  // Cancelled pending reminder for streak
};

// Check if streak needs a reminder
export const shouldSendReminder = (streak: Streak): boolean => {
  // Don't send if reminder is disabled
  if (!streak.reminderEnabled) {
    return false;
  }
  
  // Don't send if streak is paused
  if (streak.isPaused) {
    return false;
  }
  
  // Don't send if already completed today
  if (isToday(streak.lastCompletedDate)) {
    return false;
  }
  
  // Don't send if already reminded today
  if (wasReminderSentToday(streak.id)) {
    return false;
  }
  
  return true;
};

// Request notification permission (for web)
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    // Browser does not support notifications
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Send a web notification
export const sendWebNotification = (streak: Streak): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  // Check all conditions before sending
  if (!shouldSendReminder(streak)) {
    return;
  }
  
  const notification = new Notification(`Don't break your streak! ${streak.emoji}`, {
    body: `You haven't completed \"${streak.name}\" today. Keep your ${streak.currentStreak} day streak going!`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `streak-${streak.id}`, // Prevents duplicate notifications
    requireInteraction: false,
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  // Mark as sent
  markReminderSent(streak.id);
};

// Schedule notification check (runs periodically)
export const scheduleNotificationCheck = (
  streaks: Streak[],
  settings: NotificationSettings
): (() => void) => {
  if (!settings.enabled) {
    return () => {};
  }
  
  const checkAndNotify = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    streaks.forEach(streak => {
      const reminderTime = streak.reminderTime || settings.defaultTime;
      
      // Check if it's time to send reminder (within 1 minute window)
      if (currentTime === reminderTime) {
        sendWebNotification(streak);
      }
    });
  };
  
  // Check every minute
  const intervalId = setInterval(checkAndNotify, 60000);
  
  // Initial check
  checkAndNotify();
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Handle streak completion - cancel any pending reminders
export const onStreakCompleted = (streakId: string): void => {
  cancelPendingReminder(streakId);
  markReminderSent(streakId); // Prevent future reminders today
};

// Get notification status for UI display
export const getNotificationStatus = (): {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
} => {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return { supported: true, permission: Notification.permission };
};
