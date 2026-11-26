import fs from 'fs';
import path from 'path';

/**
 * Post-build HTML generation for GitHub Pages.
 *
 * The site is a client-only SPA, so every URL is served the same Vite-generated
 * `dist/index.html`. Two things follow from that:
 *
 * 1. Each route needs its own static <head> so non-JS crawlers and link
 *    unfurlers see the right title/description/canonical. We rewrite the block
 *    between `<!--seo:start-->` and `<!--seo:end-->` per route.
 * 2. Asset URLs must be host-absolute ("/daily-spark/..."), because
 *    "/features/index.html" would otherwise resolve "./manifest.webmanifest"
 *    against the route directory and 404.
 */

const dist = path.resolve(import.meta.dirname, '../dist');
const indexHtmlPath = path.join(dist, 'index.html');
const notFoundHtmlPath = path.join(dist, '404.html');
const ogCardSource = path.join(dist, 'og-card.html');
const faqSourcePath = path.resolve(import.meta.dirname, '../src/lib/site-faq.json');

// Keep in sync with `base` in vite.config.ts and SITE.basePath in src/lib/site.ts.
const BASE_PATH = process.env.VITE_BASE_PATH ?? (process.env.GITLAB_CI ? '/daily-spark/' : '/');
const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN ?? (process.env.GITLAB_CI ? 'https://sahaya-savari.gitlab.io' : 'https://dailyspark.sahayasavari.dev');
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`}`;

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
const FALLBACK_BLOCK = /<!--fallback:start-->[\s\S]*?<!--fallback:end-->/;

const HOME_DESCRIPTION =
  'A free, offline-first habit tracker for Android and the web. Track daily habits, streaks and progress without an account, ads or analytics. Optional encrypted backups.';
const APK_FILENAME = 'Daily-Spark-v1.0.2.apk';
const APK_SIZE_BYTES = 4289238;
// Keep in sync with SITE.desktop.version in src/lib/site.ts.
const DESKTOP_VERSION = 'v1.0.1';
const WINDOWS_ZIP_FILENAME = `Daily-Spark-${DESKTOP_VERSION}-windows.zip`;
const LINUX_TAR_GZ_FILENAME = `Daily-Spark-${DESKTOP_VERSION}-linux.tar.gz`;
const SITE_FAQS = JSON.parse(fs.readFileSync(faqSourcePath, 'utf8'));

