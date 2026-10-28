# Phase 6 Architecture & Technical Blueprint: Tri-Modal UI/UX Engine & Cognitive Behavioral Logics

## 1. Zero-Cost, Open-Source & Offline Invariants

> [!IMPORTANT]
> **Core Axioms for Phase 6**:
> 1. **100% Free for User & Creator ($0 Cost Forever)**: No cloud database, no AI API subscriptions, no external asset CDNs.
> 2. **100% Offline-First**: All theme switches, font fallbacks, cognitive rules, and animations run purely on-device with zero network latency.
> 3. **Universal Responsiveness**: Seamless pixel-perfect experience across Web (desktop/tablet/mobile) and Android (Capacitor native container).

---

## 2. Tri-Modal Appearance & Design System

The app introduces a runtime-switchable aesthetic architecture with three distinct design personalities, allowing users to align the interface with their mental state and focus level:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TRI-MODAL APPEARANCE ENGINE                          │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. CLASSIC          │ 2. MINIMAL           │ 3. EXPRESSIVE             │
│ (Editorial & Calm)  │ (Zen Swiss / Mono)   │ (Kinetic Neo-Glass 2.0)   │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ • Humanist Serif    │ • Monospace Tech     │ • Dynamic Geometric Display│
│ • Warm Slate/Paper  │ • True Pitch Black   │ • Chromatic Glow Halos    │
│ • Gentle Radii      │ • Sharp Hairlines    │ • Multi-Layer Blur        │
│ • Bookish Elegance  │ • Zero Clutter       │ • Sound-Reactive HUD      │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### Option 1: Classic (Refined Editorial & Warm Serenity)
- **Design Philosophy**: Reminiscent of high-end print typography, leather journals, and mindful analog planners. Designed for users who want calm, peaceful habit reflection.
- **Typography Stack**:
  - Headings: `font-serif` (Literata, Charter, Georgia, Cambria, serif).
  - Body & Metrics: Refined humanist sans (`Inter Display`, `system-ui`).
- **Color Palette**:
  - Background: Warm Slate `#121316` / Ivory Card `#1C1E22`
  - Text: Warm Alabaster `#F5F2EB`, Muted Linen `#A8A398`
  - Accent: Antique Amber `#D97706`, Sage Green `#10B981`
- **Card & Border Styling**:
  - 14px border radius, subtle warm 1px borders (`border-amber-500/15`).
  - Traditional Roman numerals and elegant circular check rings.

### Option 2: Minimal (Zen Swiss / Monospace Precision)
- **Design Philosophy**: Stark, distraction-free Bauhaus utility. Eliminates visual noise so the user focuses strictly on atomic execution.
- **Typography Stack**:
  - Headings & Metrics: Pure Monospace (`Geist Mono`, `JetBrains Mono`, `SF Mono`, `Menlo`, `monospace`).
  - Tabular zero-width figures (`font-variant-numeric: tabular-nums`).
- **Color Palette**:
  - Background: True Pitch Black OLED `#000000` / Deep Charcoal `#0D0D0D`
  - Text: Stark White `#FFFFFF`, Industrial Zinc `#71717A`
  - Accent: Single functional color (Phosphor Ember `#FF5722` or Terminal Emerald `#22C55E`).
- **Card & Border Styling**:
  - Sharp 4px or 0px squared corners.
  - Razor-thin 1px hairline borders (`border-white/10`).
  - Zero drop-shadows, zero blurs; hyper-compact density with high data efficiency.

### Option 3: Expressive (Kinetic Neo-Glass & Futuristic Cyber-Calm)
- **Design Philosophy**: High-energy, motivating, and futuristic. Inspired by sci-fi tactical cockpits, dynamic fluid interfaces, and reactive micro-gamification.
- **Typography Stack**:
  - Headings: Bold Geometric Display (`Syne`, `Clash Display`, `Space Grotesk`, sans-serif).
  - Body: Kinetic Sans with dynamic weight shifts on completion.
- **Color Palette**:
  - Background: Obsidian Void `#06050C`
  - Accents: Neon Laser Ember `#FF5500`, Cyan Aurora `#06B6D4`, Electric Violet `#A855F7`.
- **Card & Border Styling**:
  - 24px pill corners, multi-layered glassmorphic blur (`backdrop-filter: blur(28px)`).
  - Top razor light edge (`inset 0 1px 0 rgba(255, 255, 255, 0.2)`).
  - Kinetic audio-reactive glow rings and 3D card tilt physics.

---

## 3. Cognitive Behavioral Habit Logics

### A. Elastic Habit Targets (Mini / Plus / Elite)
To prevent "all-or-nothing" cognitive burnout, habits can define 3 flexible tiers:
1. **Mini (Bad Day Floor)**: Minimal barrier action (e.g. 1 page of reading, 2 minutes of meditation, 5 pushups). Completing Mini preserves the streak.
2. **Plus (Standard Daily Goal)**: Standard habit target (e.g. 20 pages, 15 minutes, 30 pushups).
3. **Elite (High Energy Peak)**: Exceptional stretch goal (e.g. 50 pages, 30 minutes, 60 pushups) granting bonus momentum points.

### B. The Two-Day Rule & "Never Miss Twice" Safety Cushion
- **Principle**: Missing one day is an accident; missing two days is the start of a new, negative habit.
- **Implementation**:
  - If a scheduled day is missed, the habit enters `At-Risk` state.
  - The UI presents a gentle, low-friction "Save Your Streak" card offering the **Mini** target to quickly restore momentum.

### C. Contextual Cue & Habit Anchor Framework
- Every habit can attach an explicit **Trigger Cue**:
  - Example: *"After I pour my morning coffee [CUE], I will write 3 priority tasks [ROUTINE]."*
- Reminders can trigger contextually based on cue schedules.

### D. Milestone Archaeology & Retrospective Timeline
- Automatic detection of historical personal records:
  - Longest streak run in user history with exact date bounds.
  - Lifetime completion volume counter.
  - "Resilience Score": How frequently the user recovered from a missed day on the very next day.

---

## 4. Phase 6 Implementation Deliverables (Status: ✅ Completed & Shipped in v1.0.1)

1. **`src/lib/habits/appearance.ts` & `src/lib/habits/appearance.test.ts`** ✅:
   - Tri-modal theme definitions (Classic, Minimal, Expressive), typography variable injects, and persistence in `localStorage`.
2. **`src/components/habits/AppearanceSwitcher.tsx`** ✅:
   - Interactive 3-way visual toggle with live font preview cards.
3. **`src/lib/habits/elastic.ts` & `src/lib/habits/elastic.test.ts`** ✅:
   - Tiered calculation engine (`mini`, `plus`, `elite`) supporting quantitative and checklist habits, plus Two-Day Rule ("Never Miss Twice") detection.
4. **`src/components/habits/ElasticProgressRing.tsx`** ✅:
   - Multi-tier progress ring visually reflecting Mini, Plus, and Elite completions.
5. **`src/lib/habits/cueAnchor.ts` & `src/lib/habits/cueAnchor.test.ts`** ✅:
   - Habit stacking cue links (`afterHabitId`, `cueText`) and contextual prompt generation.
6. **`src/lib/habits/archaeology.ts` & `src/lib/habits/archaeology.test.ts`** ✅:
   - Historical milestone retrospective tracking all-time longest streak, total volume, and comeback resilience rate.
