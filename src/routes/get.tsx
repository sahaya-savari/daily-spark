import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/get")({
  beforeLoad: () => {
    throw redirect({ to: "/download" });
  },
  component: () => null,
});
