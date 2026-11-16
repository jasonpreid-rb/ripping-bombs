// pages/golf-drive-distance-tracker.jsx
//
// SEO landing page for the free GPS drive tracker at /track.
// All copy is in the HTML on first render (the FAQ answers are in the DOM even
// when collapsed, and mirrored in the FAQPage structured data), so crawlers see
// everything. The canonical tag is set globally in _app.jsx.
//
// SCREENSHOTS: each step renders a built-in phone mockup that mirrors the live
// tracker UI. To use a real screenshot instead, drop the image in /public/images/
// and set the step's `image` field (e.g. '/images/track-step-1.jpg').
// Suggested size: 440x800.

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TXT, MUT, ORG, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

const SITE = 'https://www.rippingbombs.com';
const PATH = '/golf-drive-distance-tracker';
const TITLE = 'Free Golf Distance Tracker: Measure Your Drive | Ripping Bombs';
const DESCRIPTION =
  'Measure how far you really hit a golf ball using your phone’s GPS. Free, no app to download, works anywhere in the world. Then join the global long drive leaderboard.';

// ---- FAQ (rendered on the page and reused for the FAQ structured data) ----

const FAQ = [
  {
    q: 'How do I measure how far I hit my driver?',
    a: 'Open the Ripping Bombs tracker in your phone’s browser, mark your tee spot, hit your drive, walk to where the ball stopped and mark that spot. The tracker uses your phone’s GPS to calculate the distance between the two points and shows it in yards or meters.',
  },
  {
    q: 'Is the Ripping Bombs distance tracker really free?',
    a: 'Yes. Measuring drives with the tracker is completely free, with no card required. Submitting a drive to the global leaderboard needs a free account, which is also free to create.',
  },
  {
    q: 'Do I need to download an app?',
    a: 'No. The tracker runs in your phone’s web browser on iPhone and Android. Open it, allow location access, and you are ready to go. You can also add it to your home screen for quick access.',
  },
  {
    q: 'How accurate is phone GPS for measuring golf distance?',
    a: 'In open sky, smartphone GPS is typically accurate to within about 5 meters (16 feet). The tracker shows the accuracy of every reading, waits for the best signal when you mark a spot, and refuses readings that are too weak. Measuring in the open, away from tall buildings and dense trees, gives the best results.',
  },
  {
    q: 'Does it measure carry distance or total distance?',
    a: 'Total distance: from your tee spot to where the ball finally came to rest, so it includes the roll. It does not separate carry from roll. For the longest drive leaderboard, total distance is what counts.',
  },
  {
    q: 'Can I use it outside the United States, or in meters?',
    a: 'Yes. GPS works in every country, and the tracker shows your result in yards or meters, switchable with one tap. Course and range names come from OpenStreetMap, and if yours is not listed you can type the name in.',
  },
  {
    q: 'Do I need an account to use the tracker?',
    a: 'No. You can measure as many drives as you like without signing up. You only need a free account when you want to submit a drive to the leaderboard.',
  },
  {
    q: 'Does it work without mobile signal?',
    a: 'GPS itself does not need mobile data, but the tracker page needs to be loaded first, and the course lookup and leaderboard submission need an internet connection. Open the page before you walk out to the range.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Ripping Bombs Golf Distance Tracker',
      url: `${SITE}/track`,
      description:
        'A free web app that measures how far you hit a golf ball using your phone’s GPS. Works in any country, in yards or meters.',
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and location access',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

// ---- Small hooks ---------------------------------------------------------------

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Eases 0 -> 1 when `enabled` turns on. Resolves to 1 immediately when disabled
// or when the visitor prefers reduced motion.
function useCountUp(enabled, duration = 1200) {
  const [p, setP] = useState(enabled ? 0 : 1);
  useEffect(() => {
    if (!enabled || reducedMotion()) {
      setP(1);
      return undefined;
    }
    setP(0);
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      setP(1 - Math.pow(1 - t, 4));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, duration]);
  return p;
}

// True once the element has scrolled into view. Content is never hidden before
// that; only decoration (bands, lines) waits for it.
function useSeen(threshold = 0.4) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (typeof IntersectionObserver === 'undefined' || reducedMotion()) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

// ---- Phone mockups (these mirror the live /track screens) --------------------

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = ((i * 5 - 90) * Math.PI) / 180;
  const long = i % 6 === 0;
  const r1 = long ? 99 : 103;
  return {
    x1: (120 + r1 * Math.cos(a)).toFixed(1),
    y1: (120 + r1 * Math.sin(a)).toFixed(1),
    x2: (120 + 108 * Math.cos(a)).toFixed(1),
    y2: (120 + 108 * Math.sin(a)).toFixed(1),
    long,
  };
});

