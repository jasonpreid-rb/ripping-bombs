// pages/create-your-own-golf-leaderboard.jsx
//
// SEO landing page: anyone (business leagues, content creators, friends,
// families) can run their own leaderboard by registering as a venue, choosing a
// custom URL, generating a QR poster and sharing it.
//
// All copy is in the HTML on first render (FAQ answers are in the DOM even when
// collapsed, and mirrored in the FAQPage / HowTo structured data), so crawlers
// see everything. The canonical tag is set globally in _app.jsx.
//
// SCREENSHOTS: each step renders a built-in phone mockup that mirrors the real
// screens. To use a real screenshot instead, drop the image in /public/images/
// and set the step's `image` field (e.g. '/images/leaderboard-step-1.jpg').
// Suggested size: 440x800.
//
// The QR code in step 3 is an illustration (not scannable) and is hidden from
// screen readers; the step's alt text describes it.

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TXT, MUT, ORG, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

const SITE = 'https://www.rippingbombs.com';
const PATH = '/create-your-own-golf-leaderboard';
const TITLE = 'Create Your Own Golf Leaderboard: Leagues, Friends & Family';
const DESCRIPTION =
  'Create your own golf leaderboard for a business league, your followers, friends or family. Pick a custom link, generate a QR code, share it and let the competition begin.';
const START = '/register?type=venue';

// ---- FAQ (rendered on the page and reused for the FAQ structured data) ----

const FAQ = [
  {
    q: 'Can I create my own golf leaderboard for my friends, family or league?',
    a: 'Yes. Register a free venue account, choose a custom URL, and share your link or QR code. Anyone who joins can submit drives and appear on your leaderboard. It works for business leagues, content creators, friend groups and families, not only golf clubs.',
  },
  {
    q: 'Do I have to be a golf club or a business?',
    a: 'No. Accounts that run a leaderboard are called venues, but the venue name can be anything: “Friday Night League”, your channel name or “The Smith Family Open”. If you want to run a leaderboard, register as a venue rather than as an individual player.',
  },
  {
    q: 'Is it free to create a leaderboard?',
    a: 'Registering a venue is free, with no card required, and every venue starts on the free tier with its own public leaderboard page. Venues can optionally upgrade to TV Display & Sponsors, which is free for 3 months and then $49 per month.',
  },
  {
    q: 'How do I choose my own leaderboard link?',
    a: 'In your venue dashboard, set a custom URL using letters, numbers and hyphens, for example friday-league. If you leave it blank, a link is created from your venue name. That link is the web address of your leaderboard, so it is easy to put in a bio, a group chat or an email.',
  },
  {
    q: 'How do I get a QR code for my leaderboard?',
    a: 'Open your venue dashboard and tap Get QR Poster. You get a QR code for your leaderboard that you can print, put on a screen, add to a video or share online. People scan it with their phone camera to reach your leaderboard.',
  },
  {
    q: 'How do players join my leaderboard?',
    a: 'Share your link or QR code. Players create a free account, choose your venue when they submit a drive, and appear on your leaderboard. Your venue is also listed on Ripping Bombs, so players can find it themselves.',
  },
  {
    q: 'Is my leaderboard private?',
    a: 'Your leaderboard has its own web page that anyone with the link can view. Only the people you share the link or QR code with will know to join, which makes it a leaderboard just for your group, but it is not password protected.',
  },
  {
    q: 'Can I show my leaderboard on a TV?',
    a: 'Yes. The optional TV Display tier gives you a live, always-on leaderboard for any screen at your venue, with room for a sponsor logo. It is free for 3 months, then $49 per month. You can start without it.',
  },
];

