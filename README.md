<div align="center">

# 🌱 Daily Spark

**A calm, offline-first streak and habit tracker for Android.**

No login. No ads. No tracking. Just you and your progress.

[![Release](https://img.shields.io/github/v/release/sahaya-savari/daily-spark?style=for-the-badge&label=Release&color=2ea44f)](https://github.com/sahaya-savari/daily-spark/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license--disclaimer)
[![Status](https://img.shields.io/badge/Status-Stable%20%26%20Offline--First-success?style=for-the-badge)](#core-principles)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](#installation)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-450%2F450%20Passing-brightgreen?style=flat&logo=vitest)

[Download APK](https://github.com/sahaya-savari/daily-spark/releases) · [Web App (/app)](https://dailyspark.sahayasavari.dev/app) · [Website](https://dailyspark.sahayasavari.dev/) · [GitLab Releases](https://gitlab.com/sahaya-savari/daily-spark/-/releases) · [FAQ](./FAQ.md) · [Report an Issue](https://github.com/sahaya-savari/daily-spark/issues)


</div>

---

Built to be **quiet, stable, and honest** — not addictive.

## Table of Contents

- [Overview](#overview)
- [Core Principles](#core-principles)
- [Core Features](#core-features)
  - [1. Daily Streak Tracking & Flexible Schedules](#1-daily-streak-tracking--flexible-schedules)
  - [2. Calendar View (Honest Progress)](#2-calendar-view-honest-progress)
  - [3. Notes & Distraction-Free Journal](#3-notes--distraction-free-journal)
  - [4. Progress, Activity Heatmap & Milestones](#4-progress-activity-heatmap--milestones)
  - [5. Reminders (Optional & Gentle)](#5-reminders-optional--gentle)
  - [6. Backup, Restore & Data Freedom](#6-backup-restore--data-freedom)
  - [7. Privacy & App Lock](#7-privacy--app-lock)
  - [8. Offline-First & Data Safety](#8-offline-first--data-safety)
- [What Daily Spark Does NOT Do](#what-daily-spark-does-not-do)
- [Who This App Is For](#who-this-app-is-for)
- [App Navigation](#app-navigation)
- [Product Architecture & Principles](#product-architecture--principles)
- [Backup Schema & Data Format](#backup-schema--data-format)
- [Installation](#installation)
- [Technical Overview](#technical-overview-for-developers)
- [Data Responsibility Notice](#data-responsibility-notice)
- [Support & Contributing](#support--contributing)
- [License & Disclaimer](#license--disclaimer)

---

## Overview

Daily Spark helps you build consistency by tracking **one action per day, per habit**. It is made for people who want to build habits **without noise**.

## Core Principles

| | Principle |
|---|---|
| 🔐 | No account, no login |
| 🚫 | No ads, no analytics, no tracking |
| 📵 | Works fully offline |
| 💾 | Your data stays on your device |
| 🧘 | Designed for calm, not pressure |

---

## Core Features

### 1. Daily Streak Tracking & Flexible Schedules

Create streaks for any habit, daily routine, or weekly practice.

**You can:**

- ✏️ Create habits with custom names, line icons, emojis, and color swatches
- 📅 Pick schedules: **Daily**, **Weekly Target** (e.g. 3x/week), or **Selected Days** (e.g. Mon, Wed, Fri)
- ✅ Complete a streak with one tap (tactile haptic feedback on mobile)
- ↩️ Undo today's completion (mistake-friendly)
- 🌟 Star important habits to pin them to the top
- ⏸️ Vacation / Pause mode to freeze streaks without penalty during travel or illness
- 📦 Move habits between **Active** and **Archived**
- 🗑️ Edit, reorder, or delete habits anytime

**Design rules:**

- One completion per day
- No over-counting
- No punishment for breaks
- 24-hour grace recovery allowance (weekly & monthly grace)

---

### 2. Calendar View (Honest Progress)

Visualize your consistency over time. Each day shows a completion ratio (e.g. `2/3` = 2 out of 3 streaks completed) on a monthly grid, with clear color feedback.

| Color | Meaning |
|---|---|
| ⚪ Grey | `0/x` — no streaks done |
| 🔴 Red | Few completed |
| 🟠 Orange | Most completed |
| 🟢 Green | All completed (perfect day) |
| 🔵 Blue ring | Today |

Tap any day to see the exact breakdown of completed habits and review historical check-ins.

---

### 3. Notes & Distraction-Free Journal

Keep thoughts, triggers, and daily reflections close to your habits.

- 📝 **Per-Habit Notes:** Record personal guidelines, triggers, or book notes directly on any habit (up to 1,000 characters). Auto-saved offline.
- 📓 **Standalone Journal:** Calm, markdown-friendly scratchpad for daily reflections, study logs, or goal setting. Instant search, color swatches, and pin-to-top.

---

### 4. Progress, Activity Heatmap & Milestones

Honest analytics built for self-reflection, not dopamine addiction.

- 📊 **Consistency Rates:** 7-day, 30-day, and all-time completion percentages
- 🟩 **6-Month Heatmap:** GitHub-style activity grid showing your real check-in volume
- 🏆 **Calm Milestones:** Quiet recognition for consistency milestones (7 Days · 21 Days · 50 Days · 100 Days · 365 Days) without loud or flashing confetti

---

### 5. Reminders (Optional & Gentle)

Gentle reminders — only if you want them.

- Enable per habit
- Choose specific times & days
- Reschedule or snooze (30m, 1h, tomorrow 9am)
- Fails safely: app never crashes if permission is denied

Notifications are **strictly optional**, never nagging.

---

### 6. Backup, Restore & Data Freedom (IMPORTANT)

> [!IMPORTANT]
> Daily Spark stores everything locally. **Export a JSON backup regularly** — it is the only way to fully restore your data.

#### Full JSON Backup & Pre-Validation Restore

- **Full export:** All habits, streak counters, history dates, per-habit notes, and standalone journal entries.
- **Inspect Before Restore:** Daily Spark features an inspection dialog previewing file version, streak counts, completions, and settings *before* applying.
- **Auto Rolling Snapshots:** Automated rolling 7-day local backups saved to device storage.

#### CSV Import & Export

- Export habits as CSV for spreadsheets.
- Bulk import new habit ideas via CSV (`name,emoji` format).

#### Markdown Summary Export

- Export your complete habit status, metrics, and journal entries as a clean, beautiful Markdown report for Obsidian, Notion, or personal archives.

---

### 7. Privacy & App Lock

Protect your private habits and reflections on shared devices:

- 🔒 4-digit PIN protection hashed locally with SHA-256 via Web Crypto API
- ⏳ Automatic 5-minute inactivity timeout & lock on backgrounding
- 📲 Native biometric unlock (fingerprint / face) supported on mobile

---

### 8. Offline-First & Data Safety

Daily Spark uses **local storage only**. Your data never leaves your phone.

- Works 100% without internet
- No cloud service needed
- No account or login required
- You own your data completely

---

### 9. Tactile Feedback & Procedural Web Audio

- 📳 **Mobile Haptics:** Native haptic pulses via `@capacitor/haptics` on Android.
- 🔊 **Desktop Tactile Ticks:** Synthesized 16ms damped sine wave ($720\text{Hz} \to 140\text{Hz}$) via the Web Audio API when vibration hardware is absent, providing physical clicker feedback.
- ♿ **Live Accessibility Announcements:** Dynamic `aria-live="polite"` announcements for screen readers when habits are completed or streaks update.

---

### 10. Reorganized 4-Tier Settings Hub

- 🔍 **Live Search Filter:** Instant keyword filter across all settings without removing any configuration options.
- 🎨 **Appearance & Style:** Quiet Obsidian (`#0E0F12`) background, dynamic accents, contrast mode, and sound toggle.
- ⚙️ **Routine Preferences:** Rollover time (e.g. 3 AM night owl), weekend rest, vacation mode, and reminder settings.
- 🛡️ **Data & Sovereignty:** 5-format export (JSON, CSV, Markdown, Text, Backup inspection), sandbox restore preview, app lock, and reset.
- ℹ️ **About & Community:** Version details, privacy promise, license, and community links.

---

### 11. Authentic Codex Botanical Spark Mark & Modern Lucide Icon System

- 🌿 **Authentic Brand Mark:** Restored the handcrafted Codex Botanical Spark vector mark (`#EC894C` 4-point radiant diamond spark, `#BF7245` sprout stem, `#1C1D22` tile), eliminating AI-generated distorted graphics.
- 🎯 **Modern Open-Source Icons:** 33 habit categories mapped directly to clean, accessible Lucide React vector SVGs, completely eliminating fuzzy bitmap icon clutter.
- 🖤 **Quiet Obsidian Badge Containers:** Replaced arbitrary rainbow/candy icon badges in Settings with unified quiet obsidian containers and warm ember hover accents.

---

### 12. GymMane-Inspired Design Architecture & Hardware Device Showcase

- 📱 **Precision Hardware Device Frame:** Realistic metallic gradient phone bezel (`Device`), dynamic island pill (`74px x 19px`), and tactile volume/power side keys with live interactive habit logging.
- 🏛️ **Obsidian & Hairline Architecture:** Deep obsidian canvas (`#0A0908`), layered raised surfaces (`#141414` / `#1E1E1E`), architectural hairline dividers (`#262626`), and warm clay accents (`#D9A184`).
- ⚡ **High-Contrast CTAs & Clean Feature Grid:** Dual high-contrast action buttons (solid white primary vs hairline ghost) and 2-column feature list with horizontal border-t dividers.
- 🎞️ **Continuous Screens Carousel:** Preserved, interactive horizontal phone parade displaying real app screens (Today, Habits, New habit, Progress, Calendar, Settings).

---

## What Daily Spark Does NOT Do

These are intentionally missing to keep the app simple and calm:

- No AI coaching
- No gamification or forced competitions
- No social sharing or public profiles
- No leaderboards
- No forced reminders
- No addictive confetti animations
- No third-party data tracking

**Why?** Focus on consistency and calm usage, not addiction or comparison.

---

## Who This App Is For

| ✅ Great fit | 🙅 Not a fit |
|---|---|
| Students building study habits | People who want cloud sync across multiple devices |
| Developers tracking daily coding or exercise | People who need social competition or leaderboards |
| Anyone building habits quietly | People who want AI-powered coaching |
| Minimalists who dislike noisy productivity apps | People who want heavy corporate tracking |
| People who prefer local control over cloud services | |
| People wanting honest feedback, not false achievements | |

For legal details, see → [Terms](./TERMS.md)

---

## App Navigation

| Screen | What it does |
|---|---|
| **Today** | Daily check-in list, 1-tap completions, 1-tap starter pack, today focus mode, and next-up card. |
| **Habits & Journal** | Manage habits, search & filter, bulk actions, reordering, and offline journal notes. |
| **Progress** | Consistency percentages, 6-month activity heatmap, and calm milestone badges. |
| **Calendar** | Monthly completion history, day ratios, and historical review. |
| **Settings** | Reorganized 4-tier hub (Appearance, Routine, Data Sovereignty, About) with live search and 100% feature preservation. |

---

## Product Architecture & Principles

Daily Spark is engineered around a single invariant: **Zero cloud dependency, zero data lock-in, and 100% local user ownership.**

- **Backward Compatibility:** All backup files and localStorage structures remain 100% compatible across versions.
- **Strictly Offline:** Zero remote tracking, zero telemetry, zero background network calls.
- **Data Auto-Healing:** Startup data integrity checks automatically heal ID drifts or corrupted objects into local recovery stashes.

---

## Backup Schema & Data Format

> [!WARNING]
> The Phase-1 backup schema is **strict**. Invalid backups may load partially but block individual streak pages.

- Keys must not be renamed
- `history` must exist and match `currentStreak`
- Each streak must have a unique `id`

Use the documented template below when restoring historical streaks.

### Phase-1 Backup JSON Format

```json
{
  "version": "1",
  "exportDate": "YYYY-MM-DD",
  "data": {
    "streaks": [
      {
        "id": "unique-streak-id",
        "title": "Streak name",
        "emoji": "🔥",
        "createdAt": "YYYY-MM-DD",
        "currentStreak": 0,
        "bestStreak": 0,
        "lastCompletedDate": null,
        "history": [],
        "archived": false,
        "starred": false
      }
    ],
    "settings": {
      "enabled": true,
      "defaultTime": "20:00",
      "respectDND": true,
      "preTaskReminderOffsetMinutes": 5
    }
  }
}
```

**Strict rules:**

- Output ONLY valid JSON (no comments, no explanation)
- Follow the schema EXACTLY as shown
- Do NOT rename keys or add extra fields
- Each streak MUST have a unique `id`
- Date format MUST be `YYYY-MM-DD`
- `history.length` MUST equal `currentStreak`
- Dates in `history` MUST be continuous
- `lastCompletedDate` MUST equal the last date in `history`
- If `currentStreak` is `0` → `history` must be empty and `lastCompletedDate` must be `null`
- Widgets are NOT part of Phase-1 (do not include anything related to widgets)

---

## Installation & Platforms

Daily Spark is available across mobile, browser, and desktop:

| Platform | Channel | Description | Link |
|---|---|---|---|
| **Android (APK)** | Universal APK | Native Android app (Android 7.0+). No Google Play or accounts required. ~4.2 MB. | [Download APK](https://github.com/sahaya-savari/daily-spark/releases) |
| **Mobile PWA** | Web / PWA | Open in mobile Chrome/Safari and select "Add to Home screen" for an offline app experience. | [Open /app](https://dailyspark.sahayasavari.dev/app) |
| **Web Browser (PC)** | Web App | Full workstation view with sidebar navigation rail, `Ctrl+K` command palette, and local-first persistence. | [Launch Web App](https://dailyspark.sahayasavari.dev/app) |
| **Windows** | Standalone (.zip) | Portable package for Windows x64. Unzip once and launch with no installation required. | [Windows .zip](https://github.com/sahaya-savari/daily-spark/releases) |
| **Linux** | Standalone (.tar.gz) | Portable desktop package with shell launcher for Debian, Ubuntu, Fedora, Arch, etc. | [Linux .tar.gz](https://github.com/sahaya-savari/daily-spark/releases) |
| **F-Droid** | Catalog | Open-source catalog listing. | [Pending Review](https://gitlab.com/sahaya-savari/daily-spark) |

### Note on Web View vs Mobile View:
- Visiting the root domain `https://dailyspark.sahayasavari.dev/` provides the product landing page, interactive device preview, and direct release mirrors.
- Direct web application access is at `https://dailyspark.sahayasavari.dev/app`. On mobile devices, entering `/app` displays the thumb-friendly mobile interface with floating pill navigation; on PC screens (&ge;1024px), it expands into the full workstation layout with sticky left sidebar navigation.

### Release Mirrors:
- **GitHub Releases:** [github.com/sahaya-savari/daily-spark/releases](https://github.com/sahaya-savari/daily-spark/releases)
- **GitLab Releases:** [gitlab.com/sahaya-savari/daily-spark/-/releases](https://gitlab.com/sahaya-savari/daily-spark/-/releases)


---

## Technical Overview (For Developers)

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Native runtime | Capacitor (Android), Java 17 |
| Build tool | Vite 8 + Rolldown |
| Testing | Vitest (36 test suites, 450 tests) |
| UI & Icons | Tailwind CSS v4 + Radix UI + Lucide React |
| Design Architecture | GymMane Obsidian Architecture + Botanical Spark Vector Mark |
| State management | Reactive Local Storage Store (offline-first) |
| Audio & Haptics | Web Audio API (tactile ticks) + Capacitor Haptics |
| Notifications | Capacitor Push Notifications API (Android) |
| File I/O | Capacitor Filesystem API |

### Key Design Decisions

**Notification safety**

- Notification channel initialized at app startup (not during render)
- Async-safe notification lifecycle management
- Permission checks before accessing native APIs
- Silent failure if permission is denied (no crashes)

**Offline-first**

- All data stored locally
- No network requests required for core functionality
- Backup/restore handled on-device

**Data format**

- Streaks stored as JSON
- Deterministic date formatting (`YYYY-MM-DD`)
- UTC-based date calculations

### Directory Structure

```
src/
├── components/   # React UI components
├── contexts/     # React Context providers
├── hooks/        # Custom React hooks
├── lib/          # Utilities and helpers
├── pages/        # Full page components
├── services/     # Business logic & API
├── types/        # TypeScript types
└── test/         # Test files
android/          # Android native code and Gradle config
docs/             # Documentation
public/           # Static assets
```

### Running Locally

**Development**

```bash
npm install
npm run dev
```

**Build for Android**

```bash
npm run build -- --mode capacitor
npx cap sync android
cd android && ./gradlew clean assembleDebug && cd ..
```

**Deploy to device**

```bash
cd android && ./gradlew installDebug && cd ..
adb shell am start -n com.santhosh.dailyspark2/.MainActivity
```

### Version Management

```bash
# Auto-sync version from package.json to Android
npm run sync-version
```

---

## Data Responsibility Notice

> [!CAUTION]
> **You are responsible for your data.** If you uninstall the app without backing up, your data is gone.

- Daily Spark stores all data locally on your device
- Backup is **your responsibility**
- Weekly or monthly JSON backups to cloud storage are recommended
- App updates should not affect your data, but back up anyway

**To protect your data:**

1. Export a JSON backup regularly
2. Store backups in the cloud (Google Drive, Dropbox, etc.)
3. Keep backups in a safe place

---

## Support & Contributing

- 🐛 Found a bug or have a suggestion? [Open an issue](https://github.com/sahaya-savari/daily-spark/issues) on GitHub.
- 🤝 Want to contribute? See [CONTRIBUTING](./CONTRIBUTING.md).
- ❓ Questions? Check the [FAQ](./FAQ.md).

---

## License & Disclaimer

Licensed under the **MIT License** (free to use, modify, and distribute).

- Provided as-is, with no warranty of any kind
- Use at your own risk
- No liability for data loss — back up regularly

---

<div align="center">

Thank you for using Daily Spark. Your progress stays private, secure, and always accessible.

**Built by Sahaya Savari F** · Last updated: February 2026

</div>
