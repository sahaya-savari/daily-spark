import React, { useState, useRef, useCallback } from "react";
import { SITE } from "@/lib/site";
import { PixelDownload, PixelCheck } from "@/components/ui/pixel-icon";
import { cn } from "@/lib/utils";

interface DownloadApkButtonProps {
  className?: string;
  variant?: "hero" | "banner" | "header" | "page";
  children?: React.ReactNode;
}

/**
 * Debounced, single-trigger APK download button.
 * Prevents mobile browser multi-touch, ghost double-taps, and concurrent download streams.
 * Locks for 6 seconds upon first tap with instant visual feedback.
 */
export function DownloadApkButton({
  className,
  variant = "hero",
  children,
}: DownloadApkButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const lockRef = useRef<number>(0);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      const now = Date.now();
      // Enforce strict 6-second cooldown to stop concurrent/multi-touch downloads
      if (now - lockRef.current < 6000) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      lockRef.current = now;
      setDownloading(true);

      // Perform single programmatic download
      try {
        const link = document.createElement("a");
        link.href = SITE.apk.url;
        link.download = SITE.apk.filename;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download trigger failed:", err);
      }

      // Visual state transition
      setTimeout(() => {
        setDownloading(false);
        setDownloaded(true);
      }, 1800);

      // Reset cooldown and UI state
      setTimeout(() => {
        setDownloaded(false);
        lockRef.current = 0;
      }, 6000);
    },
    []
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      className={cn(
        "touch-manipulation select-none [&>*]:pointer-events-none transition-all duration-200 active:scale-[0.98]",
        downloading && "opacity-90 cursor-wait",
        className
      )}
      aria-live="polite"
      aria-label={downloading ? "Starting download..." : "Download Daily Spark APK"}
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
    </button>
  );
}

