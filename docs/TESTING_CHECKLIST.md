# StreakFlame Testing Checklist

Pre-publish testing checklist to ensure app quality and reliability.

---

## ✅ Functional Tests

### Streak Operations
- [ ] Create a new streak with name and emoji
- [ ] Complete a streak with single tap
- [ ] Verify double-tap on same day does NOT increment streak
- [ ] Pause a streak and verify it's marked as paused
- [ ] Resume a paused streak
- [ ] Miss a day → verify correct reset happens ONLY after midnight
- [ ] Verify best streak is preserved after reset
- [ ] Archive a streak
- [ ] Restore an archived streak
- [ ] Delete a streak permanently

### Data Persistence
- [ ] Create streaks → close app → reopen → streaks persist
- [ ] Complete streaks → close app → reopen → completions persist
- [ ] Settings changes persist after app restart

---

## 🕐 Time & Date Tests

### Timezone Handling
- [ ] Complete streak at 11:59 PM → verify counts for current day
- [ ] Check app after midnight → verify new day detected
- [ ] Manually change phone timezone → app handles gracefully
- [ ] Travel across timezones → streaks don't break incorrectly

### Edge Cases
- [ ] Daylight Saving Time transition (spring forward)
- [ ] Daylight Saving Time transition (fall back)
- [ ] Manual clock change forward by 1 day
- [ ] Manual clock change backward by 1 day
- [ ] App not opened for 3+ days → streaks reset correctly
- [ ] App opened exactly at midnight

---

## 📴 Offline Tests

### Offline Behavior
- [ ] Enable airplane mode
- [ ] Complete a streak offline → verify local state updates
- [ ] Create a new streak offline
- [ ] Disable airplane mode
- [ ] Verify data syncs correctly when back online
- [ ] No duplicate entries after sync

### Network Edge Cases
- [ ] Slow network (throttled connection)
- [ ] Network drops mid-operation
- [ ] App works without any network at all

---

## 📱 UI/UX Tests

### Visual & Interaction
- [ ] All buttons visible and tappable on small phones (320px width)
- [ ] All buttons visible and tappable on large phones
- [ ] All buttons visible and tappable on tablets
- [ ] No elements hidden behind navigation bars
- [ ] No stuck modals or dialogs
- [ ] Smooth scrolling on long streak lists (50+ items)
- [ ] Animations don't stutter on mid-range devices
- [ ] Dark mode displays correctly
- [ ] Light mode displays correctly
- [ ] System theme switching works

### Accessibility
- [ ] Text readable at all sizes
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Touch targets at least 44x44 points
- [ ] Screen reader announces elements correctly

### Error States
- [ ] Graceful error messages (no technical jargon)
- [ ] Loading states visible during operations
- [ ] Empty states when no streaks exist
- [ ] Network error handling

---

## 🔐 Security Tests (CIA Triad)

### Confidentiality
- [ ] User A cannot see User B's streaks
- [ ] Logged out users cannot access streak data
- [ ] API endpoints require authentication
- [ ] Sensitive data not logged to console

### Integrity
- [ ] Cannot increment streak count via API manipulation
- [ ] Server-side validation prevents future dates
- [ ] No duplicate streak completions for same day
- [ ] Data consistency after concurrent operations

### Availability
- [ ] App usable without internet (offline-first)
- [ ] Graceful degradation when Supabase is down
- [ ] Error messages don't crash the app
- [ ] Recovery from unexpected errors

---

## 🔔 Notification Tests

### Reminder Logic
- [ ] Reminder fires only if streak NOT completed today
- [ ] Reminder respects enabled/disabled setting
- [ ] Paused streaks don't trigger reminders
- [ ] Only 1 reminder per streak per day
- [ ] Completing streak cancels pending reminder

### Edge Cases
- [ ] Phone reboot → reminders still work
- [ ] App force-killed → reminders still scheduled
- [ ] Timezone change → reminder times adjust
- [ ] Reminder time changed → old schedule cancelled
- [ ] Offline → reminder queued for later

---

## 📱 Widget Tests

### Single Streak Widget
- [ ] Displays correct emoji
- [ ] Displays correct streak count
- [ ] Color reflects status (active/paused/missed)
- [ ] Tap opens app to correct streak
- [ ] Updates after streak completion

### Multi-Streak Widget
- [ ] Shows top 3-5 streaks
- [ ] Each cell shows emoji + count
- [ ] Tap opens main dashboard
- [ ] Updates daily automatically

### Performance
- [ ] Widget loads in under 500ms
- [ ] No memory leaks from widget
- [ ] Widget updates without manual refresh

---

## ⚡ Performance Tests

### Speed Benchmarks
- [ ] App cold start: under 2 seconds
- [ ] Streak completion: under 300ms feedback
- [ ] Screen transitions: under 200ms
- [ ] List scroll: 60fps on mid-range devices

### Memory
- [ ] No memory leaks after extended use
- [ ] App doesn't crash with 100+ streaks
- [ ] Images/animations don't cause OOM

---

## 🧪 Regression Checklist

After any code change, verify:
- [ ] Existing streaks still display
- [ ] Completion still works
- [ ] Stats calculate correctly
- [ ] Navigation works
- [ ] Theme switching works
- [ ] Data persists after restart

---

## 📋 Sign-Off

| Test Category | Passed | Tester | Date |
|---------------|--------|--------|------|
| Functional    | ☐      |        |      |
| Time/Date     | ☐      |        |      |
| Offline       | ☐      |        |      |
| UI/UX         | ☐      |        |      |
| Security      | ☐      |        |      |
| Notifications | ☐      |        |      |
| Widgets       | ☐      |        |      |
| Performance   | ☐      |        |      |

**Ready for Release:** ☐ Yes ☐ No

**Notes:**
```
(Add any issues or observations here)
```
