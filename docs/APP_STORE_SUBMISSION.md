# StreakFlame App Store Submission Checklist

Complete checklist for submitting to Google Play Store and Apple App Store.

---

## 📋 Common Requirements (Both Stores)

### App Identity
- [ ] **App Icon**: 1024x1024px, simple design, high contrast, no text
- [ ] **App Name**: "StreakFlame" (max 30 characters)
- [ ] **Short Description**: "Build habits with streak motivation" (max 80 chars)
- [ ] **Full Description**: Compelling, keyword-rich (see template below)

### Visual Assets
- [ ] Screenshots - Light mode (min 2, max 8)
- [ ] Screenshots - Dark mode (min 2, max 8)
- [ ] Feature graphic (Google Play): 1024x500px
- [ ] Preview video (optional but recommended)

### Legal & Compliance
- [ ] **Privacy Policy URL**: Required even with no tracking
- [ ] **Terms of Service URL**: Recommended
- [ ] **Support Email**: Valid, monitored email address
- [ ] **Support URL**: Link to documentation or FAQ

### Monetization Declaration
- [ ] ✅ No ads - declare "No advertising"
- [ ] ✅ No subscriptions - declare "No in-app purchases"
- [ ] ✅ No hidden fees - app is 100% free
- [ ] App description states: "Free Forever - No ads, no subscriptions"

### Testing
- [ ] Tested on real devices (not just emulators)
- [ ] All functional tests passed (see TESTING_CHECKLIST.md)
- [ ] No crash reports in last 48 hours
- [ ] Debug logging disabled

---

## 🤖 Google Play Store Specific

### Developer Account
- [ ] Google Play Console account ($25 one-time fee)
- [ ] Developer profile complete
- [ ] Payment profile set up (for future, if needed)

### App Bundle
- [ ] Target latest Android SDK (API 34+)
- [ ] Minimum SDK: API 24 (Android 7.0)
- [ ] AAB format (not APK)
- [ ] Signed with upload key
- [ ] Version code incremented

### Data Safety Section
```
Data collected:
- Email address (for authentication)
- User-generated content (streak names)

Data NOT collected:
- Location
- Financial information
- Contacts
- Photos/videos
- Audio
- Health/fitness data

Data handling:
- Data encrypted in transit
- Users can request data deletion
- Data not shared with third parties
```

### Content Rating
- [ ] Complete IARC questionnaire
- [ ] Expected rating: Everyone (PEGI 3 / ESRB E)

### Store Listing
- [ ] Category: Productivity or Health & Fitness
- [ ] Tags: habits, streaks, motivation, daily, tracker
- [ ] Contact email public
- [ ] Privacy policy linked

### Release Management
- [ ] Internal testing track first
- [ ] Closed testing with beta users
- [ ] Open testing (optional)
- [ ] Production release

### Policies Compliance
- [ ] No deceptive behavior
- [ ] No misleading claims
- [ ] Accurate screenshots
- [ ] No artificial installs/reviews

---

## 🍎 Apple App Store Specific

### Developer Account
- [ ] Apple Developer Program ($99/year)
- [ ] Certificates and provisioning profiles set up
- [ ] App ID registered in Apple Developer Portal

### App Build
- [ ] Built with latest Xcode
- [ ] Target latest iOS SDK
- [ ] Minimum iOS: 14.0
- [ ] All device sizes supported
- [ ] iPad optimized (if applicable)
- [ ] No private API usage

### App Store Connect
- [ ] App record created
- [ ] Bundle ID matches provisioning
- [ ] SKU assigned
- [ ] Primary language set

### Screenshots Requirements
| Device | Size | Required |
|--------|------|----------|
| iPhone 6.7" | 1290 x 2796 | Yes |
| iPhone 6.5" | 1284 x 2778 | Yes |
| iPhone 5.5" | 1242 x 2208 | Yes |
| iPad Pro 12.9" | 2048 x 2732 | If iPad supported |

### App Review Information
- [ ] Demo account credentials (if login required)
- [ ] Review notes explaining app functionality
- [ ] Contact information for reviewer

