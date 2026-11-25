import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Smartphone,
  Globe2,
  Bug,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FolderOpen,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  PixelGithub,
  PixelGitlab,
  PixelFdroid,
} from "@/components/ui/pixel-icon";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SparkMark } from "@/components/brand/Logo";
import { DownloadApkButton } from "@/components/ui/DownloadApkButton";
import { HeatmapBackdrop } from "@/components/landing/HeatmapBackdrop";
import { EmberHeroDither } from "@/components/landing/EmberHeroDither";
import {
  CalendarScreen,
  DemoPhone,
  DEMO_HABITS,
  HabitScreen,
  HomeScreen,
  MiniPhone,
  NewHabitScreen,
  ProgressScreen,
  SettingsScreen,
  SettingsDetailsScreen,
  PreferencesScreen,
  BackupScreen,
  DesktopPreview,
  DeviceTransferScreen,
  WidgetsScreen,
  ScheduleScreen,
  PlannerScreen,
} from "@/components/landing/DemoPhone";
import { useReveal } from "@/hooks/use-reveal";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { SITE, SITE_FAQS } from "@/lib/site";
import { PlatformDownloadGrid } from "@/components/landing/PlatformDownloadGrid";



const FEATURES = [
  {
    icon: CheckCircle2,
    tag: "Daily",
    title: "Fast, flexible check-ins",
    body: "Track simple habits, measurable goals such as water or pages, and habits you want to avoid.",
  },
  {
    icon: FolderOpen,
    tag: "Organize",
    title: "Collections & routines",
    body: "Group existing habits into morning, study, health, or evening routines and complete them in a guided flow.",
  },
  {
    icon: Calendar,
    tag: "Schedule",
    title: "Plans that fit real weeks",
    body: "Choose daily, selected-day, or weekly-target schedules, with pause, snooze, and vacation support.",
  },
  {
    icon: Clock,
    tag: "Focus",
    title: "Built-in focus timer",
    body: "Start a focused session from a habit, use optional ambient sound, and record the time when you finish.",
  },
  {
    icon: BarChart3,
    tag: "Progress",
    title: "Useful progress, no pressure",
    body: "See streaks, completion rates, consistency, and activity patterns without leaderboards or guilt.",
  },
  {
    icon: ShieldCheck,
    tag: "Local first",
    title: "Private data & portable backups",
    body: "Your habits stay on your device. Export, inspect, and restore backups whenever you choose.",
  },
  {
    icon: Calendar,
    tag: "History",
    title: "Calendar & Heatmap",
    body: "Review individual days, monthly completion, and longer activity patterns at a glance.",
  },
  {
    icon: Smartphone,
    tag: "Android",
    title: "Home-screen widgets",
    body: "Check today, your current streak, or recent activity without opening the full app.",
  },
] as const;

const SHOTS = [
  ["Today", <HomeScreen key="h" habits={DEMO_HABITS} />],
  ["Today planner", <PlannerScreen key="planner" />],
  ["Habits", <HabitScreen key="d" />],
  ["New habit", <NewHabitScreen key="n" />],
  ["Schedules & goals", <ScheduleScreen key="schedule" />],
  ["Progress", <ProgressScreen key="p" initialSubTab="overview" />],
  ["Calendar", <CalendarScreen key="c" />],
  ["Settings", <SettingsScreen key="s" />],
  ["Preferences", <PreferencesScreen key="preferences" />],
  ["Data & backups", <BackupScreen key="backups" />],
  ["Device transfer", <DeviceTransferScreen key="transfer" />],
  ["Android widgets", <WidgetsScreen key="widgets" />],
  ["Settings options", <SettingsDetailsScreen key="settings-options" />],
] as const;

const NOT_DOING = [
  "No AI coaching",
  "No gamification",
  "No social feeds",
  "No leaderboards",
  "No pushy streaks",
  "No forced reminders",
  "No automatic data syncing",
  "No paywalls or ads",
] as const;

const btn =
  "inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full border px-6 sm:px-7 py-3.5 sm:py-4 font-display text-sm sm:text-base font-bold tracking-normal transition-all duration-200 max-w-full";

interface LandingPageProps {
  targetSection?: "features" | "screens" | "get";
}

