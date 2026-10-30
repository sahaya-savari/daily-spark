/** Local-calendar date helpers. All day keys are YYYY-MM-DD in local time. */

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y = 1970, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns YYYY-MM-DD for the given timestamp taking into account configurable rolloverHour.
 * If now.getHours() < rolloverHour (e.g. 01:30 AM with rollover at 3:00 AM), shifts date back 24h.
 */
export function todayKey(now: Date = new Date(), rolloverHour: number = 0): string {
  if (rolloverHour > 0 && now.getHours() < rolloverHour) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return toKey(d);
  }
  return toKey(now);
}

export function calculateRolloverTodayKey(now: Date = new Date(), rolloverHour: number = 0): string {
  return todayKey(now, rolloverHour);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function isValidKey(key: unknown): key is string {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const d = fromKey(key);
  return toKey(d) === key;
}

/** Last `n` day keys ending at `end` (inclusive), oldest first. */
export function lastNDays(end: string, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

export function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatShort(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatDisplayDate(key: string): string {
  return formatLong(key);
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function addMonths(d: Date, n: number): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + n);
  return next;
}

/**
 * Builds a 7-column calendar matrix (Mon..Sun) of YYYY-MM-DD keys or null.
 */
export function monthMatrix(d: Date): (string | null)[][] {
  const y = d.getFullYear();
  const m = d.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  // 0=Sun..6=Sat, we want Mon=0..Sun=6
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(y, m, day);
    currentWeek.push(toKey(curDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

