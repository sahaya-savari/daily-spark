import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Spark - Calm, offline habit tracker" },
      {
        name: "description",
        content:
          "Track one small action a day. Daily Spark is a free, offline-first habit and streak tracker. No account, no ads, no tracking. Download the Android APK.",
      },
      { property: "og:title", content: "Daily Spark - Show up. Tick it. Keep going." },
      {
        property: "og:description",
        content: "A free, calm, offline-first habit tracker. No account, no ads, your data stays on your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage />,
});
