import { Link } from "@tanstack/react-router";
import { Bug, Github, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/site";

const lnk =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-surface/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-5 gap-y-2.5 px-6 py-3 md:h-[64px] md:flex-nowrap md:py-0">
        <Link to="/" aria-label="Daily Spark home" className="order-1 mr-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember md:mr-0">
          <Logo />
        </Link>
        <nav className="scrollbar-none order-4 flex w-full items-center gap-1.5 overflow-x-auto py-1 md:order-2 md:w-auto md:gap-2">
          <Link to="/features" className={lnk} activeProps={{ className: "text-foreground bg-surface/80" }}>
            What it does
          </Link>
          <Link to="/screens" className={lnk} activeProps={{ className: "text-foreground bg-surface/80" }}>
            Screens
          </Link>
          <Link to="/privacy" className={lnk} activeProps={{ className: "text-foreground bg-surface/80" }}>
            Privacy
          </Link>
          <Link to="/download" className={lnk} activeProps={{ className: "text-foreground bg-surface/80" }}>
            Download
          </Link>
        </nav>
        <div className="order-2 flex items-center gap-3 md:order-3">
          <a
            href={SITE.apk.url}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-ember/20 transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Download APK
          </a>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className={`${lnk} inline-flex items-center gap-1.5`}
            aria-label="View Daily Spark source code on GitHub"
          >
            <Github className="size-4" /> <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-7">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-7 gap-y-3.5 px-6 text-[13.5px] text-faint">
        <p>© {new Date().getFullYear()} {SITE.author} · MIT</p>
        <div className="flex flex-wrap gap-x-[22px] gap-y-2">
          <a href={SITE.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[7px] text-muted-foreground hover:text-foreground">
            <Github className="size-4" /> Source
          </a>
          <Link to="/privacy" className="inline-flex items-center gap-[7px] text-muted-foreground hover:text-foreground">
            <ShieldCheck className="size-4" /> Privacy
          </Link>
          <a href={SITE.issues} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[7px] text-muted-foreground hover:text-foreground">
            <Bug className="size-4" /> Report a bug
          </a>
        </div>
      </div>
    </footer>
  );
}
