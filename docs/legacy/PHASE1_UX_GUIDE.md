# ⚠️ LEGACY DOCUMENT — NOT USED

> **This document is an archived planning draft from early Phase-1 ideation.**  
> **The actual implementation evolved differently.**  
> **For accurate Phase-1 status, see [PHASE1_FINAL.md](PHASE1_FINAL.md)**

---

# 🎨 PHASE 1 UI/UX DESIGN GUIDE (ARCHIVED)

## Design Philosophy: Calm, Minimal, Mobile-First

### Core Principles
1. **One action per card** — Primary CTA only
2. **Subtle motion** — No harsh animations, only smooth fades/scales
3. **Progressive disclosure** — Hide advanced options behind toggles
4. **Touch-friendly** — 44px+ tap targets
5. **Consistent** — Reuse existing components (Radix UI + Tailwind)

---

## Component Specifications

### 1. HabitDialog (Enhanced AddStreakDialog)

**Layout (Mobile Bottom Sheet):**
```
┌─────────────────────┐
│  New Habit       ✕  │  ← Header with close
├─────────────────────┤
│                     │
│  🔥 🏃 📚 💪 ... │ ← Emoji picker (existing)
│                     │
│  ┌─────────────────┐ │
│  │ Habit name      │ │ ← Name input (existing)
│  └─────────────────┘ │
│                     │
│  ┌─────────────────┐ │
│  │ Note (optional) │ │ ← NEW: Optional motivation
│  │ "Easy counts"   │ │
│  └─────────────────┘ │
│                     │
│  Category:          │ ← NEW: Radio selector
│  ◉ 🔥 Daily Streaks│
│  ○ 📚 Study        │
│  ○ 🏃 Health       │
│                     │
│  Repeat:            │ ← NEW: Repeat selector
│  ◉ Daily           │
│  ○ Weekly          │
│  ○ Custom interval │
│    ↓ (show weekday picker if weekly)
│                     │
│  ⏰ Due time:       │ ← NEW: Optional HH:MM
│  [18:00]           │
│                     │
│  ┌─────────────────┐ │
│  │  Create Streak  │ │ ← Primary CTA
│  └─────────────────┘ │
│                     │
└─────────────────────┘
```

**Behavior:**
- Emoji picker: Grid, scrollable, selected highlighted with fire-gradient
- Name input: Required, focus visible
- Note textarea: Optional, 2-3 lines max
- Category: 3 radio options, show icon + label
- Repeat: Radio selector + conditional sub-UI
- Due time: Only if not daily-only? Or always show?
- Submit: Disabled until name filled

**Styling:**
- Use existing Radix UI components: Dialog, RadioGroup, Input, Button
- Tailwind: Consistent spacing, no custom CSS
- Colors: Use existing palette (fire-gradient, muted, foreground, etc.)
- Animations: Fade in dialog, no bouncing

---

### 2. RepeatRuleSelector

**UI (Inside HabitDialog):**
```
Repeat:
◉ Every day
○ On specific days
  ↓
  Mon ☐  Tue ☐  Wed ☑
  Thu ☑  Fri ☑  Sat ☐  Sun ☐
  
○ Every N days
  ↓
  Every [2] days
  [input: 1-365]
```

**Behavior:**
- Default: "Every day"
- Click "On specific days" → show weekday checkboxes (Sun-Sat order)
- Click "Every N days" → show number input (default 2)
- Validation: At least 1 day selected for weekly
- Stored as: `{ type: 'weekly', weekDays: ['MON', 'WED', 'FRI'] }`

**Styling:**
- Use Radix `RadioGroup` + `Checkbox`
- Keep minimal, no extra labels
- Selected state clear but not flashy

---

### 3. StreakCard (Enhanced)

**Display (Mobile):**
```
┌──────────────────────────┐
│  🔥      LeetCode        │ ← Emoji + name
│           Daily          │ ← Category badge
│                          │
│ "1 problem per day"      │ ← Note (if exists)
│                          │
│ 🔥 12-day streak         │ ← Streak display
│ 🏆 Best: 24 days         │ ← Longest reference
│ ⏰ Due 6 PM              │ ← Due time (if set)
│ Every Mon/Wed/Fri        │ ← Repeat rule (if not daily)
│                          │
│ ┌──────────────────────┐ │
│ │  ✓ Mark Complete    │ │ ← Primary CTA
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

**Spacing:**
- Emoji: 12h x 12h, left margin
- Name: 16px font, medium weight
- Category badge: Small, right side (icon + text)
- Note: 14px, muted color, italic (optional)
- Streak info: 14px, teal/orange color with 🔥 icon
- CTA button: Full width, 44px+ height

**States:**
1. **Pending** (not done today):
   - Border: default
   - Button text: "Mark Complete"
   - Icon badge: 🔥 (fire gradient)
   - Warning: "Miss today → streak breaks"

2. **Completed** (done today):
   - Border: success/50%, light green
   - Background: success/5%
   - Button text: "Edit" or show ✓ check
   - Icon badge: ✓ (green)
   - No warning

3. **At-risk** (missed day(s)):
   - Border: destructive/50%, light red
   - Background: destructive/5%
   - Button text: "Mark Complete" or "Recover"
   - Icon badge: ⚠️ (warning)
   - Message: "Streak broken (1 day missed)"

**Animations:**
- Hover: Subtle scale (1.02x) or shadow increase
- Tap: Active state (slight color shift)
- Completion: Checkmark scale-in (0.8s ease-out)

**Styling:**
- Use existing `cn()` utility for class merging
- Colors: Use Tailwind semantic colors (success, destructive, etc.)
- Shadows: `shadow-sm` for depth
- Borders: `border border-border` (consistent with UI)
- Font: Use existing font scale

---

### 4. Celebration Component (Integrate Existing)

**When triggered:**
- User taps "Mark Complete" button
- Streak successfully updated

**Visual:**
```
        🎉
          ✨
    ✓ Awesome!
   12-day streak
        
   (fades out after 2-3s)
