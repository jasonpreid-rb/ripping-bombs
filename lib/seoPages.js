// lib/seoPages.js
//
// Single source of truth for every static SEO/content page on the site.
// Used by:
//   - scripts/generate-sitemap.cjs   (builds sitemap.xml)
//   - components/RelatedPages.jsx    (auto "related pages" links)
//   - pages/resources.jsx            (category hub page)
//
// Adding a new SEO page = add one object here. Nothing else to wire up.
//
// NOTE: this registry intentionally excludes:
//   - core app pages (index, leaderboard, register, login, contact, clubs, submit*, dashboard)
//     -> these are added directly in the sitemap generator, not here
//   - dynamic pages (/clubs/[slug], /profile/[slug], /drive/[id])
//     -> these come from Supabase at sitemap-build time, not from this file
//   - test-db.jsx -> debug page, should not be public. Recommend deleting it
//     or adding `export const getServerSideProps = () => ({ notFound: true })`
//     if it needs to stay on disk for now.
//
// TWO PAGES NEED A DECISION before they're added below:
//   - golf-long-drive-competition.jsx  vs  golf-longest-drive-competition.jsx
//     These look like near-duplicate slugs. Only the "longest" version is
//     currently in the sitemap. Pick one as canonical and either redirect
//     or repurpose the other, then update this file.
//   - golfer-profile.jsx — unclear if this is a live template, a demo, or
//     dead code. Left out of the registry until confirmed.

