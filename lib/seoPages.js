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
// [2026-08-31 site scan] Full pages/ directory audit against this registry
// and scripts/generate-sitemap.cjs found the following pages present on
// disk but excluded from both — i.e. invisible to the sitemap:
//   - how-it-works, how-to-increase-swing-speed-for-more-distance,
//     indoor-golf-league-ranking-system, best-golf-drivers-for-distance-2026,
//     biggest-hitters-by-country, average-golf-drive-distance-by-age
//     -> all added below.
//   - 50 country leaderboard pages that exist on disk but were never added
//     when the country batch was built (only ~19 of the ~69 country pages
//     were registered) -> all added below under "Country leaderboards (cont.)".
//     Titles/descriptions follow the existing pattern; priorities are set to
//     0.8 as a starting point below the original curated set — bump specific
//     markets (e.g. new-zealand, france) manually if you want them prioritized.
// Pages found on disk that are NOT added here — need a decision, not a fix:
//   - golfer-profile.jsx — unclear if this is a live template, a demo, or
//     dead code. Left out of the registry until confirmed.
//   - sponsor-leaderboard-preview.jsx, venue-display-demo.jsx — look like
//     internal sales/demo pages, not public content. Left out; noindex them
//     directly in the page if they're meant to stay unlisted.
//   - venue-qr.jsx, venue-setup.jsx — look like auth-gated club-account
//     tools (same category as dashboard.jsx), not content pages. Confirm
//     they're excluded from public crawling the same way dashboard is.
//   - increase-bookings-poster.jsx — unclear if public marketing page or an
//     internal poster-generation tool. Confirm before adding.
//   - submit.jsx — exists alongside submit-your-longest-drive.jsx (which IS
//     in scripts/generate-sitemap.cjs's corePages). If submit.jsx is a live,
//     distinct page rather than a legacy duplicate/redirect, it needs adding
//     to corePages there (not here).
//
// KNOWN BROKEN LINK: golf-long-drive-competition.jsx does not exist on disk
// — only golf-longest-drive-competition.jsx does (already registered below).
// At least two live pages (simulator-golf-competition.jsx and
// average-golf-drive-distance-by-age.jsx) currently link to
// "/golf-long-drive-competition", which 404s. Fix both links to point to
// "/golf-longest-drive-competition".
//
// `description` was added [2026-08] to drive meta descriptions for SEO
// pages — previously only `title` existed, which meant Google was likely
// falling back to a generic/auto-generated snippet for every page here.
// Wire this into SeoPageLayout's <Head> block as the `description` meta tag.

