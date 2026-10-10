# 🌱 Daily Spark

**Daily Spark** is a simple, offline-first Android app for tracking daily streaks and habits.
No login. No ads. No tracking. Just you and your progress.

Built to be **quiet, stable, and honest** — not addictive.

---

## ✨ What is Daily Spark?

Daily Spark helps you build consistency by tracking **one action per day, per habit**.

### Core Principles

- 🔐 No account, no login
- 🚫 No ads, no analytics, no tracking
- 📵 Works fully offline
- 💾 Your data stays on your device
- 🧘 Designed for calm, not pressure

Perfect for people who want to build habits **without noise**.

---

## 🚀 Core Features (Phase-1 Stable)

### 🔥 1. Daily Streak Tracking

Create streaks for any habit or task. Each streak can be completed once per calendar day.

**You can:**

- ✏️ Create streaks with custom names & emojis
- ✅ Complete a streak once per calendar day
- ↩️ Undo today's completion (mistake-friendly)
- ⭐ Star important streaks
- 📦 Move streaks between Active and Archived
- 🗑️ Edit or delete streaks anytime

**Design rules:**

- One completion per day
- No over-counting
- No punishment for breaks
- Calm recovery mindset (24-hour grace period)

---

### 📅 2. Calendar View (Honest Progress)

Visualize your consistency over time.

**What you see:**

- Monthly calendar grid
- Completion ratio under each day (e.g. `2/3` = 2 out of 3 streaks completed)
- Clear color feedback

**Color meaning:**

- ⚪ Grey — 0/x (no streaks done)
- 🔴 Red — few completed
- 🟠 Orange — most completed
- 🟢 Green — all completed (perfect day)
- 🔵 Blue ring — today

No fake achievements. Just clarity.

> Still have questions? Check the [FAQ](./FAQ.md).

---

### ⏰ 3. Reminders (Optional & Safe)

Gentle reminders — only if you want them.

- Enable per streak
- Choose time & days of the week
- Disable anytime (or turn off all notifications in Settings)
- App never crashes if permission is denied

Notifications are **optional**, not forced.

---

### 💾 4. Backup & Restore (IMPORTANT)

#### 🧾 JSON Backup — Full Restore

Use JSON backups to **fully protect your data**.

**Includes:**

- All streaks
- Full completion history
- Reminder settings
- Star/archive status

**When to use:**

- Before switching phones
- Before resetting your device
- Before reinstalling the app
- Regularly (weekly or monthly recommended)

**How to use:**

1. Go to Settings → Backup & Restore
2. Tap **Export Full Backup (JSON)**
3. Save via the Android Share Sheet (Drive, Files, WhatsApp, etc.)
4. Restore anytime: Settings → Restore from JSON, then select your file

Filenames are timestamped, e.g. `daily_spark_backup_2026-02-08_21-45.json`

✅ Recommended for regular backups.

#### 📄 CSV Import — Add New Streaks Only

CSV is for **bulk adding new streak ideas**.

**Rules:**

- Starts at Day 1 (no history)
- Never overwrites existing streaks
- Adds only new entries

**CSV format:**

```csv
name,emoji
Morning Jog,🏃
Read 30 mins,📚
Drink Water,💧
Meditate,🧘
```

**How to use:**

1. Go to Settings → Backup & Restore
2. Tap **Import from CSV**
3. Select your CSV file
4. New streaks are added to your Active list

**Key difference:**

- **JSON** = restore your entire app (all streaks + history)
- **CSV** = add new streak ideas (no history)

> Still have questions? Check the [FAQ](./FAQ.md).

---

### 🔒 5. Offline-First & Data Safety

Daily Spark uses **local storage only**. Your data never leaves your phone.

- Works without internet
- No cloud service needed
- No account or login required
- App updates should not reset your data
- You own your data completely

---

## 🚫 What Daily Spark Does NOT Do

These are intentionally missing to keep the app simple and calm:

- No AI coaching
- No gamification or achievements
- No social sharing
- No leaderboards
- No forced reminders
- No animations or celebrations
- No data syncing

**Why?** Focus on consistency and calm usage, not addiction or comparison.

---

