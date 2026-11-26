/**
 * Public product links and version truth.
 *
 * Three version-bearing surfaces exist; keep them distinct:
 * - `package.json` -> the website's own version, bumped for site builds.
 * - `SITE.webVersion` -> mirrors `package.json`. It is the *unreleased*
 *   development version and is never used to describe the downloadable app.
 * - `SITE.apk.*` -> the latest *published* GitHub release. Every user-facing
 *   download label (version, filename, size, URL) must come from here so the
 *   site can never advertise a build that does not exist.
 */

const origin = typeof window !== "undefined"
  ? window.location.origin
  : (typeof import.meta.env?.VITE_SITE_ORIGIN === "string" ? import.meta.env.VITE_SITE_ORIGIN : "https://dailyspark.sahayasavari.dev");
// Dynamic base path support for both root unique domains and subpath deployments.
const rawBase = typeof import.meta.env?.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";
const basePath = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export const SITE = {
  name: "Daily Spark",
  // Canonical site root, without a trailing slash.
  url: `${origin}${basePath.slice(0, -1)}`,
  // Host-absolute base path ("/" or "/daily-spark/"). Use this for asset hrefs: it
  // resolves correctly from any route depth, in dev and in production.
  basePath,
  repo: "https://github.com/sahaya-savari/daily-spark",
  issues: "https://github.com/sahaya-savari/daily-spark/issues",
  releases: "https://github.com/sahaya-savari/daily-spark/releases",
  author: "sahaya-savari",
  authorUrl: "https://github.com/sahaya-savari",
  gitlab: {
    repo: "https://gitlab.com/sahaya-savari/daily-spark",
    releases: "https://gitlab.com/sahaya-savari/daily-spark/-/releases",
    packages: "https://gitlab.com/sahaya-savari/daily-spark/-/packages",
    issues: "https://gitlab.com/sahaya-savari/daily-spark/-/issues",
    authorUrl: "https://gitlab.com/sahaya-savari",
    apkUrl: "https://gitlab.com/sahaya-savari/daily-spark/-/packages",
  },
  fdroid: {
    url: "https://f-droid.org/packages/com.santhosh.dailyspark2/",
    mrUrl: "https://gitlab.com/fdroid/fdroiddata/-/merge_requests",
    status: "pending",
  },
  izzyondroid: {
    url: "https://apt.izzysoft.de/fdroid/index/apk/com.santhosh.dailyspark2",
  },
  apk: {
    // Latest *published* release, verified against the GitHub Releases API.
    // Keep this version, filename, and size aligned with the published asset.
    version: "v1.0.2",
    // Download the verified release asset from this site's own origin.
    url: `${basePath}Daily-Spark-v1.0.2.apk`,
    githubReleaseUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.2/Daily-Spark-v1.0.2.apk",
    filename: "Daily-Spark-v1.0.2.apk",
    // Exact release asset size: 5,017,178 bytes (about 4.8 MiB).
    sizeBytes: 5017178,
    size: "4.8 MB",
  },
  desktop: {
    version: "v1.0.2",
    windowsZip: `${basePath}Daily-Spark-v1.0.2-windows.zip`,
    windowsExe: `${basePath}Daily-Spark-v1.0.2-windows.exe`,
    linuxTarGz: `${basePath}Daily-Spark-v1.0.2-linux.tar.gz`,
    windowsZipFilename: "Daily-Spark-v1.0.2-windows.zip",
    linuxTarGzFilename: "Daily-Spark-v1.0.2-linux.tar.gz",
    githubWindowsUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.2/Daily-Spark-v1.0.2-windows.zip",
    githubLinuxUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.2/Daily-Spark-v1.0.2-linux.tar.gz",
  },
  // The website's own unreleased version. Mirrors "version" in package.json;
  // do not surface it next to the APK download. The download UI must use
  // SITE.apk.version instead.
  webVersion: "1.0.2",
  // Social preview card, 1200x630 PNG. Source document lives at
  // og/og-card.html (outside public/ so it is never served); re-render it to
  // public/og-image.png after editing.
  ogImage: `${origin}${basePath}og-image.png`,
  ogImageAlt: "Daily Spark social card: the app name beside a glowing ember spark mark.",
} as const;

/**
 * Absolute URL for a route on the site.
 *
 * `siteUrl()` -> the site root; `siteUrl("/features")` ->
 * https://sahaya-savari.github.io/daily-spark/features/
 *
 * The trailing slash is intentional: GitHub Pages serves each route from its
 * own directory, so `/features/` is the canonical form (both for canonicals and
 * for og:url). Paths that look like files keep their exact form.
 */
export function siteUrl(path = ""): string {
  const base = SITE.url;
  if (!path || path === "/") return `${base}/`;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  const isFile = /\.[a-z0-9]+$/i.test(normalised);
  return `${base}${normalised}${isFile || normalised.endsWith("/") ? "" : "/"}`;
}

export { default as SITE_FAQS } from "./site-faq.json";