const HOWTO_STEPS = [
  {
    name: 'Register as a venue',
    text: 'Create a free account and choose “I run a venue” instead of “I’m a player”. Name your leaderboard.',
  },
  {
    name: 'Set a custom URL and generate your QR code',
    text: 'In your dashboard, choose a custom URL for your leaderboard, then tap Get QR Poster to generate your QR code.',
  },
  {
    name: 'Share your link or QR code',
    text: 'Send the link to your group, put it in your bio, or show the QR code on a poster, a screen or a video.',
  },
  {
    name: 'Let the competition begin',
    text: 'Players join, submit their drives and appear on your leaderboard, ranked live.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HowTo',
      name: 'How to create your own golf leaderboard',
      description: DESCRIPTION,
      totalTime: 'PT5M',
      step: HOWTO_STEPS.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
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

// True once the element has scrolled into view. Content is never hidden before
// that; only decoration waits for it.
function useSeen(threshold = 0.3) {
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

// ---- Illustrative QR code (not scannable) -------------------------------------

const QR_N = 21;
const QR_CELLS = (() => {
  let s = 7;
  const out = [];
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
  for (let y = 0; y < QR_N; y += 1) {
    for (let x = 0; x < QR_N; x += 1) {
      if (!inFinder(x, y)) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        if ((s >> 16) % 2) out.push([x, y]);
      }
    }
  }
  return out;
})();
const QR_FINDERS = [
  [0, 0],
  [14, 0],
  [0, 14],
];

function MockQr({ size = 112, live }) {
  return (
    <div className="clb-qr" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox={`-1 -1 ${QR_N + 2} ${QR_N + 2}`} focusable="false">
        <rect x="-1" y="-1" width={QR_N + 2} height={QR_N + 2} fill="#fff" />
        {QR_FINDERS.map(([ox, oy]) => (
          <g key={`${ox}${oy}`}>
            <rect x={ox} y={oy} width="7" height="7" fill="#0d0d10" />
            <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" />
            <rect x={ox + 2} y={oy + 2} width="3" height="3" fill={ORG} />
          </g>
        ))}
        {QR_CELLS.map(([x, y], i) => (
          <rect
            key={`${x}-${y}`}
            className={live ? 'clb-qcell' : undefined}
            x={x}
            y={y}
            width="1"
            height="1"
            fill="#0d0d10"
            style={live ? { animationDelay: `${(i % 60) * 14}ms` } : undefined}
          />
        ))}
      </svg>
      {live && <span className="clb-scan" />}
    </div>
  );
}

// ---- Phone mockups (these mirror the real screens) ----------------------------

const mockTitle = { fontFamily: DISP, fontSize: 22, color: TXT, lineHeight: 1, margin: '0 0 8px' };
const mockText = { fontFamily: SANS, fontSize: 10, color: MUT, lineHeight: 1.5, margin: '0 0 8px' };
const mockLabel = { fontFamily: SANS, fontSize: 9, fontWeight: 600, color: MUT, margin: '8px 0 4px', letterSpacing: 0.3 };
const mockField = {
  fontFamily: SANS,
  fontSize: 10.5,
  color: TXT,
  background: BG3,
  border: `1px solid ${BDR}`,
  borderRadius: 6,
  padding: '8px 9px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};
const mockBtn = {
  background: ORG,
  color: '#fff',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 11.5,
  borderRadius: 8,
  padding: '10px 0',
  textAlign: 'center',
  marginTop: 10,
};
const mockOutline = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 10.5,
  color: ORG,
  border: `1px solid ${ORG}`,
  borderRadius: 8,
  padding: '9px 0',
  textAlign: 'center',
  marginTop: 8,
};
const mockGhost = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 10,
  color: MUT,
  border: `1px solid ${BDR}`,
  borderRadius: 8,
  padding: '7px 0',
  textAlign: 'center',
  marginTop: 8,
};

function MockStatus() {
  return (
    <div className="clb-status" aria-hidden="true">
      <span>9:41</span>
      <span className="clb-batt" />
    </div>
  );
}

function ScreenRegister({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Register your venue</div>
      <div style={{ display: 'flex', border: `1px solid ${BDR}`, marginBottom: 6 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '7px 0', fontFamily: SANS, fontSize: 9.5, color: MUT }}>I’m a player</div>
        <div className={live ? 'clb-pick' : undefined} style={{ flex: 1, textAlign: 'center', padding: '7px 0', fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: '#fff', background: ORG }}>
          I run a venue
        </div>
      </div>
      <p style={{ ...mockText, margin: '4px 0 0' }}>Free forever · No card required</p>
      <div style={mockLabel}>Venue Name</div>
      <div style={mockField}>
        <span className={live ? 'clb-type' : undefined}>Friday Night League</span>
      </div>
      <div style={mockLabel}>Email</div>
      <div style={{ ...mockField, color: MUT }}>you@example.com</div>
      <div style={mockLabel}>Password</div>
      <div style={{ ...mockField, color: MUT }}>••••••••••</div>
      <div style={mockBtn}>Submit Registration →</div>
    </>
  );
}

function ScreenUrl({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Dashboard</div>
      <div style={{ fontFamily: SANS, fontSize: 8.5, color: MUT, textTransform: 'uppercase', letterSpacing: 0.8, margin: '4px 0 2px' }}>Your leaderboard</div>
      <div style={mockLabel}>Custom URL</div>
      <div style={mockField}>
        <span style={{ color: DIM, fontSize: 9 }}>rippingbombs.com/</span>
        <span className={live ? 'clb-type clb-caret' : undefined} style={{ color: TXT }}>friday-league</span>
      </div>
      <p style={{ ...mockText, color: DIM, marginTop: 5 }}>Letters, numbers and hyphens only.</p>
      <div style={mockGhost}>Save changes</div>
      <div className={live ? 'clb-glow' : undefined} style={mockOutline}>Get QR Poster</div>
      <div style={{ ...mockField, marginTop: 12, justifyContent: 'space-between', color: MUT, fontSize: 9.5 }}>
        <span>Friday Night League</span>
        <span style={{ color: ORG }}>Leaderboard</span>
      </div>
    </>
  );
}

function ScreenShare({ live }) {
  return (
    <>
      <MockStatus />
      <div style={mockTitle}>Your QR poster</div>
      <div className="clb-stage">
        <MockQr size={112} live={live} />
        <div style={{ fontFamily: DISP, fontSize: 15, color: TXT, marginTop: 8, lineHeight: 1 }}>Friday Night League</div>
        <div style={{ fontFamily: SANS, fontSize: 8.5, color: MUT, marginTop: 3 }}>Scan to join the leaderboard</div>
      </div>
      <div style={{ ...mockField, marginTop: 8, fontSize: 9.5, color: ORG }}>rippingbombs.com/clubs/friday-league</div>
      <div style={mockBtn}>Copy link</div>
      <div style={mockGhost}>Print poster</div>
    </>
  );
}

const ROWS = [
  ['1', 'Sam K.', '287'],
  ['2', 'Jo M.', '274'],
  ['3', 'Priya R.', '266'],
  ['4', 'Dan W.', '251'],
  ['5', 'Lee T.', '243'],
];

function ScreenLive({ live }) {
  return (
    <>
      <MockStatus />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...mockTitle, fontSize: 18, margin: 0 }}>Friday Night League</div>
        <span className="clb-live">LIVE</span>
      </div>
      <p style={{ ...mockText, margin: '4px 0 8px' }}>Longest drive · yards</p>
      <div className={`clb-rows${live ? ' go' : ''}`}>
        {ROWS.map(([r, name, d], i) => (
          <div key={r} className={`clb-row${i === 0 ? ' top' : ''}`} style={{ animationDelay: `${i * 0.14}s` }}>
            <span style={{ fontFamily: DISP, fontSize: 15, color: i === 0 ? ORG : MUT, width: 18 }}>{r}</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: TXT, flex: 1 }}>{name}</span>
            <span style={{ fontFamily: DISP, fontSize: 16, color: i === 0 ? ORG : TXT }}>{d}</span>
          </div>
        ))}
      </div>
      <div className={live ? 'clb-toast' : undefined} style={{ ...mockOutline, marginTop: 10 }}>+ New drive submitted</div>
    </>
  );
}

