# 🏗️ PHASE 1 ARCHITECTURE OVERVIEW

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                 │
│        (Router, Theme, Query Client)                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Pages.tsx      Settings.tsx   Insights.tsx
    ├─ Index.tsx       (exists)       (exists)
    ├─ Streaks.tsx
    ├─ Calendar.tsx
    └─ NotFound.tsx
        │
        ├─ useStreaks() ◄─── Main data hook
        │   └─ localStorage
        │
        ├─ <StreakCard /> ◄─ MODIFIED
        │   ├─ Display category badge (NEW)
        │   ├─ Display note (NEW)
        │   ├─ Display due time (NEW)
        │   ├─ Display repeat info (NEW)
        │   └─ <Celebration /> (integrated)
        │
        ├─ <HabitDialog /> ◄─ NEW (extends AddStreakDialog)
        │   ├─ Emoji picker (existing)
        │   ├─ Name input (existing)
        │   ├─ Note textarea (NEW)
        │   ├─ Category selector (NEW)
        │   ├─ Due time input (NEW)
        │   └─ <RepeatRuleSelector /> (NEW)
        │
        └─ <BottomNav />
            (existing)
```

---

## Data Flow Architecture

### Streak Creation
```
HabitDialog (form)
    │
    ├─ Collect: name, emoji, note, category, dueTime, repeatRule
    │
    ▼
handleSubmit()
    │
    ├─ Validate inputs
    ├─ Build RepeatRule object
    │
    ▼
useStreaks.addStreak()
    │
    ├─ Create new Streak object with new fields
    ├─ Generate ID
    │
    ▼
localStorage
    │
    └─ Persist JSON
```

### Streak Completion
```
StreakCard (UI)
    │
    └─ onClick: completeStreak(id)
        │
        ▼
    useStreaks.completeStreak(id)
        │
        ├─ Get streak by ID
        ├─ Check repeatRule: isDueToday(streak)?
        ├─ Check gracePeriod: isWithinGrace(streak)?
        ├─ Calculate new streak count
        ├─ Update lastCompletedDate, completedDates
        │
        ▼
    Trigger <Celebration />
        │
        ▼
    Update localStorage
```

### Data Persistence & Migration
```
App loads
    │
    ├─ useStreaks() calls loadStreaks()
    │
    ├─ Read localStorage[streakflame_streaks]
    │
    ├─ Parse JSON → Streak[]
    │
    ├─ For each streak:
    │   ├─ Check if new fields exist
    │   └─ If missing → upgrade via upgradeStreakModel()
    │       └─ Add defaults: note="", category="daily-streaks", repeatRule={type:'daily'}
    │
    ├─ Recalculate all streaks:
    │   ├─ Run recalculateStreakWithRepeat()
    │   ├─ Check grace period
    │   ├─ Update currentStreak count
    │
    ▼
State updated, UI renders
```

---

## Type System

```typescript
// src/types/streak.ts (EXTENDED)
Streak
├─ id: string
├─ name: string
├─ emoji: string
├─ createdAt: string (YYYY-MM-DD)
├─ currentStreak: number
├─ bestStreak: number
├─ lastCompletedDate: string | null
├─ completedDates: string[]
├─ color?: string
├─ isPaused?: boolean
├─ pausedAt?: string | null
├─ reminderEnabled?: boolean
├─ reminderTime?: string (HH:MM)
├─ archivedAt?: string | null
│
│ NEW FIELDS (Phase 1)
├─ note?: string
├─ category?: HabitCategory
├─ dueTime?: string (HH:MM)
├─ repeatRule?: RepeatRule
└─ graceHours?: number

// src/types/habit.ts (NEW FILE)
enum HabitCategory {
  DAILY_STREAKS = "daily-streaks",
  STUDY = "study",
  HEALTH = "health"
}

interface RepeatRule {
  type: 'daily' | 'weekly' | 'custom';
  weekDays?: string[];     // ['MON', 'WED', 'FRI']
  interval?: number;       // e.g. 2 for "every 2 days"
  customDescription?: string;
}

// Defaults for backward compatibility
const DEFAULT_REPEAT_RULE: RepeatRule = {
  type: 'daily'
};

