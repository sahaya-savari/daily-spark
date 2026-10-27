import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const subs = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    subs.forEach((s) => s());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    subs.forEach((s) => s());
  });
}

/** Browser install prompt for the Daily Spark PWA. */
export function usePwaInstall() {
  const [, force] = useState(0);
  const [env, setEnv] = useState({ installed: false, ios: false, inFrame: false });

  useEffect(() => {
    const s = () => force((n) => n + 1);
    subs.add(s);
    const ua = navigator.userAgent;
    setEnv({
      installed:
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
      ios: /iphone|ipad|ipod/i.test(ua),
      inFrame: window.self !== window.top,
    });
    return () => {
      subs.delete(s);
    };
  }, []);

  return {
    canPrompt: deferred !== null,
    ...env,
    async install(): Promise<boolean> {
      if (!deferred) return false;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      subs.forEach((s) => s());
      return choice.outcome === "accepted";
    },
  };
}
