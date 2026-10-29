export const en = {
  // Navigation
  "nav.today": "Today",
  "nav.habits": "Habits",
  "nav.progress": "Progress",
  "nav.settings": "Settings",
  "nav.add": "Add habit",

  // Today Tab
  "today.kicker": "Today",
  "today.nextUp": "Next up",
  "today.checkIn": "Check in now",
  "today.allDone": "All done",
  "today.allDoneSub": "Perfect day. Rest easy.",
  "today.filter.all": "All habits",
  "today.filter.pending": "Pending only",
  "today.streak": "{count}d streak",
  "today.doneCount": "{done} of {total} completed",

  // Habit List & Actions
  "habit.new": "New habit",
  "habit.name": "Habit name",
  "habit.save": "Save habit",
  "habit.delete": "Delete habit",
  "habit.archive": "Archive",
  "habit.unarchive": "Unarchive",
  "habit.star": "Star",
  "habit.starred": "Starred",

  // Settings
  "settings.title": "Settings",
  "settings.appStyle": "App style",
  "settings.appearance": "Appearance",
  "settings.appearanceSub": "Theme, accent and background",
  "settings.preferences": "Preferences",
  "settings.preferencesSub": "Language, week and sorting",
  "settings.data": "Data",
  "settings.dataSub": "Backups, archive and import",
  "settings.support": "Support",
  "settings.supportSub": "Report a bug or ask for a feature",
  "settings.about": "About this app",
  "settings.aboutSub": "Version, credits and source code",

  // Data & Trust
  "trust.offline": "100% Offline",
  "trust.noAccount": "No account",
  "trust.noAds": "No ads",
  "trust.backupSafe": "Keep your backup file safe. It contains your complete streak history.",

  // Common UI
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.back": "Back",
  "common.close": "Close",
  "common.version": "Version {version}",
} as const;

export type TranslationKey = keyof typeof en;