const seoPages = [
  // ───────── Simulator trust & venue acquisition ─────────
  { slug: 'sim-distance-real-or-fake', title: 'Is Your Sim Distance Real or Fake?', description: 'Simulator distances often run hot compared to real-world drives. See how much sim readings inflate and how Ripping Bombs verifies real distance.', category: 'simulator', priority: 0.9, changefreq: 'monthly' },
  { slug: 'average-simulator-driver-distance', title: 'Average Simulator Driver Distance', description: 'What counts as a good driver distance on a golf simulator? Compare your sim numbers against real golfers worldwide.', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'supported-simulators', title: 'Supported Simulators', description: 'See which golf simulator platforms and launch monitors work with Ripping Bombs for verified distance tracking.', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'trackman-long-drive', title: 'TrackMan Long Drive', description: 'Track your longest TrackMan-verified drives and see how you rank against simulator golfers around the world.', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'golf-simulator-near-me', title: 'Golf Simulator Near Me', description: 'Find golf simulator venues near you running live long drive leaderboards, and see how local players stack up.', category: 'simulator', priority: 0.85, changefreq: 'monthly' },
  { slug: 'golf-simulator-leaderboard', title: 'Golf Simulator Leaderboard — Live Rankings', description: 'Compare your simulator drive distance against golfers worldwide. Live leaderboards for every major sim platform.', category: 'simulator', priority: 0.85, changefreq: 'weekly' },
  { slug: 'simulator-golf-competition', title: 'Simulator Golf Competition', description: "Run or join a simulator long drive competition. See live standings and how to get your venue's leaderboard online.", category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'simulator-golf-league', title: 'Simulator Golf League', description: 'Turn your simulator venue into a running league with verified, updating long drive rankings players keep coming back to.', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'indoor-golf-league', title: 'Indoor Golf League', description: 'Set up an indoor golf long drive league with live leaderboards that keep members competing and coming back.', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'indoor-golf-league-ranking-system', title: 'Indoor Golf League Ranking System', description: 'How to structure a fair ranking system for an indoor golf league, with live standings players actually check.', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'increase-golf-simulator-bookings', title: 'Increase Golf Simulator Bookings', description: 'A live long drive leaderboard gives simulator venues a reason for golfers to book again. See how it works.', category: 'simulator', priority: 0.8, changefreq: 'monthly' },
  { slug: 'club-and-simulator-venue-leaderboards', title: 'Club & Simulator Venue Leaderboards', description: 'Give your club or simulator venue a live, verified long drive leaderboard players check and compete on weekly.', category: 'simulator', priority: 0.85, changefreq: 'weekly' },
  { slug: 'online-golf-long-drive-leaderboard', title: 'Online Golf Long Drive Leaderboard', description: 'The global online leaderboard for verified longest drives from clubs and simulators worldwide, updated live.', category: 'simulator', priority: 0.85, changefreq: 'weekly' },
  { slug: 'venue-rankings', title: 'Venue Rankings: How Golf Venues Compete Globally', description: 'See how golf clubs and simulator venues rank globally based on player activity, distance, and engagement.', category: 'simulator', priority: 0.85, changefreq: 'weekly' },

  // ───────── Gender leaderboards ─────────
  { slug: 'longest-mens-drive', title: "Longest Men's Drive Leaderboard (Live)", description: "Track the longest verified men's drives from clubs and simulators worldwide, updated live. See who's on top and submit your own.", category: 'gender', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-womens-drive', title: "Longest Women's Drive Leaderboard (Live)", description: "Track the longest verified women's drives from clubs and simulators worldwide, updated live. See who's on top and submit your own.", category: 'gender', priority: 0.9, changefreq: 'weekly' },

  // ───────── Handicap leaderboards ─────────
  { slug: 'longest-drive-scratch-golfer', title: 'Longest Drive — Scratch Golfer', description: 'See verified longest drives from scratch golfers worldwide. Find out how your distance compares.', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-low-handicap', title: 'Longest Drive — Low Handicap Leaderboard', description: 'How far do low-handicap golfers really drive? See verified longest drives by handicap and where you rank.', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-mid-handicap', title: 'Longest Drive — Mid Handicap Leaderboard', description: 'See how mid-handicap golfers stack up on distance. Verified longest drives, updated live.', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-high-handicap', title: 'Longest Drive — High Handicap Leaderboard', description: 'See how high-handicap golfers stack up on distance. Verified longest drives, updated live.', category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-amateur', title: 'Longest Drive — Amateur Leaderboard', description: "The global leaderboard for amateur golfers' longest verified drives. See where you rank and submit yours.", category: 'handicap', priority: 0.85, changefreq: 'weekly' },
  { slug: 'golf-handicap-driving-distance', title: 'Golf Handicap & Driving Distance', description: 'How does handicap actually relate to driving distance? See real data across handicap bands, not guesswork.', category: 'handicap', priority: 0.85, changefreq: 'monthly' },
  { slug: 'average-driver-distance-by-handicap', title: 'Average Driver Distance by Handicap', description: 'Real average driver distances broken down by handicap level, drawn from verified golfer submissions worldwide.', category: 'handicap', priority: 0.9, changefreq: 'monthly' },

  // ───────── Age leaderboards ─────────
  { slug: 'longest-drive-seniors', title: 'Longest Drive — Seniors Leaderboard', description: 'Verified longest drives from senior golfers worldwide. See the leaders and submit your own distance to compete.', category: 'age', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-over-50', title: 'Longest Drive — Over 50 Leaderboard', description: 'See the longest verified drives from golfers over 50 worldwide, and where your distance ranks.', category: 'age', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-u12', title: 'Longest Drive — Juniors U12 Leaderboard', description: 'Verified longest drives from junior golfers under 12, ranked globally. See the leaders and submit yours.', category: 'age', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-13-16', title: 'Longest Drive — Juniors 13-16 Leaderboard', description: 'Verified longest drives from junior golfers aged 13-16, ranked globally. See the leaders and submit yours.', category: 'age', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-juniors-17-18', title: 'Longest Drive — Juniors 17-18 Leaderboard', description: 'Verified longest drives from junior golfers aged 17-18, ranked globally. See the leaders and submit yours.', category: 'age', priority: 0.8, changefreq: 'weekly' },

  // ───────── Country leaderboards ─────────
  { slug: 'longest-drive-uk', title: 'Longest Drive — UK Leaderboard', description: "See the UK's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-ireland', title: 'Longest Drive — Ireland Leaderboard', description: "See Ireland's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-usa', title: 'Longest Drive — USA Leaderboard', description: "See the USA's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-australia', title: 'Longest Drive — Australia Leaderboard', description: "See Australia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-south-africa', title: 'Longest Drive — South Africa Leaderboard', description: "See South Africa's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-japan', title: 'Longest Drive — Japan Leaderboard', description: "See Japan's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-germany', title: 'Longest Drive — Germany Leaderboard', description: "See Germany's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-sweden', title: 'Longest Drive — Sweden Leaderboard', description: "See Sweden's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-india', title: 'Longest Drive — India Leaderboard', description: "See India's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-portugal', title: 'Longest Drive — Portugal Leaderboard', description: "See Portugal's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-nigeria', title: 'Longest Drive — Nigeria Leaderboard', description: "See Nigeria's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-china', title: 'Longest Drive — China Leaderboard', description: "See China's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-mexico', title: 'Longest Drive — Mexico Leaderboard', description: "See Mexico's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-canada', title: 'Longest Drive — Canada Leaderboard', description: "See Canada's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },
  { slug: 'longest-drive-uae', title: 'Longest Drive — UAE Leaderboard', description: "See the UAE's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.85, changefreq: 'weekly' },

  // ───────── Country leaderboards (cont.) — added [2026-08-31], existed on
  // disk but were never registered. Priority set to 0.8 as a starting point
  // below the original curated set above; bump individual markets manually
  // (e.g. new-zealand, france) if you want them prioritized higher. ─────────
  { slug: 'longest-drive-afghanistan', title: 'Longest Drive — Afghanistan Leaderboard', description: "See Afghanistan's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-albania', title: 'Longest Drive — Albania Leaderboard', description: "See Albania's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-algeria', title: 'Longest Drive — Algeria Leaderboard', description: "See Algeria's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-argentina', title: 'Longest Drive — Argentina Leaderboard', description: "See Argentina's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-austria', title: 'Longest Drive — Austria Leaderboard', description: "See Austria's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-bahrain', title: 'Longest Drive — Bahrain Leaderboard', description: "See Bahrain's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-belgium', title: 'Longest Drive — Belgium Leaderboard', description: "See Belgium's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-brazil', title: 'Longest Drive — Brazil Leaderboard', description: "See Brazil's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-bulgaria', title: 'Longest Drive — Bulgaria Leaderboard', description: "See Bulgaria's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-cambodia', title: 'Longest Drive — Cambodia Leaderboard', description: "See Cambodia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-chile', title: 'Longest Drive — Chile Leaderboard', description: "See Chile's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-colombia', title: 'Longest Drive — Colombia Leaderboard', description: "See Colombia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-croatia', title: 'Longest Drive — Croatia Leaderboard', description: "See Croatia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-czech-republic', title: 'Longest Drive — Czech Republic Leaderboard', description: "See the Czech Republic's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-denmark', title: 'Longest Drive — Denmark Leaderboard', description: "See Denmark's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-egypt', title: 'Longest Drive — Egypt Leaderboard', description: "See Egypt's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-finland', title: 'Longest Drive — Finland Leaderboard', description: "See Finland's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-france', title: 'Longest Drive — France Leaderboard', description: "See France's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-ghana', title: 'Longest Drive — Ghana Leaderboard', description: "See Ghana's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-greece', title: 'Longest Drive — Greece Leaderboard', description: "See Greece's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-hong-kong', title: 'Longest Drive — Hong Kong Leaderboard', description: "See Hong Kong's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-hungary', title: 'Longest Drive — Hungary Leaderboard', description: "See Hungary's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-indonesia', title: 'Longest Drive — Indonesia Leaderboard', description: "See Indonesia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-israel', title: 'Longest Drive — Israel Leaderboard', description: "See Israel's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-italy', title: 'Longest Drive — Italy Leaderboard', description: "See Italy's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-kenya', title: 'Longest Drive — Kenya Leaderboard', description: "See Kenya's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-kuwait', title: 'Longest Drive — Kuwait Leaderboard', description: "See Kuwait's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-malaysia', title: 'Longest Drive — Malaysia Leaderboard', description: "See Malaysia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-morocco', title: 'Longest Drive — Morocco Leaderboard', description: "See Morocco's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-netherlands', title: 'Longest Drive — Netherlands Leaderboard', description: "See the Netherlands' longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-new-zealand', title: 'Longest Drive — New Zealand Leaderboard', description: "See New Zealand's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-norway', title: 'Longest Drive — Norway Leaderboard', description: "See Norway's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-oman', title: 'Longest Drive — Oman Leaderboard', description: "See Oman's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-pakistan', title: 'Longest Drive — Pakistan Leaderboard', description: "See Pakistan's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-philippines', title: 'Longest Drive — Philippines Leaderboard', description: "See the Philippines' longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-poland', title: 'Longest Drive — Poland Leaderboard', description: "See Poland's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-qatar', title: 'Longest Drive — Qatar Leaderboard', description: "See Qatar's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-romania', title: 'Longest Drive — Romania Leaderboard', description: "See Romania's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-russia', title: 'Longest Drive — Russia Leaderboard', description: "See Russia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-saudi-arabia', title: 'Longest Drive — Saudi Arabia Leaderboard', description: "See Saudi Arabia's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-singapore', title: 'Longest Drive — Singapore Leaderboard', description: "See Singapore's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-south-korea', title: 'Longest Drive — South Korea Leaderboard', description: "See South Korea's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-spain', title: 'Longest Drive — Spain Leaderboard', description: "See Spain's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-switzerland', title: 'Longest Drive — Switzerland Leaderboard', description: "See Switzerland's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-taiwan', title: 'Longest Drive — Taiwan Leaderboard', description: "See Taiwan's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-thailand', title: 'Longest Drive — Thailand Leaderboard', description: "See Thailand's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-turkey', title: 'Longest Drive — Turkey Leaderboard', description: "See Turkey's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-uruguay', title: 'Longest Drive — Uruguay Leaderboard', description: "See Uruguay's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-vietnam', title: 'Longest Drive — Vietnam Leaderboard', description: "See Vietnam's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'longest-drive-zimbabwe', title: 'Longest Drive — Zimbabwe Leaderboard', description: "See Zimbabwe's longest verified drives from clubs and simulator venues, ranked and updated live.", category: 'country', priority: 0.8, changefreq: 'weekly' },
  { slug: 'biggest-hitters-by-country', title: 'Biggest Hitters by Country', description: 'See which countries produce the longest verified drives, and how your own country stacks up globally.', category: 'country', priority: 0.9, changefreq: 'weekly' },

  // ───────── General guides ─────────
  { slug: 'average-driver-distance', title: 'Average Driver Distance', description: 'What is the average golf driver distance, and how does yours compare? Real data from verified golfer submissions.', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'average-golf-drive-distance', title: 'Average Golf Drive Distance', description: 'See average golf drive distances by age, gender, and handicap, based on real verified submissions — not estimates.', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'average-golf-drive-distance-by-age', title: 'Average Golf Drive Distance by Age & Handicap', description: 'See average golf drive distances by age and handicap, then get your own global, country, age group, and handicap group rank.', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'how-to-hit-a-golf-ball-farther', title: 'How to Hit a Golf Ball Farther', description: 'Practical ways to add real yards to your drive, from swing mechanics to equipment — then track the gains.', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-to-increase-swing-speed-for-more-distance', title: 'How to Increase Swing Speed for More Distance', description: 'Practical ways to build clubhead speed and turn it into real driver distance — then track the gains.', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-far-do-i-drive-compared-to-others', title: 'How Far Do I Drive Compared to Others?', description: 'See exactly how your drive distance compares to golfers of the same age, gender, and handicap worldwide.', category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'where-do-i-rank-globally', title: 'Where Do I Rank Globally?', description: 'Submit your longest drive and see your real global, country, and venue rank against other golfers.', category: 'guides', priority: 0.9, changefreq: 'weekly' },
  { slug: 'how-far-should-i-hit-driver', title: 'How Far Should I Hit My Driver?', description: 'What driver distance should you realistically expect at your age and handicap? See the real benchmarks.', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'what-is-a-good-drive-in-golf', title: 'What Is a Good Drive in Golf?', description: "\"Good\" depends on your handicap and age. See real benchmark distances and where your drive actually stands.", category: 'guides', priority: 0.9, changefreq: 'monthly' },
  { slug: 'long-drive-golf-equipment', title: 'Long Drive Golf Equipment', description: "The drivers, shafts, and balls long drive competitors actually use to add distance. What matters and what doesn't.", category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'best-golf-drivers-for-distance-2026', title: 'Best Golf Drivers for Distance (2026)', description: "The drivers worth considering if you're chasing more distance in 2026, compared side by side.", category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'recommended-range-finders', title: 'Recommended Range Finders', description: 'Range finders worth buying for tracking and improving your driver distance, compared side by side.', category: 'guides', priority: 0.8, changefreq: 'monthly' },
  { slug: 'popularity-of-golf', title: 'The Popularity of Golf', description: "How golf's popularity is changing worldwide, and what it means for clubs, simulators, and new players.", category: 'guides', priority: 0.75, changefreq: 'monthly' },
  { slug: 'how-is-golf-evolving', title: 'How Is Golf Evolving?', description: 'From simulators to long drive events, see how golf is changing and where competitive distance fits in.', category: 'guides', priority: 0.75, changefreq: 'monthly' },
  { slug: 'longest-golf-drive-ever', title: 'Longest Golf Drive Ever Recorded', description: 'The longest golf drives ever recorded, verified and unverified, and how they compare to today\'s leaderboard.', category: 'guides', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-it-works', title: 'How It Works — Find Your Global Rank', description: 'Three steps to see how your longest drive stacks up against golfers worldwide. Rip your shot, upload it, get ranked instantly.', category: 'guides', priority: 0.9, changefreq: 'monthly' },

  // ───────── Competitions & events ─────────
  { slug: 'golf-longest-drive-competition', title: 'Golf Longest Drive Competition', description: 'How to enter or run a longest drive competition, with live rankings and verified results.', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'golf-club-longest-drive-competition-ideas', title: 'Golf Club Longest Drive Competition Ideas', description: 'Ideas for running a longest drive competition at your club, with a live leaderboard members actually check.', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'how-to-promote-your-golf-event', title: 'How to Promote Your Golf Event', description: 'Practical ways to get more entries and engagement for your next golf event, including live leaderboards.', category: 'competitions', priority: 0.85, changefreq: 'monthly' },
  { slug: 'sim-golf-long-drive-championship', title: 'Sim Golf Long Drive Championship', description: 'Compete in the simulator long drive championship. See live standings and how qualification works.', category: 'competitions', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drive-challenge', title: 'Longest Drive Challenge', description: 'Take the longest drive challenge — submit your distance and see how you rank against golfers worldwide.', category: 'competitions', priority: 0.8, changefreq: 'monthly' },
  { slug: '2027-championship', title: '2027 Global Long Drive Championship', description: 'The first global long drive championship for club and simulator golfers. See how rankings feed into 2027 qualification.', category: 'competitions', priority: 0.9, changefreq: 'weekly' },

  // ───────── Hall of fame / live ─────────
  { slug: 'hall-of-fame', title: 'Long Drive Hall of Fame — Global Rankings', description: 'See the longest verified drives ever recorded worldwide. Real distances, real rankings — check where the all-time greats stack up.', category: 'hall-of-fame', priority: 0.9, changefreq: 'weekly' },
  { slug: 'longest-drives-this-week', title: 'Longest Drives This Week — Live Leaderboard', description: "See this week's longest verified drives from golfers around the world, updated in real time. New week, new leaders.", category: 'hall-of-fame', priority: 0.9, changefreq: 'weekly' },
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
