import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bug, Download, Github, Menu, ShieldCheck, X } from "lucide-react";
import { SparkMark } from "@/components/brand/Logo";
import { SITE } from "@/lib/site";

const navLnk =
  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-all duration-150 hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

const menuItem =
  "flex min-h-11 items-center justify-between gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

const footerLink =
  "inline-flex min-h-11 items-center gap-2 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-lg";

/**
 * Move focus to <main> once a route change has committed.
 *
 * A route swap replaces the whole tree, so the <main> that exists on the next
 * animation frame still belongs to the outgoing page and is detached a moment
 * later (taking focus with it). Retry on a short bounded schedule instead, so
 * the last attempt lands on the incoming <main>; bail as soon as something
 * else meaningful has focus so a keyboard user who is already navigating is
 * never pulled back.
 */
function focusMainWhenReady() {
  const deadline = performance.now() + 240;
  const attempt = () => {
    const active = document.activeElement as HTMLElement | null;
    const main = document.getElementById("main");
    const activeIsElsewhere =
      !!active && active !== document.body && active !== document.documentElement && active !== main;
    if (activeIsElsewhere) return;
    main?.focus({ preventScroll: true });
    if (performance.now() < deadline) window.setTimeout(attempt, 40);
  };
  requestAnimationFrame(attempt);
}

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    // Move focus into the tray so keyboard users land on the first destination.
    restoreFocus.current = false;
    const getItems = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
      );

    // The trigger is mounted for the whole app lifetime; capture it once so the
    // cleanup below never dereferences a ref whose value may have changed.
    const toggleEl = toggleRef.current;

    getItems()[0]?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setMobileMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = getItems();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      const outside = !menuRef.current?.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };
    // The tray is only rendered below the header's lg breakpoint. If the
    // viewport grows past it while open, close without restoring focus to the
    // now-hidden toggle.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (!e.matches) return;
      restoreFocus.current = false;
      setMobileMenuOpen(false);
      if (menuRef.current?.contains(document.activeElement)) {
        const main = document.getElementById("main");
        if (main) main.focus({ preventScroll: true });
        else (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
      document.body.style.overflow = previous;
      // Escape closes back to the trigger; pointer/link closes leave focus alone.
      if (restoreFocus.current) {
        restoreFocus.current = false;
        toggleEl?.focus({ preventScroll: true });
      }
    };
  }, [mobileMenuOpen]);

  // Menu items navigate away from the tray, so its DOM disappears before the
  // browser can restore focus. Send keyboard users to <main> instead, except
  // for in-page anchors, which keep the existing return-to-trigger behaviour.
  const closeMenu = (destination: "hash" | "route" | "external" = "external") => {
    restoreFocus.current = destination === "hash";
    setMobileMenuOpen(false);
    if (destination === "hash") return;
    focusMainWhenReady();
  };

  return (
    <header className="sticky top-2.5 sm:top-3.5 z-50 px-3 sm:px-6 w-full max-w-full pt-[env(safe-area-inset-top)]">
      <div className="glass-strong mx-auto flex max-w-[1100px] items-center justify-between gap-1.5 sm:gap-3 rounded-full px-2.5 py-1.5 sm:px-4.5 sm:py-2.5 transition-all duration-300 hover:border-white/15">
        {/* Brand Logo & Title */}
        <Link
          to="/"
          aria-label="Daily Spark home"
          className="group flex min-h-11 items-center gap-2 rounded-full px-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember shrink-0"
        >
          <SparkMark className="size-5 sm:size-6 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <b className="font-display text-[15px] sm:text-[17.5px] font-bold tracking-tight text-foreground whitespace-nowrap">
            Daily Spark
          </b>
        </Link>

        {/* Center Navigation Tray */}
        <nav
          aria-label="Primary navigation"
          className="glass-inset hidden items-center gap-1 rounded-full p-1 lg:flex"
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
            className="inline-flex h-11 items-center gap-1 sm:h-auto sm:gap-1.5 rounded-full cta-solid px-2.5 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember whitespace-nowrap shrink-0"
          >
            <Download className="size-3 sm:size-3.5 shrink-0" />
            <span><span className="hidden sm:inline">Download </span>APK</span>
          </a>

          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/60 px-3 py-1.5 sm:py-2 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            aria-label="View Daily Spark source code on GitHub"
          >
            <Github className="size-3.5" />
            <span>GitHub</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-surface-2/90 text-foreground shadow-sm transition-all hover:border-ember/50 hover:text-ember active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember lg:hidden shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
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
        <>
          <div
            className="fixed inset-0 z-[-1] bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            ref={menuRef}
            className="mx-auto mt-2 max-h-[calc(100dvh-6rem)] max-w-[1100px] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-surface/95 p-3 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              <Link
                to="/features"
                onClick={() => closeMenu("route")}
                className={menuItem}
                activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
              >
                <span>What it does</span>
                <span className="text-xs text-muted-foreground font-mono">01</span>
              </Link>
              <Link
                to="/screens"
                onClick={() => closeMenu("route")}
                className={menuItem}
                activeProps={{ className: "text-foreground bg-surface-2 font-semibold border border-white/10" }}
              >
                <span>Screens</span>
                <span className="text-xs text-muted-foreground font-mono">02</span>
              </Link>
              <Link
                to="/privacy"
                onClick={() => closeMenu("route")}
                className={menuItem}
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
                onClick={() => closeMenu("route")}
                className={menuItem}
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
                onClick={() => closeMenu("external")}
                className={`${menuItem} mt-1 border-t border-white/5 pt-3 text-muted-foreground`}
              >
                <span className="flex items-center gap-2">
                  <Github className="size-4" />
                  <span>GitHub Repository</span>
                </span>
                <span className="text-xs text-muted-foreground font-mono">v{SITE.apk.version}</span>
              </a>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-10">
      <div className="glass-surface mx-auto flex max-w-[1100px] flex-col gap-6 rounded-2xl p-6 text-[13.5px] text-faint sm:flex-row sm:items-center sm:justify-between sm:gap-x-8 sm:gap-y-2">
        <div className="flex items-center gap-3">
          <SparkMark className="size-5 shrink-0 opacity-80" />
          <p>© {new Date().getFullYear()} {SITE.author} · MIT License</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1">
          <Link to="/download" className={footerLink}>
            <Download className="size-4" /> Download
          </Link>
          <a href={SITE.repo} target="_blank" rel="noreferrer" className={footerLink}>
            <Github className="size-4" /> Source
          </a>
          <Link to="/privacy" className={footerLink}>
            <ShieldCheck className="size-4" /> Privacy
          </Link>
          <a href={SITE.issues} target="_blank" rel="noreferrer" className={footerLink}>
            <Bug className="size-4" /> Report an issue
          </a>
        </div>
      </div>
    </footer>
  );
}