const DEFAULT_CATEGORY = HabitCategory.DAILY_STREAKS;
const DEFAULT_GRACE_HOURS = 6;
```

---

## Hook Architecture

### useStreaks (EXTENDED)

```typescript
export const useStreaks = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lifecycle: Load & migrate on mount
  useEffect(() => loadStreaksWithMigration(), []);

  // Persist on change
  useEffect(() => saveStreaks(), [streaks, isLoading]);

  // --- New/Modified Methods ---

  // CREATE: Enhanced to include new fields
  const addStreak = (
    name: string,
    emoji: string,
    note?: string,
    category?: HabitCategory,
    dueTime?: string,
    repeatRule?: RepeatRule
  ) => Streak

  // READ: Filter by due status
  const getStreaksDueToday = (): Streak[] => [...]

  // UPDATE: Extended to support all fields
  const updateStreak = (id: string, updates: Partial<Streak>) => void

  // COMPLETE: Enhanced with repeat logic + grace period
  const completeStreak = (id: string, date?: string): boolean => [...]

  // RECALC: New method for repeat rules + grace
  const recalculateStreak = (streak: Streak): Streak => [...]

  return {
    streaks,
    isLoading,
    addStreak,
    updateStreak,
    completeStreak,
    getStreaksDueToday,
    recalculateStreak,
    // ... existing methods
  }
}
```

### New Hook: useHabits (Optional, Phase 1)

Could optionally create higher-level hook:

```typescript
export const useHabits = () => {
  const { streaks, addStreak, completeStreak } = useStreaks();

  // High-level operations
  const createHabitFromForm = (formData) => addStreak(...);
  const markHabitDone = (habitId) => completeStreak(habitId);
  const getActiveHabits = () => streaks.filter(s => !s.archivedAt);
  const getDueHabits = () => getStreaksDueToday();

  return { createHabitFromForm, markHabitDone, getActiveHabits, getDueHabits }
}
```

*Note: Could defer this to Phase 2 if not needed*

---

## Utility Functions

### repeatRuleUtils.ts (NEW FILE)

```typescript
// Check if habit is due today
export const isStreakDueToday = (streak: Streak): boolean

// Get next due date
export const getNextDueDate = (streak: Streak): string

// Get human-readable label for repeat rule
export const getDueDaysLabel = (repeatRule: RepeatRule): string
  // Examples:
  //   Daily → "Every day"
  //   Weekly [MON, WED, FRI] → "Mon, Wed, Fri"
  //   Custom 2 → "Every 2 days"

// Validate repeat rule object
export const validateRepeatRule = (rule: RepeatRule): boolean

// Get last due date (for grace period check)
export const getLastDueDate = (streak: Streak): string

// Check if today is a repeat day
export const isTodayRepeatDay = (streak: Streak): boolean
```

### gracePeriodUtils.ts (NEW FILE)

```typescript
// Check if last completion is within grace period
export const isWithinGracePeriod = (streak: Streak, graceHours?: number): boolean

// Get grace period end time
export const getGracePeriodEndTime = (streak: Streak, graceHours?: number): Date

// Check if streak is broken (accounting for grace)
export const isStreakBrokenWithGrace = (streak: Streak, graceHours?: number): boolean

// Calculate streak accounting for grace period
export const calculateStreakWithGrace = (streak: Streak, graceHours?: number): number
```

### habitMigration.ts (NEW FILE)

```typescript
// Upgrade old Streak to new schema
export const upgradeStreakModel = (oldStreak: any): Streak => {
  return {
    ...oldStreak,
    note: oldStreak.note ?? "",
    category: oldStreak.category ?? "daily-streaks",
    dueTime: oldStreak.dueTime ?? undefined,
    repeatRule: oldStreak.repeatRule ?? { type: 'daily' },
    graceHours: oldStreak.graceHours ?? 6,
  }
}

// Batch migrate all streaks
export const migrateAllStreaks = (streaks: any[]): Streak[] => streaks.map(upgradeStreakModel)
```

---

## Component Specs

### HabitDialog.tsx (NEW FILE)

Extends `AddStreakDialog` pattern:

```typescript
interface HabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    emoji: string,
    note?: string,
    category?: HabitCategory,
    dueTime?: string,
    repeatRule?: RepeatRule
  ) => void;
}

export const HabitDialog: React.FC<HabitDialogProps> = ({ isOpen, onClose, onAdd }) => {
  // State for form fields
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<HabitCategory>(DEFAULT_CATEGORY);
  const [dueTime, setDueTime] = useState('');
  const [repeatRule, setRepeatRule] = useState<RepeatRule>(DEFAULT_REPEAT_RULE);

  const handleSubmit = (e: React.FormEvent) => {
    // Validate
    // Call onAdd(...)
    // Reset form
    // Close
  };

  return (
    // Bottom sheet dialog
    // Emoji picker
    // Name input
    // Note textarea
    // Category selector
    // Due time input
    // Repeat rule selector (with RepeatRuleSelector component)
    // Submit button
  );
};
```

### RepeatRuleSelector.tsx (NEW FILE)

```typescript
interface RepeatRuleSelectorProps {
  value: RepeatRule;
  onChange: (rule: RepeatRule) => void;
}

