import { lazy, Suspense } from "react";
import { DeferredToaster } from "@/components/ui/DeferredToaster";
import { UpdateToast } from "@/lib/pwa";

const DailySparkApp = lazy(() =>
  import("./DailySparkApp").then(({ DailySparkApp: App }) => ({ default: App })),
);

export function StandaloneApp() {
  return (
    <>
      <DeferredToaster />
      <UpdateToast />
      <Suspense
        fallback={
          <main
            aria-busy="true"
            className="grid min-h-dvh place-items-center bg-background p-6 text-foreground"
          >
            <p role="status" className="text-sm text-muted-foreground">
              Opening Daily Spark...
            </p>
          </main>
        }
      >
        <DailySparkApp />
      </Suspense>
    </>
  );
}
