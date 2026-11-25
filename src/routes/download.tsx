import { createFileRoute } from "@tanstack/react-router";
import {
  PixelAndroid,
  PixelCheckCircle,
  PixelDownload,
  PixelGithub,
  PixelGitlab,
  PixelFdroid,
  PixelShieldCheck,
} from "@/components/ui/pixel-icon";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { DownloadApkButton } from "@/components/ui/DownloadApkButton";
import { SITE, siteUrl } from "@/lib/site";
import { PlatformDownloadGrid } from "@/components/landing/PlatformDownloadGrid";

const title = "Download Daily Spark for Android, Web, Windows and Linux";
const description = "Download Daily Spark for Android or choose the web, Windows, or Linux version. Offline-first habit tracking with no account, ads, or analytics; optional encrypted exports.";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl("/download") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: siteUrl("/download") }],
  }),
  component: Download,
});

const STEPS = [
  {
    title: "Download the APK",
    body: `Tap the button above. You get ${SITE.apk.filename} - ${SITE.apk.size}, downloaded directly from this website.`,
  },
  {
    title: "Open the file",
    body: "Android will ask whether your browser may install apps. Allow it for this one install, then confirm.",
  },
  {
    title: "Start tracking",
    body: "Launch Daily Spark and add your first habit. There is no sign-up, no email, and nothing to verify.",
  },
] as const;

