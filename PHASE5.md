# Phase 5 Master Architecture: Native Ecosystem, Hardware Intelligence & Zero-Cost Sync

## 1. Zero-Cost, Open-Source & Offline Invariants

> [!IMPORTANT]
> **Core Economic & Operational Principles**:
> 1. **100% Free Forever for Both User & Developer ($0 OpEx)**:
>    - **Zero Backend Servers**: No AWS, no Firebase, no Supabase, no monthly database invoices.
>    - **Zero Paid APIs**: All analytics, algorithms, health sync, and widgets run directly on the user's local device.
> 2. **Fully Offline-First with Optional Zero-Cost Online**:
>    - **Default Mode**: 100% offline. The app does not require an internet connection or internet permissions to function completely.
>    - **Optional Online Mode (P2P & BYOC)**: If the user chooses to sync across multiple personal devices, it uses:
>      - **Direct WebRTC Peer-to-Peer Sync**: Direct encrypted device-to-device streaming over local Wi-Fi or public free STUN (`stun:stun.l.google.com:19302`) via QR code pairing.
>      - **Bring-Your-Own-Cloud (BYOC)**: Client-side connection to the user's *own* Google Drive AppData folder, GitHub Gist, or personal WebDAV/Nextcloud instance via direct client-side tokens.
>      - **Cost to Developer: $0.00. Cost to User: $0.00.**
> 3. **Strictly Open Source (MIT)**:
>    - Completely open, verifiable code. No proprietary tracking SDKs, no closed-source analytics, no telemetry.

---

## 2. Core Pillars & Specifications

### Pillar 1: Native Android Home-Screen Widgets (`AppWidgetProvider`)
- **`TodayWidgetProvider.kt`**: 4x2 & 2x2 widget displaying top pending habits with instant tap check-in.
- **`StreakWidgetProvider.kt`**: 1x1 minimalist streak flame badge with haptic feedback.
- **`HeatmapWidgetProvider.kt`**: 4x2 glanceable year/90-day consistency grid rendered on a bitmap canvas.
- **Shared Storage Bridge**: Local web app updates `context.filesDir/widget_habits.json` via Capacitor filesystem bridge, triggering `AppWidgetManager.notifyAppWidgetViewDataChanged()`. $0 server cost.

### Pillar 2: Android Health Connect Integration (`androidx.health.connect`)
- **Framework**: Standard Android Jetpack `androidx.health.connect.client.HealthConnectClient`.
- **Supported Records**:
  - `StepsRecord`: Automated walking habits (e.g. 10,000 steps).
  - `SleepSessionRecord`: Sleep duration habits (e.g. 8 hours).
  - `HydrationRecord`: Water intake habits (e.g. 2,500 ml).
  - `ExerciseSessionRecord`: Active workout minutes (e.g. 30 min).
- **Privacy & Cost**: Runs entirely on the device CPU. 100% free, 100% offline.

### Pillar 3: Offline Circadian Analytics & Stacking Intelligence
- **Circadian Performance Curve**: Aggregates completion timestamps across a 24-bin histogram ($H_0 \dots H_{23}$) with Gaussian kernel smoothing:
$$\hat{f}(h) = \frac{1}{N \sigma \sqrt{2\pi}} \sum_{i=1}^N \exp\left( -\frac{(h - h_i)^2}{2\sigma^2} \right)$$
- **Habit Stacking Correlation**: Computes conditional probabilities:
$$P(B \mid A) = \frac{\text{Days both } A \text{ and } B \text{ completed}}{\text{Days } A \text{ completed}}$$
Surfaces actionable insights: *"When you complete 'Morning Stretch', you complete 'Drink Water' 92% of the time."*

### Pillar 4: Calm Offline Visual World (Voxel Island)
- **Zero Pressure**: No pay-to-win, no energy meters, no social comparison.
- **Organic Assembly**: Daily completions earn building blocks that assemble a calm 3D isometric voxel island (trees, streams, cozy cabins, lighthouses).
- **Dynamic Lighting**: Canvas rendering shifts gently with local sunrise and sunset.

### Pillar 5: Zero-Cloud Peer-to-Peer & Local Folder Vault Sync
- **Local Vault**: Single encrypted file `DailySpark/vault.json`.
- **Sync Transport Options (All 100% Free)**:
  1. **Local Folder**: Syncthing, Nextcloud, or USB cable ($0 server cost).
  2. **Direct WebRTC P2P**: Ephemeral QR-code pairing between devices on the same Wi-Fi ($0 server cost).
  3. **BYOC (Bring-Your-Own-Cloud)**: Direct to user's personal Google Drive/WebDAV ($0 developer cost).
- **Cryptography**: `AES-GCM-256` with master key derived via `PBKDF2` / `Argon2id` (Web Crypto API).
- **Conflict Resolution**: Set-union merge for `completedDates` guarantees completions made across multiple offline devices are never lost.

---

## 3. Strict Architectural Invariants

1. **Zero External Backend / Cloud Servers**: The app remains 100% offline-first.
2. **Zero Lockfile Drift**: No third-party bloat; all cryptography and canvas rendering use standard Web and native Android APIs.
3. **100% Backward Compatibility**: All legacy backups and localStorage states remain intact.
