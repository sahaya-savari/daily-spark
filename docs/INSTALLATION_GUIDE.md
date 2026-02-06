# 📱 Daily Spark - Installation & Update Guide

## ✨ NEW: In-Place Updates Work Now!

Your app now **properly supports updates**. You can install new versions directly without deleting the old one. Here's how:

---

## 🎯 First Installation

### Option 1: Download APK (Easiest)
1. Go to [GitHub Releases](https://github.com/sahaya-savari/daily-spark/releases/latest)
2. Download the APK file (e.g., `app-release.apk`)
3. Open the file on your Android phone
4. Tap **"Install"**
5. Your data is automatically saved locally

### Option 2: Via Google Play (Coming Soon)
- Download from Play Store
- Automatic updates enabled by default

---

## 🔄 Updating to a New Version

### Before: Had to uninstall old version ❌
### Now: Just install the new APK directly ✅

**Steps to update:**
1. Download the new APK from [releases](https://github.com/sahaya-savari/daily-spark/releases/latest)
2. Open the APK on your phone
3. Android will show: **"This will replace the existing app"**
4. Tap **"Install"**
5. Done! Your streaks and settings are preserved

> ✅ **Your data is always safe** - saved locally on your phone

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
