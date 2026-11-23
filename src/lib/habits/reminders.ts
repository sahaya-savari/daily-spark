import { todayKey } from "./dates";
import { isDoneOn, isHabitDueToday } from "./logic";
import { isNeutralOn } from "./strength";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import type { Habit, HabitSettings } from "./types";

export const NOTIFICATION_CHANNEL_ID = "daily_spark_reminders";
export const REMINDER_ACTIONS = "daily-spark-reminder";
const SNOOZE_ACTIONS = "daily-spark-snooze";
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
    await LocalNotifications.registerActionTypes({ types: [
      { id: REMINDER_ACTIONS, actions: [{ id: "done", title: "Done", foreground: true }, { id: "snooze", title: "Snooze 10 min", foreground: true }] },
      { id: SNOOZE_ACTIONS, actions: [{ id: "snooze", title: "Snooze 10 min", foreground: true }] },
    ] });
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: "Daily Spark Reminders",
      description: "Gentle daily habit reminders",
      importance: 3, // Default importance
      visibility: 0, // Private on lockscreen
      vibration: true,
    });
  } catch (err) {
    console.warn("[reminders] Channel creation skipped or failed:", err);
  }
}

/**
 * Requests notification permissions safely without crashing.
 */
export async function notificationPermissionStatus(): Promise<"granted" | "denied" | "prompt" | "unavailable"> {
  if (!Capacitor.isNativePlatform()) return "unavailable";
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display === "granted" || display === "denied" ? display : "prompt";
  } catch {
    return "unavailable";
  }
}

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

function clockMinutes(value: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export function buildReminderSchedule(habits: Habit[], settings: HabitSettings, now = new Date()): LocalNotificationSchema[] {
  if (!settings.enabled) return [];
  const quietStart = clockMinutes(settings.quietHoursStart ?? "22:00");
  const quietEnd = clockMinutes(settings.quietHoursEnd ?? "07:00");
  const inQuietHours = (at: Date) => {
    if (!settings.quietHoursEnabled || quietStart === null || quietEnd === null || quietStart === quietEnd) return false;
    const clock = at.getHours() * 60 + at.getMinutes();
    return quietStart < quietEnd ? clock >= quietStart && clock < quietEnd : clock >= quietStart || clock < quietEnd;
  };
  const offset = Math.max(0, Math.min(120, settings.preTaskReminderOffsetMinutes ?? 0));
  const candidates: Omit<LocalNotificationSchema, "id">[] = [];
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    for (const habit of habits) {
      if (habit.archivedAt || habit.isPaused || habit.reminderEnabled === false) continue;
      const minutes = clockMinutes(habit.reminderTime || settings.defaultTime || "20:00");
      if (minutes === null) continue;
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, Math.floor(minutes / 60), minutes % 60);
      const day = todayKey(at, settings.rolloverHour);
      if (day < habit.createdAt.slice(0, 10) || isNeutralOn(habit, day) || !isHabitDueToday(habit, day)) continue;
      if (settings.muteCompletedReminders && habit.kind !== "avoid" && isDoneOn(habit, day)) continue;
      for (const [trigger, isPreReminder] of [[at, false], [new Date(at.getTime() - offset * 60000), true]] as const) {
        if ((isPreReminder && offset === 0) || trigger <= now || (habit.snoozedUntil && trigger.getTime() < habit.snoozedUntil) || inQuietHours(trigger)) continue;
        candidates.push({
          title: isPreReminder ? "Upcoming habit" : "Daily Spark",
          body: isPreReminder ? `${habit.name} starts in ${offset} minutes.` : `Time for ${habit.name}.`,
          channelId: NOTIFICATION_CHANNEL_ID,
          schedule: { at: trigger, allowWhileIdle: !settings.respectDND },
          smallIcon: "ic_notification_icon",
          actionTypeId: !habit.kind || habit.kind === "boolean" ? REMINDER_ACTIONS : SNOOZE_ACTIONS,
          extra: { habitId: habit.id, day, at: trigger.getTime() },
        });
      }
    }
  }
  for (const habit of habits) {
    if (!habit.snoozedUntil || habit.archivedAt || habit.isPaused || habit.reminderEnabled === false) continue;
    const at = new Date(habit.snoozedUntil);
    if (at <= now || !Number.isFinite(at.valueOf()) || inQuietHours(at)) continue;
    const day = todayKey(at, settings.rolloverHour);
    if (!isHabitDueToday(habit, day) || isNeutralOn(habit, day)) continue;
    if (settings.muteCompletedReminders && habit.kind !== "avoid" && isDoneOn(habit, day)) continue;
    if (candidates.some((candidate) => candidate.extra?.habitId === habit.id && candidate.schedule?.at?.getTime() === at.getTime())) continue;
    candidates.push({
      title: "Daily Spark", body: `Time for ${habit.name}.`, channelId: NOTIFICATION_CHANNEL_ID,
      schedule: { at, allowWhileIdle: !settings.respectDND }, smallIcon: "ic_notification_icon",
      actionTypeId: !habit.kind || habit.kind === "boolean" ? REMINDER_ACTIONS : SNOOZE_ACTIONS,
      extra: { habitId: habit.id, day, at: at.getTime() },
    });
  }
  return candidates.sort((a, b) => a.schedule!.at!.getTime() - b.schedule!.at!.getTime())
    .slice(0, HABIT_NOTIFICATION_ID_END - HABIT_NOTIFICATION_ID_START + 1)
    .map((notification, index) => ({ ...notification, id: HABIT_NOTIFICATION_ID_START + index }));
}

// Serialize plugin calls so rapid edits cannot restore an older pending schedule.
let reminderQueue = Promise.resolve();

export function scheduleHabitReminders(habits: Habit[], settings: HabitSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const operation = reminderQueue.then(async () => {
    const pending = await LocalNotifications.getPending();
    const previous = pending.notifications.filter(({ id }) =>
      id >= HABIT_NOTIFICATION_ID_START && id <= HABIT_NOTIFICATION_ID_END);
    if (previous.length > 0) await LocalNotifications.cancel({ notifications: previous });
    if (!settings.enabled || (await LocalNotifications.checkPermissions()).display !== "granted") return;
    const notifications = buildReminderSchedule(habits, settings);
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
  });
  reminderQueue = operation.catch(() => {});
  return operation;
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
