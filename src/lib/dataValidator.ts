/**
 * Data Validation Layer for Daily Spark
 *
 * Validates imported JSON data with clear, actionable error messages.
 * Never crashes silently — all errors are logged and reported to the user.
 *
 * Philosophy:
 * - Be strict about required fields and types
 * - Be lenient about optional fields (skip them gracefully)
 * - Report what was recovered vs. what failed
 * - Never partially restore without user awareness
 */

import { Streak, StreakList } from '@/types/streak';

/**
 * Validation error with context
 */
export interface ValidationError {
  type: 'critical' | 'warning';
  message: string; // User-facing, actionable
  detail?: string; // Technical detail for logging
  rowIndex?: number; // For import lists, which row failed
  field?: string; // Which field caused the issue
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  recovered: {
    streaksLoaded: number;
    streaksSkipped: number;
  };
}

/**
 * Validate a single date string (YYYY-MM-DD format)
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  // Match YYYY-MM-DD exactly
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  // Additional check: verify it's a valid date
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Validate a single streak object
 * Returns: { valid: boolean, error?: ValidationError, cleaned?: Streak }
 */
export const validateStreak = (
  data: unknown,
  index?: number
): {
  valid: boolean;
  error?: ValidationError;
  cleaned?: Streak;
} => {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Invalid streak data at row ${index || 'unknown'}`,
        detail: `Expected object, got ${typeof data}`,
        rowIndex: index,
      },
    };
  }

  const streak = data as Record<string, unknown>;

  // ============================================================================
  // REQUIRED FIELDS
  // ============================================================================

  // ID
  if (!streak.id || typeof streak.id !== 'string' || streak.id.trim() === '') {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Missing or invalid Streak ID`,
        detail: 'Expected non-empty string for "id" field',
        rowIndex: index,
        field: 'id',
      },
    };
  }

  // Name
  if (!streak.name || typeof streak.name !== 'string' || streak.name.trim() === '') {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Missing streak name`,
        detail: 'Expected non-empty string for "name" field',
        rowIndex: index,
        field: 'name',
      },
    };
  }

  // Emoji
  if (!streak.emoji || typeof streak.emoji !== 'string' || streak.emoji.trim() === '') {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Missing emoji for "${streak.name}"`,
        detail: 'Expected non-empty string for "emoji" field',
        rowIndex: index,
        field: 'emoji',
      },
    };
  }

  // Created date
  if (!streak.createdAt) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Missing creation date for "${streak.name}"`,
        detail: 'Expected date in "createdAt" field (YYYY-MM-DD format)',
        rowIndex: index,
        field: 'createdAt',
      },
    };
  }

  if (typeof streak.createdAt !== 'string' || !isValidDateFormat(streak.createdAt)) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Invalid creation date for "${streak.name}"`,
        detail: `Got "${streak.createdAt}" — expected YYYY-MM-DD format`,
        rowIndex: index,
        field: 'createdAt',
      },
    };
  }

  // Current streak
  if (typeof streak.currentStreak !== 'number' || streak.currentStreak < 0) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Invalid current streak for "${streak.name}"`,
        detail: `Expected non-negative number, got ${streak.currentStreak}`,
        rowIndex: index,
        field: 'currentStreak',
      },
    };
  }

  // Best streak
  if (typeof streak.bestStreak !== 'number' || streak.bestStreak < 0) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Invalid best streak for "${streak.name}"`,
        detail: `Expected non-negative number, got ${streak.bestStreak}`,
        rowIndex: index,
        field: 'bestStreak',
      },
    };
  }

  // Completed dates array
  if (!Array.isArray(streak.completedDates)) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Invalid completion history for "${streak.name}"`,
        detail: 'Expected array for "completedDates" field',
        rowIndex: index,
        field: 'completedDates',
      },
    };
  }

  // ============================================================================
  // DATA INTEGRITY CHECKS
  // ============================================================================

  // Best streak must be >= current streak
  if (streak.bestStreak < streak.currentStreak) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Corrupted streak data for "${streak.name}" (bestStreak < currentStreak)`,
        detail: `Best streak (${streak.bestStreak}) should never be less than current streak (${streak.currentStreak})`,
        rowIndex: index,
        field: 'bestStreak',
      },
    };
  }

  // Last completed date validation
  let lastCompletedDate: string | null = null;
  if (streak.lastCompletedDate !== null && streak.lastCompletedDate !== undefined) {
    if (typeof streak.lastCompletedDate !== 'string') {
      return {
        valid: false,
        error: {
          type: 'critical',
          message: `Row ${index || 'unknown'}: Invalid last completed date for "${streak.name}"`,
          detail: `Expected string or null, got ${typeof streak.lastCompletedDate}`,
          rowIndex: index,
          field: 'lastCompletedDate',
        },
      };
    }

    if (!isValidDateFormat(streak.lastCompletedDate)) {
      return {
        valid: false,
        error: {
          type: 'critical',
          message: `Row ${index || 'unknown'}: Invalid last completed date format for "${streak.name}"`,
          detail: `Got "${streak.lastCompletedDate}" — expected YYYY-MM-DD format`,
          rowIndex: index,
          field: 'lastCompletedDate',
        },
      };
    }

    lastCompletedDate = streak.lastCompletedDate;
  }

  // Validate completedDates array items
  const validatedCompletedDates: string[] = [];
  const invalidDates: string[] = [];

  for (const date of streak.completedDates) {
    if (typeof date === 'string' && isValidDateFormat(date)) {
      validatedCompletedDates.push(date);
    } else {
      invalidDates.push(String(date));
    }
  }

  if (invalidDates.length > 0) {
    return {
      valid: false,
      error: {
        type: 'critical',
        message: `Row ${index || 'unknown'}: Invalid dates in completion history for "${streak.name}"`,
        detail: `Invalid date formats: ${invalidDates.slice(0, 3).join(', ')}${invalidDates.length > 3 ? '...' : ''}. Expected YYYY-MM-DD.`,
        rowIndex: index,
        field: 'completedDates',
      },
    };
  }

  // ============================================================================
  // OPTIONAL FIELDS (Graceful fallback)
  // ============================================================================

  const cleaned: Streak = {
    id: String(streak.id),
    name: String(streak.name),
    emoji: String(streak.emoji),
    createdAt: String(streak.createdAt),
    currentStreak: Number(streak.currentStreak),
    bestStreak: Number(streak.bestStreak),
    lastCompletedDate,
    completedDates: validatedCompletedDates,
    color: typeof streak.color === 'string' ? streak.color : undefined,
    notes: typeof streak.notes === 'string' ? streak.notes : undefined,
    description: typeof streak.description === 'string' ? streak.description : undefined,
    isPaused: typeof streak.isPaused === 'boolean' ? streak.isPaused : false,
    isStarred: typeof streak.isStarred === 'boolean' ? streak.isStarred : false,
    listId: typeof streak.listId === 'string' ? streak.listId : undefined,
    scheduledDate:
      typeof streak.scheduledDate === 'string' && isValidDateFormat(streak.scheduledDate)
        ? streak.scheduledDate
        : undefined,
    scheduledTime: typeof streak.scheduledTime === 'string' ? streak.scheduledTime : undefined,
    fontSize:
      ['small', 'medium', 'large'].includes(streak.fontSize as string)
        ? (streak.fontSize as 'small' | 'medium' | 'large')
        : undefined,
    textAlign:
      ['left', 'center', 'right'].includes(streak.textAlign as string)
        ? (streak.textAlign as 'left' | 'center' | 'right')
        : undefined,
    reminderEnabled: typeof streak.reminderEnabled === 'boolean' ? streak.reminderEnabled : false,
    reminderTime: typeof streak.reminderTime === 'string' ? streak.reminderTime : undefined,
    pausedAt: typeof streak.pausedAt === 'string' ? streak.pausedAt : null,
    archivedAt: typeof streak.archivedAt === 'string' ? streak.archivedAt : null,
  };

  return { valid: true, cleaned };
};

