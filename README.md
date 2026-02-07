# Daily Spark

## What is Daily Spark?

Daily Spark is a **simple, offline-first daily streak and habit tracking app**. It helps you build consistency by tracking one simple action per day, per habit.

**Key principles:**
- No login or account needed
- No ads or tracking
- No forced syncing to the cloud
- Your data stays on your device
- Designed for consistency, not pressure

Perfect for anyone who wants to build habits quietly, without noisy notifications or achievement systems.

---

## Core Features (Phase-1)

### 1. Streak Tracking

Create daily streaks for any habit or task. Each streak can be completed once per day.

**What you can do:**
- Create streaks with custom names and emojis
- Mark a streak as completed (once per day)
- Undo a completion if you made a mistake
- See how many days in a row you've completed
- Star important streaks to prioritize them
- Move streaks between "Active" and "Archived" lists
- Edit streak details
- Delete streaks

**The philosophy:**
- One action per day, per streak
- No over-counting completions
- No judgment if you break a streak
- Recovery possible with grace period (24 hours)

### 2. Calendar View (Daily Completion Clarity)

See your progress over time. The calendar shows **how many streaks you completed each day** (as a ratio: completed / total).

**What you see:**
- A monthly grid showing every day
- A completion ratio under each day (e.g., "2/3" means 2 out of 3 streaks completed)
- Background colors indicate your completion rate

**Color meanings:**
- **Grey** — 0/x (no completions that day)
- **Red** — 1–2/x (few completions)
- **Orange** — 3–4/x (most completions)
- **Green** — x/x (all streaks completed, perfect day)
- **Blue ring** — today's date

**Why this instead of emojis or stars?**
- Clear and honest feedback
- Shows actual progress, not just "done" or "failed"
- Scales automatically as you add more streaks
- No confusion about what the numbers mean

### 3. Daily Reminders (Safe & Optional)

Get optional reminders to complete your streaks.

**What you can do:**
- Enable/disable reminders per streak
- Set a preferred reminder time
- Choose which days of the week to be reminded
- Disable all notifications in Settings

**Safety first:**
- Reminders are optional and can be turned off anytime
- If you deny notification permission, the app won't crash
- The app works completely fine without notifications
- Notifications never block or interrupt other app functions

### 4. Backup & Restore (Very Important)

#### JSON Backup (Full Backup + Restore)

Use JSON backup to **completely restore your streaks and history** if something happens to your phone.

**When to use:**
- Before switching phones
- Before resetting your device
- Before reinstalling the app
- Regular backups (recommended monthly)

**What it saves:**
- All streaks (names, emojis, settings)
- Complete history (every completion date)
- Reminder preferences
- Star/archive status

**How to use:**
1. Go to Settings → Backup & Restore
2. Tap "Export Full Backup (JSON)"
3. Save the file to cloud storage or email it to yourself
4. To restore: Go to Settings → Restore from JSON and select your file

**Important:** This is the recommended way to backup. Keep it safe.

---

#### CSV Import (Add New Streaks Only)

Import streak ideas in bulk from a spreadsheet or other app.

**When to use:**
- Adding many new streaks at once
- Importing a list of habits from another app
- Bulk creating streaks from a template

**What to know:**
- CSV import starts all streaks at **Day 1** (no history)
- It does **NOT** overwrite existing streaks
- It only adds new ones
- Use this to quickly populate your app with habit ideas

**CSV Format:**
```
name,emoji
Morning Jog,🏃
Read 30 mins,📚
Drink Water,💧
Meditate,🧘
```

**How to use:**
1. Go to Settings → Backup & Restore
2. Tap "Import from CSV"
3. Select your CSV file
4. New streaks will be added to your Active list

---

**Key difference:**
- **JSON** = Restore your entire app (all streaks + history)
- **CSV** = Add new streak ideas (no history)

### 5. Offline-First & Data Safety

Daily Spark uses **local storage only**. Your data never leaves your phone.

**What this means:**
- App works without internet
- No cloud service needed
- No account or login required
- App updates never reset your data
- You own your data completely

**Data security:**
- Stored locally on your device
- Protected by your device's security
- Backup files are yours to manage

---

## What Daily Spark Does NOT Do

These features are intentionally missing to keep the app simple and calm:

