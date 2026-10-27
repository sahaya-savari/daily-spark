import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features - Daily Spark" },
      {
        name: "description",
        content: "Explore Daily Spark features: streaks, calendar heatmap, custom icons, reminders, and full local backup.",
      },
      { property: "og:title", content: "Features - Daily Spark" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage targetSection="features" />,
});
