# FAQ

**Is my data stored online?**
No. All your data stays on your device. There is no cloud sync or online storage.

**Will updates delete my streaks?**
No. Updates never erase your data. Your streaks and settings are preserved.

**What happens if I uninstall the app?**
Uninstalling the app will remove all local data. Make a backup before uninstalling if you want to keep your streaks.

**What’s the difference between CSV and JSON backup?**
- JSON: Full backup and restore (all streaks and settings)
- CSV: Export/import for adding new streaks only (does not overwrite existing data)

**Can I restore old backups?**
Yes. You can restore any valid JSON backup created by Daily Spark.

**Does the app use the internet?**
No. Daily Spark works fully offline and does not require an internet connection.

**Can I sync across devices?**
No. There is no sync or cloud feature. All data is local.

**What we do:**
- Store data locally on your device only
- Never upload anything
- Never share anything
- Never collect anything

**What you must do:**
- Backup regularly
- Store backups safely
- Uninstall carefully (export backup first)

---

## Backup & Restore

### What's the difference between JSON and CSV?

**JSON Backup (Full):**
- Exports EVERYTHING
- All streaks + names + emojis
- Complete history (all completion dates)
- Reminders settings
- Starred & archived status
- Use this to: Restore to new phone, backup before reset

**CSV Import (Add New):**
- Imports NEW streaks only
- Starts at Day 1 (no history)
- Does NOT overwrite existing
- Use this to: Bulk add habits, import from templates

---

### How do I backup my data?

1. Open Settings
2. Tap "Backup & Restore"
3. Tap "Export Full Backup (JSON)"
4. Save the file to cloud (Google Drive, Dropbox, etc.)
5. Or email it to yourself
6. Keep it safe

---

### How do I restore from backup?

1. Open Settings
2. Tap "Backup & Restore"
3. Tap "Restore from JSON"
4. Select your JSON backup file
5. Done! All data restored

---

### What if I uninstall the app?

**If you have a backup:**
- Reinstall the app
- Restore from your JSON backup
- All data comes back

**If you don't have a backup:**
- All local data is deleted
- Nothing can be recovered
- This is why backups are important

---

### How often should I backup?

**Recommended:** Weekly or monthly

**When to definitely backup:**
- Before updating the app
- Before resetting your phone
- Before switching devices
- Before major OS updates

---

## Using the App

### How often can I mark a streak as done?

Once per day. Even if you complete something multiple times, the app counts it as one completion per day.

This prevents:
- Over-counting
- False progress
- Inflated streaks

---

### Can I undo a completion?

Yes. If you mark something done by mistake, tap it again to undo within the grace period (24 hours).

After 24 hours, it's locked as a permanent completion.

---

### What's a grace period?

A grace period (24 hours) allows you to:
- Undo a mistake completion
- Say "actually, I didn't finish that"
- Break this is optional before 24 hours

After 24 hours, the day is final.

---

### Can I edit or delete streaks?

Yes.

**Edit:** Tap the streak → Edit name, emoji, or settings
**Delete:** Tap the streak → Delete (permanent, but you have backup)

---

### Can I archive streaks?

Yes. Move streaks to "Archived" list to:
- Clean up your active list
- Keep old streaks as reference
- Move them back anytime

---

## Notifications

### Do notifications work offline?

No. Reminders require:
- Your phone to be on
- The app to run in background
- Your device's notification system

They do NOT need internet.

---

### Can I turn off notifications?

Yes. For each streak:
- Disable reminders on/off
- Choose times
- Choose days

Or globally: Settings → disable all notifications

---

### Why did I not get a notification?

Possible reasons:
- Reminders not enabled for that streak
- Phone was off or in sleep
- Battery saver mode blocked notifications
- Android permission was denied
- Notification was dismissed by OS

Notifications are best-effort only.

---

### Will the app crash if I deny notification permission?

No. Daily Spark works fine without notifications. Just won't remind you.

---

## Data & Safety

### Will updates delete my data?

No. App updates preserve all your data:
- Streaks stay
- Completion history stays
- Settings stay
- Nothing is lost

---

### Can I move my data to a new phone?

Yes.

**Steps:**
1. On old phone: Export JSON backup
2. Save to cloud (Google Drive, Dropbox, etc.)
3. On new phone: Install app
4. Restore from JSON backup
5. All data appears

---

### What happens if my phone breaks?

If you have a backup:
- Get a new phone
- Install Daily Spark
- Restore from backup
- Everything comes back

If you don't have a backup:
- Data is gone (this is why backups matter)

---

### Is my data encrypted?

Not by the app itself. Your data is protected by:
- Device-level Android security
- Your lock screen / biometric
- File system permissions

That's enough for local-only apps.

---

### Can you see my streaks?

No. We don't have access to your device or data.

Daily Spark never uploads anything anywhere.

---

## Troubleshooting

### The app crashed. Is my data lost?

No. Daily Spark saves data automatically and frequently. A crash doesn't delete streaks.

Just restart the app.

---

### A streak disappeared!

Check if it's:
- Archived? (check "Archived" list)
- Completed? (check "Active" list - might be moved)

If truly missing:
- Restore from JSON backup
- Report issue on GitHub

---

### The calendar shows wrong numbers

Try:
- Close and reopen app
- Restart phone
- Check if all streaks are visible

If still wrong:
- Export backup
- Reinstall app
- Restore backup
- Report issue on GitHub

---

### Notifications stopped working

Try:
- Go to Settings → disable & re-enable
- Close app, restart phone
- Ask Android to re-enable notifications

If still broken:
- It's an Android-level issue
- Report on GitHub

---

## Legal & License

### What license is this under?

MIT License. You can:
- Use it personally
- Modify it
- Share it
- Distribute it

See LICENSE file.

---

### Is this open source?

Yes. Code is available on GitHub:
https://github.com/sahaya-savari/daily-spark

---

### What happens if the app shuts down?

Even if Daily Spark stops being maintained:
- Your data stays on your device
- You can keep using it
- Your backup stays yours
- You can switch apps anytime

---

### Is there a Phase-2?

Yes, planned features:
- Simple notes per streak
- More notification options
- UX improvements

Phase-2 will NOT break existing data.

---

## Contact & Support

### Where do I report bugs?

GitHub Issues:
https://github.com/sahaya-savari/daily-spark/issues

---

### Can I request a feature?

Yes, open an issue on GitHub.

No guarantee it will be added, but we listen.

---

### Why no Discord or Twitter support?

We want to keep things simple:
- One support channel (GitHub)
- Transparent public discussion
- No private conversations
- Community can help each other

---

### I lost my data. Can you recover it?

Unfortunately, no.

If you didn't backup:
- Data is gone
- We have no access to your device
- No data recovery service exists

This is why backups are critical.

---

## Final Thoughts

### Should I trust Daily Spark?

Trust is earned. Here's what we offer:
- Open source code (verify it yourself)
- No account required (no honeypot)
- No servers (can't hack what doesn't exist)
- MIT license (legal safety)
- This FAQ (transparency)

What you provide:
- Your own backup responsibility

---

### Is there anything else I should know?

Yes:
- Backup regularly
- Don't uninstall without exporting
- Notifications are best-effort
- Your data is your responsibility
- We won't spam or change the deal

---

**Last Updated:** February 2026

Have more questions? Open an issue on GitHub.