### Review Notes Template
```
StreakFlame is a habit tracking app focused on maintaining daily streaks.

Key Features:
1. Create daily habits with emoji icons
2. One-tap completion each day
3. Visual streak counter with fire animation
4. Statistics and insights page

Testing Instructions:
1. Tap "+" to create a new streak
2. Enter a name like "Exercise" and select an emoji
3. Tap the streak card to mark complete
4. View statistics on the Insights page

The app is completely free with no subscriptions, ads, or in-app purchases.

Note: Home screen widgets require the native app to be installed.
Widgets can be added via: Long press home screen → Add Widget → StreakFlame
```

### Widgets (iOS)
- [ ] Widget extension included in build
- [ ] All widget sizes tested (small/medium/large)
- [ ] Widget preview images provided
- [ ] Widget descriptions accurate

### Privacy
- [ ] App Privacy labels filled in App Store Connect
- [ ] Privacy nutrition label accurate
- [ ] Tracking transparency (not needed if no tracking)

### Human Interface Guidelines
- [ ] Native iOS feel
- [ ] Standard gestures used correctly
- [ ] No Android-style UI elements
- [ ] Safe areas respected
- [ ] Dynamic type supported

---

## 📝 App Description Template

### Short Description (80 chars)
```
Build unbreakable habits with streak motivation. Free forever, no ads.
```

### Full Description
```
🔥 StreakFlame - Your Daily Habit Companion

Build habits that stick with the power of streaks! StreakFlame makes daily consistency fun and motivating.

✨ FEATURES

• 🎯 Unlimited Streaks - Track as many habits as you want
• 🔥 One-Tap Completion - Mark habits done in under a second
• 📊 Insights & Stats - See your weekly and monthly progress
• 🌙 Dark Mode - Beautiful in any lighting
• 📱 Home Screen Widgets - See your streaks at a glance
• 🔔 Smart Reminders - Never forget your daily habits
• ☁️ Cloud Sync - Access from any device
• 🔒 Privacy First - Your data stays yours

🆓 100% FREE FOREVER
No ads. No subscriptions. No premium features locked behind paywalls. Ever.

💪 WHY STREAKS WORK
Psychology shows that maintaining streaks creates powerful motivation. The fear of "breaking the chain" keeps you consistent day after day.

Perfect for:
• Daily exercise
• Reading habits
• Meditation practice
• Learning languages
• Drinking water
• Any daily goal!

Start building unbreakable habits today. Download StreakFlame! 🔥
```

---

## ⚠️ Common Rejection Reasons to Avoid

### Google Play
- [ ] App crashes on startup
- [ ] Misleading description
- [ ] Privacy policy missing or invalid URL
- [ ] Requesting unnecessary permissions
- [ ] Debug certificate used
- [ ] Spam or duplicate content

### Apple App Store
- [ ] Crashes or bugs
- [ ] Incomplete functionality
- [ ] Placeholder content
- [ ] Poor UI (doesn't feel iOS-native)
- [ ] Hidden features not disclosed
- [ ] Privacy nutrition label inaccurate
- [ ] Not following HIG

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Beta feedback addressed
- [ ] Analytics set up
- [ ] Crash reporting enabled
- [ ] Support channels ready

### Launch Day
- [ ] Submit to both stores
- [ ] Monitor crash reports
- [ ] Respond to initial reviews
- [ ] Social media announcement
- [ ] Website updated

### Post-Launch (Week 1)
- [ ] Monitor reviews daily
- [ ] Track install numbers
- [ ] Fix any critical bugs immediately
- [ ] Gather user feedback
- [ ] Plan first update

---

## 📊 Success Metrics

Track these KPIs after launch:
- Daily Active Users (DAU)
- Retention Rate (Day 1, Day 7, Day 30)
- Crash-free rate (target: 99.5%+)
- Average rating (target: 4.5+)
- Review sentiment

---

**Ready for Submission:** ☐ Yes ☐ No

**Submitted Date:** ___________
**Review Status:** ___________
**Live Date:** ___________
