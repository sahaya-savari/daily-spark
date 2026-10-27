import { Link } from "@tanstack/react-router";
import { Bug, Github, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/site";

const lnk = "whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-5 gap-y-2.5 px-6 py-3 md:h-[62px] md:flex-nowrap md:py-0">
        <Link to="/" aria-label="Daily Spark home" className="order-1 mr-auto md:mr-0">
          <Logo />
        </Link>
        <nav className="scrollbar-none order-4 flex w-full gap-5 overflow-x-auto md:order-2 md:w-auto md:gap-6">
          <a href="#features" className={lnk}>What it does</a>
          <a href="#screens" className={lnk}>Screens</a>
          <Link to="/privacy" className={lnk} activeProps={{ className: "text-foreground" }}>Privacy</Link>
          <a href="#get" className={lnk}>Download</a>
        </nav>
        <div className="order-2 flex items-center gap-5 md:order-3">
          <Link
            to="/app"
            className="rounded-full border-0 bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-hi hover:text-foreground"
          >
            Open app
          </Link>
          <a href={SITE.repo} target="_blank" rel="noreferrer" className={`${lnk} inline-flex items-center gap-[7px]`}>
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
