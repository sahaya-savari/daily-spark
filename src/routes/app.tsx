import { createFileRoute } from "@tanstack/react-router";
import { DailySparkApp } from "@/components/app/DailySparkApp";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Daily Spark App" },
      {
        name: "description",
        content: "Open the calm, local-first Daily Spark habit tracker.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <DailySparkApp />,
});
