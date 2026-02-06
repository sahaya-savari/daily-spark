# 🔄 Daily Spark - Update & Release Guide

## For Users: How to Update

### ✅ What's Fixed
Your app **now supports in-place updates**! You can install new versions without deleting the old one.

### 📱 Updating on Android

**Method 1: Direct Install (Easiest)**
1. Download the new APK from [GitHub Releases](https://github.com/sahaya-savari/daily-spark/releases)
2. Open the APK file on your phone
3. Tap "Install" - it will **replace the old version automatically**
4. No need to uninstall anything!

**Method 2: Via ADB (Developer)**
```bash
# Builds and installs latest version
adb install -r output/daily-spark.apk
```

**Method 3: Check for Updates in App** (Coming Soon)
- Settings → App Updates → Check for updates
- Automatic download and install

---

## For Developers: Release Process

### 🚀 Making a New Release

#### Step 1: Update Version
Edit `package.json` and update the version number:
```json
{
  "version": "1.0.4"
}
```

Version format: `MAJOR.MINOR.PATCH` (semantic versioning)

#### Step 2: Build with Auto-Version Sync
```bash
# This automatically syncs version code to Android
npm run build:android

# Or manually sync before building
npm run sync-version
npm run build -- --mode capacitor
```

**What happens:**
- `1.0.4` → Android versionCode: `100004`
- `2.1.3` → Android versionCode: `200103`
- Formula: `(major * 100000) + (minor * 1000) + patch`

#### Step 3: Verify Version in build.gradle
```gradle
versionCode 100004
versionName "1.0.4"
```

#### Step 4: Complete Android Build
```bash
cd android
./gradlew clean assembleRelease
cd ..
```

#### Step 5: Sign APK
```bash
# Using keystore (ensure keystore.properties is configured)
# Gradle will automatically sign during assembleRelease
```

#### Step 6: Create GitHub Release
1. Go to [Releases](https://github.com/sahaya-savari/daily-spark/releases)
2. Click "Create a new release"
3. Tag: `v1.0.4` (version number)
4. Title: `Daily Spark v1.0.4`
5. Description: Include changelog
6. Upload APK: `android/app/build/outputs/apk/release/app-release.apk`

---

### 📋 Version Code Reference

| Version | VCode | Formula |
|---------|-------|---------|
| 1.0.0   | 100000 | (1×100k) + (0×1k) + 0 |
| 1.0.3   | 100003 | (1×100k) + (0×1k) + 3 |
| 1.5.2   | 105002 | (1×100k) + (5×1k) + 2 |
| 2.0.0   | 200000 | (2×100k) + (0×1k) + 0 |

**Rule:** Version code must **always increase** for updates to work!

---

### 🔐 Securing Your Release

Before building release APK:

1. **Ensure keystore.properties exists:**
   ```properties
   storeFile=/path/to/release-key.jks
   storePassword=yourPassword
   keyAlias=yourAlias
   keyPassword=yourKeyPassword
   ```

2. **Never commit keystore files** (.gitignore):
   ```
   keystore.properties
   *.jks
   release-key.jks
   ```

3. **Test release build locally:**
   ```bash
   npm run build:android
   # Then in Android Studio: Build → Build Bundle(s) / APK(s)
   ```

---

### 🔧 Troubleshooting Updates

**Problem: "App not installed" error**
- ❌ Version code didn't increase
- ✅ Solution: Run `npm run sync-version` before building

**Problem: "Cannot replace existing package"**
- ❌ APK is signed with different keystore
- ✅ Solution: Use the same release keystore every time

**Problem: User can't install new version**
- ❌ Old app not uninstalled first
- ✅ Solution: They must clear storage or uninstall first

**Problem: Version sync script not working**
- ❌ Wrong directory or Node.js not installed
- ✅ Solution: Run from repo root: `npm run sync-version`

---

### 📊 Automated Workflow (Optional)

For GitHub Actions, create `.github/workflows/release.yml`:

```yaml
name: Release APK
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm run sync-version
      - run: npm run build:android
      # ... build Android APK
      # ... upload to release
```

---

## ✅ Checklist Before Release

- [ ] Updated version in `package.json`
- [ ] Ran `npm run sync-version` (or `npm run build:android`)
- [ ] Built Android release APK
- [ ] Tested APK on device (install, functionality, update)
- [ ] Tagged commit: `git tag v1.0.4`
- [ ] Created GitHub Release
- [ ] Uploaded APK to release

---

## 📚 Resources

- [Semantic Versioning](https://semver.org/)
- [Android App Versioning](https://developer.android.com/studio/publish/versioning)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

---

**Now your users can update seamlessly!** 🎉
