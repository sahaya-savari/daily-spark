import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import type { Habit, HabitSettings } from "./types";

export const NOTIFICATION_CHANNEL_ID = "daily_spark_reminders";
export const HABIT_NOTIFICATION_ID_START = 1000;
const HABIT_NOTIFICATION_ID_END = 1999;

export function subtractReminderOffset(hour: number, minute: number, offsetMinutes: number): { hour: number; minute: number } {
  const safeOffset = Math.max(0, Math.min(120, offsetMinutes));
  const total = hour * 60 + minute - safeOffset;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hour: Math.floor(normalized / 60), minute: normalized % 60 };
}

/**
 * Initializes the Android notification channel at app startup.
 * Fails silently if permissions are missing or when running on web.
 */
export async function initNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: "Daily Spark Reminders",
      description: "Gentle daily habit reminders",
      importance: 3, // Default importance
      visibility: 1, // Public on lockscreen
      vibration: true,
    });
  } catch (err) {
    console.warn("[reminders] Channel creation skipped or failed:", err);
  }
}

/**
 * Requests notification permissions safely without crashing.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === "granted") return true;
    const request = await LocalNotifications.requestPermissions();
    return request.display === "granted";
  } catch (err) {
    console.warn("[reminders] Permission request failed:", err);
    return false;
  }
}

/**
 * Schedules daily reminders for active habits that have reminders enabled.
 */
export async function scheduleHabitReminders(habits: Habit[], settings: HabitSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    const habitNotifications = pending.notifications.filter(
      (notification) =>
        notification.id >= HABIT_NOTIFICATION_ID_START &&
        notification.id <= HABIT_NOTIFICATION_ID_END,
    );
    if (habitNotifications.length > 0) {
      await LocalNotifications.cancel({ notifications: habitNotifications });
    }
    if (!settings.enabled) {
      return;
    }

    const eligible = habits.filter((h) => !h.archivedAt && (h.reminderEnabled ?? true));
    const notifications: LocalNotificationSchema[] = [];

    for (const [index, habit] of eligible.entries()) {
      const timeStr = habit.reminderTime || settings.defaultTime || "20:00";
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        console.warn(`[reminders] Skipping invalid reminder time for habit ${habit.id}: ${timeStr}`);
        continue;
      }

      notifications.push({
        id: HABIT_NOTIFICATION_ID_START + index,
        title: `${habit.emoji || "🌱"} Daily Spark`,
        body: `Time for your daily ${habit.name}. One small check-in today!`,
        channelId: NOTIFICATION_CHANNEL_ID,
        schedule: {
          on: { hour: hours, minute: minutes },
          allowWhileIdle: settings.respectDND ? false : true,
        },
        smallIcon: "ic_notification_icon",
      });

      const offsetMinutes = Math.max(0, Math.min(120, settings.preTaskReminderOffsetMinutes ?? 0));
      if (offsetMinutes > 0) {
        const preTime = subtractReminderOffset(hours, minutes, offsetMinutes);
        notifications.push({
          id: 1500 + index,
          title: `${habit.emoji || "🌱"} Upcoming habit`,
          body: `${habit.name} starts in ${offsetMinutes} minutes.`,
          channelId: NOTIFICATION_CHANNEL_ID,
          schedule: {
            on: {
              hour: preTime.hour,
              minute: preTime.minute,
            },
            allowWhileIdle: settings.respectDND ? false : true,
          },
          smallIcon: "ic_notification_icon",
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (err) {
    console.error("[reminders] Scheduling failed:", err);
  }
}

export async function reconcileNativeReminders(
  habits: Habit[],
  settings: HabitSettings,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await initNotificationChannel();
  await scheduleHabitReminders(habits, settings);
}

export async function sendTestHabitNotification(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await initNotificationChannel();
  await LocalNotifications.schedule({
    notifications: [{
      id: 2000,
      title: "Daily Spark test reminder",
      body: "Notifications are working. Your reminder is ready.",
      channelId: NOTIFICATION_CHANNEL_ID,
      schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true },
      smallIcon: "ic_notification_icon",
    }],
  });
  return true;
}
