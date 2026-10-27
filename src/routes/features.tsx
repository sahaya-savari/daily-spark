import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { siteUrl } from "@/lib/site";

const title = "Features - Daily Spark";
const description =
  "Explore Daily Spark features: streaks, calendar heatmap, custom icons, reminders, and full local backup.";

// This route is a deep link into the homepage's `#features` section and renders
// the same body as `/`, so it must not claim a canonical of its own. One body,
// one canonical owner: point search engines (and og:url) at `/`. Give this route
// its own content before restoring a self-referencing canonical.
const canonical = siteUrl("/");

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
  component: () => <LandingPage targetSection="features" />,
});
