// pages/resources.jsx
//
// A single page that lists every SEO/content page on the site, grouped
// by category. Two jobs:
//   1. Gives every page in the registry at least one strong internal
//      inbound link (fixes orphan pages — pages with zero internal
//      links pointing to them tend not to get indexed/ranked well).
//   2. Gives humans a real "browse everything" page, linkable from the
//      site footer/nav.
//
// Pulls everything from lib/seoPages.js — add a page to the registry
// and it shows up here automatically, no edits needed.

import Head from 'next/head';
import { seoPages, categoryLabels } from '../lib/seoPages';

const TXT = '#f0f0f0';
const MUT = '#888';
const ORG = '#FF0090';
const BG2 = '#161616';
const BDR = '#2a2a2a';

// Small rotating set of icon paths (Lucide-style, hand-picked) used purely
// as decorative badges per category — cycles by index so any category
// list works without needing to hardcode category names.
const ICONS = [
  // target
  'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 4a2 2 0 100 4 2 2 0 000-4z',
  // flag
  'M4 22V3a1 1 0 011-1h1a1 1 0 011 1v1h11a1 1 0 01.8 1.6l-2.6 3.4 2.6 3.4A1 1 0 0119 14H7v8H4z',
  // trophy
  'M6 2h12v3h3a1 1 0 011 1v1a5 5 0 01-5 5h-.3A6 6 0 0113 16.9V19h3v2H8v-2h3v-2.1A6 6 0 017.3 12H7a5 5 0 01-5-5V6a1 1 0 011-1h3V2z',
  // globe
  'M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 2.7 4 6.2 4 10s-1.5 7.3-4 10m0-20C9.5 4.7 8 8.2 8 12s1.5 7.3 4 10M2.5 9h19M2.5 15h19',
];

function CategoryIcon({ index }) {
  const d = ICONS[index % ICONS.length];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function ResourcesPage() {
  const categories = Object.keys(categoryLabels);
  const nonEmptyCategories = categories.filter((cat) => seoPages.some((p) => p.category === cat));

  return (
    <>
      <Head>
        <title>Guides & Leaderboards — Ripping Bombs</title>
        <meta
          name="description"
          content="Browse every Ripping Bombs guide and leaderboard — by gender, handicap, age, country, simulator, and competition."
        />
      </Head>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '3rem 1rem 4rem', color: TXT }}>
        {/* Hero */}
        <div
          style={{
            position: 'relative',
            marginBottom: '2.5rem',
            paddingBottom: '2rem',
            borderBottom: `1px solid ${BDR}`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: ORG,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '0.9rem',
            }}
          >
            <span style={{ width: 6, height: 6, background: ORG, display: 'inline-block' }} />
            Every resource, one place
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: '0.9rem',
              maxWidth: 640,
            }}
          >
            Chase the number.<br />
            <span style={{ color: ORG }}>Find your leaderboard.</span>
          </h1>

          <p style={{ color: MUT, marginBottom: '1.75rem', maxWidth: 560, fontSize: '1.02rem', lineHeight: 1.6 }}>
            Every leaderboard, guide, and competition resource on Ripping Bombs — sorted
            by gender, handicap, age, country, and simulator, so you can find exactly
            where you stack up.
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Stat value={seoPages.length} label="guides & leaderboards" />
            <Stat value={nonEmptyCategories.length} label="categories" />
          </div>
        </div>

        {/* Category sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {nonEmptyCategories.map((cat, i) => {
            const pages = seoPages.filter((p) => p.category === cat);
            return (
              <div
                key={cat}
                style={{
                  background: BG2,
                  border: `1px solid ${BDR}`,
                  borderRadius: 10,
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'rgba(255,0,144,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CategoryIcon index={i} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{categoryLabels[cat]}</h2>
                  <span style={{ color: MUT, fontSize: '0.78rem', fontWeight: 600 }}>{pages.length}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.6rem' }}>
                  {pages.map((page) => (
                    <ResourceLink key={page.slug} page={page} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <div
          style={{
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: 10,
            border: `1px solid ${BDR}`,
            background: `linear-gradient(135deg, ${BG2} 0%, #1a0d14 100%)`,
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
            Think you can crack the top of a leaderboard?
          </h3>
          <p style={{ color: MUT, margin: '0 0 1.25rem', fontSize: '0.95rem' }}>
            Submit your longest drive and see where you rank.
          </p>
          <a
            href="/submit-your-longest-drive"
            style={{
              display: 'inline-block',
              background: ORG,
              color: '#111',
              fontWeight: 800,
              fontSize: '0.9rem',
              padding: '0.75rem 1.6rem',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Submit Your Drive →
          </a>
        </div>
      </div>
    </>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: TXT, lineHeight: 1 }}>{value}</div>
      <div style={{ color: MUT, fontSize: '0.8rem', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}

function ResourceLink({ page }) {
  return (
    <a
      href={`/${page.slug}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        color: TXT,
        fontSize: '0.88rem',
        fontWeight: 600,
        textDecoration: 'none',
        padding: '0.65rem 0.8rem',
        borderRadius: 8,
        border: `1px solid ${BDR}`,
        background: '#0f0f0f',
        transition: 'transform 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ORG;
        e.currentTarget.style.color = ORG;
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = BDR;
        e.currentTarget.style.color = TXT;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span>{page.title}</span>
      <span style={{ opacity: 0.6 }}>→</span>
    </a>
  );
}
