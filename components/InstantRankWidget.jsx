import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { COUNTRIES, ORG, SANS, DISP } from '../lib/constants';

// Rank is computed against real, currently-live entries — the same
// `entries`/`orgs` arrays already loaded app-wide (see initData() in
// lib/data.js / getStaticProps in index.jsx), so this needs no API call
// and writes nothing to the DB. Split by gender only (no age/handicap
// band, unlike the six homepage categories) to keep the teaser to 4
// fields — intentionally an approximation, not the exact category rank
// shown post-registration.
function getOrgCountry(orgId, orgs) {
  const org = orgs.find(o => String(o.id) === String(orgId));
  return org?.country || null;
}

function computeRank(dist, gender, country, entries, orgs) {
  const d = Number(dist);
  const g = (gender || '').toLowerCase();
  const genderEntries = entries.filter(e => (e.gender || '').toLowerCase() === g);
  const globalBetter = genderEntries.filter(e => Number(e.dist) > d).length;
  const countryEntries = genderEntries.filter(e => getOrgCountry(e.orgId, orgs) === country);
  const nationalBetter = countryEntries.filter(e => Number(e.dist) > d).length;
  return {
    globalRank: globalBetter + 1,
    globalTotal: genderEntries.length + 1,
    nationalRank: nationalBetter + 1,
    nationalTotal: countryEntries.length + 1,
  };
}

// Verdict badge — same tiers/energy as the percentile calculator this
// widget replaced, but driven by a real rank instead of a modeled stat.
function getVerdict(rank, total) {
  const topPct = (rank / total) * 100;
  if (topPct <= 5)  return { label: '💥 ELITE BOMBER',   color: '#ff9900' };
  if (topPct <= 15) return { label: '🔥 BIG HITTER',      color: '#a3e635' };
  if (topPct <= 35) return { label: '💪 ABOVE AVERAGE',   color: '#a3e635' };
  if (topPct <= 65) return { label: '⛳ RIGHT IN THE MIX', color: '#e8e8e8' };
  return                    { label: '📈 ROOM TO GROW',    color: '#999' };
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    setDisplay(0);
    const start = performance.now();
    const duration = 850;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <>{display}</>;
}

