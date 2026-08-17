import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../lib/constants';
import { countryFlag, BadgePill } from '../components/UI';
import EntryModal from '../components/EntryModal';
import ShareModal from '../components/ShareModal';
import PlayerAvatar from '../components/PlayerAvatar';

const STICKY = { position:'sticky', zIndex:2 };
const RANK_W = 52;
const PLAYER_W = 180;

// Click-and-drag horizontal panning, matching the category-card rows on the
// homepage: native touch/trackpad momentum scrolling is left alone, mouse
// users get grab-to-pan since the scrollbar is hidden, and a fading arrow
// hints that the table scrolls until the user's first interaction with it.
function LeaderTable({ rows, orgFor, onView, onShare, cvt, unitLbl }) {
  const COLS = ['Rank','Player','Distance','Club','HCP','Age','Gender','Course','Event','Date','Tier','Share'];
  const scrollRef = useRef(null);
  const [showHint, setShowHint] = useState(true);
  const [canScroll, setCanScroll] = useState(false);
  const drag = useRef({ isDown:false, startX:0, startScrollLeft:0, moved:false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth);
  }, [rows]);

  function dismissHint() {
    setShowHint(false);
  }

  function handlePointerDown(e) {
    if (e.pointerType !== 'mouse') { dismissHint(); return; } // touch: native scroll handles it
    const el = scrollRef.current;
    drag.current = { isDown:true, startX:e.clientX, startScrollLeft: el.scrollLeft, moved:false, pointerId:e.pointerId };
    el.style.cursor = 'grabbing';
    // Not calling setPointerCapture on mousedown itself — that would retarget
    // every plain click to this container instead of the row underneath, so
    // row clicks would never fire. Capture is applied lazily below, only
    // once real dragging is detected.
  }

  function handlePointerMove(e) {
    if (e.pointerType !== 'mouse' || !drag.current.isDown) return;
    const el = scrollRef.current;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3 && !drag.current.moved) {
      drag.current.moved = true;
      el.setPointerCapture?.(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScrollLeft - dx;
    dismissHint();
  }

  function endDrag(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    drag.current.isDown = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = 'grab';
      if (e.pointerId != null && el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
  }

  function handleClickCapture(e) {
    // Suppress the click (row-open or Share button) that follows a drag, so
    // panning the table doesn't also open an entry or fire a share.
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div style={{position:'relative'}}>
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      onTouchStart={dismissHint}
      className="rb-table-scroll"
      style={{overflowX:'auto',WebkitOverflowScrolling:'touch',border:`1px solid ${BDR}`,background:BG2,cursor:'grab',touchAction:'pan-x'}}
    >
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
                  el.currentTarget.style.background='rgba(255,0,144,0.04)';
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
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <PlayerAvatar fullName={org?.fullName || e.player} avatarUrl={org?.avatarUrl} size={28} />
                    <div>
                      {e.is_simulator && org?.fullName ? (
                        <Link
                          href={`/profile/${nameToSlug(org.fullName)}`}
                          onClick={ev=>ev.stopPropagation()}
                          style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:ORG,textDecoration:'none',borderBottom:`1px solid rgba(255,0,144,0.3)`}}>
                          {e.player}
                        </Link>
                      ) : (
                        <span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</span>
                      )}
                      {org?.country&&countryFlag(org.country)}
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 14px'}}><span style={{fontFamily:DISP,fontSize:20,color:ORG}}>{cvt(e.dist)}</span><span style={{fontFamily:SANS,fontSize:10,color:DIM,marginLeft:3}}>{unitLbl}</span></td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.club}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.hcp}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.age}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:MUT}}>{e.gender==='female'?'♀ Female':e.gender==='male'?'♂ Male':'—'}</td>
                <td style={{padding:'12px 14px'}}><span style={{fontFamily:SANS,fontSize:12,color:MUT}}>{org?.courseName||'—'}</span>{org?.is_founding_member&&<span title="Founding Member" style={{marginLeft:6,color:ORG,fontSize:13,cursor:'default'}}>✦</span>}{org?.badge&&<span style={{marginLeft:6}}><BadgePill badge={org.badge} small/></span>}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:12,color:DIM}}>{e.tournament||'—'}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:11,color:DIM}}>{fmtDate(e.date)}</td>
                <td style={{padding:'12px 14px',fontFamily:SANS,fontSize:10,fontWeight:600,color:ORG}}>{tier(e.dist)}</td>
                <td style={{padding:'12px 14px'}}>
                  <button
                    onClick={ev=>{ev.stopPropagation();onShare(e);}}
                    aria-label="Share drive"
                    title="Share"
                    style={{background:'transparent',border:'none',padding:6,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',lineHeight:0,borderRadius:6}}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length===0&&<div style={{padding:'56px 0',textAlign:'center',color:DIM,fontFamily:SANS,fontSize:13}}>No drives recorded for this selection</div>}
    </div>
    {showHint && canScroll && rows.length>0 && (
      <div aria-hidden style={{position:'absolute',top:0,bottom:0,right:0,width:44,pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:14}}>
        <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(20,20,20,0.55)',border:'1px solid rgba(255,255,255,0.25)',backdropFilter:'blur(4px)',WebkitBackdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,0,0,0.45)',animation:'rbArrowPulse 1.6s ease-in-out infinite'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
    )}
    <style jsx>{`
      .rb-table-scroll::-webkit-scrollbar { display: none; }
      .rb-table-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      @keyframes rbArrowPulse {
        0%, 100% { opacity: 0.55; transform: translateX(0); }
        50% { opacity: 1; transform: translateX(4px); }
      }
    `}</style>
    </div>
  );
}

