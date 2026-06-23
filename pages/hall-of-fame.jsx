import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { countryFlag } from '../components/UI';
import { useRouter } from 'next/router';

const MILESTONES = [300, 350, 400, 450, 500];

const linkStyle = { color: ORG, textDecoration: 'underline' };

export default function HallOfFame({ entries: propEntries=[], orgs: propOrgs=[], cvt, unitLbl, staticEntries=[], staticOrgs=[] }) {
  const router = useRouter();
  const entries = staticEntries.length ? staticEntries : propEntries;
  const orgs = staticOrgs.length ? staticOrgs : propOrgs;

  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);
  const approved = entries
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .map(e => ({ ...e, dist: Number(e.dist) }))
    .sort((a, b) => b.dist - a.dist);

  // All-time #1
  const allTimeRecord = approved[0] || null;

  // Country records — best drive per country
  const countryRecords = {};
  approved.forEach(e => {
    const org = orgFor(e.orgId);
    const country = org?.country;
    if (!country) return;
    if (!countryRecords[country] || e.dist > countryRecords[country].dist) {
      countryRecords[country] = e;
    }
  });
  const countryRecordsList = Object.entries(countryRecords)
    .map(([country, e]) => ({ country, entry: e, org: orgFor(e.orgId) }))
    .sort((a, b) => b.entry.dist - a.entry.dist);

  // Milestone firsts — first drive to ever cross each threshold, by date
  const byDateAsc = [...approved].sort((a, b) => new Date(a.date) - new Date(b.date));
  const milestoneFirsts = MILESTONES.map(threshold => {
    const first = byDateAsc.find(e => e.dist >= threshold);
    return { threshold, entry: first || null };
  });

  // Has anyone hit 500 yet?
  const has500 = milestoneFirsts.find(m => m.threshold === 500)?.entry;

  // Top 10 all-time
  const top10 = approved.slice(0, 10);

  return (
    <SeoPage
      title="Hall of Fame — Longest Drives & Records | Ripping Bombs"
      description="The Ripping Bombs Hall of Fame: the longest drives ever recorded, country-by-country records, and major distance milestones — including the chase for the first verified 500-yard drive."
    >
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Global Records
      </div>
      <SeoH1>Hall of Fame</SeoH1>
      <SeoP>
        Every record on this page is pulled live from verified drives submitted to the Ripping Bombs
        <Link href="/leaderboard" style={linkStyle}>leaderboard</Link> — country records, major distance milestones, and the chase for the first ever
        verified 500-yard drive. No fiction, no estimates: just the real numbers golfers around the
        world have put on the board. Drives from any <a href="/supported-simulators" style={{ color:ORG, textDecoration:'underline' }}>supported simulator</a>{' '}
        count toward these records, alongside drives from the golf course. Curious where you'd rank?
        Try our <a href="/how-far-do-i-drive-compared-to-others" style={{ color:ORG, textDecoration:'underline' }}>driving distance calculator</a>.
      </SeoP>

      {/* ALL-TIME RECORD HERO */}
      {allTimeRecord ? (
        <div style={{ background:'linear-gradient(135deg, rgba(255,0,144,0.1), rgba(255,0,144,0.02))', border:`1px solid rgba(255,0,144,0.3)`, padding:'32px 28px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🏆</div>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
            All-Time World Record
          </div>
          <div style={{ fontFamily:DISP, fontSize:'clamp(56px,12vw,96px)', color:ORG, letterSpacing:1, lineHeight:1 }}>
            {cvt ? cvt(allTimeRecord.dist) : allTimeRecord.dist}
          </div>
          <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginBottom:14 }}>{unitLbl || 'yards'}</div>
          <div style={{ fontFamily:SANS, fontWeight:700, fontSize:17, color:TXT, marginBottom:4 }}>
            {allTimeRecord.player}
          </div>
          <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>
            {orgFor(allTimeRecord.orgId)?.courseName || 'Simulator'}
            {orgFor(allTimeRecord.orgId)?.country ? ` · ${countryFlag(orgFor(allTimeRecord.orgId).country)}` : ''}
          </div>
          <button onClick={() => router.push(`/drive/${allTimeRecord.id}`)} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'10px 24px', cursor:'pointer', letterSpacing:.5, marginTop:18 }}>
            VIEW DRIVE →
          </button>
        </div>
      ) : (
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'32px 24px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:SANS, fontSize:13, color:DIM }}>Records will appear here once drives are submitted.</div>
        </div>
      )}

      {/* MILESTONE CHASE — 500 YARD TRACKER */}
      <SeoH2>The 500-Yard Chase</SeoH2>
      <SeoP>
        500 yards is the milestone every long drive golfer dreams about. Mike Austin's legendary
        515-yard drive in 1974 remains the most famous unofficial mark in golf history — read more
        on our <a href="/longest-golf-drive-ever" style={{ color:ORG, textDecoration:'underline' }}>longest drive ever recorded</a> page.
        On Ripping Bombs, we're tracking the first verified drive on our platform to break 500 —
        here's the progress so far.
      </SeoP>

      <div style={{ background: has500 ? 'rgba(255,0,144,0.06)' : BG2, border:`1px solid ${has500 ? 'rgba(255,0,144,0.3)' : BDR}`, padding:'24px', textAlign:'center', marginBottom:32 }}>
        {has500 ? (
          <>
            <div style={{ fontSize:24, marginBottom:8 }}>🎯</div>
            <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:2, color:ORG, textTransform:'uppercase', marginBottom:8 }}>
              500-Yard Barrier: BROKEN
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>
              <strong style={{ color:TXT }}>{has500.player}</strong> recorded the first verified 500+ yard drive on Ripping Bombs.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>
            <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:2, color:DIM, textTransform:'uppercase', marginBottom:8 }}>
              500-Yard Barrier: Still Standing
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>
              Current closest attempt: {allTimeRecord ? `${cvt ? cvt(allTimeRecord.dist) : allTimeRecord.dist} ${unitLbl || 'yds'}` : 'no submissions yet'}.
              {allTimeRecord ? ` That's ${Math.max(0, 500 - allTimeRecord.dist)} yards short of the milestone.` : ''}
            </div>
          </>
        )}
      </div>

      {/* MILESTONE TIMELINE */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:40 }}>
        {milestoneFirsts.map(({ threshold, entry }) => (
          <div key={threshold} style={{ display:'grid', gridTemplateColumns:'90px 1fr auto', alignItems:'center', gap:14, background:BG2, border:`1px solid ${BDR}`, padding:'14px 18px' }}>
            <div style={{ fontFamily:DISP, fontSize:20, color: entry ? ORG : DIM, letterSpacing:.5 }}>{threshold}+</div>
            {entry ? (
              <div>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>{entry.player}</div>
                <div style={{ fontFamily:SANS, fontSize:11, color:MUT }}>
                  {cvt ? cvt(entry.dist) : entry.dist} {unitLbl || 'yds'} · {orgFor(entry.orgId)?.courseName || 'Simulator'}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily:SANS, fontSize:12, color:DIM, fontStyle:'italic' }}>Not yet achieved — be the first</div>
            )}
            <div style={{ fontFamily:SANS, fontSize:11, color:DIM }}>{entry?.date || ''}</div>
          </div>
        ))}
      </div>

      {/* COUNTRY RECORDS */}
      <SeoH2>Country Records</SeoH2>
      <SeoP>
        The longest verified drive submitted from each country on the Ripping Bombs leaderboard.
        Think your country's record should be longer? Register and submit your drive to claim it.
      </SeoP>

      {countryRecordsList.length > 0 ? (
        <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2, marginBottom:40 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
            <thead>
              <tr>
                {['Country','Player','Distance','Course / Sim','Date'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countryRecordsList.map(({ country, entry, org }) => (
                <tr key={country} style={{ borderBottom:`1px solid ${BDR}`, cursor:'pointer' }} onClick={() => router.push(`/drive/${entry.id}`)}>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:18 }}>{countryFlag(country)}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>{entry.player}</td>
                  <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG }}>
                    {cvt ? cvt(entry.dist) : entry.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl || 'yds'}</span>
                  </td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{org?.courseName || 'Simulator'}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'28px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:SANS, fontSize:13, color:DIM }}>No country records yet — submit the first one for your country.</div>
        </div>
      )}

      {/* TOP 10 ALL-TIME */}
      <SeoH2>Top 10 All-Time</SeoH2>
      {top10.length > 0 ? (
        <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2, marginBottom:32 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
            <thead>
              <tr>
                {['Rank','Player','Distance','Country','Course / Sim','Date'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10.map((e, i) => {
                const org = orgFor(e.orgId);
                return (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}`, cursor:'pointer' }} onClick={() => router.push(`/drive/${e.id}`)}>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13, color:DIM }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{e.player}</td>
                    <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG }}>
                      {cvt ? cvt(e.dist) : e.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl || 'yds'}</span>
                    </td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:16 }}>{org?.country ? countryFlag(org.country) : '—'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{org?.courseName || 'Simulator'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{e.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'28px', textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:SANS, fontSize:13, color:DIM }}>No drives submitted yet.</div>
        </div>
      )}

      <SeoH2>What Counts as a Hall of Fame Drive?</SeoH2>
      <SeoP>
        Every drive shown here is a real submission to the Ripping Bombs leaderboard — verified with
        photo or launch monitor evidence at the time of submission. Records update automatically as
        new drives are submitted, so the rankings and milestones on this page are always current.
      </SeoP>

      <SeoH2>How Do I Get My Drive on This Page?</SeoH2>
      <SeoP>
        Register a free club or simulator account and submit your longest drive with photo evidence.
        If it's the longest in your country, breaks a distance milestone, or cracks the global top 10,
        it'll appear here automatically.
      </SeoP>

      {/* CTA */}
      <div style={{ background:'rgba(255,0,144,0.05)', border:'1px solid rgba(255,0,144,0.2)', padding:'28px 24px', margin:'32px 0', textAlign:'center' }}>
        <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:1, marginBottom:8 }}>
          THINK YOU CAN MAKE THE HALL OF FAME?
        </div>
        <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:18 }}>
          Register free and submit your longest drive to the global Ripping Bombs leaderboard.
        </div>
        <button onClick={() => router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
          REGISTER FREE →
        </button>
      </div>
    
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/longest-golf-drive-ever" style={linkStyle}>Longest Golf Drive Ever</Link>{' | '}
        <Link href="/longest-drive-amateur" style={linkStyle}>Longest Drive Amateur</Link>{' | '}
        <Link href="/longest-drive-scratch-golfer" style={linkStyle}>Longest Drive Scratch Golfer</Link>
      </SeoP>
    </SeoPage>
  );
}
