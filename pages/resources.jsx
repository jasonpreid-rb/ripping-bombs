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

export default function ResourcesPage() {
  const categories = Object.keys(categoryLabels);

  return (
    <>
      <Head>
        <title>Guides & Leaderboards — Ripping Bombs</title>
        <meta
          name="description"
          content="Browse every Ripping Bombs guide and leaderboard — by gender, handicap, age, country, simulator, and competition."
        />
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', color: TXT }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Guides &amp; Leaderboards
        </h1>
        <p style={{ color: MUT, marginBottom: '2rem', maxWidth: 600 }}>
          Every leaderboard, guide, and competition resource on Ripping Bombs, all in one place.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {categories.map((cat) => {
            const pages = seoPages.filter((p) => p.category === cat);
            if (pages.length === 0) return null;
            return (
              <div key={cat} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700 }}>{categoryLabels[cat]}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                  {pages.map((page) => (
                    <a
                      key={page.slug}
                      href={`/${page.slug}`}
                      style={{ color: ORG, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {page.title} →
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
