import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier } from '../../lib/constants';
import { countryFlag, BadgePill } from '../../components/UI';

export function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
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

  return {
    props: {
      org,
      playerEntries: entries || [],
      slug,
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

export default function PlayerProfile({ org, playerEntries }) {
  const sorted = [...playerEntries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const best = sorted[0];
  const avgDist = playerEntries.length
    ? Math.round(playerEntries.reduce((sum, e) => sum + Number(e.dist), 0) / playerEntries.length)
    : null;

  const profileName = org.fullName;
  const metaDesc = `${profileName}'s golf drive stats on Ripping Bombs. Personal best: ${best ? best.dist + ' yds' : 'N/A'}. ${playerEntries.length} recorded drives.`;
  const hasSocials = org.instagram || org.tiktok || org.twitter || org.youtube;

  return (
    <>
      <Head>
        <title>{profileName} - Golf Drive Stats | Ripping Bombs</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={`${profileName} - Golf Drive Stats`} />
        <meta property="og:description" content={metaDesc} />
      </Head>

      <div style={{ padding: '28px 18px 80px', maxWidth: 900, margin: '0 auto' }}>

        <Link href="/leaderboard" style={{ fontFamily: SANS, fontSize: 12, color: DIM, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
          &larr; Leaderboard
        </Link>

        <div style={{ marginTop: 24, marginBottom: 32, background: 'linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))', border: '1px solid rgba(163,230,53,0.2)', padding: '28px 28px' }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>Player Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
            <div style={{ fontFamily: DISP, fontSize: 'clamp(28px,5vw,42px)', color: TXT, letterSpacing: 0.5, lineHeight: 1 }}>
              {profileName}
            </div>
            {org.country && <span style={{ fontSize: 28 }}>{countryFlag(org.country)}</span>}
            {org.badge && <BadgePill badge={org.badge} />}
          </div>
          {org.location && (
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: hasSocials ? 16 : 0 }}>
              {org.location}{org.simulator ? ` · ${org.simulator}` : ''}
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
