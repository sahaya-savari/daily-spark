# Phase 4 Architecture & Technical Blueprint: Deep Domain Logic & Futuristic Design

## 1. Zero-Cost, Open-Source & Offline Invariants

> [!IMPORTANT]
> **Economic & Operational Axioms**:
> 1. **100% Free for User & Creator ($0 Cost Forever)**: Zero backend servers, zero database costs, zero paid third-party API dependencies. All operations execute strictly on-device.
> 2. **Fully Offline by Default, Optional Zero-Cost Online**: All habit features, math, streak logic, and focus timers operate without an internet connection. Any optional online feature (e.g. sharing cards, importing web templates) runs entirely client-side.
> 3. **100% Permissive Open Source**: Built with open standards (Web Audio API, Web Crypto API, Canvas API) under MIT-compatible principles.

---

## 2. Comparative Analysis: InlitX/streak vs. Daily Spark

| Domain Area | Daily Spark (Phases 1–3) | InlitX/streak Open-Source Engine | Phase 4 Target for Daily Spark |
| :--- | :--- | :--- | :--- |
| **Habit Classification** | Boolean only (Done / Not done) | 3 Core Kinds: `positive`, `negative` (avoid), `quantitative` | Support all 3 kinds while defaulting gracefully to `boolean` for backward compatibility. |
| **Visual Aesthetic** | Flat card surfaces & static borders | Multi-theme styles: Classic, Minimal, Express | **Futuristic Neo-Glass & Cyber-Calm HUD**: Translucent blurred surfaces, glow arcs, OLED contrast, and sleek typography. |
| **Streak Psychology** | Strict continuous integer (miss = 0) | Dual metric: Raw Streak + Exponential Half-Life Strength Score ($\lambda = 0.5^{i / 12}$) | Add **Habit Strength Score (0–100%)** so single misses after 90 days don't demotivate users. |
| **Quantitative Logging** | Not supported | Daily goal, custom unit, incremental quick logging (`+250ml`, `+10p`), lap tracking | Full quantitative progress engine with segmented futuristic progress bars and quick chips. |
| **Avoid / Quit Habits** | Not supported | Days clean streak, relapse counter, daily cost saved tracker, relapse moment logs | Quit habit mode with clean streaks, relapse logs, and money/time saved calculators. |
| **Checklist Habits** | Single atomic habit | `substeps: List<Substep>` per habit with step-level and all-step completion | Granular subtask steps for morning/evening routines with auto-completion. |
| **Vacation / Pause** | Boolean pause flag (`isPaused`) | `VacationPeriod(start, end)` with `isNeutralOn(date)` skipping | Multi-period vacation ranges that preserve historical continuity without breaking streaks. |
| **Focus Sessions** | External / None | Embedded Pomodoro/countdown timer linked directly to habit completion | Distraction-free focus timer with Web Audio synthesized ambient sounds and real-time audio wave visuals. |
| **Third-Party Import** | Generic CSV only | Auto-detects Loop Habit Tracker, HabitKit, Habitica, HabitBull, Habitify, & matrix CSV | Universal import engine migrating user history from all major offline trackers. |
| **Progress Sharing** | None | High-resolution shareable progress card | Renderable SVG/Canvas exportable futuristic progress card for offline saving. |

---

## 3. Modern Aesthetic Futuristic Design System

### A. Neo-Glass & Cyber-Calm Visual Tokens
1. **Translucent Glassmorphism with Top Light Edge**:
   - Elevated cards use `backdrop-filter: blur(20px)` over subtle tonal gradients.
   - Distinctive razor-thin 1px top highlight (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`) and muted outer perimeter borders (`border: 1px solid rgba(255, 255, 255, 0.07)`).
2. **True OLED "Obsidian Space" Mode**:
   - Pure `#050508` background for ultra-deep OLED contrast, eliminating washed-out grays and extending mobile battery life.
3. **Ember & Cyan Laser Micro-Glows**:
   - Subtly blurred drop-shadows on active progress rings (`filter: drop-shadow(0 0 8px color-mix(in oklab, var(--ember) 40%, transparent))`).
   - Clean indicators without garish or neon confetti distraction.

### B. Futuristic HUD Cards & Component Physics
1. **Segmented Multi-Lap Progress Bar**:
   - Quantitative habits display a futuristic sci-fi segmented bar:
     - Lap 1 fills the baseline segments.
     - Laps 2+ illuminate with an elevated glow and secondary tier color.
2. **Radial Momentum Strength Gauge**:
   - A clean circular SVG dial (0–100%) inspired by spacecraft HUDs:
     - 0–40%: Soft amber `#F59E0B`
     - 41–75%: Sunlit apricot `#F29559`
     - 76–100%: Luminous emerald/ember glow
3. **Spring Micro-Interactions**:
   - Spring physics on tap targets (`transform: scale(0.96) -> scale(1.02) -> scale(1.0)`).
   - Accordion expansion for checklist subtasks using fluid CSS grid transitions (`grid-template-rows: 0fr -> 1fr`).
4. **Futuristic Focus Deck Visualizer**:
   - Real-time breathing wave pulse that oscillates rhythmically with Web Audio synthesized rain and brown noise.

---

## 4. Mathematical & Algorithmic Specifications

### A. Habit Strength Score Formula (`_strength()`)
$$\text{Score} = \frac{\sum_{i=0}^{W-1} w_i \times v(\text{day}_{-i})}{\sum_{i=0}^{W-1} w_i}$$
Where:
- $W = 90$ (evaluation window in days).
- $\text{Half-life } H = 12.0$ days.
- Weight $w_i = 0.5^{i / H}$.
- If $\text{day}_{-i}$ is neutral (`isNeutralOn(day)`) or not scheduled, it is excluded from both sums.
- Day value $v(\text{day})$:
  - `positive` (boolean): $1.0$ if completed, else $0.0$.
  - `quantitative`: $\min\left(1.0, \frac{\text{count}}{\text{target}}\right)$.
  - `negative` (avoid): $0.0$ if a relapse was logged, else $1.0$.

### B. Quantitative Lap & Progress Logic (`QuantProgress`)
$$\text{Laps} = \left\lfloor \frac{\text{Current Value}}{\text{Target Value}} \right\rfloor$$
$$\text{Fraction} = \begin{cases} \frac{\text{Current Value}}{\text{Target Value}} & \text{if Laps} = 0 \\ \frac{\text{Current Value} \pmod{\text{Target Value}}}{\text{Target Value}} & \text{if Laps} \ge 1 \end{cases}$$
- `reachedGoal = Laps >= 1`
- `exceededGoal = Laps >= 1 && Fraction > 0.005`

### C. Avoid Habit Clean Streak & Money Saved (`AvoidMonth`)
- Clean day: `completions[dateKey] == null`.
- Clean Streak = consecutive clean days counted backwards from today, skipping neutral vacation days.
- Total Money Saved = $\text{Total Clean Days} \times \text{dailyCost}$.

---

## 5. Architectural Invariants

- **`README.md` is strictly preserved without modifications.**
- **Zero Lockfile Drift**: `package-lock.json` and `bun.lockb` remain untouched.
- **Pure Web APIs**: Sound generation runs on the standard browser `AudioContext` without third-party audio packages.
- **100% Backward Compatibility**: All legacy and Phase 1–3 backups restore without data loss or migration errors.

