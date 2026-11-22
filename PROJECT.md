# Project: Daily Spark Master Redesign (Phases 3-9)

## Architecture
Daily Spark is an offline-first, local-first habit and streak tracker built with React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Router, and Lucide/Pixel icons.
- **Data Flow**: Reactive local storage store (`src/lib/habits/store.ts`, `storage.ts`) with normalized date keys (`dates.ts`), backup validator (`logic.ts`, `importer.ts`), and immutable export formats.
- **UI Shell**: Dual responsive navigation: mobile floating pill navigation (`DailySparkApp.tsx`) with safe-area padding + desktop sidebar rail for `>=1024px` + global Command Palette (`Ctrl+K`).
- **Visual Engine**: Quiet Obsidian + Tactile Ember design language with dithercn (`lib/dither`) ordered dithering, Magic UI physics-based components (`motion/react`), and SVG micro-interactions.
- **Distribution Channels**: Progressive Web App (PWA) with service worker caching and update toasts, standalone desktop packaging (`scripts/build-desktop.js` producing Windows `.exe`/`.zip` and Linux `.tar.gz`), and complete Tauri 2 configuration in `src-tauri/`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Mobile Bottom Nav Padding | Floating pill bottom navigation with >=48px hit targets, safe-area inset bottom padding, and non-overlapping main scroll container | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Desktop Navigation Rail | Responsive sticky sidebar navigation rail on viewports >= 1024px with active page aria-current and token styling | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Command Palette | Global Ctrl+K / Cmd+K dialog supporting quick tab navigation, habit search/toggle, and theme toggle | M1 | ORIGINAL_REQUEST §R1 |
| 4 | View Transitions API | Native View Transitions API integration for smooth tab switches with graceful CSS cross-fade fallback | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Offline Fallback Route | Dedicated `/offline` route registered in TanStack Router displaying offline state | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Standalone Launcher Routing | PWA standalone display mode and desktop launcher routing directly into `DailySparkApp` | M1 | Survey Explorer 3 |
| 7 | Direct Habit Check-In | Non-blocking direct check-in on Next up hero card and habit list items without celebration modal | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Tactile Haptic Feedback | Trigger `hapticEngine.tickTap()` on habit check-in | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Check-Pop Particle Animation | Lightweight particle burst animation (`CheckPopBurst`) on habit completion | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Progressive Disclosure Inputs | Display timer, counter, and notes indicators only on habits configured with those capabilities | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Swipe Gestures | Touch swipe right to check-in, swipe left to edit, with accessible visible button fallbacks | M2 | ORIGINAL_REQUEST §R2 |
| 12 | dithercn CSS Variables | Add `--dither-cell`, `--dither-ink`, `--dither-paper`, `--dither-bloom` to `src/styles.css` | M3 | ORIGINAL_REQUEST §R3 |
| 13 | 6-Month Dither Heatmap | DitherHeatmapCalendar component using `lib/dither` rendering 182 days (26 weeks) with month headers and mobile scrolling | M3 | ORIGINAL_REQUEST §R3 |
| 14 | Magic UI NumberTicker | Physics-based spring animated counter for streaks and total completions with reduced motion support | M3 | ORIGINAL_REQUEST §R3 |
| 15 | Animated Circular Progress Bar | Animated completion ratio ring (e.g. 1/5 done) integrated into the Next up hero card | M3 | ORIGINAL_REQUEST §R3 |
| 16 | 3d Streak Milestone & Badges | Add 3d milestone to `MILESTONES`, update unit tests, and render 3d, 7d, 21d, 50d, 100d badges | M3 | ORIGINAL_REQUEST §R3 |
| 17 | Sandbox Backup Validation | Parse and validate backup JSON in a memory sandbox before applying to active store; restore standalone notes; isolate live data on failure | M4 | ORIGINAL_REQUEST §R4 |
| 18 | Multi-Format Exports | Full JSON vault backup, CSV tabular export UI button in Settings, and Markdown journal export | M4 | ORIGINAL_REQUEST §R4 |
| 19 | Plain-Language Privacy Screen | Single-card privacy screen stating "No accounts, No servers, No ads, No analytics, No data leaves this device" | M4 | ORIGINAL_REQUEST §R4 |
| 20 | Configurable Midnight Rollover | Configurable day rollover hour (e.g. 3 AM Night Owl setting) in settings and `dates.ts` calculation | M4 | ORIGINAL_REQUEST §R4 |
| 21 | Web App Manifest Hardening | Complete `manifest.webmanifest` with `display_override: ["window-controls-overlay", "standalone"]`, shortcuts, and maskable icons | M5 | ORIGINAL_REQUEST §R5 |
| 22 | Service Worker & Update Toast | Service worker caching with offline strategy and non-blocking update toast notification | M5 | ORIGINAL_REQUEST §R5 |
| 23 | Standalone Desktop Packaging | Verify Windows .exe/.zip and Linux .tar.gz packaging via `node scripts/build-desktop.js` | M5 | ORIGINAL_REQUEST §R5 |
| 24 | Tauri 2 Configuration | Complete valid `src-tauri` configuration (`tauri.conf.json`, `Cargo.toml`, `main.rs`, `capabilities/default.json`) | M5 | ORIGINAL_REQUEST §R5 |
| 25 | Visual Craft Polish & Anti-AI-Slop | Remove residual `purple-*` and `cyan-*` classes, eliminate filler decorations, enforce Quiet Obsidian + Tactile Ember | M5 | ORIGINAL_REQUEST §R5 |
| 26 | Accessibility Compliance | Enforce minimum 4.5:1 text contrast in light and dark modes, keyboard navigation, and screen-reader aria-labels | M5 | ORIGINAL_REQUEST §R5 |
| 27 | 100% E2E Test Suite Pass | Pass all E2E test cases across Tiers 1-4 and Tier 5 adversarial hardening with 0 failures | M6 | ORIGINAL_REQUEST §R5 |
| 28 | Comprehensive Verification | Pass typecheck, lint, all 140+ existing tests + new tests, and clean production build | M6 | ORIGINAL_REQUEST §R5 |
| 29 | Vector Icon System & Anti-AI-Slop | Unified Lucide vector icon outline SVGs across all screens, eliminating faux-retro icon bloat | M7 | UX_RESET §U1 |
| 30 | 1-Tap Cold-Start Starter Habits | Curated starter templates (2L Water, 15m Reading, Morning Walk) with 1-tap instant add to eliminate blank-screen friction | M7 | UX_RESET §U2 |
| 31 | Procedural Web Audio Micro-Tick | Synthesized 16ms damped sine tick (720Hz -> 140Hz) for desktop tactile clicker feel when vibration hardware is absent | M7 | UX_RESET §U3 |
| 32 | Screen Reader Live Announcements | Dynamic aria-live="polite" state notifications announcing completed habits and current streaks | M7 | A11Y_HARDENING §A1 |
| 33 | 4-Tier Settings Hub & Live Search | Reorganized settings into 4 intuitive categories with real-time search filter, status preview badges, and 100% feature preservation | M7 | SETTINGS_REORG §S1 |
| 34 | Codex Botanical Spark & Lucide Icons | Restored authentic Codex Botanical Spark brand mark across favicon, app header, and touch icons; mapped habit icons to modern open-source Lucide React icons; purged leftover pixel icon clutter | M7 | UX_RESET §U4 |
| 35 | GymMane Design Architecture & Hardware Frame | Integrated GymMane-aligned deep obsidian canvas, metallic hardware device frame with physical side keys and dynamic island, 3-line animated display headline, dual high-contrast CTAs, and 2-column hairline feature list | M7 | UX_RESET §U5 |
| 36 | Reference Design Components & Multi-Device Showcase | Upgraded Hero with glowing Ember CTA, segmented preview switcher (PC & Mobile, PC Workspace, Mobile Preview) with desktop window chrome, Bento Capabilities spotlight grid, aligned 4-column platform download cards, and 4-column structured footer with theme switcher & motion pause | M8 | UX_POLISH §U6 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Shell and Navigation | Features 1, 2, 3, 4, 5, 6: Mobile floating bottom nav, safe-area padding, desktop rail, Command Palette, View Transitions, `/offline` route, standalone launcher routing | none | DONE (Gate 2 PASS: 413/413 tests, build and desktop packaging verified) |
| M2 | Core Habit Flow | Features 7, 8, 9, 10, 11: Direct check-in (no celebration modal), `hapticEngine.tickTap()`, check-pop particle animation, progressive disclosure (timer/notes/stepper), swipe gestures | M1 | DONE (Verified: 90/90 Tier 1 tests, 413/413 repo tests, build and desktop verified) |
| M3 | Progress Surfaces | Features 12, 13, 14, 15, 16: dithercn CSS tokens, 6-month DitherHeatmapCalendar (182 days), Magic UI NumberTicker, AnimatedCircularProgressBar on hero card, 3d milestone badge | M1 | DONE (Verified: 90/90 Tier 1, 90/90 Tier 2, 413/413 repo tests, build and desktop verified) |
| M4 | Data, Privacy & Trust | Features 17, 18, 19, 20: Staging-validated backup sandbox restore, CSV export button in Settings, plain-language privacy card, configurable midnight rollover (e.g. 3 AM) | none | DONE (Verified: 90/90 Tier 1, 90/90 Tier 2, 413/413 repo tests, build and desktop verified) |
| M5 | PWA, Desktop & Craft Polish | Features 21, 22, 23, 24, 25, 26: Enhanced manifest, service worker with update toast, desktop packaging scripts, Tauri 2 configuration, purple/cyan removal, 4.5:1 contrast, aria-labels | M1, M4 | DONE (Verified: 90/90 Tier 1, 90/90 Tier 2, 413/413 repo tests, build and desktop verified) |
| M6 | Final Acceptance & Verification | Features 27, 28: Pass 100% of Dual-Track E2E tests (Tiers 1-4), Tier 5 adversarial coverage hardening, typecheck, lint, 140+ tests, build, and packaging verification | M1, M2, M3, M4, M5 | DONE (Verified: 413/413 tests, 0 TS errors, 0 ESLint warnings, production build passed, desktop packaging passed) |
| M7 | UI/UX & Settings 100/100 Hardening | Features 29, 30, 31, 32, 33, 34, 35: Vector icon system, authentic Codex Botanical Spark mark, Lucide habit icons, GymMane design architecture & hardware device showcase, 1-tap starters, Web Audio tactile ticks, live a11y announcements, 4-tier Settings Hub with live search, 100/100 heuristic scores | M1-M6 | DONE (Verified: 450/450 tests, 0 TS errors, 0 ESLint warnings, impeccable clean, production build passed, GitHub Pages deployed) |
| M8 | Reference Design & Component Architecture | Feature 36: Figma reference component upgrade, glowing ember CTA, Bento Spotlight Capabilities, aligned platform download cards, 4-column structured footer, and dual PC/Mobile workspace showcase | M7 | DONE (Verified: 452/452 tests, 0 TS errors, 0 ESLint warnings, production build passed, desktop packaging passed) |


