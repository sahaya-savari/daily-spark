import { flushSync } from "react-dom";

/**
 * Executes a tab change using document.startViewTransition when available.
 * If unsupported or if user has reduced-motion enabled, falls back to direct callback execution.
 *
 * Interface Contract: transitionTab: (callback: () => void) => void
 */
export function transitionTab(callback: () => void): void {
  // Check browser support and document existence
  if (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as unknown as { startViewTransition?: (cb: () => void) => void }).startViewTransition === "function"
  ) {
    // Honor reduced-motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) {
      callback();
      return;
    }

    try {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        flushSync(() => {
          callback();
        });
      });
    } catch {
      // Safety fallback if startViewTransition throws unexpectedly
      callback();
    }
  } else {
    // Graceful fallback for browsers without View Transitions API
    callback();
  }
}
