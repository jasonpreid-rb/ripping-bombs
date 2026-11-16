// pages/golf-drive-distance-tracker.jsx
//
// SEO landing page for the free GPS drive tracker at /track.
// Fully static: all content is in the HTML, no client-side gating, so
// crawlers see everything. The canonical tag is set globally in _app.jsx.
//
// SCREENSHOTS: each step below renders a built-in phone mockup. To use a real
// screenshot instead, drop the image in /public/images/ and set the step's
// `image` field (e.g. '/images/track-step-1.jpg'). Suggested size: 440x800.

import Head from 'next/head';
import Link from 'next/link';
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

// ---- Phone mockups ---------------------------------------------------------

const mockTitle = { fontFamily: DISP, fontSize: 24, color: TXT, lineHeight: 1, margin: '0 0 8px' };
const mockText = { fontFamily: SANS, fontSize: 10.5, color: MUT, lineHeight: 1.5, margin: '0 0 10px' };
const mockPanel = { background: '#17171c', border: `1px solid ${BDR}`, borderRadius: 8, padding: 10, margin: '8px 0' };
const mockBtn = {
  background: ORG,
  color: '#fff',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 12,
  borderRadius: 8,
  padding: '11px 0',
  textAlign: 'center',
  marginTop: 10,
};
const mockGhost = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 11,
  color: MUT,
  border: `1px solid ${BDR}`,
  borderRadius: 8,
  padding: '9px 0',
  textAlign: 'center',
  marginTop: 8,
};

function MockGps({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 10, color: MUT, marginBottom: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3ddc84', flex: 'none' }} />
      {label}
    </div>
  );
}

function ScreenStart() {
  return (
    <>
      <div style={mockTitle}>Track a drive</div>
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

function ScreenTee() {
  return (
    <>
      <div style={mockTitle}>Track a drive</div>
      <MockGps label="Strong GPS signal (±4 m)" />
      <div style={{ ...mockTitle, fontSize: 18 }}>Mark where you hit from</div>
      <p style={mockText}>Stand at your tee spot and hold the phone still.</p>
      <div style={mockBtn}>Mark tee spot</div>
    </>
  );
}

function ScreenBall() {
  return (
    <>
      <div style={mockTitle}>Track a drive</div>
      <MockGps label="Strong GPS signal (±3 m)" />
      <div style={{ ...mockTitle, fontSize: 18 }}>Walk to your ball</div>
      <p style={mockText}>Stop right next to it, hold still, then mark its position.</p>
      <div style={mockBtn}>Mark ball position</div>
      <div style={mockGhost}>Start over</div>
    </>
  );
}

function ScreenResult() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: DISP, fontSize: 92, lineHeight: 0.85, color: ORG }}>247</div>
        <div style={{ fontFamily: SANS, fontSize: 10, color: MUT, paddingBottom: 4, lineHeight: 1.4 }}>
          yards
          <br />
          ±6 yds
        </div>
      </div>
      <div style={mockPanel}>
        <div style={{ fontFamily: DISP, fontSize: 16, color: TXT, marginBottom: 6 }}>Where did you hit?</div>
        <div style={{ fontFamily: SANS, fontSize: 10.5, color: TXT, marginBottom: 4 }}>
          <span style={{ color: ORG }}>●</span> Example Driving Range <span style={{ color: MUT }}>(range)</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 10.5, color: MUT }}>○ Somewhere else</div>
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

function Phone({ step }) {
  const { image, alt, Screen } = step;
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        width={220}
        loading="lazy"
        style={{ display: 'block', width: 220, maxWidth: '100%', height: 'auto', margin: '0 auto', borderRadius: 24, border: `1px solid ${BDR}` }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      style={{ width: 220, maxWidth: '100%', margin: '0 auto', background: '#000', border: `2px solid ${BDR}`, borderRadius: 28, padding: 8, boxSizing: 'border-box' }}
    >
      <div style={{ background: '#0d0d10', borderRadius: 20, height: 390, padding: 14, boxSizing: 'border-box', overflow: 'hidden' }}>
        <Screen />
      </div>
    </div>
  );
}

// ---- Page styles -------------------------------------------------------------

const h2 = { fontFamily: DISP, fontSize: 34, color: TXT, letterSpacing: 0.5, lineHeight: 1.1, margin: '0 0 16px', fontWeight: 400 };
const body = { fontFamily: SANS, fontSize: 16, color: MUT, lineHeight: 1.75, margin: '0 0 16px', maxWidth: 660 };
const section = { marginTop: 72 };
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

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 18px 96px' }}>
        {/* Hero */}
        <header>
          <h1 style={{ fontFamily: DISP, fontSize: 'clamp(40px, 8vw, 68px)', color: TXT, letterSpacing: 0.5, lineHeight: 1.02, margin: '0 0 20px', fontWeight: 400, maxWidth: 780 }}>
            Free golf distance tracker: find out how far you really hit it
          </h1>
          <p style={{ ...body, fontSize: 18, color: TXT }}>
            Guessing your yardage is easy. Knowing it is better. The Ripping Bombs tracker measures any drive with your
            phone’s GPS. No app to download, no launch monitor to buy, nothing to pay. Use it at any range or course,
            anywhere in the world.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Link href="/track" style={primaryCta}>
              Track a drive now
            </Link>
            <a href="#how-it-works" style={secondaryCta}>
              See how it works
            </a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: '18px 0 0' }}>
            Completely free. No account needed to measure. Works in yards or meters.
          </p>
        </header>

        {/* How it works */}
        <section id="how-it-works" style={section}>
          <h2 style={h2}>How to measure your drive in four steps</h2>
          <p style={body}>
            It takes about a minute per drive and works on any modern iPhone or Android browser.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36, marginTop: 32 }}>
            {STEPS.map((step, i) => (
              <figure key={step.title} style={{ margin: 0 }}>
                <Phone step={step} />
                <figcaption style={{ maxWidth: 240, margin: '18px auto 0' }}>
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
          <div style={{ marginTop: 40 }}>
            <Link href="/track" style={primaryCta}>
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
          <p style={body}>
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
          <div style={{ maxWidth: 720 }}>
            {FAQ.map((f) => (
              <div key={f.q} style={{ borderTop: `1px solid ${BDR}`, padding: '20px 0' }}>
                <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: TXT, margin: '0 0 8px', lineHeight: 1.4 }}>
                  {f.q}
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section style={{ ...section, background: BG3, border: `1px solid ${BDR}`, borderTop: `2px solid ${ORG}`, padding: '32px 24px' }}>
          <h2 style={{ ...h2, marginBottom: 10 }}>Ready to find out how far you really hit it?</h2>
          <p style={{ ...body, marginBottom: 20 }}>
            It is free, it takes a minute, and you will know your number.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/track" style={primaryCta}>
              Track a drive now
            </Link>
            <Link href="/leaderboard" style={secondaryCta}>
              See the leaderboard
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