## Interface Contracts

### Shell ↔ App
- `CommandPalette`:
  - Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `habits: Habit[]`, `onSelectTab: (tab: number) => void`, `onToggleHabit: (id: string) => void`, `theme: string`, `onToggleTheme: () => void`.
- `transitionTab`:
  - Signature: `(callback: () => void) => void`. Wraps `document.startViewTransition` with fallback.

### Habit Interactions ↔ Visual Effects
- `hapticEngine.tickTap`:
  - Returns `Promise<void>`.
- `CheckPopBurst`:
  - Props: `x: number`, `y: number`, `onComplete: () => void`. Renders 8 ember particles expanding and fading over 450ms.

### Progress Surfaces ↔ Habit Store
- `DitherHeatmapCalendar`:
  - Props: `data: Array<{ date: string, done: number, total: number, level: 0|1|2|3|4 }>`, `streak: number`, `className?: string`.
- `NumberTicker`:
  - Props: `value: number`, `direction?: "up" | "down"`, `delay?: number`, `className?: string`, `decimalPlaces?: number`.
- `AnimatedCircularProgressBar`:
  - Props: `value: number`, `max?: number`, `min?: number`, `gaugePrimaryColor?: string`, `gaugeSecondaryColor?: string`, `size?: number`, `strokeWidth?: number`, `children?: React.ReactNode`.

