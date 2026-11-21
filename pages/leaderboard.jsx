import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, cloneElement } from 'react';

import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP, profileSlugFor } from '../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../lib/constants';
import { HIGH_HCP_THRESHOLD } from '../lib/categories';
import { countryFlag, BadgePill } from '../components/UI';
import EntryModal from '../components/EntryModal';
import ShareModal from '../components/ShareModal';
import PlayerAvatar from '../components/PlayerAvatar';

const STICKY = { position:'sticky', zIndex:2 };
const RANK_W = 52;
const PLAYER_W = 180;

// Player name: pink underlined link when the player has a public profile page,
// plain white text otherwise. Shared by the desktop table and the mobile cards.
function PlayerName({ e, org, size = 14 }) {
  const slug = profileSlugFor(org);
  return slug ? (
    <Link
      href={`/profile/${slug}`}
      onClick={ev=>ev.stopPropagation()}
      style={{fontFamily:SANS,fontWeight:700,fontSize:size,color:ORG,textDecoration:'none',borderBottom:`1px solid rgba(255,0,144,0.3)`}}>
      {e.player}
    </Link>
  ) : (
    <span style={{fontFamily:SANS,fontWeight:700,fontSize:size,color:TXT}}>{e.player}</span>
  );
}

function ShareButton({ e, onShare, hit = 30 }) {
  return (
    <button
      onClick={ev=>{ev.stopPropagation();onShare(e);}}
      aria-label="Share drive"
      title="Share"
      style={{background:'transparent',border:'none',padding:6,minWidth:hit,minHeight:hit,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',lineHeight:0,borderRadius:6}}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>
  );
}

// Phone layout: the 12-column table needs ~750px and pins 230px of it, which
// leaves almost nothing to scroll on a phone. Under 640px each drive becomes a
// compact tappable card instead (tap = the same detail modal the table opens).
function MobileRow({ e, rank, org, onView, onShare, cvt, unitLbl }) {
  const medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':null;
  const meta = [
    e.club,
    e.hcp!=null && e.hcp!=='' ? `HCP ${e.hcp}` : null,
    e.age ? `Age ${e.age}` : null,
    e.gender==='female' ? '♀' : e.gender==='male' ? '♂' : null,
  ].filter(Boolean).join(' · ');
  // Same wording as the homepage cards: sim entries read "Sim", official ones show the venue.
  const where = [
    e.is_simulator ? '🖥️ Sim' : (org?.courseName || null),
    e.tournament || null,
    fmtDate(e.date),
    tier(e.dist),
  ].filter(Boolean).join(' · ');
  return (
    <div
      className="rb-lb-row"
      onClick={()=>onView(e)}
      style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderBottom:`1px solid ${BDR}`,cursor:'pointer'}}
    >
      <div style={{width:32,flexShrink:0,textAlign:'center',fontFamily:SANS,fontSize:medal?20:12,color:DIM}}>{medal||`#${rank}`}</div>
      <PlayerAvatar fullName={org?.fullName || e.player} avatarUrl={org?.avatarUrl} size={36} />
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,minWidth:0}}>
          <span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}><PlayerName e={e} org={org} size={15} /></span>
          {org?.country&&<span title={org.country} style={{flexShrink:0,lineHeight:0}}>{cloneElement(countryFlag(org.country),{style:{width:18,height:13,objectFit:'cover',borderRadius:2,display:'block'}})}</span>}
        </div>
        {meta&&<div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{meta}</div>}
        <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{where}</div>
      </div>
      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:0}}>
        <div><span style={{fontFamily:DISP,fontSize:26,color:ORG,lineHeight:1}}>{cvt(e.dist)}</span><span style={{fontFamily:SANS,fontSize:11,color:DIM,marginLeft:3}}>{unitLbl}</span></div>
        <ShareButton e={e} onShare={onShare} hit={40} />
      </div>
    </div>
  );
}

