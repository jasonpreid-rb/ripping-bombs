import Head from 'next/head';
import Link from 'next/link';
import { ORG, BG, BG2, BG3, TXT, MUT, BDR, SANS, DISP } from '../lib/constants';
import { SeoCTA } from '../components/SeoPageLayout';

const linkStyle = { color: ORG, textDecoration: 'underline' };

const wrap = { maxWidth: 820, margin: '0 auto', padding: '48px 20px 80px', fontFamily: SANS, color: TXT };
const h1 = { fontFamily: DISP, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.05, marginBottom: 16, letterSpacing: '0.5px' };
const h2 = { fontFamily: DISP, fontSize: 'clamp(22px,3vw,30px)', lineHeight: 1.1, marginTop: 48, marginBottom: 14, letterSpacing: '0.5px' };
const p = { fontSize: 16, lineHeight: 1.7, color: MUT, marginBottom: 16 };
const eyebrow = { fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: ORG, fontWeight: 700, marginBottom: 10 };

const card = { background: BG2, border: `1px solid ${BDR}`, borderRadius: 14, padding: 22 };
const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 };

const steps = [
  { n: '01', t: 'Download the poster', d: 'Grab the print-ready A4 poster below — no design work needed, it\'s ready to print and stick up at the bays.' },
  { n: '02', t: 'Put it where players wait', d: 'Bay entrances, reception, or near the booking screen — anywhere a player has a spare 30 seconds.' },
  { n: '03', t: 'They scan and submit', d: 'Players register free, submit their drive, and instantly see how it ranks against the rest of the world.' },
];

const benefits = [
  { t: 'Repeat visits', d: 'A live global rank gives players a reason to come back and try to beat their number — and other players\' numbers.' },
  { t: 'Free word-of-mouth', d: 'Every share to WhatsApp or Instagram from a drive submission carries your venue\'s name with it.' },
  { t: 'Zero setup cost', d: 'No booking software, no integration, no fee. Print a poster, scan a code, done.' },
];

export default function Page() {
  return (
    <>
      <Head>
        <title>How To Increase Golf Simulator Bookings | Ripping Bombs</title>
        <meta name="description" content="Practical, low-cost ways to increase bookings and repeat visits at your golf simulator venue, including a free downloadable poster that turns players into a global leaderboard." />
      </Head>

      <div style={{ background: BG, minHeight: '100vh' }}>
        <div style={wrap}>
          <div style={eyebrow}>For Simulator Venue Operators</div>
          <h1 style={h1}>How To Increase Golf Simulator Bookings</h1>
          <p style={{ ...p, fontSize: 18, color: TXT }}>
            Most simulator venues are competing for the same local players. The fastest lever isn't more ads — it's giving the players already in your bays a reason to come back, and a reason to tell their mates. A global leaderboard does both, for free.
          </p>

          <h2 style={h2}>Why "Is My Sim Distance Real?" Matters</h2>
          <p style={p}>Simulator players constantly compare their numbers to range sessions, other sims, and stories from mates at different venues. That doubt is an opportunity: let players settle it themselves by submitting their drive to a leaderboard that ranks everyone — every sim brand, every country — the same way.</p>
          <p style={p}>When a player submits from your venue, the result carries your venue with it. That's free visibility every time someone checks their rank or shares a result.</p>

          <h2 style={h2}>Three Steps To Set This Up Today</h2>
          <div style={grid3}>
            {steps.map(s => (
              <div key={s.n} style={card}>
                <div style={{ fontFamily: DISP, color: ORG, fontSize: 22, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: MUT, lineHeight: 1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>

          <h2 style={h2}>What This Actually Does For Your Venue</h2>
          <div style={grid3}>
            {benefits.map(b => (
              <div key={b.t} style={card}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{b.t}</div>
                <div style={{ fontSize: 14, color: MUT, lineHeight: 1.6 }}>{b.d}</div>
              </div>
            ))}
          </div>

          <h2 style={h2}>Download The Venue Poster</h2>
          <p style={p}>Free, print-ready, A4. It includes a QR code straight to registration, an example submission so players know what to expect, and a callout for the women's and youth leaderboards.</p>
          <div style={{ ...card, background: BG3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Ripping Bombs Venue Poster</div>
              <div style={{ fontSize: 13, color: MUT }}>A4 &middot; print-ready &middot; PNG/HTML &middot; free</div>
            </div>
            <a
              href="/posters/increase-bookings-poster.html"
              download
              style={{
                background: ORG, color: '#0e0e0e', fontWeight: 700, fontSize: 14,
                padding: '12px 22px', borderRadius: 999, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Download Poster
            </a>
          </div>

          <h2 style={h2}>Where To Put It</h2>
          <p style={p}>Bay entrances and the reception desk work best — anywhere a player is waiting, not actively swinging. Avoid putting it where someone has to interrupt their session to scan it; the best moment is right after a good drive, when they're already curious how it compares.</p>

          <h2 style={h2}>Explore Related Pages</h2>
          <p style={p}>
            <Link href="/simulator-golf-league" style={linkStyle}>Simulator Golf League</Link>{' | '}
            <Link href="/sim-distance-real-or-fake" style={linkStyle}>Is Your Sim Distance Real Or Fake</Link>{' | '}
            <Link href="/supported-simulators" style={linkStyle}>Supported Simulators</Link>{' | '}
            <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>Driving Distance Percentile Calculator</Link>{' | '}
            <Link href="/hall-of-fame" style={linkStyle}>Hall Of Fame</Link>
          </p>

          <SeoCTA />
        </div>
      </div>
    </>
  );
}
