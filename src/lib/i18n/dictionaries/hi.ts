import type { TranslationKey } from "./en";

export const hi: Record<TranslationKey, string> = {
  // Navigation
  "nav.today": "आज",
  "nav.habits": "आदतें",
  "nav.progress": "प्रगति",
  "nav.settings": "सेटिंग्स",
  "nav.add": "आदत जोड़ें",

  // Today Tab
  "today.kicker": "आज",
  "today.nextUp": "अगला लक्ष्य",
  "today.checkIn": "चेक इन करें",
  "today.allDone": "सब पूरा हुआ",
  "today.allDoneSub": "शानदार दिन। आराम करें।",
  "today.filter.all": "सभी आदतें",
  "today.filter.pending": "केवल बाकी",
  "today.streak": "{count} दिन स्ट्रीक",
  "today.doneCount": "{total} में से {done} पूर्ण",

  // Habit List & Actions
  "habit.new": "नई आदत",
  "habit.name": "आदत का नाम",
  "habit.save": "सुरक्षित करें",
  "habit.delete": "हटाएं",
  "habit.archive": "आर्काइव",
  "habit.unarchive": "अन-आर्काइव",
  "habit.star": "स्टार",
  "habit.starred": "तारांकित",

  // Settings
  "settings.title": "सेटिंग्स",
  "settings.appStyle": "ऐप शैली",
  "settings.appearance": "दिखावट",
  "settings.appearanceSub": "थीम और रंग",
  "settings.preferences": "प्राथमिकताएं",
  "settings.preferencesSub": "भाषा, सप्ताह और क्रम",
  "settings.data": "डेटा",
  "settings.dataSub": "बैकअप, आर्काइव और इम्पोर्ट",
  "settings.support": "सहायता",
  "settings.supportSub": "सुझाव या समस्या दर्ज करें",
  "settings.about": "ऐप के बारे में",
  "settings.aboutSub": "संस्करण और स्रोत कोड",

  // Data & Trust
  "trust.offline": "100% ऑफ़लाइन",
  "trust.noAccount": "बिना खाता",
  "trust.noAds": "बिना विज्ञापन",
  "trust.backupSafe": "अपनी बैकअप फ़ाइल सुरक्षित रखें।",

  // Common UI
  "common.cancel": "रद्द करें",
  "common.confirm": "पुष्टि करें",
  "common.back": "वापस",
  "common.close": "बंद करें",
  "common.version": "संस्करण {version}",
};
