# Daily Spark 🔥

**Build lasting habits with Daily Spark. Track daily streaks, celebrate consistency, and never break the chain.**

## About

Daily Spark is a minimal, offline-first Progressive Web App (PWA) for tracking daily habits and streaks. It's designed to be simple, fast, and works completely offline—making it the perfect companion for building lasting habits.

Whether you want to track exercise, reading, meditation, or any daily habit, Daily Spark gives you a visual way to see your progress and stay motivated.

## Features

- ✅ **Track Multiple Streaks** - Create custom habits with emojis and track them all in one place
- ✅ **Streak Calendar** - View your habit history on a beautiful calendar interface
- ✅ **Completely Offline** - Works without internet—your data stays on your device
- ✅ **Data Backup** - Export and import your data anytime
- ✅ **Share Your Progress** - Share your streaks with friends and stay accountable
- ✅ **Customizable Reminders** - Get notified daily (with daily/custom repeat schedules)
- ✅ **Dark Mode** - Easy on the eyes, anytime
- ✅ **PWA** - Install as an app on iOS, Android, or desktop

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (lightning-fast builds)
- Tailwind CSS (styling)
- shadcn/ui (accessible components)

**PWA & Storage:**
- Vite PWA Plugin (service worker, manifest)
- localStorage (persistent data storage)
- Notification API (reminders)

**Development:**
- ESLint (code quality)
- Vitest (unit testing)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/bun

### Installation

```bash
git clone https://github.com/sahaya-savari/daily-spark.git
cd daily-spark
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production with PWA support
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## How to Use

1. **Create a Streak** - Click "Add New Streak" and choose an emoji, name, and optional reminder
2. **Complete Daily** - Tap the streak card to mark it as done for the day
3. **View History** - Check the Calendar tab to see your habit history
4. **Track Progress** - See your stats (active streaks, completion rates, longest streaks)
5. **Backup Data** - Export your data in Settings to keep it safe

## PWA Installation

### On Mobile (iOS/Android)
1. Open Daily Spark in your browser
2. Tap "Share" → "Add to Home Screen"
3. Daily Spark appears as a native app

### On Desktop (Windows/Mac/Linux)
1. Open Daily Spark in Chrome/Edge
2. Click the "Install" button in the address bar
3. Daily Spark launches as a standalone window

## Project Structure

```
daily-spark/
├── src/
│   ├── pages/              # Page components (Home, Settings, About, etc.)
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic (reminders, backups, etc.)
│   ├── types/              # TypeScript interfaces
│   ├── lib/                # Utilities and constants
│   ├── contexts/           # React context for state management
│   └── App.tsx             # Main app component
├── public/                 # Static assets (icons, manifest, favicon)
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## Roadmap (Phase 2)

- 🎯 **Social Features** - Share streaks, comment on friends' progress, leaderboards
- 📊 **Advanced Analytics** - Charts, weekly/monthly trends, insights
- 🎨 **Customization** - Custom colors, themes, achievement badges
- 🔄 **Cloud Sync** - Optional cloud backup and cross-device sync
- 📱 **Native Apps** - Android & iOS native apps via Capacitor
- 🌍 **Internationalization** - Multi-language support

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to Daily Spark.

## License

Daily Spark is open source and available under the [MIT License](LICENSE). See the LICENSE file for details.

## Author

**Sahaya Savari**
- Full Stack Developer & Student
- GitHub: [@sahaya-savari](https://github.com/sahaya-savari)
- Project Repository: [daily-spark](https://github.com/sahaya-savari/daily-spark)

Passionate about building practical, user-friendly tools that solve real problems. Daily Spark is a passion project demonstrating full-stack web development capabilities.

---

**Built with ❤️ to help you build habits that last.**
