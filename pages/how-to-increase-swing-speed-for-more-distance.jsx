import Link from 'next/link';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { Card } from '../components/UI';
import { ORG, TXT, MUT, DIM, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

const SPEED_TABLE = [
  { level: 'Scratch / Low Handicap (0–5)', speed: '108–113 mph', carry: '~260–280 yds', avgSpeed: 110 },
  { level: 'Mid Handicap (6–15)', speed: '93–100 mph', carry: '~210–230 yds', avgSpeed: 96 },
  { level: 'High Handicap (16–28)', speed: '80–90 mph', carry: '~180–205 yds', avgSpeed: 85 },
  { level: 'Beginner / Slower Swing', speed: '70–80 mph', carry: '~150–180 yds', avgSpeed: 75 },
];

// ~2.65 yds carry per mph, anchored on 90mph/214yd amateur avg and 113mph/275yd PGA avg
const CARRY_BY_SPEED = [
  { mph: 70, yds: 160 },
  { mph: 80, yds: 187 },
  { mph: 90, yds: 214 },
  { mph: 100, yds: 241 },
  { mph: 110, yds: 267 },
  { mph: 115, yds: 281 },
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
            <text x={0} y={y + 22} fill={TXT} fontFamily={SANS} fontSize="12">
              {row.level}
            </text>
            <rect x={labelW} y={y + 10} width={barAreaW} height={20} fill="rgba(255,255,255,0.06)" />
            <rect x={labelW} y={y + 10} width={barW} height={20} fill={ORG} />
            <text x={labelW + barW + 10} y={y + 25} fill={ORG} fontFamily={SANS} fontWeight="700" fontSize="12">
              {row.avgSpeed} mph
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CarryBySpeedChart() {
  const chartW = 640;
  const chartH = 260;
  const padL = 44;
  const padB = 30;
  const padT = 16;
  const maxYds = 300;
  const plotW = chartW - padL - 20;
  const plotH = chartH - padB - padT;
  const barGap = 18;
  const barW = (plotW - barGap * (CARRY_BY_SPEED.length - 1)) / CARRY_BY_SPEED.length;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {/* gridlines */}
      {[0, 75, 150, 225, 300].map((g) => {
        const y = padT + plotH - (g / maxYds) * plotH;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={chartW - 20} y2={y} stroke={BDR} strokeWidth="1" />
            <text x={0} y={y + 4} fill={DIM} fontFamily={SANS} fontSize="10">{g}</text>
          </g>
        );
      })}
      {CARRY_BY_SPEED.map((pt, i) => {
        const barH = (pt.yds / maxYds) * plotH;
        const x = padL + i * (barW + barGap);
        const y = padT + plotH - barH;
        return (
          <g key={pt.mph}>
            <rect x={x} y={y} width={barW} height={barH} fill={ORG} opacity={0.15 + (i / CARRY_BY_SPEED.length) * 0.85} />
            <text x={x + barW / 2} y={y - 8} fill={TXT} fontFamily={SANS} fontWeight="700" fontSize="12" textAnchor="middle">
              {pt.yds}
            </text>
            <text x={x + barW / 2} y={chartH - 8} fill={MUT} fontFamily={SANS} fontSize="11" textAnchor="middle">
              {pt.mph} mph
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const METHODS = [
  {
    name: 'Overspeed Training',
    blurb:
      "Systems like SuperSpeed and the Stack System have you swing an underweighted club faster than your normal max, training your nervous system to move quicker before your regular driver ever leaves the bag. Structured protocols have shown average gains of roughly 5% in swing speed over a few weeks of consistent use — for a 90 mph swing, that's typically 10–12 extra yards of carry.",
  },
  {
    name: 'Strength & Mobility Training',
    blurb:
      'Rotational power — hips, core, and shoulders working together — matters more for clubhead speed than raw arm strength. Med-ball rotational throws, hip mobility work, and general lower-body strength training all show up in launch monitor numbers over time, and unlike overspeed protocols, the gains tend to stick.',
  },
  {
    name: 'Swing Sequencing & Attack Angle',
    blurb:
      "Two golfers with identical swing speed can produce very different distances depending on strike quality and attack angle. Hitting up on the ball even slightly (a positive attack angle) rather than down into it can add real carry distance without changing your speed at all — often the fastest, free way to pick up yards.",
  },
  {
    name: 'Equipment & Shaft Fitting',
    blurb:
      "The wrong shaft weight or flex can cap your swing speed without you realizing it — too stiff or too heavy and you fight the club instead of releasing it. A proper fitting session matched to your actual swing speed (not your ego) routinely unlocks speed that was already there.",
  },
];

export default function IncreaseSwingSpeed() {
  const router = useRouter();

  function fireCta(label) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'swingspeed_page_register_cta_click', {
        event_category: 'engagement',
        page: '/how-to-increase-swing-speed-for-more-distance',
        cta: label,
      });
    }
    router.push('/register');
  }

  return (
    <SeoPage
      title="How to Increase Your Swing Speed for More Distance | Ripping Bombs"
      description="Proven ways to increase golf swing speed and add real yards to your drives — plus how much distance each extra mph actually adds. See where the gains put you on the Ripping Bombs leaderboard."
    >
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>
        Distance Training Guide
      </div>
      <SeoH1>How to Increase Your Swing Speed for More Distance</SeoH1>
      <SeoP>
        Buying a{' '}
        <Link href="/best-golf-drivers-for-distance-2026" style={linkStyle}>longer driver</Link>{' '}
        only gets you so far — the real ceiling on your distance is your swing speed. The good
        news is that unlike raw talent, swing speed is trainable at any age or handicap. Here's
        what actually moves the needle, and how much distance you can realistically expect to
        gain.
      </SeoP>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: MUT, textTransform: 'uppercase', marginBottom: 18 }}>
          Average Swing Speed by Skill Level
        </div>
        <SwingSpeedBarChart />
        <div style={{ display: 'grid', gap: 6, marginTop: 18 }}>
          {SPEED_TABLE.map((row) => (
            <div key={row.level} style={{ display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: DIM }}>{row.level}: <span style={{ color: MUT }}>{row.carry}</span> carry</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12 }}>
          Approximate figures based on commonly cited Trackman amateur data. Individual results vary with strike quality and launch conditions.
        </div>
      </Card>

      {/* CTA strip */}
      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          NOT SURE WHERE YOU STAND?
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          Use our free{' '}
          <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>distance percentile calculator</Link>{' '}
          to see how your current numbers compare to golfers of your age, gender, and handicap —
          then register free and submit a verified drive to track your progress as your speed climbs.
        </div>
        <button
          onClick={() => fireCta('mid_page')}
          style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 28px', cursor: 'pointer', letterSpacing: 0.5 }}
        >
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>How Much Distance Does 1 MPH of Swing Speed Really Add?</SeoH2>
      <SeoP>
        As a rule of thumb, every additional 1 mph of driver swing speed adds roughly 2 to 2.5
        yards of carry distance, assuming your launch angle and spin stay efficient. So a golfer
        who takes their swing speed from 95 mph to 105 mph — a realistic gain with a few months of
        focused training — could add somewhere around 20 to 25 yards of carry. That's the
        difference between a mid-iron and a wedge into the green on your average approach shot.
      </SeoP>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: MUT, textTransform: 'uppercase', marginBottom: 18 }}>
          Approx. Carry Distance by Swing Speed
        </div>
        <CarryBySpeedChart />
        <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12 }}>
          Illustrative only — assumes efficient launch and strike quality at each speed. Real gains depend on your own launch angle, spin, and contact.
        </div>
      </Card>

      <SeoH2>Proven Ways to Increase Swing Speed</SeoH2>
      <div style={{ display: 'grid', gap: 14, marginBottom: 8 }}>
        {METHODS.map((m) => (
          <Card key={m.name}>
            <div style={{ fontFamily: DISP, fontSize: 20, color: TXT, letterSpacing: 0.5, marginBottom: 8 }}>
              {m.name}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6 }}>
              {m.blurb}
            </div>
          </Card>
        ))}
      </div>

      <SeoH2>Is Speed Training Actually Worth It?</SeoH2>
      <SeoP>
        For most amateur golfers, yes — it's one of the highest-leverage things you can do for
        your scoring average. Shorter approach shots are easier to hit close, and the confidence
        boost from knowing you can reach a par 5 in two, or clear a hazard off the tee, changes
        how you play entire holes. The caveat: speed without control just means missing fairways
        further away. Pair any speed work with strike-quality practice, or consider a{' '}
        <Link href="/best-golf-drivers-for-distance-2026" style={linkStyle}>higher-MOI driver</Link>{' '}
        that forgives the mishits while your technique catches up to your new speed.
      </SeoP>

      <SeoH2>Realistic Timeline for Gains</SeoH2>
      <SeoP>
        Overspeed training protocols typically run 6 to 8 weeks and show measurable gains within
        the first month for most golfers, though results plateau without continued maintenance
        work. Strength and mobility gains build more slowly but tend to be more durable long-term.
        Technique changes (attack angle, sequencing) can add distance immediately once the change
        is grooved, but usually take longer to feel automatic under pressure. Realistically,
        expect your first noticeable jump within 4 to 6 weeks of consistent, focused work — not
        overnight, but faster than most other parts of the game improve.
      </SeoP>

      {/* Final CTA */}
      <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '28px 24px', margin: '32px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
          TRACK YOUR PROGRESS ON THE BOARD
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          As your swing speed climbs, submit verified drives to see the gains reflected in your
          real ranking — free to register.
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
        <Link href="/best-golf-drivers-for-distance-2026" style={linkStyle}>Best Golf Drivers for Distance 2026</Link>{' | '}
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>How Far Do I Drive Compared to Others?</Link>{' | '}
        <Link href="/where-do-i-rank-globally" style={linkStyle}>Where Do I Rank Globally?</Link>{' | '}
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' | '}
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>
      </SeoP>
    </SeoPage>
  );
}
