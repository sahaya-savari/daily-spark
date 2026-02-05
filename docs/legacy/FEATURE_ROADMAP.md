# Daily Spark — Feature Enhancement Roadmap

## 📋 Current State Analysis

### Existing Strengths
✅ **Streak core logic** — Solid foundation with `useStreaks` hook  
✅ **Mobile-first UI** — Radix UI + Tailwind, bottom nav pattern  
✅ **Calm design** — Minimal, distraction-free layout  
✅ **Local storage** — PWA-ready persistence  
✅ **Status tracking** — pending, completed, at-risk states  

### Existing Components & Hooks (Reusable)
- `<StreakCard />` — Habit display with status badge
- `<AddStreakDialog />` — Modal pattern for creation
- `useStreaks()` — Core data management, localStorage sync
- `getStreakStatus()`, `getTodayDate()` — Date utilities
- `<Button />`, `<Input />`, `<Dialog />` from Radix UI
- Navigation & theme infrastructure

### Current Data Model Limitations
```typescript
Streak {
  id, name, emoji, createdAt
  currentStreak, bestStreak, lastCompletedDate, completedDates
  color?, isPaused?, pausedAt?, reminderEnabled?, reminderTime?
  // Missing: note, category, dueTime, repeatRule, notes
}
```

---

## 🎯 CORE FEATURES (PHASE 1) — Must-Have Foundation

### 1️⃣ **Task/Habit Card Enrichment**

**What to add:**
- Optional **note** field (motivation line, context)
- **Category** selector (3 default categories: 🔥 Daily Streaks, 📚 Study, 🏃 Health)
- Optional **due time** (HH:MM format)
- Visual refinements to show all metadata

**Data Model Change:**
```typescript
Streak {
  // Existing
  id, name, emoji, createdAt, currentStreak, bestStreak, lastCompletedDate, completedDates, color
  
  // NEW FIELDS
  note?: string;           // "Easy also counts" / motivation text
  category?: string;       // "daily-streaks" | "study" | "health" (extensible)
  dueTime?: string;        // HH:MM format, optional, e.g. "18:00"
  repeatRule?: RepeatRule; // See #2
}

RepeatRule {
  type: 'daily' | 'weekly' | 'custom';
  weekDays?: string[];     // For weekly: ['MON', 'WED', 'FRI']
  interval?: number;       // For custom: every N days (e.g. 2)
  customDescription?: string; // User-friendly label
}
```

**UI Changes:**
- Expand `<StreakCard />` to show optional note + category badge
- Enhance `<AddStreakDialog />` → `<HabitDialog />` with new fields
- Add category icon/badge display (minimal visual weight)
- Show due time if set (e.g. "Due 6 PM")

**Why first?**
- Minimal breaking changes; extends existing structure
- Enables better organization before repeat logic
- Prepares for categorization in future filtering

---

### 2️⃣ **Repeat Rules (Flexible Scheduling)**

**What to add:**
- Support for **daily**, **weekly**, and **custom interval** repeats
- Smart completion logic: Don't force completion every single day
- Grace period concept (introduced now, made configurable later)

**Logic:**
```
Daily: Mark complete every day (current behavior)
Weekly: User picks days (e.g. Mon/Wed/Fri). Show only on those days.
Custom: Every N days (e.g. "every 2 days")

Grace Period: If due, allow completion up to +6 hours into next day
  - Rationale: Time zones, flexible mornings, real-world chaos
  - Prevents aggressive streak breaks
```

**Data Changes:**
- Add `repeatRule: RepeatRule` to Streak model
- Extend completion logic: `completeStreak(id, date?)` — allow backfilling
- Add utility function: `isStreakDueToday(streak): boolean`

**UI Changes:**
- `<HabitDialog />`: Add repeat rule selector
  - Radio buttons: Daily / Weekly / Custom
  - Conditional UI: Weekday picker (weekly), number input (custom)
- `<StreakCard />`: Show repeat info subtly (e.g. "Every Mon/Wed/Fri")
- Filter/show only "due today" streaks by default