// Styled to sit directly over the hero video (translucent white fields,
// not an opaque Card) — matches the old InlineCalculator this replaced.
// If this widget is ever reused somewhere off the hero, swap `inp`/`lbl`
// for the BG3/BDR tokens the rest of the site's forms use.
const inp = { width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', padding:'10px 12px', color:'#fff', fontFamily:SANS, fontSize:13, outline:'none', boxSizing:'border-box', borderRadius:0 };
const lbl = { display:'block', fontFamily:SANS, fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:4, textTransform:'uppercase', letterSpacing:1 };

export default function InstantRankWidget({ entries = [], orgs = [] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [dist, setDist] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  const canReveal = name.trim() && country && gender && dist && Number(dist) > 0;

  const handleReveal = () => {
    setError('');
    if (!canReveal) { setError('Fill in your name, gender, country and distance.'); return; }
    setResult(computeRank(dist, gender, country, entries, orgs));
    setVisible(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'homepage_instant_rank_revealed', { event_category: 'engagement', distance: Number(dist), gender, country });
    }
  };

  // Sends the visitor into the existing individual-registration flow with
  // their answers pre-filled, then (via the `redirect` query mechanism
  // register.jsx supports) back to /submit with the distance carried
  // over too. They still complete the real submission (photo, date,
  // club, handicap) for the entry to actually go live.
  const handleRegister = () => {
    const redirectPath = `/submit?dist=${encodeURIComponent(dist)}`;
    const qs = new URLSearchParams({ redirect: redirectPath, name: name.trim(), country, gender, dist: String(dist) }).toString();
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'homepage_instant_rank_register_click', { event_category: 'engagement' });
    }
    router.push(`/register?${qs}`);
  };

  const verdict = result ? getVerdict(result.globalRank, result.globalTotal) : null;

  return (
    <div className="rb-rank-widget" style={{ position:'relative', zIndex:1, maxWidth:720, margin:'0 auto', width:'100%' }}>
      {!result ? (
        <>
          <div className="rb-rank-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'0 10px', marginBottom:10 }}>
            <div style={{ marginBottom:10 }}>
              <label style={lbl}>Name<span style={{ color:ORG, marginLeft:2 }}>*</span></label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inp}/>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={lbl}>Gender<span style={{ color:ORG, marginLeft:2 }}>*</span></label>
              <div style={{ display:'flex', gap:6 }}>
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{ flex:1, padding:'10px 6px', background: gender===g ? ORG : 'rgba(255,255,255,0.08)', border:`1px solid ${gender===g ? ORG : 'rgba(255,255,255,0.15)'}`, color: gender===g ? '#000' : 'rgba(255,255,255,0.7)', fontFamily:SANS, fontWeight:700, fontSize:13, cursor:'pointer' }}
                  >
                    {g === 'male' ? '♂' : '♀'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={lbl}>Country<span style={{ color:ORG, marginLeft:2 }}>*</span></label>
              <select value={country} onChange={e=>setCountry(e.target.value)} style={inp}>
                <option value="" style={{ background:'#1a1a1a', color:'#fff' }}>Select...</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code} style={{ background:'#1a1a1a', color:'#fff' }}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={lbl}>Distance (yds)<span style={{ color:ORG, marginLeft:2 }}>*</span></label>
              <input type="number" value={dist} onChange={e=>setDist(e.target.value)} placeholder="e.g. 245" min="50" max="600" style={inp}/>
            </div>
          </div>

          {error && (
            <div style={{ fontFamily:SANS, fontSize:11.5, color:'#f87171', marginBottom:10 }}>{error}</div>
          )}

          <button onClick={handleReveal} className="rb-rank-cta" style={{ width:'100%', background:ORG, color:'#000', fontFamily:SANS, fontWeight:800, fontSize:14, padding:'13px 24px', border:'none', cursor:'pointer', letterSpacing:.5, boxShadow:'0 0 24px rgba(255,0,144,0.45)' }}>
            REVEAL MY RANK →
          </button>
        </>
      ) : (
        <div style={{ textAlign:'center', opacity: visible?1:0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)', transition:'opacity .4s ease, transform .4s ease' }}>
          <div style={{ display:'inline-block', fontFamily:SANS, fontSize:11, fontWeight:800, letterSpacing:2, color:verdict.color, border:`1px solid ${verdict.color}`, borderRadius:20, padding:'4px 14px', textTransform:'uppercase', marginBottom:10 }}>
            {verdict.label}
          </div>

          <div className="rb-rank-numbers" style={{ display:'flex', gap:24, justifyContent:'center', alignItems:'center', marginBottom:10 }}>
            <div>
              <div style={{ fontFamily:DISP, fontSize:'clamp(44px,7vw,64px)', color:ORG, letterSpacing:1, lineHeight:1, textShadow:'0 0 30px rgba(255,0,144,0.6)' }}>
                #<AnimatedNumber value={result.globalRank}/>
              </div>
              <div style={{ fontFamily:SANS, fontSize:10.5, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:1 }}>
                Global · of {result.globalTotal}
              </div>
            </div>
            <div className="rb-rank-divider" style={{ width:1, alignSelf:'stretch', background:'rgba(255,255,255,0.15)' }}/>
            <div>
              <div style={{ fontFamily:DISP, fontSize:'clamp(32px,5vw,44px)', color:'#fff', letterSpacing:1, lineHeight:1 }}>
                #<AnimatedNumber value={result.nationalRank}/>
              </div>
              <div style={{ fontFamily:SANS, fontSize:10.5, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:1 }}>
                National · of {result.nationalTotal}
              </div>
            </div>
          </div>

          <div style={{ fontFamily:SANS, fontSize:11.5, color:'rgba(255,255,255,0.5)', marginBottom:14 }}>
            This rank is real — but it's only yours once you register and submit.
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={handleRegister} style={{ background:ORG, color:'#000', fontFamily:SANS, fontWeight:800, fontSize:13, padding:'12px 26px', border:'none', cursor:'pointer', letterSpacing:.5, boxShadow:'0 0 24px rgba(255,0,144,0.45)' }}>
              CLAIM THIS RANK →
            </button>
            <button onClick={() => setResult(null)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', fontFamily:SANS, fontWeight:600, fontSize:12, padding:'12px 18px', cursor:'pointer' }}>
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
