import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../../lib/constants';
import { BadgePill, countryFlag } from '../../components/UI';

function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // Fetch all approved club accounts
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('status', 'approved')
    .eq('accountType', 'club');

  if (!clubs) return { notFound: true };

  const org = clubs.find(c => toSlug(c.courseName) === slug);
  if (!org) return { notFound: true };

  // Fetch entries submitted by this club (orgId) OR tagged to this venue (venueId)
  const { data: ownEntries } = await supabase
    .from('entries')
    .select('*')
    .eq('orgId', org.id);

  const { data: venueEntries } = await supabase
    .from('entries')
    .select('*')
    .eq('venueId', org.id);

  // Merge and deduplicate by id
  const allEntries = [...(ownEntries || []), ...(venueEntries || [])];
  const seen = new Set();
  const entries = allEntries.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return {
    props: { org, entries },
  };
}

export default function ClubPage({ org, entries, cvt, unitLbl }) {
  const router = useRouter();
  const [week, setWeek] = useState(nowWeek());
  const [allTime, setAllTime] = useState(false);

  const sorted = [...entries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const best = sorted[0];
  const weekEntries = allTime ? sorted : sorted.filter(e => sameWeek(e.date, week));

  const totalPlayers = new Set(entries.map(e => e.player)).size;
  const simCount = entries.filter(e => e.is_simulator).length;
  const officialCount = entries.filter(e => !e.is_simulator).length;

  const cv = cvt || (d => d);
  const ul = unitLbl || 'yds';

  const canonicalUrl = `https://www.rippingbombs.com/clubs/${toSlug(org.courseName)}`;
  const metaDesc = `Longest drive leaderboard for ${org.courseName}, ${org.location}. ${entries.length} drives recorded on Ripping Bombs.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: org.courseName,
    url: canonicalUrl,
    description: metaDesc,
    ...(org.location && { location: { '@type': 'Place', name: `${org.location}${org.country ? ', ' + org.country.toUpperCase() : ''}` } }),
    sport: 'Golf',
  };

  return (
    <>
      <Head>
        <title>{org.courseName} Longest Drive Leaderboard | Ripping Bombs</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${org.courseName} | Ripping Bombs`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Ripping Bombs" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div style={{ padding: '28px 18px 80px', maxWidth: 1000, margin: '0 auto' }}>

        <Link href="/clubs" style={{ fontFamily: SANS, fontSize: 12, color: DIM, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
          &larr; All Clubs
        </Link>

        {/* Header */}
        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            {org.logo && (
              <img src={org.logo} alt={org.courseName} style={{ width: 56, height: 56, objectFit: 'cover', border: `1px solid ${BDR}` }} />
            )}
            <div>
              <h1 style={{ fontFamily: DISP, fontSize: 'clamp(26px,5vw,40px)', color: TXT, letterSpacing: 1, lineHeight: 1.1, margin: '0 0 6px' }}>
                {org.courseName} {org.country && countryFlag(org.country)}
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>{org.location}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {org.badge && <BadgePill badge={org.badge} />}
            {org.is_founding_member && (
              <span title="Founding Member" style={{ color: ORG, fontSize: 14 }}>✦ Founding Member</span>
            )}
            <span style={{ fontFamily: SANS, fontSize: 11, color: MUT, background: BG3, border: `1px solid ${BDR}`, padding: '2px 9px' }}>
              {entries.length} drives · {totalPlayers} players
            </span>
            {simCount > 0 && (
              <span style={{ fontFamily: SANS, fontSize: 11, color: DIM, background: BG3, border: `1px solid ${BDR}`, padding: '2px 9px' }}>
                {officialCount} official · {simCount} simulator
              </span>
            )}
          </div>
        </div>

        {/* Club record */}
        {best && (
          <div style={{ background: 'linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))', border: '1px solid rgba(163,230,53,0.22)', padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 6, textTransform: 'uppercase' }}>Club Record</div>
              <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: .5 }}>{best.player}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, marginTop: 3 }}>
                {best.club} · HCP {best.hcp} · {fmtDate(best.date)}
                {best.is_simulator && <span style={{ marginLeft: 6, color: DIM }}>(simulator)</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: DISP, fontSize: 48, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{cv(best.dist)}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>{ul}</div>
            </div>
          </div>
        )}

        {/* Week controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <button
            onClick={() => setAllTime(v => !v)}
            style={{ background: allTime ? ORG : 'transparent', border: `1px solid ${allTime ? ORG : BDR}`, color: allTime ? '#111' : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '7px 14px', cursor: 'pointer' }}>
            {allTime ? 'All Time ✓' : 'All Time'}
          </button>
          {!allTime && (
            <>
              <button onClick={() => setWeek(prevWeek(week))} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: SANS, fontSize: 13, padding: '7px 12px', cursor: 'pointer' }}>&#8249;</button>
              <span style={{ fontFamily: SANS, fontSize: 13, color: TXT, fontWeight: 600 }}>{weekLabel(week)}</span>
              <button onClick={() => setWeek(nextWeek(week))} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: SANS, fontSize: 13, padding: '7px 12px', cursor: 'pointer' }}>&#8250;</button>
            </>
          )}
        </div>

        {/* Leaderboard table */}
        <div style={{ overflowX: 'auto', border: `1px solid ${BDR}`, background: BG2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                {['Rank', 'Player', 'Distance', 'Club', 'HCP', 'Age', 'Gender', 'Date', 'Tier'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: DIM, textTransform: 'uppercase', textAlign: 'left', borderBottom: `2px solid ${BDR}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekEntries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: DIM }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT }}>{e.player}</div>
                    {e.is_simulator && <div style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>simulator</div>}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: DISP, fontSize: 20, color: ORG, whiteSpace: 'nowrap' }}>
                    {cv(e.dist)} <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{ul}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.club}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.hcp}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.age}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.gender === 'female' ? '♀' : '♂'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 11, color: DIM, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: ORG }}>{tier(e.dist)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {weekEntries.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: DIM, fontFamily: SANS, fontSize: 13 }}>
              No drives for this period
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 40, borderTop: `1px solid ${BDR}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>Simulator player? Tag your drive to this venue.</div>
          <Link href="/register" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: ORG, textDecoration: 'none', border: `1px solid ${ORG}`, padding: '10px 20px', letterSpacing: 0.5 }}>
            REGISTER FREE &rarr;
          </Link>
        </div>

      </div>
    </>
  );
}