const STEPS = [
  {
    title: 'Register as a venue',
    text: 'Create a free account and choose “I run a venue”, not “I’m a player”. Your venue name is the name of your leaderboard: a league, a channel, a family.',
    alt: 'Ripping Bombs registration screen with the “I run a venue” option selected and the venue name Friday Night League',
    image: null,
    Screen: ScreenRegister,
  },
  {
    title: 'Set your custom URL',
    text: 'In your dashboard, choose the web address for your leaderboard, like friday-league. It is short, memorable and yours.',
    alt: 'Venue dashboard showing the custom URL field with friday-league and a Get QR Poster button',
    image: null,
    Screen: ScreenUrl,
  },
  {
    title: 'Generate your QR code and share',
    text: 'Tap Get QR Poster to generate your QR code. Share the link, or print, post or screen-share the code with your audience.',
    alt: 'QR poster for the Friday Night League leaderboard with a copy link button',
    image: null,
    Screen: ScreenShare,
  },
  {
    title: 'Let the competition begin',
    text: 'Players scan, join and submit their drives. Your leaderboard ranks everyone live, with categories for age and division.',
    alt: 'Live Friday Night League leaderboard ranking five players by longest drive in yards',
    image: null,
    Screen: ScreenLive,
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
    <div role="img" aria-label={alt} className="clb-phone">
      <div className="clb-screen">
        <span className="clb-island" aria-hidden="true" />
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
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS.length), i === STEPS.length - 1 ? 5600 : 3800);
    return () => clearTimeout(t);
  }, [i, paused, still]);

  const step = STEPS[i];
  return (
    <div
      className="clb-hero-phone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="clb-rings" aria-hidden="true" />
      <div key={i} className="clb-swap">
        <Phone step={step} live={!still} />
      </div>
      <div className="clb-dots" role="group" aria-label="Leaderboard setup walkthrough">
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

// ---- Audiences -------------------------------------------------------------------

const icon = { width: 34, height: 34, fill: 'none', stroke: ORG, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const AUDIENCES = [
  {
    title: 'Business leagues',
    text: 'Run an office, company or social league with weekly bragging rights and no spreadsheets. Share one link and everyone can see where they stand.',
    svg: (
      <svg viewBox="0 0 34 34" {...icon} aria-hidden="true" focusable="false">
        <rect x="4" y="11" width="26" height="17" rx="2.5" />
        <path d="M12 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
        <path d="M4 19h26" />
      </svg>
    ),
  },
  {
    title: 'Content creators',
    text: 'Give your audience something to compete on. Put the link in your bio, show the QR code in your videos and let followers chase the top spot.',
    svg: (
      <svg viewBox="0 0 34 34" {...icon} aria-hidden="true" focusable="false">
        <rect x="4" y="7" width="26" height="20" rx="3" />
        <path d="M14 13l7 4-7 4z" />
      </svg>
    ),
  },
  {
    title: 'Friends',
    text: 'Settle the group chat debate once and for all. Everyone submits, the leaderboard decides who really hits it furthest.',
    svg: (
      <svg viewBox="0 0 34 34" {...icon} aria-hidden="true" focusable="false">
        <circle cx="11" cy="12" r="4" />
        <circle cx="23" cy="12" r="4" />
        <path d="M3 28c0-5 3.5-8 8-8s8 3 8 8" />
        <path d="M19 21c1.2-.7 2.5-1 4-1 4.5 0 8 3 8 8" />
      </svg>
    ),
  },
  {
    title: 'Families',
    text: 'Dad versus the kids, grandparents included. Track the whole family across the season, with age categories that keep it fair.',
    svg: (
      <svg viewBox="0 0 34 34" {...icon} aria-hidden="true" focusable="false">
        <path d="M5 16L17 6l12 10" />
        <path d="M8 14v14h18V14" />
        <path d="M14 28v-8h6v8" />
      </svg>
    ),
  },
];

function Audiences() {
  const [ref, seen] = useSeen(0.2);
  return (
    <div ref={ref} className={`clb-aud${seen ? ' seen' : ''}`}>
      {AUDIENCES.map((a, n) => (
        <div key={a.title} className="clb-card" style={{ animationDelay: `${n * 0.09}s` }}>
          <div className="clb-card-ico">{a.svg}</div>
          <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: TXT, margin: '14px 0 8px' }}>{a.title}</h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.65, margin: 0 }}>{a.text}</p>
        </div>
      ))}
    </div>
  );
}

