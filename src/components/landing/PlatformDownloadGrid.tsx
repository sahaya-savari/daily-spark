import { Globe2, Monitor, Smartphone, Terminal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DownloadApkButton } from "@/components/ui/DownloadApkButton";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const cardClass = "group flex min-h-[164px] flex-col rounded-3xl border border-white/10 bg-surface/75 p-5 text-left shadow-sm transition-colors hover:border-ember/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

export function PlatformDownloadGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}>
      <DownloadApkButton className={cardClass}>
        <span className="grid size-11 place-items-center rounded-2xl bg-ember-soft text-ember"><Smartphone aria-hidden="true" className="size-5" /></span>
        <span className="mt-4 block font-display text-lg font-bold text-foreground">Android</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">Install the universal APK on your phone or tablet.</span>
        <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-ember">APK · {SITE.apk.size}</span>
      </DownloadApkButton>
      <Link to="/app" className={cardClass}>
        <span className="grid size-11 place-items-center rounded-2xl bg-ember-soft text-ember"><Globe2 aria-hidden="true" className="size-5" /></span>
        <span className="mt-4 font-display text-lg font-bold text-foreground">Web app</span>
        <span className="mt-1 text-sm leading-relaxed text-muted-foreground">Open instantly in a browser and install it as a PWA.</span>
        <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-ember">Open now</span>
      </Link>
      <a href={SITE.desktop.windowsZip} download className={cardClass}>
        <span className="grid size-11 place-items-center rounded-2xl bg-ember-soft text-ember"><Monitor aria-hidden="true" className="size-5" /></span>
        <span className="mt-4 font-display text-lg font-bold text-foreground">Windows</span>
        <span className="mt-1 text-sm leading-relaxed text-muted-foreground">Portable local package. Unzip once and launch.</span>
        <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-ember">Portable ZIP</span>
      </a>
      <a href={SITE.desktop.linuxTarGz} download className={cardClass}>
        <span className="grid size-11 place-items-center rounded-2xl bg-ember-soft text-ember"><Terminal aria-hidden="true" className="size-5" /></span>
        <span className="mt-4 font-display text-lg font-bold text-foreground">Linux</span>
        <span className="mt-1 text-sm leading-relaxed text-muted-foreground">Portable local package with a desktop launcher.</span>
        <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-ember">TAR.GZ</span>
      </a>
    </div>
  );
}
