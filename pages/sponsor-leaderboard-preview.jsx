import Head from 'next/head';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

// Static replica of the live leaderboard page, for positioning review only.
// Uses sample rows instead of Supabase data and skips interactivity
// (filters/sorting/drag-scroll aren't wired up) — this page exists purely
// to show exactly where the Option B sponsor block sits relative to the
// real header, week nav, and table. Not linked anywhere, not in
// lib/seoPages.js, not in the sitemap.
const SAMPLE_ROWS = [
  { rank:'🥇', player:'Jake Morrison', dist:'412 yds', club:'TaylorMade Qi10', hcp:'2', age:'25-40', gender:'♂', course:'Simulator', date:'Aug 17' },
  { rank:'🥈', player:'Ana Kovac',     dist:'398 yds', club:'Callaway Paradym', hcp:'5', age:'25-40', gender:'♀', course:'Simulator', date:'Aug 16' },
  { rank:'🥉', player:'Tom Reilly',    dist:'391 yds', club:'Ping G430',      hcp:'8', age:'40-55', gender:'♂', course:'Simulator', date:'Aug 15' },
  { rank:'#4', player:'Sam Ortiz',     dist:'385 yds', club:'Titleist TSR3',  hcp:'12',age:'25-40', gender:'♂', course:'Simulator', date:'Aug 15' },
];

export default function SponsorLeaderboardPreview() {
  return (
    <>
      <Head>
        <title>Sponsor Placement Preview | Ripping Bombs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{padding:'28px 18px 80px',maxWidth:1000,margin:'0 auto'}}>
        <h1 style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:1,marginBottom:8,fontWeight:400}}>Global Golf Longest Drive Leaderboard</h1>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:20}}>
          New rankings every week — submit your drive to compete in this week's championship.{' '}
          <span style={{color:ORG,textDecoration:'none',borderBottom:'1px solid rgba(255,0,144,0.3)'}}>See how venues rank &rarr;</span>
        </div>

        {/* Sponsor block — Option B, final position */}
        <div style={{textAlign:'center',fontFamily:SANS,fontSize:10,color:DIM,letterSpacing:1.2,textTransform:'uppercase',marginBottom:8}}>
          Proudly brought to you by
        </div>
        <a
          href="https://pissmissileballs.com/"
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display:'flex',alignItems:'center',justifyContent:'center',
            marginBottom:20,padding:'10px 16px',
            background:'#F2F913',border:`1px solid ${BDR}`,
            textDecoration:'none',
          }}
        >
          <img
            src="https://pissmissileballs.com/cdn/shop/files/Group_3.svg?v=1762540896&width=600"
            alt="Piss Missile Balls"
            style={{height:52,width:'auto',display:'block'}}
          />
        </a>

        {/* Week nav */}
        <div style={{background:'linear-gradient(135deg,rgba(255,0,144,0.14),rgba(255,0,144,0.03))',border:`1px solid rgba(255,0,144,0.3)`,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
            <button disabled style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:14,padding:'8px 13px',opacity:1}}>‹</button>
            <div>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,textTransform:'uppercase',marginBottom:3}}>🏆 Weekly Championship</div>
              <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5}}>Week of Aug 17, 2026</div>
            </div>
            <button disabled style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:14,padding:'8px 13px'}}>›</button>
          </div>
          <button style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:'8px 16px',whiteSpace:'nowrap'}}>View All-Time →</button>
        </div>

        {/* Filter bar (static) */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
          <button style={{display:'flex',alignItems:'center',gap:8,background:'transparent',border:`1px solid ${BDR}`,color:TXT,fontFamily:SANS,fontWeight:600,fontSize:13,padding:'9px 14px'}}>
            <span style={{display:'flex',flexDirection:'column',gap:3,width:14}}>
              <span style={{height:2,background:TXT}}/>
              <span style={{height:2,background:TXT}}/>
              <span style={{height:2,background:TXT}}/>
            </span>
            Filters
            <span style={{fontSize:10,color:DIM,marginLeft:2}}>▾</span>
          </button>
          <div style={{minWidth:160}}>
            <div style={{background:BG2,border:`1px solid ${BDR}`,padding:'9px 28px 9px 12px',color:TXT,fontFamily:SANS,fontSize:13}}>Sort: Distance</div>
          </div>
        </div>

        {/* Static sample table */}
        <div style={{border:`1px solid ${BDR}`,background:BG2}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
            <thead>
              <tr>
                {['Rank','Player','Distance','Club','HCP','Age','Gender','Course','Date'].map(col=>(
                  <th key={col} style={{padding:'11px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.2,color:DIM,textTransform:'uppercase',textAlign:'left',borderBottom:`2px solid ${BDR}`}}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${BDR}`}}>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:DIM}}>{r.rank}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:13,color:TXT,fontWeight:600}}>{r.player}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:13,color:ORG,fontWeight:700}}>{r.dist}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.club}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.hcp}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.age}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.gender}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.course}</td>
                  <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
