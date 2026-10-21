// Checks every URL in a sitemap and reports anything that does not return 200 directly.
// Usage (from the project folder):  node scripts/check-sitemap.cjs https://rippingbombs.com/sitemap.xml
// Needs Node 18 or newer (built-in fetch).

const start = process.argv[2] || 'https://rippingbombs.com/sitemap.xml';
const MAX_HOPS = 10;

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));

async function getText(url) {
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error(`${url} returned ${r.status}`);
  return r.text();
}

// Collect page URLs, following sitemap index files
async function collect(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const xml = await getText(url);
  const found = locs(xml);
  if (/<sitemapindex/i.test(xml)) {
    const nested = await Promise.all(found.map((u) => collect(u, seen)));
    return nested.flat();
  }
  return found;
}

// Follow redirects by hand so the whole chain is visible
async function check(url) {
  const hops = [];
  let current = url;
  for (let i = 0; i <= MAX_HOPS; i++) {
    let r;
    try {
      r = await fetch(current, { redirect: 'manual', headers: { 'user-agent': 'sitemap-check' } });
    } catch (e) {
      return { url, status: 'error', note: String(e.message), hops };
    }
    if (r.status >= 300 && r.status < 400) {
      const next = r.headers.get('location');
      if (!next) return { url, status: r.status, note: 'redirect with no Location', hops };
      const abs = new URL(next, current).href;
      hops.push(`${r.status} -> ${abs}`);
      if (abs === current || hops.some((h, k) => k < hops.length - 1 && h.endsWith(abs))) {
        return { url, status: 'loop', note: 'redirect loop', hops };
      }
      current = abs;
      continue;
    }
    return { url, status: r.status, note: '', hops };
  }
  return { url, status: 'chain', note: `more than ${MAX_HOPS} redirects`, hops };
}

(async () => {
  const urls = [...new Set(await collect(start))];
  console.log(`Checking ${urls.length} URLs from ${start}\n`);
  const results = [];
  for (let i = 0; i < urls.length; i += 5) {
    results.push(...(await Promise.all(urls.slice(i, i + 5).map(check))));
  }
  const ok = results.filter((r) => r.status === 200 && r.hops.length === 0);
  const bad = results.filter((r) => !(r.status === 200 && r.hops.length === 0));
  for (const r of bad) {
    console.log(`${r.status}  ${r.url}${r.note ? '  (' + r.note + ')' : ''}`);
    r.hops.forEach((h) => console.log(`      ${h}`));
  }
  console.log(`\n${ok.length} fine, ${bad.length} need attention.`);
  console.log('Every URL in the sitemap should return 200 with no redirect. Fix the URL in the sitemap source, or the redirect, for each one listed.');
})().catch((e) => { console.error('Failed:', e.message); process.exit(1); });
