import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/screens")({
  head: () => ({
    meta: [
      { title: "Screens & Layouts - Daily Spark" },
      {
        name: "description",
        content: "Take a look at the calm, high-contrast layouts of Daily Spark: Today, New habit, Details, Progress, and Calendar.",
      },
      { property: "og:title", content: "Screens & Layouts - Daily Spark" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage targetSection="screens" />,
});
