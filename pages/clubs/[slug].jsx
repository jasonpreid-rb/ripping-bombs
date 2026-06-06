import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { toSlug, fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../../lib/constants';
import { SEED_ORGS, SEED_ENTRIES } from '../../lib/data';
import { BadgePill, countryFlag } from '../../components/UI';

export async function getStaticPaths() {
  const paths = SEED_ORGS
    .filter(o => o.status === 'approved')
    .map(o => ({ params: { slug: toSlug(o.courseName) } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const org = SEED_ORGS.find(o => toSlug(o.courseName) === params.slug);
  if (!org) return { notFound: true };
  const entries = SEED_ENTRIES.filter(e => e.orgId === org.id);
  return {
    props: { staticOrg: org, staticEntries: entries },
    revalidate: 3600,
  };
}

export default function ClubPage({ staticOrg, staticEntries, orgs, entries, cvt, unitLbl }) {
  const router = useRouter();
  const { slug } = router.query;

  // Use live data if available, fall back to static
  const org = orgs?.find(o => toSlug(o.courseName) === slug) || staticOrg;
  const clubEntries = (entries?.filter(e => e.orgId === org?.id) || staticEntries).sort((a,b) => b.dist - a.dist);
  const best = clubEntries[0];

  const [week, setWeek] = useState(nowWeek());
  const [allTime, setAllTime] = useState(false);
  const weekEntries = allTime ? clubEntries : clubEntries.filter(e => sameWeek(e.date, week));

  if (!org) return (
    <div style={{ padding:'80px 18px', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize:28, color:TXT, marginBottom:12 }}>Club Not Found</div>
      <button onClick={()=>router.push('/clubs')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px 24px', cursor:'pointer' }}>← Back to Clubs</button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{org.courseName} | Ripping Bombs</title>
        <meta name="description" content={`Longest drive leaderboard for ${org.courseName}, ${org.location}. View all competition results on Ripping Bombs.`}/>
        <meta property="og:title" content={`${org.courseName} | Ripping Bombs`}/>
        <meta property="og:description" content={`See the longest drives from ${org.courseName} on the Ripping Bombs global leaderboard.`}/>
      </Head>
      <div style={{ padding:'28px 18px 80px', maxWidth:1000, margin:'0 auto' }}>
        <button onClick={()=>router.push('/clubs')} style={{ background:'none', border:'none', color:ORG, fontFamily:SANS, fontWeight:600, fontSize:13, cursor:'pointer', padding:'0 0 18px', display:'flex', alignItems:'center', gap:6 }}>
          ← Back to Clubs
        </button>

        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, flexWrap:'wrap', marginBottom:8 }}>
            <div>
              <h1 style={{ fontFamily:DISP, fontSize:'clamp(28px,6vw,42px)', color:TXT, letterSpacing:1, lineHeight:1.1, marginBottom:6 }}>
                {org.courseName} {org.country && countryFlag(org.country)}
              </h1>
              <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>{org.location}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:10 }}>
            {org.badge && <BadgePill badge={org.badge}/>}
            <span style={{ fontFamily:SANS, fontSize:11, color:MUT, background:BG3, border:`1px solid ${BDR}`, padding:'2px 9px' }}>{clubEntries.length} drives recorded</span>
          </div>
        </div>

        {best && (
          <div style={{ background:'linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))', border:'1px solid rgba(163,230,53,0.22)', padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:2, color:ORG, marginBottom:6, textTransform:'uppercase' }}>🏆 Club Record</div>
              <div style={{ fontFamily:DISP, fontSize:26, color:TXT, letterSpacing:.5 }}>{best.player}</div>
              <div style={{ fontFamily:SANS, fontSize:11, color:MUT, marginTop:3 }}>{best.club} · HCP {best.hcp} · {fmtDate(best.date)}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:DISP, fontSize:48, color:ORG, letterSpacing:1, lineHeight:1 }}>{cvt ? cvt(best.dist) : best.dist}</div>
              <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>{unitLbl || 'yds'}</div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, flexWrap:'wrap' }}>
          <button onClick={()=>setAllTime(v=>!v)} style={{ background:allTime?ORG:'transparent', border:`1px solid ${allTime?ORG:BDR}`, color:allTime?'#111':MUT, fontFamily:SANS, fontWeight:600, fontSize:12, padding:'7px 14px', cursor:'pointer' }}>
            {allTime?'All Time ✓':'All Time'}
          </button>
          {!allTime&&<>
            <button onClick={()=>setWeek(prevWeek(week))} style={{ background:'transparent', border:`1px solid ${BDR}`, color:MUT, fontFamily:SANS, fontSize:13, padding:'7px 12px', cursor:'pointer' }}>‹</button>
            <span style={{ fontFamily:SANS, fontSize:13, color:TXT, fontWeight:600 }}>{weekLabel(week)}</span>
            <button onClick={()=>setWeek(nextWeek(week))} style={{ background:'transparent', border:`1px solid ${BDR}`, color:MUT, fontFamily:SANS, fontSize:13, padding:'7px 12px', cursor:'pointer' }}>›</button>
          </>}
        </div>

        <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:520 }}>
            <thead>
              <tr>{['Rank','Player','Distance','Club','HCP','Age','Date','Tier'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:DIM, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {weekEntries.map((e,i)=>(
                <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}` }}>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:12, color:DIM }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{e.player}</td>
                  <td style={{ padding:'11px 14px', fontFamily:DISP, fontSize:20, color:ORG }}>{cvt ? cvt(e.dist) : e.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl||'yds'}</span></td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.club}</td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.hcp}</td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.age}</td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{fmtDate(e.date)}</td>
                  <td style={{ padding:'11px 14px', fontFamily:SANS, fontSize:10, fontWeight:600, color:ORG }}>{tier(e.dist)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {weekEntries.length===0&&<div style={{ padding:'48px 0', textAlign:'center', color:DIM, fontFamily:SANS, fontSize:13 }}>No drives for this period</div>}
        </div>
      </div>
    </>
  );
}
