// Generates public/sitemap.xml and public/robots.txt before each production
// build. Runs as a plain Node script (not through Vite) so it works the same
// in CI and locally: `node scripts/generate-seo.js`.
//
// If the API isn't reachable (e.g. building without a live backend), this
// falls back to a sitemap containing only the static routes instead of
// failing the build — a stale/partial sitemap is fine, a broken build isn't.
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function loadEnv(file) {
  try {
    const text = readFileSync(path.join(rootDir, file), 'utf8');
    const env = {};
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) env[match[1]] = match[2].trim();
    }
    return env;
  } catch {
    return {};
  }
}

const env = { ...loadEnv('.env'), ...loadEnv('.env.production'), ...process.env };
const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_URL = (env.VITE_API_URL || 'http://localhost:8004/api').replace(/\/$/, '');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/catalog', priority: '0.9', changefreq: 'daily' },
  { path: '/3d-studio', priority: '0.8', changefreq: 'weekly' },
  { path: '/calculator', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
];

async function fetchWallpaperUrls() {
  try {
    const res = await fetch(`${API_URL}/wallpapers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const wallpapers = await res.json();
    if (!Array.isArray(wallpapers)) return [];
    return wallpapers.map((w) => ({
      path: `/product/${w._id}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: w.updatedAt ? new Date(w.updatedAt).toISOString().slice(0, 10) : undefined,
    }));
  } catch (err) {
    console.warn(`[generate-seo] Oboylar ro'yxati olinmadi (${err.message}) — sitemap faqat statik sahifalarni o'z ichiga oladi.`);
    return [];
  }
}

function buildSitemap(urls) {
  const entries = urls.map(({ path: p, priority, changefreq, lastmod }) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /favorites

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

const wallpaperUrls = await fetchWallpaperUrls();
const sitemap = buildSitemap([...STATIC_ROUTES, ...wallpaperUrls]);
writeFileSync(path.join(rootDir, 'public/sitemap.xml'), sitemap);
writeFileSync(path.join(rootDir, 'public/robots.txt'), buildRobots());

console.log(`[generate-seo] sitemap.xml (${STATIC_ROUTES.length + wallpaperUrls.length} url) va robots.txt yozildi -> public/`);
