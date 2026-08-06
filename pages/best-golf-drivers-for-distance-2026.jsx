import Link from 'next/link';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { Card } from '../components/UI';
import { ORG, TXT, MUT, DIM, BDR, BG3, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

// spin / forgiveness are 1-5 relative positioning for the chart below, derived from each driver's
// tested characteristics (lower spin = more forward CG / low-spin construction; forgiveness = MOI)
const DRIVERS = [
  {
    name: 'TaylorMade Qi4D LS',
    tag: 'Best Overall for Distance',
    blurb:
      "Independent test panels rate this the most complete driver of the year — it doesn't just win on raw carry, it does it while staying competitive on accuracy and forgiveness. The low-spin build moves fast through the air and suits players who already generate solid clubhead speed.",
    bestFor: 'Low handicappers wanting distance without giving up consistency',
    spin: 2.2,
    forgiveness: 3.4,
  },
  {
    name: 'TaylorMade Qi35 LS',
    tag: 'Highest Ball Speed on Test',
    blurb:
      'A forward CG and a stronger front weight push spin down and ball speed up. In head-to-head robot and player testing it produced the fastest ball speeds and longest carry of any driver in its category — a true low-spin bomber for players who can control it.',
    bestFor: 'Fast, repeatable swingers chasing maximum carry',
    spin: 1,
    forgiveness: 1.7,
  },
  {
    name: 'Callaway Quantum Max',
    tag: 'Top Distance Score, MyGolfSpy',
    blurb:
      "Callaway's Tri-Force face technology posted the fastest ball speeds and longest carry distances of any driver in a recent 42-model field test, with carry numbers pushing toward 286 yards on testing rigs. This is the pick when distance is the only stat that matters.",
    bestFor: 'Golfers who want the longest number on the sheet, full stop',
    spin: 1.7,
    forgiveness: 2.6,
  },
  {
    name: 'Callaway Quantum Triple Diamond Max',
    tag: "Editors' Overall Pick",
    blurb:
      'This model won multiple outlets\' overall "best driver" award for balancing tour-level ball speed with a tighter dispersion pattern than most low-spin heads manage. If you want distance without sacrificing fairways, this is the safer bet of the Quantum lineup.',
    bestFor: 'Players who want distance and dispersion control together',
    spin: 3,
    forgiveness: 4,
  },
  {
    name: 'Titleist GTS4',
    tag: 'Most Compact, Lowest Spin',
    blurb:
      "The tightest head in Titleist's new GTS lineup, with the most forward center of gravity of any model in the range for maximum spin reduction. Built for faster swingers who want a penetrating, boring flight rather than a high, ballooning one.",
    bestFor: 'Hard swingers who spin the ball too much with a standard driver',
    spin: 0.7,
    forgiveness: 1.3,
  },
  {
    name: 'PING G440 LST',
    tag: 'Distance With a Safety Net',
    blurb:
      "PING's low-spin model pairs a forward CG with the brand's usual high-MOI stability, so mishits still carry respectable distance. It rewards players with average-to-above-average swing speed and a fairly repeatable strike location.",
    bestFor: 'Mid-to-low handicappers who want distance without a tiny margin for error',
    spin: 2.5,
    forgiveness: 4.5,
  },
];

function SpinForgivenessChart() {
  const chartW = 640;
  const chartH = 380;
  const pad = 46;
  const plotW = chartW - pad * 2;
  const plotH = chartH - pad * 2;
  const scale = 5; // spin/forgiveness values run 1-5

  return (
    <div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        {/* quadrant gridlines */}
        <line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke={BDR} strokeWidth="1" />
        <line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke={BDR} strokeWidth="1" />
        <line x1={chartW / 2} y1={pad} x2={chartW / 2} y2={chartH - pad} stroke={BDR} strokeWidth="1" strokeDasharray="4 4" />
        <line x1={pad} y1={chartH / 2} x2={chartW - pad} y2={chartH / 2} stroke={BDR} strokeWidth="1" strokeDasharray="4 4" />

        {/* axis labels */}
        <text x={pad} y={chartH - 14} fill={DIM} fontFamily={SANS} fontSize="11">← Lower Spin</text>
        <text x={chartW - pad} y={chartH - 14} fill={DIM} fontFamily={SANS} fontSize="11" textAnchor="end">Higher Spin →</text>
        <text x={14} y={chartH - pad} fill={DIM} fontFamily={SANS} fontSize="11" transform={`rotate(-90 14 ${chartH - pad})`}>Less Forgiving</text>
        <text x={14} y={pad + 10} fill={DIM} fontFamily={SANS} fontSize="11" textAnchor="end" transform={`rotate(-90 14 ${pad + 10})`}>More Forgiving →</text>

        {DRIVERS.map((d, i) => {
          const x = pad + (d.spin / scale) * plotW;
          const y = chartH - pad - (d.forgiveness / scale) * plotH;
          return (
            <g key={d.name}>
              <circle cx={x} cy={y} r={11} fill={ORG} />
              <text x={x} y={y + 4} fill={BG3} fontFamily={SANS} fontWeight="700" fontSize="11" textAnchor="middle">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 16px', marginTop: 16 }}>
        {DRIVERS.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: ORG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontWeight: 700, fontSize: 11, color: BG3,
            }}>
              {i + 1}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: TXT }}>{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BestDriversForDistance2026() {
  const router = useRouter();

  function fireCta(label) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'drivers_page_register_cta_click', {
        event_category: 'engagement',
        page: '/best-golf-drivers-for-distance-2026',
        cta: label,
      });
    }
    router.push('/register');
  }

  return (
    <SeoPage
      title="Best Golf Drivers for Distance in 2026 | Ripping Bombs"
      description="The best golf drivers for distance in 2026, tested and ranked — plus what actually makes a driver go farther. See how your new numbers stack up on the Ripping Bombs leaderboard."
    >
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>
        2026 Buyer's Guide
      </div>
      <SeoH1>Best Golf Drivers for Distance in 2026</SeoH1>
      <SeoP>
        Every brand claims their newest driver is the longest one yet. Below are the models that
        actually backed that up in 2026 testing — pulled from robot and player data across the major
        independent test panels — along with what kind of golfer each one suits. Once you've picked
        your weapon, come find out how your new drive stacks up on the{' '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>global leaderboard</Link>.
      </SeoP>

      <div style={{ display: 'grid', gap: 14, marginBottom: 32 }}>
        {DRIVERS.map((d) => (
          <Card key={d.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: 0.5 }}>
                {d.name}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ORG, textTransform: 'uppercase' }}>
                {d.tag}
              </div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6, marginBottom: 8 }}>
              {d.blurb}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, letterSpacing: 0.3 }}>
              BEST FOR: <span style={{ color: MUT }}>{d.bestFor}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: MUT, textTransform: 'uppercase', marginBottom: 4 }}>
          Where Each Driver Sits: Spin vs. Forgiveness
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginBottom: 18 }}>
          Low-spin, low-forgiveness drivers reward fast, consistent swings. High-forgiveness models protect mishits at a small cost to peak distance.
        </div>
        <SpinForgivenessChart />
        <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12 }}>
          Approximate positioning based on published test data and manufacturer specs — for an exact fit, get measured on a launch monitor.
        </div>
      </Card>

      {/* Hybrid CTA strip */}
      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          NEW DRIVER, NEW NUMBERS — PROVE IT
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          A faster driver only matters if you can back it up. Register your club or simulator for
          free and submit verified drives to the global Ripping Bombs leaderboard to see exactly
          how much distance your new stick is really worth.
        </div>
        <button
          onClick={() => fireCta('mid_page')}
          style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', cursor: 'pointer', letterSpacing: 0.5 }}
        >
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>What Actually Makes a Driver Go Farther?</SeoH2>
      <SeoP>
        Ball speed is the single biggest factor in carry distance, and it's governed by a legal
        limit — every modern driver is built to transfer as close to the maximum allowed energy
        (a COR of 0.83) from clubface to ball as the rules permit, even on mishits. Since raw
        ball speed is effectively capped, the real battleground in 2026 is spin and launch: getting
        the ball into the air at the right angle with the right amount of backspin for your swing
        speed. Too much spin and the ball balloons and loses yards; too little and it drops out of
        the air early. The drivers above earned their spot by controlling that balance better than
        the rest of the field.
      </SeoP>

      <SeoH2>Low Spin vs High MOI: Which Should You Buy?</SeoH2>
      <SeoP>
        Low-spin drivers like the Qi35 LS and Titleist GTS4 are built for players who already
        swing fast and strike the ball consistently — they reward good contact with a longer,
        more penetrating flight, but punish mishits more than a forgiving model would. High-MOI
        drivers like the PING G440 LST or TaylorMade Qi4D spread more of the clubhead's mass
        around the perimeter, so off-center strikes still carry solid distance. If you're not
        being fit for equipment regularly, a higher-MOI driver will usually add more real-world
        yards than a low-spin head you can't consistently find the center of the face with.
      </SeoP>

      <SeoH2>Best Driver for Distance by Player Type</SeoH2>
      <SeoP>
        <strong style={{ color: TXT }}>Fast, low-handicap swingers:</strong> a low-spin head like
        the TaylorMade Qi35 LS or Titleist GTS4 will keep your natural spin from ballooning shots.{' '}
        <strong style={{ color: TXT }}>Mid-handicappers with above-average speed:</strong> the
        Callaway Quantum Max or PING G440 LST blend distance with a bit more margin for error.{' '}
        <strong style={{ color: TXT }}>Slower swing speeds or high handicaps:</strong> most golfers
        in this group actually lose distance in a low-spin driver — check our guide to the{' '}
        <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>best drivers for high handicappers</Link>{' '}
        instead, since a higher-launching, more forgiving head will usually outdrive a "distance"
        driver you can't load properly.
      </SeoP>

      <SeoH2>Do More Expensive Drivers Really Go Farther?</SeoH2>
      <SeoP>
        Not automatically. Price mostly buys you materials, adjustability, and manufacturing
        tolerances — not a guaranteed distance jump over last year's model. The biggest realistic
        gains for most amateur golfers come from proper fitting (loft, shaft, lie angle) rather
        than simply buying the newest release. That said, if your current driver is more than two
        or three seasons old, the aerodynamic and face-speed improvements across 2026's lineup are
        significant enough that most golfers will see a real gain from upgrading.
      </SeoP>

      <SeoH2>What's the Longest Drive Ever Hit?</SeoH2>
      <SeoP>
        The competitive record stands at 515 yards, hit by Mike Austin in 1974 during a US Senior
        National Open qualifier. Modern long drive competitors regularly clear 400 yards with
        purpose-built equipment and swing speeds most amateurs will never reach. Among everyday
        golfers, anything past 300 yards puts you in a very small percentile — exactly what{' '}
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>our distance percentile calculator</Link>{' '}
        can show you.
      </SeoP>

      {/* Final CTA */}
      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          READY TO SEE YOUR NUMBERS ON THE BOARD?
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          Join golfers and simulator venues worldwide competing on verified drives — free to register.
        </div>
        <button
          onClick={() => fireCta('bottom_page')}
          style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', cursor: 'pointer', letterSpacing: 0.5 }}
        >
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>How Far Do I Drive Compared to Others?</Link>{' | '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>Where Do I Rank Globally?</Link>{' | '}
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/average-golf-drive-distance" style={linkStyle}>Average Golf Drive Distance</Link>{' | '}
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' | '}
        <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>What Is A Good Drive In Golf</Link>
      </SeoP>
    </SeoPage>
  );
}
