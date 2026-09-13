import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable } from '../components/SeoPageLayout';
import { Card, Field, Btn } from '../components/UI';
import { ORG, TXT, MUT, DIM, BG3, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

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

const SPEED_TABLE = [
  { level: 'Scratch / Low Handicap (0–5)', speed: '108–113 mph', carry: '~260–280 yds', avgSpeed: 110 },
  { level: 'Mid Handicap (6–15)', speed: '93–100 mph', carry: '~210–230 yds', avgSpeed: 96 },
  { level: 'High Handicap (16–28)', speed: '80–90 mph', carry: '~180–205 yds', avgSpeed: 85 },
  { level: 'Beginner / Slower Swing', speed: '70–80 mph', carry: '~150–180 yds', avgSpeed: 75 },
];

const METHODS = [
  { name: 'Overspeed Training', blurb: "Systems like SuperSpeed and the Stack System have you swing an underweighted club faster than your normal max, training your nervous system to move quicker before your regular driver ever leaves the bag. Structured protocols show average gains of roughly 5% in swing speed over a few weeks — for a 90 mph swing, that's typically 10–12 extra yards of carry." },
  { name: 'Strength & Mobility Training', blurb: 'Rotational power — hips, core, and shoulders working together — matters more for clubhead speed than raw arm strength. Med-ball rotational throws, hip mobility work, and general lower-body strength training all show up in launch monitor numbers over time, and the gains tend to stick.' },
  { name: 'Swing Sequencing & Attack Angle', blurb: "Two golfers with identical swing speed can produce very different distances depending on strike quality and attack angle. Hitting up on the ball even slightly rather than down into it can add real carry distance without changing your speed at all." },
  { name: 'Equipment & Shaft Fitting', blurb: "The wrong shaft weight or flex can cap your swing speed without you realizing it. A proper fitting session matched to your actual swing speed routinely unlocks speed that was already there." },
];

function SwingSpeedBarChart() {
  const maxSpeed = 120;
  const chartW = 640;
  const chartH = SPEED_TABLE.length * 54;
  const labelW = 190;
  const barAreaW = chartW - labelW - 60;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {SPEED_TABLE.map((row, i) => {
        const barW = (row.avgSpeed / maxSpeed) * barAreaW;
        const y = i * 54;
        return (
          <g key={row.level}>
            <text x={0} y={y + 22} fill={TXT} fontFamily={SANS} fontSize="12">{row.level}</text>
            <rect x={labelW} y={y + 10} width={barAreaW} height={20} fill="rgba(255,255,255,0.06)" />
            <rect x={labelW} y={y + 10} width={barW} height={20} fill={ORG} />
            <text x={labelW + barW + 10} y={y + 25} fill={ORG} fontFamily={SANS} fontWeight="700" fontSize="12">{row.avgSpeed} mph</text>
          </g>
        );
      })}
    </svg>
  );
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

// ── Embed code generator ──────────────────────────────────────────────────
// Renders a copyable <iframe> snippet pointing at /embed/calculator, so
// venues, blogs, and forum posts can drop the calculator into their own
// page. This is the mechanism behind the "linkable asset" strategy — every
// embed carries a live link back to Ripping Bombs.
function EmbedCodeSection() {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="https://www.rippingbombs.com/embed/calculator" width="100%" height="620" style="border:none;max-width:460px;" title="Golf Driving Distance Calculator by Ripping Bombs" loading="lazy"></iframe>`;

  function copyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'calculator_embed_code_copied', { event_category: 'engagement' });
      }
    }
  }

  return (
    <Card style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase', marginBottom: 8 }}>
        Add This To Your Site
      </div>
      <SeoP>
        Run a golf blog, course website, or simulator venue page? Embed this calculator directly —
        free, no sign-up, and it updates automatically as we refine the benchmarks.
      </SeoP>
      <div style={{ position: 'relative' }}>
        <textarea
          readOnly
          value={embedCode}
          onClick={e => e.target.select()}
          rows={3}
          style={{
            width: '100%', background: BG3, border: `1px solid ${BDR}`, borderRadius: 0,
            padding: '12px 14px', color: MUT, fontFamily: 'monospace', fontSize: 12,
            resize: 'none', boxSizing: 'border-box', lineHeight: 1.5,
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
        <Btn variant="orange" onClick={copyCode}>{copied ? 'COPIED ✓' : 'COPY EMBED CODE'}</Btn>
        <span style={{ fontFamily: SANS, fontSize: 11, color: DIM }}>Resize width/height freely — it's responsive up to 460px wide.</span>
      </div>
    </Card>
  );
}

export default function PercentileCalculator({ entries = [] }) {
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
      title="How Far Do I Drive Compared to Others? | Ripping Bombs"
      description="Find out how your golf driving distance compares to players of your age, gender and handicap. Free instant percentile calculator."
    >
      {/* Hero label */}
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Free Driving Distance Calculator
      </div>
      <SeoH1>How Far Do I Drive Compared to Other Golfers?</SeoH1>
      <SeoP>
        Ever wondered whether your driving distance is above average — or where you really sit
        compared to golfers of your age, <Link href="/average-golf-drive-distance-by-age" style={linkStyle}>handicap</Link>, and gender? Use our free calculator below to
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

      <EmbedCodeSection />

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

      <SeoH2>Driver Distance By Swing Speed</SeoH2>
      <SeoTable
        headers={['Swing Speed (mph)', 'Expected Carry (yards)', 'Total Distance (yards)']}
        rows={[
          ['70', '155–170', '175–195'], ['75', '170–185', '195–215'], ['80', '185–200', '210–230'],
          ['85', '200–215', '225–245'], ['90', '215–235', '240–260'], ['95', '235–255', '260–280'],
          ['100', '255–270', '280–300'], ['105', '270–285', '300–320'], ['110+', '285–305', '315–340'],
        ]}
      />
      <SeoP>These carry distances assume a reasonably efficient strike — centred contact, a launch angle of around 12–15 degrees, and spin in the 2,400–2,800 rpm range. Off-centre hits can reduce carry by 10–25 yards even at the same swing speed.</SeoP>

      <SeoH2>How To Actually Increase Your Distance</SeoH2>
      <SeoP>
        Every additional 1 mph of swing speed adds roughly 2 to 2.5 yards of carry, assuming launch and spin stay
        efficient — so taking a 95 mph swing to 105 mph could realistically add 20–25 yards. Here's what the data,
        and the game's biggest hitters, say actually moves the needle:
      </SeoP>
      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: MUT, textTransform: 'uppercase', marginBottom: 18 }}>Average Swing Speed by Skill Level</div>
        <SwingSpeedBarChart />
      </Card>
      <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        {METHODS.map((m) => (
          <Card key={m.name}>
            <div style={{ fontFamily: DISP, fontSize: 20, color: TXT, letterSpacing: 0.5, marginBottom: 8 }}>{m.name}</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6 }}>{m.blurb}</div>
          </Card>
        ))}
      </div>
      <SeoP>
        Beyond training, three free technique changes help most amateurs: teeing the ball higher and forward in your
        stance to hit up on it (even 3–4° can add 20+ yards by reducing spin), centring your strike on the clubface
        (off-centre hits lose real ball speed even with a fast swing), and getting fit for the right driver loft and
        shaft rather than assuming a stock setup suits your swing.
      </SeoP>
      <SeoP>
        Speed training protocols typically show measurable gains within the first month; expect your first
        noticeable jump within 4–6 weeks of consistent, focused work. Speed without control just means missing
        fairways further away though — pair any speed work with strike-quality practice.
      </SeoP>

      {(() => {
        const approved = entries.filter(e => e.dist > 0 && e.club);
        const brands = Object.entries(approved.reduce((acc, e) => { const b = e.club.split(' ')[0]; acc[b] = (acc[b] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (!brands.length) return null;
        return (
          <>
            <SeoH2>Popular Drivers Among Big Hitters</SeoH2>
            <SeoTable headers={['Driver Brand', 'Appearances In Top Drives']} rows={brands.map(([brand, count]) => [brand, count])} />
          </>
        );
      })()}

      <SeoH2>Want a Live Global Rank Instead of an Estimate?</SeoH2>
      <SeoP>
        This calculator uses benchmark averages to give you a quick, general estimate. If you'd rather see how you
        compare against real, verified drives submitted by golfers worldwide, check your{' '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>live global rank</Link> - it's calculated from
        actual Ripping Bombs leaderboard data, not statistical benchmarks.
      </SeoP>

      <SeoH2>What Is the Longest Drive Ever Hit?</SeoH2>
      <SeoP>
        The world record for the longest drive in competition is 515 yards, set by Mike Austin in 1974 during a US Senior National Open qualifier. In professional long drive competition, elite competitors regularly hit 400+ yards. Among amateur golfers, drives over 300 yards put you in a very small percentile of the golfing population — which is exactly what Ripping Bombs is built to celebrate.
      </SeoP>
    
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/where-do-i-rank-globally" style={linkStyle}>Where Do I Rank Globally?</Link>{' | '}
        <Link href="/average-golf-drive-distance-by-age" style={linkStyle}>Average Drive Distance By Age &amp; Handicap</Link>{' | '}
        <Link href="/best-golf-drivers-for-distance-2026" style={linkStyle}>Best Golf Drivers for Distance</Link>{' | '}
        <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>What Is A Good Drive In Golf</Link>
      </SeoP>
    </SeoPage>
  );
}
