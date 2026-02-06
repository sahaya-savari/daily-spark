import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { Streak } from '@/types/streak';
import { Reminder } from '@/types/reminder';

const NOTIFICATION_STORAGE_KEY = 'streakflame_notifications';
const REMINDERS_KEY = 'streakflame_reminders';
const PERMISSION_CACHE_KEY = 'streakflame_notification_permission';
const isDev = import.meta.env.DEV;

export interface NotificationSettings {
  enabled: boolean;
  defaultTime: string; // HH:MM format
  respectDND: boolean;
  preTaskReminderOffsetMinutes: number; // Minutes before scheduled task time
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

/**
 * Ensure Android notification channel exists
 * CRITICAL: Must be called at app startup, NOT during render
 * Safe to call multiple times (idempotent)
 */
export const ensureAndroidChannel = async (): Promise<void> => {
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
    if (isDev) {
      console.log('[Notification] Android channel created');
    }
  } catch (error) {
    console.error('[Notification] Channel creation failed:', error);
    // Fail silently - don't crash the app
  }
};

/**
 * Initialize notification system at app startup
 * MUST be called in App.tsx useEffect, never during render
 */
export const initializeNotificationChannels = async (): Promise<void> => {
  try {
    await ensureAndroidChannel();
  } catch (error) {
    console.error('[Notification] Initialization failed:', error);
    // Fail silently - don't crash the app
  }
};

const getCachedPermissionState = (): NotificationPermissionState | null => {
  try {
    const stored = localStorage.getItem(PERMISSION_CACHE_KEY);
    if (stored === 'granted' || stored === 'denied' || stored === 'prompt' || stored === 'unsupported') {
      return stored;
    }
  } catch (error) {
    console.error('[Notification] Failed to read permission cache:', error);
  }
  return null;
};

const setCachedPermissionState = (state: NotificationPermissionState): void => {
  try {
    localStorage.setItem(PERMISSION_CACHE_KEY, state);
  } catch (error) {
    console.error('[Notification] Failed to write permission cache:', error);
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

const parseScheduledTime = (time: string): { hour: number; minute: number } | null => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return null;
  }
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = parseInt(hourRaw, 10);
  const minute = parseInt(minuteRaw, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
};

const getPreTaskTime = (time: string, offsetMinutes: number): { hour: number; minute: number } | null => {
  if (offsetMinutes <= 0) {
    return null;
  }
  const parsed = parseScheduledTime(time);
  if (!parsed) {
    return null;
  }
  const scheduledMinutes = parsed.hour * 60 + parsed.minute;
  const reminderMinutes = scheduledMinutes - offsetMinutes;
  if (reminderMinutes < 0) {
    return null;
  }
  return {
    hour: Math.floor(reminderMinutes / 60),
    minute: reminderMinutes % 60,
  };
};

const buildLocalDateTime = (dateString: string, hour: number, minute: number): Date | null => {
  if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = dateString.split('-');
  const year = parseInt(yearRaw, 10);
  const month = parseInt(monthRaw, 10);
  const day = parseInt(dayRaw, 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  return new Date(year, month - 1, day, hour, minute, 0, 0);
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
// ASYNC-SAFE: Never blocks UI thread, always wrapped in try-catch
export const checkNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  try {
    // Ensure channel exists before checking permission (Android only)
    if (isAndroid()) {
      await ensureAndroidChannel();
    }

    if (isAndroid()) {
      const cached = getCachedPermissionState();
      const permission = cached ?? 'prompt';
      if (isDev) {
        console.log('[Notification] Permission check (android cached):', permission);
      }
      return { supported: true, permission, platform: getPlatform() };
    }

    if (isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      const permission = (status.display ?? 'prompt') as NotificationPermissionState;
      if (isDev) {
        console.log('[Notification] Permission check (native):', permission);
      }
      return { supported: true, permission, platform: getPlatform() };
    }

    // Web platform
    if (!('Notification' in window)) {
      return { supported: false, permission: 'unsupported', platform: getPlatform() };
    }

    const permission = Notification.permission === 'default' ? 'prompt' : Notification.permission;
    if (isDev) {
      console.log('[Notification] Permission check (web):', permission);
    }
    return { supported: true, permission, platform: getPlatform() };
  } catch (error) {
    console.error('[Notification] Permission check failed:', error);
    // Fail silently - return safe default
    return { supported: false, permission: 'denied', platform: getPlatform() };
  }
};

// CORE FUNCTION: Request notification permission from user
// ASYNC-SAFE: Never blocks UI thread, properly initializes channel first
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    // Ensure channel exists BEFORE requesting permission (critical for Android)
    await ensureAndroidChannel();

    if (isAndroid()) {
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      setCachedPermissionState(granted ? 'granted' : 'denied');
      if (isDev) {
        console.log('[Notification] Permission request result (Android):', granted ? 'granted' : 'denied');
      }
      return granted;
    }

    if (isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      setCachedPermissionState(granted ? 'granted' : 'denied');
      if (isDev) {
        console.log('[Notification] Permission request result (native):', granted ? 'granted' : 'denied');
      }
      return granted;
    }

    // Web platform
    if (!('Notification' in window)) {
      if (isDev) {
        console.log('[Notification] Web notifications not supported');
      }
      return false;
    }

    if (Notification.permission === 'granted') {
      if (isDev) {
        console.log('[Notification] Already granted (web)');
      }
      return true;
    }

    if (Notification.permission === 'denied') {
      if (isDev) {
        console.log('[Notification] Already denied (web)');
      }
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    if (isDev) {
      console.log('[Notification] Permission request result (web):', granted ? 'granted' : 'denied');
    }
    return granted;
  } catch (error) {
    console.error('[Notification] Permission request error:', error);
    // Fail silently - return false instead of crashing
    return false;
  }
};

// Get stored notification settings
export const getNotificationSettings = (): NotificationSettings => {
  const defaults: NotificationSettings = {
    enabled: false,
    defaultTime: '20:00',
    respectDND: true,
    preTaskReminderOffsetMinutes: 5,
  };

  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<NotificationSettings>;
      return {
        ...defaults,
        ...parsed,
        preTaskReminderOffsetMinutes:
          typeof parsed.preTaskReminderOffsetMinutes === 'number'
            ? parsed.preTaskReminderOffsetMinutes
            : defaults.preTaskReminderOffsetMinutes,
      };
    }
  } catch (e) {
    console.error('[Notification] Failed to load settings:', e);
  }
  return defaults;
};