const mockTitle = { fontFamily: DISP, fontSize: 22, color: TXT, lineHeight: 1, margin: '0 0 8px' };
const mockH2 = { fontFamily: DISP, fontSize: 17, color: TXT, lineHeight: 1.1, margin: '8px 0 4px' };
const mockText = { fontFamily: SANS, fontSize: 10, color: MUT, lineHeight: 1.5, margin: '0 0 8px' };
const mockPanel = { background: '#17171c', border: `1px solid ${BDR}`, borderRadius: 8, padding: 9, margin: '8px 0' };
const mockBtn = {
  background: ORG,
  color: '#fff',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 11.5,
  borderRadius: 8,
  padding: '10px 0',
  textAlign: 'center',
  marginTop: 8,
};
const mockGhost = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 10.5,
  color: MUT,
  border: `1px solid ${BDR}`,
  borderRadius: 8,
  padding: '8px 0',
  textAlign: 'center',
  marginTop: 6,
};

function MockStatus() {
  return (
    <div className="gdt-status" aria-hidden="true">
      <span>9:41</span>
      <span className="gdt-batt" />
    </div>
  );
}

function MockSteps({ idx }) {
  return (
    <div className="gdt-msteps" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i <= idx ? 'on' : ''} />
      ))}
    </div>
  );
}

function MockGps({ label, level = 4 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 9.5, color: MUT, marginBottom: 6 }}>
      <span className="gdt-mbars">
        {[1, 2, 3, 4].map((i) => (
          <i key={i} className={i <= level ? 'on' : ''} style={{ height: 3 + i * 2.5 }} />
        ))}
      </span>
      {label}
    </div>
  );
}

function MockReticle({ size = 120, acc, idle, live }) {
  const k = idle ? 1 : Math.min(1, Math.max(0.2, 0.2 + (acc / 50) * 0.8));
  return (
    <div className="gdt-mret" style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`gdtSweep${size}${idle ? 'i' : 'a'}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3ddc84" stopOpacity="0" />
            <stop offset="1" stopColor="#3ddc84" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.long ? '#a0a0ad' : '#363636'} strokeWidth={t.long ? 2 : 1.4} />
        ))}
        <circle cx="120" cy="120" r="96" fill="none" stroke="#363636" strokeWidth="1.5" />
        {!idle && (
          <circle
            cx="120"
            cy="120"
            r="96"
            fill="rgba(61,220,132,0.14)"
            stroke="#3ddc84"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            style={{ transform: `scale(${k})`, transformOrigin: '120px 120px' }}
          />
        )}
        <g className={live ? 'gdt-sweep' : undefined} style={{ transformOrigin: '120px 120px', color: '#3ddc84' }}>
          <path d="M120 120 L120 24 A96 96 0 0 0 52 52 Z" fill={`url(#gdtSweep${size}${idle ? 'i' : 'a'})`} opacity={idle ? 0.35 : 1} />
          <line x1="120" y1="120" x2="120" y2="24" stroke="#3ddc84" strokeWidth="1.5" opacity="0.8" />
        </g>
        <circle cx="120" cy="120" r="2.5" fill="#3ddc84" />
      </svg>
      <div className="gdt-mret-read">
        <div style={{ fontFamily: DISP, fontSize: idle ? size * 0.2 : size * 0.26, color: TXT, lineHeight: 1 }}>
          {idle ? 'Ready' : `±${acc}`}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 7.5, color: MUT, marginTop: 2 }}>
          {idle ? 'GPS starts when you tap' : 'meters accuracy'}
        </div>
      </div>
    </div>
  );
}

