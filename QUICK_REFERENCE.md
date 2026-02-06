# 🚀 Quick Reference - App Updates Fixed!

## For Users: Update Instructions

```
1. Download new APK from GitHub Releases
2. Open APK on phone
3. Tap "Install"
✅ Done! Your streaks are safe
```

📖 Full guide: [docs/INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md)

---

## For Developers: Release Checklist

```bash
# 1. Update version
nano package.json  # Change "version": "1.0.4"

# 2. Build with auto-sync
npm run build:android

# 3. Verify (optional)
jarsigner -verify android/app/build/outputs/apk/release/app-release.apk

# 4. Create release on GitHub
# Upload: android/app/build/outputs/apk/release/app-release.apk

✅ Users can now upgrade!
```

📖 Full guide: [docs/UPDATE_GUIDE.md](./docs/UPDATE_GUIDE.md)

---

## The Fix Explained

| Before | After |
|--------|-------|
| versionCode: `1` | versionCode: `100003` |
| ❌ No updates | ✅ Updates work |
| Manual version sync | Auto-sync via npm script |

---

## Version Code Formula

```
versionCode = (major × 100000) + (minor × 1000) + patch

Examples:
1.0.3  → 100003
1.0.4  → 100004
1.2.5  → 102005
2.0.0  → 200000
```

---

## New Commands

```bash
npm run sync-version     # Manual sync
npm run build:android    # Build + auto-sync + sign
```

---

## Documentation

| File | For | Purpose |
|------|-----|---------|
| [INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md) | Users | How to install/update |
| [UPDATE_GUIDE.md](./docs/UPDATE_GUIDE.md) | Developers | Release process |
| [SIGNING_GUIDE.md](./docs/SIGNING_GUIDE.md) | Developers | Security & keystores |

---

## Common Issues

**"App won't update"**  
→ Make sure you ran `npm run build:android` before building

**"Application not installed"**  
→ Check phone storage space, or uninstall old version first

**"Version code didn't change"**  
→ Run: `npm run sync-version` and check build.gradle

---

## Key Files Created/Changed

- ✅ `scripts/sync-version.js` - Auto-sync script
- ✅ `package.json` - New npm scripts
- ✅ `android/app/build.gradle` - Updated versionCode
- ✅ `docs/` - 4 new guides

---

## Status

✅ Version matching: Fixed  
✅ Auto-sync script: Working  
✅ Documentation: Complete  
✅ Ready to release: Yes  

---

**Next release:** Run `npm run build:android` and users can upgrade directly!

For details: See [UPDATE_FIX_COMPLETE.md](./UPDATE_FIX_COMPLETE.md)
