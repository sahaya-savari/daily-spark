import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bug, Download, Github, Menu, ShieldCheck, X } from "lucide-react";
import { SparkMark } from "@/components/brand/Logo";
import { SITE } from "@/lib/site";

const navLnk =
  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-all duration-150 hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-2.5 sm:top-3.5 z-50 px-2 sm:px-6 w-full max-w-full">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-1.5 sm:gap-3 rounded-full border border-white/10 bg-surface/80 px-2.5 py-1.5 sm:px-4.5 sm:py-2.5 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-300 hover:border-white/15">
        {/* Brand Logo & Title */}
        <Link
          to="/"
          aria-label="Daily Spark home"
          className="group flex items-center gap-2 rounded-full px-1 py-0.5 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember shrink-0"
        >
          <SparkMark className="size-5 sm:size-6 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <b className="font-display text-[15px] sm:text-[17.5px] font-bold tracking-tight text-foreground whitespace-nowrap">
            Daily Spark
          </b>
        </Link>

        {/* Center Navigation Tray */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-white/5 bg-background/50 p-1 md:flex"
        >
          <Link
            to="/features"
            className={navLnk}
            activeProps={{ className: "text-foreground bg-surface/90 shadow-sm font-semibold" }}
          >
            What it does
          </Link>
          <Link
            to="/screens"
            className={navLnk}
            activeProps={{ className: "text-foreground bg-surface/90 shadow-sm font-semibold" }}
          >
            Screens
          </Link>
          <Link
            to="/privacy"
            className={navLnk}
            activeProps={{ className: "text-foreground bg-surface/90 shadow-sm font-semibold" }}
          >
            Privacy
          </Link>
          <Link
            to="/download"
            className={navLnk}
            activeProps={{ className: "text-foreground bg-surface/90 shadow-sm font-semibold" }}
          >
            Download
          </Link>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <a
            href={SITE.apk.url}
            download={SITE.apk.filename}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-ember to-amber-500 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-primary-foreground shadow-md shadow-ember/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-ember/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember whitespace-nowrap"
          >
            <Download className="size-3 sm:size-3.5" />
            <span>Download APK</span>
          </a>

          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/60 px-3 py-1.5 sm:py-2 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            aria-label="View Daily Spark source code on GitHub"
          >
            <Github className="size-3.5" />
            <span>GitHub</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-9 place-items-center rounded-full border border-white/20 bg-surface-2/90 text-foreground shadow-sm transition-all hover:border-ember/50 hover:text-ember active:scale-95 md:hidden shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5 text-ember stroke-[2.2]" />
            ) : (
              <Menu className="size-5 text-foreground stroke-[2.2]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-[1100px] overflow-hidden rounded-2xl border border-white/15 bg-surface/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
            >
              <span>What it does</span>
              <span className="text-xs text-muted-foreground font-mono">01</span>
            </Link>
            <Link
              to="/screens"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
            >
              <span>Screens</span>
              <span className="text-xs text-muted-foreground font-mono">02</span>
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Privacy</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">03</span>
            </Link>
            <Link
              to="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
            >
              <span className="flex items-center gap-2">
                <Download className="size-4 text-ember" />
                <span>Download</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">04</span>
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15 border-t border-white/5 mt-1 pt-3"
            >
              <span className="flex items-center gap-2">
                <Github className="size-4" />
                <span>GitHub Repository</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">v{SITE.apk.version}</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl border border-white/5 bg-surface/30 p-6 text-[13.5px] text-faint backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SparkMark className="size-5 shrink-0 opacity-80" />
          <p>© {new Date().getFullYear()} {SITE.author} · MIT License</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" /> Source
          </a>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheck className="size-4" /> Privacy
          </Link>
          <a
            href={SITE.issues}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bug className="size-4" /> Report an issue
          </a>
        </div>
      </div>
    </footer>
  );
}
