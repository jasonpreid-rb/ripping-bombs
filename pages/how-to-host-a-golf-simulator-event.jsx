import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from '../lib/constants';

const FAQS = [
  {
    q: 'How do I create an event on Ripping Bombs?',
    a: 'Open Events in your venue dashboard, hit Create Event, set your dates and entry criteria. Ripping Bombs generates a shareable link and QR code instantly.',
  },
  {
    q: 'Do players need to download an app?',
    a: 'No. They tap the link or scan the QR code. A profile is created automatically the first time they submit a drive.',
  },
  {
    q: 'Can I restrict an event to certain ages or genders?',
    a: 'Yes — set criteria when you create the event and Ripping Bombs checks each player automatically before they can submit.',
  },
  {
    q: 'How do I invite players?',
    a: 'Search by name or paste a list of emails. Invited players see a banner on their dashboard with a one-tap join.',
  },
  {
    q: 'How does this fill quiet bay times?',
    a: 'A deadline and a live leaderboard give players a reason to book hours nobody else wants — a Tuesday-morning league beats an empty bay every time.',
  },
];

export default function VenueEventGuide() {
  const [openFaq, setOpenFaq] = useState(null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Host a Golf Simulator Event',
    step: [
      { '@type': 'HowToStep', name: 'Create the event', text: 'Set dates, entry criteria, and sponsor branding from your dashboard.' },
      { '@type': 'HowToStep', name: 'Share it', text: 'Get a branded page and QR code instantly.' },
      { '@type': 'HowToStep', name: 'Invite players', text: 'Search by name or paste emails.' },
      { '@type': 'HowToStep', name: 'Run it', text: 'The leaderboard and eligibility checks run themselves.' },
    ],
  };

  return (
    <>
      <Head>
        <title>How to Host a Golf Simulator Event | Ripping Bombs</title>
        <meta
          name="description"
          content="Turn your quietest bay hours into booked ones. Create a branded golf simulator event with a live leaderboard in minutes."
        />
        <link rel="canonical" href="https://rippingbombs.com/how-to-host-a-golf-simulator-event/" />
        <meta property="og:title" content="How to Host a Golf Simulator Event" />
        <meta property="og:description" content="Turn dead bay time into booked time — set up an event in minutes." />
        <meta property="og:url" content="https://rippingbombs.com/how-to-host-a-golf-simulator-event/" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      </Head>

      <main style={{ backgroundColor: BG2, color: TXT, fontFamily: SANS }}>
        {/* Hero */}
        <section
          style={{
            padding: '90px 24px 70px',
            textAlign: 'center',
            borderBottom: `1px solid ${BDR}`,
            background: `radial-gradient(ellipse at top, rgba(255,0,144,0.08), transparent 60%)`,
          }}
        >
          <div style={{ color: ORG, fontFamily: DISP, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
            For Venues
          </div>
          <h1 style={{ fontFamily: DISP, fontSize: 48, lineHeight: 1.05, letterSpacing: 0.5, margin: '0 auto', maxWidth: 760 }}>
            Empty bays don&apos;t sell themselves.<br />
            <span style={{ color: ORG }}>Events do.</span>
          </h1>
          <p style={{ color: MUT, fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: '22px auto 0' }}>
            Give players a leaderboard to chase and a deadline to beat. Set up your first branded
            event in about five minutes.
          </p>
          <Link
            href="#steps"
            style={{
              display: 'inline-block',
              marginTop: 32,
              background: ORG,
              color: '#000',
              fontFamily: DISP,
              fontSize: 15,
              letterSpacing: 0.5,
              padding: '14px 34px',
              textDecoration: 'none',
            }}
          >
            See How It Works ↓
          </Link>
        </section>

        {/* Stat strip */}
        <section
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '48px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            borderBottom: `1px solid ${BDR}`,
          }}
        >
          {[
            { n: '5 min', l: 'to set up an event' },
            { n: '0', l: 'apps players have to download' },
            { n: '24/7', l: 'the leaderboard updates itself' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: DISP, fontSize: 36, color: ORG }}>{s.n}</div>
              <div style={{ color: MUT, fontSize: 13, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </section>

        {/* Why */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 28, margin: '0 0 14px' }}>
            Your slowest hour is someone&apos;s free hour
          </h2>
          <p style={{ color: MUT, fontSize: 16, lineHeight: 1.7 }}>
            A named event beats open bay time every time. Run a weekday senior league, an
            after-school youth event, or an off-season sponsor challenge — anything with a
            leaderboard and a clock turns dead hours into booked ones.
          </p>
        </section>

        {/* Steps */}
        <section id="steps" style={{ padding: '56px 24px', backgroundColor: BG3, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontFamily: DISP, fontSize: 28, textAlign: 'center', marginBottom: 40 }}>
              Four steps. That&apos;s it.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {[
                { n: '01', title: 'Create it', body: 'Dates, criteria, sponsor logo. Done.' },
                { n: '02', title: 'Share it', body: 'Instant link + QR code, ready to print.' },
                { n: '03', title: 'Invite players', body: 'Search by name or paste emails.' },
                { n: '04', title: 'Watch it run', body: 'Live leaderboard, zero admin.' },
              ].map((s) => (
                <div key={s.n} style={{ background: BG2, border: `1px solid ${BDR}`, padding: '24px 20px' }}>
                  <div style={{ fontFamily: DISP, fontSize: 30, color: ORG, marginBottom: 10 }}>{s.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ color: MUT, fontSize: 13.5, lineHeight: 1.5 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ideas */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 28, textAlign: 'center', marginBottom: 32 }}>
            Built for the hours nobody books
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { title: 'Senior mornings', body: 'Fills the gap before lunch rush.' },
              { title: 'After-school youth', body: 'Turns a dead 3–5pm into a standing booking.' },
              { title: "Women's league night", body: 'A low-traffic evening, live leaderboard included.' },
              { title: 'Off-season sponsor challenge', body: 'Branded prizes to carry your slowest month.' },
            ].map((idea) => (
              <div key={idea.title} style={{ borderLeft: `3px solid ${ORG}`, paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{idea.title}</div>
                <div style={{ color: MUT, fontSize: 13.5, lineHeight: 1.5 }}>{idea.body}</div>
              </div>
            ))}
          </div>
          <p style={{ color: DIM, fontSize: 13, textAlign: 'center', marginTop: 32 }}>
            More formats:{' '}
            <Link href="/golf-club-longest-drive-competition-ideas" style={{ color: ORG }}>
              competition ideas
            </Link>{' '}
            ·{' '}
            <Link href="/club-and-simulator-venue-leaderboards" style={{ color: ORG }}>
              venue leaderboards
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section style={{ padding: '56px 24px', backgroundColor: BG3, borderTop: `1px solid ${BDR}` }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 20, textAlign: 'center' }}>
              FAQ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  style={{ background: BG2, border: `1px solid ${openFaq === i ? 'rgba(255,0,144,0.25)' : BDR}`, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => {
                      if (openFaq !== i && typeof window !== 'undefined' && window.gtag)
                        window.gtag('event', 'event_guide_faq_open', { event_category: 'engagement', question: q });
                      setOpenFaq(openFaq === i ? null : i);
                    }}
                    aria-expanded={openFaq === i}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: 16,
                    }}
                  >
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TXT, textAlign: 'left' }}>{q}</span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 18,
                        color: ORG,
                        flexShrink: 0,
                        transform: openFaq === i ? 'rotate(45deg)' : 'none',
                        transition: 'transform .2s',
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div style={{ display: 'grid', gridTemplateRows: openFaq === i ? '1fr' : '0fr', transition: 'grid-template-rows .2s ease' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 20px 18px', fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.75 }}>{a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '64px 24px 90px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 30, marginBottom: 10 }}>Book the hours you&apos;re losing.</h2>
          <p style={{ color: MUT, marginBottom: 28 }}>Five minutes. No card required.</p>
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              backgroundColor: ORG,
              color: '#000',
              fontFamily: DISP,
              fontSize: 15,
              padding: '14px 34px',
              textDecoration: 'none',
            }}
          >
            Get Started
          </Link>
        </section>
      </main>
    </>
  );
}
