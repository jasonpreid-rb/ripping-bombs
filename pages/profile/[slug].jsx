import { cloneElement } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier } from '../../lib/constants';
import { countryFlag, BadgePill } from '../../components/UI';
import PlayerAvatar from '../../components/PlayerAvatar';

export function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Category thresholds: Youth <16, Senior 55+, High Handicap 15+.
// Age/Senior checks take priority so a 15-year-old is always Youth,
// never "Women High Handicap" etc.
function getCategory(entry) {
  const age = Number(entry?.age);
  const hcp = Number(entry?.hcp);
  const isFemale = entry?.gender === 'female';

  if (!Number.isNaN(age) && age < 16) return 'Youth';
  if (!Number.isNaN(age) && age >= 55) return 'Senior';
  if (isFemale) return !Number.isNaN(hcp) && hcp >= 15 ? 'Women High Handicap' : 'Women';
  return !Number.isNaN(hcp) && hcp >= 15 ? 'Men High Handicap' : 'Men';
}

// ——— Peer-group bands (age / handicap) — mirrors dashboard.jsx exactly, so a
// player's band never disagrees between their dashboard and public profile.
const AGE_BANDS = [
  { min: 0, max: 17, label: 'Under 18' },
  { min: 18, max: 24, label: '18–24' },
  { min: 25, max: 34, label: '25–34' },
  { min: 35, max: 44, label: '35–44' },
  { min: 45, max: 54, label: '45–54' },
  { min: 55, max: 64, label: '55–64' },
  { min: 65, max: 200, label: '65+' },
];

const HCP_BANDS = [
  { min: 0, max: 5, label: '0–5' },
  { min: 6, max: 10, label: '6–10' },
  { min: 11, max: 15, label: '11–15' },
  { min: 16, max: 20, label: '16–20' },
  { min: 21, max: 27, label: '21–27' },
  { min: 28, max: 54, label: '28+' },
];

function getBand(value, bands) {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return bands.find((b) => n >= b.min && n <= b.max) || null;
}

// Same threshold as dashboard.jsx — below this, hide the rank rather than show "#1 of 1".
const MIN_BAND_SIZE = 5;

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('accountType', 'simulator')
    .eq('status', 'approved');

  if (!clubs) return { notFound: true };

  const org = clubs.find(c => {
    if (c.customSlug && c.customSlug === slug) return true;
    const base = nameToSlug(c.fullName);
    const withId = `${base}-${c.id}`;
    return base === slug || withId === slug;
  });

  if (!org) return { notFound: true };

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('orgId', org.id)
    .eq('is_simulator', true)
    .order('date', { ascending: false });

  const playerEntries = entries || [];
  const personalBest = playerEntries.length
    ? [...playerEntries].sort((a, b) => Number(b.dist) - Number(a.dist))[0]
    : null;

  // Rank against the whole platform (every entry, official + simulator),
  // one personal best per account (orgId), so a player isn't out-ranked
  // by their own multiple submissions.
  let globalRank = null, globalTotal = 0, category = null, categoryRank = null, categoryTotal = 0;
  let ageGroupRank = null, ageGroupTotal = 0, ageGroupLabel = null;
  let hcpGroupRank = null, hcpGroupTotal = 0, hcpGroupLabel = null;

  if (personalBest) {
    const { data: allEntries } = await supabase
      .from('entries')
      .select('orgId, dist, gender, age, hcp');

    if (allEntries && allEntries.length) {
      const bestByOrg = new Map();
      for (const e of allEntries) {
        const cur = bestByOrg.get(e.orgId);
        if (!cur || Number(e.dist) > Number(cur.dist)) bestByOrg.set(e.orgId, e);
      }
      const bests = [...bestByOrg.values()];

      const sortedGlobal = [...bests].sort((a, b) => Number(b.dist) - Number(a.dist));
      globalTotal = sortedGlobal.length;
      globalRank = sortedGlobal.findIndex(e => e.orgId === org.id) + 1;
      if (globalRank === 0) globalRank = null; // this org's best wasn't in allEntries (edge case)

      category = getCategory(personalBest);
      const categoryPeers = bests.filter(e => getCategory(e) === category);
      const sortedCategory = [...categoryPeers].sort((a, b) => Number(b.dist) - Number(a.dist));
      categoryTotal = sortedCategory.length;
      categoryRank = sortedCategory.findIndex(e => e.orgId === org.id) + 1;
      if (categoryRank === 0) categoryRank = null;

      // Age Group / Handicap Group rank — narrower cuts than the main
      // category, same "one best drive per account" comparison, restricted
      // to accounts whose best-in-category entry falls in the same band as
      // this player's. Mirrors dashboard.jsx's peer-group rank exactly.
      const myAgeBand = getBand(personalBest.age, AGE_BANDS);
      const myHcpBand = getBand(personalBest.hcp, HCP_BANDS);

      if (myAgeBand) {
        const inBand = bests.filter(e => {
          const b = getBand(e.age, AGE_BANDS);
          return b && b.label === myAgeBand.label;
        });
        if (inBand.length >= MIN_BAND_SIZE) {
          const sortedBand = [...inBand].sort((a, b) => Number(b.dist) - Number(a.dist));
          const idx = sortedBand.findIndex(e => e.orgId === org.id);
          if (idx !== -1) {
            ageGroupRank = idx + 1;
            ageGroupTotal = sortedBand.length;
            ageGroupLabel = myAgeBand.label;
          }
        }
      }

      if (myHcpBand) {
        const inBand = bests.filter(e => {
          const b = getBand(e.hcp, HCP_BANDS);
          return b && b.label === myHcpBand.label;
        });
        if (inBand.length >= MIN_BAND_SIZE) {
          const sortedBand = [...inBand].sort((a, b) => Number(b.dist) - Number(a.dist));
          const idx = sortedBand.findIndex(e => e.orgId === org.id);
          if (idx !== -1) {
            hcpGroupRank = idx + 1;
            hcpGroupTotal = sortedBand.length;
            hcpGroupLabel = myHcpBand.label;
          }
        }
      }
    }
  }

  return {
    props: {
      org,
      playerEntries,
      slug,
      globalRank,
      globalTotal,
      category,
      categoryRank,
      categoryTotal,
      ageGroupRank,
      ageGroupTotal,
      ageGroupLabel,
      hcpGroupRank,
      hcpGroupTotal,
      hcpGroupLabel,
    },
  };
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: BG3, border: `1px solid ${BDR}`, padding: '18px 20px' }}>
      <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DIM, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: DISP, fontSize: 28, color: accent ? ORG : TXT, letterSpacing: 0.5 }}>{value}</div>
    </div>
  );
}

