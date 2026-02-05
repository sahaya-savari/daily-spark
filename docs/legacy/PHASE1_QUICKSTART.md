# ⚠️ LEGACY DOCUMENT — NOT USED

> **This document is an archived planning draft from early Phase-1 ideation.**  
> **The actual implementation evolved differently.**  
> **For accurate Phase-1 status, see [PHASE1_FINAL.md](PHASE1_FINAL.md)**

---

# 📋 PHASE 1 QUICK START GUIDE (ARCHIVED)

## TL;DR: What We're Building

Extend Daily Spark with:
1. **Richer habits** — Note + category + due time
2. **Flexible scheduling** — Daily / weekly / custom repeat
3. **Celebration** — One-tap completion with reward
4. **Smart streaks** — Show progress without shame
5. **Grace period** — Don't reset aggressively on 1 missed day

**Timeline:** 10–15 hours | **Files changed:** ~11 | **Breaking changes:** 0

---

## The Plan (5 Core Features)

### 1. Task Enrichment (2–3h) ✅
**Add to every habit:**
- 📝 Optional note ("Easy also counts")
- 🏷️ Category (Daily Streaks, Study, Health)
- ⏰ Due time (e.g. 6 PM)

**Files:**
- `src/types/streak.ts` — Add 3 fields
- `src/components/StreakCard.tsx` — Show new fields
- `src/components/HabitDialog.tsx` — Input form

---

### 2. Repeat Rules (4–6h) 🔄
**Support:**
- Daily (current behavior)
- Weekly (e.g. Mon/Wed/Fri)
- Custom (e.g. every 2 days)

**Files:**
- `src/types/habit.ts` — RepeatRule type (new)
- `src/components/RepeatRuleSelector.tsx` — UI (new)
- `src/hooks/useStreaks.ts` — Completion logic
- `src/utils/repeatRuleUtils.ts` — Utilities (new)

---

### 3. One-Tap Celebration (1h) 🎉
**Reward completion:**
- Checkmark animation
- Subtle scale + fade
- Integrate existing `<Celebration />` component

**Files:**
- `src/components/StreakCard.tsx` — Trigger on complete
- `src/hooks/useStreaks.ts` — Animation timing

---

### 4. Streak Display (1–2h) 🔥
**Show progress:**
- Current streak with 🔥 icon
- Longest streak reference
- Soft warning if at risk (not shame)

**Files:**
- `src/components/StreakCard.tsx` — Enhanced display

---

### 5. Smart Consistency (2–3h) 💪
**Prevent breakage:**
- Grace period +6 hours
- "Complete anytime today" (soft deadline)
- Don't reset on 1 missed day

**Files:**
- `src/utils/gracePeriodUtils.ts` — Grace logic (new)
- `src/hooks/useStreaks.ts` — Streak calculation
- `src/utils/habitMigration.ts` — Backward compatibility (new)

---

## Data Model (5 New Fields)

```typescript
Streak {
  // Existing (unchanged)
  id, name, emoji, createdAt
  currentStreak, bestStreak, lastCompletedDate, completedDates
  
  // NEW (all optional, with defaults)
  note?: string;           // "Easy also counts"
  category?: string;       // "daily-streaks"
  dueTime?: string;        // "18:00"
  repeatRule?: {           // { type: 'daily' }
    type: 'daily' | 'weekly' | 'custom';
    weekDays?: ['MON', 'WED', 'FRI'];
    interval?: 2;
  };
  graceHours?: number;     // 6 (hours after due date)
}
```

**Key:** All new fields have sensible defaults. No breaking changes.

---

## File Structure

### 🆕 New Files (7)
```
src/types/habit.ts                    (types & enums)
src/components/HabitDialog.tsx        (enhanced creation)
src/components/RepeatRuleSelector.tsx (repeat UI)
src/utils/repeatRuleUtils.ts          (repeat logic)
src/utils/gracePeriodUtils.ts         (grace period logic)
src/utils/habitMigration.ts           (backward compat)
src/hooks/useHabits.ts                (optional, Phase 2)
```

### ✏️ Modified Files (5)
```
src/types/streak.ts          (add new fields)
src/components/StreakCard.tsx (display enhancements)
src/hooks/useStreaks.ts      (new methods, migration)
src/pages/Streaks.tsx        (filter due today)
src/pages/Index.tsx          (use HabitDialog)
```

---

## Implementation Order

1. **Types** — Extend Streak, create HabitCategory, RepeatRule
2. **Utilities** — Repeat logic, grace period, migration
3. **Hook** — Update useStreaks, add new methods
4. **Dialogs** — HabitDialog, RepeatRuleSelector
5. **Display** — Update StreakCard
6. **Pages** — Integrate into Streaks, Index
7. **Testing** — Unit + integration tests
8. **Polish** — Animations, mobile UX, edge cases

