import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import RelatedPages from '../components/RelatedPages';

export function SeoPage({ title, description, children }) {
  const router = useRouter();
  // Derive the registry slug from the current path, e.g. "/sim-distance-real-or-fake" -> "sim-distance-real-or-fake".
  // Pages not in lib/seoPages.js (core app pages, dynamic routes) simply
  // render no related-links block — getRelatedPages() returns [] for them.
  const currentSlug = (router.pathname || '').replace(/^\/+/, '');

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}/>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
      </Head>
      <div style={{ padding:'48px 18px 80px', maxWidth:1000, margin:'0 auto' }}>
        {children}
        <RelatedPages currentSlug={currentSlug} />
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

// ——— Same six-category system used on the homepage / venue-rankings.jsx /
// indoor-golf-league-ranking-system.jsx. Kept identical everywhere so a
// player's category never shifts depending on which page they're viewed from.
const CATEGORY_LABELS = {
  male_open: 'Men (Open)',
  male_high_hcp: 'Men High Handicap',
  female_open: 'Women (Open)',
  female_high_hcp: 'Women High Handicap',
  senior: 'Seniors',
  youth: 'Youth',
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

export function getCategory(entry) {
  const age = Number(entry.age);
  const hcp = Number(entry.hcp);
  const gender = (entry.gender || '').toLowerCase();
  if (age < 16) return 'youth';
  if (age >= 55) return 'senior';
  if (gender === 'female') return hcp >= 20 ? 'female_high_hcp' : 'female_open';
  return hcp >= 20 ? 'male_high_hcp' : 'male_open';
}

// Collapses a list of entries down to one row per player — that player's
// single longest verified drive. Without this, a player with 10 submissions
// occupied 10 rank positions instead of 1.
export function bestPerPlayer(list) {
  const best = {};
  list.forEach((e) => {
    const key = e.player;
    if (!best[key] || Number(e.dist) > Number(best[key].dist)) best[key] = e;
  });
  return Object.values(best);
}

// Best verified entry per category, regardless of overall raw distance —
// this is what lets a youth or high-handicap record surface at all, since
// they'll almost never out-distance an open-category scratch golfer.
export function bestPerCategory(list) {
  const recs = {};
  list.forEach((e) => {
    const cat = getCategory(e);
    if (!recs[cat] || Number(e.dist) > Number(recs[cat].dist)) recs[cat] = e;
  });
  return recs;
}

export function FilteredLeaderboard({ title, description, heading, intro, entries, orgs, filter, cvt, unitLbl, showCategoryRecords }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(null); // null = all categories

  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);

  const matching = [...entries]
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .filter(filter);

  // When a category is active, scope the pool BEFORE computing per-player
  // bests and ranks — this is what makes rank #3/#10/etc within that
  // category correct, instead of just surfacing the #1 record.
  const categoryPool = activeCategory ? matching.filter(e => getCategory(e) === activeCategory) : matching;

  // One row per player, ranked by their own best verified distance
  // (scoped to the active category, if any).
  const filtered = bestPerPlayer(categoryPool).sort((a, b) => Number(b.dist) - Number(a.dist));

  // Category record cards always reflect the FULL unfiltered pool, so the
  // "#1 in each category" summary stays stable regardless of which
  // category is currently selected below.
  const records = showCategoryRecords ? bestPerCategory(matching) : null;

  return (
    <SeoPage title={`${title} | Ripping Bombs`} description={description}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>Global Leaderboard</div>
      <SeoH1>{heading}</SeoH1>
      <SeoP>{intro}</SeoP>

      {records && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase' }}>Category Records</div>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                style={{ background:'transparent', border:`1px solid ${BDR}`, color:DIM, fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:0.5, padding:'3px 10px', cursor:'pointer', textTransform:'uppercase' }}
              >
                ✕ Clear filter
              </button>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:10, marginBottom:32 }}>
            {CATEGORY_KEYS.map((key) => {
              const rec = records[key];
              const isActive = activeCategory === key;
              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveCategory(isActive ? null : key)}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setActiveCategory(isActive ? null : key); }}
                  style={{
                    background: BG2,
                    border: `1px solid ${isActive ? ORG : BDR}`,
                    padding: '16px 16px 14px',
                    cursor: 'pointer',
                    boxShadow: isActive ? `0 0 0 1px ${ORG}` : 'none',
                  }}
                >
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color: isActive ? ORG : DIM, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>{CATEGORY_LABELS[key]}</div>
                  {rec ? (
                    <>
                      <div style={{ fontFamily:DISP, fontSize:26, color:ORG, letterSpacing:0.5, lineHeight:1 }}>
                        {cvt(rec.dist)} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl}</span>
                      </div>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT, marginTop:6 }}>{rec.player}</div>
                    </>
                  ) : (
                    <div style={{ fontFamily:SANS, fontSize:12, color:DIM, marginTop:4 }}>No verified drives yet</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeCategory && (
        <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:16 }}>
          Showing <span style={{ color:ORG, fontWeight:700 }}>{CATEGORY_LABELS[activeCategory]}</span> only — {filtered.length} player{filtered.length===1?'':'s'}
        </div>
      )}

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
