import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate } from '../lib/constants';
export default function Page({ entries=[], orgs=[], cvt=d=>d, unitLbl='yds' }) {
  const approvedOrgs = orgs.filter(o=>o.status==='approved');
  const orgFor = id => orgs.find(o=>o.id===id);
  const allTimeBest = [...entries].filter(e=>approvedOrgs.find(o=>o.id===e.orgId)).sort((a,b)=>b.dist-a.dist).slice(0,10);
  return (
    <SeoPage title="Longest Golf Drive Ever | World Records | Ripping Bombs" description="What is the longest golf drive ever hit? Explore world records, professional long drive records, and the top verified competition drives on Ripping Bombs.">
      <SeoH1>Longest Golf Drive Ever</SeoH1>
      <SeoP>The longest golf drive ever recorded in competition is a topic that captures the imagination of every golfer who has ever stood on a tee and tried to stripe one. From professional long drive champions to amateur club golfers, the pursuit of distance is universal.</SeoP>
      <SeoH2>The World Long Drive Record</SeoH2>
      <SeoP>The world record for the longest drive in a sanctioned long drive competition is held by Mike Austin, who hit a drive of 515 yards at the US Senior National Open Qualifier in 1974. In professional long drive competition, drives of 400+ yards are common among the elite, with the longest verified shots in World Long Drive Association events exceeding 480 yards.</SeoP>
      <SeoH2>Top 10 Longest Drives On Ripping Bombs</SeoH2>
      <div style={{overflowX:'auto',border:`1px solid ${BDR}`,background:BG2,marginBottom:24}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
          <thead><tr>{['Rank','Player','Distance','Course','Club Used'].map(h=><th key={h} style={{padding:'10px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1,color:ORG,textTransform:'uppercase',textAlign:'left',borderBottom:`2px solid ${BDR}`,background:BG3}}>{h}</th>)}</tr></thead>
          <tbody>
            {allTimeBest.map((e,i)=>{const org=orgFor(e.orgId);return <tr key={e.id} style={{borderBottom:`1px solid ${BDR}`}}>
              <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:13,color:MUT}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
              <td style={{padding:'10px 14px',fontFamily:SANS,fontWeight:700,color:TXT}}>{e.player}</td>
              <td style={{padding:'10px 14px',fontFamily:DISP,fontSize:20,color:ORG}}>{cvt(e.dist)} <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>{unitLbl}</span></td>
              <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{org?.courseName||'—'}</td>
              <td style={{padding:'10px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.club}</td>
            </tr>;})}
          </tbody>
        </table>
      </div>
      <SeoH2>What Makes A Drive Go Far?</SeoH2>
      <SeoP>The longest drives in history share common factors: high swing speed (130mph+), an upward angle of attack, optimal launch conditions (low spin, high launch), and ideal weather conditions. Professional long drive competitors train specifically for maximum speed, often swinging at 140–150mph with custom equipment.</SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/hall-of-fame" style={linkStyle}>Hall Of Fame</Link>{' · '}
        <Link href="/longest-drive-amateur" style={linkStyle}>Longest Drive Amateur</Link>{' · '}
        <Link href="/longest-drive-scratch-golfer" style={linkStyle}>Longest Drive Scratch Golfer</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
