import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SITE, siteUrl } from "@/lib/site";

const description = "Daily Spark stores habit data locally by default and has no account, ads, or analytics. Optional encrypted vault exports can be saved where you choose.";

export const Route = createFileRoute("/privacy")({
  beforeLoad: ({ location }) => {
    const rawHash = location.hash ? location.hash.replace(/^#/, "") : "";
    if (rawHash && ["get", "features", "screens"].includes(rawHash)) {
      throw redirect({
        to: "/",
        hash: rawHash,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Privacy - Daily Spark" },
      { name: "description", content: description },
      { property: "og:title", content: "Privacy - Daily Spark" },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl("/privacy") },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy - Daily Spark" },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: siteUrl("/privacy") }],
  }),
  component: Privacy,
});

const SECTIONS = [
  ["What we collect", "Daily Spark has no account system, advertising, or analytics. Habit data is not sent to Daily Spark servers. Your hosting provider may process ordinary connection logs when you visit the website."],
  ["Where your data lives", "Habits and notes are stored locally in the app or browser by default. If you choose to export an encrypted vault, encryption happens on your device with your passphrase. You choose where to save or transfer that file; the storage provider's own privacy terms apply."],
  ["Backup & Restore", "Export an encrypted vault and save it somewhere you control, including a cloud storage folder if you choose. Import it on another device to merge your data. This is a user-started transfer, not automatic background syncing. Keep a current backup before clearing browser data or changing devices."],
  ["Reminders", "Reminders are optional. If you turn them on in the Android app, your phone asks for notification permission. Notifications are created on your device."],
  ["Links", "The website links to GitHub for source code and APK downloads. GitHub's own privacy policy applies there."],
  ["Questions", "Open an issue on GitHub and we'll answer in public."],
] as const;

function Privacy() {
  const router = useRouter();

  useEffect(() => {
    const rawHash = window.location.hash.replace(/^#/, "");
    if (rawHash && ["get", "features", "screens"].includes(rawHash)) {
      router.navigate({ to: "/", hash: rawHash });
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background w-full max-w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader sticky={false} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20 w-full outline-none">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">Privacy</h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">Short version: your data stays local by default; encrypted exports are optional and user-started.</p>
        <div
          data-testid="privacy-card"
          role="region"
          aria-label="Privacy Information"
          className="mt-8 rounded-3xl border border-white/10 bg-surface p-6 sm:p-8 space-y-3"
        >
          <h2 className="font-display text-2xl font-bold text-foreground">Local by default</h2>
          <p className="text-base font-semibold text-ember">
            No Daily Spark account, no ads, no analytics. Your habits stay local unless you choose to export them.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Daily Spark does not run a habit-data sync server. Optional encrypted vault exports can be saved to a destination you choose.
          </p>
        </div>
        <div className="mt-12">
          {SECTIONS.map(([t, b]) => (
            <section key={t} id={t === "Backup & Restore" ? "backups" : undefined} className="scroll-mt-24 border-t border-border py-7">
              <h2 className="font-display text-xl font-semibold tracking-wide">{t}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{b}</p>
            </section>
          ))}
        </div>
        <a href={SITE.issues} target="_blank" rel="noreferrer" className="mt-8 inline-block text-base font-semibold text-ember hover:underline">
          Ask a question on GitHub →
        </a>
      </main>
      <SiteFooter />
    </div>
  );
}