**Why second?**
- Builds on enriched habit model
- Prevents over-tracking; supports realistic habits
- Foundation for smart notifications (Phase 2)

---

### 3️⃣ **One-Tap Completion & Celebration**

**What to add:**
- Large, prominent "Mark Complete" button (already exists, **refine**)
- Immediate visual feedback:
  - ✓ Checkmark animation
  - Scale/fade subtle animation
  - Brief celebration overlay (optional confetti-lite)
- Haptic feedback on mobile (if available)

**UI Refinements:**
- `<StreakCard />` — Increase tap target size (already ~60px, good)
- Add `<Celebration />` component (already exists, **integrate**)
  - Trigger on completion
  - Show 2-3 sec, then fade
- Smooth motion: `framer-motion` (already in deps)

**Tone guidance:**
- ✅ "Great! 12-day streak"
- ✅ "Nice! Day 1 of new habit"
- ❌ Avoid guilt-trip language

**Why third?**
- Quick win; uses existing components (`<Celebration />`, `framer-motion`)
- Increases user confidence + retention
- No data model changes; UX-only

---

### 4️⃣ **Streak Engine: Current & Longest Streak Display**

**What to add:**
- Show **current streak** prominently on card
- Show **longest/best streak** (already tracked)
- Soft **missed-day warning** (non-threatening tone)

**Display Logic:**
```
If status = 'completed':
  "🔥 12-day streak"

If status = 'pending':
  "🔥 12-day streak | Miss today → resets"
  
If status = 'at-risk':
  "🔥 Streak broken (1 day missed)"
  + optional recovery option (Phase 2)
```

**UI Changes:**
- `<StreakCard />` — Add streak burn display
- Use existing `fire-gradient` styling
- Show warning with ⚠️ icon (already in code)

**Tone Guidance (CRITICAL):**
- 🟢 "You're 1 day from your best streak!"
- 🟢 "Streak broken, but you can recover (Phase 2)"
- 🔴 "You failed" / "Loser" / Shame language

**Why fourth?**
- Visualization of data already tracked
- Motivates without pressure
- Minimal changes to existing card component

---

### 5️⃣ **Smart Consistency Rules: Flexible vs. Strict**

