import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier, toSlug } from '../../lib/constants';
import { SEED_ENTRIES, SEED_ORGS } from '../../lib/data';
import { BadgePill, countryFlag, Overlay } from '../../components/UI';
import ShareModal from '../../components/ShareModal';

export async function getStaticPaths() {
  const paths = SEED_ENTRIES.map(e => ({ params: { id: e.id } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const entry = SEED_ENTRIES.find(e => e.id === params.id);
  if (!entry) return { notFound: true };
  const org = SEED_ORGS.find(o => o.id === entry.orgId);
  return { props: { staticEntry: entry, staticOrg: org || null }, revalidate: 3600 };
}

export default function DrivePage({ staticEntry, staticOrg, entries, orgs, cvt, unitLbl }) {
  const router = useRouter();
  const { id } = router.query;
  const [shareOpen, setShareOpen] = useState(false);

  const entry = entries?.find(e => e.id === id) || staticEntry;
  const org = orgs?.find(o => o.id === entry?.orgId) || staticOrg;

  if (!entry) return (
    <div style={{ padding:'80px 18px', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize:28, color:TXT, marginBottom:12 }}>Drive Not Found</div>
      <button onClick={()=>router.back()} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px 24px', cursor:'pointer' }}>← Back</button>
    </div>
  );

  const distDisplay = cvt ? cvt(entry.dist) : entry.dist;
  const unit = unitLbl || 'yds';

  return (
    <>
      <Head>
        <title>{entry.player} — {distDisplay} {unit} | Ripping Bombs</title>
        <meta name="description" content={`${entry.player} hit ${distDisplay} ${unit} at ${org?.courseName||'a course'} on ${fmtDate(entry.date)}. Verified competition drive on Ripping Bombs.`}/>
        <meta property="og:title" content={`${entry.player} — ${distDisplay} ${unit} | Ripping Bombs`}/>
        <meta property="og:description" content={`${entry.player} hit ${distDisplay} ${unit} at ${org?.courseName||'a course'}. Verified competition drive.`}/>
        <meta property="og:url" content={`https://www.rippingbombs.com/drive/${entry.id}`}/>
      </Head>

      <div style={{ padding:'28px 18px 80px', maxWidth:680, margin:'0 auto' }}>
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:ORG, fontFamily:SANS, fontWeight:600, fontSize:13, cursor:'pointer', padding:'0 0 22px', display:'flex', alignItems:'center', gap:6 }}>
          ← Back
        </button>

        <div style={{ background:BG2, border:'1px solid rgba(163,230,53,0.25)', padding:'32px 28px', marginBottom:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, right:0, width:200, height:200, background:'rgba(163,230,53,0.03)', borderRadius:'0 0 0 200px' }}/>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:12 }}>Verified Competition Drive</div>
          <div style={{ fontFamily:DISP, fontSize:'clamp(28px,6vw,42px)', color:TXT, letterSpacing:.5, lineHeight:1.1, marginBottom:6 }}>
            {entry.player}
            {org?.country && countryFlag(org.country)}
          </div>
          <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:24 }}>
            {org?.courseName}{entry.tournament?` · ${entry.tournament}`:''} · {fmtDate(entry.date)}
          </div>

          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:8 }}>
            <span style={{ fontFamily:DISP, fontSize:'clamp(64px,12vw,96px)', color:ORG, letterSpacing:2, lineHeight:1 }}>{distDisplay}</span>
            <span style={{ fontFamily:SANS, fontSize:18, color:MUT }}>{unit}</span>
          </div>
          <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:ORG, marginBottom:24 }}>{tier(entry.dist)}</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
            {[['Club',entry.club],['Handicap',entry.hcp],['Age',`${entry.age} yrs`],['Gender',entry.gender==='female'?'♀ Female':'♂ Male'],['Event',entry.tournament||'—'],['Course',org?.courseName||'—'],['Location',org?.location||'—'],['Date',fmtDate(entry.date)]].map(([k,v])=>(
              <div key={k} style={{ background:BG3, padding:'10px 14px' }}>
                <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:DIM, letterSpacing:1.2, marginBottom:3, textTransform:'uppercase' }}>{k}</div>
                <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:TXT }}>{String(v)}</div>
              </div>
            ))}
          </div>

          {org?.badge && <div style={{ marginBottom:16 }}><BadgePill badge={org.badge}/></div>}
          {entry.photo && <img src={entry.photo} alt="Drive evidence" style={{ width:'100%', maxHeight:240, objectFit:'cover', marginBottom:16 }}/>}

          <button onClick={()=>setShareOpen(true)}
            style={{ background:`linear-gradient(135deg,${ORG},#bef264)`, border:'none', color:'#111', fontFamily:SANS, fontWeight:700, fontSize:13, padding:'14px 24px', cursor:'pointer', letterSpacing:.5, width:'100%' }}>
            ↗ SHARE THIS DRIVE
          </button>
        </div>

        {org && (
          <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'16px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
            onClick={()=>router.push(`/clubs/${toSlug(org.courseName)}`)}>
            <div>
              <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{org.courseName}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginTop:2 }}>{org.location} — View all drives from this club</div>
            </div>
            <span style={{ color:ORG, fontSize:18 }}>›</span>
          </div>
        )}

        <div style={{ background:'#0e0e0e', border:'1px solid rgba(163,230,53,0.2)', padding:'24px 20px', textAlign:'center' }}>
          <div style={{ fontFamily:DISP, fontSize:22, color:'#fff', letterSpacing:1, marginBottom:8 }}>GOT A BIG HITTER AT YOUR CLUB?</div>
          <div style={{ fontFamily:SANS, fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:16 }}>Register free and submit your competition results to the global leaderboard.</div>
          <button onClick={()=>router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px 24px', cursor:'pointer', letterSpacing:.5 }}>
            REGISTER YOUR CLUB FREE →
          </button>
        </div>
      </div>

      {shareOpen && <ShareModal entry={entry} org={org} cvt={cvt||(d=>d)} unitLbl={unit} onClose={()=>setShareOpen(false)}/>}
    </>
  );
}