// ---- FAQ accordion -------------------------------------------------------------
// Every answer is in the DOM at all times; closed answers are only collapsed with CSS.

function FaqList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="clb-faq">
      {FAQ.map((f, n) => {
        const isOpen = open === n;
        return (
          <div key={f.q} className={`clb-faq-item${isOpen ? ' open' : ''}`}>
            <h3>
              <button
                type="button"
                id={`clb-q-${n}`}
                aria-expanded={isOpen}
                aria-controls={`clb-a-${n}`}
                onClick={() => setOpen(isOpen ? -1 : n)}
              >
                <span>{f.q}</span>
                <span className="clb-faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="clb-faq-a" id={`clb-a-${n}`} role="region" aria-labelledby={`clb-q-${n}`}>
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

export default function CreateYourOwnGolfLeaderboardPage() {
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
        className="clb"
        style={{ maxWidth: 980, margin: '0 auto', padding: '48px 18px 96px', '--org': ORG, '--txt': TXT, '--mut': MUT, '--bdr': BDR, '--dim': DIM, '--bg3': BG3, '--sans': SANS, '--disp': DISP }}
      >
        {/* Hero */}
        <header className="clb-hero">
          <div>
            <h1 style={{ fontFamily: DISP, fontSize: 'clamp(40px, 8vw, 68px)', color: TXT, letterSpacing: 0.5, lineHeight: 1.02, margin: '0 0 20px', fontWeight: 400, maxWidth: 780 }}>
              Create your own golf leaderboard
            </h1>
            <p style={{ ...body, fontSize: 18, color: TXT }}>
              A leaderboard for your business league, your followers, your friends or your family. Pick your own link,
              generate a QR code, share it, and let the competition begin. It takes a few minutes and it is free to start.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <Link href={START} className="clb-cta" style={primaryCta}>
                Create your leaderboard
              </Link>
              <a href="#how-it-works" className="clb-cta clb-cta-2" style={secondaryCta}>
                See how it works
              </a>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: '18px 0 0' }}>
              Free to register. No card required. Your own link and QR code.
            </p>
          </div>
          <HeroPhone />
        </header>

        {/* Who it's for */}
        <section style={section}>
          <h2 style={h2}>A leaderboard for every kind of group</h2>
          <p style={body}>
            You do not need a golf club to run a leaderboard. If a group of people wants to find out who hits it
            furthest, you can create a leaderboard for them.
          </p>
          <Audiences />
        </section>

        {/* How it works */}
        <section id="how-it-works" style={section}>
          <h2 style={h2}>How to create your leaderboard in four steps</h2>
          <p style={body}>
            Follow the screens below. Choose “I run a venue” when you register: that is the account type that gets its
            own leaderboard, link and QR code.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginTop: 36 }}>
            {STEPS.map((step, i) => (
              <figure key={step.title} style={{ margin: 0 }}>
                <Phone step={step} live />
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
            <Link href={START} className="clb-cta" style={primaryCta}>
              Register your venue
            </Link>
          </div>
        </section>

        {/* QR */}
        <section style={section}>
          <h2 style={h2}>Share it with a link or a QR code</h2>
          <p style={body}>
            Your leaderboard gets its own web address, so it is easy to drop into a bio, a group chat, an email or a
            club newsletter. Your QR code does the same job in the real world: print it on a poster, show it on a
            screen, or put it in a video so viewers can join straight from their phone.
          </p>
          <p style={body}>
            Anyone who joins submits their drives and appears on your leaderboard, ranked live. Your venue is also
            listed on Ripping Bombs, so players can find it without a link.
          </p>
        </section>

        {/* What you get */}
        <section style={section}>
          <h2 style={h2}>What your leaderboard includes</h2>
          <p style={body}>
            Every venue starts on the free tier with a public leaderboard page with categories, ages and divisions, a
            place on the global leaderboard, and a venue that players can select when they submit a drive.
          </p>
          <p style={body}>
            Want it on a screen? The optional TV Display tier shows a live leaderboard on any TV and has room for a
            sponsor logo. It is free for 3 months, then $49 per month, and you can start without it. To see how venues
            run events, read about{' '}
            <Link href="/golf-longest-drive-competition" style={link}>running a longest drive competition</Link> or{' '}
            <Link href="/club-and-simulator-venue-leaderboards" style={link}>live leaderboards for clubs and simulator venues</Link>.
          </p>
          <p style={body}>
            Prefer to compete on your own first? Browse the <Link href="/leaderboard" style={link}>global leaderboard</Link> or
            measure a drive with the <Link href="/golf-drive-distance-tracker" style={link}>free golf distance tracker</Link>.
          </p>
        </section>

        {/* FAQ */}
        <section style={section}>
          <h2 style={h2}>Frequently asked questions</h2>
          <FaqList />
        </section>

        {/* Closing CTA */}
        <section className="clb-close" style={{ ...section, background: BG3, border: `1px solid ${BDR}`, borderTop: `2px solid ${ORG}`, padding: '36px 28px' }}>
          <h2 style={{ ...h2, marginBottom: 10 }}>Ready to start your own leaderboard?</h2>
          <p style={{ ...body, marginBottom: 20 }}>
            Register your venue, pick your link, share your QR code and let the competition begin.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={START} className="clb-cta" style={primaryCta}>
              Create your leaderboard
            </Link>
            <Link href="/leaderboard" className="clb-cta clb-cta-2" style={secondaryCta}>
              See the global leaderboard
            </Link>
          </div>
        </section>

        <style jsx global>{`
          /* ---- Hero ---- */
          .clb-hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 48px;
            align-items: center;
          }
          @media (min-width: 880px) {
            .clb-hero {
              grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
              gap: 32px;
            }
          }
          .clb-hero-phone {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0 4px;
          }
          .clb-rings {
            position: absolute;
            top: 46%;
            left: 50%;
            width: 440px;
            height: 440px;
            max-width: 130%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            pointer-events: none;
            background: repeating-radial-gradient(circle at center, transparent 0 46px, rgba(255, 0, 144, 0.14) 46px 47px);
            -webkit-mask-image: radial-gradient(circle, #000 35%, transparent 70%);
            mask-image: radial-gradient(circle, #000 35%, transparent 70%);
            animation: clbRing 6s ease-in-out infinite;
          }
          .clb-swap {
            position: relative;
            animation: clbSwap 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }
          .clb-dots {
            position: relative;
            display: flex;
            gap: 4px;
            margin-top: 18px;
          }
          .clb-dots button {
            width: 44px;
            height: 44px;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
            position: relative;
          }
          .clb-dots button::after {
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
          .clb-dots button.on::after {
            background: var(--org);
            left: 4px;
            right: 4px;
          }
          .clb-dots button:focus-visible,
          .clb-faq-item button:focus-visible,
          .clb-cta:focus-visible {
            outline: 3px solid #fff;
            outline-offset: 3px;
          }

          /* ---- Buttons ---- */
          .clb-cta {
            transition: filter 0.15s ease, background 0.15s ease, transform 0.12s ease;
          }
          .clb-cta:hover {
            filter: brightness(1.12);
          }
          .clb-cta-2:hover {
            background: rgba(255, 0, 144, 0.1);
            filter: none;
          }
          .clb-cta:active {
            transform: translateY(1px);
          }

          /* ---- Phone ---- */
          .clb-phone {
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
          .clb-screen {
            position: relative;
            height: 452px;
            padding: 12px 14px 14px;
            box-sizing: border-box;
            overflow: hidden;
            background: #0d0d10;
            border-radius: 28px;
          }
          .clb-island {
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
          .clb-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 6px 10px;
            font-family: var(--sans);
            font-size: 9px;
            font-weight: 600;
            color: var(--txt);
          }
          .clb-batt {
            width: 16px;
            height: 8px;
            border-radius: 2.5px;
            background: var(--txt);
            opacity: 0.85;
          }
          .clb-stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px 6px 10px;
            border: 1px solid #2b2b34;
            border-radius: 10px;
            background-color: #121216;
            background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
            background-size: 12px 12px;
          }

          /* ---- Mockup motion ---- */
          .clb-type {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: bottom;
            max-width: 100%;
            animation: clbTyping 1.4s steps(18, end) 0.3s both;
          }
          .clb-caret {
            border-right: 1.5px solid var(--org);
            animation: clbTyping 1.1s steps(13, end) 0.3s both, clbBlink 0.9s step-end 1.4s infinite;
          }
          .clb-pick {
            animation: clbPick 0.5s ease-out 0.1s both;
          }
          .clb-glow {
            animation: clbGlow 1.8s ease-in-out 1.2s infinite;
          }
          .clb-qr {
            position: relative;
            overflow: hidden;
            border-radius: 6px;
          }
          .clb-qr svg {
            display: block;
            width: 100%;
            height: 100%;
          }
          .clb-qcell {
            animation: clbFade 0.35s ease-out both;
          }
          .clb-scan {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 2px;
            background: var(--org);
            box-shadow: 0 0 10px 2px rgba(255, 0, 144, 0.7);
            animation: clbScan 2.4s ease-in-out 0.9s infinite;
          }
          .clb-live {
            font-family: var(--sans);
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.8px;
            color: #fff;
            background: var(--org);
            border-radius: 20px;
            padding: 2px 7px 2px 14px;
            position: relative;
          }
          .clb-live::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 50%;
            width: 5px;
            height: 5px;
            margin-top: -2.5px;
            border-radius: 50%;
            background: #fff;
            animation: clbBlink 1.2s ease-in-out infinite;
          }
          .clb-row {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 9px;
            margin-bottom: 5px;
            border: 1px solid #2b2b34;
            border-radius: 7px;
            background: #17171c;
          }
          .clb-row.top {
            border-color: var(--org);
            background: rgba(255, 0, 144, 0.1);
          }
          .clb-rows.go .clb-row {
            animation: clbRow 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }
          .clb-toast {
            animation: clbToast 0.5s cubic-bezier(0.3, 1.5, 0.5, 1) 1.2s both;
          }

          /* ---- Audience cards ---- */
          .clb-aud {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 18px;
            margin-top: 28px;
          }
          .clb-card {
            padding: 24px 20px 22px;
            background: var(--bg3);
            border: 1px solid var(--bdr);
            border-top: 2px solid var(--bdr);
            transition: border-color 0.25s ease, transform 0.25s ease;
          }
          .clb-card:hover {
            border-top-color: var(--org);
            transform: translateY(-4px);
          }
          .clb-card-ico {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid rgba(255, 0, 144, 0.4);
            background: rgba(255, 0, 144, 0.08);
            transition: transform 0.3s cubic-bezier(0.3, 1.5, 0.5, 1);
          }
          .clb-card:hover .clb-card-ico {
            transform: scale(1.1) rotate(-6deg);
          }
          .clb-aud.seen .clb-card {
            animation: clbRise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }

          /* ---- FAQ ---- */
          .clb-faq {
            max-width: 740px;
            border-bottom: 1px solid var(--bdr);
          }
          .clb-faq-item {
            position: relative;
            border-top: 1px solid var(--bdr);
          }
          .clb-faq-item::before {
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
          .clb-faq-item.open::before {
            transform: scaleY(1);
          }
          .clb-faq-item h3 {
            margin: 0;
          }
          .clb-faq-item button {
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
          .clb-faq-item button:hover {
            color: var(--txt);
            background: rgba(255, 255, 255, 0.03);
          }
          .clb-faq-item.open button {
            color: var(--txt);
          }
          .clb-faq-icon {
            position: relative;
            flex: none;
            width: 28px;
            height: 28px;
            border: 1px solid var(--bdr);
            border-radius: 50%;
            transition: border-color 0.2s ease, background 0.2s ease, transform 0.3s ease;
          }
          .clb-faq-icon::before,
          .clb-faq-icon::after {
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
          .clb-faq-icon::after {
            transform: rotate(90deg);
          }
          .clb-faq-item.open .clb-faq-icon {
            border-color: var(--org);
            background: var(--org);
            color: #000;
            transform: rotate(180deg);
          }
          .clb-faq-item.open .clb-faq-icon::after {
            transform: rotate(0deg);
          }
          .clb-faq-a {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .clb-faq-item.open .clb-faq-a {
            grid-template-rows: 1fr;
          }
          .clb-faq-a > div {
            min-height: 0;
            overflow: hidden;
          }
          .clb-faq-a p {
            margin: 0;
            padding: 0 56px 22px 20px;
            max-width: 660px;
            font-family: var(--sans);
            font-size: 15px;
            line-height: 1.75;
            color: var(--mut);
          }

          /* ---- Closing panel ---- */
          .clb-close {
            position: relative;
            overflow: hidden;
          }
          .clb-close::after {
            content: '';
            position: absolute;
            right: -120px;
            top: 50%;
            width: 360px;
            height: 360px;
            transform: translateY(-50%);
            border-radius: 50%;
            pointer-events: none;
            background: repeating-radial-gradient(circle at center, transparent 0 40px, rgba(255, 0, 144, 0.14) 40px 41px);
            animation: clbRing 6s ease-in-out infinite;
          }
          .clb-close > * {
            position: relative;
            z-index: 1;
          }

          /* ---- Keyframes ---- */
          @keyframes clbSwap {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
          }
          @keyframes clbRing {
            0%,
            100% {
              opacity: 0.55;
            }
            50% {
              opacity: 1;
            }
          }
          @keyframes clbTyping {
            from {
              max-width: 0;
            }
          }
          @keyframes clbBlink {
            50% {
              opacity: 0;
            }
          }
          @keyframes clbPick {
            from {
              background: #17171c;
              color: #a0a0ad;
            }
          }
          @keyframes clbGlow {
            0%,
            100% {
              box-shadow: 0 0 0 0 rgba(255, 0, 144, 0);
            }
            50% {
              box-shadow: 0 0 0 4px rgba(255, 0, 144, 0.28);
            }
          }
          @keyframes clbFade {
            from {
              opacity: 0;
            }
          }
          @keyframes clbScan {
            0%,
            100% {
              top: 0;
            }
            50% {
              top: calc(100% - 2px);
            }
          }
          @keyframes clbRow {
            from {
              opacity: 0;
              transform: translateX(-14px);
            }
          }
          @keyframes clbToast {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
          }
          @keyframes clbRise {
            from {
              transform: translateY(18px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .clb *,
            .clb *::before,
            .clb *::after {
              animation: none !important;
              transition: none !important;
            }
          }
          @media (max-width: 520px) {
            .clb-faq-item button {
              padding-left: 16px;
              font-size: 16px;
            }
            .clb-faq-a p {
              padding: 0 16px 20px 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
