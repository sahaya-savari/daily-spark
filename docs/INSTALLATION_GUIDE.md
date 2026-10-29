# 📱 Daily Spark - Complete Installation & Distribution Guide

Daily Spark is a calm, 100% offline-first habit tracker available across **Android (APK, Obtainium, F-Droid)** and **Desktop (Windows, Linux, macOS PWA)**.

---

## 🎯 Android Installation Options

### Option 1: Direct APK Download (Fastest)
1. Download `Daily-Spark-v1.0.1.apk` (4.1 MB) from the [official website](https://sahaya-savari.github.io/daily-spark/download) or [GitHub Releases](https://github.com/sahaya-savari/daily-spark/releases/latest).
2. Open the downloaded `.apk` on your Android device.
3. If prompted, toggle **"Allow from this source"** for your browser.
4. Tap **"Install"**. All your data stays 100% private on your device.

### Option 2: Obtainium (Automated Updates)
Obtainium lets you install and automatically update apps directly from GitHub Releases:
1. Install [Obtainium](https://github.com/ImranR98/Obtainium/releases/latest) on your Android device.
2. In Obtainium, tap **"Add App"**.
3. Paste the Daily Spark repository URL:
   `https://github.com/sahaya-savari/daily-spark`
4. Obtainium will automatically parse the latest `v1.0.1` release, download `Daily-Spark-v1.0.1.apk`, and notify you whenever a new release is published.

### Option 3: F-Droid Build from Source
Daily Spark provides a reproducible F-Droid recipe in the repository:
- Recipe path: [`.fdroid.yml`](https://github.com/sahaya-savari/daily-spark/blob/main/.fdroid.yml)
- Package ID: `com.santhosh.dailyspark2`
- Builds directly from source with zero proprietary binaries.

---

## 💻 Desktop Installation (Windows & Linux)

Daily Spark is engineered as a fully installable, offline-first Progressive Web Application (PWA):

### Windows (Edge, Chrome, Brave)
1. Visit [Daily Spark Web](https://sahaya-savari.github.io/daily-spark/) in your browser.
2. Click the **Install** icon in the address bar (or menu `...` → **Apps** → **Install Daily Spark**).
3. Daily Spark installs as a standalone native Windows desktop application with Start Menu, Taskbar pinning, and offline storage.

### Linux (Chrome, Chromium, Brave)
1. Open the [Daily Spark Web App](https://sahaya-savari.github.io/daily-spark/) in Chromium / Chrome.
2. In the browser menu, select **Install Daily Spark** (or **Save and Share** → **Install page as app**).
3. The app is added to your desktop application launcher (`.desktop` entry) and runs isolated without browser address bars.

---

## 🔄 In-Place APK Updates
When updating to a new APK release:
1. Simply download and tap the new APK.
2. Android will prompt: **"Do you want to update this app?"**
3. Tap **"Update"**. Your streaks, habits, and preferences are fully preserved!

---

## 🐛 Troubleshooting

### Issue: "Application not installed"
**Solution:** 
- Check if you have enough storage space
- Try deleting the APK after installing
- If still failing, uninstall the old version first, then install new one

### Issue: "Cannot replace existing package"  
**Solution:**
- If you installed from a different source, you may need to uninstall first
- Try again with the latest APK from [official releases](https://github.com/sahaya-savari/daily-spark/releases)

### Issue: "App won't open after update"
**Solution:**
- Force stop: Settings → Apps → Daily Spark → Force Stop
- Clear cache: Settings → Apps → Daily Spark → Storage → Clear Cache
- Reopen the app

### Issue: Lost my streaks after update
**Don't worry!** Your data is stored locally:
1. Uninstall and reinstall (data persists in local storage)
2. If lost, restore from backup: Settings → Backup & Restore → Import JSON

---

## 💾 Backing Up Your Data

### Export Your Streaks
1. Open Daily Spark
2. Go to **Settings**
3. Tap **"Export JSON"**
4. Save the backup file safely
5. Can be restored anytime, on any device

### Import Your Streaks
1. Go to **Settings**
2. Tap **"Import"**
3. Select your backup file
4. Confirm to restore all your streaks

---

## 🔐 App Permissions

Daily Spark requests these permissions:

- **Notifications**: To remind you to complete daily streaks
- **Internet**: To sync reminders and backups (if enabled in future)
- **Storage**: To save and load backup files

**You control everything!** Disable permissions anytime in:
- Settings → Apps → Daily Spark → Permissions

---

## 🚀 What's New in Each Version

Check [Releases](https://github.com/sahaya-savari/daily-spark/releases) for:
- Latest features
- Bug fixes
- Performance improvements
- Breaking changes (if any)

---

## ⚙️ Advanced: Manual Update (ADB)

For developers or advanced users:

```bash
# Install via Android Debug Bridge
adb install -r app-release.apk

# The -r flag replaces existing installation
```

---

## 📞 Still Need Help?

- 📖 Read [UPDATE_GUIDE.md](./UPDATE_GUIDE.md) for technical details
- 🐛 Report issues: [GitHub Issues](https://github.com/sahaya-savari/daily-spark/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/sahaya-savari/daily-spark/discussions)

---

## ✅ Updates Summary

| Feature | Before | After |
|---------|--------|-------|
| Update in-place | ❌ Uninstall required | ✅ Direct install |
| Keep your data | ✅ Yes | ✅ Yes (preserved) |
| Easy process | ❌ Multi-step | ✅ One tap |
| Version tracking | ❌ Manual | ✅ Automatic |

---

**Happy tracking! Your streaks are safe.** 🔥

---

*Last updated: Feb 6, 2026*
*Daily Spark v1.0.3+*