### Data / Settings ↔ Core Store
- `HabitSettings`:
  - Extended with `rolloverHour?: number` (0–23, default 0).
- `todayKey(now?: Date, rolloverHour?: number)`:
  - If `now.getHours() < rolloverHour`, returns key shifted back by 24h.
- `inspectBackup(text: string, today: string)`:
  - Returns structured `BackupInspection`.
  - Confirmation restores both habits/settings AND standalone `notes`.

## Code Layout
- `src/components/app/`: Shell, CommandPalette, navigation, DailySparkApp.
- `src/components/habits/`: Habit cards, DitherHeatmapCalendar, CheckPopBurst, ElasticProgressRing, backup dialogs.
- `src/components/magicui/`: NumberTicker, AnimatedCircularProgressBar, text reveal.
- `src/components/settings/`: ModernSettingsView, PrivacyCard, rollover selector.
- `src/lib/habits/`: types, store, logic, dates, haptics, storage.
- `src/lib/dither/`: dithercn engine primitives.
- `src/routes/`: TanStack router route tree (`index`, `offline`, `privacy`, etc.).
- `public/`: `manifest.webmanifest`, `sw.js`, icons.
- `src-tauri/`: Tauri 2 configuration (`tauri.conf.json`, `Cargo.toml`, `src/main.rs`, `capabilities/`).
- `scripts/`: `build-desktop.js`, `postbuild.js`.
