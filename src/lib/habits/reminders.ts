import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import type { Habit, HabitSettings } from "./types";

export const NOTIFICATION_CHANNEL_ID = "daily_spark_reminders";

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
  if (!settings.enabled) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    // Clear previously scheduled notifications before rescheduling
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const eligible = habits.filter((h) => !h.archivedAt && (h.reminderEnabled ?? true));
    const notifications: LocalNotificationSchema[] = [];

    let notifId = 1000;
    for (const habit of eligible) {
      const timeStr = habit.reminderTime || settings.defaultTime || "20:00";
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (isNaN(hours ?? NaN) || isNaN(minutes ?? NaN)) continue;

      notifications.push({
        id: notifId++,
        title: `${habit.emoji || "🌱"} Daily Spark`,
        body: `Time for your daily ${habit.name}. One small check-in today!`,
        channelId: NOTIFICATION_CHANNEL_ID,
        schedule: {
          on: {
            hour: hours,
            minute: minutes,
          },
          allowWhileIdle: settings.respectDND ? false : true,
        },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (err) {
    console.warn("[reminders] Scheduling failed safely:", err);
  }
}
