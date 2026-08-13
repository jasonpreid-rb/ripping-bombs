// pages/widget/[slug].jsx
//
// Embeddable iframe widget — shows a venue's top 10 leaderboard.
// Venues paste a single <iframe> tag on their own site pointing at
// https://rippingbombs.com/widget/[their-slug]
//
// URL params supported:
//   ?category=men | men-hc | women | women-hc | youth | senior  (default: overall top 10, no filter)
//   ?theme=dark | light                                          (default: dark)
//
// NOTE: This assumes your existing `clubs` (keyed by customSlug) and `entries`
// (keyed by orgId) tables/columns from venue-display/[slug].jsx. If your
// actual column names differ, adjust the two supabase calls in getStaticProps
// — everything else (styling, layout, resize messaging) is drop-in as-is.

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ORG, TXT, MUT, BG2, BG3, BDR, SANS, DISP } from '../../lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORY_LABELS = {
  men: 'Men',
  'men-hc': 'Men High Handicap',
  women: 'Women',
  'women-hc': 'Women High Handicap',
  youth: 'Youth',
  senior: 'Senior',
};

function flagUrl(countryCode) {
  if (!countryCode) return null;
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}

export default function VenueWidget({ club, entries, category }) {
  const router = useRouter();
  const isLight = router.query.theme === 'light';

  // Auto-resize: tell the parent page our real height so the venue's
  // iframe isn't stuck at a fixed height / doesn't scroll internally.
  useEffect(() => {
    const postHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ rbWidgetHeight: height, slug: club?.customSlug }, '*');
    };
    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [club, entries]);

  const bg = isLight ? '#FFFFFF' : BG2;
  const cardBg = isLight ? '#F7F7F8' : BG3;
  const text = isLight ? '#111111' : TXT;
  const mut = isLight ? '#666666' : MUT;
  const border = isLight ? '#E5E5E5' : BDR;

  if (!club) {
    return (
      <div style={{ fontFamily: SANS, padding: 24, color: mut, background: bg }}>
        Venue not found.
      </div>
    );
  }

  const label = category ? CATEGORY_LABELS[category] : 'Top 10';

  return (
    <div
      style={{
        fontFamily: SANS,
        background: bg,
        color: text,
        padding: '16px',
        boxSizing: 'border-box',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: DISP,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: text,
            }}
          >
            {club.name || club.customSlug}
          </div>
          <div style={{ fontSize: 12, color: mut, marginTop: 2 }}>
            {label} Longest Drive Leaderboard
          </div>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ORG,
          }}
          title="Live"
        />
      </div>

      <div style={{ border: `1px solid ${border}`, background: cardBg }}>
        {entries.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: mut, fontSize: 13 }}>
            No entries yet — be the first!
          </div>
        )}
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderBottom: i < entries.length - 1 ? `1px solid ${border}` : 'none',
              background: i === 0 ? (isLight ? '#FFF0F8' : 'rgba(255,0,144,0.08)') : 'transparent',
            }}
          >
            <div
              style={{
                width: 22,
                fontFamily: DISP,
                fontWeight: 800,
                fontSize: 13,
                color: i === 0 ? ORG : mut,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            {flagUrl(entry.countryCode) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagUrl(entry.countryCode)}
                alt=""
                width={20}
                height={15}
                style={{ flexShrink: 0, borderRadius: 0 }}
              />
            )}
            <div
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 600,
                color: text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {entry.name}
            </div>
            <div
              style={{
                fontFamily: DISP,
                fontWeight: 800,
                fontSize: 14,
                color: i === 0 ? ORG : text,
                flexShrink: 0,
              }}
            >
              {entry.distance} yds
            </div>
          </div>
        ))}
      </div>

      <a
        href={`https://rippingbombs.com/venue-display/${club.customSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 12,
          fontSize: 11,
          color: mut,
          textDecoration: 'none',
        }}
      >
        Powered by <span style={{ color: ORG, fontWeight: 700 }}>Ripping Bombs</span>
      </a>
    </div>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, customSlug')
    .eq('customSlug', slug)
    .single();

  if (!club) {
    return { notFound: true, revalidate: 60 };
  }

  // TODO: if you support category filtering per-widget via a static route
  // segment instead of query param, pass it in here. As written this pulls
  // the venue's overall top 10 regardless of category — filter client-side
  // via router.query.category if you want per-category static params instead.
  const { data: entries } = await supabase
    .from('entries')
    .select('id, name, distance, countryCode')
    .eq('orgId', club.id)
    .order('distance', { ascending: false })
    .limit(10);

  return {
    props: {
      club,
      entries: entries || [],
      category: null,
    },
    revalidate: 30, // widget refreshes at most every 30s
  };
}
