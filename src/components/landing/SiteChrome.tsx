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
    <header className="sticky top-3.5 z-50 px-3 sm:px-6">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 rounded-full border border-white/10 bg-surface/75 px-3.5 py-2 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-300 hover:border-white/15 sm:px-4.5 sm:py-2.5">
        {/* Brand Logo & Title */}
        <Link
          to="/"
          aria-label="Daily Spark home"
          className="group flex items-center gap-2.5 rounded-full px-1.5 py-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <SparkMark className="size-6 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <b className="font-display text-[17.5px] font-bold tracking-tight text-foreground">
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          <a
            href={SITE.apk.url}
            download={SITE.apk.filename}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ember to-amber-500 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-ember/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-ember/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember sm:px-4 sm:py-2"
          >
            <Download className="size-3.5" />
            <span>Download APK</span>
          </a>

          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember sm:py-2"
            aria-label="View Daily Spark source code on GitHub"
          >
            <Github className="size-3.5" />
            <span>GitHub</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-surface/60 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 bg-surface/90 p-3 shadow-2xl backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold" }}
            >
              What it does
            </Link>
            <Link
              to="/screens"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold" }}
            >
              Screens
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold" }}
            >
              Privacy
            </Link>
            <Link
              to="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface-2 font-semibold" }}
            >
              Download
            </Link>
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
