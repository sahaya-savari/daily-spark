import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SITE, siteUrl } from "@/lib/site";

const description = "Daily Spark collects nothing. No account, no analytics, no ads - your habits stay on your device.";

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
  ["What we collect", "Nothing. Daily Spark has no account system, no analytics, no ads and no tracking. We never see your habits."],
  ["Where your data lives", "In both the Android app and Web App, your habits and notes are stored strictly on your device (IndexedDB / local storage). Nothing is uploaded to any remote server. If you use Google Drive backup, your encrypted data is sent directly to your own personal Google Drive AppData folder with zero intermediary servers."],
  ["Backup & Restore", "Export a backup from the app and keep the file somewhere you can find it again. To restore your habits, open the app’s import option and select that backup file. Keep a current backup before clearing browser data or changing devices."],
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
      <SiteHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20 w-full outline-none">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">Privacy</h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">Short version: your habits never leave your device.</p>
        <div
          data-testid="privacy-card"
          role="region"
          aria-label="Privacy Information"
          className="mt-8 rounded-3xl border border-white/10 bg-surface p-6 sm:p-8 space-y-3"
        >
          <h2 className="font-display text-2xl font-bold text-foreground">Zero Knowledge, Zero Servers</h2>
          <p className="text-base font-semibold text-ember">
            No accounts, No servers, No ads, No analytics, No data leaves this device
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Daily Spark is local-first software. All streaks, check-in history, notes, and metrics remain encrypted in your browser or desktop storage.
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