function MockTrace({ live }) {
  // 247 yd drive, about ±6 yd of error, drawn to scale.
  return (
    <svg className={`gdt-mtrace${live ? ' live' : ''}`} viewBox="0 0 344 64" aria-hidden="true" focusable="false">
      <line x1="28" y1="30" x2="316" y2="30" stroke="#363636" strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={28 + 28.8 * i} y1={i % 5 === 0 ? 22 : 25} x2={28 + 28.8 * i} y2={i % 5 === 0 ? 38 : 35} stroke="#a0a0ad" strokeWidth="1.2" opacity="0.6" />
      ))}
      <rect className="band" x="299" y="17" width="34" height="26" rx="3" fill="rgba(255,0,144,0.16)" stroke={ORG} strokeDasharray="3 3" />
      <line className="draw" x1="28" y1="30" x2="316" y2="30" stroke={ORG} strokeWidth="3" strokeLinecap="round" strokeDasharray="288" />
      <circle cx="28" cy="30" r="6" fill={TXT} />
      <circle className="ball" cx="316" cy="30" r="7" fill={ORG} />
      <text x="28" y="58" textAnchor="middle" fill="#a0a0ad" fontSize="11" fontFamily={SANS}>Tee</text>
      <text x="316" y="58" textAnchor="middle" fill="#a0a0ad" fontSize="11" fontFamily={SANS}>Ball</text>
    </svg>
  );
}

function ScreenStart({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Track a drive</div>
      <div className="gdt-mstage">
        <MockReticle size={112} idle live={live} />
      </div>
      <p style={mockText}>
        Hit a ball, walk to it, and your phone measures the distance with GPS. No account needed to try it.
      </p>
      <div style={mockPanel}>
        <p style={{ ...mockText, margin: 0 }}>
          Your phone will ask for location access. It is used only to measure this drive and find your range or course.
        </p>
      </div>
      <div style={mockBtn}>Allow location and start</div>
    </>
  );
}

function ScreenTee({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Track a drive</div>
      <MockSteps idx={0} />
      <MockGps label="Strong GPS signal (±4 m)" />
      <div className="gdt-mstage good">
        <MockReticle size={116} acc={4} live={live} />
      </div>
      <div style={mockH2}>Mark where you hit from</div>
      <p style={mockText}>Stand at your tee spot and hold the phone still.</p>
      <div style={mockBtn}>Mark tee spot</div>
    </>
  );
}

function ScreenBall({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Track a drive</div>
      <MockSteps idx={1} />
      <MockGps label="Strong GPS signal (±3 m)" />
      <div className="gdt-mstage good">
        <MockReticle size={104} acc={3} live={live} />
      </div>
      <div style={{ ...mockH2, marginTop: 6 }}>Walk to your ball</div>
      <p style={{ ...mockText, marginBottom: 4 }}>Stop right next to it, hold still, then mark its position.</p>
      <div style={mockBtn}>Mark ball position</div>
      <div style={mockGhost}>Start over</div>
    </>
  );
}

function ScreenResult({ live }) {
  const p = useCountUp(live, 1100);
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Track a drive</div>
      <MockSteps idx={2} />
      <div className="gdt-mstage">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontFamily: DISP, fontSize: 78, lineHeight: 0.85, color: ORG, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(247 * p)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 9.5, color: MUT, paddingBottom: 3, lineHeight: 1.4 }}>
            yards
            <br />
            ±6 yds
          </div>
        </div>
        <MockTrace live={live} />
      </div>
      <div style={mockPanel}>
        <div style={{ fontFamily: DISP, fontSize: 15, color: TXT, marginBottom: 5 }}>Where did you hit?</div>
        <div style={{ fontFamily: SANS, fontSize: 10, color: TXT, marginBottom: 3 }}>
          <span style={{ color: ORG }}>●</span> Example Driving Range <span style={{ color: MUT }}>(range)</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 10, color: MUT }}>○ Somewhere else</div>
      </div>
      <div style={mockBtn}>Submit to leaderboard</div>
    </>
  );
}

