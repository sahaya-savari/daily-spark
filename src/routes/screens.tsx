import { createFileRoute } from "@tanstack/react-router";
import { LazyLandingPage } from "@/components/landing/LazyLandingPage";
import { siteUrl } from "@/lib/site";

const title = "Screens & Layouts - Daily Spark";
const description =
  "Preview Daily Spark's mobile screens and full desktop workspace, plus optional planner and widget previews. Feature availability varies by app release.";

const canonical = siteUrl("/screens");

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
  component: () => <LazyLandingPage targetSection="screens" />,
});