export function LandingPage({ targetSection }: LandingPageProps) {
  useReveal();
  const location = useLocation();
  const router = useRouter();
  const [motionPaused, setMotionPaused] = useState(false);
  const accent = useThemeAccent();

  useEffect(() => {
    // Landing page always maintains the signature Ember brand palette
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-expressive", "theme-classic");
      document.documentElement.classList.add("theme-minimal");
      document.documentElement.style.setProperty("--ember", "#EC894C");
      document.documentElement.style.setProperty("--ember-glow", "rgba(236, 137, 76, 0.45)");
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash === "get") {
      router.navigate({ to: "/download", replace: true });
      return;
    }
    if (hash === "features") {
      router.navigate({ to: "/features", replace: true });
      return;
    }
    if (hash === "screens") {
      router.navigate({ to: "/screens", replace: true });
      return;
    }

    const target = targetSection || (location.hash ? location.hash.replace(/^#/, "") : "");
    if (target) {
      const timer = setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetSection, location.hash, router]);

  return (
    <div className="relative min-h-screen bg-background w-full max-w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader sticky={targetSection === "screens"} />

      <main id="main" tabIndex={-1} className="w-full max-w-full outline-none">
        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] items-center gap-10 sm:gap-11 px-4 sm:px-6 pb-8 pt-6 sm:pt-12 md:grid-cols-2 md:gap-14 md:pb-[72px] md:pt-[88px] overflow-hidden">
          {/* dithercn Ember Hero Aura Shader */}
          <EmberHeroDither />

          {/* Matrix heatmap tile backdrop inspired by habit activity grid */}
          <HeatmapBackdrop />

          <div className="order-1 md:order-1 flex min-w-0 flex-col items-start text-left w-full max-w-full">
            {/* Hero badge with optical alignment and cross-platform version tag */}
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="mb-6 sm:mb-8 inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#141414] py-1.5 pl-2 pr-4 text-xs sm:text-[13.5px] text-[#9A9A9A] transition-all hover:border-white/20 hover:text-white"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[rgba(217,161,132,0.14)] text-ember">
                <Download className="size-4" />
              </span>
              <b className="font-sans text-[14.5px] sm:text-[15.5px] font-bold text-white">{SITE.apk.version}</b>
              <span className="text-[#626262]">·</span>
              <span className="font-medium text-[#9A9A9A]">Offline-first APK</span>
            </a>

            <h1 className="font-display text-[clamp(44px,7.5vw,78px)] font-black uppercase tracking-tight leading-[1.02] text-left max-w-full">
              <span className="block text-white animate-rise-1">Show up.</span>
              <span className="block text-[#EC894C] drop-shadow-[0_4px_28px_rgba(236,137,76,0.45)] animate-rise-2">Tick it.</span>
              <span className="block text-[#9A9A9A] font-bold animate-rise-3">Keep going.</span>
            </h1>
            <p className="mb-5 sm:mb-6 mt-4 sm:mt-6 max-w-[42ch] text-[17px] sm:text-[20px] leading-relaxed text-muted-foreground text-left">
              A free, offline-first habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow - zero accounts, zero analytics, zero pressure.
            </p>

            {/* Quick trust & feature pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-7 text-xs sm:text-[13px] font-semibold text-faint">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/70 px-3 py-1 text-foreground/85 whitespace-nowrap">
                <ShieldCheck className="size-3.5 text-[#EC894C]" /> Core tracking works offline
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/70 px-3 py-1 text-foreground/85 whitespace-nowrap">
                <Smartphone className="size-3.5 text-[#EC894C]" /> {SITE.apk.size} APK
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/70 px-3 py-1 text-foreground/85 whitespace-nowrap">
                <Lock className="size-3.5 text-[#EC894C]" /> No analytics
              </span>
            </div>

            {/* Action Tier 1: Primary Mobile & Desktop Executables */}
            <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2 sm:[&>:first-child]:col-span-2">
              <DownloadApkButton
                className="btn-ember-glow inline-flex min-h-[48px] min-w-0 items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#090A0D] shadow-lg active:scale-95 transition-all sm:px-6 sm:text-base sm:tracking-wider"
              >
                <span className="flex min-w-0 items-center justify-center gap-2">
                  <Download className="size-4 shrink-0 stroke-[2.5]" />
                  <span className="sm:hidden">Download APK</span>
                  <span className="hidden sm:inline">Download Daily Spark APK</span>
                  <span className="shrink-0 font-mono text-[11px] font-semibold opacity-90 sm:text-xs">({SITE.apk.size})</span>
                </span>
              </DownloadApkButton>

              <Link
                to="/app"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#171A21] px-6 py-3 text-base font-semibold text-white whitespace-nowrap transition-all hover:border-white/30 hover:bg-[#1E222B] active:scale-95 shadow-sm shrink-0"
              >
                <Globe2 className="size-4 text-[#EC894C]" />
                <span className="whitespace-nowrap">Open Web App</span>
              </Link>

              <a
                href={SITE.repo}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-5 py-3 text-base font-semibold text-[#A0A6B4] whitespace-nowrap transition-all hover:border-white/20 hover:text-white shrink-0"
              >
                <PixelGithub className="size-4" />
                <span className="whitespace-nowrap">GitHub</span>
              </a>
            </div>

            {/* Action Tier 2: Open Source Release Mirrors */}
            <div className="mt-3 grid w-full max-w-md grid-cols-2 gap-2 [&>a]:min-h-11 [&>a]:justify-center">
              <a
                href={SITE.desktop.windowsZip}
                download={SITE.desktop.windowsZipFilename}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface/60 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-muted-foreground hover:text-white transition-colors"
              >
                <span>Windows ZIP · {SITE.desktop.version}</span>
              </a>
              <a
                href={SITE.desktop.linuxTarGz}
                download={SITE.desktop.linuxTarGzFilename}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface/60 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-muted-foreground hover:text-white transition-colors"
              >
                <span>Linux · {SITE.desktop.version}</span>
              </a>
              <a
                href={`${SITE.basePath}download#fdroid`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface/60 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-foreground/90 transition-all hover:border-[#1976D2]/60"
                aria-label="View Daily Spark on F-Droid"
              >
                <PixelFdroid className="size-3.5 shrink-0 text-[#1976D2]" />
                <span>F-Droid</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-[#1976D2]/20 text-[#64B5F6] border border-[#1976D2]/30">Pending</span>
              </a>
              <a
                href={SITE.gitlab.releases}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface/60 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-foreground/90 transition-all hover:border-[#FC6D26]/50"
                aria-label="View Daily Spark releases on GitLab"
              >
                <PixelGitlab className="size-3.5 shrink-0 text-[#FC6D26]" />
                <span>GitLab Releases</span>
              </a>
            </div>
            <p className="mt-4 sm:mt-5 text-xs sm:text-[14px] text-faint text-left font-medium">Android 7.0 or superior · No account · No ads</p>
          </div>

          {/* LOCK A: Single Mobile Phone Preview */}
          <div className="order-2 mt-6 sm:mt-0 flex min-w-0 justify-center md:order-2 w-full max-w-full">
            <DemoPhone />
          </div>
        </section>

        {/* What it does (Image 2 Upgrade: Bento Capabilities) */}
        <section
          id="features"
          className="reveal anchor-section mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
        >
          <div className="mb-10 text-left">
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-ember">
              Capabilities
            </span>
            <h2 className="mt-1 font-display text-[32px] sm:text-[38px] md:text-[44px] font-bold uppercase tracking-wide text-white">
              What it does
            </h2>
            <p className="mt-2 text-base sm:text-lg text-[#A0A6B4]">
              Honest, reliable tools designed to build lasting daily momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
            {FEATURES.map(({ icon: Icon, tag, title, body }) => (
              <article
                key={title}
                className="spotlight-card group flex flex-col justify-between rounded-2xl p-6 text-left transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-11 place-items-center rounded-xl border border-ember/25 bg-ember/10 text-ember transition-transform group-hover:scale-105">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A92A3] group-hover:text-ember group-hover:border-ember/30 transition-colors">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display text-[18px] sm:text-[19px] font-bold text-white group-hover:text-ember transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#A0A6B4]">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>


        {/* LOCK B: Screens Carousel Parade */}
        <section id="screens" className="relative anchor-section py-[56px] sm:py-[72px] overflow-hidden [contain:paint] [content-visibility:auto] [contain-intrinsic-size:auto_1200px]">
          <div
            className="aurora-field pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden"
            aria-hidden="true"
          />
          <div className="reveal mx-auto max-w-[1100px] px-4 sm:px-6">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 text-left">
              <div className="min-w-0 flex-1">
                <h2 className="mb-3 font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">Screens</h2>
                <p className="max-w-[52ch] text-base sm:text-lg text-muted-foreground">
                  Explore the app with sample habits. Existing screens stay here, with new previews for the optional
                  planner, schedules, settings categories, backups, transfers, and Android widgets.
                  On phones, swipe the rail; on wider screens, pause or play it.
                </p>
                <p className="mt-2 text-sm text-faint">
                  These are illustrative previews; optional and in-progress features may differ from the latest released APK.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMotionPaused((paused) => !paused)}
                aria-pressed={motionPaused}
                aria-label={motionPaused ? "Play screenshots" : "Pause screenshots"}
                className="hidden sm:inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-surface/70 px-4 text-[13.5px] font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <span>{motionPaused ? "Play" : "Pause"}</span>
              </button>
            </div>
            <p className="sr-only">
              Screenshot gallery of the Daily Spark app, showing Today, the optional planner, habits, schedules,
              progress, calendar, settings, backups, device transfer and Android widgets.
            </p>
          </div>

          <div
            role="region"
            aria-label="Screenshot gallery, scrollable"
            tabIndex={0}
            className="rail-mask scrollbar-none w-full max-w-full overflow-x-auto overflow-y-hidden py-2.5 sm:overflow-hidden max-sm:px-6 max-sm:[scroll-padding-inline:1.5rem] max-sm:[scroll-snap-type:x_mandatory] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            <div
              className="parade flex w-max gap-7 motion-reduce:animate-none max-sm:gap-4 max-sm:pr-6"
              data-paused={motionPaused ? "true" : undefined}
            >
              {[...SHOTS, ...SHOTS].map(([label, screen], i) => (
                <figure
                  key={i}
                  className="group w-[208px] flex-none max-sm:snap-start"
                  aria-hidden={i >= SHOTS.length || undefined}
                >
                  <MiniPhone>{screen}</MiniPhone>
                  <figcaption className="mt-4 text-center text-[16px] sm:text-[17px] font-bold text-foreground/90 transition-colors group-hover:text-ember">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <section
            aria-labelledby="desktop-preview-title"
            className="reveal mx-auto max-w-[1100px] px-4 pb-10 sm:px-6"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 id="desktop-preview-title" className="font-display text-2xl font-bold sm:text-3xl">
                  Desktop workspace
                </h3>
                <p className="mt-2 max-w-[66ch] text-sm text-muted-foreground sm:text-base">
                  The Web App and Windows/Linux desktop packages use a full desktop workspace with navigation and side panels—not a stretched phone layout. Desktop packages are {SITE.desktop.version}; macOS is not yet available.
                </p>
              </div>
              <Link
                to="/app"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ember/30 bg-ember/10 px-4 text-sm font-semibold text-ember transition-colors hover:bg-ember/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                Open Web App
              </Link>
            </div>
            <div
              role="region"
              aria-label="Desktop workspace preview, horizontally scrollable"
              tabIndex={0}
              className="overflow-x-auto rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <div className="min-w-[760px] lg:min-w-0">
                <DesktopPreview />
              </div>
            </div>
          </section>
        </section>

        {/* Data */}
        <section className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_500px]">
          <div className="glass-surface grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[28px] p-4 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 items-center">
            <div className="min-w-0 text-left">
              <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold leading-tight">
                Your data stays local by default
              </h2>
              <p className="mt-3 max-w-[54ch] text-base sm:text-[17px] text-muted-foreground">
                Daily Spark has no account, ads, or analytics. Your habits are not sent to Daily Spark servers.
              </p>
              <p className="mt-3.5 max-w-[54ch] text-base sm:text-[17px] text-muted-foreground">
                Export an encrypted vault when you choose, then save or transfer it yourself. Daily Spark does not run automatic background syncing.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3.5 w-full">
              <RowLink icon={<Lock className="size-4" />} title="No account" sub="Install and start immediately" />
              <RowLink icon={<ShieldCheck className="size-4" />} title="Offline first" sub="Core habit tracking works offline" />
              <RowLink icon={<ShieldCheck className="size-4" />} title="Privacy by design" sub="No ads or analytics" />
            </div>
          </div>
        </section>

        {/* What it doesn't do */}
        <section className="reveal mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-6 px-4 sm:px-6 py-[56px] sm:py-[72px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 overflow-hidden items-center [content-visibility:auto] [contain-intrinsic-size:auto_500px]">
          <div className="min-w-0 text-left">
            <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">What it doesn't do</h2>
            <p className="mt-3 max-w-[54ch] text-base sm:text-[17px] text-muted-foreground">
              Left out on purpose, to keep it simple and calm. Focus on consistency - not addiction or comparison.
            </p>
          </div>
          <div className="min-w-0 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {NOT_DOING.map((t) => (
                <div
                  key={t}
                  className="glass-pill flex items-center gap-3 rounded-xl border border-white/10 bg-surface/65 px-4.5 py-3 text-sm sm:text-base md:text-[15.5px] font-bold text-foreground/90 transition-all hover:border-ember/30 hover:bg-surface-2"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-ember/15 text-ember text-xs font-black shrink-0" aria-hidden="true">
                    ✕
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_500px]">
          <div className="glass-surface grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[28px] p-4 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 items-center">
            <div className="min-w-0 text-left">
              <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">Why it exists</h2>
              <p className="mt-3 max-w-[54ch] text-[15px] sm:text-base text-muted-foreground">
                Most habit apps want your attention: badges, pressure, guilt when you miss a day. Daily Spark is built
                to be quiet, stable and honest - not addictive.
              </p>
              <p className="mt-3.5 max-w-[54ch] text-[15px] sm:text-base text-muted-foreground">
                It's open source under MIT. If something is missing, open an issue or contribute on GitLab or GitHub.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3.5 w-full">
              <RowLink icon={<PixelGitlab className="text-[#FC6D26]" />} title="GitLab Project" sub="gitlab.com/sahaya-savari/daily-spark" href={SITE.gitlab.repo} />
              <RowLink icon={<PixelGithub />} title="GitHub Repository" sub="github.com/sahaya-savari/daily-spark" href={SITE.repo} />
              <RowLink icon={<Bug className="size-4" />} title="Report an issue" sub="GitLab &amp; GitHub Issues" href={SITE.issues} />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-title"
          className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
        >
          <h2 id="faq-title" className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-surface/60 px-5 sm:px-7">
            {SITE_FAQS.map(({ question, answer }) => (
              <details key={question} className="group py-4">
                <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-foreground marker:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember">
                  {question}
                </summary>
                <p className="max-w-[72ch] pb-2 leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Get it */}
        <section id="get" className="reveal anchor-section px-4 sm:px-6 pb-safe-section pt-[56px] sm:pt-[72px] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
          <div className="glass-panel glass-sheen relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 text-center w-full">
            <div
              className="aurora-field pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full max-w-96 -translate-x-1/2 rounded-full overflow-hidden"
              aria-hidden="true"
            />
            <h2 className="mb-3 sm:mb-4 font-display text-[34px] sm:text-[42px] md:text-[50px] font-bold text-foreground">Get Daily Spark</h2>
            <p className="mx-auto max-w-[52ch] text-base sm:text-lg text-muted-foreground">
              One calm habit tracker for your phone, browser, Windows, or Linux computer.
            </p>
            <div className="mx-auto mb-7 mt-8 max-w-5xl text-left"><PlatformDownloadGrid compact /></div>

            <div className="mx-auto grid max-w-sm gap-3 sm:grid-cols-2 [&>a]:min-h-11 [&>a]:justify-center">
              <a
                href={SITE.gitlab.releases}
                target="_blank"
                rel="noreferrer"
                className="glass-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground/90 transition-all hover:scale-[1.02] hover:border-[#FC6D26]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <PixelGitlab className="size-4 text-[#FC6D26]" />
                <span>GitLab Releases</span>
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className="glass-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all hover:scale-[1.02] hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <PixelGithub className="size-4" />
                <span>GitHub Releases</span>
              </a>
            </div>
            <p className="mt-5 text-xs sm:text-sm text-faint">
              Android APK · version{" "}
              <code className="rounded-md border border-white/10 bg-surface-2/80 px-2 py-0.5 text-[12px] sm:text-[13px] text-muted-foreground">
                {SITE.apk.version}
              </code>{" "}
              · {SITE.apk.size} · Offline-first, with optional encrypted exports.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function RowLink({ icon, title, sub, href }: { icon: React.ReactNode; title: string; sub: string; href?: string }) {
  const inner = (
    <>
      <span className="grid size-11 flex-none place-items-center rounded-xl border border-white/10 bg-surface/80 text-ember shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-ember/40 group-hover:bg-surface [&_svg]:size-5">
        {icon}
      </span>
      <span className="text-left flex-1 min-w-0">
        <b className="block font-display text-[16px] sm:text-[17px] font-semibold uppercase leading-tight tracking-[0.04em] text-foreground truncate">{title}</b>
        <small className="block text-[13.5px] sm:text-[14.5px] text-faint transition-colors group-hover:text-ember">{sub}</small>
      </span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="glass-inset group flex w-full items-center gap-3 sm:gap-3.5 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all hover:scale-[1.01] hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember">
      {inner}
    </a>
  ) : (
    <div className="glass-inset group flex w-full items-center gap-3 sm:gap-3.5 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5">{inner}</div>
  );
}
