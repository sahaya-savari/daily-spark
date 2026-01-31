# PHASE 1 IMPLEMENTATION CHECKLIST

## Milestone 1: Data Model & Types ⚙️

- [ ] **Extend Streak type** (`src/types/streak.ts`)
  - [ ] Add `note?: string`
  - [ ] Add `category?: string`
  - [ ] Add `dueTime?: string`
  - [ ] Add `repeatRule?: RepeatRule`
  - [ ] Add `graceHours?: number`

- [ ] **Create RepeatRule type** (`src/types/habit.ts` new file)
  - [ ] Define `RepeatRule` interface
  - [ ] Define `HabitCategory` enum
  - [ ] Export constants (REPEAT_TYPES, CATEGORIES)

- [ ] **Migration function** (`src/utils/habitMigration.ts` new file)
  - [ ] `upgradeStreakModel(oldStreak)` — backward compatibility
  - [ ] Add defaults for new fields

---

## Milestone 2: Utility Functions 🛠️

- [ ] **Repeat rule utilities** (`src/utils/repeatRuleUtils.ts` new file)
  - [ ] `isStreakDueToday(streak): boolean`
  - [ ] `getNextDueDate(streak): string`
  - [ ] `getDueDaysLabel(repeatRule): string` (e.g. "Mon, Wed, Fri")
  - [ ] `validateRepeatRule(rule): boolean`

- [ ] **Grace period utilities** (`src/utils/gracePeriodUtils.ts` new file)
  - [ ] `isWithinGracePeriod(lastCompleted, streak): boolean`
  - [ ] `getGracePeriodEndTime(streak): string`
  - [ ] `calculateStreakWithGrace(streak): number`

- [ ] **Date utilities** (extend `src/hooks/useStreaks.ts`)
  - [ ] `isStreakBroken(streak): boolean` — accounts for grace period
  - [ ] `recalculateStreakWithRepeat(streak): Streak`

---

## Milestone 3: Update useStreaks Hook 🪝

- [ ] **Extend completeStreak logic**
  - [ ] Check if habit is due today (respect repeat rules)
  - [ ] Apply grace period logic
  - [ ] Track completion with repeat rule awareness

- [ ] **Add new hook methods**
  - [ ] `addStreak(name, emoji, note, category, dueTime, repeatRule)`
  - [ ] `updateStreak(id, updates)`
  - [ ] `getStreaksDueToday(): Streak[]`
  - [ ] `recalculateAllStreaksWithRepeat()`

- [ ] **Data persistence**
  - [ ] Migrate existing streaks on load
  - [ ] Validate new data structure
  - [ ] Handle edge cases (timezone, DST, etc.)

---

## Milestone 4: Create HabitDialog Component 🎨

- [ ] **Extend AddStreakDialog** → `src/components/HabitDialog.tsx`
  - [ ] Emoji picker (existing code)
  - [ ] Name input (existing code)
  - [ ] **NEW:** Note textarea (optional)
  - [ ] **NEW:** Category selector (3 default options)
  - [ ] **NEW:** Due time input (HH:MM)
  - [ ] **NEW:** Repeat rule selector (see Milestone 5)

- [ ] **Form validation**
  - [ ] Name required
  - [ ] Category optional but validated
  - [ ] Repeat rule validated
  - [ ] Time format validated (HH:MM)

- [ ] **Update AddStreakDialog usage** in `Index.tsx` and other pages
  - [ ] Replace with HabitDialog
  - [ ] Maintain backward compatibility

---

## Milestone 5: Create RepeatRuleSelector Component 🔄

- [ ] **RepeatRuleSelector component** (`src/components/RepeatRuleSelector.tsx` new file)
  - [ ] Radio buttons: Daily / Weekly / Custom
  - [ ] **Conditional UI:**
    - [ ] Weekly: Checkbox group for days (Mon-Sun)
    - [ ] Custom: Number input + "every N days"
  - [ ] Validation & error messages

- [ ] **Integration**
  - [ ] Show selected repeat rule in HabitDialog
  - [ ] Pass to addStreak handler

---

## Milestone 6: Update StreakCard Component 📱