const seoPages = [
  // ───────── Simulator trust & venue acquisition ─────────
  { slug: 'sim-distance-real-or-fake', title: 'Is Your Sim Distance Real or Fake?', category: 'simulator', priority: 0.9, changefreq: 'monthly' },
  { slug: 'average-simulator-driver-distance', title: 'Average Simulator Driver Distance', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'supported-simulators', title: 'Supported Simulators', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'trackman-long-drive', title: 'TrackMan Long Drive', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'golf-simulator-near-me', title: 'Golf Simulator Near Me', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'golf-simulator-leaderboard', title: 'Golf Simulator Leaderboard', category: 'simulator', priority: 0.85, changefreq: 'weekly' },
  { slug: 'simulator-golf-competition', title: 'Simulator Golf Competition', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'simulator-golf-league', title: 'Simulator Golf League', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'indoor-golf-league', title: 'Indoor Golf League', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'increase-golf-simulator-bookings', title: 'Increase Golf Simulator Bookings', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'club-and-simulator-venue-leaderboards', title: 'Club & Simulator Venue Leaderboards', category: 'simulator', priority: 0.85, changefreq: 'weekly' },
  { slug: 'online-golf-long-drive-leaderboard', title: 'Online Golf Long Drive Leaderboard', category: 'simulator', priority: 0.85, changefreq: 'weekly' },

  // ───────── Gender leaderboards ─────────
  { slug: 'longest-mens-drive', title: "Longest Men's Drive", category: 'gender', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-womens-drive', title: "Longest Women's Drive", category: 'gender', priority: 0.9, changefreq: 'weekly' },

  // ───────── Handicap leaderboards ─────────
  { slug: 'longest-drive-scratch-golfer', title: 'Longest Drive — Scratch Golfer', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-low-handicap', title: 'Longest Drive — Low Handicap', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-mid-handicap', title: 'Longest Drive — Mid Handicap', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-high-handicap', title: 'Longest Drive — High Handicap', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-amateur', title: 'Longest Drive — Amateur', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'golf-handicap-driving-distance', title: 'Golf Handicap & Driving Distance', category: 'handicap', priority: 0.85, changefreq: 'monthly' },
  { slug: 'average-driver-distance-by-handicap', title: 'Average Driver Distance by Handicap', category: 'handicap', priority: 0.9, changefreq: 'monthly' },

  // ───────── Age leaderboards ─────────
  { slug: 'longest-drive-seniors', title: 'Longest Drive — Seniors', category: 'age', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-over-50', title: 'Longest Drive — Over 50', category: 'age', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-u12', title: 'Longest Drive — Juniors U12', category: 'age', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-13-16', title: 'Longest Drive — Juniors 13-16', category: 'age', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-17-18', title: 'Longest Drive — Juniors 17-18', category: 'age', priority: 0.8, changefreq: 'weekly' },

  // ───────── Country leaderboards ─────────
  { slug: 'longest-drive-uk', title: 'Longest Drive — UK', category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-ireland', title: 'Longest Drive — Ireland', category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-usa', title: 'Longest Drive — USA', category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-australia', title: 'Longest Drive — Australia', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-south-africa', title: 'Longest Drive — South Africa', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-japan', title: 'Longest Drive — Japan', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-germany', title: 'Longest Drive — Germany', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-sweden', title: 'Longest Drive — Sweden', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-india', title: 'Longest Drive — India', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-portugal', title: 'Longest Drive — Portugal', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-nigeria', title: 'Longest Drive — Nigeria', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-china', title: 'Longest Drive — China', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-mexico', title: 'Longest Drive — Mexico', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-canada', title: 'Longest Drive — Canada', category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-uae', title: 'Longest Drive — UAE', category: 'country', priority: 0.85, changefreq: 'weekly' },

  // ───────── General guides ─────────
  { slug: 'average-driver-distance', title: 'Average Driver Distance', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'average-golf-drive-distance', title: 'Average Golf Drive Distance', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'how-to-hit-a-golf-ball-farther', title: 'How to Hit a Golf Ball Farther', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-far-do-i-drive-compared-to-others', title: 'How Far Do I Drive Compared to Others?', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'how-far-should-i-hit-driver', title: 'How Far Should I Hit My Driver?', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'what-is-a-good-drive-in-golf', title: 'What Is a Good Drive in Golf?', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'long-drive-golf-equipment', title: 'Long Drive Golf Equipment', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'recommended-range-finders', title: 'Recommended Range Finders', category: 'guides', priority: 0.8, changefreq: 'monthly' },
  { slug: 'popularity-of-golf', title: 'The Popularity of Golf', category: 'guides', priority: 0.75, changefreq: 'monthly' },
  { slug: 'how-is-golf-evolving', title: 'How Is Golf Evolving?', category: 'guides', priority: 0.75, changefreq: 'monthly' },
  { slug: 'longest-golf-drive-ever', title: 'Longest Golf Drive Ever Recorded', category: 'guides', priority: 0.85, changefreq: 'monthly' },

  // ───────── Competitions & events ─────────
  { slug: 'golf-longest-drive-competition', title: 'Golf Longest Drive Competition', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'golf-club-longest-drive-competition-ideas', title: 'Golf Club Longest Drive Competition Ideas', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-to-promote-your-golf-event', title: 'How to Promote Your Golf Event', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'sim-golf-long-drive-championship', title: 'Sim Golf Long Drive Championship', category: 'competitions', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-challenge', title: 'Longest Drive Challenge', category: 'competitions', priority: 0.8, changefreq: 'monthly' },
  { slug: '2027-championship', title: '2027 Championship', category: 'competitions', priority: 0.9, changefreq: 'weekly' },

  // ───────── Hall of fame / live ─────────
  { slug: 'hall-of-fame', title: 'Hall of Fame', category: 'hall-of-fame', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drives-this-week', title: 'Longest Drives This Week', category: 'hall-of-fame', priority: 0.9, changefreq: 'weekly' },
];

const categoryLabels = {
  simulator: 'Simulator & Venues',
  gender: 'Gender Leaderboards',
  handicap: 'Handicap Leaderboards',
  age: 'Age Leaderboards',
  country: 'Country Leaderboards',
  guides: 'Guides',
  competitions: 'Competitions & Events',
  'hall-of-fame': 'Hall of Fame',
};

function getPagesByCategory(category) {
  return seoPages.filter((p) => p.category === category);
}

function getRelatedPages(currentSlug, limit = 4) {
  const current = seoPages.find((p) => p.slug === currentSlug);
  if (!current) return [];
  return seoPages
    .filter((p) => p.category === current.category && p.slug !== currentSlug)
    .slice(0, limit);
}

module.exports = { seoPages, categoryLabels, getPagesByCategory, getRelatedPages };
