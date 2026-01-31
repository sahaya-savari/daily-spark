/**
 * Centralized date utilities for the Daily Spark app.
 * 
 * CRITICAL: All date strings MUST use local timezone, never UTC.
 * Format: YYYY-MM-DD (ISO 8601 date-only format)
 * 
 * Why: Using toISOString() causes bugs around midnight because it returns UTC time,
 * which may be a different calendar day than the user's local time.
 * 
 * Example bug scenario:
 * - User's local time: 2026-01-31 23:30 (PST, UTC-8)
 * - UTC time: 2026-02-01 07:30
 * - toISOString() returns "2026-02-01..." ❌ WRONG DAY
 * - formatLocalDate() returns "2026-01-31" ✅ CORRECT
 */

/**
 * Format a Date object as YYYY-MM-DD in LOCAL timezone.
 * This is the canonical date string format for the entire app.
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format (local timezone).
 */
export const getTodayDate = (): string => {
  return formatLocalDate(new Date());
};

/**
 * Get yesterday's date in YYYY-MM-DD format (local timezone).
 */
export const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatLocalDate(yesterday);
};

/**
 * Get a date N days ago in YYYY-MM-DD format (local timezone).
 */
export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatLocalDate(date);
};

/**
 * Check if a date string is today.
 */
export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  return dateString === getTodayDate();
};

/**
 * Check if a date string is yesterday.
 */
export const isYesterday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  return dateString === getYesterdayDate();
};

/**
 * Compare two date strings (YYYY-MM-DD format).
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export const compareDateStrings = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

/**
 * Check if a date string is before another.
 */
export const isDateBefore = (date: string, compareDate: string): boolean => {
  return date < compareDate;
};

/**
 * Check if a date string is after another.
 */
export const isDateAfter = (date: string, compareDate: string): boolean => {
  return date > compareDate;
};

/**
 * Check if a date string is between two dates (inclusive).
 */
export const isDateBetween = (date: string, start: string, end: string): boolean => {
  return date >= start && date <= end;
};
