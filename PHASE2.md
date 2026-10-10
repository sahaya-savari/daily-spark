# Phase-2 Roadmap (Planned / Not Started)

## Introduction

This document outlines the planned scope for Phase-2 of the Daily Spark app. Phase-2 is not started and remains a future roadmap. Phase-1 is complete and locked; no changes will affect its stability or data integrity.

## Planned Features (Grouped)

### Notes & Writing
- Standalone offline notes (app-wide, secure)
- Notes per streak

### Safety & Data Integrity
- Backup preview & validation before restore
- Startup data integrity check
- Safe recovery mode for invalid data
- Safe streak editing (limited & controlled)
- Fill in missed past days, with streak and history recalculated safely
- Optional app lock (PIN or fingerprint)
- Optional automatic local backups

### Discoverability & Scale
- Search streaks
- Filter streaks (active / archived / starred)
- Bulk actions on streaks (archive, unarchive, star, delete)
- Streak reordering
- Optional categories for streaks
- Duplicate a streak

### Interaction & Productivity
- Home-screen widgets (including choosing which streaks a widget shows)
- Improved notifications (per-streak time, snooze)
- Swipe a streak card to complete or undo

### Progress & Insights
- Activity grid view (week / month / year) alongside the monthly calendar
- Simple stats summary (totals, best streak, current streak, completion rate)
- Completions per month and streak history over time
- Optional habit strength score based on recent consistency

### Flexibility & Calm
- Vacation mode: pause a streak without breaking it
- Weekly rest days
- Import from other habit apps (Loop Habit Tracker, HabitKit, Habitica, HabitBull, or CSV with dates), converted into the existing Phase-1 backup format

### UX & Accessibility
- Better calendar readability
- UX / UI refinements
- Accessibility improvements
- Light / dark themes, accent colour and true-black (OLED) option

## Under Consideration (Needs Design Decision First)

These change core rules or data structure, so they will only be added if they can be done without breaking Phase-1 data.

- Flexible schedules (X times a week, chosen weekdays, every N days)
- Amount-based streaks (own unit and daily goal)
- Checklists / steps inside a streak

## Not Planned (By Design)

- Cloud sync, accounts or login
- Social sharing or leaderboards
- Focus timers, Pomodoro or sounds
- Broad device permissions (for example all-files storage access or background services)

## Data Safety & Backward Compatibility

- Phase-1 data will remain fully compatible; no breaking changes
- All existing backups will continue to work
- Any new data fields will be optional with safe defaults
- ApplicationId and local storage location will not change
- Upgrading to Phase-2 will not require re-importing or recreating streaks
- Data safety is a top priority for all future updates

## Disclaimer

This document is a planning roadmap only. It does not represent a commitment to deliver any specific feature or timeline. All plans are subject to change or cancellation. Phase-1 remains complete and locked; no changes will be made that affect its stability or data integrity.
