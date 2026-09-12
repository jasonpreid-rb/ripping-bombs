// pages/api/badge/[slug].js
//
// Dynamic "Powered by Ripping Bombs" embeddable badge for venue websites,
// rendered via @vercel/og — same rendering approach as the weekly social
// cards / QR posters. Shows the club's current top drive so the badge is
// live content for the venue, not just a static logo.
//
// Embed snippet to hand out to venues (also worth putting on their
// dashboard with a copy button):
//
// <a href="https://www.rippingbombs.com/clubs/{slug}" target="_blank" rel="noopener">
//   <img src="https://www.rippingbombs.com/api/badge/{slug}"
//        alt="{Club Name} Long Drive Leaderboard — Ripping Bombs"
//        width="300" height="120" />
// </a>
//
// SEO note: the <a> tag is what carries backlink value. Don't let this
// become a bare <img> with no wrapping link, and don't let rel="nofollow"
// sneak in — nofollow would defeat the entire point of this feature.

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Same slugify logic used in pages/clubs/[slug].jsx and
// scripts/generate-sitemap.cjs — kept in sync with both.
function toSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Mirrors the sample/demo exclusion in generate-sitemap.cjs so the badge
// never shows a demo row as if it were a real club record.
function isSampleId(id) {
  return Boolean(id) && (id.startsWith('demo_') || /^[oe]\d+$/.test(id));
}

export default async function handler(req) {
  const slug = req.url.split('/api/badge/')[1]?.split('?')[0]?.split('.')[0];

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, customSlug, courseName, location, status, accountType')
    .eq('accountType', 'club')
    .eq('status', 'approved');

  const org = (clubs || []).find(
    (c) => (c.customSlug || toSlug(c.courseName)) === slug
  );

  if (!org) {
    return new Response('Not found', { status: 404 });
  }

  // Same "own entries + tagged-to-venue entries, deduped" pattern used in
  // pages/clubs/[slug].jsx.
  const { data: ownEntries } = await supabase
    .from('entries')
    .select('id, dist, player, date')
    .eq('orgId', org.id);

  const { data: venueEntries } = await supabase
    .from('entries')
    .select('id, dist, player, date')
    .eq('venueId', org.id);

  const seen = new Set();
  const entries = [...(ownEntries || []), ...(venueEntries || [])].filter((e) => {
    if (isSampleId(e.id) || seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const best = entries.reduce(
    (top, e) => (!top || e.dist > top.dist ? e : top),
    null
  );

  const { ImageResponse } = await import('@vercel/og');

  return new ImageResponse(
    (
      <div
        style={{
          width: '300px',
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '16px',
          background: '#0A0A0A',
          border: '2px solid #FF0090',
          borderRadius: '8px',
          fontFamily: 'Inter',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 12, color: '#FF0090', letterSpacing: 1 }}>
          RIPPING BOMBS LEADERBOARD
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
          {org.courseName}
        </div>
        <div style={{ fontSize: 14, marginTop: 6, color: '#CCCCCC' }}>
          {best
            ? `Top drive: ${best.dist}yds — ${best.player}`
            : 'Be the first on the board'}
        </div>
      </div>
    ),
    {
      width: 300,
      height: 120,
    }
  );
}
