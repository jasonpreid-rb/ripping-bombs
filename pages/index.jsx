import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate } from '../lib/constants';
import EmailSignup from '../components/EmailSignup';
import { countryFlag } from '../components/UI';
import PlayerAvatar from '../components/PlayerAvatar';

// ── Inline percentile calculator (embedded on homepage) ──────────────────────

const CALC_BENCHMARKS = {
  male:   { youth:{scratch:250,low:235,mid:215,high:190}, adult:{scratch:285,low:260,mid:235,high:205}, senior:{scratch:255,low:235,mid:215,high:190} },
  female: { youth:{scratch:195,low:180,mid:165,high:145}, adult:{scratch:225,low:205,mid:185,high:160}, senior:{scratch:200,low:185,mid:170,high:150} },
};
const CALC_SPREAD = 28;
function calcAgeGroup(age) { if(age<18)return'youth'; if(age>=55)return'senior'; return'adult'; }
function calcHcpBand(hcp)  { if(hcp<=4)return'scratch'; if(hcp<=12)return'low'; if(hcp<=20)return'mid'; return'high'; }
function calcPercentile(z) {
  const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp((-z*z)/2);
  let p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return z>0?1-p:p;
}
function calcVerdict(topPct) {
  if(topPct<=5)  return{label:'💥 ELITE BOMBER',  color:'#ff9900'};
  if(topPct<=15) return{label:'🔥 BIG HITTER',    color:'#a3e635'};
  if(topPct<=35) return{label:'💪 ABOVE AVERAGE', color:'#a3e635'};
  if(topPct<=65) return{label:'⛳ RIGHT IN THE MIX',color:'#e8e8e8'};
  return               {label:'📈 ROOM TO GROW',  color:'#666'};
}

