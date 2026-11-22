# F-Droid Packaging, Build & Submission Reference

This document serves as the permanent, authoritative reference for the **Daily Spark** (`com.santhosh.dailyspark2`) official submission to F-Droid via Merge Request [!56367](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/56367).

---

## 1. Quick Overview

| Property | Value |
|---|---|
| **App ID / Package Name** | `com.santhosh.dailyspark2` |
| **Application Name** | Daily Spark |
| **Upstream Git Repo** | `https://gitlab.com/sahaya-savari/daily-spark.git` |
| **F-Droid Fork Repo** | `https://gitlab.com/sahaya-savari/data.git` |
| **Branch** | `add-daily-spark` |
| **Metadata File** | `metadata/com.santhosh.dailyspark2.yml` |
| **Merge Request** | [F-Droid Merge Request !56367](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/56367) |
| **Passing CI Pipeline** | Pipeline `#3042222535` (Commit `b3aee33f80`) — 100% Green |

---

## 2. Complete Verified F-Droid Metadata File

File: `metadata/com.santhosh.dailyspark2.yml` (in `fdroiddata`)

```yaml
Categories:
  - Habit Tracker
  - Sports & Health
License: MIT
AuthorName: Santhosh
AuthorWebSite: https://sahaya-savari.gitlab.io/daily-spark/
SourceCode: https://gitlab.com/sahaya-savari/daily-spark
IssueTracker: https://gitlab.com/sahaya-savari/daily-spark/-/issues
Changelog: https://gitlab.com/sahaya-savari/daily-spark/-/releases

AutoName: Daily Spark

RepoType: git
Repo: https://gitlab.com/sahaya-savari/daily-spark.git

Builds:
  - versionName: 1.0.1
    versionCode: 100001
    commit: 9ebbeb3ca63ddd82796159cdadf919e83c189af2
    subdir: android/app
    sudo:
      - echo "deb https://deb.debian.org/debian forky main" > /etc/apt/sources.list.d/forky.list
      - apt-get update
      - apt-get install -y -t forky npm
    gradle:
      - yes
    output: build/outputs/apk/release/app-universal-release-unsigned.apk
    prebuild:
      - cd ../..
      - rm -rf src-tauri
      - rm -f public/Daily-Spark*
      - sed -i -e '/foojay/d' android/settings.gradle
      - npm ci
      - npm run build:android
      - rm -f dist/Daily-Spark*
      - find node_modules/ -iname "*.node" -exec rm {} \;
    scandelete:
      - node_modules

AutoUpdateMode: Version
UpdateCheckMode: Tags
CurrentVersion: 1.0.1
CurrentVersionCode: 100001
```

> [!IMPORTANT]
> **Line Endings:** The YAML file must use strict UNIX LF (`\n`). Windows CRLF (`\r\n`) will cause `fdroid rewritemeta` to fail in CI with git diff errors containing `^M`. Ensure `git config core.autocrlf false` in the `fdroiddata` repo.

---

## 3. Key Technical Challenges & Solutions Solved

### A. Node.js 24 Upgrade via Debian Forky
* **Problem**: `@capacitor/cli` v8 strictly requires Node.js `>= 22.0.0`. The F-Droid buildserver runs Debian Trixie which only ships Node.js 20.
* **Solution**: Add Debian `forky` (testing/unstable) repository in `sudo:`:
  ```yaml
  sudo:
    - echo "deb https://deb.debian.org/debian forky main" > /etc/apt/sources.list.d/forky.list
    - apt-get update
    - apt-get install -y -t forky npm
  ```
  This installs official Node.js 24 and npm 12 without violating F-Droid's airgap rules or downloading third-party curl binaries.

### B. F-Droid Binary Scanner Blockers
* **Problem**: F-Droid scanner failed with 8 errors:
  1. `org.gradle.toolchains.foojay-resolver` flagged as unknown dependency resolver plugin.
  2. `src-tauri/Cargo.toml` without a lockfile.
  3. Prebuilt desktop executables (`.exe`, `.tar.gz`, `.zip`) in `public/` and `dist/`.
  4. Native binaries (`.node`) in `node_modules`.
* **Solution**: Cleaned in `prebuild` and `scandelete`:
  ```yaml
  prebuild:
    - cd ../..
    - rm -rf src-tauri
    - rm -f public/Daily-Spark*
    - sed -i -e '/foojay/d' android/settings.gradle
    - npm ci
    - npm run build:android
    - rm -f dist/Daily-Spark*
    - find node_modules/ -iname "*.node" -exec rm {} \;
  scandelete:
    - node_modules
  ```
  *Note:* Native `.node` files must be removed *after* `npm run build:android` finishes because the Vite/Rolldown build process requires them during compilation.

### C. Fastlane Metadata & Translatable Summaries
* **Problem**: CI jobs `tools check scripts` (`make-summary-translatable.py`) and `fdroid rewritemeta` threw errors when `Summary:` and `Description:` were hard-coded in the YAML file alongside existing Fastlane directories.
* **Solution**: Fastlane directory structure in the app repository:
  ```
  fastlane/metadata/android/en-US/
  ├── title.txt
  ├── short_description.txt
  ├── full_description.txt
  └── changelogs/
      └── 100001.txt
  ```
  Omit `Summary:` and `Description:` from the YAML file; F-Droid automatically extracts them from the upstream repo.

### D. Multi-APK Output Resolution
* **Problem**: `ERROR: Could not build app com.santhosh.dailyspark2: More than one resulting apks found in build/com.santhosh.dailyspark2/android/app/build/outputs/apk/release`.
* **Reason**: Gradle build configured ABI splits (generating `app-arm64-v8a-release-unsigned.apk`, `app-armeabi-v7a-release-unsigned.apk`, and `app-universal-release-unsigned.apk`).
* **Solution**: Explicitly set the output path relative to `subdir: android/app`:
  ```yaml
  output: build/outputs/apk/release/app-universal-release-unsigned.apk
  ```

### E. F-Droid Category Schema
* **Problem**: F-Droid schemas strictly enforce recognized category names. Categories like `'Time'` or `'Office'` are rejected.
* **Solution**: Use valid categories:
  ```yaml
  Categories:
    - Habit Tracker
    - Sports & Health
  ```

---

## 4. How to Release Future Updates (v1.0.2+)

When releasing a new version:

1. **In `daily-spark` (App Repo)**:
   * Update version in `package.json` (e.g. `"version": "1.0.2"`).
   * Update version in `android/app/build.gradle`:
     ```groovy
     versionCode 100002
     versionName "1.0.2"
     ```
   * Add new changelog: `fastlane/metadata/android/en-US/changelogs/100002.txt`.
   * Commit, tag with git (`git tag v1.0.2`), and push tags to GitLab & GitHub:
     ```bash
     git push origin main --tags
     git push gitlab main --tags
     ```

2. **In `fdroiddata` (After MR is merged into upstream)**:
   * Because `AutoUpdateMode: Version` and `UpdateCheckMode: Tags` are configured:
     F-Droid's `checkupdates` bot automatically polls `https://gitlab.com/sahaya-savari/daily-spark.git` tags, discovers `v1.0.2`, and automatically adds the new build recipe!
   * If updating manually before bot runs, append a new block to `Builds:` with the new commit hash and version code, and update `CurrentVersion` and `CurrentVersionCode`.

---

## 5. Helpful Commands & Verification

* Check pipeline status on GitLab MR:
  `https://gitlab.com/fdroid/fdroiddata/-/merge_requests/56367/pipelines`
* Inspect upstream git tags:
  `git ls-remote https://gitlab.com/sahaya-savari/daily-spark.git`

