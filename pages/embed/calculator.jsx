import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { ORG, TXT, MUT, DIM, BG3, BDR, SANS, DISP } from '../../lib/constants';

// ── Standalone, iframe-embeddable version of the driving distance calculator ──
//
// Lives at /embed/calculator so third-party sites (venue pages, golf blogs,
// forum posts) can drop it in via <iframe src="https://www.rippingbombs.com/embed/calculator">
// with zero site chrome (no header/nav/footer). This is the page the "Get
// Embed Code" section on how-far-do-i-drive-compared-to-others.jsx points at.
//
// Deliberately noindex'd — it's a duplicate of the calculator on the main
// page and isn't meant to rank on its own; the dedicated page is.
//
// NOTE: confirm middleware.js / vercel headers don't set a global
// X-Frame-Options: SAMEORIGIN or restrictive frame-ancestors CSP — that
// would silently block this from being framed on any third-party domain.

const BENCHMARKS = {
  male: {
    youth:  { scratch: 250, low: 235, mid: 215, high: 190 },
    adult:  { scratch: 285, low: 260, mid: 235, high: 205 },
    senior: { scratch: 255, low: 235, mid: 215, high: 190 },
  },
  female: {
    youth:  { scratch: 195, low: 180, mid: 165, high: 145 },
    adult:  { scratch: 225, low: 205, mid: 185, high: 160 },
    senior: { scratch: 200, low: 185, mid: 170, high: 150 },
  },
};

const SPREAD = 28;

function ageGroup(age) {
  if (age < 18) return 'youth';
  if (age >= 55) return 'senior';
  return 'adult';
}

function hcpBand(hcp) {
  if (hcp <= 4) return 'scratch';
  if (hcp <= 12) return 'low';
  if (hcp <= 20) return 'mid';
  return 'high';
}

function percentileFromZ(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  p = z > 0 ? 1 - p : p;
  return Math.round(p * 100);
}

function getVerdict(topPct) {
  if (topPct <= 5)  return { label: '💥 ELITE BOMBER', color: '#ff9900' };
  if (topPct <= 15) return { label: '🔥 BIG HITTER',   color: ORG };
  if (topPct <= 35) return { label: '💪 ABOVE AVERAGE', color: '#a3e635' };
  if (topPct <= 65) return { label: '⛳ RIGHT IN THE MIX', color: TXT };
  return                    { label: '📈 ROOM TO GROW',  color: MUT };
}

function AnimatedResult({ result, hcp, gender }) {
  const topPct = 100 - result.pct;
  const verdict = getVerdict(topPct);
  const [displayPct, setDisplayPct] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setDisplayPct(0);
    setBarWidth(0);
    setVisible(false);

    const showTimer = setTimeout(() => {
      setVisible(true);
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayPct(Math.round(eased * topPct));
        setBarWidth(eased * result.pct);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    }, 80);

    return () => {
      clearTimeout(showTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [result]);

  return (
    <div style={{
      marginTop: 22, paddingTop: 22, borderTop: `1px solid ${BDR}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{
          display: 'inline-block', fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: 2, color: verdict.color, border: `1px solid ${verdict.color}`,
          padding: '5px 14px', textTransform: 'uppercase', marginBottom: 14,
        }}>
          {verdict.label}
        </div>

        <div style={{ fontFamily: DISP, fontSize: 'clamp(40px,11vw,64px)', color: ORG, letterSpacing: 1, lineHeight: 1 }}>
          TOP {displayPct}%
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginTop: 8, marginBottom: 20 }}>
          You out-drive roughly <strong style={{ color: TXT }}>{result.pct}%</strong> of similar golfers
          ({result.ag === 'youth' ? 'under 18' : result.ag === 'senior' ? '55+' : '18–54'},
          {' '}handicap {hcp}, {gender === 'male' ? 'men' : 'women'}).
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 9, color: DIM, marginBottom: 6, letterSpacing: 1 }}>
          <span>SHORT HITTERS</span>
          <span>LONG HITTERS</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, rgba(255,0,144,0.3), ${ORG})`,
          }}/>
          <div style={{
            position: 'absolute', top: -2, bottom: -2,
            left: `${barWidth}%`,
            width: 3,
            background: '#fff',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)',
          }}/>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 10, color: DIM, marginTop: 6, textAlign: 'center' }}>
          Estimated average for your group: ~{result.avg} yds
        </div>
      </div>
    </div>
  );
}

export default function EmbeddedCalculator() {
  const [distance, setDistance] = useState('');
  const [hcp, setHcp] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);

  function calculate() {
    const d = Number(distance);
    const h = Number(hcp);
    const a = Number(age);
    if (!d || isNaN(h) || !a) return;

    const ag = ageGroup(a);
    const hb = hcpBand(h);
    const avg = BENCHMARKS[gender][ag][hb];
    const z = (d - avg) / SPREAD;
    const pct = Math.max(1, Math.min(99, percentileFromZ(z)));

    setResult({ pct, avg, ag, hb });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'embed_percentile_calculated', {
        event_category: 'engagement',
        distance: d, handicap: h, age_group: ag, gender, percentile: pct,
      });
    }
  }

  function reset() {
    setDistance(''); setHcp(''); setAge(''); setGender('male'); setResult(null);
  }

  const inputStyle = {
    width: '100%', background: BG3, border: `1px solid ${BDR}`, borderRadius: 0,
    padding: '10px 12px', color: TXT, fontFamily: SANS, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: MUT,
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8,
  };

  return (
    <>
      <Head>
        <title>Driving Distance Calculator | Ripping Bombs</title>
        <meta name="robots" content="noindex,nofollow"/>
      </Head>
      <div style={{
        background: '#0a0a0a', minHeight: '100vh', padding: '20px 16px 24px',
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: ORG, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
            Driving Distance Calculator
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, textAlign: 'center', marginBottom: 18, lineHeight: 1.5 }}>
            See how your drive compares to golfers your age, handicap &amp; gender.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0 12px' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Distance (yds)<span style={{ color: ORG, marginLeft: 2 }}>*</span></label>
              <input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="e.g. 240" min={50} max={400} style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Handicap<span style={{ color: ORG, marginLeft: 2 }}>*</span></label>
              <input type="number" value={hcp} onChange={e => setHcp(e.target.value)} placeholder="e.g. 14" min={0} max={54} style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Age<span style={{ color: ORG, marginLeft: 2 }}>*</span></label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" min={5} max={99} style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Gender<span style={{ color: ORG, marginLeft: 2 }}>*</span></label>
              <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={calculate} style={{ background: ORG, color: '#000', fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '11px 22px', border: 'none', cursor: 'pointer', letterSpacing: .5 }}>
              CALCULATE →
            </button>
            {result && (
              <button onClick={reset} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '11px 16px', cursor: 'pointer' }}>
                RESET
              </button>
            )}
          </div>

          {result && <AnimatedResult result={result} hcp={hcp} gender={gender} />}
        </div>

        {/* Attribution footer — the whole point of the embed: a live link back */}
        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 14, borderTop: `1px solid ${BDR}` }}>
          <a href="https://www.rippingbombs.com/how-far-do-i-drive-compared-to-others" target="_blank" rel="noopener"
            style={{ fontFamily: SANS, fontSize: 10, color: DIM, textDecoration: 'none', letterSpacing: .5 }}>
            Powered by <span style={{ color: ORG, fontWeight: 700 }}>Ripping Bombs</span>
          </a>
        </div>
      </div>
    </>
  );
}
