import { createFileRoute } from "@tanstack/react-router";
import {
  PixelAndroid,
  PixelCheckCircle,
  PixelDownload,
  PixelGithub,
  PixelShieldCheck,
} from "@/components/ui/pixel-icon";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SITE, siteUrl } from "@/lib/site";

const title = "Download Daily Spark - Android APK";
const description = `Download the official Daily Spark ${SITE.apk.version} Android APK (${SITE.apk.size}). Free, offline habit tracking with no account, ads, or tracking. Android only.`;

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
    body: `Tap the button above. You get ${SITE.apk.filename} - ${SITE.apk.size}, straight from GitHub Releases.`,
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
          Daily Spark ships as a single Android APK. Free, offline-first, and it never asks for an account.
        </p>

        {/* Primary install card */}
        <section className="glass-panel glass-sheen mt-10 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-ember">
            <PixelAndroid aria-hidden="true" className="size-4" />
            <span>Android only</span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={SITE.apk.url}
              download={SITE.apk.filename}
              className="inline-flex h-[52px] sm:h-[54px] w-full sm:w-auto items-center justify-center gap-3 rounded-full cta-solid px-7 text-left transition-all hover:scale-[1.02]"
            >
              <PixelDownload aria-hidden="true" className="size-5 sm:size-6" />
              <span className="leading-none">
                <span className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-cta-foreground/90">
                  Download APK
                </span>
                <span className="mt-0.5 block font-display text-[17px] sm:text-[19px] font-bold tracking-wide">
                  Direct Install
                </span>
              </span>
            </a>
            <a
              href={SITE.releases}
              target="_blank"
              rel="noreferrer"
              className="glass-pill inline-flex h-[52px] sm:h-[54px] w-full sm:w-auto items-center justify-center gap-3 rounded-full px-7 text-left transition-all hover:scale-[1.02]"
            >
              <PixelGithub aria-hidden="true" className="size-5 sm:size-6" />
              <span className="leading-none">
                <span className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                  View on
                </span>
                <span className="mt-0.5 block font-display text-[17px] sm:text-[19px] font-semibold tracking-wide">
                  GitHub Releases
                </span>
              </span>
            </a>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-5 text-sm sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="text-faint">Version</dt>
              <dd className="text-muted-foreground">{SITE.apk.version}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="text-faint">Download size</dt>
              <dd className="text-muted-foreground">{SITE.apk.size}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:col-span-2 sm:mt-1 sm:block">
              <dt className="text-faint">File</dt>
              <dd className="break-all text-muted-foreground">{SITE.apk.filename}</dd>
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

        {/* iOS / other platforms */}
        <section className="glass-surface mt-12 rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide">On iPhone, iPad, or the web</h2>
          <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
            There is no iOS build and no web app yet, so the Android APK is the only release today. Web and iOS versions
            are planned for a later phase; announcements will land on{" "}
            <a href={SITE.releases} target="_blank" rel="noreferrer" className="text-ember hover:underline">
              GitHub Releases
            </a>
            .
          </p>
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
