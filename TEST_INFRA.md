# E2E Test Infra: Daily Spark Master Redesign

## Test Philosophy
- Opaque-box, requirement-driven. Derived from ORIGINAL_REQUEST.md.
- Verification without depending on implementation internals.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory & Test Coverage Matrix
| # | Feature | Requirement Source | Tier 1 (Coverage >=5) | Tier 2 (Boundary >=5) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---------|-------------------|:---------------------:|:---------------------:|:-----------------:|:-----------------:|
| 1 | Mobile Bottom Navigation & Safe-Area | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Desktop Sticky Sidebar Navigation Rail | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Command Palette (Ctrl+K) | R1 | 5 | 5 | ✓ | ✓ |
| 4 | View Transitions API & Cross-Fade | R1 | 5 | 5 | ✓ | ✓ |
| 5 | Offline Fallback Route (/offline) | R1 | 5 | 5 | ✓ | ✓ |
| 6 | Direct Habit Check-In (No Modal) | R2 | 5 | 5 | ✓ | ✓ |
| 7 | Haptic Feedback (tickTap) & Particle Pop | R2 | 5 | 5 | ✓ | ✓ |
| 8 | Progressive Disclosure (Timer, Stepper, Notes) | R2 | 5 | 5 | ✓ | ✓ |
| 9 | Swipe Gestures & Visible Button Fallbacks | R2 | 5 | 5 | ✓ | ✓ |
| 10 | 6-Month dithercn Heatmap Calendar | R3 | 5 | 5 | ✓ | ✓ |
| 11 | NumberTicker & Animated Circular Progress | R3 | 5 | 5 | ✓ | ✓ |
| 12 | Streak Milestone Badges (3d, 7d, 21d, 50d, 100d) | R3 | 5 | 5 | ✓ | ✓ |
| 13 | Sandboxed Backup Restore & Data Isolation | R4 | 5 | 5 | ✓ | ✓ |
| 14 | Multi-Format Exports (JSON, CSV, Markdown) | R4 | 5 | 5 | ✓ | ✓ |
| 15 | Plain-Language Single-Card Privacy Screen | R4 | 5 | 5 | ✓ | ✓ |
| 16 | Configurable Midnight Rollover (3 AM Night Owl) | R4 | 5 | 5 | ✓ | ✓ |
| 17 | PWA Manifest, Service Worker & Update Toast | R5 | 5 | 5 | ✓ | ✓ |
| 18 | Desktop Packaging & Tauri 2 Configuration | R5 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: Vitest in browser/DOM simulation mode (`npm test`)
- Test suites directory: `src/test/e2e/`
- Test tiers:
  - `tier1-features.test.ts`
  - `tier2-boundaries.test.ts`
  - `tier3-combinations.test.ts`
  - `tier4-realworld.test.ts`
  - `tier5-adversarial.test.ts` (Phase 2 hardening)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | First-time Onboarding & Daily Routine | Mobile Nav, Direct Check-in, Haptics, Circular Progress | Medium |
| 2 | Power User Keyboard Navigation | Desktop Rail, Command Palette Ctrl+K, Quick Toggle, Theme | Medium |
| 3 | Night Owl Midnight Session (01:30 AM) | Rollover Hour (3 AM), Date Keying, Streak Continuity | High |
| 4 | Offline PWA Data Recovery & Backup Vault | Offline Route, Sandbox Restore, Corrupt JSON Isolation, CSV Export | High |
| 5 | Milestone Progression (3d to 100d run) | Dither Heatmap 182-day, NumberTicker, Milestone Badges | High |

## Coverage Thresholds
- Tier 1: >= 5 per feature
- Tier 2: >= 5 per feature (where boundaries exist)
- Tier 3: pairwise coverage across core feature intersections
- Tier 4: >= 5 end-to-end realistic user journeys
- Pass Criterion: 100% of all tests passing cleanly with exit code 0.