const STEPS = [
  {
    title: 'Open the tracker and allow location',
    text: 'Open the tracker in your phone’s browser and tap start. When your phone asks for location access, allow it. The location is used only to measure your drive.',
    alt: 'Start screen of the Ripping Bombs golf distance tracker asking to allow location access',
    image: null,
    Screen: ScreenStart,
  },
  {
    title: 'Mark your tee spot',
    text: 'Stand where you hit from and tap Mark tee spot. Hold the phone still for a few seconds while it locks onto the best GPS signal.',
    alt: 'Tracker screen showing a strong GPS signal and a Mark tee spot button',
    image: null,
    Screen: ScreenTee,
  },
  {
    title: 'Walk to your ball and mark it',
    text: 'Hit your drive, walk to where the ball stopped, and tap Mark ball position. That is the whole measurement.',
    alt: 'Tracker screen prompting the golfer to walk to the ball and mark its position',
    image: null,
    Screen: ScreenBall,
  },
  {
    title: 'See your real distance',
    text: 'Your drive appears in yards or meters with its GPS accuracy. The tracker suggests the nearby range or course, and you can send the drive to the leaderboard.',
    alt: 'Result screen showing a measured drive of 247 yards with a nearby range suggested',
    image: null,
    Screen: ScreenResult,
  },
];

function Phone({ step, live = false }) {
  const { image, alt, Screen } = step;
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        width={240}
        loading="lazy"
        style={{ display: 'block', width: 240, maxWidth: '100%', height: 'auto', margin: '0 auto', borderRadius: 30, border: `1px solid ${BDR}` }}
      />
    );
  }
  return (
    <div role="img" aria-label={alt} className="gdt-phone">
      <div className="gdt-screen">
        <span className="gdt-island" aria-hidden="true" />
        <Screen live={live} />
      </div>
    </div>
  );
}

