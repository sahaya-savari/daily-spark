import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SparkMark } from "@/components/brand/Logo";

const SPLASH_SEEN_KEY = "dailyspark_splash_seen";
const SPLASH_DURATION_MS = 3200;
const FADE_OUT_MS = 450;

function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  if (Capacitor.isNativePlatform()) return false;
  if (import.meta.env.MODE === "test" || navigator.webdriver) return false;
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

export function WebsiteSplash() {
  const [visible, setVisible] = useState<boolean>(() => shouldShowSplash());
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      /* ignore sessionStorage errors */
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 600 : SPLASH_DURATION_MS;

    const raf = requestAnimationFrame(() => setProgress(100));
    const fadeTimer = window.setTimeout(() => setFading(true), duration);
    const hideTimer = window.setTimeout(() => setVisible(false), duration + FADE_OUT_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const handleSkip = () => {
    setFading(true);
    window.setTimeout(() => setVisible(false), 250);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Daily Spark"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5 grid size-20 place-items-center rounded-3xl border border-ember/25 bg-ember/10 shadow-[0_0_48px_-12px_var(--ember-glow)]">
          <SparkMark themed className="size-11" />
        </div>
        <p className="font-display text-2xl font-black tracking-tight text-white">
          Daily Spark
        </p>
        <p className="mt-1.5 font-mono text-xs text-[#8A92A3]">
          Calm, offline-first habit tracker
        </p>
        <div
          aria-hidden="true"
          className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-ember transition-all ease-out"
            style={{
              width: `${progress}%`,
              transitionDuration: `${SPLASH_DURATION_MS}ms`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Skip loading screen"
          className="mt-5 rounded-full px-3 py-1 font-mono text-[11px] text-[#737B8C] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
