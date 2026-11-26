import { createFileRoute } from "@tanstack/react-router";
import { StandaloneApp } from "@/components/app/StandaloneApp";

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
  component: () => <StandaloneApp />,
});