/** HTML-escape text used inside attribute values and <title>. */
function esc(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fallbackPage(title, content) {
  return `<noscript>
      <main style="max-width:48rem;margin:0 auto;padding:2rem 1.25rem;color:#f0f0f4;background:#0e0f12;font:16px/1.6 system-ui,sans-serif">
        <h1 style="font-size:2rem;line-height:1.15">${esc(title)}</h1>
        ${content}
      </main>
    </noscript>`;
}

const faqFallback = SITE_FAQS.map(({ question, answer }) =>
  `<section><h2>${esc(question)}</h2><p>${esc(answer)}</p></section>`,
).join('\n');

const homeFallback = fallbackPage(
  'Daily Spark: free offline-first habit tracker',
  `<p>Daily Spark helps you track small daily habits, check-ins, streaks and progress on Android or the web. Core tracking works offline. There is no Daily Spark account, advertising, or analytics.</p>
        <p>Your data stays local by default. You can optionally export an encrypted vault and move it yourself; Daily Spark does not run an automatic sync server.</p>
        <p><a href="${BASE_PATH}download/" style="color:#ec894c">Download Daily Spark</a> · <a href="${BASE_PATH}#features" style="color:#ec894c">Explore features</a> · <a href="${BASE_PATH}privacy/" style="color:#ec894c">Read the privacy details</a></p>
        <h2>Frequently asked questions</h2>${faqFallback}`,
);

const featuresFallback = fallbackPage(
  'Daily Spark habit tracker features',
  `<p>Daily Spark includes daily check-ins, habit schedules, streaks, calendar and progress views, reminders, and local data storage. Optional encrypted vault exports let you move a backup between devices.</p>
        <p><a href="${BASE_PATH}#screens" style="color:#ec894c">Browse interface previews</a> · <a href="${BASE_PATH}download/" style="color:#ec894c">Download the app</a></p>`,
);

const screensFallback = fallbackPage(
  'Daily Spark screens and layouts',
  `<p>Preview the Today, habit setup, schedules, progress, calendar, settings, and backup screens, plus the full desktop workspace rather than a stretched phone layout. Some planner and widget previews are optional or in development and may differ from the latest released APK.</p>
        <p><a href="${BASE_PATH}#features" style="color:#ec894c">Explore features</a> · <a href="${BASE_PATH}download/" style="color:#ec894c">Download the app</a></p>`,
);

const downloadFallback = fallbackPage(
  'Download Daily Spark for Android, Web, Windows and Linux',
  `<p>Download the official Daily Spark v1.0.2 Android APK (${(APK_SIZE_BYTES / 1024 / 1024).toFixed(1)} MB). Core habit tracking works offline and does not require a Daily Spark account.</p>
        <p><a href="${BASE_PATH}${APK_FILENAME}" download style="color:#ec894c">Download the Android APK</a></p>
        <p>For desktop, open the current <a href="${BASE_PATH}app" style="color:#ec894c">Web App</a>, or download the Windows and Linux packages below. Both desktop packages are ${DESKTOP_VERSION}; each includes a launcher and offline assets, then opens the full desktop workspace in your browser. They are not native desktop windows. No macOS package is published yet.</p>
        <ul>
          <li><a href="${BASE_PATH}${WINDOWS_ZIP_FILENAME}" download style="color:#ec894c">Download Windows portable ZIP (${DESKTOP_VERSION})</a></li>
          <li><a href="${BASE_PATH}${LINUX_TAR_GZ_FILENAME}" download style="color:#ec894c">Download Linux portable archive (${DESKTOP_VERSION})</a></li>
        </ul>
        <p>To install the APK, open the downloaded file and approve installation for your browser when Android asks. Optional encrypted vault exports can be moved between devices.</p>`,
);

const privacyFallback = fallbackPage(
  'Daily Spark privacy',
  `<p>Habit data is stored locally in the app or browser by default. Daily Spark has no account system, advertising, or analytics, and does not run a habit-data sync server.</p>
        <p>If you choose to export an encrypted vault, encryption happens on your device with your passphrase. You choose where to save or transfer that file; the storage provider's own privacy terms apply.</p>
        <p><a href="${BASE_PATH}#get" style="color:#ec894c">Get Daily Spark</a></p>`,
);

const getFallback = fallbackPage(
  'Download Daily Spark',
  `<p>JavaScript is required for the automatic redirect. You can <a href="${BASE_PATH}${APK_FILENAME}" download style="color:#ec894c">download the Android APK directly</a> or visit the <a href="${BASE_PATH}download/" style="color:#ec894c">download page</a>.</p>`,
);

const offlineFallback = fallbackPage(
  'Daily Spark offline',
  `<p>Core habit tracking works offline after the app is installed or the web app has been loaded. Downloads and user-started backup transfers need a connection or another transfer method.</p>
        <p><a href="${BASE_PATH}" style="color:#ec894c">Return to Daily Spark</a></p>`,
);

const notFoundFallback = fallbackPage(
  'Page not found',
  `<p>This Daily Spark page could not be found.</p><p><a href="${BASE_PATH}" style="color:#ec894c">Return to the home page</a> · <a href="${BASE_PATH}download/" style="color:#ec894c">Download the app</a></p>`,
);

/**
 * One <head> block per route. `canonical` doubles as og:url.
 * `noindex: true` is for redirect stubs and the 404 page: they must never be
 * indexed and must never advertise a canonical URL.
 */
const ROUTES = {
  '/': {
    preload: ['LandingPage'],
    title: 'Daily Spark | Free Offline Habit Tracker',
    description: HOME_DESCRIPTION,
    ogTitle: 'Daily Spark - Show up. Tick it. Keep going.',
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    faqPage: true,
    fallback: homeFallback,
  },
  // `/features` and `/screens` render the same body as `/` (they are deep links
  // into its sections), so they share the homepage's canonical rather than
  // competing as three near-identical pages. Both keep their own `title` and
  // `description` for browser tabs and unfurls.
  '/features': {
    preload: ['LandingPage'],
    title: 'Features - Daily Spark',
    description:
      "Explore Daily Spark's daily check-ins, schedules, reminders, streaks, calendar progress, and local-first data storage. Optional encrypted exports help you move a backup between devices.",
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    faqPage: true,
    fallback: featuresFallback,
  },
  '/screens': {
    preload: ['LandingPage', 'ScreensGallery'],
    title: 'Screens & Layouts - Daily Spark',
    description:
      "Preview Daily Spark's mobile screens and full desktop workspace, plus optional planner and widget previews. Feature availability varies by app release.",
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    faqPage: true,
    fallback: screensFallback,
  },
  '/download': {
    title: 'Download Daily Spark for Android, Web, Windows and Linux',
    // Keep these values identical to SITE.apk in src/lib/site.ts and the
    // SoftwareApplication JSON-LD in index.html; they describe the published
    // APK, not the website's own version.
    description:
      'Download Daily Spark v1.0.2 for Android, use the current Web App, or get v1.0.1 desktop packages for Windows and Linux. macOS is not yet available.',
    canonical: `${SITE_URL}download/`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    fallback: downloadFallback,
  },
  '/app': {
    title: 'Daily Spark App',
    description: 'Open the calm, local-first Daily Spark habit tracker.',
    noindex: true,
    preload: ['DailySparkApp'],
    fallback: fallbackPage('Daily Spark App', '<p>Enable JavaScript to open your local habit tracker.</p>'),
  },
  '/privacy': {
    title: 'Privacy - Daily Spark',
    description:
      'Daily Spark stores habit data locally by default and has no account, ads, or analytics. Optional encrypted vault exports can be saved where you choose.',
    canonical: `${SITE_URL}privacy/`,
    ogType: 'article',
    twitterCard: 'summary',
    fallback: privacyFallback,
  },
  // Redirect stubs: real routes exist only so the SPA can navigate, and the
  // static copies exist so GitHub Pages returns 200 instead of 404.
  '/get': {
    title: 'Redirecting - Daily Spark',
    noindex: true,
    fallback: getFallback,
  },
  '/offline': {
    title: 'Offline - Daily Spark',
    description:
      'Core Daily Spark habit tracking works offline after installation or the first web app load. Optional backup transfers are user-started.',
    canonical: `${SITE_URL}offline/`,
    noindex: true,
    fallback: offlineFallback,
  },
  '/404': {
    title: 'Page not found - Daily Spark',
    noindex: true,
    fallback: notFoundFallback,
  },
};

function seoBlock(route) {
  const lines = [`    <title>${esc(route.title)}</title>`];

  if (route.noindex) {
    // Deliberately NOT marked `data-ssg-seo`: the inline cleanup script runs
    // before the app mounts and would remove it, dropping the noindex.
    lines.push('    <meta name="robots" content="noindex" />');
    return lines.join('\n');
  }

  const ogTitle = route.ogTitle ?? route.title;
  const ogDescription = route.description;
  const canonical = route.canonical;

  lines.push(
    `    <meta data-ssg-seo name="description" content="${esc(route.description)}" />`,
    `    <link data-ssg-seo rel="canonical" href="${esc(canonical)}" />`,
    `    <meta data-ssg-seo property="og:type" content="${esc(route.ogType ?? 'website')}" />`,
    `    <meta data-ssg-seo property="og:title" content="${esc(ogTitle)}" />`,
    `    <meta data-ssg-seo property="og:description" content="${esc(ogDescription)}" />`,
    `    <meta data-ssg-seo property="og:url" content="${esc(canonical)}" />`,
    `    <meta data-ssg-seo name="twitter:card" content="${esc(route.twitterCard ?? 'summary_large_image')}" />`,
    `    <meta data-ssg-seo name="twitter:title" content="${esc(ogTitle)}" />`,
    `    <meta data-ssg-seo name="twitter:description" content="${esc(ogDescription)}" />`,
  );

  if (route.faqPage) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SITE_FAQS.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    };
    lines.push(
      `    <script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, '\\u003c')}</script>`,
    );
  }

  return lines.join('\n');
}

