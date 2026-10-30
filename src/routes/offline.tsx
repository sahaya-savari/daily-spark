import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WifiOff, RotateCcw, ArrowLeft, ShieldCheck } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Offline - Daily Spark" },
      { name: "description", content: "Daily Spark works 100% offline. All your habits, streaks, and data stay safe on your device." },
      { property: "og:title", content: "Offline - Daily Spark" },
      { property: "og:description", content: "Daily Spark works 100% offline. All your habits, streaks, and data stay safe on your device." },
      { property: "og:url", content: siteUrl("/offline") },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/offline") }],
  }),
  component: OfflinePage,
});

export function OfflinePage() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border/40 bg-surface/90 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Ember Accent Badge */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-ember/15 text-ember border border-ember/25 shadow-inner">
          <WifiOff className="size-8" />
        </div>

        {/* Live Network Status Indicator */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2 px-3 py-1 text-xs font-medium">
          <span
            className={`size-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-ember"
            }`}
          />
          <span className="text-muted-foreground">
            {isOnline ? "Connection Restored" : "Offline Mode Active"}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          You&apos;re Offline
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Daily Spark is built 100% offline-first. You don&apos;t need a connection to build momentum. All your habits, streaks, and journal notes stay safely on this device.
        </p>

        {/* Trust Points */}
        <div className="my-6 space-y-2 rounded-2xl border border-border/30 bg-surface-2/60 p-3.5 text-left text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-ember" />
            <span>Habits saved locally to device storage</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-ember" />
            <span>Streaks calculate without remote servers</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-ember" />
            <span>Zero trackers, zero ads, zero sync latency</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-ember px-4 py-3 text-sm font-semibold text-white shadow-md shadow-ember/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Open Habits</span>
          </a>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-2/80 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Check Connection</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
