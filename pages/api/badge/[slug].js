// pages/api/badge/[slug].js
//
// Embeddable venue leaderboard badge for venue websites, rendered via
// @vercel/og. Redesigned from the original stat-plaque version: the score
// is now the visual hero, framed as a challenge ("Beat this? ->") rather
// than a passive stat, with a LIVE indicator and the brand icon instead of
// a full wordmark.
//
// Embed snippet to hand out to venues (put on their dashboard with a copy
// button, next to where they already get their QR poster):
//
// <a href="https://www.rippingbombs.com/clubs/{slug}" target="_blank" rel="noopener">
//   <img src="https://www.rippingbombs.com/api/badge/{slug}"
//        alt="{Club Name} Long Drive Leaderboard — Ripping Bombs"
//        width="300" height="130" />
// </a>
//
// SEO note: the <a> tag is what carries backlink value. Don't let this
// become a bare <img> with no wrapping link, and don't let rel="nofollow"
// sneak in.
//
// Requires public/badge-icon-pink.png to exist (the brand icon, recolored
// neon pink #FF0090) — referenced below by absolute URL since Satori reads
// remote image URLs fine but has no access to the local filesystem.

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

// Mirrors the sample/demo exclusion in generate-sitemap.cjs and
// lib/data.js's isSampleId() so the badge never shows a demo row as if it
// were a real club record.
function isSampleId(id) {
  return (
    Boolean(id) &&
    (/^(demo_|sim_demo_|simdemo\d+_)/i.test(id) || /^[oe]\d+$/.test(id))
  );
}

export default async function handler(req) {
  const slug = req.url.split('/api/badge/')[1]?.split('?')[0]?.split('.')[0];

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, customSlug, courseName, status, accountType')
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
    .select('id, dist, player')
    .eq('orgId', org.id);

  const { data: venueEntries } = await supabase
    .from('entries')
    .select('id, dist, player')
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
          height: '130px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '14px 16px',
          backgroundImage: 'linear-gradient(135deg, #0A0A0A, #241018)',
          border: '2px solid #FF0090',
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            src="https://www.rippingbombs.com/badge-icon-pink.png"
            width={22}
            height={22}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255,0,144,0.15)',
              borderRadius: 20,
              padding: '3px 8px',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#FF0090' }} />
            <span style={{ fontSize: 10, color: '#FF0090', fontWeight: 700, letterSpacing: 0.5 }}>
              LIVE
            </span>
          </div>
        </div>

        <div style={{ fontSize: 15, color: '#cccccc' }}>{org.courseName}</div>

        {best ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#FF0090', lineHeight: 1 }}>
              {best.dist}
            </span>
            <span style={{ fontSize: 14, color: '#FF0090' }}>yds</span>
            <span style={{ fontSize: 12, color: '#888888', marginLeft: 4 }}>
              — {best.player}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#cccccc' }}>Be the first on the board</div>
        )}
      </div>
    ),
    {
      width: 300,
      height: 130,
    }
  );
}
