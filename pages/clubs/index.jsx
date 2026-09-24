import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP, nameToSlug } from '../../lib/constants';
import { BadgePill, countryFlag } from '../../components/UI';

export async function getServerSideProps() {
  const { data: orgs, error: orgsError } = await supabase
    .from('clubs')
    .select('id, courseName, fullName, location, country, logo, badge, accountType, status, is_founding_member, customSlug')
    .eq('status', 'approved')
    .order('courseName', { ascending: true });

  if (orgsError) console.error('clubs query error:', orgsError);

  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, orgId, dist');

  if (entriesError) console.error('entries query error:', entriesError);

  return { props: { orgs: orgs || [], entries: entries || [] } };
}

export default function ClubsDirectoryPage({ orgs, entries }) {
  const [search, setSearch] = useState('');

  // Only show clubs in this directory — simulators have their own profile pages
  const approved = orgs
    .filter(o => o.accountType === 'club')
    .filter(o => !search ||
      o.courseName.toLowerCase().includes(search.toLowerCase()) ||
      (o.location || '').toLowerCase().includes(search.toLowerCase())
    );

  const grouped = approved.reduce((acc, org) => {
    const letter = org.courseName[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(org);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <>
      <Head>
        <title>Golf Clubs &amp; Events Directory | Ripping Bombs</title>
        <meta name="description" content="Browse all registered golf clubs and events on the Ripping Bombs global longest drive database. Find clubs by country and location." />
      </Head>
      <div style={{ padding: '28px 18px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: DISP, fontSize: 36, color: TXT, letterSpacing: 1, marginBottom: 6, fontWeight: 400 }}>Clubs &amp; Events</h1>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 24 }}>All registered venues on the Ripping Bombs global database.</div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs or locations..."
          style={{ width: '100%', background: BG2, border: `1px solid ${BDR}`, padding: '11px 16px', fontFamily: SANS, fontSize: 14, color: TXT, outline: 'none', marginBottom: 28, boxSizing: 'border-box' }}
        />

        {letters.map(letter => (
          <div key={letter} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: DISP, fontSize: 22, color: ORG, letterSpacing: 1, marginBottom: 10, borderBottom: `2px solid rgba(255,0,144,0.15)`, paddingBottom: 6 }}>{letter}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {grouped[letter].map(org => {
                const clubEntries = entries.filter(e => e.orgId === org.id);
                const best = clubEntries.length ? Math.max(...clubEntries.map(e => Number(e.dist))) : null;
                return (
                  <Link
                    key={org.id}
                    href={`/clubs/${org.customSlug || nameToSlug(org.courseName)}`}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: BG2, border: `1px solid ${BDR}`, cursor: 'pointer', transition: 'all .15s', gap: 12, flexWrap: 'wrap', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ORG}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BDR}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {org.logo && <img src={org.logo} alt={org.courseName} style={{ width: 32, height: 32, objectFit: 'cover', border: `1px solid ${BDR}` }} />}
                      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: TXT }}>{org.courseName}</span>
                      {org.country && countryFlag(org.country)}
                      <span style={{ fontFamily: SANS, fontSize: 12, color: MUT }}>{org.location}</span>
                      {org.badge && <BadgePill badge={org.badge} small />}
                      {org.is_founding_member && <span style={{ fontFamily: SANS, fontSize: 11, color: ORG }}>✦ Founding</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {best && <span style={{ fontFamily: DISP, fontSize: 18, color: ORG }}>{best} <span style={{ fontFamily: SANS, fontSize: 11, color: DIM }}>yds best</span></span>}
                      <span style={{ fontFamily: SANS, fontSize: 11, color: MUT }}>{clubEntries.length} drive{clubEntries.length !== 1 ? 's' : ''}</span>
                      <span style={{ color: ORG, fontSize: 14 }}>›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {approved.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px', border: `1px dashed ${BDR}`, background: BG2 }}>
            <div style={{ fontFamily: DISP, fontSize: 22, color: ORG, letterSpacing: 1, marginBottom: 10 }}>
              {search ? 'No clubs match your search' : 'No clubs registered yet'}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
              {search
                ? 'Try a different name or location.'
                : "Be the first golf club to join the global longest drive leaderboard — it's free to set up."}
            </div>
            {!search && (
              <Link
                href="/for-venues"
                style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 700, fontSize: 14, color: '#000', background: ORG, padding: '12px 28px', textDecoration: 'none' }}
              >
                Register Your Club
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