function FoundingBadge() {
  return (
    <span title="One of the first 50 members to join Ripping Bombs" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #78350f, #92400e)', color: '#fbbf24', border: '1px solid #b45309', borderRadius: 20, padding: '2px 10px', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: 'help' }}>
      ★ Founding Member
    </span>
  );
}

function SimulatorBadge() {
  return (
    <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: '2px 10px', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      Simulator
    </span>
  );
}

// Standalone hero strip for global rank — mirrors the dashboard's RankStrip
function RankStrip({ rank, total, category }) {
  if (!rank) return null;
  const percentile = total ? Math.round((rank / total) * 100) : null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,0,144,0.14), rgba(255,0,144,0.03))',
      border: '1px solid rgba(255,0,144,0.35)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: DISP, fontSize: 42, color: ORG, letterSpacing: 0.5, lineHeight: 1 }}>#{rank}</span>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: TXT, textTransform: 'uppercase', letterSpacing: 1 }}>Global Rank</span>
        {category && (
          <span style={{ background: 'rgba(255,255,255,0.08)', color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: '3px 11px', fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
            {category}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {percentile != null && (
          <span style={{ background: 'rgba(255,0,144,0.16)', color: ORG, border: '1px solid rgba(255,0,144,0.3)', borderRadius: 20, padding: '4px 12px', fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
            Top {percentile}% globally
          </span>
        )}
        {total > 0 && (
          <span style={{ fontFamily: SANS, fontSize: 12, color: MUT }}>of {total.toLocaleString()} players worldwide</span>
        )}
      </div>
    </div>
  );
}

// Peer-group rank strip — Age Group and Handicap Group ranks, mirrors
// dashboard.jsx's PeerGroupRankStrip so the two surfaces feel like one product.
function PeerGroupRankStrip({ show, ageGroupRank, ageGroupTotal, ageGroupLabel, hcpGroupRank, hcpGroupTotal, hcpGroupLabel }) {
  if (!show) return null;
  return (
    <div style={{
      background: BG2,
      border: `1px solid ${BDR}`,
      padding: '20px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 24,
      marginBottom: 32,
    }}>
      <PeerGroupColumn label="Age Group Rank" rank={ageGroupRank} total={ageGroupTotal} tag={ageGroupLabel && `Age ${ageGroupLabel}`} muted="No age on file" />
      <PeerGroupColumn label="Handicap Group Rank" rank={hcpGroupRank} total={hcpGroupTotal} tag={hcpGroupLabel && `${hcpGroupLabel} Handicap`} muted="No handicap on file" />
    </div>
  );
}

function PeerGroupColumn({ label, rank, total, tag, muted }) {
  const percentile = rank && total ? Math.round((rank / total) * 100) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
      <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DIM, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</div>
      {rank ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: 0.5 }}>#{rank}</span>
            {total > 0 && <span style={{ fontFamily: SANS, fontSize: 11, color: DIM }}>of {total}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {tag && (
              <span style={{ background: 'rgba(255,255,255,0.08)', color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: '2px 9px', fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>
                {tag}
              </span>
            )}
            {percentile != null && (
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>Top {percentile}%</span>
            )}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>{muted}</div>
      )}
    </div>
  );
}

function SocialHandle({ handle, href, icon }) {
  if (!handle) return null;
  const clean = handle.replace(/^@/, '');
  return (
    <a
      href={`${href}${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12, color: MUT, textDecoration: 'none', border: `1px solid ${BDR}`, padding: '6px 12px', borderRadius: 4 }}
    >
      <span>{icon}</span>
      <span>@{clean}</span>
    </a>
  );
}

export default function PlayerProfile({ org, playerEntries, globalRank, globalTotal, category, categoryRank, categoryTotal, ageGroupRank, ageGroupTotal, ageGroupLabel, hcpGroupRank, hcpGroupTotal, hcpGroupLabel }) {
  const sorted = [...playerEntries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const best = sorted[0];
  const avgDist = playerEntries.length
    ? Math.round(playerEntries.reduce((sum, e) => sum + Number(e.dist), 0) / playerEntries.length)
    : null;

  const profileName = org.fullName;
  const metaDesc = `${profileName}'s golf drive stats on Ripping Bombs. Personal best: ${best ? best.dist + ' yds' : 'N/A'}. ${playerEntries.length} recorded drives.`;
  const hasSocials = org.instagram || org.tiktok || org.twitter || org.youtube;
  const canonicalUrl = `https://www.rippingbombs.com/profile/${org.customSlug || nameToSlug(org.fullName)}`;

  const sameAs = [
    org.instagram ? `https://instagram.com/${org.instagram.replace(/^@/,'')}` : null,
    org.twitter   ? `https://x.com/${org.twitter.replace(/^@/,'')}` : null,
    org.youtube   ? `https://youtube.com/@${org.youtube.replace(/^@/,'')}` : null,
    org.tiktok    ? `https://tiktok.com/@${org.tiktok.replace(/^@/,'')}` : null,
  ].filter(Boolean);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profileName,
    url: canonicalUrl,
    description: metaDesc,
    ...(org.location && { homeLocation: { '@type': 'Place', name: org.location } }),
    ...(sameAs.length && { sameAs }),
    ...(best && {
      knowsAbout: 'Golf',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Personal Best Drive', value: `${best.dist} yards` },
        { '@type': 'PropertyValue', name: 'Total Drives', value: playerEntries.length },
        ...(avgDist ? [{ '@type': 'PropertyValue', name: 'Average Drive', value: `${avgDist} yards` }] : []),
        ...(globalRank ? [{ '@type': 'PropertyValue', name: 'Global Rank', value: `#${globalRank} of ${globalTotal}` }] : []),
        ...(categoryRank ? [{ '@type': 'PropertyValue', name: `${category} Rank`, value: `#${categoryRank} of ${categoryTotal}` }] : []),
        ...(ageGroupRank ? [{ '@type': 'PropertyValue', name: `Age ${ageGroupLabel} Rank`, value: `#${ageGroupRank} of ${ageGroupTotal}` }] : []),
        ...(hcpGroupRank ? [{ '@type': 'PropertyValue', name: `${hcpGroupLabel} Handicap Rank`, value: `#${hcpGroupRank} of ${hcpGroupTotal}` }] : []),
      ],
    }),
  };

  return (
    <>
      <Head>
        <title>{profileName} - Golf Drive Stats | Ripping Bombs</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${profileName} - Golf Drive Stats | Ripping Bombs`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:site_name" content="Ripping Bombs" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${profileName} - Golf Drive Stats`} />
        <meta name="twitter:description" content={metaDesc} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </Head>

      <div style={{ padding: '28px 18px 80px', maxWidth: 900, margin: '0 auto' }}>

        {/* Header — mirrors the player dashboard header layout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <PlayerAvatar fullName={org.fullName} avatarUrl={org.avatarUrl} size={72} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                {org.country && (
                  <span title={org.country} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {cloneElement(countryFlag(org.country), { style: { width: 'clamp(38px,6.5vw,58px)', height: 'clamp(28px,5vw,42px)', objectFit: 'cover', borderRadius: 4, display: 'block' } })}
                  </span>
                )}
                <h1 style={{ margin: 0, fontFamily: DISP, fontSize: 'clamp(28px,5vw,42px)', color: TXT, letterSpacing: 0.5, lineHeight: 1 }}>
                  {profileName}
                </h1>
                {org.is_founding_member && <FoundingBadge />}
                {org.badge === 'simulator' && <SimulatorBadge />}
                {org.badge && org.badge !== 'simulator' && <BadgePill badge={org.badge} />}
              </div>
              {(org.location || org.simulator) && (
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 13, color: MUT }}>
                  {[org.location, org.simulator].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <Link href="/leaderboard" style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '10px 16px', fontFamily: SANS, fontSize: 13, textDecoration: 'none' }}>
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Global rank — standalone hero strip, same as the dashboard */}
        <RankStrip rank={globalRank} total={globalTotal} category={category} />

        {/* Peer-group ranks — narrower, more attainable cuts than the strip above */}
        <PeerGroupRankStrip
          show={!!globalRank}
          ageGroupRank={ageGroupRank}
          ageGroupTotal={ageGroupTotal}
          ageGroupLabel={ageGroupLabel}
          hcpGroupRank={hcpGroupRank}
          hcpGroupTotal={hcpGroupTotal}
          hcpGroupLabel={hcpGroupLabel}
        />

        {hasSocials && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            <SocialHandle handle={org.instagram} href="https://instagram.com/" icon="Instagram" />
            <SocialHandle handle={org.tiktok}    href="https://tiktok.com/@"   icon="TikTok" />
            <SocialHandle handle={org.twitter}   href="https://x.com/"         icon="X" />
            <SocialHandle handle={org.youtube}   href="https://youtube.com/@"  icon="YouTube" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          <StatCard label="Personal Best" value={best ? `${best.dist} yds` : '-'} accent />
          <StatCard label="Avg Distance"  value={avgDist ? `${avgDist} yds` : '-'} />
          <StatCard label="Total Drives"  value={playerEntries.length || '-'} />
          {best && <StatCard label="Best Tier" value={tier(best.dist)} />}
        </div>

        <div>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: 'uppercase', marginBottom: 12 }}>Drive History</div>
          {playerEntries.length === 0 ? (
            <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, padding: '32px 0' }}>No drives recorded yet.</div>
          ) : (
            <div style={{ border: `1px solid ${BDR}`, background: BG2, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr>
                    {['Date', 'Distance', 'Club', 'HCP', 'Age', 'Gender', 'Event', 'Tier'].map(col => (
                      <th key={col} style={{ padding: '10px 14px', fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DIM, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'left', borderBottom: `2px solid ${BDR}` }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: DIM }}>{fmtDate(e.date)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontFamily: DISP, fontSize: 18, color: i === 0 ? ORG : TXT }}>{e.dist}</span>
                        <span style={{ fontFamily: SANS, fontSize: 10, color: DIM, marginLeft: 3 }}>yds</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.club || '-'}</td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.hcp}</td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.age}</td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.gender === 'female' ? 'Female' : 'Male'}</td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: DIM }}>{e.tournament || '-'}</td>
                      <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: ORG }}>{tier(e.dist)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, borderTop: `1px solid ${BDR}`, paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>Want your drives on the global leaderboard?</div>
          <Link href="/register" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: ORG, textDecoration: 'none', border: `1px solid ${ORG}`, padding: '10px 20px', letterSpacing: 0.5 }}>
            REGISTER FREE
          </Link>
        </div>

      </div>
    </>
  );
}
