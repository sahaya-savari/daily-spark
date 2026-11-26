import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/designsystems")({
  beforeLoad: () => {
    throw redirect({ to: "/design-system", replace: true });
  },
});
