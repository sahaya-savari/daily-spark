import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Github, Globe, Smartphone, UserX, WifiOff, Bug, Star } from "lucide-react";
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
import { InstallButton } from "@/components/InstallButton";
import { useReveal } from "@/hooks/use-reveal";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Spark — Calm, offline habit tracker" },
      {
        name: "description",
        content:
          "Track one small action a day. Daily Spark is a free, offline-first habit and streak tracker. No account, no ads, no tracking. Install it or download the Android APK.",
      },
      { property: "og:title", content: "Daily Spark — Show up. Tick it. Keep going." },
      {
        property: "og:description",
        content: "A free, calm, offline-first habit tracker. No account, no ads, your data stays on your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  ["Check in", "One tap per habit, once a day. No over-counting. Made a mistake? Undo today's tick."],
  ["Streaks", "Yesterday's check-in keeps today open. Miss a day and you start again — your best run stays."],
  ["Calendar", "Every day shows done out of total, from an empty square to a full apricot one. No fake badges."],
  ["Progress", "Weekly and monthly consistency, perfect days, best runs and a 6-month activity heatmap."],
  ["Reminders", "Optional, per habit, at the time you pick. Off by default. Never nagging."],
  ["Backup and restore", "Export everything to one file and restore it anywhere. Old Daily Spark backups work too."],
  ["Organise", "Line icons, color tags, notes, starred habits on top, and an archive for the ones on pause."],
  ["Install", "Add it to your home screen from the browser. Full-screen, no store, no sign-up."],
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
  "inline-flex items-center justify-center gap-[9px] whitespace-nowrap rounded-full border px-6 py-[13px] font-display text-sm font-bold tracking-normal transition-colors";

function Landing() {
  useReveal();
  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="mx-auto grid max-w-[1100px] items-center gap-11 px-6 pb-8 pt-12 md:grid-cols-2 md:gap-14 md:pb-[72px] md:pt-[88px]">
          <div className="order-2 md:order-1">
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border-0 bg-surface py-[7px] pl-[7px] pr-3.5 text-sm text-muted-foreground transition-colors hover:border-border-hi"
            >
              <span className="grid size-[30px] place-items-center rounded-lg bg-ember-soft text-ember">
                <Download className="size-[17px]" />
              </span>
              <b className="font-display text-lg font-semibold tracking-[0.02em] text-foreground">{SITE.apk.version}</b>
              on GitHub · plus the web app
            </a>
            <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[60px] font-bold">
              {["Show up.", "Tick it.", "Keep going."].map((t, i) => (
                <span key={t} className="block overflow-hidden">
                  <i className={`rise block not-italic ${i === 2 ? "text-ember" : ""}`} style={{ animationDelay: `${i * 0.08}s` }}>
                    {t}
                  </i>
                </span>
              ))}
            </h1>
            <p className="mb-8 mt-[26px] max-w-[36ch] text-lg text-muted-foreground">
              A free, offline habit tracker. One small action a day, per habit. Check it off and watch your streak
              grow — no account, no pressure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/app" className={`${btn} border-transparent bg-primary text-primary-foreground hover:bg-primary/90`}>
                Open the app <ArrowRight className="size-[18px]" />
              </Link>
              <a href="#get" className={`${btn} border-border-hi hover:border-muted-foreground`}>
                Download
              </a>
            </div>
            <p className="mt-[22px] text-sm text-faint">Any browser · Android APK · No account · No ads</p>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <DemoPhone />
          </div>
        </section>

        {/* What it does */}
        <section id="features" className="reveal mx-auto max-w-[1100px] scroll-mt-20 px-6 py-[72px]">
          <h2 className="font-display text-[30px] md:text-[42px] font-bold">What it does</h2>
          <div className="mt-[30px] grid gap-x-14 md:grid-cols-2">
            {FEATURES.map(([title, body]) => (
              <div key={title} className="border-t border-border pb-[26px] pt-[22px]">
                <h3 className="mb-2 font-display text-lg font-bold tracking-[0.04em]">{title}</h3>
                <p className="max-w-[46ch] text-[16px] text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Screens */}
        <section id="screens" className="scroll-mt-20 py-[72px]">
          <div className="reveal mx-auto max-w-[1100px] px-6">
            <h2 className="mb-3 font-display text-[30px] md:text-[42px] font-bold">Screens</h2>
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
        <section className="reveal mx-auto grid max-w-[1100px] gap-2 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] md:text-[42px] font-bold">
            Your data stays on your device
          </h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Daily Spark has no account and no server, so there's nowhere for your habits to go. No analytics, no ads.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-[17px] text-muted-foreground">
              Everything is saved in your browser — or on your phone with the APK. Export a backup now and then, and
              restore it on any device.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-[34px] gap-y-3.5">
              <RowLink icon={<UserX />} title="No account" sub="Open it and start" />
              <RowLink icon={<WifiOff />} title="Offline first" sub="Tracking needs no internet" />
            </div>
          </div>
        </section>

        {/* What it doesn't do */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-2 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] md:text-[42px] font-bold">What it doesn't do</h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Left out on purpose, to keep it simple and calm. Focus on consistency — not addiction or comparison.
            </p>
            <ul className="mt-6 grid max-w-[54ch] grid-cols-2 gap-x-8 gap-y-2.5 text-[15.5px] text-muted-foreground">
              {["No AI coaching", "No gamification", "No social sharing", "No leaderboards", "No forced reminders", "No data syncing"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="size-1.5 rounded-full bg-ember" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why */}
        <section className="reveal mx-auto grid max-w-[1100px] gap-2 px-6 py-[72px] md:grid-cols-[1fr_1.3fr] md:gap-14">
          <h2 className="font-display text-[30px] md:text-[42px] font-bold">Why it exists</h2>
          <div>
            <p className="max-w-[54ch] text-[17px] text-muted-foreground">
              Most habit apps want your attention: badges, pressure, guilt when you miss a day. Daily Spark is built
              to be quiet, stable and honest — not addictive.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-[17px] text-muted-foreground">
              It's open source under MIT. If something is missing, open an issue or send a pull request on GitHub.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-[34px] gap-y-3.5">
              <RowLink icon={<Github />} title={SITE.author} sub={`github.com/${SITE.author}`} href={SITE.authorUrl} />
              <RowLink icon={<Star />} title="Give it a star" sub="github.com/sahaya-savari/daily-spark" href={SITE.repo} />
              <RowLink icon={<Bug />} title="Report a bug" sub="GitHub issues" href={SITE.issues} />
            </div>
          </div>
        </section>

        {/* Get it */}
        <section id="get" className="reveal scroll-mt-20 px-6 pb-24 pt-[72px] text-center">
          <h2 className="mb-[18px] font-display text-[30px] md:text-[42px] font-bold">Get it</h2>
          <p className="mx-auto max-w-[52ch] text-[17px] text-muted-foreground">Free. In your browser, on your home screen, or on Android.</p>
          <div className="mb-[22px] mt-[34px] flex flex-wrap justify-center gap-3">
            <StoreBadge href="/app" internal icon={<Globe />} top="Open in" name="Browser" />
            <InstallButton className="cursor-pointer">
              <StoreBadgeInner icon={<Smartphone />} top="Install as" name="Web app" />
            </InstallButton>
            <StoreBadge href={SITE.apk.url} icon={<Download />} top="Get it on" name="GitHub" />
          </div>
          <p className="text-sm text-faint">
            GitHub download is the Android APK{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-[13px] text-muted-foreground">{SITE.apk.version}</code> ·{" "}
            {SITE.apk.size}. Moving from the old app? Export a backup there, restore it in Settings here.
          </p>
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

function StoreBadgeInner({ icon, top, name }: { icon: React.ReactNode; top: string; name: string }) {
  return (
    <span className="inline-flex h-[52px] items-center gap-2.5 rounded-full border-0 bg-surface px-4 text-left transition-colors hover:border-muted-foreground [&_svg]:size-6">
      {icon}
      <span className="leading-none">
        <span className="block text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{top}</span>
        <span className="mt-0.5 block font-display text-[19px] font-semibold tracking-[0.01em]">{name}</span>
      </span>
    </span>
  );
}

function StoreBadge({ href, internal, ...p }: { href: string; internal?: boolean; icon: React.ReactNode; top: string; name: string }) {
  return internal ? (
    <Link to="/app">
      <StoreBadgeInner {...p} />
    </Link>
  ) : (
    <a href={href}>
      <StoreBadgeInner {...p} />
    </a>
  );
}