function Download() {
  return (
    <div className="min-h-screen bg-background w-full max-w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-ember focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20 w-full outline-none">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">Download</h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
          Choose the version that fits your device. Every option keeps the same calm, local-first experience.
        </p>

        <section aria-labelledby="platforms-title" className="mt-8 sm:mt-10">
          <h2 id="platforms-title" className="sr-only">Choose your platform</h2>
          <PlatformDownloadGrid />
        </section>

        {/* Primary install card */}
        <section className="glass-panel glass-sheen mt-8 rounded-3xl p-6 sm:p-9 border border-white/10">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-ember">
            <PixelAndroid aria-hidden="true" className="size-4" />
            <span>Official Android APK</span>
          </div>

          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">
            Daily Spark for Android
          </h2>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Direct same-origin APK download with no external redirect or Daily Spark account required.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <DownloadApkButton
              className="inline-flex h-[54px] sm:h-[58px] items-center justify-center gap-3 rounded-full cta-solid px-8 text-base sm:text-[17px] font-bold transition-all hover:scale-[1.02] shadow-lg shadow-ember/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <PixelDownload aria-hidden="true" className="size-5 sm:size-6" />
              <span>Download APK ({SITE.apk.size})</span>
            </DownloadApkButton>

            <a
              href={SITE.gitlab.releases}
              target="_blank"
              rel="noreferrer"
              className="glass-pill inline-flex h-[54px] sm:h-[58px] items-center justify-center gap-2.5 rounded-full border border-white/10 bg-surface/70 px-6 text-sm sm:text-[15px] font-semibold text-foreground transition-all hover:scale-[1.02] hover:border-[#FC6D26]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <PixelGitlab aria-hidden="true" className="size-5 text-[#FC6D26] shrink-0" />
              <span>GitLab Releases</span>
            </a>

            <a
              href={`${SITE.repo}/blob/main/.fdroid.yml`}
              target="_blank"
              rel="noreferrer"
              className="glass-pill inline-flex h-[54px] sm:h-[58px] items-center justify-center gap-2.5 rounded-full border border-white/10 bg-surface/70 px-6 text-sm sm:text-[15px] font-semibold text-foreground transition-all hover:scale-[1.02] hover:border-[#1976D2]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              title="Official F-Droid Open Source Catalog (Pending Review)"
            >
              <PixelFdroid aria-hidden="true" className="size-5 text-[#1976D2] shrink-0" />
              <span>F-Droid</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1976D2]/20 text-[#64B5F6] border border-[#1976D2]/30">Pending</span>
            </a>

            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="glass-pill inline-flex h-[54px] sm:h-[58px] items-center justify-center gap-2.5 rounded-full border border-white/10 bg-surface/70 px-6 text-sm sm:text-[15px] font-semibold text-muted-foreground hover:text-foreground transition-all hover:scale-[1.02] hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <PixelGithub aria-hidden="true" className="size-5 shrink-0" />
              <span>GitHub Releases</span>
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint font-semibold">Version</dt>
              <dd className="mt-1 text-foreground font-semibold font-mono text-sm">{SITE.apk.version}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint font-semibold">File Size</dt>
              <dd className="mt-1 text-foreground font-semibold">{SITE.apk.size}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint font-semibold">Architecture</dt>
              <dd className="mt-1 text-foreground font-semibold">Universal (arm64, x86)</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint font-semibold">Privacy</dt>
              <dd className="mt-1 text-emerald-400 font-semibold">Offline-first</dd>
            </div>
          </dl>
        </section>

        {/* Install steps */}
        <section className="mt-12">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-wide">How to install</h2>
          <ol className="mt-5 space-y-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 border-t border-border py-5 first:border-t-0 first:pt-0">
                <span className="grid size-8 flex-none place-items-center rounded-full border border-white/10 bg-surface-2/80 font-display text-sm text-ember">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold tracking-wide">{step.title}</h3>
                  <p className="mt-1.5 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Alternative Android Installers: Obtainium & F-Droid */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass-surface rounded-2xl p-5 sm:p-6">
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
              Obtainium (Recommended)
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track and auto-update Daily Spark directly from GitHub Releases with zero third-party tracking.
            </p>
            <a
              href="https://github.com/ImranR98/Obtainium"
              target="_blank"
              rel="noreferrer"
              className="mt-3.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ember hover:underline"
            >
              Get Obtainium setup guide →
            </a>
          </div>

          <div className="glass-surface rounded-2xl p-5 sm:p-6">
            <h3 id="fdroid" className="font-display text-base sm:text-lg font-bold text-foreground">
              F-Droid Compatible
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Built from 100% open source code. Clean reproducible build recipe (.fdroid.yml) ready for F-Droid repositories.
            </p>
            <a
              href="https://github.com/sahaya-savari/daily-spark/blob/main/.fdroid.yml"
              target="_blank"
              rel="noreferrer"
              className="mt-3.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ember hover:underline"
            >
              View .fdroid.yml build recipe →
            </a>
          </div>
        </section>

        {/* Windows, Linux, and Web Desktop Standalone */}
        <section className="glass-surface mt-8 rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide">Desktop Standalone (Windows &amp; Linux)</h2>
          <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
            Daily Spark runs as a standalone desktop application on Windows and Linux with zero cloud requirements, 100% offline local persistence, and dedicated desktop workspace.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={SITE.desktop.windowsZip}
              download="Daily-Spark-v1.0.1-windows.zip"
              className="glass-pill flex items-center justify-between p-3.5 rounded-xl border border-white/10 hover:border-ember/40 transition-all text-left"
            >
              <div>
                <p className="font-sans font-semibold text-sm text-foreground">Windows Portable (.zip)</p>
                <p className="text-xs text-muted-foreground">v1.0.1 · Standalone .exe + assets (Direct)</p>
              </div>
              <PixelDownload className="size-4 text-ember shrink-0" />
            </a>

            <a
              href={SITE.desktop.linuxTarGz}
              download="Daily-Spark-v1.0.1-linux.tar.gz"
              className="glass-pill flex items-center justify-between p-3.5 rounded-xl border border-white/10 hover:border-ember/40 transition-all text-left"
            >
              <div>
                <p className="font-sans font-semibold text-sm text-foreground">Linux Standalone (.tar.gz)</p>
                <p className="text-xs text-muted-foreground">v1.0.1 · Native launcher + .desktop (Direct)</p>
              </div>
              <PixelDownload className="size-4 text-ember shrink-0" />
            </a>
          </div>
        </section>

        {/* Privacy / provenance */}
        <section className="glass-surface mt-8 rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg sm:text-xl font-semibold tracking-wide">
            <PixelShieldCheck aria-hidden="true" className="size-5 text-ember" />
            What you are installing
          </h2>
          <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
            {SITE.apk.filename} is the same file published on GitHub Releases - no bundling, no extra permissions added by
            this site. The app has no account system, no analytics, and no ads, so your habits stay on your phone.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["No account or sign-up", "Works fully offline", "No ads, analytics, or tracking"].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <PixelCheckCircle aria-hidden="true" className="mt-0.5 size-4 flex-none text-ember" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a href={SITE.issues} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-ember hover:underline">
            Something not working? Open an issue on GitHub →
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
