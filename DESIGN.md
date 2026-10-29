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

