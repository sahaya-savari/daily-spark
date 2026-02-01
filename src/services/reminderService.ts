import { Reminder } from '@/types/reminder';

const REMINDERS_KEY = 'streakflame_reminders';
const REMINDER_PERMISSION_KEY = 'streakflame_reminder_permission_requested';

let scheduledReminders = new Map<string, NodeJS.Timeout>();

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const hasNotificationPermission = (): boolean => {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

export const calculateNextReminderTime = (
  time: string,
  repeatDays: boolean[]
): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  
  let nextDate = new Date();
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

export const fireNotification = (
  streakName: string,
  streakEmoji: string,
  description: string
): void => {
  if (!hasNotificationPermission()) {
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

export const unscheduleReminder = (streakId: string): void => {
  const timeoutId = scheduledReminders.get(streakId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledReminders.delete(streakId);
  }
};

export const saveReminder = (streakId: string, reminder: Reminder): void => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  reminders[streakId] = reminder;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const getReminder = (streakId: string): Reminder | null => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  return reminders[streakId] || null;
};

export const deleteReminder = (streakId: string): void => {
  const reminders: Record<string, Reminder> = JSON.parse(
    localStorage.getItem(REMINDERS_KEY) || '{}'
  );
  delete reminders[streakId];
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  unscheduleReminder(streakId);
};

export const initializeAllReminders = (
  streaks: Array<{
    id: string;
    name: string;
    emoji: string;
    currentStreak?: number;
  }>,
  onReminderFire: (streakId: string) => void
): void => {
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

export const clearAllReminders = (): void => {
  scheduledReminders.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  scheduledReminders.clear();
};
