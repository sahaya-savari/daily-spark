# Changelog

All notable changes to Daily Spark will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Social & sharing features
- Advanced analytics
- Themes & achievements
- Optional cloud sync
- Multi-language support

---

## [1.0.3] — 2026-02-05

### Added
- 🔄 Full JSON backup & restore functionality
- 🧱 Atomic import with rollback protection
- 📄 CSV export for streak configurations
- 📦 Universal Android APK (single file, no splits)
- 🛠️ Java 17 compatible build configuration
- 📱 Signed release builds for app stores
- ❌ Support for Android 8 – Android 15

### Changed
- Build system optimized for universal APK distribution
- Enhanced release build configuration

### Fixed
- App stability improvements

---

## [1.0.2] — Previous Release

### Features
- Multiple streak tracking
- Emoji-based habit customization
- Calendar view for progress visualization
- Offline-first architecture
- Local data storage
- Dark mode support
- PWA installability
- Browser notifications (where supported)

---

## [1.0.1] — Previous Release

### Initial Public Release
- Core habit tracking functionality
- Streak management system
- Data persistence with localStorage
- Mobile-responsive design
- Basic UI/UX experience

---

## [1.0.0] — Project Inception

### Initial Development
- Foundation setup with React + TypeScript
- Vite build configuration
- Tailwind CSS + shadcn/ui styling
- PWA setup with Vite PWA Plugin
- Core streak tracking engine
- Local data storage system

---

## Release Guidelines

### For Contributors
When preparing a new release:
1. Update version in `package.json`
2. Document changes in this CHANGELOG
3. Create a Git tag: `git tag -a v1.0.x -m "Release v1.0.x"`
4. Push tag: `git push origin v1.0.x`
5. Create a GitHub Release with change notes

### Version Format
- **MAJOR.MINOR.PATCH** (e.g., 1.0.3)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

---

## Support

For issues or questions about releases, please open a GitHub issue.

GitHub Issues: https://github.com/sahaya-savari/daily-spark/issues
