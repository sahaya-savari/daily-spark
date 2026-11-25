import { Globe2, Monitor, Smartphone, Terminal, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DownloadApkButton } from "@/components/ui/DownloadApkButton";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface PlatformDownloadGridProps {
  compact?: boolean;
  className?: string;
}

export function PlatformDownloadGrid({ compact = false, className }: PlatformDownloadGridProps) {
  const cardBase =
    "group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#111318] p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_40px_-20px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-1 hover:border-ember/40 hover:bg-[#171A21] hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8),0_0_24px_-8px_rgba(236,137,76,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5",
        compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2",
        className
      )}
    >
      {/* 1. Android Native APK */}
      <DownloadApkButton className={cardBase}>
        <div>
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl border border-ember/25 bg-ember/10 text-ember transition-transform group-hover:scale-105">
              <Smartphone aria-hidden="true" className="size-6" />
            </span>
            <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ember">
              Android
            </span>
          </div>

          <h3 className="mt-4 font-display text-[20px] font-bold text-foreground">
            Android APK
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A0A6B4] min-h-[42px]">
            Install the universal APK directly on your phone or tablet without Google Play.
          </p>

          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs text-[#8A92A3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Universal APK · {SITE.apk.size}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Offline habit tracking · No analytics</span>
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5 text-xs font-bold uppercase tracking-wider text-ember group-hover:text-[#FFA366]">
          <span>Download APK</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </DownloadApkButton>

      {/* 2. Web App (Browser / PWA) */}
      <Link to="/app" className={cardBase}>
        <div>
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl border border-ember/25 bg-ember/10 text-ember transition-transform group-hover:scale-105">
              <Globe2 aria-hidden="true" className="size-6" />
            </span>
            <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ember">
              Web &amp; PWA
            </span>
          </div>

          <h3 className="mt-4 font-display text-[20px] font-bold text-foreground">
            Web App
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A0A6B4] min-h-[42px]">
            Open directly in any browser. Mobile views enter instantly; desktop gets the full workstation.
          </p>

          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs text-[#8A92A3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Installable PWA · Works offline</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Runs in browser at /app</span>
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5 text-xs font-bold uppercase tracking-wider text-ember group-hover:text-[#FFA366]">
          <span>Open Web App</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* 3. Windows Portable */}
      <a href={SITE.desktop.windowsZip} download="Daily-Spark-v1.0.1-windows.zip" className={cardBase}>
        <div>
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl border border-ember/25 bg-ember/10 text-ember transition-transform group-hover:scale-105">
              <Monitor aria-hidden="true" className="size-6" />
            </span>
            <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ember">
              Windows
            </span>
          </div>

          <h3 className="mt-4 font-display text-[20px] font-bold text-foreground">
            Windows
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A0A6B4] min-h-[42px]">
            Standalone portable package for PC. Unzip once and launch with no installation required.
          </p>

          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs text-[#8A92A3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Portable .ZIP · Self-contained</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Local storage in app folder</span>
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5 text-xs font-bold uppercase tracking-wider text-ember group-hover:text-[#FFA366]">
          <span>Download .ZIP</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>

      {/* 4. Linux Archive */}
      <a href={SITE.desktop.linuxTarGz} download="Daily-Spark-v1.0.1-linux.tar.gz" className={cardBase}>
        <div>
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl border border-ember/25 bg-ember/10 text-ember transition-transform group-hover:scale-105">
              <Terminal aria-hidden="true" className="size-6" />
            </span>
            <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ember">
              Linux
            </span>
          </div>

          <h3 className="mt-4 font-display text-[20px] font-bold text-foreground">
            Linux
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A0A6B4] min-h-[42px]">
            Portable desktop package with launcher script for Ubuntu, Debian, Fedora, Arch, and more.
          </p>

          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs text-[#8A92A3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Standalone .TAR.GZ archive</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-ember shrink-0" />
              <span>Includes daily-spark launcher</span>
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5 text-xs font-bold uppercase tracking-wider text-ember group-hover:text-[#FFA366]">
          <span>Download TAR.GZ</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
    </div>
  );
}
