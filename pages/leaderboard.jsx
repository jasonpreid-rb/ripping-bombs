import Head from 'next/head';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../lib/constants';
import { countryFlag, BadgePill } from '../components/UI';
import EntryModal from '../components/EntryModal';
import ShareModal from '../components/ShareModal';

const STICKY = { position:'sticky', zIndex:2 };
const RANK_W = 52;
const PLAYER_W = 180;

function LeaderTable({ rows, orgFor, onView, onShare, cvt, unitLbl }) {
  const COLS = ['Rank','Player','Distance','Club','HCP','Age','Gender','Course','Event','Date','Tier','Share'];
  return (
    <div style={{overflowX:'auto',border:`1px solid ${BDR}`,background:BG2}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
        <thead>
          <tr>
            {COLS.map((col,ci)=>{
              const rankSticky  = ci===0 ? {...STICKY,left:0,         background:'#0e0e0e',borderRight:`1px solid ${BDR}`} : {};
              const playerSticky= ci===1 ? {...STICKY,left:RANK_W,    background:'#0e0e0e',borderRight:`1px solid ${BDR}`} : {};
              return (
                <th key={col} style={{padding:'11px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.2,color:DIM,textTransform:'uppercase',textAlign:'left',borderBottom:`2px solid ${BDR}`,...rankSticky,...playerSticky}}>
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((e,ri)=>{
            const org=orgFor(e.orgId);
            const medal=ri===0?'🥇':ri===1?'🥈':ri===2?'🥉':null;
            const tdSticky = (left) => ({...STICKY, left, background:BG2, borderRight:`1px solid ${BDR}`});
            return (
              <tr key={e.id} onClick={()=>onView(e)} style={{cursor:'pointer',borderBottom:`1px solid ${BDR}`}}
                onMouseEnter={el=>{
                  el.currentTarget.style.background='rgba(163,230,53,0.04)';
                  [...el.currentTarget.querySelectorAll('td[data-sticky]')].forEach(td=>td.style.background='#1c201a');
                }}
                onMouseLeave={el=>{
                  el.currentTarget.style.background='transparent';
                  [...el.currentTarget.querySelectorAll('td[data-sticky]')].forEach(td=>td.style.background=BG2);
                }}>
                <td data-sticky="1" style={{...tdSticky(0),padding:'12px 14px',fontFamily:SANS,fontSize:12,color:DIM,minWidth:RANK_W}}>
                  {medal||`#${ri+1}`}
                </td>
                <td data-sticky="1" style={{...tdSticky(RANK_W),padding:'12px 14px',minWidth:PLAYER_W}}>
                  <span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</span>
                  {org?.country&&countryFlag(org.country)}
                </td>
                <td style={{padding:'12px 14px'}}><span style={{fontFamily:DISP,fontSize:20,color:ORG}}>{cvt(e.dist)}</span><span style={{fontFamily:SANS,fontSize:10,color:DIM,marginLeft:3}}>{unitLbl}</span></td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.club}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.hcp}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.age}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.gender==='female'?'♀ Female':e.gender==='male'?'♂ Male':'—'}</td>
                <td style={{padding:'12px 14px'}}><span style={{fontFamily:SANS,fontSize:12,color:MUT}}>{org?.courseName||'—'}</span>{org?.badge&&<span style={{marginLeft:6}}><BadgePill badge={org.badge} small/></span>}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:DIM}}>{e.tournament||'—'}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:11,color:DIM}}>{fmtDate(e.date)}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:10,fontWeight:600,color:ORG}}>{tier(e.dist)}</td>
                <td style={{padding:'12px 14px'}}>
                  <button onClick={ev=>{ev.stopPropagation();onShare(e);}} style={{background:`linear-gradient(135deg,${ORG},#bef264)`,border:'none',color:'#111',padding:'6px 12px',cursor:'pointer',fontSize:11,fontFamily:SANS,fontWeight:700,letterSpacing:.5}}>↗ SHARE</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length===0&&<div style={{padding:'56px 0',textAlign:'center',color:DIM,fontFamily:SANS,fontSize:13}}>No drives recorded for this selection</div>}
    </div>
  );
}

