import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Smartphone,
  Monitor,
  Globe2,
  ArrowRight,
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
import { DesktopWorkspacePreview } from "@/components/landing/DesktopWorkspacePreview";
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
} from "@/components/landing/DemoPhone";
import { useReveal } from "@/hooks/use-reveal";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { SITE } from "@/lib/site";
import { PlatformDownloadGrid } from "@/components/landing/PlatformDownloadGrid";
import { cn } from "@/lib/utils";


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
  ["Habits", <HabitScreen key="d" />],
  ["New habit", <NewHabitScreen key="n" />],
  ["Progress", <ProgressScreen key="p" initialSubTab="overview" />],
  ["Calendar", <CalendarScreen key="c" />],
  ["Settings", <SettingsScreen key="s" />],
] as const;

const NOT_DOING = [
  "No AI coaching",
  "No gamification",
  "No social feeds",
  "No leaderboards",
  "No pushy streaks",
  "No forced reminders",
  "No data syncing",
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
  const [previewMode, setPreviewMode] = useState<"dual" | "desktop" | "mobile">("dual");
  const accent = useThemeAccent();

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
      <SiteHeader />

      <main id="main" tabIndex={-1} className="w-full max-w-full outline-none">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-[1100px] px-4 sm:px-6 pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden">
          {/* dithercn Ember Hero Aura Shader */}
          <EmberHeroDither />

          {/* Matrix heatmap tile backdrop inspired by habit activity grid */}
          <HeatmapBackdrop />

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Hero badge with optical alignment and cross-platform version tag */}
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#14161D] py-1.5 pl-2.5 pr-4 text-xs sm:text-[13px] text-[#A0A6B4] transition-all hover:border-ember/40 hover:text-white shadow-sm"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-ember/15 text-ember">
                <Download className="size-3.5" />
              </span>
              <b className="font-mono font-bold text-white">v1.0.1</b>
              <span className="text-[#555A68]">·</span>
              <span className="font-medium text-[#A0A6B4]">100% Offline APK &amp; Web App</span>
            </a>

            <h1 className="font-display text-[clamp(44px,7.5vw,76px)] font-black uppercase tracking-tight leading-[1.02] text-center max-w-full">
              <span className="block text-white animate-rise-1">Show up.</span>
              <span className="block text-ember drop-shadow-[0_4px_28px_var(--ember-glow)] animate-rise-2">
                Tick it.
              </span>
              <span className="block text-[#8A92A3] font-bold animate-rise-3">
                Keep going.
              </span>
            </h1>

            <p className="mb-6 mt-5 max-w-[48ch] text-[17px] sm:text-[20px] leading-relaxed text-[#A0A6B4]">
              A free, offline-first habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow — zero accounts, zero analytics, zero pressure.
            </p>

            {/* Quick trust & feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-7 text-xs sm:text-[13px] font-semibold text-faint">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111318]/90 px-3.5 py-1 text-foreground/90">
                <ShieldCheck className="size-3.5 text-ember" /> 100% Offline
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111318]/90 px-3.5 py-1 text-foreground/90">
                <Smartphone className="size-3.5 text-ember" /> 4.2 MB Universal APK
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111318]/90 px-3.5 py-1 text-foreground/90">
                <Lock className="size-3.5 text-ember" /> Zero Tracking
              </span>
            </div>

            {/* Action Tier 1: Hero CTAs (Image 1 Upgrade) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <DownloadApkButton
                className="btn-ember-glow inline-flex min-h-[50px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold uppercase tracking-wider text-[#090A0D] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <Download className="size-4 stroke-[2.5]" />
                  <span>Download Daily Spark APK</span>
                  <span className="font-mono text-xs font-semibold opacity-90">({SITE.apk.size})</span>
                </span>
              </DownloadApkButton>

              <Link
                to="/app"
                className="inline-flex min-h-[50px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#171A21] px-6 py-3.5 text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-[#1E222B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember active:scale-95 shadow-sm"
              >
                <Globe2 className="size-4 text-ember" />
                <span>Open Web App</span>
              </Link>

              <a
                href={SITE.repo}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-5 py-3.5 text-base font-semibold text-[#A0A6B4] transition-all hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <PixelGithub className="size-4" />
                <span>GitHub</span>
              </a>
            </div>

            {/* Action Tier 2: Open Source Release Mirrors */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 w-full">
              <a
                href={SITE.desktop.windowsZip}
                download="Daily-Spark-v1.0.1-windows.zip"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111318]/70 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-[#A0A6B4] hover:text-white hover:border-white/20 transition-colors"
              >
                <Monitor className="size-3.5 text-blue-400" />
                <span>Windows (.zip)</span>
              </a>
              <a
                href={SITE.desktop.linuxTarGz}
                download="Daily-Spark-v1.0.1-linux.tar.gz"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111318]/70 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-[#A0A6B4] hover:text-white hover:border-white/20 transition-colors"
              >
                <Monitor className="size-3.5 text-orange-400" />
                <span>Linux (.tar.gz)</span>
              </a>
              <a
                href={SITE.fdroid.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#111318]/70 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-foreground/90 transition-all hover:border-[#1976D2]/60"
                aria-label="View Daily Spark on F-Droid"
              >
                <PixelFdroid className="size-3.5 shrink-0 text-[#1976D2]" />
                <span>F-Droid</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-[#1976D2]/20 text-[#64B5F6] border border-[#1976D2]/30">
                  Pending
                </span>
              </a>
              <a
                href={SITE.gitlab.releases}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#111318]/70 px-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-foreground/90 transition-all hover:border-[#FC6D26]/50"
                aria-label="View Daily Spark releases on GitLab"
              >
                <PixelGitlab className="size-3.5 shrink-0 text-[#FC6D26]" />
                <span>GitLab Releases</span>
              </a>
            </div>

            <p className="mt-4 text-xs sm:text-[14px] text-[#737B8C] font-medium">
              Android 7.0+ Universal APK · PWA Installable · Windows &amp; Linux Portable · No account
            </p>
          </div>

          {/* LOCK A & Image 5: Interactive Device Showcase & Segmented Switcher */}
          <div className="mt-12 sm:mt-16 w-full flex flex-col items-center">
            {/* Segmented Switcher Pills (Image 5) */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#262A34] bg-[#111318] p-1.5 shadow-lg mb-8">
              <button
                type="button"
                onClick={() => setPreviewMode("dual")}
                aria-pressed={previewMode === "dual"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-[13.5px] font-semibold transition-all",
                  previewMode === "dual"
                    ? "bg-[#1E222B] text-white border border-ember/40 shadow-sm"
                    : "text-[#8A92A3] hover:text-white"
                )}
              >
                <Monitor className="size-4 text-ember" />
                <span>PC &amp; Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                aria-pressed={previewMode === "desktop"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-[13.5px] font-semibold transition-all",
                  previewMode === "desktop"
                    ? "bg-[#1E222B] text-white border border-ember/40 shadow-sm"
                    : "text-[#8A92A3] hover:text-white"
                )}
              >
                <Monitor className="size-4 text-ember" />
                <span>PC Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                aria-pressed={previewMode === "mobile"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-[13.5px] font-semibold transition-all",
                  previewMode === "mobile"
                    ? "bg-[#1E222B] text-white border border-ember/40 shadow-sm"
                    : "text-[#8A92A3] hover:text-white"
                )}
              >
                <Smartphone className="size-4 text-ember" />
                <span>Mobile Preview</span>
              </button>
            </div>

            {/* Active Preview Showcase */}
            <div className="relative w-full max-w-[1100px] flex justify-center items-center">
              {previewMode === "dual" && (
                <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-8">
                  <div className="w-full lg:w-[68%] shrink-0">
                    <DesktopWorkspacePreview />
                  </div>
                  <div className="w-full lg:w-[32%] flex justify-center lg:-ml-12 lg:mt-6 z-20">
                    <DemoPhone />
                  </div>
                </div>
              )}
              {previewMode === "desktop" && (
                <div className="w-full flex justify-center">
                  <DesktopWorkspacePreview />
                </div>
              )}
              {previewMode === "mobile" && (
                <div className="w-full flex justify-center py-4">
                  <DemoPhone />
                </div>
              )}
            </div>
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
        <section id="screens" className="relative anchor-section py-[56px] sm:py-[72px] overflow-hidden [contain:paint] [content-visibility:auto] [contain-intrinsic-size:auto_700px]">
          <div
            className="aurora-field pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden"
            aria-hidden="true"
          />
          <div className="reveal mx-auto max-w-[1100px] px-4 sm:px-6">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 text-left">
              <div className="min-w-0 flex-1">
                <h2 className="mb-3 font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">Screens</h2>
                <p className="max-w-[52ch] text-base sm:text-lg text-muted-foreground">
                  The real layouts with sample habits. On a phone it is a rail you swipe yourself; on wider screens it
                  scrolls on its own and you can stop it.
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
              Screenshot gallery of the Daily Spark app, showing the Today, New habit, Habit, Progress, Calendar and
              Settings screens.
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
        </section>

        {/* Data */}
        <section className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_500px]">
          <div className="glass-surface grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[28px] p-4 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 items-center">
            <div className="min-w-0 text-left">
              <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold leading-tight">
                Your data stays on your device
              </h2>
              <p className="mt-3 max-w-[54ch] text-base sm:text-[17px] text-muted-foreground">
                Daily Spark has no account and no server, so there's nowhere for your habits to go. No analytics, no ads.
              </p>
              <p className="mt-3.5 max-w-[54ch] text-base sm:text-[17px] text-muted-foreground">
                Everything is saved locally on your phone with the APK. Export a backup now and then, and
                restore it on any device.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3.5 w-full">
              <RowLink icon={<Lock className="size-4" />} title="No account" sub="Install and start immediately" />
              <RowLink icon={<ShieldCheck className="size-4" />} title="Offline first" sub="Tracking needs zero internet" />
              <RowLink icon={<ShieldCheck className="size-4" />} title="Privacy by design" sub="No ads or hidden telemetry" />
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
              <RowLink icon={<Bug className="size-4" />} title="Report an issue" sub="GitLab &amp; GitHub Issues" href={SITE.gitlab.issues} />
            </div>
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

            <div className="flex flex-wrap items-center justify-center gap-3">
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
            <p className="text-xs sm:text-sm text-faint">
              Android, Web, Windows and Linux · version{" "}
              <code className="rounded-md border border-white/10 bg-surface-2/80 px-2 py-0.5 text-[12px] sm:text-[13px] text-muted-foreground">
                {SITE.apk.version}
              </code>{" "}
              · {SITE.apk.size} · 100% offline and privacy-first.
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
