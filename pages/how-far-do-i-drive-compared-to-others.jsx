import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { Card, Field, Btn } from '../components/UI';
import { ORG, TXT, MUT, DIM, BG3, BDR, SANS, DISP } from '../lib/constants';

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
        // Ease out cubic
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
      marginTop: 28, paddingTop: 28, borderTop: `1px solid ${BDR}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {/* Verdict badge */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-block', fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: 2, color: verdict.color, border: `1px solid ${verdict.color}`,
          padding: '5px 14px', textTransform: 'uppercase', marginBottom: 16,
        }}>
          {verdict.label}
        </div>

        {/* Big number */}
        <div style={{ fontFamily: DISP, fontSize: 'clamp(52px,12vw,88px)', color: ORG, letterSpacing: 1, lineHeight: 1 }}>
          TOP {displayPct}%
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginTop: 8, marginBottom: 24 }}>
          You out-drive roughly <strong style={{ color: TXT }}>{result.pct}%</strong> of similar golfers
          ({result.ag === 'youth' ? 'under 18' : result.ag === 'senior' ? '55+' : '18–54'},
          {' '}handicap {hcp}, {gender === 'male' ? 'men' : 'women'}).
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 10, color: DIM, marginBottom: 6, letterSpacing: 1 }}>
          <span>SHORT HITTERS</span>
          <span>LONG HITTERS</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, rgba(255,0,144,0.3), ${ORG})`,
            transition: 'none',
          }}/>
          {/* Marker for their position */}
          <div style={{
            position: 'absolute', top: -2, bottom: -2,
            left: `${barWidth}%`,
            width: 3,
            background: '#fff',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)',
            transition: 'none',
          }}/>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 6, textAlign: 'center' }}>
          Estimated average for your group: ~{result.avg} yds
        </div>
      </div>
    </div>
  );
}