```

**Implementation:**
- Use existing `<Celebration />` component
- Overlay center of screen
- Scale animation: 0.8 → 1.1 → 1.0 (ease-out)
- Opacity: 0 → 1 → 0 (ease-in-out)
- Duration: 2-3 seconds

**Tone options:**
- "Great!"
- "Awesome!"
- "You're on fire!"
- "Nice streak!"
- (Rotate, don't repeat same message)

---

### 5. Category Badge

**Display options:**

**Option A (Compact):**
```
[🔥 Daily Streaks]  ← Icon + label, pill shape
```

**Option B (Icon only):**
```
🔥  ← Right-aligned, subtle
```

**Recommendation:** Option A (clearer for first-time users), positioned right side of name.

**Styling:**
- Pill shape: `rounded-full`, `px-2 py-1`
- Size: 12-14px font
- Color: Match category (future: custom color per category)
- Subtle background: `bg-muted`

---

### 6. Repeat Rule Badge

**Display (if not daily):**
```
Every Mon/Wed/Fri  ← Show on card subtitle
```

Or:
```
Every 2 days       ← For custom intervals
```

**Styling:**
- 13px font, muted color
- Position: Below category badge or next to due time
- Helpful, not cluttered

---

## Color Palette (Existing Tailwind)

Use existing definitions:
- **Primary**: fire-gradient (orange/red) for streak status
- **Success**: green for completed
- **Destructive**: red for broken/at-risk
- **Muted**: gray for secondary info
- **Background**: light or dark mode aware
- **Card**: Surface color for dialogs/cards

---

## Motion Guide (Calm, Minimal)

### Transition Timings
- Fast hover effects: 150ms
- Card tap feedback: 100ms
- Dialog open: 200ms (fade-in)
- Celebration animation: 2-3s total
- Checkbox toggle: 100ms

### Easing
- UI interactions: `ease-out` (bouncy feels cheap here)
- Celebration: `ease-in-out` (smooth entry/exit)
- Hover states: `ease-in-out`

### Avoid
- ❌ Bouncing animations
- ❌ Flash colors
- ❌ Multiple simultaneous animations
- ❌ Animations on every interaction

### Approved
- ✅ Scale 1.0 → 1.05 on hover
- ✅ Fade-in/fade-out for overlays
- ✅ Checkmark slide/scale
- ✅ Smooth transition between states

---

## Mobile UX Checklist

- [ ] **Touch targets:** All buttons/interactive ≥ 44x44px
- [ ] **Bottom sheet:** Dialogs open from bottom, not center
- [ ] **Safe area:** Respects notch/safe area padding
- [ ] **Scrolling:** No jank, smooth 60fps
- [ ] **Orientation:** Works on portrait + landscape
- [ ] **Keyboard:** Input fields don't push UI off-screen
- [ ] **Haptic:** Optional vibration on completion (iOS/Android)
- [ ] **Responsive:** Text readable at all sizes
- [ ] **Contrast:** WCAG AA compliant text colors

---

## Accessibility (A11y)

- [ ] Semantic HTML: `<button>`, `<input>`, `<label>`
- [ ] ARIA labels: For icon-only buttons
- [ ] Keyboard navigation: Tab/Space/Enter work
- [ ] Focus visible: Clear focus ring (Radix UI provides)
- [ ] Color not sole indicator: Use icons + text
- [ ] Text alternatives: Emojis have labels
- [ ] Form labels: Associated with inputs

---

## Responsive Grid

### Mobile (< 640px)
- Full width cards, single column
- Dialogs: bottom sheet
- Navigation: bottom nav (existing)

### Tablet (640px - 1024px)
- Cards: 2 columns (optional, may keep 1)
- Dialogs: centered but max-width 90vw
- Layout: Side padding increases

### Desktop (> 1024px)
- Cards: 2-3 columns
- Dialogs: Centered, max-width 500px
- Sidebar navigation (future)

---

## Tone & Copy Examples

### Category Selector
```
🔥 Daily Streaks     ← For daily habits
📚 Study            ← For learning
🏃 Health           ← For fitness/wellness
```

### Repeat Rules
```
Daily              ← Every single day
Specific days      ← Pick Mon/Wed/Fri
Custom interval    ← Every 2-3 days
```

### Streak Display
```
Positive (pending):
  "🔥 12-day streak | Miss today → resets"

Positive (completed):
  "✓ Great! 12-day streak"

Soft warning (at-risk):
  "Streak broken (1 day missed)"
  → Optional recovery button (Phase 2)
```

### Motivation (Celebration)
```
"Great!"
"Awesome!"
"You're on fire!"
"Nice work!"
"Consistency wins!"
```

---

## File Structure (Styling)

- Inline Tailwind classes (existing pattern)
- Use `cn()` utility for conditional classes
- No new CSS files (keep existing App.css)
- Radix UI + Tailwind primitives only

---

## Summary: Keep It Minimal

| What to DO | What NOT to DO |
|-----------|----------------|
| Calm, single-purpose cards | Cluttered cards with 10+ fields |
| Subtle animations | Flashy, distracting effects |
| Mobile-first layout | Desktop assumptions |
| Reuse Radix components | Build custom UI from scratch |
| Encouraging tone | Guilt or shame language |
| Progressive disclosure | Show all options at once |

---

**Ready to start building? Let me know! 🚀**
