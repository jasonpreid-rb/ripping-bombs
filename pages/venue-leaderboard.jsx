import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from '../components/SeoPageLayout';
import { ORG, TXT, MUT, DIM, BG2, BG3, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

// ——— Same category system and composite-percentile venue ranking used on the
// club dashboard (VenueRankStrip) — kept identical so the numbers a venue owner
// sees on their dashboard line up exactly with what's published here.

function getCategory(entry) {
  const age = Number(entry.age);
  const hcp = Number(entry.hcp);
  const gender = (entry.gender || '').toLowerCase();
  if (age < 16) return 'youth';
  if (age >= 55) return 'senior';
  if (gender === 'female') return hcp >= 20 ? 'female_high_hcp' : 'female_open';
  return hcp >= 20 ? 'male_high_hcp' : 'male_open';
}

function getCategoryLabel(cat) {
  return {
    male_open: 'Men (Open)',
    male_high_hcp: 'Men High Handicap',
    female_open: 'Women (Open)',
    female_high_hcp: 'Women High Handicap',
    senior: 'Seniors',
    youth: 'Youth',
  }[cat] || 'All Golfers';
}

const CATEGORY_KEYS = ['male_open', 'male_high_hcp', 'female_open', 'female_high_hcp', 'senior', 'youth'];
const MIN_DRIVES_PER_CATEGORY = 3;
const LEADERBOARD_LIMIT = 50;

export async function getServerSideProps() {
  const { data: venues } = await supabase
    .from('clubs')
    .select('id, courseName, fullName, location, country')
    .eq('accountType', 'club')
    .eq('status', 'approved');

  const venueIds = new Set((venues || []).map((v) => v.id));
  const venueById = {};
  (venues || []).forEach((v) => { venueById[v.id] = v; });

  const { data: allEntries } = await supabase
    .from('entries')
    .select('orgId, dist, age, hcp, gender');

  const venueEntries = (allEntries || []).filter((e) => venueIds.has(e.orgId));

  // Best distance + submission count per venue, per category
  const perCategory = {};
  CATEGORY_KEYS.forEach((key) => { perCategory[key] = {}; });
  venueEntries.forEach((e) => {
    const cat = getCategory(e);
    const bucket = perCategory[cat];
    if (!bucket) return;
    const d = Number(e.dist);
    if (!bucket[e.orgId]) bucket[e.orgId] = { best: d, count: 1 };
    else {
      bucket[e.orgId].count += 1;
      if (d > bucket[e.orgId].best) bucket[e.orgId].best = d;
    }
  });

  // Per category: rank venues with enough submitted drives, convert rank -> percentile
  const venuePercentiles = {};
  CATEGORY_KEYS.forEach((key) => {
    const eligible = Object.entries(perCategory[key]).filter(([, v]) => v.count >= MIN_DRIVES_PER_CATEGORY);
    const n = eligible.length;
    if (n === 0) return;
    eligible
      .sort((a, b) => b[1].best - a[1].best)
      .forEach(([orgId], idx) => {
        const catPercentile = ((idx + 1) / n) * 100;
        if (!venuePercentiles[orgId]) venuePercentiles[orgId] = [];
        venuePercentiles[orgId].push(catPercentile);
      });
  });

  const composite = {};
  Object.entries(venuePercentiles).forEach(([orgId, arr]) => {
    composite[orgId] = arr.reduce((s, v) => s + v, 0) / arr.length;
  });

  const ranked = Object.entries(composite)
    .sort((a, b) => a[1] - b[1])
    .map(([orgId, score], idx) => {
      const venue = venueById[orgId] || {};
      return {
        rank: idx + 1,
        id: orgId,
        name: venue.courseName || venue.fullName || 'Venue',
        location: venue.location || venue.country || null,
        scorePercentile: Math.round(score),
        categoriesCounted: venuePercentiles[orgId].length,
      };
    });

  const topVenue = ranked[0] || null;

  return {
    props: {
      ranked: ranked.slice(0, LEADERBOARD_LIMIT),
      totalVenuesRanked: ranked.length,
      totalVenuesTracked: (venues || []).length,
      totalDrives: venueEntries.length,
      topVenue,
    },
  };
}

function LiveStat({ label, value }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '16px 18px' }}>
      <div style={{ fontFamily: DISP, fontSize: 26, color: ORG, letterSpacing: 0.5, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function VenueTable({ rows }) {
  if (!rows.length) {
    return (
      <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '40px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: MUT }}>
        Not enough submitted drives yet for a ranked venue leaderboard — check back soon, or be one of the first venues on it.
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${BDR}`, background: BG2 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr>
            {['Rank', 'Venue', 'Location', 'Score', 'Categories'].map((col) => (
              <th key={col} style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: DIM, textTransform: 'uppercase', textAlign: 'left', borderBottom: `2px solid ${BDR}` }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => {
            const medal = v.rank === 1 ? '\uD83E\uDD47' : v.rank === 2 ? '\uD83E\uDD48' : v.rank === 3 ? '\uD83E\uDD49' : null;
            return (
              <tr key={v.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                <td style={{ padding: '12px 14px', fontFamily: SANS, fontSize: 13, color: DIM }}>{medal || `#${v.rank}`}</td>
                <td style={{ padding: '12px 14px', fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT }}>{v.name}</td>
                <td style={{ padding: '12px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{v.location || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: DISP, fontSize: 16, color: ORG }}>Top {v.scorePercentile}%</span>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>
                  {v.categoriesCounted} / {CATEGORY_KEYS.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function VenueLeaderboard({ ranked, totalVenuesRanked, totalVenuesTracked, totalDrives, topVenue }) {
  return (
    <SeoPage
      title="Venue Leaderboard: How Golf & Simulator Venues Rank Globally | Ripping Bombs"
      description="See how golf clubs and simulator venues rank against each other worldwide on Ripping Bombs, how the venue ranking score works, and where your venue stands right now."
    >
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>
        Live Venue Rankings
      </div>
      <SeoH1>Venue Leaderboard: How Golf Venues Rank Against Each Other</SeoH1>
      <SeoP>
        Every club and simulator venue on Ripping Bombs is competing on more than just one lucky drive. We track
        every submission from every venue worldwide and roll it up into a single, fair global venue ranking — so
        a venue with a genuinely strong field of players ranks above one that just happened to get one huge drive
        from a single golfer. Here's the live leaderboard, and exactly how it's calculated.
      </SeoP>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
        <LiveStat label="Venues Ranked" value={totalVenuesRanked || '-'} />
        <LiveStat label="Venues Tracked" value={totalVenuesTracked || '-'} />
        <LiveStat label="Drives Submitted" value={totalDrives || '-'} />
      </div>

      {topVenue && (
        <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ORG, textTransform: 'uppercase', marginBottom: 6 }}>
            #1 Ranked Venue Right Now
          </div>
          <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: 0.5 }}>{topVenue.name}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginTop: 4 }}>
            {topVenue.location ? `${topVenue.location} — ` : ''}Top {topVenue.scorePercentile}% average across {topVenue.categoriesCounted} category
            {topVenue.categoriesCounted === 1 ? '' : 's'}
          </div>
        </div>
      )}

      <SeoH2>How Are Venues Ranked Against Each Other?</SeoH2>
      <SeoP>
        Every drive submitted through a venue is sorted into one of six categories — Men, Men High Handicap,
        Women, Women High Handicap, Youth, and Seniors. Within each category, venues are ranked against every
        other venue by their best submitted drive, and that rank becomes a percentile. A venue's overall score is
        the average of those percentiles across whichever categories it has enough submitted drives in — so a
        venue that's strong across several categories ranks higher than one that's only strong in one, and no
        venue is punished for a category it simply doesn't have data in yet.
      </SeoP>

      <SeoH2>Why Not Just Rank Venues by Longest Drive?</SeoH2>
      <SeoP>
        A venue's single longest drive is really just the longest drive by whichever one player happened to
        submit through them — it says more about that individual than the venue itself, and a raw yardage
        comparison isn't fair across categories that naturally sit at very different distances. Averaging
        percentile rank across categories, with a minimum number of submitted drives required before a category
        counts, keeps one fluke submission from swinging a venue's entire ranking.
      </SeoP>

      <SeoH2>Global Venue Leaderboard</SeoH2>
      <SeoP>
        Ranked by composite score across all categories with enough submitted drives to qualify. This updates as
        new drives are submitted worldwide.
      </SeoP>

      <VenueTable rows={ranked} />

      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          PUT YOUR VENUE ON THE BOARD
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          Register a free venue account, get your players submitting drives, and your venue starts climbing this
          leaderboard automatically — with your own live global venue rank shown right on your dashboard.
        </div>
        <Link href="/register" style={{ display: 'inline-block', background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', letterSpacing: 0.5, textDecoration: 'none' }}>
          REGISTER YOUR VENUE FREE &rarr;
        </Link>
      </div>

      <SeoH2>How Can My Venue Climb the Rankings?</SeoH2>
      <SeoP>
        The fastest way up is simply getting more of your players submitting verified drives — each category
        needs a minimum number of submissions before it counts toward your score, so venues with an active,
        regularly-submitting player base pull ahead of venues with just a handful of one-off entries. A QR poster
        on-site makes submitting a drive quick for walk-in players, and a TV display showing your venue's live
        leaderboard next to the global one gives players an obvious reason to keep coming back and try to beat
        their own number.
      </SeoP>

      <SeoH2>Do Individual Simulator Accounts Count Toward Venue Rankings?</SeoH2>
      <SeoP>
        No — the venue leaderboard only compares club and venue accounts against each other, so an individual
        golfer's simulator submissions never affect a venue's ranking. Individual golfers have their own{' '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>global rank</Link> instead, calculated the same
        percentile way but against other individual golfers in their category.
      </SeoP>

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/leaderboard" style={linkStyle}>Global Drives Leaderboard</Link>{' | '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>Where Do I Rank Globally?</Link>{' | '}
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/longest-drives-this-week" style={linkStyle}>Longest Drives This Week</Link>{' | '}
        <Link href="/hall-of-fame" style={linkStyle}>Hall of Fame</Link>
      </SeoP>

      <SeoCTA />
    </SeoPage>
  );
}
