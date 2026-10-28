# Phase 7 Architecture & Technical Blueprint: Sensory Immersion, On-Device Intelligence & Air-Gapped Sync

## 1. Zero-Cost, Open-Source & Offline Invariants

> [!IMPORTANT]
> **Core Axioms for Phase 7**:
> 1. **100% Free for User & Creator ($0 Cost Forever)**: Zero external cloud compute, zero external telemetry, zero paid SDKs.
> 2. **100% Client-Side Machine Learning & Sound**: Heuristic Markov algorithms and audio oscillators execute entirely within browser and WebView runtimes.
> 3. **Air-Gapped Privacy**: P2P data synchronization operates completely offline via optical camera/screen data transfer.

---

## 2. Sensory Immersion & Soundscape Synthesizer 2.0

### A. Procedural Binaural Beats Engine
Building on Phase 4's Web Audio synthesizer, Phase 7 adds calibrated binaural beats for cognitive state modulation (0 KB audio file downloads):
- **Alpha Waves (10 Hz)**: 210 Hz left ear, 200 Hz right ear. Promotes relaxed alertness, flow state, and creative routine execution.
- **Theta Waves (6 Hz)**: 106 Hz left ear, 100 Hz right ear. Enhances deep meditation, journaling, and reflective evening reviews.
- **Beta Waves (18 Hz)**: 218 Hz left ear, 200 Hz right ear. Sharp focus for deep work sessions and high-intensity habits.
- **Natural Dynamic Pink Noise Layer**: Adds a soft soothing background layer with gentle Gaussian frequency modulation.

### B. Tactile Haptic Polyphony
Orchestration of nuanced physical vibration feedback via `@capacitor/haptics`:
- **Tick Tap**: Subtle 10ms crisp tap when incrementing a quantitative step.
- **Double Clack**: Satisfying mechanical double-pulse when completing a checklist subtask.
- **Crescendo Pulse**: 3-step ascending resonant vibration upon reaching a streak milestone or multi-lap target.
- **Gentle Thud**: Low-frequency warning vibration when confirming a habit deletion or relapse entry.

### C. Solar Circadian Theme Glide
- **Principle**: Instead of an abrupt dark/light switch, the interface softly shifts its color temperature based on the sun's physical angle.
- **Implementation**:
  - Uses astronomical solar coordinates calculated purely from date, local time, and rough timezone offset (0 GPS requests, 0 external APIs).
  - Daytime: Crisp high-contrast obsidian or alabaster.
  - Sunset / Night: Warm blue-light reduced amber shift (`oklch(var(--bg) / amber-tint)`), reducing eye strain during night check-ins.

---

## 3. On-Device Heuristic Forecasting & Habit Intelligence

### A. First-Order Markov Chain Transition Predictor
- Computes the conditional probability of habit sequence execution:
  $$P(\text{Habit}_B \mid \text{Habit}_A) = \frac{\text{Count}(\text{Habit}_A \text{ followed by } \text{Habit}_B)}{\text{Count}(\text{Habit}_A)}$$
- **Application**:
  - When the user checks off "Morning Workout", the UI dynamically surfaces the habit with the highest historical conditional likelihood (e.g. "Drink 500ml Water" - 92% correlation) as the next prompt.

### B. Friction Bottleneck Diagnostic
- Offline statistical detector identifying cognitive failure patterns:
  - Day-of-week dropouts (e.g. "Reading has a 65% failure rate on Thursdays").
  - Time-of-day friction (e.g. "Workouts scheduled after 7 PM are skipped 3x more often than morning sessions").
  - Actionable proactive suggestions: "Try shifting your workout 1 hour earlier to protect your streak."

---

## 4. Air-Gapped P2P Vault Handshake & Privacy-Preserving Share Cards

### A. Animated High-Density QR-Code Vault Handshake
- Allows 100% offline device-to-device migration between phones or between phone and desktop:
  - Compresses and encrypts the habit database into a Base64-encoded payload.
  - For larger payloads exceeding single QR capacity, renders an **animated sequential QR code** (Fountain codes / multipart chunks at 10 fps).
  - Receiving device scans with camera and seamlessly reconstructs the vault with Set-Union conflict-free resolution.
  - Zero Wi-Fi, zero Bluetooth, zero servers required.

### B. Spotify-Wrapped Style Client-Side Vector Share Cards
- High-resolution SVG-to-Canvas render engine generating celebratory visual milestones:
  - Year-in-Review / Month-in-Review cards.
  - Total minutes focused, longest unbroken chain, and favorite habit category.
  - Exports cleanly as 1080x1920 Instagram Story / Twitter PNG formats directly on-device with zero server generation.

---

## 5. Phase 7 Implementation Deliverables (Status: ✅ Completed & Shipped in v1.0.1)

1. **`src/lib/habits/binaural.ts` & `src/lib/habits/binaural.test.ts`** ✅:
   - Web Audio stereo panner and frequency detune generator for Alpha, Theta, and Beta binaural beats with procedural pink noise.
2. **`src/lib/habits/haptics.ts` & `src/lib/habits/haptics.test.ts`** ✅:
   - Polyphonic tactile patterns (Tick Tap, Double Clack, Milestone Crescendo, and Gentle Thud warning).
3. **`src/lib/habits/circadianGlide.ts` & `src/lib/habits/circadianGlide.test.ts`** ✅:
   - Solar Circadian theme glide with offline astronomical zenith computation and amber night tint.
4. **`src/lib/habits/markovPredictor.ts` & `src/lib/habits/markovPredictor.test.ts`** ✅:
   - Local on-device sequence transition matrix and next-habit suggestion engine.
5. **`src/lib/habits/bottleneckDetector.ts` & `src/lib/habits/bottleneckDetector.test.ts`** ✅:
   - Day-of-week and time-of-day completion variance anomaly detection.
6. **`src/lib/habits/qrMatrix.ts` & `src/components/habits/AirGappedSyncDialog.tsx`** ✅:
   - Animated QR generator with ISO alignment patterns and active optical camera scanner for air-gapped vault migration.
7. **`src/components/habits/ShareCardDialog.tsx`** ✅:
   - Client-side Canvas rendering engine exporting downloadable visual 1080x1920 milestone story cards.