export default function PercentileCalculator() {
  const router = useRouter();
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
      window.gtag('event', 'percentile_calculated', {
        event_category: 'engagement',
        distance: d, handicap: h, age_group: ag, gender, percentile: pct,
      });
    }
  }

  function reset() {
    setDistance(''); setHcp(''); setAge(''); setGender('male'); setResult(null);
  }

  return (
    <SeoPage
      title="How Far Do I Drive Compared to Others? Golf Driving Distance Calculator | Ripping Bombs"
      description="Find out how your golf driving distance compares to players of your age, gender and handicap. Free instant percentile calculator — see where you rank among amateur golfers worldwide."
    >
      {/* Hero label */}
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Free Driving Distance Calculator
      </div>
      <SeoH1>How Far Do I Drive Compared to Other Golfers?</SeoH1>
      <SeoP>
        Ever wondered whether your driving distance is above average — or where you really sit
        compared to golfers of your age, <Link href="/golf-handicap-driving-distance" style={linkStyle}>handicap</Link>, and gender? Use our free calculator below to
        find out instantly. No sign-up required.
      </SeoP>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'0 16px' }}>
          <Field label="Driver Distance (yards)" type="number" required
            value={distance} onChange={e=>setDistance(e.target.value)} placeholder="e.g. 240" min={50} max={400}/>
          <Field label="Handicap" type="number" required
            value={hcp} onChange={e=>setHcp(e.target.value)} placeholder="e.g. 14" min={0} max={54}/>
          <Field label="Age" type="number" required
            value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 35" min={5} max={99}/>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>
              Gender<span style={{ color:ORG, marginLeft:2 }}>*</span>
            </label>
            <select value={gender} onChange={e=>setGender(e.target.value)}
              style={{ width:'100%', background:BG3, border:`1px solid ${BDR}`, borderRadius:0, padding:'10px 14px', color:TXT, fontFamily:SANS, fontSize:14, outline:'none', boxSizing:'border-box' }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:6 }}>
          <Btn variant="orange" onClick={calculate}>CALCULATE MY RANK →</Btn>
          {result && <Btn variant="subtle" onClick={reset}>RESET</Btn>}
        </div>

        {result && <AnimatedResult result={result} hcp={hcp} gender={gender} />}
      </Card>

      {/* CTA strip — pink to match brand */}
      <div style={{ background:'rgba(255,0,144,0.05)', border:'1px solid rgba(255,0,144,0.2)', padding:'28px 24px', margin:'32px 0', textAlign:'center' }}>
        <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:1, marginBottom:8 }}>
          THINK YOU'VE GOT A LONG DRIVE IN YOU?
        </div>
        <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:18 }}>
          Register your club or simulator for free and submit verified drives to the global
          Ripping Bombs leaderboard — see how you stack up against players around the world.
        </div>
        <button onClick={()=>{
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'calculator_register_cta_click', { event_category:'engagement', page:'/how-far-do-i-drive-compared-to-others' });
          }
          router.push('/register');
        }} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>What Is a Good Driving Distance in Golf?</SeoH2>
      <SeoP>
        For amateur male golfers, the average driving distance sits somewhere between 200 and 240 yards depending on age and handicap. Scratch players typically average 260–285 yards, while high-handicappers often average closer to 190–210 yards. For amateur female golfers, averages range from around 145 to 225 yards across skill levels. If you're hitting it past the average for your group, you already have a significant advantage off the tee.
      </SeoP>

      <SeoH2>How Do I Compare to Other Golfers My Age?</SeoH2>
      <SeoP>
        Age has a real impact on driving distance. Golfers under 18 and over 55 tend to hit it shorter than those in their prime 25–45 window, though technique and fitness can offset this significantly. Our calculator adjusts for your age group — youth (under 18), adult (18–54), and senior (55+) — so your result is always compared to golfers like you, not the field at large.
      </SeoP>

      <SeoH2>Does Handicap Affect Driving Distance?</SeoH2>
      <SeoP>
        Yes — there's a strong correlation between handicap and driving distance. Scratch and low-handicap golfers tend to hit it further, largely because better ball striking transfers more energy efficiently at impact. However, it's not a hard rule: plenty of short hitters maintain low handicaps through accuracy, course management, and a strong short game, while some big hitters carry higher handicaps. Our calculator accounts for your handicap band to give a fairer comparison.
      </SeoP>

      <SeoH2>How Is This Calculated?</SeoH2>
      <SeoP>
        Your percentile is estimated by comparing your driver distance to benchmark averages for golfers of your gender, age group, and handicap band, using commonly cited amateur golf statistics. We apply a normal distribution curve to estimate roughly where you sit in the population. These are indicative benchmarks — not drawn from live submission data — and are intended as a fun, general guide. For a verified ranking against real submitted drives, register and submit your longest drive to the live Ripping Bombs leaderboard.
      </SeoP>

      <SeoH2>What Affects Driving Distance?</SeoH2>
      <SeoP>
        Driving distance is influenced by swing speed, launch angle, ball speed, spin rate, equipment, physical fitness, and technique. Club head speed is the single biggest factor — faster swings produce longer drives. Optimising your launch conditions (higher launch, lower spin for most amateurs) can add significant distance without changing your swing. Equipment upgrades, fitness improvements, and lessons focused on impact efficiency are the most reliable ways to add yards.
      </SeoP>

      <SeoH2>What Is the Longest Drive Ever Hit?</SeoH2>
      <SeoP>
        The world record for the longest drive in competition is 515 yards, set by Mike Austin in 1974 during a US Senior National Open qualifier. In professional long drive competition, elite competitors regularly hit 400+ yards. Among amateur golfers, drives over 300 yards put you in a very small percentile of the golfing population — which is exactly what Ripping Bombs is built to celebrate.
      </SeoP>
    
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' · '}
        <Link href="/average-golf-drive-distance" style={linkStyle}>Average Golf Drive Distance</Link>{' · '}
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' · '}
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' · '}
        <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>What Is A Good Drive In Golf</Link>
      </SeoP>
    </SeoPage>
  );
}
