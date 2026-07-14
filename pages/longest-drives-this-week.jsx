import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { nowWeek, weekLabel, sameWeek, fmtDate } from '../lib/constants';

export default function Page({ entries=[], orgs=[], cvt=d=>d, unitLbl='yds' }) {
  const approvedOrgs = orgs.filter(o=>o.status==='approved');
  const orgFor = id => orgs.find(o=>o.id===id);
  const thisWeek = nowWeek();
  const weekEntries = [...entries]
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .filter(e=>sameWeek(e.date,thisWeek))
    .sort((a,b)=>b.dist-a.dist)
    .slice(0,20);
  return (
    <SeoPage title="Longest Golf Drives Submitted This Week | Ripping Bombs" description="See the longest golf drives submitted this week from clubs and tournaments worldwide. Updated weekly on Ripping Bombs.">
      <SeoH1>Longest Golf Drives This Week</SeoH1>
      <SeoP>Updated every week, this page shows the longest verified competition drives submitted to the Ripping Bombs global database from registered clubs and tournament organisers around the world.</SeoP>
      <SeoH2>{weekLabel(thisWeek)}</SeoH2>
      <div style={{overflowX:'auto',border:`1px solid ${BDR}`,background:BG2,marginBottom:24}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
          <thead><tr>{['Rank','Player','Distance','Course','Location','Date'].map(h=><th key={h} style={{padding:'10px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1,color:ORG,textTransform:'uppercase',textAlign:'left',borderBottom:`2px solid ${BDR}`,background:BG3}}>{h}</th>)}</tr></thead>
          <tbody>
            {weekEntries.map((e,i)=>{
              const org=orgFor(e.orgId);
              return <tr key={e.id} style={{borderBottom:`1px solid ${BDR}`}}>
                <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:13,color:MUT}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                <td style={{padding:'10px 14px',fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</td>
                <td style={{padding:'10px 14px',fontFamily:DISP,fontSize:20,color:ORG}}>{cvt(e.dist)} <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>{unitLbl}</span></td>
                <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{org?.courseName||'—'}</td>
                <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{org?.location||'—'}</td>
                <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:11,color:DIM}}>{fmtDate(e.date)}</td>
              </tr>;
            })}
            {weekEntries.length===0&&<tr><td colSpan={6} style={{padding:'40px',textAlign:'center',fontFamily:SANS,fontSize:13,color:DIM}}>No drives submitted this week yet</td></tr>}
          </tbody>
        </table>
      </div>
      <SeoH2>How Are These Drives Verified?</SeoH2>
      <SeoP>Ripping Bombs features verified longest drives from golf events and golf simulators worldwide. Tournament results are submitted by registered clubs and organisers, while simulator drives are submitted by registered players and clearly marked as simulator entries.</SeoP>
      <SeoCTA/>y photo ev
    </SeoPage>
  );
}
