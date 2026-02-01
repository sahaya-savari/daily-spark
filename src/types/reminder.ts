export interface Reminder {
  enabled: boolean;
  time: string;
  repeatType: 'daily' | 'custom';
  repeatDays: boolean[];
  description: string;
}

export interface ScheduledReminder {
  streakId: string;
  streakName: string;
  streakEmoji: string;
  description: string;
  nextFireTime: number;
  timeoutId: NodeJS.Timeout | null;
  isSnoozed?: boolean;
}

export type SnoozeOption = '30min' | '1hour' | 'tomorrow' | 'custom';
