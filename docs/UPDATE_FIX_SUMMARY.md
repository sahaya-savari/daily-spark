# ✨ Update System - What Was Fixed

## The Problem ❌

Your app couldn't update in place:
- Users had to **uninstall the old app** before installing a new version
- Super inconvenient and user-unfriendly
- Caused users to think they had to delete and lose their streaks
- Android version code was hardcoded to `1`, which prevented upgrades

## The Solution ✅

### What Changed

1. **Fixed Version Code** (Android only)
   - Changed from: `versionCode 1` (never changes)
   - Changed to: `versionCode 100003` (increases with each release)
   - Formula: `(major × 100000) + (minor × 1000) + patch`
   - Example: v1.0.3 → 100003, v1.2.5 → 100205

2. **Added Auto-Sync Script**
   - Created: `scripts/sync-version.js`
   - Automatically syncs version from `package.json` to Android `build.gradle`
   - No manual updating needed!

3. **New Build Command**
   - `npm run build:android` - builds with automatic version sync
   - `npm run sync-version` - manually sync if needed

4. **User-Friendly Documentation**
   - [INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md) - for end users
   - [UPDATE_GUIDE.md](./docs/UPDATE_GUIDE.md) - for developers & release process

## How It Works Now 🚀

### For Users
1. Download new APK from [Releases](https://github.com/sahaya-savari/daily-spark/releases)
2. Open the APK on phone
3. Tap "Install" - it replaces the old version automatically
4. ✅ All streaks and data are preserved!

### For Developers (Release Process)

**Step 1: Update version in package.json**
```json
{
  "version": "1.0.4"
}
```

**Step 2: Build with auto-sync**
```bash
npm run build:android
# This automatically:
# - Calculates versionCode (100004)
# - Updates build.gradle
# - Builds the Android project
```

**Step 3: Create GitHub Release**
- Upload APK from release build
- Users can now install as update!

## Files Changed

| File | What Changed |
|------|--------------|
| `package.json` | Added `build:android` and `sync-version` scripts |
| `android/app/build.gradle` | Updated `versionCode` from 1 → 100003 |
| `scripts/sync-version.js` | **NEW** - Auto-sync script |
| `docs/INSTALLATION_GUIDE.md` | **NEW** - User guide |
| `docs/UPDATE_GUIDE.md` | **NEW** - Developer release guide |
| `README.md` | Updated build instructions |

## Version Code Reference

The version code is calculated automatically from `package.json` version:

| Your Version | Android versionCode |
|--------------|-------------------|
| 1.0.0        | 100000 |
| 1.0.3        | 100003 |
| 1.0.4        | 100004 |
| 1.1.0        | 101000 |
| 1.2.5        | 102005 |
| 2.0.0        | 200000 |

**Rule:** Version code must **always increase** for Android to recognize it as an update!

## Testing the Fix

### Build a test version:
```bash
npm run build:android
# Navigate to: android/app/build/outputs/apk/release/
# Check: app-release.apk
```

### Install on device:
```bash
adb install -r app-release.apk
# The -r flag means "replace"
```

### Install another version:
```bash
# Update version in package.json to 1.0.4
npm run build:android
adb install -r app-release.apk
# ✅ Should install as update, not conflict!
```

## Bonus: Future Features

### In-App Update Notifier (Optional)
Created `src/components/UpdateNotifier.tsx` component that can:
- Check GitHub releases for new versions
- Notify users of updates
- Provide one-click download

To use:
```tsx
import { UpdateNotifier } from '@/components/UpdateNotifier';

// In your App
<UpdateNotifier owner="sahaya-savari" repo="daily-spark" />
```

## ✅ Results

| Before | After |
|--------|-------|
| ❌ Had to uninstall old app | ✅ Direct upgrade |
| ❌ Manual version tracking | ✅ Automatic sync |
| ❌ Risk of data loss | ✅ Data always preserved |
| ❌ Multi-step process | ✅ One-tap install |
| ❌ User confusion | ✅ Clear documentation |

## 📚 Documentation Links

- [INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md) - Share with users
- [UPDATE_GUIDE.md](./docs/UPDATE_GUIDE.md) - Use for releases
- [README.md](./README.md) - Updated main docs

---

**Your users can now update smoothly and keep all their streaks!** 🎉
