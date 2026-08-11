import Head from 'next/head';
import { useRouter } from 'next/router';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BG3 = '#1e1e1e';
const BDR = '#2a2a2a';
const DIM = '#555';

function StepCard({ number, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <div
        style={{
          flex: '0 0 auto',
          width: 34,
          height: 34,
          borderRadius: 8,
          border: `1px solid ${ORG}`,
          color: ORG,
          fontWeight: 800,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {number}
      </div>
      <div style={{ flex: 1, borderBottom: `1px solid ${BDR}`, paddingBottom: '1.6rem' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.02rem', fontWeight: 800 }}>{title}</h3>
        <div style={{ fontSize: '0.88rem', color: MUT, lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

function TipBox({ children }) {
  return (
    <div
      style={{
        background: 'rgba(255,0,144,0.06)',
        border: `1px solid ${ORG}`,
        borderRadius: 8,
        padding: '0.85rem 1.1rem',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        fontSize: '0.82rem',
        lineHeight: 1.6,
        color: TXT,
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1.3 }}>💡</span>
      <div>{children}</div>
    </div>
  );
}

export default function VenueSetupPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Set Up Your TV Display — Ripping Bombs</title>
        <meta
          name="description"
          content="Step-by-step guide to putting a live, always-on Ripping Bombs leaderboard on your venue's TV."
        />
      </Head>

      <main style={{ background: '#0d0d0d', minHeight: '100vh', color: TXT, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', color: MUT, fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginBottom: '1.5rem' }}
          >
            ← Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem' }}>📺</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Setting Up Your TV Display
            </h1>
          </div>
          <p style={{ margin: '0 0 2.5rem', color: MUT, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 560 }}>
            A live, always-on leaderboard for your venue takes about five minutes to get running. Here's the whole process,
            start to finish.
          </p>

          {/* What you'll need */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BG2}, ${BG3})`,
              border: `1px solid ${BDR}`,
              borderRadius: 10,
              padding: '1.1rem 1.4rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
                What you'll need
              </div>
              <div style={{ fontSize: '0.85rem', color: TXT, lineHeight: 1.7 }}>
                A TV or monitor near the tee or simulator bay, and a way to get a browser onto it — a streaming stick,
                a smart TV's built-in browser, or a laptop/mini-PC connected via HDMI.
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', marginBottom: '2.5rem' }}>
            <StepCard number={1} title="Set your venue's display URL">
              Open <strong style={{ color: TXT }}>Edit Profile</strong> from your dashboard and set a{' '}
              <strong style={{ color: TXT }}>Custom URL</strong> under TV Display URL. This becomes your live link at{' '}
              <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>
                rippingbombs.com/venue-display/your-venue
              </code>
              . Once it's set, the link and a copy button appear right on your dashboard.
            </StepCard>

            <StepCard number={2} title="Add a sponsor (optional, but it pays for itself)">
              If a local business is sponsoring your screen, click <strong style={{ color: TXT }}>Set Up Sponsor</strong>{' '}
              to upload their logo. It'll rotate onto the display automatically — no separate setup needed. Skip this
              step if you don't have a sponsor yet.
            </StepCard>

            <StepCard number={3} title="Open the display link on your TV">
              Using whatever's connected to the TV — a streaming stick's browser, the smart TV's own browser, or a
              laptop/mini-PC over HDMI — open your venue's display link from step 1.
            </StepCard>

            <StepCard number={4} title="Go fullscreen and disable sleep">
              Press <strong style={{ color: TXT }}>F11</strong> (or your browser/device's fullscreen shortcut) to hide
              the address bar and browser chrome. Then turn off the TV's screensaver, sleep timer, and any
              auto-dimming so the leaderboard stays visible all day.
            </StepCard>

            <StepCard number={5} title="Leave it running">
              The leaderboard updates on its own — no refreshing needed. If the TV ever gets fully powered off,
              reopening the same link brings it right back.
            </StepCard>
          </div>

          <TipBox>
            <strong style={{ color: ORG }}>Streaming stick users —</strong> most streaming sticks (Fire TV, Chromecast
            with Google TV, Roku) can open a browser via a free app from their app store. Once it's open once and set
            to fullscreen, it'll reopen the same way after every restart.
          </TipBox>

          {/* Troubleshooting */}
          <div style={{ marginTop: '2.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Troubleshooting</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  q: "The screen goes black or sleeps after a while.",
                  a: 'Check the TV\'s own power-saving / screensaver settings, not just the streaming device — most TVs sleep independently of what\'s plugged into them.',
                },
                {
                  q: "My sponsor's logo isn't showing.",
                  a: "Give it a minute to sync, then refresh the display once. If it still doesn't show, double check the logo uploaded successfully under TV Display & Sponsors in your dashboard.",
                },
                {
                  q: 'The leaderboard looks too small or too large on the TV.',
                  a: "Use your TV or device's zoom/scale setting rather than the browser's — the display is built to fill whatever screen it's on.",
                },
              ].map((item) => (
                <div key={item.q} style={{ border: `1px solid ${BDR}`, borderRadius: 8, padding: '1rem 1.2rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{item.q}</div>
                  <div style={{ fontSize: '0.82rem', color: MUT, lineHeight: 1.6 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: DIM, marginBottom: 12 }}>Still stuck, or setting up something unusual?</p>
            <a
              href="mailto:team@rippingbombs.com"
              style={{ color: ORG, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Email team@rippingbombs.com →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
