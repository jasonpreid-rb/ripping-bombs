// scripts/generate-sitemap.cjs
//
// Generates public/sitemap.xml from three sources:
//   1. Core app pages (hand-listed below — these rarely change)
//   2. The static SEO page registry (lib/seoPages.js)
//   3. Dynamic pages from Supabase: club venue pages (/clubs/[slug]) and
//      public player profile pages (/profile/[slug], only where
//      profileConsent = true)
//
// Runs automatically after every build via package.json:
//   "scripts": { "postbuild": "node scripts/generate-sitemap.cjs" }
//
// Uses .cjs extension on purpose so it runs as CommonJS regardless of
// whatever "type" is set in package.json.
//
// Needs the same Supabase env vars already used by the app
// (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Vercel
// injects these automatically at build time. For local runs, make sure
// they're exported in your shell or loaded via a .env file + dotenv.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { seoPages } = require('../lib/seoPages.js');

const SITE_URL = 'https://www.rippingbombs.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Core, hand-maintained app pages. Update this list if you add/remove
// a top-level app page (not an SEO content page — those go in seoPages.js).
const corePages = [
  { slug: '', priority: 1.0, changefreq: 'weekly' },
  { slug: 'leaderboard', priority: 0.95, changefreq: 'weekly' },
  { slug: 'register', priority: 0.9, changefreq: 'monthly' },
  { slug: 'how-to-register', priority: 0.7, changefreq: 'monthly' },
  { slug: 'login', priority: 0.6, changefreq: 'monthly' },
  { slug: 'contact', priority: 0.8, changefreq: 'monthly' },
  { slug: 'clubs', priority: 0.9, changefreq: 'weekly' },
  { slug: 'submit-your-longest-drive', priority: 0.75, changefreq: 'monthly' },
  { slug: 'resources', priority: 0.7, changefreq: 'monthly' },
];

// Same slugify logic used elsewhere in the app (e.g. nameToSlug() in
// leaderboard.jsx / dashboard.jsx), duplicated here since this script
// runs standalone via node, outside the Next.js module graph.
function toSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function urlEntry(loc, changefreq, priority, lastmod) {
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `  <url><loc>${SITE_URL}${loc}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

async function getDynamicData() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Missing Supabase env vars — skipping dynamic club/profile URLs and lastmod data.');
    return { clubUrls: [], profileUrls: [], siteWideLatest: null };
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Confirmed: clubs has no `slug` column. Use customSlug where set,
  // otherwise compute one from courseName on the fly (same approach used
  // elsewhere in the app for club/profile links).
  const { data: clubRows, error: clubErr } = await supabase
    .from('clubs')
    .select('id, customSlug, courseName, fullName, accountType, status, profileConsent')
    .eq('accountType', 'club')
    .eq('status', 'approved');

  if (clubErr) {
    console.warn('[sitemap] Could not fetch club rows:', clubErr.message);
  }

  // Most recent entry date per orgId — used as a real lastmod instead of
  // no timestamp at all.
  const { data: entryRows, error: entryErr } = await supabase
    .from('entries')
    .select('orgId, date');

  if (entryErr) {
    console.warn('[sitemap] Could not fetch entries for lastmod:', entryErr.message);
  }

  const lastEntryByOrg = {};
  let siteWideLatest = null;
  (entryRows || []).forEach((e) => {
    if (!e.date) return;
    if (!lastEntryByOrg[e.orgId] || e.date > lastEntryByOrg[e.orgId]) {
      lastEntryByOrg[e.orgId] = e.date;
    }
    if (!siteWideLatest || e.date > siteWideLatest) siteWideLatest = e.date;
  });

  const clubUrls = (clubRows || [])
    .map((c) => {
      const slug = c.customSlug || (c.courseName ? toSlug(c.courseName) : null);
      if (!slug) return null;
      return urlEntry(`/clubs/${slug}`, 'weekly', 0.8, lastEntryByOrg[c.id] || null);
    })
    .filter(Boolean);

  // Public player profile pages — simulator accounts that opted in via
  // the post-submission "Want a shareable profile page?" consent modal.
  const { data: profileRows, error: profileErr } = await supabase
    .from('clubs')
    .select('id, customSlug, fullName, accountType, status, profileConsent')
    .eq('accountType', 'simulator')
    .eq('status', 'approved')
    .eq('profileConsent', true);

  if (profileErr) {
    console.warn('[sitemap] Could not fetch profile rows:', profileErr.message);
  }

  const profileUrls = (profileRows || [])
    .map((p) => {
      const slug = p.customSlug || (p.fullName ? toSlug(p.fullName) : null);
      if (!slug) return null;
      return urlEntry(`/profile/${slug}`, 'weekly', 0.7, lastEntryByOrg[p.id] || null);
    })
    .filter(Boolean);

  return { clubUrls, profileUrls, siteWideLatest };
}

async function generate() {
  const { clubUrls, profileUrls, siteWideLatest } = await getDynamicData();

  // Core app pages and live/weekly SEO pages get the site-wide most
  // recent entry date as lastmod, since their content is driven by
  // whatever's newest in `entries`. Purely evergreen guide pages are
  // left without a computed lastmod here — add a `lastmod: 'YYYY-MM-DD'`
  // field directly on those entries in lib/seoPages.js when you actually
  // edit their copy, and this script will pick it up automatically.
  const dynamicChangefreqs = new Set(['weekly']);

  const core = corePages.map((p) =>
    urlEntry(`/${p.slug}`.replace(/\/$/, '') || '/', p.changefreq, p.priority, dynamicChangefreqs.has(p.changefreq) ? siteWideLatest : null)
  );

  const seo = seoPages.map((p) =>
    urlEntry(`/${p.slug}`, p.changefreq, p.priority, p.lastmod || (dynamicChangefreqs.has(p.changefreq) ? siteWideLatest : null))
  );

  const all = [...core, ...seo, ...clubUrls, ...profileUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.join('\n')}
</urlset>
`;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`[sitemap] Wrote ${all.length} URLs to ${outPath}`);
}

generate().catch((err) => {
  console.error('[sitemap] Generation failed:', err);
  process.exit(1);
});
