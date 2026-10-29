import React, { useState, useCallback } from "react";
import { SITE } from "@/lib/site";
import { PixelDownload, PixelCheck } from "@/components/ui/pixel-icon";
import { cn } from "@/lib/utils";

interface DownloadApkButtonProps {
  className?: string;
  variant?: "hero" | "banner" | "header" | "page";
  children?: React.ReactNode;
}

/**
 * Global module-level cooldown timestamp.
 * Shared across ALL DownloadApkButton instances on the page (Header, Hero, Bottom CTA).
 * Guarantees that tapping any button locks all download triggers synchronously.
 */
let globalDownloadLock = 0;

/**
 * Debounced, single-stream APK download button.
 * - Uses native <a> tag with direct same-origin download to prevent Chrome 302 redirect loops.
 * - Synchronously locks pointer-events and enforces an 8-second global cooldown across the page.
 * - Prevents mobile browser multi-touch, ghost double-taps, and concurrent download streams.
 */
export function DownloadApkButton({
  className,
  variant = "hero",
  children,
}: DownloadApkButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const now = Date.now();

      // Enforce strict 8-second global cooldown to prevent duplicate/concurrent download streams
      if (now - globalDownloadLock < 8000) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      globalDownloadLock = now;

      // Synchronously freeze pointer events on the clicked element to prevent digitizer ghost taps
      const target = e.currentTarget;
      if (target) {
        target.style.pointerEvents = "none";
      }

      setDownloading(true);

      // Transition to "Download started!" state after browser begins download
      setTimeout(() => {
        setDownloading(false);
        setDownloaded(true);
      }, 1600);

      // Release lock and restore UI state after cooldown
      setTimeout(() => {
        setDownloaded(false);
        if (target) {
          target.style.pointerEvents = "";
        }
        globalDownloadLock = 0;
      }, 8000);
    },
    []
  );

  return (
    <a
      href={downloading ? undefined : SITE.apk.url}
      download={SITE.apk.filename}
      onClick={handleClick}
      className={cn(
        "touch-manipulation select-none [&>*]:pointer-events-none transition-all duration-200 active:scale-[0.98]",
        downloading && "opacity-90 cursor-wait pointer-events-none",
        className
      )}
      aria-live="polite"
      aria-label={downloading ? "Starting download..." : "Download Daily Spark APK"}
      role="button"
    >
      {downloading ? (
        <>
          <span className="pt-0.5 animate-pulse">Starting download...</span>
          <span className="size-4 sm:size-5 shrink-0 inline-block animate-spin border-2 border-current border-t-transparent rounded-full" />
        </>
      ) : downloaded ? (
        <>
          <span className="pt-0.5">Download started!</span>
          <PixelCheck className="size-4 sm:size-5 shrink-0 text-emerald-300" />
        </>
      ) : children ? (
        children
      ) : variant === "header" ? (
        <>
          <span className="pt-0.5">Download APK</span>
          <PixelDownload className="size-3.5 sm:size-4 shrink-0" />
        </>
      ) : (
        <>
          <span className="pt-0.5">Download Daily Spark APK</span>
          <PixelDownload className="size-4 sm:size-5 shrink-0" />
        </>
      )}
    </a>
  );
}
