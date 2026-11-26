import { Capacitor } from "@capacitor/core";
import React, { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import {
  type AvailableUpdate,
  checkForNativeOrDesktopUpdate,
  dismissAppUpdate,
  isNativeOrDesktop,
} from "@/lib/updateCheck";

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
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isNativeOrDesktop()) {
      let active = true;
      checkForNativeOrDesktopUpdate()
        .then((update) => {
          if (active && update) {
            setAvailableUpdate(update);
            setShowToast(true);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }

    if (!("serviceWorker" in navigator)) return;

    let active = true;
    const attachInstallingListener = (newWorker: ServiceWorker | null) => {
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (active && newWorker.state === "installed" && navigator.serviceWorker.controller) {
          setWaitingWorker(newWorker);
          setShowToast(true);
        }
      });
    };

    navigator.serviceWorker.ready
      .then((reg) => {
        if (!active) return;
        if (reg.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(reg.waiting);
          setShowToast(true);
        }
        reg.addEventListener("updatefound", () => {
          attachInstallingListener(reg.installing);
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleReload = () => {
    if (waitingWorker) {
      let reloaded = false;
      const reloadOnce = () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      };
      navigator.serviceWorker?.addEventListener("controllerchange", reloadOnce, { once: true });
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(reloadOnce, 400);
      return;
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    if (availableUpdate) {
      dismissAppUpdate(availableUpdate.version);
    }
    setShowToast(false);
  };

  if (!showToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="update-toast"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-ember/30 bg-surface/95 p-3.5 shadow-xl backdrop-blur-md text-foreground"
    >
      {availableUpdate ? (
        <>
          <span className="text-xs font-semibold">
            Update available: {availableUpdate.version}
          </span>
          <a
            href={availableUpdate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-ember px-3 py-1 text-xs font-bold text-white hover:bg-ember/90 transition-colors"
          >
            Download
          </a>
        </>
      ) : (
        <>
          <span className="text-xs font-semibold">Update ready</span>
          <button
            type="button"
            onClick={handleReload}
            className="rounded-xl bg-ember px-3 py-1 text-xs font-bold text-white hover:bg-ember/90 transition-colors"
          >
            Reload
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss update notification"
        className="text-faint hover:text-foreground text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
