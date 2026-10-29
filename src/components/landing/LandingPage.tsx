import { useEffect, useState } from "react";
import { useLocation, useRouter } from "@tanstack/react-router";
import {
  PixelAndroid,
  PixelBug,
  PixelCalendar,
  PixelChart,
  PixelCheckCircle,
  PixelClock,
  PixelDownload,
  PixelFire,
  PixelGithub,
  PixelLock,
  PixelShieldCheck,
  PixelSparkles,
  PixelStar,
} from "@/components/ui/pixel-icon";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SparkMark } from "@/components/brand/Logo";
import { HeatmapBackdrop } from "@/components/landing/HeatmapBackdrop";
import { EmberHeroDither } from "@/components/landing/EmberHeroDither";
import { SiteDitherBackground } from "@/components/landing/SiteDitherBackground";
import { DiaTextReveal } from "@/components/magicui/dia-text-reveal";
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
import { SITE } from "@/lib/site";

const FEATURES = [
  {
    icon: PixelCheckCircle,
    title: "Check in & Multi-Lap",
    body: "Standard, quantitative targets (ml, pages, reps) with quick chips, or avoid clean streaks.",
  },
  {
    icon: PixelFire,
    title: "Half-Life Strength HUD",
    body: "90-day window with 12-day exponential half-life decay gauge. Miss a day without losing everything.",
  },
  {
    icon: PixelChart,
    title: "Circadian & Stacking",
    body: "24-hour Gaussian performance curve and conditional habit-stacking probability insights.",
  },
  {
    icon: PixelClock,
    title: "Procedural Focus Timer",
    body: "Synthesized Web Audio ambient rain, brown noise, and finish chime with zero cloud assets.",
  },
  {
    icon: PixelSparkles,
    title: "3D Voxel Island",
    body: "A calm isometric voxel sanctuary that organically blossoms with your consistency.",
  },
  {
    icon: PixelShieldCheck,
    title: "Zero-Cloud Encrypted Vault",
    body: "AES-GCM-256 encrypted vault with Set-Union conflict-free sync across devices.",
  },
  {
    icon: PixelCalendar,
    title: "Calendar & Heatmap",
    body: "Glanceable monthly matrix and 6-month activity heatmap. Honest, verified metrics.",
  },
  {
    icon: PixelAndroid,
    title: "Android Widgets & Health",
    body: "Home-screen glanceable widgets (4x2, 1x1, heatmap) and Health Connect bridge.",
  },
] as const;