export const RepeatRuleSelector: React.FC<RepeatRuleSelectorProps> = ({ value, onChange }) => {
  const handleTypeChange = (type: 'daily' | 'weekly' | 'custom') => {
    // Update rule type and reset sub-fields
  };

  const handleWeekDayToggle = (day: string) => {
    // Toggle day in weekDays array
  };

  const handleIntervalChange = (interval: number) => {
    // Update interval for custom
  };

  return (
    // Radio group for type
    // Conditional UI:
    //   - Weekly: Checkbox group for days
    //   - Custom: Number input
  );
};
```

### StreakCard.tsx (MODIFIED)

```typescript
interface StreakCardProps {
  streak: Streak;
  status: StreakStatus;
  onComplete: () => void;
  onEdit?: () => void;
  index?: number;
}

export const StreakCard = ({ streak, status, onComplete, onEdit, index = 0 }: StreakCardProps) => {
  return (
    // Existing structure + new fields:
    // - Category badge
    // - Note text
    // - Due time display
    // - Repeat rule info
    // - Enhanced streak display
    // - Celebration integration
  );
};
```

---

## File Structure Summary

### Create (6 new files)
```
src/types/habit.ts
src/components/HabitDialog.tsx
src/components/RepeatRuleSelector.tsx
src/hooks/useHabits.ts (optional, Phase 2)
src/utils/repeatRuleUtils.ts
src/utils/gracePeriodUtils.ts
src/utils/habitMigration.ts (could be in useStreaks)
```

### Modify (5 existing files)
```
src/types/streak.ts                 (extend interface)
src/components/StreakCard.tsx       (display enhancements)
src/hooks/useStreaks.ts             (new methods, migration)
src/pages/Streaks.tsx               (filter due today)
src/pages/Index.tsx                 (integrate HabitDialog)
```

---

## Testing Strategy

### Unit Tests (`src/test/`)
```
repeatRuleUtils.test.ts
├─ isStreakDueToday
├─ getDueDaysLabel
├─ isTodayRepeatDay
└─ validateRepeatRule

gracePeriodUtils.test.ts
├─ isWithinGracePeriod
├─ getGracePeriodEndTime
├─ isStreakBrokenWithGrace
└─ calculateStreakWithGrace

habitMigration.test.ts
├─ upgradeStreakModel
└─ migrateAllStreaks

useStreaks.test.ts (extend existing)
├─ completeStreak with repeat rule
├─ completeStreak with grace period
└─ recalculateStreak
```

### Integration Tests
```
Full flow: Create habit → Complete → Verify streak
Repeat flow: Daily vs Weekly vs Custom
Grace period: Complete day+1 within grace → streak preserved
Migration: Old data upgrades correctly
```

---

## Performance Considerations

### State Management
- `streaks` array in localStorage
- Recalculate on app load only (not on every render)
- Filter operations (getStreaksDueToday) memoized if needed

### Animations
- Celebration component: 2-3s total, no blocking
- Card transitions: 150-200ms
- Dialog: Fade-in 200ms

### Data Size
- Each streak: ~300-500 bytes (including completedDates array)
- 100 streaks with 365 completion dates: ~2 MB max
- LocalStorage typically 5-10 MB available

---

## Backward Compatibility

### Strategy
1. Existing Streak objects **don't change**
2. New fields are **optional** with defaults
3. Migration function converts old → new on first load
4. No breaking changes to public API

### Example
```typescript
// Old stored data
{
  id: "123",
  name: "LeetCode",
  emoji: "💻",
  createdAt: "2025-01-01",
  currentStreak: 10,
  bestStreak: 15,
  lastCompletedDate: "2025-01-31",
  completedDates: ["2025-01-01", "2025-01-02", ...]
}

// After migration (automatic)
{
  ...previousData,
  note: "",
  category: "daily-streaks",
  dueTime: undefined,
  repeatRule: { type: 'daily' },
  graceHours: 6
}
```

---

## Deployment Checklist

- [ ] All tests pass (unit + integration)
- [ ] No TypeScript errors
- [ ] No console warnings/errors
- [ ] LocalStorage migration tested with old data
- [ ] Mobile UI tested (iPhone + Android)
- [ ] Animations 60fps on real devices
- [ ] Existing routes still work
- [ ] PWA manifest unchanged
- [ ] No bundle size bloat (tree-shake unused code)

---

**Status: Ready for Phase 1 Implementation 🚀**
