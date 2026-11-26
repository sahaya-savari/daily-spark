import { createFileRoute } from "@tanstack/react-router";
import { LazyLandingPage } from "@/components/landing/LazyLandingPage";
import { siteUrl } from "@/lib/site";

const title = "Features - Daily Spark";
const description =
  "Explore Daily Spark's daily check-ins, schedules, reminders, streaks, calendar progress, and local-first data storage. Optional encrypted exports help you move a backup between devices.";

const canonical = siteUrl("/features");

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
  component: () => <LazyLandingPage targetSection="features" />,
});