const SHOTS = [
  ["Today", <HomeScreen key="h" habits={DEMO_HABITS} />],
  ["Habits", <HabitScreen key="d" />],
  ["Progress", <ProgressScreen key="p" initialSubTab="overview" />],
  ["Calendar", <ProgressScreen key="c" initialSubTab="calendar" />],
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
      {/* Overall atmospheric dithercn background */}
      <SiteDitherBackground />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main" tabIndex={-1} className="w-full max-w-full outline-none">
        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] items-center gap-10 sm:gap-11 px-4 sm:px-6 pb-8 pt-6 sm:pt-12 md:grid-cols-2 md:gap-14 md:pb-[72px] md:pt-[88px] overflow-hidden">
          {/* dithercn Ember Hero Aura Shader */}
          <EmberHeroDither />

          {/* Matrix heatmap tile backdrop inspired by habit activity grid */}
          <HeatmapBackdrop />

          <div className="order-1 md:order-1 flex min-w-0 flex-col items-start text-left w-full max-w-full">
            {/* Unified hero badge with optical alignment */}
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="glass-pill mb-6 sm:mb-8 inline-flex items-center gap-2.5 sm:gap-3 rounded-full py-2 sm:py-2.5 pl-2.5 sm:pl-3 pr-4 sm:pr-5 text-sm sm:text-[15.5px] text-muted-foreground shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:text-foreground max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <SparkMark className="size-5 sm:size-6 shrink-0" />
              <span className="font-display text-[16px] sm:text-[18px] font-bold tracking-[0.02em] text-foreground leading-none pt-0.5">
                Open Source Android App
              </span>
              <span className="rounded-full bg-ember/20 border border-ember/30 px-3 py-1 text-xs sm:text-[13px] font-bold text-ember leading-none">
                100% Offline
              </span>
            </a>

            <h1 className="font-display text-[clamp(34px,8vw,44px)] sm:text-[58px] lg:text-[76px] font-bold leading-[1.14] text-left max-w-full">
              <span className="block pb-0.5">
                <DiaTextReveal text="Show up." delay={0.08} textColor="#FAF7F5" />
              </span>
              <span className="block pb-0.5">
                <DiaTextReveal text="Tick it." delay={0.28} textColor="#FAF7F5" />
              </span>
              <span className="block pb-0.5 text-ember">
                <DiaTextReveal
                  text="Keep going."
                  delay={0.48}
                  textColor="#ec894c"
                  colors={[
                    "#ec894c",
                    "#f0995c",
                    "#ec894c",
                    "#bf7245",
                    "#ec894c",
                  ]}
                />
              </span>
            </h1>
            <p className="mb-7 sm:mb-9 mt-5 sm:mt-7 max-w-[38ch] text-[17px] sm:text-[21px] lg:text-[23px] leading-relaxed text-muted-foreground text-left">
              A free, offline habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow - no account, no pressure.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-start gap-3 sm:gap-3.5 w-full sm:w-auto">
              <a
                href={SITE.apk.url}
                download={SITE.apk.filename}
                className={`${btn} cta-solid border-transparent px-5 sm:px-6 py-3.5 text-sm sm:text-base md:text-[17px] font-bold transition-all hover:scale-[1.03] justify-center text-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-background leading-none`}
              >
                <span className="pt-0.5">Download Daily Spark APK</span>
                <PixelDownload className="size-4 sm:size-5 shrink-0" />
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className={`glass-pill ${btn} border-white/10 px-5 sm:px-6 py-3.5 text-sm sm:text-base md:text-[17px] font-semibold text-foreground transition-all hover:scale-[1.02] justify-center text-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember leading-none`}
              >
                <span className="pt-0.5">GitHub Releases</span>
              </a>
            </div>
            <p className="mt-5 sm:mt-6 text-sm sm:text-[16.5px] text-faint text-left font-medium">Android APK · 100% Offline · No account · No ads</p>
          </div>

          {/* LOCK A: Interactive Demo Phone */}
          <div className="order-2 mt-6 sm:mt-0 flex min-w-0 justify-center md:order-2 w-full max-w-full">
            <DemoPhone />
          </div>
        </section>

        {/* What it does */}
        <section id="features" className="reveal anchor-section mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden">
          <div className="mb-8 text-left">
            <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">What it does</h2>
            <p className="mt-2 text-base sm:text-lg text-muted-foreground">Honest, reliable tools designed to build lasting daily momentum.</p>
          </div>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="glass-card group flex flex-col justify-between rounded-2xl p-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-ember/20 bg-gradient-to-br from-ember/15 to-transparent text-ember shadow-sm shadow-ember/10 transition-transform duration-300 group-hover:scale-110 group-hover:border-ember/40">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mb-2 font-display text-[19px] sm:text-[20px] font-bold tracking-tight text-foreground">{title}</h3>
                  <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LOCK B: Screens Carousel Parade */}
        <section id="screens" className="relative anchor-section py-[56px] sm:py-[72px] overflow-hidden [contain:paint]">
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
        <section className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden">
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
              <RowLink icon={<PixelLock />} title="No account" sub="Install and start immediately" />
              <RowLink icon={<PixelShieldCheck />} title="Offline first" sub="Tracking needs zero internet" />
              <RowLink icon={<PixelShieldCheck />} title="Privacy by design" sub="No ads or hidden telemetry" />
            </div>
          </div>
        </section>

        {/* What it doesn't do */}
        <section className="reveal mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-6 px-4 sm:px-6 py-[56px] sm:py-[72px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 overflow-hidden items-center">
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
                  className="glass-pill flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm sm:text-base md:text-[16.5px] font-bold text-foreground/90 transition-all hover:bg-surface-2"
                >
                  <span className="size-2 rounded-full bg-ember shadow-xs shadow-ember/50 shrink-0" aria-hidden="true" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden">
          <div className="glass-surface grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[28px] p-4 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-14 items-center">
            <div className="min-w-0 text-left">
              <h2 className="font-display text-[32px] sm:text-[38px] md:text-[46px] font-bold">Why it exists</h2>
              <p className="mt-3 max-w-[54ch] text-[15px] sm:text-base text-muted-foreground">
                Most habit apps want your attention: badges, pressure, guilt when you miss a day. Daily Spark is built
                to be quiet, stable and honest - not addictive.
              </p>
              <p className="mt-3.5 max-w-[54ch] text-[15px] sm:text-base text-muted-foreground">
                It's open source under MIT. If something is missing, open an issue or send a pull request on GitHub.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3.5 w-full">
              <RowLink icon={<PixelGithub />} title={SITE.author} sub={`github.com/${SITE.author}`} href={SITE.authorUrl} />
              <RowLink icon={<PixelStar />} title="Give it a star" sub="Star on GitHub" href={SITE.repo} />
              <RowLink icon={<PixelBug />} title="Report an issue" sub="GitHub issues" href={SITE.issues} />
            </div>
          </div>
        </section>

        {/* Get it */}
        <section id="get" className="reveal anchor-section px-4 sm:px-6 pb-safe-section pt-[56px] sm:pt-[72px] overflow-hidden">
          <div className="glass-panel glass-sheen relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 text-center w-full">
            <div
              className="aurora-field pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full max-w-96 -translate-x-1/2 rounded-full overflow-hidden"
              aria-hidden="true"
            />
            <h2 className="mb-3 sm:mb-4 font-display text-[34px] sm:text-[42px] md:text-[50px] font-bold text-foreground">Get Daily Spark</h2>
            <p className="mx-auto max-w-[52ch] text-base sm:text-lg text-muted-foreground">
              Free, calm habit tracking directly on your Android phone.
            </p>
            <div className="mb-6 mt-7 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <a
                href={SITE.apk.url}
                download={SITE.apk.filename}
                className="inline-flex h-[56px] sm:h-[60px] items-center justify-center gap-3 rounded-full cta-solid px-8 sm:px-9 text-base sm:text-lg font-bold text-left transition-all hover:scale-[1.02] [&_svg]:size-5 sm:[&_svg]:size-6 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <PixelDownload />
                <span className="leading-none">
                  <span className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-cta-foreground/90">
                    Download APK
                  </span>
                  <span className="mt-0.5 block font-display text-[17px] sm:text-[19px] font-bold tracking-wide">
                    Direct Install
                  </span>
                </span>
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className="glass-pill inline-flex h-[52px] sm:h-[54px] items-center justify-center gap-3 rounded-full px-6 sm:px-7 text-left transition-all hover:scale-[1.02] [&_svg]:size-5 sm:[&_svg]:size-6 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <PixelGithub />
                <span className="leading-none">
                  <span className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                    View on
                  </span>
                  <span className="mt-0.5 block font-display text-[17px] sm:text-[19px] font-semibold tracking-wide">
                    GitHub Releases
                  </span>
                </span>
              </a>
            </div>
            <p className="text-xs sm:text-sm text-faint">
              Android only · APK{" "}
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