// The hero phone walks through the four screens on its own. It pauses while the
// visitor hovers or focuses it, and stays still for reduced-motion visitors.
function HeroPhone() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(true);

  useEffect(() => {
    setStill(reducedMotion());
  }, []);

  useEffect(() => {
    if (paused || still) return undefined;
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS.length), i === STEPS.length - 1 ? 5600 : 3400);
    return () => clearTimeout(t);
  }, [i, paused, still]);

  const step = STEPS[i];
  return (
    <div
      className="gdt-hero-phone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="gdt-rings" aria-hidden="true" />
      <div key={i} className="gdt-swap">
        <Phone step={step} live={!still} />
      </div>
      <div className="gdt-dots" role="group" aria-label="Tracker walkthrough">
        {STEPS.map((s, n) => (
          <button
            key={s.title}
            type="button"
            className={n === i ? 'on' : ''}
            aria-pressed={n === i}
            aria-label={`Show step ${n + 1}: ${s.title}`}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Accuracy visual -----------------------------------------------------------
// Two drives 20 yards apart, each drawn with a typical open-sky error of about
// 5 meters (5.5 yards). The bands do not touch.

function AccuracyViz() {
  const [ref, seen] = useSeen();
  const x = (yd) => 40 + ((yd - 220) / 60) * 640;
  const half = (5.5 / 60) * 640;
  const marks = [240, 260];
  return (
    <figure ref={ref} className={`gdt-acc${seen ? ' seen' : ''}`} style={{ margin: '28px 0 0', maxWidth: 720 }}>
      <svg viewBox="0 0 720 150" role="img" aria-label="Two drives, 240 and 260 yards, each shown with a plus or minus 5 meter GPS error band. The bands do not overlap." style={{ display: 'block', width: '100%', height: 'auto' }}>
        <line x1="40" y1="108" x2="680" y2="108" stroke={BDR} strokeWidth="2" />
        {Array.from({ length: 13 }, (_, n) => 220 + n * 5).map((yd) => (
          <g key={yd}>
            <line x1={x(yd)} y1="104" x2={x(yd)} y2={yd % 10 === 0 ? 118 : 113} stroke={DIM} strokeWidth="1.2" />
            {yd % 10 === 0 && (
              <text x={x(yd)} y="136" textAnchor="middle" fill={MUT} fontSize="13" fontFamily={SANS}>
                {yd}
              </text>
            )}
          </g>
        ))}
        {marks.map((yd, n) => (
          <g key={yd}>
            <rect className="band" x={x(yd) - half} y="44" width={half * 2} height="40" rx="4" fill="rgba(255,0,144,0.16)" stroke={ORG} strokeDasharray="4 4" style={{ transitionDelay: `${n * 0.25}s` }} />
            <circle className="pip" cx={x(yd)} cy="64" r="7" fill={ORG} style={{ transitionDelay: `${n * 0.25 + 0.2}s` }} />
            <text x={x(yd)} y="30" textAnchor="middle" fill={TXT} fontSize="18" fontFamily={DISP} letterSpacing="0.5">
              {yd} yards
            </text>
          </g>
        ))}
        <text x={x(250)} y="70" textAnchor="middle" fill={MUT} fontSize="12" fontFamily={SANS}>
          20 yards apart
        </text>
      </svg>
      <figcaption style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.6, marginTop: 10 }}>
        Each dashed band is a typical open-sky GPS error of about 5 meters (5.5 yards). Real accuracy varies, and the tracker shows the figure for every reading.
      </figcaption>
    </figure>
  );
}

// ---- FAQ accordion -------------------------------------------------------------
// Every answer is in the DOM at all times; closed answers are only collapsed with CSS.

function FaqList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="gdt-faq">
      {FAQ.map((f, n) => {
        const isOpen = open === n;
        return (
          <div key={f.q} className={`gdt-faq-item${isOpen ? ' open' : ''}`}>
            <h3>
              <button
                type="button"
                id={`faq-q-${n}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${n}`}
                onClick={() => setOpen(isOpen ? -1 : n)}
              >
                <span>{f.q}</span>
                <span className="gdt-faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="gdt-faq-a" id={`faq-a-${n}`} role="region" aria-labelledby={`faq-q-${n}`}>
              <div>
                <p>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Page styles -------------------------------------------------------------

const h2 = { fontFamily: DISP, fontSize: 34, color: TXT, letterSpacing: 0.5, lineHeight: 1.1, margin: '0 0 16px', fontWeight: 400 };
const body = { fontFamily: SANS, fontSize: 16, color: MUT, lineHeight: 1.75, margin: '0 0 16px', maxWidth: 660 };
const section = { marginTop: 80 };
const primaryCta = {
  display: 'inline-block',
  background: ORG,
  color: '#000',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 16,
  padding: '15px 30px',
  textDecoration: 'none',
  letterSpacing: 0.3,
};
const secondaryCta = {
  display: 'inline-block',
  border: `1px solid ${ORG}`,
  color: ORG,
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 15,
  padding: '14px 26px',
  textDecoration: 'none',
  letterSpacing: 0.3,
};
const link = { color: ORG, textDecoration: 'underline' };

// ---- Page ----------------------------------------------------------------------

export default function GolfDriveDistanceTrackerPage() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE}${PATH}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </Head>

      <div
        className="gdt"
        style={{ maxWidth: 980, margin: '0 auto', padding: '48px 18px 96px', '--org': ORG, '--txt': TXT, '--mut': MUT, '--bdr': BDR, '--dim': DIM, '--bg3': BG3, '--sans': SANS, '--disp': DISP }}
      >
        {/* Hero */}
        <header className="gdt-hero">
          <div>
            <h1 style={{ fontFamily: DISP, fontSize: 'clamp(40px, 8vw, 68px)', color: TXT, letterSpacing: 0.5, lineHeight: 1.02, margin: '0 0 20px', fontWeight: 400, maxWidth: 780 }}>
              Free golf distance tracker: find out how far you really hit it
            </h1>
            <p style={{ ...body, fontSize: 18, color: TXT }}>
              Guessing your yardage is easy. Knowing it is better. The Ripping Bombs tracker measures any drive with your
              phone’s GPS. No app to download, no launch monitor to buy, nothing to pay. Use it at any range or course,
              anywhere in the world.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <Link href="/track" className="gdt-cta" style={primaryCta}>
                Track a drive now
              </Link>
              <a href="#how-it-works" className="gdt-cta gdt-cta-2" style={secondaryCta}>
                See how it works
              </a>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: '18px 0 0' }}>
              Completely free. No account needed to measure. Works in yards or meters.
            </p>
          </div>
          <HeroPhone />
        </header>

        {/* How it works */}
        <section id="how-it-works" style={section}>
          <h2 style={h2}>How to measure your drive in four steps</h2>
          <p style={body}>
            It takes about a minute per drive and works on any modern iPhone or Android browser.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginTop: 36 }}>
            {STEPS.map((step, i) => (
              <figure key={step.title} style={{ margin: 0 }}>
                <Phone step={step} />
                <figcaption style={{ maxWidth: 250, margin: '20px auto 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: DISP, fontSize: 34, color: ORG, lineHeight: 1 }}>{i + 1}</span>
                    <h3 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: TXT, lineHeight: 1.3, margin: 0 }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.6, margin: 0 }}>{step.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div style={{ marginTop: 44 }}>
            <Link href="/track" className="gdt-cta" style={primaryCta}>
              Open the free tracker
            </Link>
          </div>
        </section>

        {/* Accuracy */}
        <section style={section}>
          <h2 style={h2}>How accurate is GPS for golf distance?</h2>
          <p style={body}>
            In open sky, smartphone GPS is typically accurate to within about 5 meters (16 feet). That is close enough
            to tell a 240-yard drive from a 260-yard one, which is what most golfers actually want to know.
          </p>
          <AccuracyViz />
          <p style={{ ...body, marginTop: 28 }}>
            The tracker shows the accuracy of every reading, listens for a few seconds to find the best signal when you
            mark a spot, and refuses readings that are too weak. For the most reliable result, measure in the open,
            away from tall buildings and dense trees, and hold the phone still while it locks on.
          </p>
          <p style={body}>
            It measures total distance: from the tee to where the ball stopped, including the roll. That is the number
            that counts on a long drive leaderboard.
          </p>
        </section>

        {/* Long drivers */}
        <section style={section}>
          <h2 style={h2}>Then join the world of long drivers</h2>
          <p style={body}>
            Every drive you measure can go on the global Ripping Bombs leaderboard. See where your longest drive ranks
            against golfers worldwide, with divisions for men, women, handicap and age, and a weekly leaderboard that
            gives everyone a fresh shot at the top.
          </p>
          <p style={body}>
            Submitting is free. Create a free account, and the tracker attaches a result card to your drive as
            evidence, so there is nothing to screenshot or upload.
          </p>
          <p style={body}>
            Browse the <Link href="/leaderboard" style={link}>global leaderboard</Link>, or see{' '}
            <Link href="/golf-longest-drive-competition" style={link}>how venues run long drive competitions</Link>.
          </p>
        </section>

        {/* Worldwide */}
        <section style={section}>
          <h2 style={h2}>Use it anywhere in the world</h2>
          <p style={body}>
            GPS works in every country, so the tracker works at your local range, your home course, or an open field on
            the other side of the world. Switch between yards and meters with one tap. Range and course names are
            suggested automatically from OpenStreetMap, and if yours is not listed you can type it in.
          </p>
          <p style={body}>
            There is nothing to install. Open the tracker in your phone’s browser and, if you like, add it to your home
            screen so it is one tap away on the range.
          </p>
        </section>

        {/* FAQ */}
        <section style={section}>
          <h2 style={h2}>Frequently asked questions</h2>
          <FaqList />
        </section>

        {/* Closing CTA */}
        <section className="gdt-close" style={{ ...section, background: BG3, border: `1px solid ${BDR}`, borderTop: `2px solid ${ORG}`, padding: '36px 28px' }}>
          <h2 style={{ ...h2, marginBottom: 10 }}>Ready to find out how far you really hit it?</h2>
          <p style={{ ...body, marginBottom: 20 }}>
            It is free, it takes a minute, and you will know your number.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/track" className="gdt-cta" style={primaryCta}>
              Track a drive now
            </Link>
            <Link href="/leaderboard" className="gdt-cta gdt-cta-2" style={secondaryCta}>
              See the leaderboard
            </Link>
          </div>
        </section>

        <style jsx global>{`
          /* ---- Hero ---- */
          .gdt-hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 48px;
            align-items: center;
          }
          @media (min-width: 880px) {
            .gdt-hero {
              grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
              gap: 32px;
            }
          }
          .gdt-hero-phone {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0 4px;
          }
          .gdt-rings {
            position: absolute;
            top: 46%;
            left: 50%;
            width: 440px;
            height: 440px;
            max-width: 130%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            pointer-events: none;
            background: repeating-radial-gradient(
              circle at center,
              transparent 0 46px,
              rgba(255, 255, 255, 0.07) 46px 47px
            );
            -webkit-mask-image: radial-gradient(circle, #000 35%, transparent 70%);
            mask-image: radial-gradient(circle, #000 35%, transparent 70%);
          }
          .gdt-swap {
            position: relative;
            animation: gdtSwap 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }
          .gdt-dots {
            position: relative;
            display: flex;
            gap: 4px;
            margin-top: 18px;
          }
          .gdt-dots button {
            width: 44px;
            height: 44px;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
            position: relative;
          }
          .gdt-dots button::after {
            content: '';
            position: absolute;
            left: 8px;
            right: 8px;
            top: 21px;
            height: 3px;
            border-radius: 2px;
            background: var(--bdr);
            transition: background 0.25s ease, left 0.25s ease, right 0.25s ease;
          }
          .gdt-dots button.on::after {
            background: var(--org);
            left: 4px;
            right: 4px;
          }
          .gdt-dots button:focus-visible,
          .gdt-faq-item button:focus-visible,
          .gdt-cta:focus-visible {
            outline: 3px solid #fff;
            outline-offset: 3px;
          }

          /* ---- Buttons ---- */
          .gdt-cta {
            transition: filter 0.15s ease, background 0.15s ease, transform 0.12s ease;
          }
          .gdt-cta:hover {
            filter: brightness(1.12);
          }
          .gdt-cta-2:hover {
            background: rgba(255, 0, 144, 0.1);
            filter: none;
          }
          .gdt-cta:active {
            transform: translateY(1px);
          }

          /* ---- Phone ---- */
          .gdt-phone {
            width: 240px;
            max-width: 100%;
            margin: 0 auto;
            padding: 8px;
            box-sizing: border-box;
            background: #000;
            border: 2px solid var(--bdr);
            border-radius: 36px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
          }
          .gdt-screen {
            position: relative;
            height: 452px;
            padding: 12px 14px 14px;
            box-sizing: border-box;
            overflow: hidden;
            background: #0d0d10;
            border-radius: 28px;
          }
          .gdt-island {
            position: absolute;
            top: 8px;
            left: 50%;
            width: 58px;
            height: 15px;
            margin-left: -29px;
            border-radius: 10px;
            background: #000;
            z-index: 2;
          }
          .gdt-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 6px 10px;
            font-family: var(--sans);
            font-size: 9px;
            font-weight: 600;
            color: var(--txt);
          }
          .gdt-batt {
            width: 16px;
            height: 8px;
            border-radius: 2.5px;
            background: var(--txt);
            opacity: 0.85;
          }
          .gdt-msteps {
            display: flex;
            gap: 4px;
            margin: 0 0 8px;
          }
          .gdt-msteps span {
            flex: 1;
            height: 3px;
            border-radius: 2px;
            background: #2b2b34;
          }
          .gdt-msteps span.on {
            background: var(--org);
          }
          .gdt-mbars {
            display: inline-flex;
            align-items: flex-end;
            gap: 1.5px;
          }
          .gdt-mbars i {
            display: block;
            width: 3px;
            border-radius: 1px;
            background: #363636;
          }
          .gdt-mbars i.on {
            background: #3ddc84;
          }
          .gdt-mstage {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 6px;
            margin: 0 0 6px;
            border: 1px solid #2b2b34;
            border-radius: 10px;
            background-color: #121216;
            background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
            background-size: 12px 12px;
          }
          .gdt-mstage.good {
            border-color: rgba(61, 220, 132, 0.4);
          }
          .gdt-mret {
            position: relative;
          }
          .gdt-mret svg {
            display: block;
            width: 100%;
            height: 100%;
            overflow: visible;
          }
          .gdt-mret-read {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .gdt-sweep {
            animation: gdtSweep 5s linear infinite;
          }
          .gdt-mtrace {
            display: block;
            width: 100%;
            height: auto;
            margin-top: 2px;
          }
          .gdt-mtrace.live .draw {
            animation: gdtDraw 1.2s cubic-bezier(0.25, 0.7, 0.2, 1) 0.1s both;
          }
          .gdt-mtrace.live .ball {
            animation: gdtFly 1.2s cubic-bezier(0.25, 0.7, 0.2, 1) 0.1s both;
          }
          .gdt-mtrace.live .band {
            animation: gdtFade 0.4s ease-out 1.2s both;
          }

          /* ---- Accuracy visual ---- */
          .gdt-acc .band {
            transform-box: fill-box;
            transform-origin: center;
            transform: scaleX(0);
            transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .gdt-acc .pip {
            transform-box: fill-box;
            transform-origin: center;
            transform: scale(0);
            transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.5, 1);
          }
          .gdt-acc.seen .band,
          .gdt-acc.seen .pip {
            transform: none;
          }

          /* ---- FAQ ---- */
          .gdt-faq {
            max-width: 740px;
            border-bottom: 1px solid var(--bdr);
          }
          .gdt-faq-item {
            position: relative;
            border-top: 1px solid var(--bdr);
          }
          .gdt-faq-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: -1px;
            bottom: -1px;
            width: 3px;
            background: var(--org);
            transform: scaleY(0);
            transform-origin: top;
            transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .gdt-faq-item.open::before {
            transform: scaleY(1);
          }
          .gdt-faq-item h3 {
            margin: 0;
          }
          .gdt-faq-item button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            width: 100%;
            min-height: 64px;
            padding: 18px 8px 18px 20px;
            border: 0;
            background: transparent;
            cursor: pointer;
            text-align: left;
            font-family: var(--sans);
            font-size: 17px;
            font-weight: 700;
            line-height: 1.4;
            color: var(--mut);
            transition: color 0.2s ease, background 0.2s ease;
          }
          .gdt-faq-item button:hover {
            color: var(--txt);
            background: rgba(255, 255, 255, 0.03);
          }
          .gdt-faq-item.open button {
            color: var(--txt);
          }
          .gdt-faq-icon {
            position: relative;
            flex: none;
            width: 28px;
            height: 28px;
            border: 1px solid var(--bdr);
            border-radius: 50%;
            transition: border-color 0.2s ease, background 0.2s ease, transform 0.3s ease;
          }
          .gdt-faq-icon::before,
          .gdt-faq-icon::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 12px;
            height: 2px;
            margin: -1px 0 0 -6px;
            border-radius: 1px;
            background: currentColor;
            transition: transform 0.3s ease;
          }
          .gdt-faq-icon::after {
            transform: rotate(90deg);
          }
          .gdt-faq-item.open .gdt-faq-icon {
            border-color: var(--org);
            background: var(--org);
            color: #000;
            transform: rotate(180deg);
          }
          .gdt-faq-item.open .gdt-faq-icon::after {
            transform: rotate(0deg);
          }
          .gdt-faq-a {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .gdt-faq-item.open .gdt-faq-a {
            grid-template-rows: 1fr;
          }
          .gdt-faq-a > div {
            min-height: 0;
            overflow: hidden;
          }
          .gdt-faq-a p {
            margin: 0;
            padding: 0 56px 22px 20px;
            max-width: 660px;
            font-family: var(--sans);
            font-size: 15px;
            line-height: 1.75;
            color: var(--mut);
          }

          /* ---- Closing panel ---- */
          .gdt-close {
            position: relative;
            overflow: hidden;
          }
          .gdt-close::after {
            content: '';
            position: absolute;
            right: -120px;
            top: 50%;
            width: 360px;
            height: 360px;
            transform: translateY(-50%);
            border-radius: 50%;
            pointer-events: none;
            background: repeating-radial-gradient(
              circle at center,
              transparent 0 40px,
              rgba(255, 0, 144, 0.14) 40px 41px
            );
          }
          .gdt-close > * {
            position: relative;
            z-index: 1;
          }

          /* ---- Motion ---- */
          @keyframes gdtSweep {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes gdtSwap {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
          }
          @keyframes gdtDraw {
            from {
              stroke-dashoffset: 288;
            }
          }
          @keyframes gdtFly {
            from {
              transform: translateX(-288px);
            }
          }
          @keyframes gdtFade {
            from {
              opacity: 0;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .gdt *,
            .gdt *::before,
            .gdt *::after {
              animation: none !important;
              transition: none !important;
            }
            .gdt-acc .band,
            .gdt-acc .pip {
              transform: none;
            }
          }
          @media (max-width: 520px) {
            .gdt-faq-item button {
              padding-left: 16px;
              font-size: 16px;
            }
            .gdt-faq-a p {
              padding: 0 16px 20px 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
