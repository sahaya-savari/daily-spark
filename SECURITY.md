# Security Policy

Daily Spark is built to be private by design.

## Privacy & Security Principles

- No accounts or authentication
- No tracking or analytics
- No cloud sync
- All data stays on your device
- Works fully offline; core features make no network requests

## Supported Versions

| Version | Supported |
|---|---|
| Latest Phase-1 release | ✅ Security and data-safety fixes |
| Older releases | ❌ Please update to the latest release |

Phase-1 is locked: only critical bug fixes and data-safety fixes are accepted.

## Reporting a Vulnerability

If you discover a security issue, please report it responsibly.

**Preferred (private):** use GitHub's private reporting. Go to the **Security** tab of this repository and click **Report a vulnerability**.

**Alternative:** if private reporting is not available, open a [GitHub Issue](https://github.com/sahaya-savari/daily-spark/issues) with the title prefix `[Security]`. Please do **not** post exploit details, proof-of-concept code, or anyone's personal data publicly.

### What to include

- A clear description of the issue and its impact
- Steps to reproduce
- App version and Android version (or browser, for the web version)
- Any suggested fix, if you have one

### What to expect

- Reports are reviewed on a best-effort basis
- Valid issues will be fixed in a new release and, if you wish, you will be credited
- Please allow reasonable time for a fix before any public disclosure

## Scope

**In scope**
- The Daily Spark Android app
- The web version (PWA)
- Backup and restore (JSON) and CSV import handling
- Local data storage and notification handling

**Out of scope**
- Vulnerabilities in third-party libraries with no impact on Daily Spark (report these upstream)
- Issues that require a rooted or compromised device, or physical access to an unlocked phone
- Social engineering or spam

## Your Data & Backups

Daily Spark stores everything locally, so protecting your data is partly in your hands.

- Export a JSON backup regularly
- Store backup files somewhere safe, because they contain your full streak history
- Only restore backup files from sources you trust
- Android permissions are optional; the app works if notifications are denied

## Disclaimer

Daily Spark is provided as-is under the MIT License, with no warranty of any kind.
