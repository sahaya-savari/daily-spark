# 🔐 App Signing & Release Security

## ⚠️ Critical for Updates to Work

For users to upgrade from one version to another, **you must use the same keystore and signing certificate every time**.

If you sign with a different certificate, Android will treat it as a completely different app and won't allow updates.

---

## 🔑 Generating Your Release Keystore

### ✅ DO THIS ONCE at the beginning

```bash
# Generate keystore (one-time setup)
keytool -genkey -v -keystore release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias daily_spark_key \
  -storepass YourStrongPassword \
  -keypass YourStrongPassword
```

**Output:**
- `release-key.jks` - Your signing certificate (KEEP SAFE!)
- Used for all future releases

### Fill in keystore.properties

```properties
storeFile=release-key.jks
storePassword=YourStrongPassword
keyAlias=daily_spark_key
keyPassword=YourStrongPassword
```

> ⚠️ **Never commit `keystore.properties` or `release-key.jks` to git!**  
> They're already in `.gitignore` - keep it that way!

---

## 🔒 Protecting Your Keystore

### Store Securely (Choose One)

**Option 1: Local Machine Only (Recommended for small teams)**
```bash
# Store keystore outside the repo
~/.android/daily-spark/release-key.jks
# Update keystore.properties path
storeFile=/Users/yourname/.android/daily-spark/release-key.jks
```

**Option 2: Cloud Storage (Team collaboration)**
- Store in **1Password** or **LastPass** (password manager)
- Share keystore details with team securely
- Never commit to GitHub

**Option 3: CI/CD Secret (GitHub Actions)**
```yaml
# .github/workflows/release.yml
env:
  KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
  KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
```

> Create secrets at: GitHub → Settings → Secrets and variables → Actions

### Backup Your Keystore
```bash
# After creating keystore, make a secure backup
cp release-key.jks ~/Backups/daily-spark-keystore.jks
# Store the backup securely (encrypted, password protected)
```

---

## 🚀 Release Process (with Signing)

### Step 1: Update Version
```json
{
  "version": "1.0.4"
}
```

### Step 2: Run Build with Auto-Sync & Sign
```bash
npm run build:android
# Gradle automatically signs during release build
# Requires valid keystore.properties with correct paths
```

### Step 3: Verify Signing
```bash
# Check if APK is signed
jarsigner -verify -verbose app-release.apk

# Should show:
# - X.509, CN=daily_spark_key
# - jar verified.
```

### Step 4: Create Release
1. Tag: `git tag v1.0.4`
2. Push: `git push --tags`
3. Upload APK to GitHub Releases
4. ✅ Users can now upgrade!

---

## ✅ Verify Update Chain Works

```bash
# Build v1.0.3
npm run build:android

# Install v1.0.3
adb install -r app-release.apk

# Update package.json to 1.0.4
# Build v1.0.4
npm run build:android

# Install v1.0.4 (should upgrade, not error)
adb install -r app-release.apk
# Should say: "Package com.santhosh.dailyspark2 is being replaced"
```

---

## 🐛 Troubleshooting Signing Issues

### Error: "Certificate fingerprint does not match"
- ❌ You used a different keystore
- ✅ Use the original keystore from release-key.jks

### Error: "Failed to read key pair"
- ❌ Keystore.properties path is wrong
- ✅ Check full path: `~/path/to/release-key.jks`

### Error: "keystore password was incorrect"
- ❌ Password in keystore.properties is wrong
- ✅ Verify the password you set during `keytool`

### APK won't install over existing version
- ❌ APK signed with different certificate
- ✅ Regenerate APK with correct keystore, or uninstall old app first

### Version code didn't increase
- ❌ You forgot to run `npm run build:android`
- ✅ The sync-version script increases versionCode automatically

---

## 📋 Security Checklist

Before every release:

- [ ] ✅ Keystore.properties is in `.gitignore`
- [ ] ✅ Using same keystore as previous releases
- [ ] ✅ Version code will increase (via sync-version)
- [ ] ✅ Tested update path locally (adb install -r)
- [ ] ✅ APK is verified signed (`jarsigner -verify`)
- [ ] ✅ Backed up keystore securely
- [ ] ✅ Password stored safely (1Password, etc)

---

## 🔐 Team Access to Keystore

### Safe way to share keystore with team:

**DO:**
- ✅ Use 1Password, LastPass, or Vault
- ✅ Share keystore artifact separately from keystore.properties
- ✅ Each developer has local keystore.properties
- ✅ Rotate passwords periodically
- ✅ Document who has access

**DON'T:**
- ❌ Commit keystore to git
- ❌ Email keystore unencrypted
- ❌ Share password in Slack/Teams
- ❌ Store on Google Drive without encryption
- ❌ Use same keystore password everywhere

---

## 🔄 Using GitHub Secrets (Recommended)

### For automated releases via GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Build and Release APK

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Create keystore from secret
      - name: Decode keystore
        run: |
          echo "${{ secrets.KEYSTORE_B64 }}" | base64 --decode > release-key.jks
      
      # Create keystore.properties from secret
      - name: Create keystore.properties
        run: |
          cat > android/keystore.properties << EOF
          storeFile=$(pwd)/release-key.jks
          storePassword=${{ secrets.KEYSTORE_PASSWORD }}
          keyAlias=daily_spark_key
          keyPassword=${{ secrets.KEY_PASSWORD }}
          EOF
      
      # Build
      - name: Build APK
        run: npm run build:android
      
      # Upload to release
      - name: Upload APK
        uses: softprops/action-gh-release@v1
        with:
          files: android/app/build/outputs/apk/release/app-release.apk
```

### In GitHub Secrets add:
- `KEYSTORE_PASSWORD` - your keystore password
- `KEY_PASSWORD` - your key password
- `KEYSTORE_B64` - base64 encoded keystore file

```bash
# Encode keystore
base64 release-key.jks | pbcopy  # macOS
# Then paste into GitHub Secret
```

---

## 📚 Resources

- [Android App Signing Guide](https://developer.android.com/studio/publish/app-signing)
- [Keytool Documentation](https://docs.oracle.com/en/java/javase/17/docs/specs/man/keytool.html)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Keep your keystore safe, and your users will have smooth updates!** 🔐

---

*Last updated: Feb 6, 2026*
*Daily Spark — Secure Release Management*
