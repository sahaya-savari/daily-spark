# Streak Logic Unit Tests - Structure & Coverage Map

## Overview
This test file covers **6 critical sections** of the streak logic, with **30+ test cases** ensuring data integrity and correctness.

---

## TEST STRUCTURE

### SECTION 1: Status Calculation (`getStreakStatus`)
**Purpose**: Verify streak status is correctly determined from dates

| Test Case | Input | Expected Output | Why It Matters |
|-----------|-------|-----------------|----------------|
| Completed today | `lastCompletedDate === today` | `'completed'` | UI shows checkmark |
| Pending (yesterday) | `lastCompletedDate === yesterday` | `'pending'` | User has grace period until tomorrow |
| Pending (never) | `lastCompletedDate === null` | `'pending'` | New streaks start pending |
| At-risk | `lastCompletedDate < yesterday` | `'at-risk'` | User sees warning, streak will reset |

---

### SECTION 2: Streak Completion Logic (`completeStreak`)
**Purpose**: Ensure math is correct when user completes a streak

| Test Case | Scenario | Expected | Why Critical |
|-----------|----------|----------|----------------|
| **First completion** | Never completed before | `currentStreak: 1, bestStreak: 1` | Foundation of streak tracking |
| **Continue streak** | Completed yesterday | `currentStreak: 6 (was 5)` | Main use case, happens daily |
| **Reset on break** | Completed 2+ days ago | `currentStreak: 1, bestStreak: 8` | Streak logic is only rule for reset |
| **Duplicate prevention** | Already completed today | `No change` | Prevent accidental double-counts |
| **Best streak update** | `currentStreak > bestStreak` | `bestStreak` updates | Tracks user's personal best |

---

### SECTION 3: Undo Functionality (`undoStreak`)
**Purpose**: Verify undo correctly restores previous state

| Test Case | Input | Expected | Why It Matters |
|-----------|-------|----------|----------------|
| **Restore state** | Undo after completion | Restore `currentStreak, lastCompletedDate, completedDates` | Users need safety net for mistakes |

---

### SECTION 4: Import/Export Scenarios
**Purpose**: Ensure streaks survive JSON round-trip intact

| Test Case | Scenario | Expected | Why Critical |
|-----------|----------|----------|----------------|
| **Historical restore** | Import with 10 completedDates | All preserved, status recalculated | Core feature: restore from backup |
| **Gaps in history** | Imported with gaps (broke streak) | Loaded as-is, status correct | Historical accuracy essential |

---

### SECTION 5: Edge Cases
**Purpose**: Handle malformed or unexpected data gracefully

| Test Case | Input | Expected |
|-----------|-------|----------|
| Null lastCompletedDate | `lastCompletedDate: null` | No crash, treat as pending |
| Duplicate dates in completedDates | `['02-06', '02-06', '02-06']` | No crash, UI displays correctly |
| Empty completedDates | `completedDates: []` | Treat as never completed |
| **Data corruption** | `bestStreak < currentStreak` | Detected and flagged (see section 3: Validation) |

---

### SECTION 6: Multiple Streaks
**Purpose**: Verify streaks don't interfere with each other

| Test Case | Scenario | Expected |
|-----------|----------|----------|
| Isolated completion | Complete streak A, not B | Only A incremented, B unchanged |
| Stats accuracy | 3 streaks, 2 completed | `totalStreaks: 3, activeStreaks: 2` |

---

## Key Test Data Patterns

### Pattern 1: Fresh Streak
```json
{
  "id": "fresh-1",
  "name": "Exercise",
  "currentStreak": 0,
  "bestStreak": 0,
  "lastCompletedDate": null,
  "completedDates": []
}
```

### Pattern 2: Active Streak (Continuous)
```json
{
  "currentStreak": 5,
  "bestStreak": 8,
  "lastCompletedDate": "2026-02-05",
  "completedDates": ["2026-02-01", "2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05"]
}
```

### Pattern 3: Broken Streak (At-Risk)
```json
{
  "currentStreak": 5,
  "bestStreak": 10,
  "lastCompletedDate": "2026-02-04",  // 2 days ago
  "completedDates": ["2026-01-31", "2026-02-01", "2026-02-02", "2026-02-03", "2026-02-04"]
}
```

### Pattern 4: Completed Today
```json
{
  "currentStreak": 6,
  "bestStreak": 8,
  "lastCompletedDate": "2026-02-06",
  "completedDates": [..., "2026-02-05", "2026-02-06"]
}
```

---

## Mock Strategy

```typescript
// 1. Date Utils Mocked
getTodayDate() → '2026-02-06'
getYesterdayDate() → '2026-02-05'
isToday(date) → date === '2026-02-06'
isYesterday(date) → date === '2026-02-05'

// 2. Services Mocked
actionHistory.recordAction() → spy
actionHistory.canUndoAction() → configurable
reminderService.* → spies
hapticService.* → spies

// 3. localStorage Mocked (default)
// Vitest provides automatic mocking
```

---

## Critical Invariants (Must Always Hold True)

✅ **bestStreak ≥ currentStreak** (always)  
✅ **currentStreak ≥ 0** (never negative)  
✅ **lastCompletedDate ∈ completedDates** (if lastCompletedDate exists)  
✅ **completedDates are sorted** (or at least consistent)  
✅ **status determined only by lastCompletedDate** (not by currentStreak)  
✅ **Import/Export are lossless** (round-trip preserves data)

---

## Test Execution Plan

```bash
# Run all streak tests
npm run test -- useStreaks.test.ts

# Watch mode (development)
npm run test:watch -- useStreaks.test.ts

# With coverage
npm run test -- --coverage useStreaks.test.ts
```

---

## What Gets Tested vs. What Doesn't (Yet)

### ✅ Tested
- Streak calculation math
- Status logic
- Undo restoration
- Edge cases (nulls, empty arrays, corrupted data)
- Multi-streak interactions
- Import restoration

### ❌ Not Tested (Will be in Item 2 & 3)
- JSON schema validation (Item 2)
- Data corruption recovery (Item 3)
- localStorage corruption handling (Item 3)
- Backup rotation (Item 3)
- UI rendering (integration tests, later)
- Reminder integration (separate test file)

---

## Running These Tests Now

The test file is created, but we need to install/configure testing dependencies:

```bash
# Already in package.json:
✅ vitest
✅ @testing-library/react
✅ jsdom

# Just run:
npm run test -- src/hooks/useStreaks.test.ts
```

---

## Next Steps

1. ✅ **You're here**: Test structure review
2. → Run tests (see errors, understand real behavior)
3. → Fix any test mocks or assertions
4. → Move to Item 2 (JSON validation)
5. → Move to Item 3 (Recovery strategy)

