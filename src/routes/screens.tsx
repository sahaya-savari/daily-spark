import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { siteUrl } from "@/lib/site";

const title = "Screens & Layouts - Daily Spark";
const description =
  "Take a look at the calm, high-contrast layouts of Daily Spark: Today, New habit, Details, Progress, and Calendar.";

// Same body as `/` (a deep link into its `#screens` section), so it shares the
// homepage's canonical instead of competing with it. Give this route its own
// content before restoring a self-referencing canonical.
const canonical = siteUrl("/");

export const Route = createFileRoute("/screens")({
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
  component: () => <LandingPage targetSection="screens" />,
});
