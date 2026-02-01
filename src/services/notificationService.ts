import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Streak } from '@/types/streak';
import { Reminder } from '@/types/reminder';

const NOTIFICATION_STORAGE_KEY = 'streakflame_notifications';
const REMINDERS_KEY = 'streakflame_reminders';

export interface NotificationSettings {
  enabled: boolean;
  defaultTime: string; // HH:MM format
  respectDND: boolean;
}

export type NotificationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface NotificationPermissionStatus {
  supported: boolean;
  permission: NotificationPermissionState;
  platform: string;
}

const getPlatform = () => Capacitor.getPlatform();
const isAndroid = () => getPlatform() === 'android';
const isNativePlatform = () => getPlatform() !== 'web';

let channelInitialized = false;

// Ensure Android notification channel exists
const ensureAndroidChannel = async (): Promise<void> => {
  if (!isAndroid() || channelInitialized) {
    return;
  }

  try {
    await LocalNotifications.createChannel({
      id: 'daily-reminders',
      name: 'Daily Reminders',
      description: 'Daily Spark reminder notifications',
      importance: 4,
      visibility: 1,
      sound: 'default',
    });
    channelInitialized = true;
    console.log('[Notification] Android channel created');
  } catch (error) {
    console.error('[Notification] Channel creation failed:', error);
  }
};

// Parse time string (HH:MM) to hour and minute
const parseTime = (time: string): { hour: number; minute: number } => {
  const [hour, minute] = time.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return { hour: 20, minute: 0 };
  }
  return { hour, minute };
};

// Get notification ID base from streak ID (deterministic hash)
const getNotificationIdBase = (streakId: string): number => {
  let hash = 0;
  for (let i = 0; i < streakId.length; i += 1) {
    hash = ((hash << 5) - hash) + streakId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000000;
};

// CORE FUNCTION: Check Android notification permission status
export const checkNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  try {
    if (isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      const permission = (status.display ?? 'prompt') as NotificationPermissionState;
      console.log('[Notification] Permission check (native):', permission);
      return { supported: true, permission, platform: getPlatform() };
    }

    // Web platform
    if (!('Notification' in window)) {
      return { supported: false, permission: 'unsupported', platform: getPlatform() };
    }

    const permission = Notification.permission === 'default' ? 'prompt' : Notification.permission;
    console.log('[Notification] Permission check (web):', permission);
    return { supported: true, permission, platform: getPlatform() };
  } catch (error) {
    console.error('[Notification] Permission check failed:', error);
    return { supported: false, permission: 'unsupported', platform: getPlatform() };
  }
};

// CORE FUNCTION: Request notification permission from user
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (isAndroid()) {
      // Android native: request POST_NOTIFICATIONS permission
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      console.log('[Notification] Permission request result (Android):', granted ? 'granted' : 'denied');
      return granted;
    }

    if (isNativePlatform()) {
      // Other native platforms
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      console.log('[Notification] Permission request result (native):', granted ? 'granted' : 'denied');
      return granted;
    }

    // Web platform
    if (!('Notification' in window)) {
      console.log('[Notification] Web notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('[Notification] Already granted (web)');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('[Notification] Already denied (web)');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    console.log('[Notification] Permission request result (web):', granted ? 'granted' : 'denied');
    return granted;
  } catch (error) {
    console.error('[Notification] Permission request error:', error);
    return false;
  }
};

// Get stored notification settings
export const getNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[Notification] Failed to load settings:', e);
  }
  return {
    enabled: false,
    defaultTime: '20:00',
    respectDND: true,
  };
};

// Save notification settings
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
    console.log('[Notification] Settings saved:', settings);
  } catch (e) {
    console.error('[Notification] Failed to save settings:', e);
  }
};

// Get reminder for a streak
const getReminder = (streakId: string): Reminder | null => {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    if (!stored) return null;
    const reminders = JSON.parse(stored) as Record<string, Reminder>;
    return reminders[streakId] || null;
  } catch (e) {
    return null;
  }
};