/** Make public-asset URLs host-absolute so nested route files resolve them. */
function absolutizeAssets(html) {
  const prefix = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;
  return html.replace(/(\s(?:href|src))="\.\//g, `$1="${prefix}`);
}

function renderRoute(template, route) {
  if (!SEO_BLOCK.test(template)) {
    throw new Error(
      'index.html is missing the <!--seo:start--> / <!--seo:end--> block; refusing to emit generic per-route heads.',
    );
  }
  if (!FALLBACK_BLOCK.test(template)) {
    throw new Error(
      'index.html is missing the <!--fallback:start--> / <!--fallback:end--> block; refusing to emit empty no-JavaScript route bodies.',
    );
  }
  let rendered = absolutizeAssets(
    template
      .replace(SEO_BLOCK, `<!--seo:start-->\n${seoBlock(route)}\n    <!--seo:end-->`)
      .replace(FALLBACK_BLOCK, route.fallback),
  );
  // Discover the route's large lazy module while the document is being parsed,
  // instead of waiting for the router and its Suspense wrapper to execute.
  const assets = fs.readdirSync(path.join(dist, 'assets'));
  const preloads = (route.preload ?? []).map((name) => {
    const filename = assets.find((file) => file.startsWith(`${name}-`) && file.endsWith('.js'));
    if (!filename) throw new Error(`Missing production chunk for ${name}`);
    return `    <link rel="modulepreload" href="${BASE_PATH}assets/${filename}" />`;
  });
  for (const family of ['inter-latin-', 'jetbrains-mono-latin-']) {
    const font = assets.find((file) => file.startsWith(family) && file.endsWith('.woff2'));
    if (font) preloads.push(`    <link rel="preload" href="${BASE_PATH}assets/${font}" as="font" type="font/woff2" crossorigin />`);
  }
  rendered = rendered.replace('</head>', `${preloads.join('\n')}\n  </head>`);
  rendered = rendered
    .replace(/__SITE_APK_URL__/g, `${SITE_URL}${APK_FILENAME}`)
    .replace(/__SITE_APK_SIZE_BYTES__/g, String(APK_SIZE_BYTES));
  if (SITE_URL !== 'https://dailyspark.sahayasavari.dev/') {
    rendered = rendered.replace(/https:\/\/dailyspark\.sahayasavari\.dev\//g, SITE_URL);
  }
  return rendered;
}

if (!fs.existsSync(indexHtmlPath)) {
  console.error('✗ dist/index.html not found - run the Vite build first.');
  process.exit(1);
}

// Safety net only: the OG card source lives in og/ (outside public/) and is
// never copied into dist/. Remove any stray copy so it can't be served.
if (fs.existsSync(ogCardSource)) {
  fs.rmSync(ogCardSource);
  console.log('✓ Removed stray dist/og-card.html');
}

const template = fs.readFileSync(indexHtmlPath, 'utf8');

const ROUTE_DIRS = {
  '/app': 'app',
  '/features': 'features',
  '/screens': 'screens',
  '/download': 'download',
  '/privacy': 'privacy',
  '/get': 'get',
  '/offline': 'offline',
};

for (const [route, dir] of Object.entries(ROUTE_DIRS)) {
  const targetDir = path.join(dist, dir);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), renderRoute(template, ROUTES[route]));
}

fs.writeFileSync(indexHtmlPath, renderRoute(template, ROUTES['/']));
fs.writeFileSync(notFoundHtmlPath, renderRoute(template, ROUTES['/404']));

// Synchronize PWA manifest for subpath environments (e.g. GitLab Pages)
const manifestPath = path.join(dist, 'manifest.webmanifest');
if (fs.existsSync(manifestPath) && BASE_PATH !== '/') {
  const prefix = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.id = prefix;
  manifest.start_url = prefix;
  manifest.scope = prefix;
  if (Array.isArray(manifest.shortcuts)) {
    manifest.shortcuts.forEach((sc) => {
      if (sc.url) sc.url = sc.url.replace(/^\//, prefix);
      if (Array.isArray(sc.icons)) {
        sc.icons.forEach((ic) => {
          if (ic.src) ic.src = ic.src.replace(/^\//, prefix);
        });
      }
    });
  }
  if (Array.isArray(manifest.icons)) {
    manifest.icons.forEach((ic) => {
      if (ic.src) ic.src = ic.src.replace(/^\//, prefix);
    });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Synchronized dist/manifest.webmanifest with base path ${prefix}`);
}

