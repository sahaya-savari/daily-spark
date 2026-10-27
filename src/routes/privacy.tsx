import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  beforeLoad: ({ location }) => {
    const rawHash = location.hash ? location.hash.replace(/^#/, "") : "";
    if (rawHash && ["get", "features", "screens", "main"].includes(rawHash)) {
      throw redirect({
        to: "/",
        hash: rawHash,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Privacy - Daily Spark" },
      { name: "description", content: "Daily Spark collects nothing. No account, no analytics, no ads - your habits stay on your device." },
      { property: "og:title", content: "Privacy - Daily Spark" },
      { property: "og:description", content: "No account, no analytics, no ads. Your habit data stays on your device." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  ["What we collect", "Nothing. Daily Spark has no account system, no analytics, no ads and no tracking. We never see your habits."],
  ["Where your data lives", "In the web app, habits are saved in your browser's local storage on this device. In the Android app, they're saved in the app's own storage. Clearing browser data or uninstalling removes them."],
  ["Backups", "Backups are files you create and keep. They're saved wherever you choose and are never uploaded by Daily Spark."],
  ["Reminders", "Reminders are optional. If you turn them on, your browser or phone asks for notification permission. Notifications are created on your device."],
  ["Links", "The website links to GitHub for source code and APK downloads. GitHub's own privacy policy applies there."],
  ["Questions", "Open an issue on GitHub and we'll answer in public."],
] as const;

function Privacy() {
  const router = useRouter();

  useEffect(() => {
    const rawHash = window.location.hash.replace(/^#/, "");
    if (rawHash && ["get", "features", "screens", "main"].includes(rawHash)) {
      router.navigate({ to: "/", hash: rawHash });
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="font-display text-6xl font-bold">Privacy</h1>
        <p className="mt-4 text-lg text-muted-foreground">Short version: your habits never leave your device.</p>
        <div className="mt-12">
          {SECTIONS.map(([t, b]) => (
            <section key={t} className="border-t border-border py-7">
              <h2 className="font-display text-xl font-semibold tracking-wide">{t}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{b}</p>
            </section>
          ))}
        </div>
        <a href={SITE.issues} target="_blank" rel="noreferrer" className="text-ember hover:underline">
          Ask a question on GitHub →
        </a>
      </main>
      <SiteFooter />
    </div>
  );
}