- **No AI coaching** — You know yourself best
- **No gamification or achievements** — No pressure systems
- **No social sharing** — Your streaks are private
- **No leaderboards** — No competition
- **No forced reminders** — You decide when to be reminded
- **No animations or celebrations** — Minimal, quiet interface
- **No data syncing** — No cloud, no accounts

**Why?** Focus on consistency and calm usage, not addiction or comparison.

---

## Who This App Is For

- Students building study habits
- Developers tracking daily coding or exercise
- Anyone building habits quietly
- Minimalists who hate noisy productivity apps
- People who prefer local control over cloud services
- People wanting honest feedback, not false achievements

---

## Who This App Is NOT For

- People who want cloud sync across multiple devices
- People who need social competition or leaderboards
- People who want AI-powered coaching
- People who want heavy analytics and charts

---

## App Navigation

### Home Screen
Shows your daily streak list with today's completion status. Complete streaks by tapping the button.

### Streaks Screen
Manage all your streaks: add new ones, edit, move between Active/Archived, or delete.

### Calendar Screen
View your monthly completion history. See patterns and celebrate perfect days.

### Settings Screen
- Manage notifications and reminders
- Backup and restore your data
- View app information

---

## Technical Overview (For Developers)

### Architecture
- **Frontend:** React 18 + TypeScript
- **Native Runtime:** Capacitor (Android)
- **Storage:** LocalStorage + JSON persistence
- **Build Tool:** Vite
- **Testing:** Vitest
- **UI:** Tailwind CSS + shadcn/ui

### Stack Details
- **UI Framework:** React with custom components
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Notifications:** Capacitor Push Notifications API (Android)
- **File I/O:** Capacitor Filesystem API

### Key Design Decisions

**Notification Safety:**
- Notification channel initialized at app startup (not during render)
- Async-safe notification lifecycle management
- Permission checks before accessing native APIs
- Silent failure if permission is denied (no crashes)

**Offline-First:**
- All data stored locally via localStorage
- No network requests required for core functionality
- Backup/restore handled on-device

**Data Format:**
- Streaks stored as JSON
- LocalStorage for lightweight settings
- Deterministic date formatting (YYYY-MM-DD)
- UTC-based date calculations

### Directory Structure
```
src/
├── components/      # React UI components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── pages/           # Full page components
├── services/        # Business logic & API
├── types/           # TypeScript types
└── test/            # Test files
android/            # Android native code and Gradle config
docs/               # Documentation
public/             # Static assets
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

**Deploy to Device:**
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

## Installation

### From GitHub Releases
1. Go to [GitHub Releases](https://github.com/sahaya-savari/daily-spark/releases)
2. Download the latest APK file
3. Install on your Android phone

### Manual APK Installation
1. Build the app locally (see Technical Overview)
2. Install via ADB: `adb install app-debug.apk`

### Web Version (PWA)
1. Visit the live app at https://daily-spark-app-da74b.web.app
2. Use all core features without signup
3. Install as a web app from your browser

---

## Data Responsibility Notice

**Important:** You are responsible for your data.

- Daily Spark stores all data locally on your device
- Backup is **your responsibility**
- We recommend **weekly or monthly JSON backups** to cloud storage
- If you uninstall the app without backing up, your data is gone
- App updates should not affect your data, but backup anyway to be safe

**To protect your data:**
1. Export JSON backup regularly
2. Store backups in cloud (Google Drive, Dropbox, etc.)
3. Keep backups in a safe place

---

## Phase-2 (Planned, Not Yet Released)

These features are planned but NOT yet released. When they arrive, they will NOT break existing data.

**Planned features:**
- Simple notes per streak (optional)
- Additional notification customization
- UX refinements based on user feedback

**Promise:** Phase-2 will be 100% backward compatible. Your streaks and history are safe.

---

## License & Disclaimer

Daily Spark is provided as-is for personal and open use.

**Disclaimer:**
- No warranty or guarantee of any kind
- Use at your own risk
- No liability for data loss
- Backup regularly

**Licensed under:** MIT License (free to use, modify, and distribute)

---

## Support & Feedback

Found a bug or have a suggestion? Open an issue on GitHub.

---

**Built by Santhosh Savari**

Last updated: February 2026
