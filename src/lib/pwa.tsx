import { Capacitor } from "@capacitor/core";
import React, { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

export function registerServiceWorker() {
  if (Capacitor.isNativePlatform()) return;
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const register = () => {
      const swUrl = `${SITE.basePath}sw.js`;
      navigator.serviceWorker.register(swUrl, { scope: SITE.basePath }).catch(() => {});
    };
    // Lazy app loading and client-side navigation can mount after window.load.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }
}

export function UpdateToast() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowToast(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  const handleReload = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  if (!showToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="update-toast"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-ember/30 bg-surface/95 p-3.5 shadow-xl backdrop-blur-md text-foreground"
    >
      <span className="text-xs font-semibold">Update ready</span>
      <button
        type="button"
        onClick={handleReload}
        className="rounded-xl bg-ember px-3 py-1 text-xs font-bold text-white hover:bg-ember/90 transition-colors"
      >
        Reload
      </button>
      <button
        type="button"
        onClick={() => setShowToast(false)}
        aria-label="Dismiss update notification"
        className="text-faint hover:text-foreground text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
