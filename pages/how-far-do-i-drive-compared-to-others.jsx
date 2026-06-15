import { useState } from 'react';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { Card, Field, Btn } from '../components/UI';
import { ORG, TXT, MUT, DIM, BG3, BDR, SANS, DISP } from '../lib/constants';

// Estimated average driving distances (yards) by gender + handicap band + age group.
// These are rough, illustrative benchmarks based on commonly cited amateur golf data
// (not pulled from live submissions) — used only to estimate a percentile.
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

// Spread (yards) used as a rough standard deviation for the percentile curve
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

// Approximate normal CDF via error function approximation
function percentileFromZ(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  p = z > 0 ? 1 - p : p;
  return Math.round(p * 100);
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
        distance: d,
        handicap: h,
        age_group: ag,
        gender,
        percentile: pct,
      });
    }
  }

  function reset() {
    setDistance(''); setHcp(''); setAge(''); setGender('male'); setResult(null);
  }

  return (
    <SeoPage
      title="How Far Do I Drive Compared to Others? Free Driving Distance Percentile Calculator | Ripping Bombs"
      description="Find out how your golf driving distance compares to other players of your age, gender, and handicap. Free instant percentile calculator — see where you rank."
    >
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Driving Distance Calculator
      </div>
      <SeoH1>How Far Do I Drive Compared to Others?</SeoH1>
      <SeoP>
        Ever wondered where your driving distance ranks against golfers like you? Enter your average
        driver distance, handicap, age, and gender below and we'll estimate your percentile —
        instantly, with no account required.
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
          <Btn variant="orange" onClick={calculate}>CALCULATE MY PERCENTILE →</Btn>
          {result && <Btn variant="subtle" onClick={reset}>RESET</Btn>}
        </div>

        {result && (
          <div style={{ marginTop:24, paddingTop:24, borderTop:`1px solid ${BDR}`, textAlign:'center' }}>
            <div style={{ fontFamily:DISP, fontSize:'clamp(36px,8vw,64px)', color:ORG, letterSpacing:1, lineHeight:1 }}>
              Top {100 - result.pct}%
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginTop:8, marginBottom:4 }}>
              You drive farther than roughly <strong style={{ color:TXT }}>{result.pct}%</strong> of similar golfers
              ({result.ag === 'youth' ? 'under 18' : result.ag === 'senior' ? '55+' : '18–54'}, handicap {hcp},
              {gender === 'male' ? ' men' : ' women'}).
            </div>
            <div style={{ fontFamily:SANS, fontSize:12, color:DIM }}>
              Estimated average for your group: ~{result.avg} yards
            </div>
          </div>
        )}
      </Card>

      <div style={{ background:'rgba(163,230,53,0.05)', border:'1px solid rgba(163,230,53,0.2)', padding:'28px 24px', margin:'32px 0', textAlign:'center' }}>
        <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:1, marginBottom:8 }}>
          THINK YOU'VE GOT A LONG DRIVE IN YOU?
        </div>
        <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:18 }}>
          Register your club or simulator for free and start submitting verified drives to the global
          Ripping Bombs leaderboard — see how you stack up against players around the world.
        </div>
        <button onClick={()=>{
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'calculator_register_cta_click', {
              event_category: 'engagement',
              page: '/how-far-do-i-drive-compared-to-others',
            });
          }
          router.push('/register');
        }} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>How Is This Calculated?</SeoH2>
      <SeoP>
        Your percentile is estimated by comparing your driver distance to typical averages for golfers
        of your gender, age group, and handicap band. These benchmarks are based on commonly cited
        amateur golf statistics and are intended as a fun, general guide — not an exact measurement.
        For a verified ranking against real submitted drives, register and submit your longest drive
        to the live leaderboard.
      </SeoP>

      <SeoH2>What Affects Driving Distance?</SeoH2>
      <SeoP>
        Driver distance varies widely based on swing speed, technique, equipment, age, and physical
        fitness. Handicap is often correlated with distance, but plenty of shorter hitters with great
        accuracy maintain low handicaps, while some long hitters carry higher ones. Tracking your
        distance over time — and comparing it to others — is a great way to measure progress.
      </SeoP>
    </SeoPage>
  );
}