---

## UI Highlights

### HabitDialog (Bottom Sheet)
```
╔════════════════════════╗
║ New Habit          ✕   ║
║                        ║
║ 🔥 🏃 📚 ... (picker) ║
║ [Habit name]           ║
║ [Note - optional]      ║
║ Category: ◉Daily ○Stdy ║
║ Repeat: ◉Daily ○Weekly║
║ ⏰ Due time: [18:00]    ║
║ [Create Streak]        ║
╚════════════════════════╝
```

### StreakCard (Enhanced)
```
┌────────────────────────┐
│ 🔥 LeetCode [Daily]    │
│ "1 problem per day"    │
│                        │
│ 🔥 12-day streak       │
│ 🏆 Best: 24 days       │
│ ⏰ Due 6 PM            │
│ Mon/Wed/Fri            │
│                        │
│ [✓ Mark Complete]      │
└────────────────────────┘
```

---

## Testing Plan

### Unit Tests
- `repeatRuleUtils.test.ts` — isStreakDueToday, labels, etc.
- `gracePeriodUtils.test.ts` — Grace period checks
- `habitMigration.test.ts` — Data migration

### Integration Tests
- Create habit with repeat rule → stored correctly
- Complete habit → streak calc respects repeat + grace
- Load app → old data migrates automatically

### Manual QA
- Mobile: All buttons ≥ 44px
- All repeat types work
- Grace period preserves streak
- Animations smooth 60fps

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking old data | Migration function, defaults for all new fields |
| Streak calc wrong | Extensive unit tests, manual testing |
| Performance issues | Memoization, load-time recalc only |
| Mobile UX broken | Test on real devices, 44px+ targets |
| UI cluttered | Progressive disclosure, minimal design |

---

## Success Criteria (Definition of Done)

- ✓ Create habit with note, category, due time
- ✓ Set repeat (daily/weekly/custom) works correctly
- ✓ Completion animated + rewarding
- ✓ Streak display shows progress clearly
- ✓ Grace period prevents false resets
- ✓ All existing features still work
- ✓ Mobile UX pristine
- ✓ Old data migrates automatically
- ✓ All tests pass
- ✓ Zero console errors

---

## Questions to Confirm

1. **Categories** — Are "Daily Streaks", "Study", "Health" the right defaults?
2. **Due time** — Show on every card or only when set?
3. **Grace period** — 6 hours OK? Make configurable in settings?
4. **Repeat display** — Badge, subtitle, or expanded view?
5. **Filter** — Show "due today" by default or optional toggle?

---

## Phase 2 (After Phase 1 Confirmed)

- Streak recovery (freeze, pause, recovery day)
- Weekly insights dashboard
- Smart notifications
- Motivation messages
- Cloud sync (Supabase already integrated!)

---

## How to Start

1. **Read** [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md) — High-level overview
2. **Read** [PHASE1_UX_GUIDE.md](PHASE1_UX_GUIDE.md) — Design specs
3. **Read** [PHASE1_ARCHITECTURE.md](PHASE1_ARCHITECTURE.md) — Technical design
4. **Use** [PHASE1_CHECKLIST.md](PHASE1_CHECKLIST.md) — Task tracking
5. **Confirm** the 5 questions above
6. **Start** with Milestone 1 (types) in checklist

---

## Reusing Existing Code

✅ **Keep as-is:**
- `<Button />`, `<Input />`, `<Dialog />` from Radix UI
- `useStreaks()` hook (extend, don't replace)
- `<StreakCard />` component (extend)
- `<Celebration />` component (integrate)
- `AddStreakDialog` pattern (extend)
- `getTodayDate()`, `getStreakStatus()` utilities
- Theme infrastructure
- Mobile-first layout patterns

---

## Tone & Copy Guidelines

**DO:**
- ✅ "Great! 12-day streak"
- ✅ "You're 1 day from your best streak"
- ✅ Encouraging, supportive language

**DON'T:**
- ❌ "You failed"
- ❌ "Streak broken (shame on you)"
- ❌ Competitive or guilt-tripping language

---

## Communication Plan

After each Milestone (2-3 files changed):
1. Confirm changes are correct
2. Show preview/demo if needed
3. Move to next milestone
4. Iterate if feedback

Estimated pace: 1-2 milestones per day

---

## 🚀 Ready to Proceed?

**Next:** Confirm the 5 questions above, then I'll start Phase 1 Milestone 1.

Or if you have different preferences:
- Different category defaults?
- Different grace period?
- Different repeat options?
- Different UI layout?

**Just let me know and we'll adjust! 💪**
