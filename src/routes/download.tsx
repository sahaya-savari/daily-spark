import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Daily Spark - Android APK" },
      {
        name: "description",
        content:
          "Download the official Daily Spark Android APK. Lightweight 4.1 MB, 100% offline, privacy-first habit tracker with zero ads or tracking.",
      },
      { property: "og:title", content: "Download Daily Spark - Android APK" },
      {
        property: "og:description",
        content: "Get Daily Spark for Android. Free, offline-first habit tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage targetSection="get" />,
});
