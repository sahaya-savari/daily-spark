import { useEffect } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Download,
  Github,
  UserX,
  WifiOff,
  Bug,
  Star,
  CheckCircle2,
  Flame,
  Calendar,
  LineChart,
  Bell,
  HardDrive,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SparkMark } from "@/components/brand/Logo";
import { HeatmapBackdrop } from "@/components/landing/HeatmapBackdrop";
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
    icon: CheckCircle2,
    title: "Check in",
    body: "One tap per habit, once a day. No over-counting. Made a mistake? Undo today's tick.",
  },
  {
    icon: Flame,
    title: "Streaks",
    body: "Yesterday's check-in keeps today open. Miss a day and you start again - your best run stays.",
  },
  {
    icon: Calendar,
    title: "Calendar",
    body: "Every day shows done out of total, from an empty square to a full apricot one. No fake badges.",
  },
  {
    icon: LineChart,
    title: "Progress",
    body: "Weekly and monthly consistency, perfect days, best runs and a 6-month activity heatmap.",
  },
  {
    icon: Bell,
    title: "Reminders",
    body: "Optional, per habit, at the time you pick. Off by default. Never nagging.",
  },
  {
    icon: HardDrive,
    title: "Backup and restore",
    body: "Export everything to one file and restore it anywhere. Old Daily Spark backups work too.",
  },
  {
    icon: Sparkles,
    title: "Organise",
    body: "Line icons, color tags, notes, starred habits on top, and an archive for the ones on pause.",
  },
  {
    icon: Smartphone,
    title: "Lightweight APK",
    body: "Small 4.1 MB download, runs completely offline, no account required.",
  },
] as const;

const SHOTS = [
  ["Today", <HomeScreen key="h" habits={DEMO_HABITS} />],
  ["New habit", <NewHabitScreen key="n" />],
  ["Habit", <HabitScreen key="d" />],
  ["Progress", <ProgressScreen key="p" />],
  ["Calendar", <CalendarScreen key="c" />],
  ["Settings", <SettingsScreen key="s" />],
] as const;

const btn =
  "inline-flex items-center justify-center gap-2 sm:gap-[9px] rounded-full border px-5 sm:px-6 py-3 sm:py-[13px] font-display text-xs sm:text-sm font-bold tracking-normal transition-all duration-200 max-w-full";

interface LandingPageProps {
  targetSection?: "features" | "screens" | "get";
}