function AnimatedCalcResult({ result, hcp, gender }) {
  const topPct = 100 - result.pct;
  const verdict = calcVerdict(topPct);
  const [displayPct, setDisplayPct] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setDisplayPct(0); setBarWidth(0); setVisible(false);
    const t = setTimeout(() => {
      setVisible(true);
      const duration = 1400, start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayPct(Math.round(eased * topPct));
        setBarWidth(eased * result.pct);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    }, 80);
    return () => { clearTimeout(t); if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [result]);

  return (
    <div style={{marginTop:28,paddingTop:28,borderTop:'1px solid rgba(255,255,255,0.1)',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(12px)',transition:'opacity 0.4s ease,transform 0.4s ease'}}>
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{display:'inline-block',fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:2,color:verdict.color,border:`1px solid ${verdict.color}`,padding:'5px 14px',textTransform:'uppercase',marginBottom:16}}>
          {verdict.label}
        </div>
        <div style={{fontFamily:DISP,fontSize:'clamp(52px,10vw,88px)',color:ORG,letterSpacing:1,lineHeight:1}}>
          TOP {displayPct}%
        </div>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginTop:8,marginBottom:24}}>
          You out-drive roughly <strong style={{color:TXT}}>{result.pct}%</strong> of similar golfers
          {' '}({result.ag==='youth'?'under 18':result.ag==='senior'?'55+':'18–54'}, hcp {hcp}, {gender==='male'?'men':'women'}).
        </div>
      </div>
      <div style={{marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',fontFamily:SANS,fontSize:10,color:DIM,marginBottom:6,letterSpacing:1}}>
          <span>SHORT HITTERS</span><span>LONG HITTERS</span>
        </div>
        <div style={{height:10,background:'rgba(255,255,255,0.06)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${barWidth}%`,background:'linear-gradient(90deg,rgba(255,0,144,0.3),#a3e635)'}}/>
          <div style={{position:'absolute',top:-2,bottom:-2,left:`${barWidth}%`,width:3,background:'#fff',boxShadow:'0 0 8px rgba(255,255,255,0.8)'}}/>
        </div>
        <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:6,textAlign:'center'}}>
          Estimated average for your group: ~{result.avg} yds
        </div>
      </div>
    </div>
  );
}

function InlineCalculator({ router }) {
  const [dist,setDist]     = useState('');
  const [hcp,setHcp]       = useState('');
  const [age,setAge]       = useState('');
  const [gender,setGender] = useState('male');
  const [result,setResult] = useState(null);

  function calculate() {
    const d=Number(dist),h=Number(hcp),a=Number(age);
    if(!d||isNaN(h)||!a) return;
    const ag=calcAgeGroup(a),hb=calcHcpBand(h);
    const avg=CALC_BENCHMARKS[gender][ag][hb];
    const z=(d-avg)/CALC_SPREAD;
    const pct=Math.max(1,Math.min(99,Math.round(calcPercentile(z)*100)));
    setResult({pct,avg,ag});
    if(typeof window!=='undefined'&&window.gtag)
      window.gtag('event','homepage_percentile_calculated',{event_category:'engagement',distance:d,handicap:h,age_group:ag,gender,percentile:pct});
  }

  const inp = {width:'100%',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',padding:'11px 14px',color:'#fff',fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',borderRadius:0};
  const lbl = {display:'block',fontFamily:SANS,fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:5,textTransform:'uppercase',letterSpacing:1};

  return (
    <div style={{position:'relative',zIndex:1,maxWidth:700,margin:'0 auto',width:'100%'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'0 12px',marginBottom:14}}>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Distance (yds)<span style={{color:ORG,marginLeft:2}}>*</span></label>
          <input type="number" value={dist} onChange={e=>setDist(e.target.value)} placeholder="e.g. 240" min={50} max={400} style={inp}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Handicap<span style={{color:ORG,marginLeft:2}}>*</span></label>
          <input type="number" value={hcp} onChange={e=>setHcp(e.target.value)} placeholder="e.g. 14" min={0} max={54} style={inp}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Age<span style={{color:ORG,marginLeft:2}}>*</span></label>
          <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 35" min={5} max={99} style={inp}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Gender<span style={{color:ORG,marginLeft:2}}>*</span></label>
          <select value={gender} onChange={e=>setGender(e.target.value)} style={inp}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={calculate} style={{background:ORG,color:'#000',fontFamily:SANS,fontWeight:700,fontSize:14,padding:'13px 28px',border:'none',cursor:'pointer',letterSpacing:.5}}>
          CALCULATE MY RANK →
        </button>
        {result && (
          <button onClick={()=>{setDist('');setHcp('');setAge('');setGender('male');setResult(null);}}
            style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.6)',fontFamily:SANS,fontWeight:600,fontSize:13,padding:'13px 20px',cursor:'pointer'}}>
            RESET
          </button>
        )}
      </div>
      {result && (
        <>
          <AnimatedCalcResult result={result} hcp={hcp} gender={gender}/>
          <div style={{marginTop:20,textAlign:'center'}}>
            <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:13,padding:'11px 26px',cursor:'pointer',letterSpacing:.5}}>
              SUBMIT YOUR REAL DRIVE →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage({ entries: propEntries=[], orgs: propOrgs=[], setDetEnt, cvt, unitLbl, staticEntries=[], staticOrgs=[] }) {
  const entries = staticEntries.length ? staticEntries : propEntries;
  const orgs = staticOrgs.length ? staticOrgs : propOrgs;
  const router = useRouter();
  const approvedOrgs = orgs.filter(o=>o.status==='approved');
  const [openFaq, setOpenFaq] = useState(null);

  const orgFor = id => orgs.find(o=>o.id===id);

  // Week number helper
  const getWeekNumber = (dateStr) => {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  };

  const now = new Date();
  const currentWeek = getWeekNumber(now.toISOString().slice(0,10));
  const currentYear = now.getFullYear();
  const approved = entries.filter(e => approvedOrgs.find(o => o.id === e.orgId));

  const CATEGORIES = [
    { key:'mens',       label:'Men',                  icon:'♂',  filter: e => e.gender==='male'   && Number(e.age)>=16 && Number(e.age)<=54 && Number(e.hcp)<20  },
    { key:'mens_hcp',   label:'Men High Handicap',    icon:'♂',  filter: e => e.gender==='male'   && Number(e.age)>=16 && Number(e.age)<=54 && Number(e.hcp)>=20 },
    { key:'womens',     label:'Women',                icon:'♀',  filter: e => e.gender==='female' && Number(e.age)>=16 && Number(e.age)<=54 && Number(e.hcp)<20  },
    { key:'womens_hcp', label:'Women High Handicap',  icon:'♀',  filter: e => e.gender==='female' && Number(e.age)>=16 && Number(e.age)<=54 && Number(e.hcp)>=20 },
    { key:'youth',      label:'Youth (Under 16)',     icon:'🌱', filter: e => Number(e.age) < 16 },
    { key:'senior',     label:'Senior (55+)',         icon:'⭐', filter: e => Number(e.age) >= 55 },
  ];

  const weeklyLeaders = CATEGORIES.map(cat => {
    const top3 = approved
      .filter(e => getWeekNumber(e.date) === currentWeek && new Date(e.date).getFullYear() === currentYear)
      .filter(cat.filter)
      .sort((a,b) => Number(b.dist) - Number(a.dist)).slice(0,3);
    return { ...cat, top3 };
  });

  const allTimeLeaders = CATEGORIES.map(cat => {
    const top3 = approved.filter(cat.filter).sort((a,b) => Number(b.dist) - Number(a.dist)).slice(0,3);
    return { ...cat, top3 };
  });

  const faqs = [
    {q:'What is Ripping Bombs?',a:"Ripping Bombs is a global registry of longest drives from golf tournaments, events, and simulator sessions around the world — creating a unified leaderboard of the game's biggest hitters."},
    {q:'Who can register and submit?',a:"Anyone. Golf clubs, tournament organisers, driving ranges, and individual golfers with simulator access can all register for free and submit their longest drives to the global leaderboard."},
    {q:'Why should golf courses get involved?',a:"Courses benefit by turning one of golf's most exciting moments — the longest drive — into an ongoing attraction. Run official 'Big Hitter' competitions, increase engagement, attract younger golfers, and be featured as an official Ripping Bombs location."},
    {q:'Why should tournament organisers participate?',a:'Event organisers get an always-on longest drive leaderboard, increased player engagement, shareable results for social media, additional sponsorship opportunities, and a digital footprint beyond the tournament weekend.'},
    {q:'Can I submit simulator drives?',a:'Yes. Individual golfers can register a simulator account and submit drives recorded on a launch monitor or simulator, with a screenshot as evidence. Simulator entries are clearly badged on the leaderboard.'},
    {q:'How are drives verified?',a:'Verification depends on entry type. Club and event submissions require photo or scorecard evidence and are submitted by the organiser. Simulator submissions require a screenshot of the readout as evidence.'},
    {q:"Is this just for professionals?",a:"Not at all. Ripping Bombs is for everyone who plays golf — from casual weekend players to long drive competitors. If you've ever said 'I absolutely smoked that one,' you belong on the leaderboard."},
    {q:"What's the goal of Ripping Bombs?",a:'To create the first global benchmark for driving distance in golf — a system where the best big hitters in the world can be recognised, ranked, and compared internationally.'},
  ];

  const MEDALS = ['🥇','🥈','🥉'];

  // Weekly card — single best entry
  const WeeklyCard = ({ cat }) => {
    const { top3 } = cat;
    return (
      <div style={{background:BG2,border:`1px solid ${top3.length?'rgba(255,0,144,0.2)':BDR}`,padding:'16px 18px',display:'flex',flexDirection:'column',gap:0,minWidth:0}}>
        <span style={{fontFamily:SANS,fontSize:10,color:ORG,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>{cat.icon} {cat.label}</span>
        {top3.length === 0 ? (
          <div style={{fontFamily:SANS,fontSize:12,color:DIM,lineHeight:1.6}}>No entry yet —<br/>be the first!</div>
        ) : (
          top3.map((e, i) => {
            const org = orgFor(e.orgId);
            return (
              <div key={e.id}
                onClick={()=>setDetEnt && setDetEnt(e)}
                style={{display:'flex',flexDirection:'column',gap:4,padding:'10px 0',borderBottom:i<top3.length-1?`1px solid ${BDR}`:'none',cursor:'pointer',transition:'opacity .15s'}}
                onMouseEnter={ev=>ev.currentTarget.style.opacity='.7'}
                onMouseLeave={ev=>ev.currentTarget.style.opacity='1'}>
                {/* Top row: name + distance */}
                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,minWidth:0}}>
                    <span style={{fontSize:13,flexShrink:0}}>{MEDALS[i]}</span>
                    <span style={{fontFamily:SANS,fontWeight:700,fontSize:13,color:TXT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.player}</span>
                  </div>
                  <div style={{flexShrink:0,display:'flex',alignItems:'baseline',gap:2}}>
                    <span style={{fontFamily:DISP,fontSize:20,color:i===0?ORG:MUT,letterSpacing:.5}}>{Number(e.dist)}</span>
                    <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>yds</span>
                  </div>
                </div>
                {/* Bottom row: avatar + flag + sim/club */}
                <div style={{display:'flex',alignItems:'center',gap:6,paddingLeft:20}}>
                  <PlayerAvatar fullName={org?.fullName || e.player} avatarUrl={org?.avatarUrl} size={20} />
                  {org?.country && <span>{countryFlag(org.country)}</span>}
                  <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>
                    {e.is_simulator ? <span style={{color:'rgba(255,0,144,0.5)'}}>🖥️ Sim</span> : org?.courseName||'—'}
                  </span>
                </div>
              </div>
            );
          })
  const AllTimeCard = ({ cat }) => {
    const { top3 } = cat;
    return (
      <div style={{background:BG2,border:`1px solid ${top3.length?'rgba(255,0,144,0.15)':BDR}`,padding:'16px 18px',display:'flex',flexDirection:'column',gap:0,minWidth:0}}>
        <span style={{fontFamily:SANS,fontSize:10,color:MUT,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>{cat.icon} {cat.label}</span>
        {top3.length === 0 ? (
          <div style={{fontFamily:SANS,fontSize:12,color:DIM,lineHeight:1.6}}>No entry yet —<br/>be the first!</div>
        ) : (
          top3.map((e, i) => {
            const org = orgFor(e.orgId);
            return (
              <div key={e.id}
                onClick={()=>setDetEnt && setDetEnt(e)}
                style={{display:'flex',flexDirection:'column',gap:4,padding:'10px 0',borderBottom:i<top3.length-1?`1px solid ${BDR}`:'none',cursor:'pointer',transition:'opacity .15s'}}
                onMouseEnter={ev=>ev.currentTarget.style.opacity='.7'}
                onMouseLeave={ev=>ev.currentTarget.style.opacity='1'}>
                {/* Top row: name + distance */}
                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,minWidth:0}}>
                    <span style={{fontSize:13,flexShrink:0}}>{MEDALS[i]}</span>
                    <span style={{fontFamily:SANS,fontWeight:700,fontSize:13,color:TXT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.player}</span>
                  </div>
                  <div style={{flexShrink:0,display:'flex',alignItems:'baseline',gap:2}}>
                    <span style={{fontFamily:DISP,fontSize:20,color:i===0?ORG:MUT,letterSpacing:.5}}>{Number(e.dist)}</span>
                    <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>yds</span>
                  </div>
                </div>
                {/* Bottom row: avatar + flag + sim/club */}
                <div style={{display:'flex',alignItems:'center',gap:6,paddingLeft:20}}>
                  <PlayerAvatar fullName={org?.fullName || e.player} avatarUrl={org?.avatarUrl} size={20} />
                  {org?.country && <span>{countryFlag(org.country)}</span>}
                  <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>
                    {e.is_simulator ? <span style={{color:'rgba(255,0,144,0.5)'}}>🖥️ Sim</span> : org?.courseName||'—'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Ripping Bombs | Global Longest Golf Drive Database</title>
        <meta name="description" content="Track and compare the longest golf drives from tournaments worldwide. Ripping Bombs is the global leaderboard for longest drive competitions."/>
        <meta property="og:title" content="Ripping Bombs | Global Longest Golf Drive Database"/>
        <meta property="og:description" content="The global home of competition longest drives. Free to join, free to submit."/>
        <meta property="og:url" content="https://www.rippingbombs.com"/>
        <meta property="og:type" content="website"/>
      </Head>
      <div style={{animation:'fi .4s ease'}}>

        {/* HERO — video bg + condensed header + calculator */}
        <div id="distance-calculator" style={{position:'relative',overflow:'hidden'}}>
          <video autoPlay muted loop playsInline poster="https://images.pexels.com/videos/33511561/tee-shot-33511561.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block',filter:'brightness(0.35)'}}>
            <source src="https://videos.pexels.com/video-files/33511561/14252773_2560_1440_60fps.mp4" type="video/mp4"/>
          </video>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.7))'}}/>
          <div style={{position:'relative',zIndex:1,padding:'clamp(40px,8vw,72px) 20px clamp(48px,8vw,72px)',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
            {/* Condensed brand header */}
            <div style={{fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:4,color:ORG,textTransform:'uppercase',marginBottom:12,background:'rgba(255,0,144,0.15)',border:'1px solid rgba(255,0,144,0.4)',padding:'5px 16px',display:'inline-block'}}>
              The World's Longest Drive Leaderboard
            </div>
            <h1 style={{fontFamily:DISP,fontSize:'clamp(42px,8vw,72px)',color:'#ffffff',lineHeight:.95,letterSpacing:3,marginBottom:8,textShadow:'0 4px 32px rgba(0,0,0,0.5)'}}>
              EVERY DRIVE RANKS
            </h1>
            <p style={{fontFamily:SANS,fontSize:14,color:'rgba(255,255,255,0.65)',maxWidth:440,margin:'0 auto 36px',lineHeight:1.6,letterSpacing:.3}}>
              See where your drive ranks against golfers your age, handicap &amp; gender — instantly.{' '}
              <a href="/sim-distance-real-or-fake" style={{color:ORG,textDecoration:'underline'}}>
                Think your sim number might be inflated?
              </a>
            </p>
            {/* Calculator sits inside the hero */}
            <InlineCalculator router={router}/>
          </div>
        </div>

        {/* WEEKLY LEADERS */}
        <div style={{background:'#0e0e0e',borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`,padding:'40px 0 40px'}}>
          <div style={{maxWidth:1200,margin:'0 auto',padding:'0 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:6}}>Live from the Registry</div>
                <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5}}>Week {currentWeek}, {currentYear} — Category Leaders</div>
              </div>
              <button onClick={()=>router.push('/leaderboard')} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontWeight:600,fontSize:11,padding:'8px 18px',cursor:'pointer',letterSpacing:.5,whiteSpace:'nowrap'}}>Full Leaderboard →</button>
            </div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:-18,marginRight:-18,paddingLeft:18,paddingRight:18}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,minmax(200px,1fr))",gap:10,minWidth:1240}}>
                {weeklyLeaders.map(cat => <WeeklyCard key={cat.key} cat={cat}/>)}
              </div>
            </div>
          </div>
        </div>

        {/* ALL-TIME LEADERS */}
        <div style={{background:'#111',borderBottom:`1px solid ${BDR}`,padding:'40px 0 40px'}}>
          <div style={{maxWidth:1200,margin:'0 auto',padding:'0 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:MUT,textTransform:'uppercase',marginBottom:6}}>Hall of Records</div>
                <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5}}>All-Time Category Leaders</div>
              </div>
              <button onClick={()=>router.push('/leaderboard')} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontWeight:600,fontSize:11,padding:'8px 18px',cursor:'pointer',letterSpacing:.5,whiteSpace:'nowrap'}}>Full Leaderboard →</button>
            </div>
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',marginLeft:-18,marginRight:-18,paddingLeft:18,paddingRight:18}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(6,minmax(200px,1fr))',gap:10,minWidth:1240}}>
                {allTimeLeaders.map(cat => <AllTimeCard key={cat.key} cat={cat}/>)}
              </div>
            </div>
          </div>
        </div>

        {/* LIVE STATS TICKER */}
        {(() => {
          const totalDrives = approved.length;
          const countries = [...new Set(approvedOrgs.map(o=>o.country).filter(Boolean))].length;
          const clubs = approvedOrgs.filter(o=>o.accountType==='club').length;
          const stats = [
            { value: totalDrives, label: 'Drives Submitted' },
            { value: countries,   label: 'Countries' },
            { value: clubs,       label: 'Registered Clubs' },
          ];
          return (
            <div style={{background:'#0a0a0a',borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`,padding:'28px 18px'}}>
              <div style={{maxWidth:1000,margin:'0 auto',display:'flex',justifyContent:'center',flexWrap:'wrap'}}>
                {stats.map(({value,label},i)=>(
                  <div key={label} style={{flex:'1 1 160px',textAlign:'center',padding:'12px 24px',borderRight:i<stats.length-1?`1px solid ${BDR}`:'none'}}>
                    <div style={{fontFamily:DISP,fontSize:'clamp(36px,6vw,56px)',color:ORG,letterSpacing:1,lineHeight:1}}>{value}</div>
                    <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,color:MUT,letterSpacing:2,textTransform:'uppercase',marginTop:6}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 2027 CHAMPIONSHIP PROMO */}
        <div style={{background:'#120009',borderTop:'1px solid rgba(255,0,144,0.15)',borderBottom:'1px solid rgba(255,0,144,0.15)',padding:'56px 18px'}}>
          <div style={{maxWidth:1000,margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',gap:32}}>
            <div style={{flex:'1 1 280px',minWidth:0}}>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:12}}>Launching January 2027</div>
              <div style={{fontFamily:DISP,fontSize:'clamp(28px,4vw,48px)',color:TXT,letterSpacing:1,lineHeight:1,marginBottom:14}}>
                THE WORLD'S BIGGEST<br/><span style={{color:ORG}}>DRIVE COMPETITION</span>
              </div>
              <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.8,maxWidth:560,marginBottom:20}}>
                The Ripping Bombs 2027 Simulator Championship — six categories, one drive per week, points accumulating all season. Open to any registered simulator user, anywhere in the world, completely free. This could be the largest amateur golf competition ever run.
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {['🥇 100pts','🥈 70pts','🥉 50pts','4th 40pts','5th 30pts','6th 20pts','Any entry 10pts'].map((label,i)=>(
                  <div key={i} style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:i===0?ORG:MUT,background:'rgba(255,255,255,0.04)',border:`1px solid ${i===0?'rgba(255,0,144,0.3)':'rgba(255,255,255,0.08)'}`,padding:'5px 10px',letterSpacing:.3}}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10,flexShrink:0,width:'100%',maxWidth:260}}>
              <button onClick={()=>router.push('/2027-championship')} style={{background:ORG,color:'#000',fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 28px',border:'none',cursor:'pointer',letterSpacing:.5}}>
                FIND OUT MORE →
              </button>
              <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid rgba(255,0,144,0.3)`,color:ORG,fontFamily:SANS,fontWeight:600,fontSize:13,padding:'12px 28px',cursor:'pointer',letterSpacing:.5}}>
                Register Free
              </button>
            </div>
          </div>
        </div>

        <div style={{padding:'0 18px'}}>

          {/* FEATURE CARDS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:60,marginTop:60}}>
            {[
              {img:'https://images.pexels.com/photos/10463463/pexels-photo-10463463.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Global Long Drive Standings',body:'Compare verified drives from clubs, tournaments, and simulator sessions worldwide on one unified leaderboard.'},
              {img:'https://images.pexels.com/photos/12642295/pexels-photo-12642295.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Free for Clubs, Events & Individuals',body:'Golf clubs, tournament organisers, driving ranges, and individual simulator golfers can all register and submit for free.'},
              {img:'https://images.pexels.com/photos/6572962/pexels-photo-6572962.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Recognition for Big Hitters',body:"Give golfers a place to showcase huge drives, earn rankings, and represent their club or themselves on a global platform."},
            ].map(({img,title,body})=>(
              <div key={title} style={{background:BG2,border:`1px solid ${BDR}`,overflow:'hidden'}}>
                <div style={{height:160,overflow:'hidden'}}>
                  <img src={img} alt={title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
                <div style={{padding:'20px 22px 24px'}}>
                  <div style={{fontFamily:DISP,fontSize:21,color:TXT,letterSpacing:.5,marginBottom:8}}>{title}</div>
                  <div style={{fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.7}}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA STRIP */}
          <div style={{background:'rgba(255,0,144,0.05)',border:'1px solid rgba(255,0,144,0.2)',padding:'40px 32px',textAlign:'center',marginBottom:60}}>
            <div style={{fontFamily:DISP,fontSize:'clamp(24px,5vw,40px)',color:TXT,letterSpacing:1,marginBottom:10}}>FREE TO JOIN. FREE TO SUBMIT.</div>
            <div style={{fontFamily:SANS,fontSize:14,color:MUT,marginBottom:28}}>Built for golfers who love sending it.</div>
            <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 36px',borderRadius:0,cursor:'pointer'}}>REGISTER NOW FREE →</button>
          </div>

          {/* FAQ */}
          <div style={{marginBottom:60}}>
            <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:20}}>FAQ</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {faqs.map(({q,a},i)=>(
                <div key={i} style={{background:BG2,border:`1px solid ${openFaq===i?'rgba(255,0,144,0.25)':BDR}`,overflow:'hidden'}}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',gap:16}}>
                    <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:TXT,textAlign:'left'}}>{q}</span>
                    <span style={{fontFamily:SANS,fontSize:18,color:ORG,flexShrink:0,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span>
                  </button>
                  {openFaq===i&&<div style={{padding:'0 20px 18px',fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.75}}>{a}</div>}
                </div>
              ))}
            </div>
          </div>

        </div>
        <EmailSignup/>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { supabase } = await import('../lib/supabaseClient');

    const { data: entries } = await supabase
      .from('entries')
      .select('id, orgId, player, dist, club, hcp, age, gender, is_simulator, date, tournament')
      .order('dist', { ascending: false });

    const { data: orgs } = await supabase
      .from('clubs')
      .select('id, courseName, fullName, avatarUrl, country, status, badge, accountType')
      .eq('status', 'approved');

    return {
      props: {
        staticEntries: entries || [],
        staticOrgs: orgs || [],
      },
      revalidate: 600, // rebuild every 10 minutes
    };
  } catch {
    return {
      props: { staticEntries: [], staticOrgs: [] },
      revalidate: 60,
    };
  }
}
