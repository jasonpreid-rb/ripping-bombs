import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import RelatedPages from '../components/RelatedPages';
import { countryFlag } from './UI';

const linkStyle = { color: ORG, textDecoration: 'underline' };

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
export const CATEGORY_LABELS = {
  male_open: 'Men (Open)',
  male_high_hcp: 'Men High Handicap',
  female_open: 'Women (Open)',
  female_high_hcp: 'Women High Handicap',
  senior: 'Seniors',
  youth: 'Youth',
};
export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

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

// ——— Shared template for every per-country SEO page (both the 15 existing
// hand-written pages could migrate to this, and the new ones added for the
// rest of COUNTRIES). One component keeps every country page structurally
// and visually identical, and keeps the noindex/thin-content logic in one
// place instead of duplicated 65 times.
//
// SEO note: a country with zero verified entries gets a noindex meta tag
// instead of being excluded from the build. The page still renders (with a
// "be the first" CTA) for real visitors who land on it via the map/directory,
// but it won't be offered to Google as a thin/duplicate result — it only
// becomes indexable once a real drive is recorded for that country.
export function CountryRecordPage({ countryCode, countryName, entries: propEntries=[], orgs: propOrgs=[], cvt, unitLbl, staticEntries=[], staticOrgs=[] }) {
  const router = useRouter();
  const entries = staticEntries.length ? staticEntries : propEntries;
  const orgs = staticOrgs.length ? staticOrgs : propOrgs;

  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);

  const allApproved = entries
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .map(e => ({ ...e, dist: Number(e.dist) }));

  const countryEntries = allApproved
    .filter(e => (orgFor(e.orgId)?.country || '').toUpperCase() === countryCode)
    .sort((a, b) => b.dist - a.dist);

  const hasData = countryEntries.length > 0;
  const record = countryEntries[0] || null;

  // World rank — where this country's #1 sits among every other country's #1.
  // This is what makes each page's copy genuinely unique rather than a
  // find-and-replace of the country name.
  const bestByCountry = {};
  allApproved.forEach(e => {
    const c = (orgFor(e.orgId)?.country || '').toUpperCase();
    if (!c) return;
    if (!bestByCountry[c] || e.dist > bestByCountry[c]) bestByCountry[c] = e.dist;
  });
  const ranked = Object.entries(bestByCountry).sort((a, b) => b[1] - a[1]);
  const countriesWithData = ranked.length;
  const worldRank = hasData ? ranked.findIndex(([c]) => c === countryCode) + 1 : null;

  const categoryRecords = bestPerCategory(countryEntries);
  const top10 = bestPerPlayer(countryEntries).sort((a, b) => b.dist - a.dist).slice(0, 10);

  return (
    <SeoPage
      title={`Longest Golf Drives In ${countryName} — Records | Ripping Bombs`}
      description={hasData
        ? `The longest verified competition golf drive ever recorded in ${countryName}, plus category records and the full ${countryName} leaderboard on Ripping Bombs.`
        : `Be the first to put a verified longest drive record on the board for ${countryName} on Ripping Bombs.`}
    >
      {!hasData && (
        <Head>
          <meta name="robots" content="noindex,follow" />
        </Head>
      )}

      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
        Country Record {countryFlag(countryCode)}
      </div>
      <SeoH1>Longest Golf Drives In {countryName}</SeoH1>
      <SeoP>
        {hasData
          ? `${record.player} holds the longest verified drive recorded in ${countryName} on Ripping Bombs${worldRank ? `, ranking #${worldRank} of ${countriesWithData} countries with a verified record` : ''}. Every distance below comes from a real competition or simulator submission on the Ripping Bombs `
          : `No verified drives have been submitted from ${countryName} yet. Register a free club or simulator account and be the first to put ${countryName} on the board — every distance on Ripping Bombs comes from a real competition or simulator submission on the `}
        <Link href="/leaderboard" style={linkStyle}>leaderboard</Link> — no fiction, no estimates.
      </SeoP>

      {hasData ? (
        <div style={{ background:'linear-gradient(135deg, rgba(255,0,144,0.1), rgba(255,0,144,0.02))', border:`1px solid rgba(255,0,144,0.3)`, padding:'32px 28px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🏆</div>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
            {countryName} Record
          </div>
          <div style={{ fontFamily:DISP, fontSize:'clamp(56px,12vw,96px)', color:ORG, letterSpacing:1, lineHeight:1 }}>
            {cvt ? cvt(record.dist) : record.dist}
          </div>
          <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginBottom:14 }}>{unitLbl || 'yards'}</div>
          <div style={{ fontFamily:SANS, fontWeight:700, fontSize:17, color:TXT, marginBottom:4 }}>{record.player}</div>
          <div style={{ fontFamily:SANS, fontSize:13, color:MUT }}>{orgFor(record.orgId)?.courseName || 'Simulator'}</div>
          <button onClick={() => router.push(`/drive/${record.id}`)} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'10px 24px', cursor:'pointer', letterSpacing:.5, marginTop:18 }}>
            VIEW DRIVE →
          </button>
        </div>
      ) : (
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'32px 24px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:SANS, fontSize:13, color:DIM, marginBottom:16 }}>No verified drives from {countryName} yet — be the first.</div>
          <button onClick={() => router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'10px 24px', cursor:'pointer', letterSpacing:.5 }}>
            REGISTER FREE →
          </button>
        </div>
      )}

      {hasData && (
        <>
          <SeoH2>Category Records In {countryName}</SeoH2>
          <SeoP>The longest verified drive from {countryName} in each Ripping Bombs category.</SeoP>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:10, marginBottom:40 }}>
            {CATEGORY_KEYS.map((key) => {
              const rec = categoryRecords[key];
              return (
                <div key={key} onClick={() => rec && router.push(`/drive/${rec.id}`)} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'16px 16px 14px', cursor: rec ? 'pointer' : 'default' }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:DIM, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>{CATEGORY_LABELS[key]}</div>
                  {rec ? (
                    <>
                      <div style={{ fontFamily:DISP, fontSize:26, color:ORG, letterSpacing:0.5, lineHeight:1 }}>
                        {cvt ? cvt(rec.dist) : rec.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl || 'yds'}</span>
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

          <SeoH2>Top Drives In {countryName}</SeoH2>
          <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2, marginBottom:32 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
              <thead>
                <tr>
                  {['Rank','Player','Distance','Club Used','Course','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top10.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}`, cursor:'pointer' }} onClick={() => router.push(`/drive/${e.id}`)}>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13, color:DIM }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{e.player}</td>
                    <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG }}>{cvt ? cvt(e.dist) : e.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl || 'yds'}</span></td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.club}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{orgFor(e.orgId)?.courseName || 'Simulator'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <SeoCTA />

      <SeoH2>Explore More Records</SeoH2>
      <SeoP>
        <Link href="/biggest-hitters-by-country" style={linkStyle}>Biggest Hitters By Country</Link>{' | '}
        <Link href="/hall-of-fame" style={linkStyle}>Hall Of Fame</Link>{' | '}
        <Link href="/leaderboard" style={linkStyle}>Full Leaderboard</Link>
      </SeoP>
    </SeoPage>
  );
}
