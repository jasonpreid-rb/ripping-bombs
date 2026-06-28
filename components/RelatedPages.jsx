// components/RelatedPages.jsx
//
// Drop this near the bottom of any SEO content page to auto-generate
// 3-4 links to other pages in the same category, pulled from the
// registry in lib/seoPages.js. No manual link-listing, no codemod —
// add a page to the registry once and it starts linking automatically.
//
// Usage in a page, e.g. pages/sim-distance-real-or-fake.jsx:
//
//   import RelatedPages from '../components/RelatedPages';
//   ...
//   <RelatedPages currentSlug="sim-distance-real-or-fake" />

import { getRelatedPages, categoryLabels } from '../lib/seoPages';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BDR = '#2a2a2a';

export default function RelatedPages({ currentSlug, limit = 4 }) {
  const related = getRelatedPages(currentSlug, limit);
  if (related.length === 0) return null;

  const categoryLabel = categoryLabels[related[0].category] || 'Related';

  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1.5rem', margin: '2rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: TXT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        More on {categoryLabel}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {related.map((page) => (
          <a
            key={page.slug}
            href={`/${page.slug}`}
            style={{ color: ORG, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {page.title} →
          </a>
        ))}
      </div>
      <a href="/resources" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.78rem', color: MUT, textDecoration: 'none' }}>
        Browse all guides & leaderboards →
      </a>
    </div>
  );
}
