import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { DailySparkApp } from "@/components/app/DailySparkApp";
import { siteUrl } from "@/lib/site";
import { isStandaloneApp } from "@/lib/launcher";

const title = "Daily Spark | Free Offline Habit Tracker";
const description =
  "A free, offline-first habit tracker for Android and the web. Track daily habits, streaks and progress without an account, ads or analytics. Optional encrypted backups.";
const socialTitle = "Daily Spark - Show up. Tick it. Keep going.";

export function RootPage() {
  if (isStandaloneApp()) {
    return <DailySparkApp />;
  }

  return <LandingPage />;
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: socialTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl("/") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: socialTitle },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: siteUrl("/") }],
  }),
  component: RootPage,
});