- [ ] **Display enhancements**
  - [ ] Show note (optional, below title)
  - [ ] Show category badge (icon + label)
  - [ ] Show due time (optional, if set)
  - [ ] Show repeat rule info (e.g. "Every Mon/Wed/Fri")

- [ ] **Streak display refinement**
  - [ ] Show current streak with 🔥 icon
  - [ ] Show "Best: X days" reference
  - [ ] Show soft warning if at risk
  - [ ] Keep visual hierarchy minimal

- [ ] **Color & spacing**
  - [ ] Maintain calm aesthetic
  - [ ] Ensure 44px+ tap targets
  - [ ] Mobile-first responsive

---

## Milestone 7: Update Pages 🌐

- [ ] **Streaks.tsx**
  - [ ] Filter "due today" by default (or toggle)
  - [ ] Sort by: pending → completed → at-risk
  - [ ] Show repeat rule info in card

- [ ] **Index.tsx**
  - [ ] Integrate HabitDialog
  - [ ] Show relevant stats (weekly active count, etc.)

- [ ] **Insights.tsx** (if exists)
  - [ ] Show days active this week
  - [ ] Show most consistent habit

---

## Milestone 8: Testing & Edge Cases 🧪

- [ ] **Unit tests** (`src/test/`)
  - [ ] `repeatRuleUtils.test.ts` — isStreakDueToday, etc.
  - [ ] `gracePeriodUtils.test.ts` — grace period logic
  - [ ] `useStreaks.test.ts` — repeat rule completion

- [ ] **Integration tests**
  - [ ] Create habit with repeat rule → verify storage
  - [ ] Complete habit with repeat rule → verify streak calc
  - [ ] Handle timezone edge cases
  - [ ] Backfill completion dates

- [ ] **Manual QA**
  - [ ] Mobile: All tap targets 44px+
  - [ ] LocalStorage migration works
  - [ ] Existing streaks still work
  - [ ] No jank, animations smooth
  - [ ] Create various repeat rule types

---

## Milestone 9: Celebration Integration 🎉

- [ ] **One-tap completion feedback**
  - [ ] Integrate existing `<Celebration />` component
  - [ ] Show on successful completion
  - [ ] Trigger animation (scale, fade)
  - [ ] Display for 2–3 seconds

- [ ] **Haptic feedback** (optional for Phase 1)
  - [ ] Detect mobile capability
  - [ ] Trigger brief vibration on completion

- [ ] **Tone**
  - [ ] Show encouraging message
  - [ ] Avoid guilt language

---

## Milestone 10: Polish & Shipping 🚀

- [ ] **Code review**
  - [ ] No breaking changes
  - [ ] Reuses existing components
  - [ ] Clean, readable code
  - [ ] Proper TypeScript types

- [ ] **Performance**
  - [ ] No unnecessary re-renders
  - [ ] Animations 60fps
  - [ ] LocalStorage load < 100ms

- [ ] **Documentation**
  - [ ] Add JSDoc comments
  - [ ] Document new types
  - [ ] Update README if needed

- [ ] **Deployment**
  - [ ] Test on real device
  - [ ] Verify PWA still works
  - [ ] No console errors
  - [ ] All existing routes work

---

## Rollout Sequence

**Suggested order:**
1. Milestones 1–2 (types & utils)
2. Milestone 3 (hook updates)
3. Milestones 4–5 (dialogs)
4. Milestone 6 (card display)
5. Milestone 7 (page updates)
6. Milestone 8 (testing)
7. Milestone 9 (celebration)
8. Milestone 10 (polish)

---

## Open Questions Before Starting

1. **Categories** — Are 🔥 Daily Streaks, 📚 Study, 🏃 Health the right defaults? Any others?
2. **Repeat UI** — Show repeat info as badge/label or in expanded view?
3. **Grace period** — 6 hours default OK? Configurable in settings later?
4. **Existing streaks** — Should they auto-migrate to "daily" repeat rule?
5. **Filter "due today"** — Default or optional toggle in Streaks page?

---

## Notes

- **Reuse existing:** AddStreakDialog → HabitDialog, keep same patterns
- **No breaking changes:** All new fields optional with sensible defaults
- **Mobile first:** Test every component on iPhone + Android
- **Calm tone:** Celebrate wins, no shame for misses
