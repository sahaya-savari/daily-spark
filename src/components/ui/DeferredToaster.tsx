import { lazy, Suspense } from "react";

const Toaster = lazy(() =>
  import("./sonner").then(({ Toaster: Component }) => ({ default: Component })),
);

export function DeferredToaster() {
  return (
    <Suspense fallback={null}>
      <Toaster theme="dark" position="top-center" />
    </Suspense>
  );
}