// Save notification settings
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
    if (isDev) {
      console.log('[Notification] Settings saved:', settings);
    }
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
    if (isDev) {
      console.log('[Notification] Notifications disabled in settings');
    }
    return;
  }

  if (!isAndroid()) {
    if (isDev) {
      console.log('[Notification] Not Android, skipping native scheduling');
    }
    return;
  }

  try {
    await ensureAndroidChannel();

    const cachedPermission = getCachedPermissionState();
    if (cachedPermission && cachedPermission !== 'granted') {
      if (isDev) {
        console.log('[Notification] Permission not granted, cannot schedule');
      }
      return;
    }

    // First, cancel all pending notifications
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        if (isDev) {
          console.log('[Notification] Cancelling', pending.notifications.length, 'pending notifications');
        }
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id }))
        });
      }
    } catch (e) {
      console.error('[Notification] Failed to cancel existing notifications:', e);
    }

    // Schedule new notifications for each enabled streak reminder
    const notificationsToSchedule: LocalNotificationSchema[] = [];
    const preTaskOffsetMinutes = settings.preTaskReminderOffsetMinutes ?? 5;

    streaks.forEach(streak => {
      const reminder = getReminder(streak.id);
      let canScheduleReminder = Boolean(reminder && reminder.enabled);

      if (canScheduleReminder) {
        if (!reminder?.time || typeof reminder.time !== 'string' || !reminder.time.includes(':')) {
          console.error('[Notification] Invalid time format for streak:', streak.id, reminder?.time);
          canScheduleReminder = false;
        } else {
          const parts = reminder.time.split(':');
          const hour = parseInt(parts[0], 10);
          const minute = parseInt(parts[1], 10);

          if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            console.error('[Notification] Invalid time values for streak:', streak.id, { hour, minute });
            canScheduleReminder = false;
          } else {
            const baseId = getNotificationIdBase(streak.id);
            const title = `${streak.emoji} ${streak.name}`;
            const body = reminder.description || `Time to complete "${streak.name}". Keep your streak going!`;

            // Handle repeat days
            if (reminder.repeatType === 'custom') {
              if (!Array.isArray(reminder.repeatDays) || reminder.repeatDays.length !== 7) {
                console.error('[Notification] Invalid repeatDays array for streak:', streak.id, reminder.repeatDays);
                canScheduleReminder = false;
              } else {
                reminder.repeatDays.forEach((isEnabled, dayIndex) => {
                  if (isEnabled === true) {
                    notificationsToSchedule.push({
                      id: baseId + dayIndex + 1,
                      title,
                      body,
                      smallIcon: 'ic_notification_icon',
                      channelId: 'daily-reminders',
                      schedule: {
                        on: {
                          weekday: dayIndex + 1,
                          hour,
                          minute,
                        },
                        repeats: true,
                      },
                      extra: { streakId: streak.id },
                    });
                  }
                });
              }
            } else {
              notificationsToSchedule.push({
                id: baseId,
                title,
                body,
                smallIcon: 'ic_notification_icon',
                channelId: 'daily-reminders',
                schedule: {
                  on: { hour, minute },
                  repeats: true,
                },
                extra: { streakId: streak.id },
              });
            }
          }
        }
      }

      // Pre-task reminder for scheduled time (optional, global setting)
      if (preTaskOffsetMinutes > 0 && streak.scheduledTime) {
        const preTaskTime = getPreTaskTime(streak.scheduledTime, preTaskOffsetMinutes);
        if (!preTaskTime) {
          return;
        }

        const preTaskBaseId = getNotificationIdBase(`${streak.id}-pre`);
        const minutesLabel = `${preTaskOffsetMinutes} minute${preTaskOffsetMinutes === 1 ? '' : 's'}`;
        const preTaskTitle = 'Upcoming Task';
        const preTaskBody = `You have a task scheduled in ${minutesLabel}`;

        if (streak.scheduledDate) {
          const scheduledAt = buildLocalDateTime(streak.scheduledDate, preTaskTime.hour, preTaskTime.minute);
          if (!scheduledAt || scheduledAt.getTime() <= Date.now()) {
            return;
          }
          notificationsToSchedule.push({
            id: preTaskBaseId,
            title: preTaskTitle,
            body: preTaskBody,
            smallIcon: 'ic_notification_icon',
            channelId: 'daily-reminders',
            schedule: { at: scheduledAt },
            extra: { streakId: streak.id, type: 'pre-task' },
          });
          return;
        }

        notificationsToSchedule.push({
          id: preTaskBaseId,
          title: preTaskTitle,
          body: preTaskBody,
          smallIcon: 'ic_notification_icon',
          channelId: 'daily-reminders',
          schedule: {
            on: { hour: preTaskTime.hour, minute: preTaskTime.minute },
            repeats: true,
          },
          extra: { streakId: streak.id, type: 'pre-task' },
        });
      }
    });

    if (notificationsToSchedule.length > 0) {
      if (isDev) {
        console.log('[Notification] Scheduling', notificationsToSchedule.length, 'notifications');
      }
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
      if (isDev) {
        console.log('[Notification] Successfully scheduled notifications');
      }
    } else {
      if (isDev) {
        console.log('[Notification] No reminders to schedule');
      }
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

    if (isDev) {
      console.log('[Notification] Cancelling', toCancel.length, 'notifications' + (streakId ? ` for streak ${streakId}` : ''));
    }
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
  if (isDev) {
    console.log('[Notification] Enable notifications called');
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    if (isDev) {
      console.log('[Notification] Permission denied, cannot enable');
    }
    return false;
  }

  const nextSettings: NotificationSettings = { ...settings, enabled: true };
  saveNotificationSettings(nextSettings);

  if (isDev) {
    console.log('[Notification] Permission granted, scheduling notifications');
  }
  await scheduleNotifications(streaks, nextSettings);

  return true;
};

// CORE FUNCTION: Disable notifications
export const disableNotifications = async (): Promise<void> => {
  if (isDev) {
    console.log('[Notification] Disable notifications called');
  }
  const settings = getNotificationSettings();
  settings.enabled = false;
  saveNotificationSettings(settings);
  await cancelNotifications();
};

// Get notification status for UI display
export const getNotificationStatus = async (): Promise<NotificationPermissionStatus> => {
  return checkNotificationPermission();
};