export function LandingPage({ targetSection }: LandingPageProps) {
  useReveal();
  const location = useLocation();
  const router = useRouter();

  useEffect(() => {
    // If user arrived with a legacy # hash in the URL, cleanly replace with clean route slug
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
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main" className="w-full max-w-full overflow-x-hidden">
        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1100px] items-center gap-10 sm:gap-11 px-4 sm:px-6 pb-8 pt-6 sm:pt-12 md:grid-cols-2 md:gap-14 md:pb-[72px] md:pt-[88px] overflow-hidden max-w-full">
          {/* Ambient light glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[450px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-ember/5 blur-[120px]"
            aria-hidden="true"
          />

          {/* Matrix heatmap tile backdrop inspired by habit activity grid */}
          <HeatmapBackdrop />

          <div className="order-1 md:order-1 flex flex-col items-center text-center md:items-start md:text-left w-full max-w-full">
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="glass-pill mb-6 sm:mb-8 inline-flex items-center gap-2 sm:gap-3 rounded-full py-1.5 sm:py-2 pl-2 sm:pl-2.5 pr-3.5 sm:pr-4 text-xs sm:text-[14.5px] text-muted-foreground shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:text-foreground max-w-full mx-auto md:mx-0"
            >
              <SparkMark className="size-5 sm:size-[26px] shrink-0" />
              <b className="font-display text-sm sm:text-[18px] font-bold tracking-[0.02em] text-foreground">Daily Spark</b>
              <span className="rounded-full bg-ember-soft px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-ember">{SITE.apk.version}</span>
              <span className="hidden sm:inline">· Free &amp; Open Source</span>
            </a>
            <h1 className="font-display text-[28px] xs:text-[34px] sm:text-[54px] lg:text-[72px] font-bold leading-[1.14] text-center md:text-left max-w-full">
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
                  textColor="oklch(0.755 0.135 52.1)"
                  colors={[
                    "oklch(0.755 0.135 52.1)",
                    "oklch(0.85 0.12 70)",
                    "oklch(0.978 0.004 56.4)",
                    "oklch(0.769 0.087 60.2)",
                    "oklch(0.755 0.135 52.1)",
                  ]}
                />
              </span>
            </h1>
            <p className="mb-7 sm:mb-9 mt-5 sm:mt-7 max-w-[38ch] text-[15.5px] sm:text-[20px] lg:text-[22px] leading-relaxed text-muted-foreground mx-auto md:mx-0 text-center md:text-left">
              A free, offline habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow - no account, no pressure.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-3.5 w-full sm:w-auto">
              <a
                href={SITE.apk.url}
                download={SITE.apk.filename}
                className={`${btn} border-transparent bg-gradient-to-r from-ember to-amber-500 px-5 sm:px-6 py-3.5 text-xs sm:text-sm md:text-base text-primary-foreground shadow-xl shadow-ember/25 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-ember/35 justify-center text-center w-full sm:w-auto`}
              >
                <span>Download Daily Spark APK</span> <Download className="size-4 sm:size-[19px] shrink-0" />
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className={`glass-pill ${btn} border-white/10 px-5 sm:px-6 py-3.5 text-xs sm:text-sm md:text-base text-foreground transition-all hover:scale-[1.02] justify-center text-center w-full sm:w-auto`}
              >
                GitHub Releases
              </a>
            </div>
            <p className="mt-5 sm:mt-6 text-xs sm:text-[15.5px] text-faint mx-auto md:mx-0 text-center md:text-left">Android APK · 100% Offline · No account · No ads</p>
          </div>

          {/* LOCK A: Interactive Demo Phone */}
          <div className="order-2 mt-6 sm:mt-0 flex justify-center md:order-2 w-full max-w-full overflow-hidden">
            <DemoPhone />
          </div>
        </section>

        {/* What it does */}
        <section id="features" className="reveal mx-auto max-w-[1100px] scroll-mt-20 px-4 sm:px-6 py-[56px] sm:py-[72px] overflow-hidden max-w-full">
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[42px] font-bold">What it does</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Honest, reliable tools designed to build lasting daily momentum.</p>
          </div>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="glass-card group flex flex-col justify-between rounded-2xl p-6 transition-all duration-200"
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-ember/20 bg-gradient-to-br from-ember/15 to-transparent text-ember shadow-sm shadow-ember/10 transition-transform duration-300 group-hover:scale-110 group-hover:border-ember/40">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LOCK B: Screens Carousel Parade */}
        <section id="screens" className="relative scroll-mt-20 py-[56px] sm:py-[72px] overflow-hidden max-w-full [contain:paint]">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/5 blur-[120px] overflow-hidden"
            aria-hidden="true"
          />
          <div className="reveal mx-auto max-w-[1100px] px-4 sm:px-6 text-center md:text-left">
            <h2 className="mb-3 font-display text-[28px] sm:text-[34px] md:text-[42px] font-bold">Screens</h2>
            <p className="mb-9 max-w-[52ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              The real layouts with sample habits. Hover to pause.
            </p>
          </div>
          <div className="rail-mask overflow-hidden py-2.5 w-full max-w-full [contain:paint]">
            <div className="parade flex w-max gap-7 motion-reduce:animate-none">
              {[...SHOTS, ...SHOTS].map(([label, screen], i) => (
                <figure key={i} className="group w-[208px] flex-none" aria-hidden={i >= SHOTS.length || undefined}>
                  <MiniPhone>{screen}</MiniPhone>
                  <figcaption className="mt-4 text-center text-[13px] font-medium text-faint transition-colors group-hover:text-muted-foreground">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-4 sm:px-6 py-[56px] sm:py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14 overflow-hidden max-w-full items-center">
          <div className="text-center md:text-left">
            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[42px] font-bold leading-tight">
              Your data stays on your device
            </h2>
            <p className="mt-3 max-w-[54ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              Daily Spark has no account and no server, so there's nowhere for your habits to go. No analytics, no ads.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              Everything is saved locally on your phone with the APK. Export a backup now and then, and
              restore it on any device.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 w-full">
            <RowLink icon={<UserX />} title="No account" sub="Install and start immediately" />
            <RowLink icon={<WifiOff />} title="Offline first" sub="Tracking needs zero internet" />
            <RowLink icon={<ShieldCheck />} title="Privacy by design" sub="No ads or hidden telemetry" />
          </div>
        </section>

        {/* What it doesn't do */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-4 sm:px-6 py-[56px] sm:py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14 overflow-hidden max-w-full items-center">
          <div className="text-center md:text-left">
            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[42px] font-bold">What it doesn't do</h2>
            <p className="mt-3 max-w-[54ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              Left out on purpose, to keep it simple and calm. Focus on consistency - not addiction or comparison.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2.5 w-full">
            {[
              "No AI coaching",
              "No gamification",
              "No social feeds",
              "No leaderboards",
              "No pushy streaks",
              "No forced reminders",
              "No data syncing",
            ].map((t) => (
              <span
                key={t}
                className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground/90 transition-all hover:scale-[1.02]"
              >
                <span className="size-1.5 rounded-full bg-ember shadow-sm shadow-ember/50" />
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-4 sm:px-6 py-[56px] sm:py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14 overflow-hidden max-w-full items-center">
          <div className="text-center md:text-left">
            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[42px] font-bold">Why it exists</h2>
            <p className="mt-3 max-w-[54ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              Most habit apps want your attention: badges, pressure, guilt when you miss a day. Daily Spark is built
              to be quiet, stable and honest - not addictive.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-sm sm:text-[17px] text-muted-foreground mx-auto md:mx-0">
              It's open source under MIT. If something is missing, open an issue or send a pull request on GitHub.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 w-full">
            <RowLink icon={<Github />} title={SITE.author} sub={`github.com/${SITE.author}`} href={SITE.authorUrl} />
            <RowLink icon={<Star />} title="Give it a star" sub="Star on GitHub" href={SITE.repo} />
            <RowLink icon={<Bug />} title="Report an issue" sub="GitHub issues" href={SITE.issues} />
          </div>
        </section>

        {/* Get it */}
        <section id="get" className="reveal scroll-mt-20 px-4 sm:px-6 pb-20 sm:pb-24 pt-[56px] sm:pt-[72px] overflow-hidden max-w-full">
          <div className="glass-panel relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 text-center w-full">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full max-w-96 -translate-x-1/2 rounded-full bg-ember/15 blur-[90px] overflow-hidden"
              aria-hidden="true"
            />
            <h2 className="mb-3 sm:mb-4 font-display text-[28px] sm:text-[36px] md:text-[44px] font-bold text-foreground">Get Daily Spark</h2>
            <p className="mx-auto max-w-[52ch] text-sm sm:text-[17px] text-muted-foreground">
              Free, calm habit tracking directly on your Android phone.
            </p>
            <div className="mb-6 mt-7 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <a
                href={SITE.apk.url}
                download={SITE.apk.filename}
                className="inline-flex h-[52px] sm:h-[54px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-ember to-amber-500 px-6 sm:px-7 text-left text-primary-foreground shadow-lg shadow-ember/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-ember/35 [&_svg]:size-5 sm:[&_svg]:size-6 w-full sm:w-auto"
              >
                <Download />
                <span className="leading-none">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/90">
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
                className="glass-pill inline-flex h-[52px] sm:h-[54px] items-center justify-center gap-3 rounded-full px-6 sm:px-7 text-left transition-all hover:scale-[1.02] [&_svg]:size-5 sm:[&_svg]:size-6 w-full sm:w-auto"
              >
                <Github />
                <span className="leading-none">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    View on
                  </span>
                  <span className="mt-0.5 block font-display text-[17px] sm:text-[19px] font-semibold tracking-wide">
                    GitHub Releases
                  </span>
                </span>
              </a>
            </div>
            <p className="text-xs sm:text-sm text-faint">
              Android APK{" "}
              <code className="font-mono rounded-md border border-white/10 bg-surface-2/80 px-2 py-0.5 text-[12px] sm:text-[13px] text-muted-foreground">
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
      <span className="grid size-11 flex-none place-items-center rounded-xl border border-white/10 bg-surface/80 text-ember shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-ember/40 group-hover:bg-surface [&_svg]:size-5 [&_svg]:stroke-[1.8]">
        {icon}
      </span>
      <span className="text-left flex-1 min-w-0">
        <b className="block font-display text-[15px] sm:text-[15.5px] font-semibold uppercase leading-tight tracking-[0.04em] text-foreground truncate">{title}</b>
        <small className="block text-[12.5px] sm:text-[13.5px] text-faint transition-colors group-hover:text-ember truncate">{sub}</small>
      </span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="glass-pill group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all hover:scale-[1.01] hover:border-white/20">
      {inner}
    </a>
  ) : (
    <div className="glass-pill group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5">{inner}</div>
  );
}