export default function LeaderboardPage(props) {
  const { entries=[], orgs=[], approvedOrgs=[], orgFor=()=>null, cvt=d=>d, unitLbl='yds',
    detEnt, setDetEnt, shareEnt, setShareEnt,
    week, setWeek, allTime, setAllTime,
    fCountry, setFCountry, fHcp, setFHcp, fAge, setFAge,
    fClub, setFClub, fPlayer, setFPlayer, fGender, setFGender,
    fSimulator, setFSimulator,
    sortBy, setSortBy } = props;

  const router = useRouter();
  const currentWeek = week || nowWeek();

  const hcpIn=(hcp,b)=>{if(!b)return true;if(b==='scratch')return hcp<=0;if(b==='low')return hcp>0&&hcp<=5;if(b==='mid')return hcp>5&&hcp<=14;if(b==='high')return hcp>14&&hcp<=28;if(b==='beginner')return hcp>28;return true;};
  const ageIn=(age,b)=>{if(!b)return true;if(b==='u25')return age<25;if(b==='25-40')return age>=25&&age<40;if(b==='40-55')return age>=40&&age<55;if(b==='55+')return age>=55;return true;};

  const tableRows = entries
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .filter(e=>allTime||sameWeek(e.date,currentWeek))
    .filter(e=>!fCountry||(orgFor(e.orgId)?.location||'').toLowerCase().includes(fCountry.toLowerCase()))
    .filter(e=>!fPlayer||e.player.toLowerCase().includes(fPlayer.toLowerCase()))
    .filter(e=>!fGender||e.gender===fGender)
    .filter(e=>!fSimulator||(fSimulator==='simulator'?e.is_simulator===true:e.is_simulator!==true))
    .filter(e=>hcpIn(e.hcp,fHcp))
    .filter(e=>ageIn(e.age,fAge))
    .filter(e=>!fClub||e.club.toLowerCase().includes(fClub.toLowerCase()))
    .sort((a,b)=>{if(sortBy==='hcp')return a.hcp-b.hcp;if(sortBy==='age')return a.age-b.age;if(sortBy==='club')return a.club.localeCompare(b.club);if(sortBy==='date')return new Date(b.date)-new Date(a.date);return b.dist-a.dist;});

  const allTimeBest=[...entries].filter(e=>approvedOrgs.find(o=>o.id===e.orgId)&&e.is_simulator!==true).sort((a,b)=>Number(b.dist)-Number(a.dist));

  return (
    <>
      <Head>
        <title>Global Golf Longest Drive Leaderboard | Ripping Bombs</title>
        <meta name="description" content="The global longest drive leaderboard. See verified competition results from clubs and tournaments worldwide on Ripping Bombs."/>
      </Head>
      <div style={{padding:'28px 18px 80px',maxWidth:1000,margin:'0 auto'}}>
        {/* Sample data CTA */}
        <div style={{background:'#0e0e0e',border:'1px solid rgba(163,230,53,0.2)',padding:'28px 28px 24px',marginBottom:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:20}}>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:8}}>Sample Data — Launching September 2026</div>
              <div style={{fontFamily:DISP,fontSize:'clamp(18px,3vw,28px)',color:'#fff',letterSpacing:.5,lineHeight:1.15,marginBottom:10}}>IS YOUR CLUB'S BIGGEST HITTER ON THE LEADERBOARD?</div>
              <div style={{fontFamily:SANS,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7,maxWidth:480}}>Register your club or event free on Ripping Bombs. Submit your longest drive competition winner to the global leaderboard.</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10,flexShrink:0}}>
              <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:'12px 24px',cursor:'pointer',letterSpacing:.5}}>REGISTER YOUR CLUB FREE →</button>
              <button onClick={()=>router.push('/register')} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',fontFamily:SANS,fontWeight:600,fontSize:12,padding:'12px 24px',cursor:'pointer',letterSpacing:.5}}>SUBMIT AN EVENT RESULT →</button>
            </div>
          </div>
        </div>

        {/* World record hero */}
        {allTimeBest[0]&&<div style={{background:'linear-gradient(135deg,rgba(163,230,53,0.12),rgba(163,230,53,0.04))',border:'1px solid rgba(163,230,53,0.25)',padding:'24px 28px',marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:18}}>
          <div>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:8,textTransform:'uppercase'}}>🏆 All-Time Record (Official)</div>
            <div style={{fontFamily:DISP,fontSize:34,color:TXT,letterSpacing:.5}}>{allTimeBest[0].player}</div>
            <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:4}}>{orgFor(allTimeBest[0].orgId)?.courseName} · {allTimeBest[0].club} · HCP {allTimeBest[0].hcp}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:DISP,fontSize:56,color:ORG,letterSpacing:1,lineHeight:1}}>{cvt(allTimeBest[0].dist)}</div>
            <div style={{fontFamily:SANS,fontSize:14,color:MUT,marginTop:2}}>{unitLbl}</div>
          </div>
        </div>}

        {/* Week nav */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
          <button onClick={()=>setAllTime(v=>!v)} style={{background:allTime?ORG:'transparent',border:`1px solid ${allTime?ORG:BDR}`,color:allTime?'#111':MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:'7px 14px',cursor:'pointer'}}>{allTime?'All Time ✓':'All Time'}</button>
          {!allTime&&<>
            <button onClick={()=>setWeek(prevWeek(currentWeek))} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:'7px 12px',cursor:'pointer'}}>‹</button>
            <span style={{fontFamily:SANS,fontSize:13,color:TXT,fontWeight:600}}>{weekLabel(currentWeek)}</span>
            <button onClick={()=>setWeek(nextWeek(currentWeek))} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:'7px 12px',cursor:'pointer'}}>›</button>
          </>}
        </div>

        {/* Filters */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8,marginBottom:20}}>
          {[
            {label:'Search Player',val:fPlayer,set:setFPlayer,ph:'Player name'},
            {label:'Gender',val:fGender,set:setFGender,ph:'All',opts:[['','All'],['male','♂ Male'],['female','♀ Female']]},
            {label:'Country/Region',val:fCountry,set:setFCountry,ph:'Filter by location'},
            {label:'Handicap',val:fHcp,set:setFHcp,ph:'All',opts:[['','All'],['scratch','Scratch'],['low','Low (1–5)'],['mid','Mid (6–14)'],['high','High (15–28)'],['beginner','Beginner (28+']]},
            {label:'Age Group',val:fAge,set:setFAge,ph:'All',opts:[['','All'],['u25','Under 25'],['25-40','25–40'],['40-55','40–55'],['55+','55+']]},
            {label:'Club Brand',val:fClub,set:setFClub,ph:'e.g. TaylorMade'},
            {label:'Sort By',val:sortBy,set:setSortBy,ph:'Distance',opts:[['dist','Distance'],['date','Date'],['hcp','Handicap'],['age','Age'],['club','Club']]},
            {label:'Entry Type',val:fSimulator,set:setFSimulator,ph:'All',opts:[['','All'],['official','🏌️ Official Only'],['simulator','🖥️ Simulator Only']]},
          ].map(({label,val,set,ph,opts})=>(
            <div key={label}>
              <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:5,textTransform:'uppercase'}}>{label}</div>
              {opts
                ?<div style={{position:'relative'}}><select value={val} onChange={e=>set(e.target.value)} style={{width:'100%',background:BG2,border:`1px solid ${BDR}`,padding:'8px 28px 8px 10px',color:val?TXT:DIM,fontFamily:SANS,fontSize:13,outline:'none',cursor:'pointer',appearance:'none'}}>
                  {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select><span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:DIM,fontSize:10}}>▾</span></div>
                :<input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',background:BG2,border:`1px solid ${BDR}`,padding:'8px 10px',color:TXT,fontFamily:SANS,fontSize:13,outline:'none'}}/>
              }
            </div>
          ))}
        </div>

        <LeaderTable rows={tableRows} orgFor={orgFor} onView={e=>setDetEnt&&setDetEnt(e)} onShare={e=>setShareEnt&&setShareEnt(e)} cvt={cvt} unitLbl={unitLbl}/>

        {detEnt&&<EntryModal entry={detEnt} org={orgFor(detEnt.orgId)} onClose={()=>setDetEnt(null)} onShare={e=>{setDetEnt(null);setShareEnt(e);}} cvt={cvt} unitLbl={unitLbl}/>}
        {shareEnt&&<ShareModal entry={shareEnt} org={orgFor(shareEnt.orgId)} cvt={cvt} unitLbl={unitLbl} onClose={()=>setShareEnt(null)}/>}
      </div>
    </>
  );
}
