import Head from 'next/head';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

export function SeoPage({ title, description, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}/>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
      </Head>
      <div style={{ padding:'0 18px 80px', maxWidth:1000, margin:'0 auto' }}>
        {children}
      </div>
    </>
  );
}

export function SeoH1({ children }) {
  return <h1 style={{ fontFamily:DISP, fontSize:'clamp(28px,5vw,48px)', color:TXT, letterSpacing:1, marginBottom:12, lineHeight:1.1, marginTop:28 }}>{children}</h1>;
}

export function SeoH2({ children }) {
  return <h2 style={{ fontFamily:DISP, fontSize:'clamp(20px,3vw,28px)', color:TXT, letterSpacing:1, margin:'32px 0 12px' }}>{children}</h2>;
}

export function SeoP({ children }) {
  return <p style={{ fontFamily:SANS, fontSize:14, color:MUT, lineHeight:1.85, marginBottom:16 }}>{children}</p>;
}

export function SeoTable({ headers, rows }) {
  return (
    <div style={{ overflowX:'auto', marginBottom:24 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', background:BG2, border:`1px solid ${BDR}` }}>
        <thead>
          <tr>{headers.map(h=><th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:1, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,i)=><tr key={i} style={{ borderBottom:`1px solid ${BDR}` }}>
            {row.map((cell,j)=><td key={j} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13, color:j===0?TXT:MUT }}>{cell}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function SeoCTA() {
  const router = useRouter();
  return (
    <div style={{ background:'rgba(255,0,144,0.05)', border:'1px solid rgba(255,0,144,0.2)', padding:'28px 24px', margin:'32px 0', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:1, marginBottom:8 }}>TRACK YOUR CLUB'S LONGEST DRIVES</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:18 }}>Free to join. Register your course and start submitting verified drives to the global leaderboard.</div>
      <button onClick={()=>router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
        REGISTER YOUR CLUB FREE →
      </button>
    </div>
  );
}

export function FilteredLeaderboard({ title, description, heading, intro, entries, orgs, filter, cvt, unitLbl }) {
  const router = useRouter();
  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);
  const filtered = [...entries]
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .filter(filter)
    .sort((a, b) => b.dist - a.dist);

  return (
    <SeoPage title={`${title} | Ripping Bombs`} description={description}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>Global Leaderboard</div>
      <SeoH1>{heading}</SeoH1>
      <SeoP>{intro}</SeoP>

      {filtered.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:28 }}>
          {filtered.slice(0,3).map((e,i)=>{
            const org = orgFor(e.orgId);
            return (
              <div key={e.id} style={{ background:BG2, border:`1px solid ${i===0?'rgba(255,0,144,0.3)':BDR}`, padding:'20px 20px 18px' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{['🥇','🥈','🥉'][i]}</div>
                <div style={{ fontFamily:DISP, fontSize:40, color:ORG, letterSpacing:1, lineHeight:1 }}>{cvt(e.dist)}</div>
                <div style={{ fontFamily:SANS, fontSize:10, color:DIM, marginBottom:6 }}>{unitLbl}</div>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:TXT }}>{e.player}</div>
                <div style={{ fontFamily:SANS, fontSize:11, color:MUT, marginTop:3 }}>{org?.courseName}</div>
                <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:2 }}>{e.club} · HCP {e.hcp}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2, marginBottom:32 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
          <thead>
            <tr>{['Rank','Player','Distance','Club Used','HCP','Age','Course','Date'].map(h=>(
              <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>{
              const org = orgFor(e.orgId);
              return (
                <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}`, cursor:'pointer' }}
                  onClick={()=>router.push(`/drive/${e.id}`)}
                  onMouseEnter={el=>el.currentTarget.style.background='rgba(255,0,144,0.04)'}
                  onMouseLeave={el=>el.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:DIM }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{e.player}</td>
                  <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:20, color:ORG }}>{cvt(e.dist)} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl}</span></td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.club}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.hcp}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.age}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{org?.courseName||'—'}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{e.date}</td>
                </tr>
              );
            })}
            {filtered.length===0&&<tr><td colSpan={8} style={{ padding:'48px 0', textAlign:'center', fontFamily:SANS, fontSize:13, color:DIM }}>No entries yet in this category</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ background:'#0e0e0e', border:'1px solid rgba(255,0,144,0.2)', padding:'28px 24px', textAlign:'center' }}>
        <div style={{ fontFamily:DISP, fontSize:24, color:'#fff', letterSpacing:1, marginBottom:8 }}>DOES YOUR CLUB HAVE A BIG HITTER?</div>
        <div style={{ fontFamily:SANS, fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:16 }}>Register free and submit your competition longest drive results to the global leaderboard.</div>
        <button onClick={()=>router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
          REGISTER YOUR CLUB FREE →
        </button>
      </div>
    </SeoPage>
  );
}