// Synchronize sitemap.xml and robots.txt if building for non-custom-domain
const sitemapPath = path.join(dist, 'sitemap.xml');
if (fs.existsSync(sitemapPath) && SITE_URL !== 'https://dailyspark.sahayasavari.dev/') {
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  sitemapContent = sitemapContent.replace(/https:\/\/dailyspark\.sahayasavari\.dev\//g, SITE_URL);
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`✓ Synchronized dist/sitemap.xml with origin ${SITE_URL}`);
}

const robotsPath = path.join(dist, 'robots.txt');
if (fs.existsSync(robotsPath) && SITE_URL !== 'https://dailyspark.sahayasavari.dev/') {
  let robotsContent = fs.readFileSync(robotsPath, 'utf8');
  robotsContent = robotsContent.replace(/https:\/\/dailyspark\.sahayasavari\.dev\//g, SITE_URL);
  fs.writeFileSync(robotsPath, robotsContent);
  console.log(`✓ Synchronized dist/robots.txt with sitemap ${SITE_URL}sitemap.xml`);
}

// Ensure dist/CNAME is present for GitHub Pages deployment
const cnameDist = path.join(dist, 'CNAME');
if (!fs.existsSync(cnameDist) && !process.env.GITLAB_CI) {
  fs.writeFileSync(cnameDist, 'dailyspark.sahayasavari.dev\n', 'utf8');
  console.log('✓ Ensured dist/CNAME exists for GitHub Pages custom domain');
}

console.log(`✓ Wrote per-route static heads for: ${Object.keys(ROUTE_DIRS).join(', ')}`);
console.log('✓ Created dist/404.html (noindex, no canonical) for GitHub Pages SPA routing');
