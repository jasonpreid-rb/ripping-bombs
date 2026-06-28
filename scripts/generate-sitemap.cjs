// scripts/generate-sitemap.cjs
//
// Generates public/sitemap.xml from three sources:
//   1. Core app pages (hand-listed below — these rarely change)
//   2. The static SEO page registry (lib/seoPages.js)
//   3. Dynamic pages from Supabase: club venue pages (/clubs/[slug]) and
//      public player profile pages (/profile/[slug], only where
//      profileConsent = true)
//
// Run automatically after every build:
//   package.json -> "scripts": { "postbuild": "node scripts/generate-sitemap.cjs" }
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

function urlEntry(loc, changefreq, priority) {
  return `  <url><loc>${SITE_URL}${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

async function getClubUrls() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Missing Supabase env vars — skipping dynamic club/profile URLs.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // TODO confirm column name: this assumes a `slug` column on `clubs`
  // for venue-type accounts. If your club venue slugs are instead
  // computed on the fly from `courseName`, swap this query/mapping
  // accordingly (see nameToSlug() in pages/dashboard.jsx for the same
  // slugify logic used elsewhere in the app).
  const { data: clubRows, error: clubErr } = await supabase
    .from('clubs')
    .select('slug, customSlug, fullName, accountType, profileConsent')
    .eq('accountType', 'club');

  if (clubErr) {
    console.warn('[sitemap] Could not fetch club rows:', clubErr.message);
  }

  const clubUrls = (clubRows || [])
    .map((c) => c.slug || c.customSlug)
    .filter(Boolean)
    .map((slug) => urlEntry(`/clubs/${slug}`, 'weekly', 0.8));

  // Public player profile pages — simulator accounts that opted in via
  // the post-submission "Want a shareable profile page?" consent modal.
  const { data: profileRows, error: profileErr } = await supabase
    .from('clubs')
    .select('customSlug, fullName, accountType, profileConsent')
    .eq('accountType', 'simulator')
    .eq('profileConsent', true);

  if (profileErr) {
    console.warn('[sitemap] Could not fetch profile rows:', profileErr.message);
  }

  const profileUrls = (profileRows || [])
    .map((p) => p.customSlug)
    .filter(Boolean)
    .map((slug) => urlEntry(`/profile/${slug}`, 'weekly', 0.7));

  return [...clubUrls, ...profileUrls];
}

async function generate() {
  const core = corePages.map((p) => urlEntry(`/${p.slug}`.replace(/\/$/, '') || '/', p.changefreq, p.priority));
  const seo = seoPages.map((p) => urlEntry(`/${p.slug}`, p.changefreq, p.priority));
  const dynamic = await getClubUrls();

  const all = [...core, ...seo, ...dynamic];

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
