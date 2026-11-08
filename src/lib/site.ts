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

const origin = typeof window !== "undefined" ? window.location.origin : "https://sahaya-savari.gitlab.io";
// Dynamic base path support for both root unique domains and subpath deployments.
const rawBase = typeof import.meta.env?.BASE_URL === "string" ? import.meta.env.BASE_URL : "/daily-spark/";
const basePath = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export const SITE = {
  name: "Daily Spark",
  // Canonical site root, without a trailing slash.
  url: `${origin}${basePath.slice(0, -1)}`,
  // Host-absolute base path ("/daily-spark/"). Use this for asset hrefs: it
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
  apk: {
    // Latest *published* release, verified against the GitHub Releases API.
    // Source of truth for every download label on the site. Update only after
    // a release exists at
    // https://github.com/sahaya-savari/daily-spark/releases/latest
    version: "v1.0.1",
    // Direct same-origin asset path served straight from GitHub Pages with zero 302 redirects.
    // Eliminates mobile Chrome duplicate/triple download loops caused by cloud storage redirect hops.
    url: `${basePath}Daily-Spark-v1.0.1.apk`,
    // GitHub Releases URL for external managers (Obtainium, F-Droid metadata, direct releases)
    githubReleaseUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.1/Daily-Spark-v1.0.1.apk",
    filename: "Daily-Spark-v1.0.1.apk",
    // Exact universal release APK size: 4,442,803 bytes (~4.2 MB).
    size: "4.2 MB",
  },
  desktop: {
    windowsZip: `${basePath}Daily-Spark-v1.0.1-windows.zip`,
    windowsExe: `${basePath}Daily-Spark-v1.0.1-windows.exe`,
    linuxTarGz: `${basePath}Daily-Spark-v1.0.1-linux.tar.gz`,
    githubWindowsUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.1/Daily-Spark-v1.0.1-windows.zip",
    githubLinuxUrl: "https://github.com/sahaya-savari/daily-spark/releases/download/v1.0.1/Daily-Spark-v1.0.1-linux.tar.gz",
  },
  // The website's own unreleased version. Mirrors "version" in package.json;
  // do not surface it next to the APK download. The download UI must use
  // SITE.apk.version instead.
  webVersion: "1.0.1",
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
