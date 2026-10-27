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
  "inline-flex items-center justify-center gap-[9px] whitespace-nowrap rounded-full border px-6 py-[13px] font-display text-sm font-bold tracking-normal transition-all duration-200";

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
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1100px] items-center gap-11 px-6 pb-8 pt-12 md:grid-cols-2 md:gap-14 md:pb-[72px] md:pt-[88px]">
          {/* Ambient light glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[450px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-ember/5 blur-[120px]"
            aria-hidden="true"
          />

          <div className="order-2 md:order-1">
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-surface/70 py-[7px] pl-[7px] pr-4 text-sm text-muted-foreground backdrop-blur-md transition-all hover:border-ember/40 hover:text-foreground"
            >
              <span className="grid size-[30px] place-items-center rounded-lg bg-ember-soft text-ember">
                <Download className="size-[17px]" />
              </span>
              <b className="font-display text-lg font-semibold tracking-[0.02em] text-foreground">{SITE.apk.version}</b>
              on GitHub - Free &amp; Open Source
            </a>
            <h1 className="font-display text-[38px] font-bold sm:text-[48px] lg:text-[60px]">
              {["Show up.", "Tick it.", "Keep going."].map((t, i) => (
                <span key={t} className="block overflow-hidden">
                  <i
                    className={`rise block not-italic ${i === 2 ? "text-ember" : ""}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {t}
                  </i>
                </span>
              ))}
            </h1>
            <p className="mb-8 mt-[26px] max-w-[36ch] text-lg text-muted-foreground">
              A free, offline habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow - no account, no pressure.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={SITE.apk.url}
                className={`${btn} border-transparent bg-primary text-primary-foreground shadow-lg shadow-ember/20 hover:scale-[1.02] hover:bg-primary/90`}
              >
                Download APK <Download className="size-[18px]" />
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className={`${btn} border-border-hi bg-surface/80 hover:border-muted-foreground hover:bg-surface-2`}
              >
                GitHub Releases
              </a>
            </div>
            <p className="mt-[22px] text-sm text-faint">Android APK · 100% Offline · No account · No ads</p>
          </div>

          {/* LOCK A: Interactive Demo Phone */}
          <div className="order-1 flex justify-center md:order-2">
            <DemoPhone />
          </div>
        </section>

        {/* What it does */}
        <section id="features" className="reveal mx-auto max-w-[1100px] scroll-mt-20 px-6 py-[72px]">
          <div className="mb-8">
            <h2 className="font-display text-[30px] font-bold md:text-[42px]">What it does</h2>
            <p className="mt-2 text-base text-muted-foreground">Honest, reliable tools designed to build lasting daily momentum.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="glass-card group flex flex-col justify-between rounded-2xl p-6 transition-all duration-200"
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-ember-soft text-ember transition-transform duration-300 group-hover:scale-110">
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
        <section id="screens" className="scroll-mt-20 py-[72px]">
          <div className="reveal mx-auto max-w-[1100px] px-6">
            <h2 className="mb-3 font-display text-[30px] font-bold md:text-[42px]">Screens</h2>
            <p className="mb-9 max-w-[52ch] text-[17px] text-muted-foreground">
              The real layouts with sample habits. Hover to pause.
            </p>
          </div>
          <div className="rail-mask overflow-hidden py-2.5 [contain:paint] motion-reduce:overflow-x-auto">
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
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] font-bold md:text-[42px]">
            Your data stays on your device
          </h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Daily Spark has no account and no server, so there's nowhere for your habits to go. No analytics, no ads.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-[17px] text-muted-foreground">
              Everything is saved locally on your phone with the APK. Export a backup now and then, and
              restore it on any device.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <RowLink icon={<UserX />} title="No account" sub="Install and start immediately" />
              <RowLink icon={<WifiOff />} title="Offline first" sub="Tracking needs zero internet" />
              <RowLink icon={<ShieldCheck />} title="Privacy by design" sub="No ads or hidden telemetry" />
            </div>
          </div>
        </section>

        {/* What it doesn't do */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] font-bold md:text-[42px]">What it doesn't do</h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Left out on purpose, to keep it simple and calm. Focus on consistency - not addiction or comparison.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
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
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-4 py-2 text-sm font-medium text-foreground/90 backdrop-blur-sm"
                >
                  <span className="size-1.5 rounded-full bg-ember" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-6 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] font-bold md:text-[42px]">Why it exists</h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Most habit apps want your attention: badges, pressure, guilt when you miss a day. Daily Spark is built
              to be quiet, stable and honest - not addictive.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-[17px] text-muted-foreground">
              It's open source under MIT. If something is missing, open an issue or send a pull request on GitHub.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <RowLink icon={<Github />} title={SITE.author} sub={`github.com/${SITE.author}`} href={SITE.authorUrl} />
              <RowLink icon={<Star />} title="Give it a star" sub="Star on GitHub" href={SITE.repo} />
              <RowLink icon={<Bug />} title="Report an issue" sub="GitHub issues" href={SITE.issues} />
            </div>
          </div>
        </section>

        {/* Get it */}
        <section id="get" className="reveal scroll-mt-20 px-6 pb-24 pt-[72px]">
          <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl border border-border/80 bg-surface/60 p-8 text-center backdrop-blur-md md:p-14">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-ember/10 blur-[80px]"
              aria-hidden="true"
            />
            <h2 className="mb-4 font-display text-[32px] font-bold text-foreground md:text-[44px]">Get Daily Spark</h2>
            <p className="mx-auto max-w-[52ch] text-[17px] text-muted-foreground">
              Free, calm habit tracking directly on your Android phone.
            </p>
            <div className="mb-6 mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={SITE.apk.url}
                className="inline-flex h-[54px] items-center gap-3 rounded-full bg-primary px-7 text-left text-primary-foreground shadow-lg shadow-ember/20 transition-all hover:scale-[1.02] hover:bg-primary/95 [&_svg]:size-6"
              >
                <Download />
                <span className="leading-none">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">
                    Download APK
                  </span>
                  <span className="mt-0.5 block font-display text-[19px] font-semibold tracking-wide">
                    Direct Install
                  </span>
                </span>
              </a>
              <a
                href={SITE.releases}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[54px] items-center gap-3 rounded-full border border-border-hi bg-surface px-7 text-left transition-all hover:border-muted-foreground hover:bg-surface-2 [&_svg]:size-6"
              >
                <Github />
                <span className="leading-none">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    View on
                  </span>
                  <span className="mt-0.5 block font-display text-[19px] font-semibold tracking-wide">
                    GitHub Releases
                  </span>
                </span>
              </a>
            </div>
            <p className="text-sm text-faint">
              Android APK{" "}
              <code className="font-mono rounded bg-surface-2 px-2 py-0.5 text-[13px] text-muted-foreground">
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
      <span className="grid size-11 flex-none place-items-center rounded-full border border-border bg-surface text-ember transition-colors group-hover:border-ember [&_svg]:size-5 [&_svg]:stroke-[1.8]">
        {icon}
      </span>
      <span className="text-left">
        <b className="block font-display text-[15.5px] font-semibold uppercase leading-tight tracking-[0.05em]">{title}</b>
        <small className="block text-[13.5px] text-faint transition-colors group-hover:text-ember">{sub}</small>
      </span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-[13px]">
      {inner}
    </a>
  ) : (
    <div className="group inline-flex items-center gap-[13px]">{inner}</div>
  );
}
