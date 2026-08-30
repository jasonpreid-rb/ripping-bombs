import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from '../components/SeoPageLayout';
import { ORG, TXT, MUT, DIM, BG2, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

// ——— Kept identical to venue-rankings.jsx / homepage category logic so the
// category counts shown here always match what players see elsewhere on site.
function getCategory(entry) {
  const age = Number(entry.age);
  const hcp = Number(entry.hcp);
  const gender = (entry.gender || '').toLowerCase();
  if (age < 16) return 'youth';
  if (age >= 55) return 'senior';
  if (gender === 'female') return hcp >= 20 ? 'female_high_hcp' : 'female_open';
  return hcp >= 20 ? 'male_high_hcp' : 'male_open';
}

const CATEGORIES = [
  { key: 'male_open', label: 'Men (Open)', links: [{ name: "Men's Leaderboard", slug: 'longest-mens-drive' }] },
  { key: 'male_high_hcp', label: 'Men High Handicap', links: [{ name: 'High Handicap Leaderboard', slug: 'longest-drive-high-handicap' }] },
  { key: 'female_open', label: 'Women (Open)', links: [{ name: "Women's Leaderboard", slug: 'longest-womens-drive' }] },
  { key: 'female_high_hcp', label: 'Women High Handicap', links: [{ name: 'High Handicap Leaderboard', slug: 'longest-drive-high-handicap' }] },
  { key: 'senior', label: 'Seniors', links: [{ name: 'Seniors Leaderboard', slug: 'longest-drive-seniors' }, { name: 'Over 50 Leaderboard', slug: 'longest-drive-over-50' }] },
  { key: 'youth', label: 'Youth', links: [{ name: 'U12 Leaderboard', slug: 'longest-drive-juniors-u12' }, { name: '13–16 Leaderboard', slug: 'longest-drive-juniors-13-16' }, { name: '17–18 Leaderboard', slug: 'longest-drive-juniors-17-18' }] },
];

// two-letter codes match clubs.country exactly; slugs match seoPages.js exactly
const COUNTRIES = [
  { code: 'gb', label: 'United Kingdom', slug: 'longest-drive-uk' },
  { code: 'ie', label: 'Ireland', slug: 'longest-drive-ireland' },
  { code: 'us', label: 'USA', slug: 'longest-drive-usa' },
  { code: 'au', label: 'Australia', slug: 'longest-drive-australia' },
  { code: 'za', label: 'South Africa', slug: 'longest-drive-south-africa' },
  { code: 'jp', label: 'Japan', slug: 'longest-drive-japan' },
  { code: 'de', label: 'Germany', slug: 'longest-drive-germany' },
  { code: 'se', label: 'Sweden', slug: 'longest-drive-sweden' },
  { code: 'in', label: 'India', slug: 'longest-drive-india' },
  { code: 'pt', label: 'Portugal', slug: 'longest-drive-portugal' },
  { code: 'ng', label: 'Nigeria', slug: 'longest-drive-nigeria' },
  { code: 'cn', label: 'China', slug: 'longest-drive-china' },
  { code: 'mx', label: 'Mexico', slug: 'longest-drive-mexico' },
  { code: 'ca', label: 'Canada', slug: 'longest-drive-canada' },
  { code: 'ae', label: 'UAE', slug: 'longest-drive-uae' },
];

const FAQS = [
  {
    q: 'What is an RBR#?',
    a: 'RBR# is your Ripping Bombs Rank \u2014 a live number showing where your best verified drive currently sits against every other golfer worldwide in your category and country. It updates automatically as new drives are submitted.',
  },
  {
    q: 'How is my RBR# calculated?',
    a: 'Every verified drive is sorted into one of six categories by age, handicap, and gender, and by the country of the club or simulator venue it was submitted through. Your RBR# is your live rank position within that category and country.',
  },
  {
    q: 'Is it free to get an RBR#?',
    a: 'Yes. Register for free, submit a verified drive through any club or simulator venue on Ripping Bombs, and you appear on the global rankings immediately.',
  },
  {
    q: 'Can indoor golf leagues or competitions use RBR# for seeding or eligibility?',
    a: 'Yes. League and venue organizers can reference RBR# in registration or bracket seeding \u2014 for example, capping a division to players outside the top country rank, or requiring an RBR# in a specific category to enter.',
  },
  {
    q: 'Does my RBR# change over time?',
    a: 'Yes \u2014 RBR# is a live rank, not a fixed ID. It moves as you and other players submit new verified drives, so it always reflects current form rather than a one-time result.',
  },
];

export async function getServerSideProps() {
  const { data: venues } = await supabase
    .from('clubs')
    .select('id, country')
    .eq('status', 'approved');

  const countryByOrg = {};
  (venues || []).forEach((v) => { countryByOrg[v.id] = (v.country || '').toLowerCase(); });

  const { data: entries } = await supabase
    .from('entries')
    .select('orgId, player, dist, age, hcp, gender');

  const validEntries = (entries || []).filter((e) => countryByOrg[e.orgId] !== undefined);

  const categoryCounts = {};
  CATEGORIES.forEach((c) => { categoryCounts[c.key] = 0; });
  const countryCounts = {};

  validEntries.forEach((e) => {
    const cat = getCategory(e);
    if (categoryCounts[cat] !== undefined) categoryCounts[cat] += 1;
    const country = countryByOrg[e.orgId];
    if (country) countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const topCategoryKey = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topCategory = CATEGORIES.find((c) => c.key === topCategoryKey) || null;

  const topCountryCode = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topCountry = COUNTRIES.find((c) => c.code === topCountryCode) || null;

  return {
    props: {
      totalPlayersTracked: new Set(validEntries.map((e) => e.player)).size,
      totalDrives: validEntries.length,
      countriesActive: Object.keys(countryCounts).length,
      topCategoryLabel: topCategory ? topCategory.label : null,
      topCategoryCount: topCategory ? categoryCounts[topCategory.key] : 0,
      topCountryLabel: topCountry ? topCountry.label : null,
      topCountryCount: topCountryCode ? countryCounts[topCountryCode] : 0,
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

export default function RbrNumberPage({
  totalPlayersTracked,
  totalDrives,
  countriesActive,
  topCategoryLabel,
  topCategoryCount,
  topCountryLabel,
  topCountryCount,
}) {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <SeoPage
      title="Indoor Golf League Ranking System — What's Your RBR#? | Ripping Bombs"
      description="The indoor golf league ranking system powering RBR# — a live rank number for indoor golf leagues, simulator venues, and long drive players, by category and country."
    >
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </Head>

      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>
        Ripping Bombs Rank
      </div>
      <SeoH1>The Indoor Golf League Ranking System: What&rsquo;s Your RBR#?</SeoH1>
      <SeoP>
        Indoor golf leagues, simulator competitions, and long drive nights all have one problem in
        common: no shared number a player or organizer can point to and say &ldquo;here&rsquo;s
        where I actually stand.&rdquo; RBR# is that number &mdash; a live rank calculated from
        verified drives, broken down by category and country. It&rsquo;s not a fixed ID: it moves
        every time a new drive is submitted, so it&rsquo;s worth sharing your RBR# while it&rsquo;s
        good &mdash; someone else&rsquo;s next drive could overtake it.
      </SeoP>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
        <LiveStat label="Players Tracked" value={totalPlayersTracked || '-'} />
        <LiveStat label="Verified Drives" value={totalDrives || '-'} />
        <LiveStat label="Countries Active" value={countriesActive || '-'} />
      </div>

      {topCategoryLabel && (
        <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ORG, textTransform: 'uppercase', marginBottom: 6 }}>
            Most Competitive Category Right Now
          </div>
          <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: 0.5 }}>{topCategoryLabel}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginTop: 4 }}>
            {topCategoryCount} verified drives logged in this category
            {topCountryLabel ? ` — ${topCountryLabel} leads with ${topCountryCount} drives` : ''}
          </div>
        </div>
      )}

      <SeoH2>How Is RBR# Calculated?</SeoH2>
      <SeoP>
        Every verified drive is sorted into one of six categories by age, handicap, and gender, and
        into a country based on the club or simulator venue it was submitted through. Within each
        category and country, players are ranked by their best verified distance. That rank
        position is your RBR# &mdash; it moves as new drives are submitted, so it always reflects
        current form rather than a single lucky result.
      </SeoP>

      <SeoH2>For Indoor Golf Leagues &amp; Competition Organizers</SeoH2>
      <SeoP>
        Running an indoor golf league or a simulator competition and want a ranking system players
        already trust? Reference RBR# directly in registration or bracket seeding &mdash; cap a
        division to players outside a top country rank, require a category RBR# to enter, or
        simply list it alongside player names so entrants know exactly where the field stands.
        There&rsquo;s no setup cost: players self-register and their results feed the rankings
        automatically.
      </SeoP>

      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          GET YOUR RBR# FREE
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          Register, submit a verified drive through any club or simulator venue, and see your live
          rank by category and country immediately.
        </div>
        <Link href="/register" style={{ display: 'inline-block', background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', letterSpacing: 0.5, textDecoration: 'none' }}>
          REGISTER FREE &rarr;
        </Link>
      </div>

      <SeoH2>RBR# by Category</SeoH2>
      <SeoP>
        Every player falls into exactly one of six categories based on age, handicap, and gender.
        See where the field stands in yours:
      </SeoP>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 28 }}>
        {CATEGORIES.map((c) => (
          <div key={c.key} style={{ background: BG2, border: `1px solid ${BDR}`, padding: '14px 16px' }}>
            <div style={{ fontFamily: DISP, fontSize: 16, color: ORG, marginBottom: 8 }}>{c.label}</div>
            {c.links.map((l) => (
              <Link key={l.slug} href={`/${l.slug}`} style={{ ...linkStyle, display: 'block', fontFamily: SANS, fontSize: 12, marginBottom: 4 }}>
                {l.name} &rarr;
              </Link>
            ))}
          </div>
        ))}
      </div>

      <SeoH2>RBR# by Country</SeoH2>
      <SeoP>
        RBR# is also ranked within the country of the club or simulator venue a drive was
        submitted through:
      </SeoP>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 28 }}>
        {COUNTRIES.map((c) => (
          <Link key={c.code} href={`/${c.slug}`} style={{ ...linkStyle, fontFamily: SANS, fontSize: 12, background: BG2, border: `1px solid ${BDR}`, padding: '10px 12px', textDecoration: 'none' }}>
            {c.label} &rarr;
          </Link>
        ))}
      </div>

      <SeoH2>Frequently Asked Questions</SeoH2>
      {FAQS.map((f) => (
        <div key={f.q} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT, marginBottom: 4 }}>{f.q}</div>
          <SeoP>{f.a}</SeoP>
        </div>
      ))}

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/where-do-i-rank-globally" style={linkStyle}>Where Do I Rank Globally?</Link>{' | '}
        <Link href="/indoor-golf-league" style={linkStyle}>Indoor Golf League</Link>{' | '}
        <Link href="/simulator-golf-competition" style={linkStyle}>Simulator Golf Competition</Link>{' | '}
        <Link href="/leaderboard" style={linkStyle}>Global Drives Leaderboard</Link>{' | '}
        <Link href="/venue-rankings" style={linkStyle}>Venue Rankings</Link>
      </SeoP>

      <SeoCTA />
    </SeoPage>
  );
}
