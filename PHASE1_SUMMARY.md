# 🎯 PHASE 1 EXECUTIVE SUMMARY

## The Ask
Extend Daily Spark with Google Tasks-style simplicity + streak-focused power features.

## Key Constraints
- ✅ Calm, minimal, no bloat
- ✅ Mobile-first UX
- ✅ Reuse existing components
- ✅ Don't break existing features

---

## 🟢 PHASE 1: CORE FOUNDATION (10–15 hours)

### 1. **Task/Habit Enrichment** (2–3h)
Add metadata to streaks:
- 📝 **Note** — Motivation text ("Easy also counts")
- 🏷️ **Category** — 🔥 Daily Streaks, 📚 Study, 🏃 Health
- ⏰ **Due Time** — Optional HH:MM (e.g. "6 PM")

**UI**: Show subtly on card, add fields to creation dialog.

---

### 2. **Repeat Rules** (4–6h)
Flexible scheduling, not every-day hammer:
- **Daily** — Current behavior
- **Weekly** — Pick days (Mon/Wed/Fri)
- **Custom** — Every N days (e.g. every 2 days)

**Logic**: Only show/require completion on due days. Grace period +6 hours.

**UI**: Radio selector + conditional weekday picker in dialog.

---

### 3. **One-Tap Celebration** (1h)
Already have the pieces; integrate:
- Large checkmark animation
- Subtle scale/fade
- Integrate existing `<Celebration />` component
- Haptic if mobile

**Tone**: Rewarding but calm.

---

### 4. **Streak Display & Warning** (1–2h)
Make streaks motivating, not scary:
- Show current streak count (🔥 12-day)
- Show longest streak reference
- Soft warning if at risk (⚠️ "Miss today → resets")

**Tone**: Encouraging, not guilt-tripping.

---

### 5. **Smart Consistency Rules** (2–3h)
Prevent false failures:
- Complete "anytime today" (soft deadline)
- Grace period +6 hours into next day
- Don't reset harshly on 1 missed day
- "Times per week" framing vs daily hammer

**Logic**: Flexible windows > strict deadlines.

---

## 📊 Data Model Additions

```typescript
Streak {
  // Existing fields (unchanged)
  id, name, emoji, createdAt
  currentStreak, bestStreak, lastCompletedDate, completedDates
  
  // NEW (Phase 1)
  note?: string;           // "Easy also counts"
  category?: string;       // "daily-streaks" | "study" | "health"
  dueTime?: string;        // "18:00"
  repeatRule?: {
    type: 'daily' | 'weekly' | 'custom';
    weekDays?: string[];   // ['MON', 'WED', 'FRI']
    interval?: number;     // Every N days
  };
  graceHours?: number;     // Default 6, configurable later
}
```

---

## 📁 Files to Create

- `src/types/habit.ts` — RepeatRule types
- `src/components/HabitDialog.tsx` — Enhanced creation
- `src/components/RepeatRuleSelector.tsx` — UI for repeat rules
- `src/hooks/useHabits.ts` — High-level management
- `src/utils/repeatRuleUtils.ts` — Repeat logic
- `src/utils/gracePeriodUtils.ts` — Grace window checks

---

## 📁 Files to Modify

- `src/types/streak.ts` — Add new fields
- `src/components/StreakCard.tsx` — Display note, category, due time
- `src/hooks/useStreaks.ts` — Repeat logic, grace period
- `src/pages/Streaks.tsx` — Filter "due today" by default
- `src/pages/Index.tsx` — New habit creation flow

---

## 🎨 Design Principles

| Principle | Implementation |
|-----------|-----------------|
| Mobile-first | 44px+ touch targets, bottom sheets |
| Calm | Subtle animations, light notifications |
| Simple | Google Tasks feel, one CTA per card |
| Reusable | Extend existing components, no new UI patterns |
| Backward compatible | Add defaults, no breaking changes |

---

## ✅ Success Metrics

1. ✓ Add habit with note + category + due time
2. ✓ Set repeat rules (weekly/custom)
3. ✓ Mark complete with celebration
4. ✓ See streak progress without shame
5. ✓ Grace period prevents false breaks
6. ✓ Existing features unbroken
7. ✓ Mobile UX smooth & pristine

---

## 🔵 PHASE 2: POWER FEATURES (defer)

- Streak recovery (freeze, pause, recovery day)
- Weekly insights
- Smart notifications
- Motivation messages

---

## 🚀 Next Action

**Confirm Phase 1 start → I'll implement feature-by-feature with your approval between each milestone.**
