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

function RankPill({ label, rank, total, primary }) {
  if (!rank) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: primary ? 'linear-gradient(135deg,#FF0090,#ff66c4)' : BG3,
      border: `1px solid ${primary ? 'transparent' : BDR}`,
      padding: '10px 16px',
    }}>
      <div style={{ fontFamily: DISP, fontSize: 24, color: primary ? '#111' : ORG, lineHeight: 1 }}>#{rank}</div>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: primary ? 'rgba(0,0,0,0.65)' : DIM }}>{label}</div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: primary ? 'rgba(0,0,0,0.55)' : MUT }}>of {total} ranked</div>
      </div>
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

export default function PlayerProfile({ org, playerEntries, globalRank, globalTotal, category, categoryRank, categoryTotal }) {
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

        <Link href="/leaderboard" style={{ fontFamily: SANS, fontSize: 12, color: DIM, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
          &larr; Leaderboard
        </Link>

        {/* ✅ Fixed: was rgba(163,230,53,...) lime green — now neon pink */}
        <div style={{ marginTop: 24, marginBottom: 32, background: 'linear-gradient(135deg,rgba(255,0,144,0.1),rgba(255,0,144,0.03))', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 28px' }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>Player Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
            <PlayerAvatar fullName={org.fullName} avatarUrl={org.avatarUrl} size={72} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: DISP, fontSize: 'clamp(28px,5vw,42px)', color: TXT, letterSpacing: 0.5, lineHeight: 1 }}>
                {profileName}
              </div>
              {org.country && <span style={{ fontSize: 28 }}>{countryFlag(org.country)}</span>}
              {org.badge && <BadgePill badge={org.badge} />}
            </div>
          </div>
          {org.location && (
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: (hasSocials || globalRank || categoryRank) ? 16 : 0 }}>
              {org.location}{org.simulator ? ` · ${org.simulator}` : ''}
            </div>
          )}

          {(globalRank || categoryRank) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: hasSocials ? 16 : 0 }}>
              <RankPill label="Global Rank" rank={globalRank} total={globalTotal} primary />
              <RankPill label={`${category} Rank`} rank={categoryRank} total={categoryTotal} />
            </div>
          )}

          {hasSocials && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              <SocialHandle handle={org.instagram} href="https://instagram.com/" icon="Instagram" />
              <SocialHandle handle={org.tiktok}    href="https://tiktok.com/@"   icon="TikTok" />
              <SocialHandle handle={org.twitter}   href="https://x.com/"         icon="X" />
              <SocialHandle handle={org.youtube}   href="https://youtube.com/@"  icon="YouTube" />
            </div>
          )}
        </div>

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