// CORE FUNCTION: Schedule all notifications for Android
export const scheduleNotifications = async (
  streaks: Streak[],
  settings: NotificationSettings
): Promise<void> => {
  if (!settings.enabled) {
    console.log('[Notification] Notifications disabled in settings');
    return;
  }

  if (!isAndroid()) {
    console.log('[Notification] Not Android, skipping native scheduling');
    return;
  }

  try {
    // Check permission
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      console.log('[Notification] Permission not granted, cannot schedule');
      return;
    }

    await ensureAndroidChannel();

    // First, cancel all pending notifications
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        console.log('[Notification] Cancelling', pending.notifications.length, 'pending notifications');
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id }))
        });
      }
    } catch (e) {
      console.error('[Notification] Failed to cancel existing notifications:', e);
    }

    // Schedule new notifications for each enabled streak reminder
    const notificationsToSchedule: any[] = [];

    streaks.forEach(streak => {
      const reminder = getReminder(streak.id);
      if (!reminder || !reminder.enabled) {
        return;
      }

      const [hour, minute] = reminder.time.split(':').map(Number);
      const baseId = getNotificationIdBase(streak.id);
      const title = `${streak.emoji} ${streak.name}`;
      const body = reminder.description || `Time to complete "${streak.name}". Keep your streak going!`;

      // Handle repeat days
      if (reminder.repeatType === 'custom') {
        // Schedule individual notifications for each enabled day
        reminder.repeatDays.forEach((isEnabled, dayIndex) => {
          if (isEnabled) {
            notificationsToSchedule.push({
              id: baseId + dayIndex + 1,
              title,
              body,
              channelId: 'daily-reminders',
              schedule: {
                on: {
                  weekday: dayIndex + 1, // 1=Sunday, 2=Monday, ..., 7=Saturday
                  hour,
                  minute,
                },
                repeats: true,
              },
              extra: { streakId: streak.id },
            });
          }
        });
      } else {
        // Daily repeat
        notificationsToSchedule.push({
          id: baseId,
          title,
          body,
          channelId: 'daily-reminders',
          schedule: {
            on: { hour, minute },
            repeats: true,
          },
          extra: { streakId: streak.id },
        });
      }
    });

    if (notificationsToSchedule.length > 0) {
      console.log('[Notification] Scheduling', notificationsToSchedule.length, 'notifications');
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
      console.log('[Notification] Successfully scheduled notifications');
    } else {
      console.log('[Notification] No reminders to schedule');
    }
  } catch (error) {
    console.error('[Notification] Failed to schedule notifications:', error);
  }
};

// CORE FUNCTION: Cancel all notifications for a streak
export const cancelNotifications = async (streakId?: string): Promise<void> => {
  if (!isAndroid()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    
    let toCancel = pending.notifications;
    if (streakId) {
      toCancel = toCancel.filter(n => n.extra?.streakId === streakId);
    }

    if (toCancel.length === 0) {
      return;
    }

    console.log('[Notification] Cancelling', toCancel.length, 'notifications' + (streakId ? ` for streak ${streakId}` : ''));
    await LocalNotifications.cancel({
      notifications: toCancel.map(n => ({ id: n.id }))
    });
  } catch (error) {
    console.error('[Notification] Failed to cancel notifications:', error);
  }
};

// CORE FUNCTION: Enable notifications (with permission request + immediate scheduling)
export const enableNotifications = async (
  streaks: Streak[],
  settings: NotificationSettings
): Promise<boolean> => {
  console.log('[Notification] Enable notifications called');

  // Step 1: Request permission
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.log('[Notification] Permission denied, cannot enable');
    return false;
  }

  // Step 2: Update settings
  const nextSettings: NotificationSettings = { ...settings, enabled: true };
  saveNotificationSettings(nextSettings);

  // Step 3: Schedule notifications immediately
  console.log('[Notification] Permission granted, scheduling notifications');
  await scheduleNotifications(streaks, nextSettings);

  return true;
};

// CORE FUNCTION: Disable notifications
export const disableNotifications = async (): Promise<void> => {
  console.log('[Notification] Disable notifications called');
  const settings = getNotificationSettings();
  settings.enabled = false;
  saveNotificationSettings(settings);
  await cancelNotifications();
};

// Get notification status for UI display
export const getNotificationStatus = async (): Promise<NotificationPermissionStatus> => {
  return checkNotificationPermission();
};
