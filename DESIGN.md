# DESIGN.md — Daily Spark Design System & Architecture

## 1. Principles
- **Quiet Obsidian, Tactile Ember**: Boldness is spent in exactly ONE place: the primary Ember check-in trigger. Everything else stays calm, quiet, and low-cognitive-load.
- **100% Offline & Local Sovereignty**: No accounts, no telemetry, no cloud dependencies. Staging-verified JSON backup/restore.
- **Thumb-First Tactile Rhythm**: Single-tap check-in, 48px min touch targets, no multi-level dropdowns for daily logging.

## 2. Color Tokens
| Token | Light Hex | Dark Hex | Role |
| :--- | :--- | :--- | :--- |
| `--spark-ember` | `#D96B27` | `#EC894C` | Signature primary action, active streak flame, completed state |
| `--spark-root` | `#A6562E` | `#BF7245` | Secondary momentum, sprout node, category tags |
| `--spark-bg` | `#F8F6F2` | `#0E0F12` | Canvas ground, dot grid substrate |
| `--spark-surface` | `#EFECE6` | `#18191E` | Card containers, sidebar background |
| `--spark-surface-2`| `#E4E0D8` | `#22242B` | Nested wells, input backgrounds, active pills |
| `--spark-text` | `#1A1A1E` | `#F5EBE1` | Primary text, high legibility warm chalk |
| `--spark-muted` | `#6E6A64` | `#8C877E` | Secondary captions, timestamps, inactive icons |
| `--page` | `#F8F6F2` | `#0A0908` | GymMane canvas ground, deep obsidian base |
| `--raised` | `#EFECE6` | `#141414` | GymMane primary raised card surfaces |
| `--raised2` | `#E4E0D8` | `#1E1E1E` | GymMane secondary elevated inputs and wells |
| `--border-line` | `#D1CCC0` | `#262626` | Architectural hairline card & section borders |
| `--border-hi` | `#B8B2A5` | `#3A3A3A` | Highlighted hairline borders and active outlines |
| `--clay` | `#BF7245` | `#D9A184` | Warm tactile clay accent for badges and secondary highlights |

## 3. Typography Hierarchy
- **Display**: `Mozilla Headline`, bold/extrabold, 24px–48px. Used for hero titles, section headlines, milestone celebratory text.
- **UI / Body**: `Inter`, 400/500/600, 13px–16px. Used for habit names, settings options, modal controls, buttons.
- **Numbers / Metrics**: `JetBrains Mono`, 500/600 tabular figures. Used for streak counts (`18d`), ratios (`3/5 done`), time inputs, and calendar dates.

## 4. Spacing & Radius Scale
- **Radius**:
  - `sm` (8px): Badges, inline tags, small chip filters.
  - `md` (14px): Input fields, sub-cards, habit list items.
  - `lg` (24px): Primary hero card, modal sheets, setting groups.
  - `full` (9999px): Floating bottom navigation, check-in action buttons, day status pills.
- **Spacing**: 4px base rhythm (`gap-1.5` = 6px, `gap-3` = 12px, `p-4` = 16px, `p-6` = 24px).

## 5. Component Allocations
- **dithercn**: Signature dithered heatmap matrix on Progress screen, dithered brand spark loader.
- **React Bits**: SplitText entry animation on landing page hero headline.
- **Magic UI**:
  - `NumberTicker`: Dynamic streak counters and total check-in count.
  - `AnimatedCircularProgressBar`: Glanceable daily goal circle on home dashboard.
  - `ProgressiveBlur`: Gradient glass effect behind sticky header and floating navbar.

## 6. Brand Mark: Codex Botanical Spark
- **Concept**: A radiant four-point spark emerging from a botanical seedling sprout, symbolizing daily personal growth without corporate gamification.
- **Color Geometry**:
  - Primary Radiant Diamond Spark: `#EC894C` (Ember).
  - Central Botanical Sprout / Seedling: `#BF7245` (Gold Terracotta).
  - Background Tile: `#1C1D22` with hairline border `rgba(255,255,255,0.08)`.
- **Assets**: Standardized across `public/favicon.svg`, `public/apple-touch-icon.svg`, `public/icon-192x192.svg`, `public/icon-512x512.svg`, and `src/components/brand/Logo.tsx` (`SparkMark` and `Logo`).

## 7. Open-Source Vector Icon System
- **Library**: `lucide-react` (clean, accessible outline SVGs with `strokeWidth={1.75 - 2}`).
- **Zero AI-Slop Policy**: Purged all fuzzy, inconsistent AI-generated pixel art bitmaps in favor of crisp, scalable vector SVGs across all 33 habit categories.
- **Unified Obsidian Badges**: In Settings and Habit Detail views, arbitrary multi-colored backgrounds (amber/violet/emerald/rose/cyan/pink) have been replaced with uniform Quiet Obsidian containers (`bg-surface-2/90 border border-border/40 text-foreground/80 hover:text-ember hover:border-ember/30 hover:bg-ember/5`).

## 8. Hardware Device Showcase (`Device` & `MiniPhone`)
- **Structure**: Inspired by GymMane's hardware device framing.
- **Metallic Bezel Gradient**: `linear-gradient(155deg, #3a3a3a 0%, #121212 26%, #0b0b0b 62%, #2c2c2c 100%)`.
- **Side Keys**:
  - Volume Up (`vol`): Left side, metallic edge reflection.
  - Volume Down (`vol2`): Left side, metallic edge reflection.
  - Power / Lock Key (`pwr`): Right side, precision physical button.
- **Dynamic Island**: Centered top pill `74px x 19px` with inner shadow and subtle camera lens reflection.
- **Interactive Live Viewport**: Real 390×844 resolution viewport rendering the live Daily Spark app with active habit logging and tab navigation.
- **Screens Rail**: Continuous horizontal phone parade showcasing real screens (Today, Habits, New habit, Progress, Calendar, Settings).

