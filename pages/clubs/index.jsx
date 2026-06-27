import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { BadgePill, countryFlag } from '../../components/UI';

function toSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export async function getServerSideProps() {
  const { data: orgs } = await supabase
    .from('clubs')
    .select('id, courseName, fullName, location, country, logo, badge, accountType, status, is_founding_member')
    .eq('status', 'approved')
    .order('courseName', { ascending: true });

  const { data: entries } = await supabase
    .from('entries')
    .select('id, orgId, dist');

  return { props: { orgs: orgs || [], entries: entries || [] } };
}

export default function ClubsDirectoryPage({ orgs, entries }) {
  const router = useRouter();
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

  function handleClick(org) {
    if (org.accountType === 'simulator' && org.fullName) {
      router.push(`/profile/${nameToSlug(org.fullName)}`);
    } else {
      router.push(`/clubs/${toSlug(org.courseName)}`);
    }
  }

  return (
    <>
      <Head>
        <title>Golf Clubs &amp; Events Directory | Ripping Bombs</title>
        <meta name="description" content="Browse all registered golf clubs and events on the Ripping Bombs global longest drive database. Find clubs by country and location." />
      </Head>
      <div style={{ padding: '28px 18px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ fontFamily: DISP, fontSize: 36, color: TXT, letterSpacing: 1, marginBottom: 6 }}>Clubs &amp; Events</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 24 }}>All registered venues on the Ripping Bombs global database.</div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs or locations..."
          style={{ width: '100%', background: BG2, border: `1px solid ${BDR}`, padding: '11px 16px', fontFamily: SANS, fontSize: 14, color: TXT, outline: 'none', marginBottom: 28, boxSizing: 'border-box' }}
        />

        {letters.map(letter => (
          <div key={letter} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: DISP, fontSize: 22, color: ORG, letterSpacing: 1, marginBottom: 10, borderBottom: `2px solid rgba(163,230,53,0.15)`, paddingBottom: 6 }}>{letter}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {grouped[letter].map(org => {
                const clubEntries = entries.filter(e => e.orgId === org.id);
                const best = clubEntries.length ? Math.max(...clubEntries.map(e => Number(e.dist))) : null;
                return (
                  <div
                    key={org.id}
                    onClick={() => handleClick(org)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: BG2, border: `1px solid ${BDR}`, cursor: 'pointer', transition: 'all .15s', gap: 12, flexWrap: 'wrap' }}
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
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {approved.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: SANS, fontSize: 14, color: DIM }}>No clubs found</div>
        )}
      </div>
    </>
  );
}