**What to add:**
- **Flexible completion window** — "complete anytime today"
- **Soft deadline** — "due by 6 PM" (doesn't auto-fail)
- **Grace period** — +6 hours into next day to avoid aggressive resets
- **Consistency framing** — "X times per week" vs. daily hammer

**Logic:**
```
Streak break logic (current):
  - Miss 1 day → resets (harsh)

New logic:
  - Complete on due date or +6 hour grace period → OK
  - Miss beyond grace → soft warning first
  - 2+ days missed → break (with recovery options Phase 2)
```

**Data Changes:**
- Add `graceHours?: number` (default 6, configurable later)
- Extend completion logic with grace period check

**UI Changes:**
- Show "due by X time" on card (if set)
- Show grace period visually (e.g. "Still time until 12:06 AM")

**Why fifth?**
- Prevents abandonment due to missed-one-day guilt
- Aligns with real-world habits (timezone issues, etc.)
- Prepares for Phase 2 recovery mechanics

---

## 📊 POWER FEATURES (PHASE 2) — Streak USP

*(Defer these until Phase 1 is solid)*

### 6️⃣ **Missed-Day Recovery Options**
- Streak freezes (limited uses: 2/month)
- Pause streak (pause counter, don't reset)
- Recovery day (1 grace day per week)

### 7️⃣ **Weekly Insights**
- Days active this week
- Most consistent habit
- Drop-off patterns (e.g. Sunday slump)
- Lightweight text summaries (not heavy charts)

### 8️⃣ **Smart Notifications**
- Gentle reminders (if habit not done by X time)
- Positive nudges ("1 day from best streak")
- No spam; quality > quantity
- Silent/non-intrusive option

### 9️⃣ **Motivation Layer**
- Rotating subtle messages
- "Easy also counts"
- "Consistency > difficulty"
- "Don't break the chain"

---

## 📁 Implementation Architecture

### Files to Create (Phase 1)
```
src/types/
  ├── habit.ts              (NEW) — RepeatRule, HabitCategory types
  
src/components/
  ├── HabitDialog.tsx       (NEW, extends AddStreakDialog)
  ├── RepeatRuleSelector.tsx (NEW) — Weekly/custom UI
  
src/hooks/
  ├── useStreaks.ts         (EXTEND) — Add repeat logic, grace period
  ├── useHabits.ts          (NEW) — High-level habit mgmt
  
src/utils/
  ├── repeatRuleUtils.ts    (NEW) — isStreakDueToday(), etc.
  ├── gracePeriodUtils.ts   (NEW) — Grace period checks
```

### Files to Modify (Phase 1)
```
src/types/streak.ts         — Add new fields (note, category, repeatRule, dueTime)
src/components/StreakCard.tsx — Show note, category, due time, repeat info
src/hooks/useStreaks.ts     — Add repeat validation, grace period logic
src/pages/Streaks.tsx       — Filter by "due today" by default
src/pages/Index.tsx         — Integrate new habit creation flow
```

---

## 🎨 UX/UI Principles for Implementation

### Mobile-First (STRICT)
- Touch targets ≥ 44x44px
- Bottom sheet dialogs (not centered modals)
- Staggered loading, no jank
- Safe area padding on notch devices

### Calm, Minimal Design
- No flashing colors
- Subtle animations (fade, scale 1.05x, not bouncy)
- Light notifications
- One CTA per card (the primary action)

### Component Reuse (STRICT)
- Extend `<StreakCard />` instead of new card
- Extend `<AddStreakDialog />` → `<HabitDialog />` for new fields
- Reuse `<Select />`, `<Checkbox />`, `<Input />` from Radix
- Use `framer-motion` for animations (already in deps)

### Data Integrity
- Always validate `completedDates` array
- Recalculate streaks on app load
- Handle timezone edge cases (store as YYYY-MM-DD, not timestamps)
- No breaking changes to existing Streak interface

---

## 🔄 Migration & Testing Strategy

### Data Migration
- Add default values for new Streak fields (backward compatible)
- Migration function: `upgradeStreakModel(oldStreak): Streak`
- Test with existing localStorage data

### Testing (Vitest already set up)
- Unit tests for repeat rule logic
- Unit tests for grace period checks
- Integration tests for completion flow
- No E2E required for MVP

---

## ✅ Success Criteria (Phase 1)

1. ✅ Users can add habits with notes, categories, due times
2. ✅ Repeat rules (daily/weekly/custom) work without breaking existing daily logic
3. ✅ Completion is rewarding but calm
4. ✅ Streak counts are visible and motivating (not shaming)
5. ✅ Grace period prevents false streak breaks
6. ✅ All existing functionality still works
7. ✅ Mobile UX is pristine, no jank
8. ✅ localStorage persists new data correctly

---

## 📝 Summary: Phase 1 Deliverables

| Feature | Complexity | Est. Effort | Files Changed |
|---------|-----------|------------|----------------|
| 1. Task Enrichment (note, category, dueTime) | Low | 2-3h | Streak type, StreakCard, HabitDialog |
| 2. Repeat Rules (daily/weekly/custom) | Medium | 4-6h | useStreaks, HabitDialog, RepeatRuleSelector |
| 3. One-Tap Celebration | Low | 1h | StreakCard, integrate Celebration |
| 4. Streak Display & Warning | Low | 1-2h | StreakCard UI refinement |
| 5. Smart Consistency Rules | Medium | 2-3h | useStreaks grace logic, UI hints |
| **Total Phase 1** | | **10-15h** | ~6 files |

---

## 🟢 READY FOR PHASE 1 KICKOFF?

Next steps when you confirm:
1. Extend data model (new fields in `Streak` type)
2. Create `HabitDialog` component with enriched form
3. Implement repeat rule utilities & validation
4. Integrate into `useStreaks` hook
5. Refine `<StreakCard />` display
6. Test with existing data + new workflows
7. Deploy incrementally

**Confirm when ready to begin Phase 1! 🚀**
