import { Reminder } from '@/types/reminder';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getRepeatModeDisplay = (reminder: Reminder | undefined): string => {
  if (!reminder || !reminder.enabled) {
    return 'No reminder';
  }

  if (reminder.repeatType === 'daily') {
    return 'Daily';
  }

  const activeDays = reminder.repeatDays
    .map((isActive, index) => isActive ? dayLabels[index] : null)
    .filter(Boolean);

  if (activeDays.length === 7) {
    return 'Every day';
  }

  if (activeDays.length === 5 && reminder.repeatDays[1] && reminder.repeatDays[2] && reminder.repeatDays[3] && reminder.repeatDays[4] && reminder.repeatDays[5]) {
    return 'Weekdays';
  }

  if (activeDays.length === 2 && reminder.repeatDays[0] && reminder.repeatDays[6]) {
    return 'Weekends';
  }

  if (activeDays.length > 0 && activeDays.length <= 3) {
    return activeDays.join(', ');
  }

  if (activeDays.length > 3) {
    return `${activeDays.slice(0, 3).join(', ')}...`;
  }

  return 'Custom';
};

export const getNextReminderTime = (reminder: Reminder | undefined): { date: string; time: string } | null => {
  if (!reminder || !reminder.enabled) {
    return null;
  }

  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);

  const nextDate = new Date(now);
  nextDate.setHours(hours, minutes, 0, 0);

  if (nextDate <= now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  const dayOfWeek = nextDate.getDay();

  if (reminder.repeatDays[dayOfWeek]) {
    return formatReminderDateTime(nextDate, reminder.time);
  }

  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(nextDate);
    checkDate.setDate(checkDate.getDate() + i);
    const checkDay = checkDate.getDay();

    if (reminder.repeatDays[checkDay]) {
      checkDate.setHours(hours, minutes, 0, 0);
      return formatReminderDateTime(checkDate, reminder.time);
    }
  }

  return null;
};

const formatReminderDateTime = (date: Date, timeString: string): { date: string; time: string } => {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeStr = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;

  return { date: dateStr, time: timeStr };
};

export const isReminderToday = (reminder: Reminder | undefined): boolean => {
  if (!reminder || !reminder.enabled) {
    return false;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();

  return reminder.repeatDays[dayOfWeek];
};
