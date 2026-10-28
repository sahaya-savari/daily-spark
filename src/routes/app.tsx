import { createFileRoute } from "@tanstack/react-router";
import { DailySparkApp } from "@/components/app/DailySparkApp";
import { siteUrl } from "@/lib/site";

const title = "Daily Spark App - Calm, Offline Habit Tracker";
const description =
  "Track your daily habits, streaks, and reflections offline with Daily Spark. No account, no ads, no tracking.";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl("/app") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: siteUrl("/app") }],
  }),
  component: () => <DailySparkApp />,
});