## 👥 Who This App Is For

- Students building study habits
- Developers tracking daily coding or exercise
- Anyone building habits quietly
- Minimalists who dislike noisy productivity apps
- People who prefer local control over cloud services
- People wanting honest feedback, not false achievements

## 🙅 Who This App Is NOT For

- People who want cloud sync across multiple devices
- People who need social competition or leaderboards
- People who want AI-powered coaching
- People who want heavy analytics and charts

For legal details, see → [Terms](./TERMS.md)

---

## 🧭 App Navigation

- **Home** — Daily streak list with today's completion status. Tap the button to complete a streak.
- **Streaks** — Add, edit, move between Active/Archived, or delete streaks.
- **Calendar** — Monthly completion history.
- **Settings** — Notifications, reminders, backup & restore, app info.

---

## ⚡ Phase-1 Status (Locked)

Phase-1 is **fully complete and stable**. All planned features have been implemented, tested on real devices, and released publicly.

No additional features will be added to Phase-1. Only critical bug fixes or data-safety fixes are allowed.

### ❌ Not Included in Phase-1 (By Design)

- Home-screen widgets
- Cloud sync / login
- Notes per streak
- Charts or analytics
- Editing past dates
- Cross-device sync

These are **not bugs**. They are reserved for **Phase-2**.

---

## 🔮 Phase-2 (Planned, Not Yet Released)

**Planned features:**

- Simple notes per streak (optional)
- Additional notification customization
- UX refinements based on user feedback

**Promise:** Phase-2 will be 100% backward compatible. Your streaks and history are safe.

---

## ⚠️ Backup Schema (Strict)

The Phase-1 backup schema is **strict**.

- Keys must not be renamed
- `history` must exist and match `currentStreak`
- Each streak must have a unique `id`
- Invalid backups may load partially but block individual streak pages

Use the documented template below when restoring historical streaks.

### 🧾 Phase-1 Backup JSON Format

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

## 📥 Installation

### From GitHub Releases

1. Go to [GitHub Releases](https://github.com/sahaya-savari/daily-spark/releases)
2. Download the latest APK file
3. Install it on your Android phone

### Manual APK Installation

1. Build the app locally (see Technical Overview below)
2. Install via ADB: `adb install app-debug.apk`

### Web Version (PWA)

1. Visit https://daily-spark-app-da74b.web.app
2. Use all core features without signup
3. Install as a web app from your browser

---

## 🛠️ Technical Overview (For Developers)

### Tech Stack

- **Frontend:** React 18 + TypeScript
- **Native runtime:** Capacitor (Android), Java 17
- **Build tool:** Vite
- **Testing:** Vitest
- **UI:** Tailwind CSS + shadcn/ui
- **State management:** React Context API
- **Storage:** LocalStorage + JSON persistence (offline-first)
- **Notifications:** Capacitor Push Notifications API (Android)
- **File I/O:** Capacitor Filesystem API

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

**Development:**

```bash
npm install
npm run dev
```

**Build for Android:**

```bash
npm run build -- --mode capacitor
npx cap sync android
cd android && ./gradlew clean assembleDebug && cd ..
```

**Deploy to device:**

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

## ⚠️ Data Responsibility Notice

**You are responsible for your data.**

- Daily Spark stores all data locally on your device
- Backup is **your responsibility**
- Weekly or monthly JSON backups to cloud storage are recommended
- If you uninstall the app without backing up, your data is gone
- App updates should not affect your data, but back up anyway

**To protect your data:**

1. Export a JSON backup regularly
2. Store backups in the cloud (Google Drive, Dropbox, etc.)
3. Keep backups in a safe place

---

## 🤝 Support & Contributing

Found a bug or have a suggestion? Open an issue on GitHub.
Want to contribute? See → [Contributing](./CONTRIBUTING.md)

---

## 📜 License & Disclaimer

Licensed under the **MIT License** (free to use, modify, and distribute).

- Provided as-is, with no warranty of any kind
- Use at your own risk
- No liability for data loss — back up regularly

---

Thank you for using Daily Spark. Your progress stays private, secure, and always accessible.

**Built by Sahaya Savari F** · Last updated: February 2026
