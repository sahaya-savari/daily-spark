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

// Keep in sync with `base` in vite.config.ts and SITE.basePath in src/lib/site.ts.
const BASE_PATH = process.env.VITE_BASE_PATH ?? (process.env.GITLAB_CI ? '/daily-spark/' : '/');
const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN ?? (process.env.GITLAB_CI ? 'https://sahaya-savari.gitlab.io' : 'https://dailyspark.sahayasavari.dev');
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`}`;

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

const HOME_DESCRIPTION =
  'Track one small action a day. Daily Spark is a free, offline-first habit and streak tracker. No account, no ads, no tracking. Download the Android APK.';

/** HTML-escape text used inside attribute values and <title>. */
function esc(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * One <head> block per route. `canonical` doubles as og:url.
 * `noindex: true` is for redirect stubs and the 404 page: they must never be
 * indexed and must never advertise a canonical URL.
 */
const ROUTES = {
  '/': {
    title: 'Daily Spark - Calm, offline habit tracker',
    description: HOME_DESCRIPTION,
    ogTitle: 'Daily Spark - Show up. Tick it. Keep going.',
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  // `/features` and `/screens` render the same body as `/` (they are deep links
  // into its sections), so they share the homepage's canonical rather than
  // competing as three near-identical pages. Both keep their own `title` and
  // `description` for browser tabs and unfurls.
  '/features': {
    title: 'Features - Daily Spark',
    description:
      'Explore Daily Spark features: streaks, calendar heatmap, custom icons, reminders, and full local backup.',
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/screens': {
    title: 'Screens & Layouts - Daily Spark',
    description:
      'Take a look at the calm, high-contrast layouts of Daily Spark: Today, New habit, Details, Progress, and Calendar.',
    canonical: SITE_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/download': {
    title: 'Download Daily Spark - Android APK',
    // Keep these values identical to SITE.apk in src/lib/site.ts and the
    // SoftwareApplication JSON-LD in index.html; they describe the published
    // APK, not the website's own version.
    description:
      'Download the official Daily Spark v1.0.2 Android APK (4.1 MB). Free, offline habit tracking with no account, ads, or tracking. Android only.',
    canonical: `${SITE_URL}download/`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/privacy': {
    title: 'Privacy - Daily Spark',
    description:
      'Daily Spark collects nothing. No account, no analytics, no ads - your habits stay on your device.',
    canonical: `${SITE_URL}privacy/`,
    ogType: 'article',
    twitterCard: 'summary',
  },
  // Redirect stubs: real routes exist only so the SPA can navigate, and the
  // static copies exist so GitHub Pages returns 200 instead of 404.
  '/get': {
    title: 'Redirecting - Daily Spark',
    noindex: true,
  },
  '/offline': {
    title: 'Offline - Daily Spark',
    description:
      'Daily Spark works 100% offline. All your habits, streaks, and notes are safe on this device.',
    canonical: `${SITE_URL}offline/`,
    noindex: true,
  },
  '/404': {
    title: 'Page not found - Daily Spark',
    noindex: true,
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
  let rendered = absolutizeAssets(
    template.replace(SEO_BLOCK, `<!--seo:start-->\n${seoBlock(route)}\n    <!--seo:end-->`),
  );
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
