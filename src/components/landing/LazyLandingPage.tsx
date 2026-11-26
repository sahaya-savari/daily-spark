import { lazy, Suspense } from "react";
import type { LandingPageProps } from "./LandingPage";

const LandingPage = lazy(() =>
  import("./LandingPage").then(({ LandingPage: Page }) => ({ default: Page })),
);

export function LazyLandingPage(props: LandingPageProps) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="grid min-h-dvh place-items-center bg-background p-6 text-foreground"
        >
          <p role="status" className="text-sm text-muted-foreground">
            Loading Daily Spark...
          </p>
        </main>
      }
    >
      <LandingPage {...props} />
    </Suspense>
  );
}
