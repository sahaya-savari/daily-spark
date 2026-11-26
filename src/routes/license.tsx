import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/landing/ResourcePage";
import { SITE_PAGES } from "@/lib/site-pages";
import { siteUrl } from "@/lib/site";

const page = SITE_PAGES["license"];
export const Route = createFileRoute("/license")({
  head: () => ({
    meta: [
      { title: `${page.title} - Daily Spark` },
      { name: "description", content: page.description },
      { property: "og:title", content: `${page.title} - Daily Spark` },
      { property: "og:description", content: page.description },
      { property: "og:url", content: siteUrl(page.path) },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl(page.path) }],
  }),
  component: () => <ResourcePage page="license" />,
});