/**
 * Validate a backup data object
 */
export const validateBackupData = (
  data: unknown
): {
  streaks: Streak[];
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
} => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const streaks: Streak[] = [];

  // Check if data is array or has streaks property
  let streakArray: unknown[] = [];
  let isValidFormat = false;

  if (Array.isArray(data)) {
    streakArray = data;
    isValidFormat = true;
  } else if (data && typeof data === 'object' && 'data' in data) {
    const backupData = (data as Record<string, unknown>).data;
    if (backupData && typeof backupData === 'object') {
      const streaksKey = Object.keys(backupData).find(
        (key) =>
          key.includes('streak') ||
          key.includes('Streak') ||
          key === 'streakflame_streaks'
      );
      if (streaksKey) {
        const value = (backupData as Record<string, unknown>)[streaksKey];
        if (Array.isArray(value)) {
          streakArray = value;
          isValidFormat = true;
        } else if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              streakArray = parsed;
              isValidFormat = true;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  if (!isValidFormat) {
    errors.push({
      type: 'critical',
      message: 'Invalid backup file format',
      detail: 'Expected array of streaks or backup object with data.streaks property',
    });
    return { streaks, errors, warnings, summary: { total: 0, valid: 0, invalid: 0 } };
  }

  // Validate each streak
  for (let i = 0; i < streakArray.length; i++) {
    const result = validateStreak(streakArray[i], i);

    if (result.valid && result.cleaned) {
      streaks.push(result.cleaned);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return {
    streaks,
    errors,
    warnings,
    summary: {
      total: streakArray.length,
      valid: streaks.length,
      invalid: streakArray.length - streaks.length,
    },
  };
};

/**
 * Format validation result for user display
 */
export const formatValidationMessage = (
  result: ReturnType<typeof validateBackupData>
): string => {
  const { errors, summary } = result;

  if (errors.length === 0 && summary.valid === summary.total) {
    return `✅ All ${summary.total} streaks loaded successfully.`;
  }

  const lines: string[] = [];

  if (summary.valid > 0) {
    lines.push(`✅ Loaded ${summary.valid} streak${summary.valid !== 1 ? 's' : ''}`);
  }

  if (summary.invalid > 0) {
    lines.push(`⚠️ Skipped ${summary.invalid} invalid streak${summary.invalid !== 1 ? 's' : ''}`);
  }

  if (errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    errors.slice(0, 3).forEach((error) => {
      lines.push(`• ${error.message}`);
    });

    if (errors.length > 3) {
      lines.push(`• ...and ${errors.length - 3} more errors`);
    }
  }

  return lines.join('\n');
};

/**
 * Log detailed validation report for debugging
 */
export const logValidationReport = (
  result: ReturnType<typeof validateBackupData>
): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.group('📊 Data Validation Report');
  console.table(result.summary);

  if (result.errors.length > 0) {
    console.group('❌ Errors');
    result.errors.forEach((error, i) => {
      console.error(`${i + 1}. [${error.type.toUpperCase()}]`, error.message);
      if (error.detail) console.debug('   Detail:', error.detail);
      if (error.field) console.debug('   Field:', error.field);
      if (error.rowIndex !== undefined) console.debug('   Row:', error.rowIndex);
    });
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings');
    result.warnings.forEach((warning, i) => {
      console.warn(`${i + 1}.`, warning.message);
      if (warning.detail) console.debug('   Detail:', warning.detail);
    });
    console.groupEnd();
  }

  console.log('✅ Summary:', `${result.summary.valid}/${result.summary.total} streaks loaded`);
  console.groupEnd();
};
