import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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

// Read-only "here's your link, just copy it" box.
function CopyBox({ value, copyValue }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#0d0d0d',
          border: `1px solid ${BDR}`,
          borderRadius: 6,
          padding: '0.7rem 4.5rem 0.7rem 1rem',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          color: TXT,
          fontFamily: 'monospace',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: copied ? ORG : 'rgba(255,255,255,0.08)',
          color: copied ? '#0d0d0d' : TXT,
          border: 'none',
          borderRadius: 5,
          padding: '5px 10px',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}

function WidgetSnippet({ slug }) {
  const snippet = `<iframe
  src="https://rippingbombs.com/widget/${slug}"
  width="100%"
  height="480"
  style="border: none; max-width: 400px;"
  title="Longest Drive Leaderboard"
></iframe>`;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <pre
          style={{
            background: '#0d0d0d',
            border: `1px solid ${BDR}`,
            borderRadius: 6,
            padding: '0.9rem 1rem',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: TXT,
            overflowX: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: copied ? ORG : 'rgba(255,255,255,0.08)',
            color: copied ? '#0d0d0d' : TXT,
            border: 'none',
            borderRadius: 5,
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div style={{ fontSize: '0.78rem', color: MUT, marginTop: 10, lineHeight: 1.6 }}>
        Paste this into your website's HTML, or into a "Custom HTML" / "Embed" block if you're on
        Wix, Squarespace, WordPress, or similar.
      </div>
    </div>
  );
}

// Sponsor logo spec sheet — matches SponsorLogoUploader.jsx and the actual
// .sponsor-stage-logo box on the TV display (320×60px, object-fit: contain).
function SponsorSpecs() {
  const specs = [
    { label: 'File type', value: 'PNG or SVG with a transparent background (looks best on the dark display); JPEG and WEBP also accepted' },
    { label: 'Shape', value: 'Wide and short — around 5:1, like a banner rather than a square or tall logo' },
    { label: 'Ideal size', value: '~640 × 120px or larger keeps it crisp even on 4K TVs. Bigger gets scaled down automatically; a tall or square logo will just look small, centered in a wide box' },
  ];

  return (
    <div
      style={{
        border: `1px solid ${BDR}`,
        borderRadius: 8,
        padding: '0.9rem 1.1rem',
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {specs.map((s) => (
        <div key={s.label} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', lineHeight: 1.5 }}>
          <span style={{ flex: '0 0 170px', color: MUT, fontWeight: 700 }}>{s.label}</span>
          <span style={{ color: TXT }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function VenueSetupPage() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'no-slug' | 'error'

  useEffect(() => {
    let cancelled = false;

    async function loadClub() {
      const raw = typeof window !== 'undefined' && localStorage.getItem('rb_club');
      if (!raw) {
        if (!cancelled) setLoadState('error');
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        if (!cancelled) setLoadState('error');
        return;
      }

      const { data: freshClub, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', parsed.id)
        .single();

      if (cancelled) return;

      if (error || !freshClub) {
        // Fall back to the cached copy rather than failing outright.
        setClub(parsed);
        setLoadState(parsed.customSlug ? 'ready' : 'no-slug');
        return;
      }

      setClub(freshClub);
      setLoadState(freshClub.customSlug ? 'ready' : 'no-slug');
    }

    loadClub();
    return () => {
      cancelled = true;
    };
  }, []);

  const slug = club?.customSlug || null;
  const displayUrl = slug ? `rippingbombs.com/venue-display/${slug}` : null;

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
            <StepCard number={1} title="Your venue's display URL">
              This is your live leaderboard link — open it on whatever's hooked up to the TV.
              <div style={{ marginTop: 12 }}>
                {loadState === 'loading' && (
                  <div style={{ fontSize: '0.8rem', color: MUT }}>Loading your link…</div>
                )}
                {loadState === 'ready' && (
                  <CopyBox value={displayUrl} copyValue={`https://${displayUrl}`} />
                )}
                {loadState === 'no-slug' && (
                  <div style={{ fontSize: '0.8rem', color: MUT }}>
                    You don't have a display URL yet — open <strong style={{ color: TXT }}>Edit Profile</strong> on
                    your dashboard and hit <strong style={{ color: TXT }}>Save Changes</strong> and one will be
                    generated automatically (or set your own in the Custom URL field).
                  </div>
                )}
                {loadState === 'error' && (
                  <div style={{ fontSize: '0.8rem', color: MUT }}>
                    Couldn't load your link automatically — grab it from{' '}
                    <strong style={{ color: TXT }}>Edit Profile</strong> on your dashboard instead.
                  </div>
                )}
              </div>
            </StepCard>

            <StepCard number={2} title="Add a sponsor (optional, but it pays for itself)">
              If a local business is sponsoring your screen, click <strong style={{ color: TXT }}>Set Up Sponsor</strong>{' '}
              to upload their logo. It'll rotate onto the display automatically — no separate setup needed. Skip this
              step if you don't have a sponsor yet.
              <SponsorSpecs />
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

            <StepCard number={6} title="Optional: embed it on your own website too">
              Want the leaderboard on your website as well as your TV? Here's your embed code — it works on Wix,
              Squarespace, WordPress, or any site that accepts custom HTML.
              <div style={{ marginTop: 14 }}>
                {loadState === 'ready' && <WidgetSnippet slug={slug} />}
                {loadState === 'loading' && (
                  <div style={{ fontSize: '0.8rem', color: MUT }}>Loading your embed code…</div>
                )}
                {(loadState === 'no-slug' || loadState === 'error') && (
                  <div style={{ fontSize: '0.8rem', color: MUT }}>
                    Your embed code will appear here once your display URL is set (see step 1).
                  </div>
                )}
              </div>
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
                  a: "Give it a minute to sync, then refresh the display once. If it still doesn't show, double check the file matches the size/format guidelines above and uploaded successfully under TV Display & Sponsors in your dashboard.",
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
