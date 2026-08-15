import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from '../components/SeoPageLayout';
import { Card, Field, Btn } from '../components/UI';
import { ORG, TXT, MUT, DIM, BG2, BG3, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

// ——— Same category system used across the dashboard and weekly leaderboard ———
// Keeping this identical to dashboard.jsx so the numbers a visitor sees here
// line up exactly with the live "Global Rank" badge they get after registering.

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

function avg(arr) {
  return arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;
}

export async function getServerSideProps() {
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, fullName, courseName, location, status')
    .eq('status', 'approved');

  const approvedIds = new Set((clubs || []).map((c) => c.id));
  const clubById = {};
  (clubs || []).forEach((c) => { clubById[c.id] = c; });

  const { data: allEntries } = await supabase
    .from('entries')
    .select('orgId, dist, hcp, age, gender, player');

  const entries = (allEntries || []).filter((e) => approvedIds.has(e.orgId));

  const totalGolfers = new Set(entries.map((e) => e.orgId)).size;
  const totalDrives = entries.length;

  const sortedByDist = [...entries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const topEntry = sortedByDist[0] || null;
  const topClub = topEntry ? clubById[topEntry.orgId] : null;

  const longest = topEntry
    ? {
        dist: Number(topEntry.dist),
        player: topEntry.player || topClub?.fullName || 'A Ripping Bombs golfer',
        courseName: topClub?.courseName || topClub?.location || null,
      }
    : null;

  const categoryData = {};
  CATEGORY_KEYS.forEach((key) => { categoryData[key] = []; });
  entries.forEach((e) => {
    const cat = getCategory(e);
    if (categoryData[cat]) categoryData[cat].push(Number(e.dist));
  });

  const categorySummary = {};
  CATEGORY_KEYS.forEach((key) => {
    const distances = categoryData[key].sort((a, b) => a - b);
    categorySummary[key] = {
      distances,
      avg: avg(distances),
      count: distances.length,
    };
  });

  return {
    props: {
      totalGolfers,
      totalDrives,
      longest,
      categorySummary,
    },
  };
}

function getVerdict(topPct) {
  if (topPct <= 5) return { label: '\uD83D\uDCA5 ELITE BOMBER', color: '#ff9900' };
  if (topPct <= 15) return { label: '\uD83D\uDD25 BIG HITTER', color: ORG };
  if (topPct <= 35) return { label: '\uD83D\uDCAA ABOVE AVERAGE', color: '#a3e635' };
  if (topPct <= 65) return { label: '\u26F3 RIGHT IN THE MIX', color: TXT };
  return { label: '\uD83D\uDCC8 ROOM TO GROW', color: MUT };
}

function LiveStat({ label, value }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '16px 18px' }}>
      <div style={{ fontFamily: DISP, fontSize: 26, color: ORG, letterSpacing: 0.5, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: DIM, letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function RankResult({ result }) {
  if (!result) return null;
  const { pct, topPct, avgForGroup, count, catLabel } = result;
  const verdict = getVerdict(topPct);
  const lowSample = count < 5;

  return (
    <div style={{ marginTop: 28, paddingTop: 28, borderTop: `1px solid ${BDR}` }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-block', fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: 2, color: verdict.color, border: `1px solid ${verdict.color}`,
          padding: '5px 14px', textTransform: 'uppercase', marginBottom: 16,
        }}>
          {verdict.label}
        </div>

        <div style={{ fontFamily: DISP, fontSize: 'clamp(52px,12vw,88px)', color: ORG, letterSpacing: 1, lineHeight: 1 }}>
          TOP {topPct}%
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginTop: 8 }}>
          You out-drive roughly <strong style={{ color: TXT }}>{pct}%</strong> of golfers in the {catLabel} category on Ripping Bombs
          {avgForGroup ? <> — category average is <strong style={{ color: TXT }}>{avgForGroup} yds</strong></> : null}.
        </div>
      </div>

      {lowSample && (
        <div style={{ background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.25)', padding: '12px 16px', fontFamily: SANS, fontSize: 12, color: '#ffb347', marginTop: 4 }}>
          Small sample size for this category right now ({count} submitted drive{count === 1 ? '' : 's'}) — this ranking will get more accurate as more golfers register and submit.
        </div>
      )}
    </div>
  );
}

export default function WhereDoIRankGlobally({ totalGolfers, totalDrives, longest, categorySummary }) {
  const router = useRouter();
  const [distance, setDistance] = useState('');
  const [hcp, setHcp] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);

  function calculate() {
    const d = Number(distance);
    const h = Number(hcp);
    const a = Number(age);
    if (!d || isNaN(h) || !a) return;

    const cat = getCategory({ age: a, hcp: h, gender });
    const summary = categorySummary[cat] || { distances: [], avg: null, count: 0 };
    const beatenCount = summary.distances.filter((v) => v < d).length;
    const pct = summary.count > 0 ? Math.round((beatenCount / summary.count) * 100) : 50;
    const clampedPct = Math.max(1, Math.min(99, pct));

    setResult({
      pct: clampedPct,
      topPct: 100 - clampedPct,
      avgForGroup: summary.avg,
      count: summary.count,
      catLabel: getCategoryLabel(cat),
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'global_rank_calculated', {
        event_category: 'engagement', distance: d, handicap: h, age_group: cat, gender, percentile: clampedPct,
      });
    }
  }

  function reset() {
    setDistance(''); setHcp(''); setAge(''); setGender('male'); setResult(null);
  }

  return (
    <SeoPage
      title="Where Do I Rank Globally? Golf Driving Distance Ranking | Ripping Bombs"
      description="See where your longest drive ranks against real golfers worldwide. Compare your distance to actual verified drives submitted to the Ripping Bombs global leaderboard and check your rank instantly."
    >
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>
        Live Global Rank Check
      </div>
      <SeoH1>Where Do I Rank Globally in Golf Driving Distance?</SeoH1>
      <SeoP>
        You already know how far you drive it — but how do you compare to golfers everywhere else? Ripping Bombs
        tracks real, submitted drives from golfers and simulator venues around the world, so you can see exactly
        where you rank globally instead of guessing. Enter your numbers below to check your rank against actual
        drives on the platform right now.
      </SeoP>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
        <LiveStat label="Golfers Ranked" value={totalGolfers || '-'} />
        <LiveStat label="Drives Submitted" value={totalDrives || '-'} />
        <LiveStat label="Longest Drive Recorded" value={longest ? `${longest.dist} yds` : '-'} />
      </div>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0 16px' }}>
          <Field label="Longest Drive (yards)" type="number" required
            value={distance} onChange={e => setDistance(e.target.value)} placeholder="e.g. 260" min={50} max={400} />
          <Field label="Handicap" type="number" required
            value={hcp} onChange={e => setHcp(e.target.value)} placeholder="e.g. 14" min={0} max={54} />
          <Field label="Age" type="number" required
            value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" min={5} max={99} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Gender<span style={{ color: ORG, marginLeft: 2 }}>*</span>
            </label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, borderRadius: 0, padding: '10px 14px', color: TXT, fontFamily: SANS, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <Btn variant="orange" onClick={calculate}>CHECK MY GLOBAL RANK &rarr;</Btn>
          {result && <Btn variant="subtle" onClick={reset}>RESET</Btn>}
        </div>

        <RankResult result={result} />
      </Card>

      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          GET YOUR OFFICIAL GLOBAL RANK
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          The number above is an estimate based on live submitted drives. Register free, submit a verified drive,
          and your dashboard will show your real-time global rank badge - updated as new drives come in.
        </div>
        <button onClick={() => {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'rank_page_register_cta_click', { event_category: 'engagement', page: '/where-do-i-rank-globally' });
          }
          router.push('/register');
        }} style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', cursor: 'pointer', letterSpacing: 0.5 }}>
          REGISTER FREE &rarr;
        </button>
      </div>

      <SeoH2>How Is My Global Rank Calculated?</SeoH2>
      <SeoP>
        Unlike a statistical estimate, your Ripping Bombs global rank is calculated directly from real drives
        submitted by real golfers and simulator venues. When you register and submit a verified drive, we compare
        your best distance against every other golfer in your category - split by gender, age group, and handicap
        band - and show you exactly where you land, from your dashboard's live global rank badge down to the
        percentage of golfers you out-drive.
      </SeoP>

      <SeoH2>What Percentage of Golfers Hit It Farther Than Me?</SeoH2>
      <SeoP>
        It depends entirely on your category. A 260-yard drive might put a mid-handicap men's golfer near the top
        of the leaderboard, while the same distance would be closer to average for a scratch player. That's why we
        split rankings by gender, age, and handicap - so "where do I rank" always means where you rank against
        golfers genuinely comparable to you, not the field as a whole.
      </SeoP>

      <SeoH2>How Many Golfers Are Ranked on Ripping Bombs?</SeoH2>
      <SeoP>
        {totalGolfers ? (
          <>Right now there are <strong style={{ color: TXT }}>{totalGolfers}</strong> golfers and simulator venues with
          submitted drives on the platform, totalling <strong style={{ color: TXT }}>{totalDrives}</strong> recorded
          drives{longest ? <> - including a longest drive of <strong style={{ color: TXT }}>{longest.dist} yds</strong></> : null}.
          These numbers grow every week as more clubs and simulator venues join and submit new drives.</>
        ) : (
          <>Ripping Bombs is a growing global leaderboard for verified golf drives, split by gender, age, and
          handicap so your rank is always compared fairly against similar golfers.</>
        )}
      </SeoP>

      <SeoH2>Global Rank vs. a Percentile Estimate - What's the Difference?</SeoH2>
      <SeoP>
        If you just want a quick, general sense of how your driving distance compares to typical amateur golfers,
        try our <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>driving distance percentile calculator</Link>,
        which uses commonly cited benchmark averages. This page is different: it checks your distance against
        actual verified drives submitted to Ripping Bombs, so the more golfers who join and submit, the more
        accurate and meaningful your global rank becomes.
      </SeoP>

      <SeoH2>How Do I Get an Official Global Rank Badge?</SeoH2>
      <SeoP>
        Register a free account as an individual simulator player or a club, then submit your longest verified
        drive. Once approved, your dashboard displays a live global rank strip - your current position, the
        percentage of golfers you're ahead of, and how you compare within your category. It updates automatically
        as new drives are submitted worldwide, so your rank stays current.
      </SeoP>

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>How Far Do I Drive Compared to Others?</Link>{' | '}
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' | '}
        <Link href="/longest-drives-this-week" style={linkStyle}>Longest Drives This Week</Link>{' | '}
        <Link href="/venue-rankings" style={linkStyle}>Venue Rankings</Link>{' | '}
        <Link href="/hall-of-fame" style={linkStyle}>Hall of Fame</Link>
      </SeoP>

      <SeoCTA />
    </SeoPage>
  );
}