// Click-and-drag horizontal panning, matching the category-card rows on the
// homepage: native touch/trackpad momentum scrolling is left alone, mouse
// users get grab-to-pan since the scrollbar is hidden, and a fading arrow
// hints that the table scrolls until the user's first interaction with it.
function LeaderTable({ rows, orgFor, onView, onShare, cvt, unitLbl, rankOf }) {
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
    <>
    <div className="rb-lb-table-wrap" style={{position:'relative'}}>
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
      style={{overflowX:'auto',WebkitOverflowScrolling:'touch',border:`1px solid ${BDR}`,background:BG2,cursor:'grab'}}
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
          {rows.map((e)=>{
            const org=orgFor(e.orgId);
            // Rank = position by distance, whatever the table is sorted by —
            // otherwise sorting by age/date would hand the medals to whoever
            // happens to be in the first three rows.
            const rank=rankOf(e);
            const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':null;
            const tdSticky = (left) => ({...STICKY, left, background:BG2, borderRight:`1px solid ${BDR}`});
            return (
              <tr key={e.id} onClick={()=>onView(e)} style={{cursor:'pointer',borderBottom:`1px solid ${BDR}`,transition:'background .12s ease, box-shadow .12s ease'}}
                onMouseEnter={el=>{
                  el.currentTarget.style.background='rgba(255,0,144,0.12)';
                  el.currentTarget.style.boxShadow=`inset 3px 0 0 ${ORG}`;
                  [...el.currentTarget.querySelectorAll('td[data-sticky]')].forEach(td=>td.style.background='#2a1220');
                }}
                onMouseLeave={el=>{
                  el.currentTarget.style.background='transparent';
                  el.currentTarget.style.boxShadow='none';
                  [...el.currentTarget.querySelectorAll('td[data-sticky]')].forEach(td=>td.style.background=BG2);
                }}>
                <td data-sticky="1" style={{...tdSticky(0),padding:'12px 14px',fontFamily:SANS,fontSize:12,color:DIM,minWidth:RANK_W}}>
                  {medal||`#${rank}`}
                </td>
                <td data-sticky="1" style={{...tdSticky(RANK_W),padding:'12px 14px',minWidth:PLAYER_W}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <PlayerAvatar fullName={org?.fullName || e.player} avatarUrl={org?.avatarUrl} size={28} />
                    <div>
                      <PlayerName e={e} org={org} />
                      {org?.country&&<span title={org.country} style={{display:'block',lineHeight:0,marginTop:4}}>{cloneElement(countryFlag(org.country),{style:{width:20,height:14,objectFit:'cover',borderRadius:2,display:'block'}})}</span>}
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
                <td style={{padding:'12px 14px'}}><ShareButton e={e} onShare={onShare} /></td>
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
    </div>

    {/* Phone layout — shown instead of the table under 640px (see MobileRow) */}
    <div className="rb-lb-cards" style={{border:`1px solid ${BDR}`,background:BG2}}>
      {rows.map(e=>(
        <MobileRow key={e.id} e={e} rank={rankOf(e)} org={orgFor(e.orgId)} onView={onView} onShare={onShare} cvt={cvt} unitLbl={unitLbl} />
      ))}
      {rows.length===0&&<div style={{padding:'44px 16px',textAlign:'center',color:DIM,fontFamily:SANS,fontSize:13}}>No drives recorded for this selection</div>}
    </div>

    <style jsx global>{`
      .rb-table-scroll::-webkit-scrollbar { display: none; }
      .rb-table-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      @keyframes rbArrowPulse {
        0%, 100% { opacity: 0.55; transform: translateX(0); }
        50% { opacity: 1; transform: translateX(4px); }
      }
      .rb-lb-cards { display: none; }
      @media (max-width: 640px) {
        .rb-lb-table-wrap { display: none !important; }
        .rb-lb-cards { display: block !important; }
        .rb-lb-row:active { background: rgba(255,0,144,0.10); }
      }
    `}</style>
    </>
  );
}

// Custom age filter values are stored in the same fAge string as the presets,
// as 'age:LO-HI' (inclusive on both ends, so 'age:12-12' is exactly 12).
// The prefix keeps them from clashing with presets like '25-40'.
function parseCustomAge(b) {
  const m = /^age:(\d{1,3})-(\d{1,3})$/.exec(String(b || ''));
  if (!m) return null;
  let lo = Number(m[1]), hi = Number(m[2]);
  if (lo > hi) [lo, hi] = [hi, lo];
  return [lo, hi];
}

// Two-handle age slider. Drag both handles to the same number for one exact age.
function AgeRangeSlider({ min, max, lo, hi, onChange }) {
  const span = Math.max(max - min, 1);
  const p = v => (v - min) / span;
  const label = lo === hi ? `Age ${lo}` : `Ages ${lo}–${hi}`;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:10,flexWrap:'wrap',marginBottom:6}}>
        <span style={{fontFamily:SANS,fontSize:14,fontWeight:700,color:TXT}}>{label}</span>
        <span style={{fontFamily:SANS,fontSize:11,color:DIM}}>Drag both handles to the same number to see one exact age</span>
      </div>
      <div className="rb-age-slider">
        <div className="rb-age-track"/>
        <div className="rb-age-fill" style={{left:`calc(11px + (100% - 22px) * ${p(lo)})`,width:`calc((100% - 22px) * ${p(hi) - p(lo)})`}}/>
        <input type="range" aria-label="Minimum age" min={min} max={max} step={1} value={lo}
          onChange={e=>onChange(Math.min(Number(e.target.value), hi), hi)}
          style={{zIndex: lo > (min + max) / 2 ? 4 : 3}}/>
        <input type="range" aria-label="Maximum age" min={min} max={max} step={1} value={hi}
          onChange={e=>onChange(lo, Math.max(Number(e.target.value), lo))}
          style={{zIndex:3}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontFamily:SANS,fontSize:10,color:DIM,padding:'0 2px'}}>
        <span>{min}</span><span>{max}</span>
      </div>
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
    sortBy, setSortBy } = props;

  // _app.jsx doesn't provide fSimulator/setFSimulator, so without a fallback
  // the "Entry Type" filter and "Clear filters" would call an undefined
  // function. Use the app-level state if it ever gets added, local state until then.
  const [localSimulator, setLocalSimulator] = useState('');
  const fSimulator = props.setFSimulator ? props.fSimulator : localSimulator;
  const setFSimulator = props.setFSimulator || setLocalSimulator;

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

  // 'u15'/'o15' and 'u16' aren't exposed in the filter dropdowns — they exist so
  // homepage category cards (e.g. "Men High Handicap", "Youth") can deep-link
  // into an exact pre-filtered view via the URL query, below. The old
  // 'u20'/'o20' values still work as aliases so previously shared links don't break.
  const hcpIn=(hcp,b)=>{if(!b)return true;if(b==='scratch')return hcp<=0;if(b==='low')return hcp>0&&hcp<=5;if(b==='mid')return hcp>5&&hcp<=14;if(b==='high')return hcp>14&&hcp<=28;if(b==='beginner')return hcp>28;if(b==='u15'||b==='u20')return hcp<HIGH_HCP_THRESHOLD;if(b==='o15'||b==='o20')return hcp>=HIGH_HCP_THRESHOLD;return true;};
  const ageIn=(age,b)=>{if(!b)return true;const c=parseCustomAge(b);if(c){const a=Number(age);return age!=null&&Number.isFinite(a)&&a>=c[0]&&a<=c[1];}if(b==='u25')return age<25;if(b==='25-40')return age>=25&&age<40;if(b==='40-55')return age>=40&&age<55;if(b==='55+')return age>=55;if(b==='u16')return age<16;return true;};

  // Apply the view/filters named in the URL (e.g. arriving from a homepage
  // card: /leaderboard?allTime=0&gender=male&hcp=o15). The filters live in
  // app-level state, so when the URL names ANY view or filter we set all of
  // them — anything it doesn't mention is cleared — otherwise a visitor would
  // see leftovers from the last card they clicked. With no recognised params
  // (e.g. coming Back from a profile) their current view is left alone.
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const keys = ['gender','hcp','age','country','player','club','simulator','allTime'];
    if (!keys.some(k => q[k] != null)) return;
    const s = k => (q[k] != null ? String(q[k]) : '');
    setFGender && setFGender(s('gender'));
    setFHcp && setFHcp(s('hcp'));
    setFAge && setFAge(s('age'));
    setFCountry && setFCountry(s('country'));
    setFPlayer && setFPlayer(s('player'));
    setFClub && setFClub(s('club'));
    setFSimulator && setFSimulator(s('simulator'));
    setAllTime && setAllTime(s('allTime') === '1' || s('allTime') === 'true');
    setWeek && setWeek(null); // back to the current week
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

  // Slider bounds follow the ages actually on the leaderboard (fallback 5–80).
  const ageVals = entries.map(e => Number(e.age)).filter(a => Number.isFinite(a) && a >= 1 && a <= 110);
  let AGE_MIN = ageVals.length ? Math.min(...ageVals) : 5;
  let AGE_MAX = ageVals.length ? Math.max(...ageVals) : 80;
  if (AGE_MAX <= AGE_MIN) AGE_MAX = AGE_MIN + 1;
  const customAge = parseCustomAge(fAge);
  const clampAge = v => Math.min(AGE_MAX, Math.max(AGE_MIN, v));
  const customLo = customAge ? clampAge(customAge[0]) : AGE_MIN;
  const customHi = customAge ? clampAge(customAge[1]) : AGE_MAX;

  const visibleRows = tableRows.slice(0, page * PAGE_SIZE);
  const hasMore = visibleRows.length < tableRows.length;

  // Rank by distance within the current filters, independent of the sort order.
  const distRank = new Map();
  [...tableRows].sort((a,b)=>Number(b.dist)-Number(a.dist)).forEach((e,i)=>distRank.set(e.id,i+1));
  const rankOf = e => distRank.get(e.id) || 0;

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

        {/* View banner — weekly and all-time are styled identically (same pink
            container, eyebrow and title); the label, title and the switch on
            the right say which one you're looking at. */}
        <div className="rb-lb-banner" style={{background:'linear-gradient(135deg,rgba(255,0,144,0.14),rgba(255,0,144,0.03))',border:'1px solid rgba(255,0,144,0.3)',padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
          <div className="rb-lb-banner-main" style={{display:'flex',alignItems:'center',gap:14,minWidth:0}}>
            {!allTime&&<button className="rb-lb-nav" aria-label="Previous week" onClick={()=>setWeek(prevWeek(currentWeek))} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:14,padding:'15px 16px',cursor:'pointer'}}>‹</button>}
            <div style={{minWidth:0}}>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,textTransform:'uppercase',marginBottom:3}}>{allTime?'🏛️ Hall of Records':'🏆 Weekly Championship'}</div>
              <h2 className="rb-lb-banner-title" style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5,fontWeight:400}}>{allTime?'All-Time Leaderboard':weekLabel(currentWeek)}</h2>
            </div>
            {!allTime&&<button className="rb-lb-nav" aria-label="Next week" onClick={()=>setWeek(nextWeek(currentWeek))} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:14,padding:'15px 16px',cursor:'pointer'}}>›</button>}
          </div>
          <div role="tablist" aria-label="Leaderboard view" className="rb-lb-seg" style={{display:'flex',border:`1px solid ${BDR}`}}>
            {[[false,'This Week'],[true,'All-Time']].map(([val,label])=>{
              const active=!!allTime===val;
              return (
                <button key={label} type="button" role="tab" aria-selected={active} onClick={()=>setAllTime(val)}
                  style={{background:active?ORG:'transparent',border:'none',color:active?'#111':MUT,fontFamily:SANS,fontWeight:700,fontSize:12,padding:'10px 16px',cursor:'pointer',whiteSpace:'nowrap'}}>
                  {label}
                </button>
              );
            })}
          </div>
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

          <div className="rb-lb-sort" style={{minWidth:160}}>
            <div style={{position:'relative'}}>
              <select className="rb-lb-field" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:'100%',background:BG2,border:`1px solid ${BDR}`,padding:'9px 28px 9px 12px',color:TXT,fontFamily:SANS,fontSize:13,outline:'none',cursor:'pointer',appearance:'none'}}>
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
              {label:'Handicap',val:fHcp,set:setFHcp,ph:'All',opts:[['','All'],['scratch','Scratch'],['low','Low (1–5)'],['mid','Mid (6–14)'],['high','High (15–28)'],['beginner','Beginner (28+)']]},
              {label:'Age Group',val:fAge,set:setFAge,ph:'All',opts:[['','All'],['u25','Under 25'],['25-40','25–40'],['40-55','40–55'],['55+','55+'],['custom','Exact age / custom…']],
                shown:customAge?'custom':fAge,
                pick:v=>setFAge(v==='custom'?`age:${AGE_MIN}-${AGE_MAX}`:v)},
              {label:'Club Brand',val:fClub,set:setFClub,ph:'e.g. TaylorMade'},
              {label:'Entry Type',val:fSimulator,set:setFSimulator,ph:'All',opts:[['','All'],['official','🏌️ Official Only'],['simulator','🖥️ Simulator Only']]},
            ].map(({label,val,set,ph,opts,shown,pick})=>(
              <div key={label}>
                <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:5,textTransform:'uppercase'}}>{label}</div>
                {opts
                  ?<div style={{position:'relative'}}><select className="rb-lb-field" value={shown!==undefined?shown:val} onChange={e=>(pick||set)(e.target.value)} style={{width:'100%',background:BG3,border:`1px solid ${BDR}`,padding:'8px 28px 8px 10px',color:(shown!==undefined?shown:val)?TXT:DIM,fontFamily:SANS,fontSize:13,outline:'none',cursor:'pointer',appearance:'none'}}>
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select><span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:DIM,fontSize:10}}>▾</span></div>
                  :<input className="rb-lb-field" value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',background:BG3,border:`1px solid ${BDR}`,padding:'8px 10px',color:TXT,fontFamily:SANS,fontSize:13,outline:'none'}}/>
                }
              </div>
            ))}
            {customAge&&(
              <div style={{gridColumn:'1 / -1',paddingTop:8,borderTop:`1px solid ${BDR}`,marginTop:4}}>
                <AgeRangeSlider min={AGE_MIN} max={AGE_MAX} lo={customLo} hi={customHi}
                  onChange={(a,b)=>setFAge(`age:${a}-${b}`)}/>
              </div>
            )}
          </div>
        )}

        <LeaderTable rows={visibleRows} orgFor={orgFor} onView={e=>setDetEnt&&setDetEnt(e)} onShare={e=>setShareEnt&&setShareEnt(e)} cvt={cvt} unitLbl={unitLbl} rankOf={rankOf}/>

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
      <style jsx global>{`
        .rb-age-slider { position: relative; height: 28px; }
        .rb-age-track { position: absolute; left: 11px; right: 11px; top: 12px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.14); }
        .rb-age-fill { position: absolute; top: 12px; height: 4px; border-radius: 2px; background: #ff0090; }
        .rb-age-slider input[type=range] { position: absolute; left: 0; top: 0; width: 100%; height: 28px; margin: 0; padding: 0; background: transparent; pointer-events: none; -webkit-appearance: none; appearance: none; outline: none; }
        .rb-age-slider input[type=range]::-webkit-slider-runnable-track { height: 28px; background: transparent; border: none; }
        .rb-age-slider input[type=range]::-moz-range-track { height: 28px; background: transparent; border: none; }
        .rb-age-slider input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: auto; width: 22px; height: 22px; margin-top: 3px; border-radius: 50%; background: #ff0090; border: 2px solid #111; cursor: pointer; }
        .rb-age-slider input[type=range]::-moz-range-thumb { pointer-events: auto; width: 18px; height: 18px; border-radius: 50%; background: #ff0090; border: 2px solid #111; cursor: pointer; }
        @media (max-width: 640px) {
          .rb-lb-banner { flex-direction: column !important; align-items: stretch !important; padding: 14px !important; gap: 12px !important; }
          .rb-lb-banner-main { justify-content: space-between; }
          .rb-lb-banner-main > div { flex: 1; text-align: center; }
          .rb-lb-banner-title { font-size: 19px !important; }
          .rb-lb-nav { min-width: 44px; min-height: 44px; }
          .rb-lb-seg { width: 100%; }
          .rb-lb-seg button { flex: 1; min-height: 44px; }
          .rb-lb-sort { flex: 1 1 160px; }
          /* 16px stops iOS Safari zooming the page in when a field is focused */
          .rb-lb-field { font-size: 16px !important; }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { supabase } = await import('../lib/supabaseClient');

    // Capped rather than unlimited — an uncapped fetch here means the
    // *entire* entries table gets serialized into every page load's
    // initial HTML/JSON payload (Next embeds getStaticProps' return value
    // for hydration), regardless of how many rows are actually rendered
    // on screen. 1000 is deliberately generous rather than tight: filters
    // for gender/age-bracket/simulator etc. all apply client-side against
    // this same capped set, so too small a cap risks some filtered views
    // going sparse or empty. Revisit this number if any specific filter
    // combination starts looking thin — that's a sign to raise it, or to
    // do the fuller server-side-paginated-filters rework instead.
    const { data: entries } = await supabase
      .from('entries')
      .select('id, orgId, player, dist, club, hcp, age, gender, is_simulator, date, tournament')
      .order('dist', { ascending: false })
      .limit(1000);

    const { data: orgs } = await supabase
      .from('clubs')
      .select('id, courseName, fullName, avatarUrl, country, location, status, badge, accountType, is_founding_member, customSlug')
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