export default function LeaderboardPage(props) {
  const { entries: propEntries=[], orgs: propOrgs=[], approvedOrgs: propApprovedOrgs=[],
    staticEntries=[], staticOrgs=[],
    cvt=d=>d, unitLbl='yds',
    detEnt, setDetEnt, shareEnt, setShareEnt,
    week, setWeek, allTime, setAllTime,
    fCountry, setFCountry, fHcp, setFHcp, fAge, setFAge,
    fClub, setFClub, fPlayer, setFPlayer, fGender, setFGender,
    fSimulator, setFSimulator,
    sortBy, setSortBy } = props;

  // Prefer server-rendered data (getStaticProps below) so the leaderboard
  // has real content in the initial HTML for crawlers/SEO. Falls back to
  // the client-fetched global store (_app.jsx) only if static data is
  // somehow empty, e.g. a brand-new deploy before first revalidation.
  const entries = staticEntries.length ? staticEntries : propEntries;
  // staticOrgs is already pre-filtered to status='approved' in getStaticProps,
  // so it can serve directly as both the lookup list and approvedOrgs.
  const orgs = staticOrgs.length ? staticOrgs : propOrgs;
  const approvedOrgs = staticOrgs.length ? staticOrgs : propApprovedOrgs;
  const orgFor = id => orgs.find(o => o.id === id);

  const currentWeek = week || nowWeek();
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [fCountry,fHcp,fAge,fClub,fPlayer,fGender,fSimulator].filter(Boolean).length;

  // Reset to page 1 whenever any filter or view changes
  useEffect(() => { setPage(1); }, [fCountry, fHcp, fAge, fClub, fPlayer, fGender, fSimulator, sortBy, allTime, week]);

  // 'u20'/'o20' and 'u16' aren't exposed in the filter dropdowns — they exist so
  // homepage category cards (e.g. "Men High Handicap", "Youth") can deep-link
  // into an exact pre-filtered view via the URL query, below.
  const hcpIn=(hcp,b)=>{if(!b)return true;if(b==='scratch')return hcp<=0;if(b==='low')return hcp>0&&hcp<=5;if(b==='mid')return hcp>5&&hcp<=14;if(b==='high')return hcp>14&&hcp<=28;if(b==='beginner')return hcp>28;if(b==='u20')return hcp<20;if(b==='o20')return hcp>=20;return true;};
  const ageIn=(age,b)=>{if(!b)return true;if(b==='u25')return age<25;if(b==='25-40')return age>=25&&age<40;if(b==='40-55')return age>=40&&age<55;if(b==='55+')return age>=55;if(b==='u16')return age<16;return true;};

  // Apply filters from the URL query on load (e.g. arriving from a homepage
  // category card: /leaderboard?gender=male&hcp=o20). Only runs once the
  // router has hydrated, and only sets a filter if a value was actually passed.
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const { gender, hcp, age, country, player, club, simulator, allTime: allTimeQ } = router.query;
    if (gender && setFGender) setFGender(String(gender));
    if (hcp && setFHcp) setFHcp(String(hcp));
    if (age && setFAge) setFAge(String(age));
    if (country && setFCountry) setFCountry(String(country));
    if (player && setFPlayer) setFPlayer(String(player));
    if (club && setFClub) setFClub(String(club));
    if (simulator && setFSimulator) setFSimulator(String(simulator));
    if (allTimeQ && setAllTime) setAllTime(allTimeQ === '1' || allTimeQ === 'true');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Restrict to approved orgs + the active view (weekly/all-time) before deduping,
  // so a player's weekly-best and all-time-best can differ.
  const baseRows = entries
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .filter(e=>allTime||sameWeek(e.date,currentWeek));

  // One rank per player: keep only each player's longest drive.
  // Keyed by orgId+name since there's no dedicated player ID — this collapses
  // repeat submissions from the same account/player without merging two
  // different real people who happen to share a name at different clubs.
  const bestByPlayer = new Map();
  baseRows.forEach(e => {
    const key = `${e.orgId}::${(e.player||'').trim().toLowerCase()}`;
    const existing = bestByPlayer.get(key);
    if (!existing || Number(e.dist) > Number(existing.dist)) bestByPlayer.set(key, e);
  });

  const tableRows = Array.from(bestByPlayer.values())
    .filter(e=>{
      if(!fCountry) return true;
      const org=orgFor(e.orgId);
      const q=fCountry.toLowerCase();
      return (org?.country||'').toLowerCase().includes(q) || (org?.location||'').toLowerCase().includes(q);
    })
    .filter(e=>!fPlayer||e.player.toLowerCase().includes(fPlayer.toLowerCase()))
    .filter(e=>!fGender||e.gender===fGender)
    .filter(e=>!fSimulator||(fSimulator==='simulator'?e.is_simulator===true:e.is_simulator!==true))
    .filter(e=>hcpIn(e.hcp,fHcp))
    .filter(e=>ageIn(e.age,fAge))
    .filter(e=>!fClub||e.club.toLowerCase().includes(fClub.toLowerCase()))
    .sort((a,b)=>{if(sortBy==='hcp')return a.hcp-b.hcp;if(sortBy==='age')return a.age-b.age;if(sortBy==='club')return a.club.localeCompare(b.club);if(sortBy==='date')return new Date(b.date)-new Date(a.date);return b.dist-a.dist;});

  const visibleRows = tableRows.slice(0, page * PAGE_SIZE);
  const hasMore = visibleRows.length < tableRows.length;

  return (
    <>
      <Head>
        <title>Global Golf Longest Drive Leaderboard | Ripping Bombs</title>
        <meta name="description" content="The global longest drive leaderboard. See verified competition results from clubs and tournaments worldwide on Ripping Bombs."/>
      </Head>
      <div style={{padding:'28px 18px 80px',maxWidth:1000,margin:'0 auto'}}>
        {/* Sample data CTA */}
        <h1 style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:1,marginBottom:8,fontWeight:400}}>Global Golf Longest Drive Leaderboard</h1>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:20}}>
          New rankings every week — submit your drive to compete in this week's championship.{' '}
          <Link href="/venue-rankings" style={{color:ORG,textDecoration:'none',borderBottom:'1px solid rgba(255,0,144,0.3)'}}>See how venues rank &rarr;</Link>
        </div>

        {/* Week nav */}
        <div style={{background:allTime?BG2:'linear-gradient(135deg,rgba(255,0,144,0.14),rgba(255,0,144,0.03))',border:`1px solid ${allTime?BDR:'rgba(255,0,144,0.3)'}`,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
            <button onClick={()=>setWeek(prevWeek(currentWeek))} disabled={allTime} style={{background:'transparent',border:`1px solid ${BDR}`,color:allTime?DIM:MUT,fontFamily:SANS,fontSize:14,padding:'8px 13px',cursor:allTime?'default':'pointer',opacity:allTime?0.4:1}}>‹</button>
            <div>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:allTime?DIM:ORG,textTransform:'uppercase',marginBottom:3}}>🏆 Weekly Championship</div>
              <div style={{fontFamily:DISP,fontSize:22,color:allTime?MUT:TXT,letterSpacing:.5}}>{allTime?'All-Time Leaderboard':weekLabel(currentWeek)}</div>
            </div>
            <button onClick={()=>setWeek(nextWeek(currentWeek))} disabled={allTime} style={{background:'transparent',border:`1px solid ${BDR}`,color:allTime?DIM:MUT,fontFamily:SANS,fontSize:14,padding:'8px 13px',cursor:allTime?'default':'pointer',opacity:allTime?0.4:1}}>›</button>
          </div>
          <button onClick={()=>setAllTime(v=>!v)} style={{background:allTime?ORG:'transparent',border:`1px solid ${allTime?ORG:BDR}`,color:allTime?'#111':MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:'8px 16px',cursor:'pointer',whiteSpace:'nowrap'}}>{allTime?'All Time ✓':'View All-Time →'}</button>
        </div>

        {/* Filter bar */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:filtersOpen?12:20,flexWrap:'wrap'}}>
          <button onClick={()=>setFiltersOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:8,background:filtersOpen?BG3:'transparent',border:`1px solid ${BDR}`,color:TXT,fontFamily:SANS,fontWeight:600,fontSize:13,padding:'9px 14px',cursor:'pointer'}}>
            <span style={{display:'flex',flexDirection:'column',gap:3,width:14}}>
              <span style={{height:2,background:TXT}}/>
              <span style={{height:2,background:TXT}}/>
              <span style={{height:2,background:TXT}}/>
            </span>
            Filters
            {activeFilterCount>0&&<span style={{background:ORG,color:'#111',fontSize:10,fontWeight:700,borderRadius:10,padding:'1px 7px'}}>{activeFilterCount}</span>}
            <span style={{fontSize:10,color:DIM,marginLeft:2}}>{filtersOpen?'▴':'▾'}</span>
          </button>

          <div style={{minWidth:160}}>
            <div style={{position:'relative'}}>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:'100%',background:BG2,border:`1px solid ${BDR}`,padding:'9px 28px 9px 12px',color:TXT,fontFamily:SANS,fontSize:13,outline:'none',cursor:'pointer',appearance:'none'}}>
                {[['dist','Sort: Distance'],['date','Sort: Date'],['hcp','Sort: Handicap'],['age','Sort: Age'],['club','Sort: Club']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
              <span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:DIM,fontSize:10}}>▾</span>
            </div>
          </div>

          {activeFilterCount>0&&(
            <button onClick={()=>{setFCountry('');setFHcp('');setFAge('');setFClub('');setFPlayer('');setFGender('');setFSimulator('');}} style={{background:'transparent',border:'none',color:DIM,fontFamily:SANS,fontSize:12,textDecoration:'underline',cursor:'pointer',padding:'9px 4px'}}>Clear filters</button>
          )}
        </div>

        {filtersOpen&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8,marginBottom:20,padding:'16px',background:BG2,border:`1px solid ${BDR}`}}>
            {[
              {label:'Search Player',val:fPlayer,set:setFPlayer,ph:'Player name'},
              {label:'Gender',val:fGender,set:setFGender,ph:'All',opts:[['','All'],['male','♂ Male'],['female','♀ Female']]},
              {label:'Country/Region',val:fCountry,set:setFCountry,ph:'Filter by location'},
              {label:'Handicap',val:fHcp,set:setFHcp,ph:'All',opts:[['','All'],['scratch','Scratch'],['low','Low (1–5)'],['mid','Mid (6–14)'],['high','High (15–28)'],['beginner','Beginner (28+']]},
              {label:'Age Group',val:fAge,set:setFAge,ph:'All',opts:[['','All'],['u25','Under 25'],['25-40','25–40'],['40-55','40–55'],['55+','55+']]},
              {label:'Club Brand',val:fClub,set:setFClub,ph:'e.g. TaylorMade'},
              {label:'Entry Type',val:fSimulator,set:setFSimulator,ph:'All',opts:[['','All'],['official','🏌️ Official Only'],['simulator','🖥️ Simulator Only']]},
            ].map(({label,val,set,ph,opts})=>(
              <div key={label}>
                <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:5,textTransform:'uppercase'}}>{label}</div>
                {opts
                  ?<div style={{position:'relative'}}><select value={val} onChange={e=>set(e.target.value)} style={{width:'100%',background:BG3,border:`1px solid ${BDR}`,padding:'8px 28px 8px 10px',color:val?TXT:DIM,fontFamily:SANS,fontSize:13,outline:'none',cursor:'pointer',appearance:'none'}}>
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select><span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:DIM,fontSize:10}}>▾</span></div>
                  :<input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',background:BG3,border:`1px solid ${BDR}`,padding:'8px 10px',color:TXT,fontFamily:SANS,fontSize:13,outline:'none'}}/>
                }
              </div>
            ))}
          </div>
        )}

        <LeaderTable rows={visibleRows} orgFor={orgFor} onView={e=>setDetEnt&&setDetEnt(e)} onShare={e=>setShareEnt&&setShareEnt(e)} cvt={cvt} unitLbl={unitLbl}/>

        {hasMore && (
          <div style={{textAlign:'center', marginTop:20}}>
            <button
              onClick={() => setPage(p => p + 1)}
              style={{background:'transparent', border:`1px solid ${BDR}`, color:MUT, fontFamily:SANS, fontWeight:600, fontSize:13, padding:'12px 36px', cursor:'pointer', letterSpacing:.5}}
            >
              LOAD MORE <span style={{color:DIM, fontWeight:400}}>({tableRows.length - visibleRows.length} remaining)</span>
            </button>
          </div>
        )}
        {!hasMore && tableRows.length > PAGE_SIZE && (
          <div style={{textAlign:'center', marginTop:20, fontFamily:SANS, fontSize:12, color:DIM}}>
            All {tableRows.length} drives loaded
          </div>
        )}

        {detEnt&&<EntryModal entry={detEnt} org={orgFor(detEnt.orgId)} onClose={()=>setDetEnt(null)} onShare={e=>{setDetEnt(null);setShareEnt(e);}} cvt={cvt} unitLbl={unitLbl}/>}
        {shareEnt&&<ShareModal entry={shareEnt} org={orgFor(shareEnt.orgId)} cvt={cvt} unitLbl={unitLbl} onClose={()=>setShareEnt(null)}/>}
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
      .select('id, courseName, fullName, avatarUrl, country, location, status, badge, accountType, is_founding_member')
      .eq('status', 'approved');

    return {
      props: {
        staticEntries: entries || [],
        staticOrgs: orgs || [],
      },
      revalidate: 600, // rebuild every 10 minutes, matching index.jsx
    };
  } catch {
    return {
      props: { staticEntries: [], staticOrgs: [] },
      revalidate: 60,
    };
  }
}
