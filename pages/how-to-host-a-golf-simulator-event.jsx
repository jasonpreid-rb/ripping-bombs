import Head from 'next/head';
import Link from 'next/link';
import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from '../lib/constants';

const FAQS = [
  {
    q: 'How do I create an event on Ripping Bombs?',
    a: "From your venue dashboard, open the Events section and click Create Event. Set your dates, add a description, choose entry criteria (age and gender groups pull straight from the age/gender info players already give you at registration), and upload sponsor branding if you have it. Ripping Bombs generates a shareable link and QR code the moment you save.",
  },
  {
    q: 'Do players need to download an app or create a new account?',
    a: 'No. Players tap the event link or scan the QR code, and if they don\u2019t have a Ripping Bombs profile yet they\u2019re created one automatically the first time they submit a drive. There\u2019s nothing to install on the bay.',
  },
  {
    q: 'Can I restrict an event to certain ages or genders?',
    a: 'Yes. Set entry criteria when you create the event \u2014 for example a Youth-only after-school event, a Women\u2019s Wednesday event, or a Senior weekday event \u2014 and Ripping Bombs checks each player\u2019s existing profile against that criteria automatically before letting them submit.',
  },
  {
    q: 'How do I invite players to an event?',
    a: 'Two ways: search for players already in the Ripping Bombs system by name and invite them directly, or paste a list of emails. Invited players see an in-app notification banner on their dashboard with the event details and a one-tap join.',
  },
  {
    q: 'How does this help fill quiet bay times?',
    a: 'A named event with a deadline and a live leaderboard gives players a reason to book a bay outside your busiest hours \u2014 a Tuesday-morning senior league, a weekday-afternoon youth event, or a slow-season sponsor challenge all convert dead time into booked time, because people show up to compete, not just to hit balls.',
  },
];

export default function VenueEventGuide() {
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
      { '@type': 'HowToStep', name: 'Create the event', text: 'Set dates, description, entry criteria, and optional sponsor branding from your venue dashboard.' },
      { '@type': 'HowToStep', name: 'Share the link or QR code', text: 'Ripping Bombs generates a shareable event page and QR code automatically for in-bay signage or social posts.' },
      { '@type': 'HowToStep', name: 'Invite players', text: 'Search existing players by name or paste a list of emails to send in-app invites.' },
      { '@type': 'HowToStep', name: 'Run it', text: 'Players submit drives from the bay; the leaderboard updates live and eligibility is enforced automatically.' },
    ],
  };

  return (
    <>
      <Head>
        <title>How to Host a Golf Simulator Event & Fill Quiet Bay Time | Ripping Bombs</title>
        <meta
          name="description"
          content="A step-by-step guide for golf simulator venues to create branded longest-drive events and leaderboards that turn slow weekday and off-peak hours into booked bay time."
        />
        <link rel="canonical" href="https://rippingbombs.com/how-to-host-a-golf-simulator-event/" />
        <meta property="og:title" content="How to Host a Golf Simulator Event & Fill Quiet Bay Time" />
        <meta
          property="og:description"
          content="Create a branded longest-drive event in minutes and give players a reason to book your quietest hours."
        />
        <meta property="og:url" content="https://rippingbombs.com/how-to-host-a-golf-simulator-event/" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      </Head>

      <main style={{ backgroundColor: BG2, color: TXT, fontFamily: SANS }}>
        {/* Hero */}
        <section style={{ padding: '72px 20px 48px', borderBottom: `1px solid ${BDR}`, maxWidth: 880, margin: '0 auto' }}>
          <p style={{ color: ORG, fontFamily: DISP, letterSpacing: 1, textTransform: 'uppercase', fontSize: 13, marginBottom: 12 }}>
            For Venues
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: 40, lineHeight: 1.15, margin: 0 }}>
            How to Host a Golf Simulator Event (and Fill Your Quietest Bay Hours)
          </h1>
          <p style={{ color: MUT, fontSize: 18, lineHeight: 1.6, marginTop: 20 }}>
            Empty bays on a Tuesday morning aren&apos;t a scheduling problem &mdash; they&apos;re a motivation problem.
            A branded longest-drive event with a live leaderboard gives players a reason to book the hours nobody
            else wants. Here&apos;s exactly how to set one up on Ripping Bombs, start to finish.
          </p>
        </section>

        {/* Why events fill quiet time */}
        <section style={{ padding: '48px 20px', maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 26, marginBottom: 16 }}>
            Why events move bookings into off-peak hours
          </h2>
          <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 16 }}>
            Open bay time competes with every other free-time option a player has. A named event with a deadline,
            a leaderboard, and bragging rights does not &mdash; it gives players a specific reason to show up at a
            specific time. Venues running weekday or off-peak events on Ripping Bombs use that structure to:
          </p>
          <ul style={{ color: MUT, lineHeight: 1.9, paddingLeft: 20 }}>
            <li>Fill weekday mornings and afternoons with a recurring senior or after-school youth event</li>
            <li>Turn a slow month into a themed sponsor challenge with branded prizes</li>
            <li>Give members-only or women&apos;s-league nights a live leaderboard instead of a paper sign-in sheet</li>
            <li>Re-activate lapsed players with an invite the moment a new event opens</li>
          </ul>
        </section>

        {/* Step by step */}
        <section style={{ padding: '48px 20px', backgroundColor: BG3, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}` }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <h2 style={{ fontFamily: DISP, fontSize: 26, marginBottom: 24 }}>Setting up an event, step by step</h2>

            {[
              {
                n: '01',
                title: 'Create the event',
                body: 'From your venue dashboard, open Events and hit Create Event. Add your dates, a short description, and optional sponsor branding. Set entry criteria if you want to target a specific group \u2014 age and gender checks use the info players already gave you at registration, so nothing new is required from them.',
              },
              {
                n: '02',
                title: 'Get your shareable link and QR code',
                body: 'Every event gets its own branded public page automatically, plus an on-demand QR code you can print for the bay, the front desk, or a table tent. No design work needed.',
              },
              {
                n: '03',
                title: 'Invite players two ways',
                body: 'Search your existing player base by name and invite them directly, or paste a list of emails for players who haven\u2019t been in yet. Invited players get an in-app banner the next time they open Ripping Bombs, with a one-tap join.',
              },
              {
                n: '04',
                title: 'Let the leaderboard run itself',
                body: 'Players submit from the bay as normal \u2014 the event is pre-selected so there\u2019s no extra step \u2014 and the live leaderboard, the \u201cWho\u2019s Competing\u201d list, and eligibility checks all update automatically. If someone doesn\u2019t meet the entry criteria, they get a clear reason instead of a confusing error.',
              },
            ].map((s) => (
              <div key={s.n} style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
                <div style={{ fontFamily: DISP, fontSize: 28, color: ORG, minWidth: 48 }}>{s.n}</div>
                <div>
                  <h3 style={{ fontFamily: DISP, fontSize: 19, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ color: MUT, lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Event ideas for quiet times */}
        <section style={{ padding: '48px 20px', maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 26, marginBottom: 16 }}>
            Event ideas built for your slowest hours
          </h2>
          <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 16 }}>
            Looking for a starting point? See our full breakdown of{' '}
            <Link href="/golf-club-longest-drive-competition-ideas" style={{ color: ORG }}>
              longest-drive competition ideas
            </Link>{' '}
            for more formats, or read how venues are already running{' '}
            <Link href="/club-and-simulator-venue-leaderboards" style={{ color: ORG }}>
              club and simulator venue leaderboards
            </Link>{' '}
            day to day.
          </p>
          <ul style={{ color: MUT, lineHeight: 1.9, paddingLeft: 20 }}>
            <li><strong style={{ color: TXT }}>Weekday-morning senior event</strong> &mdash; fills the hours between the morning and lunch rush</li>
            <li><strong style={{ color: TXT }}>After-school youth event</strong> &mdash; converts a dead 3&ndash;5pm window into a standing booking</li>
            <li><strong style={{ color: TXT }}>Women&apos;s league night</strong> &mdash; a low-traffic evening with a purpose-built leaderboard</li>
            <li><strong style={{ color: TXT }}>Off-season sponsor challenge</strong> &mdash; branded prizes to keep bays booked through your slowest month</li>
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ padding: '48px 20px', backgroundColor: BG3, borderTop: `1px solid ${BDR}` }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <h2 style={{ fontFamily: DISP, fontSize: 26, marginBottom: 24 }}>Common questions</h2>
            {FAQS.map((f) => (
              <div key={f.q} style={{ marginBottom: 24, borderBottom: `1px solid ${BDR}`, paddingBottom: 20 }}>
                <h3 style={{ fontFamily: DISP, fontSize: 17, margin: '0 0 8px' }}>{f.q}</h3>
                <p style={{ color: MUT, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '56px 20px 80px', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: DISP, fontSize: 26, marginBottom: 12 }}>Ready to fill your quiet hours?</h2>
          <p style={{ color: MUT, marginBottom: 28 }}>
            Set up your venue account and create your first event in a few minutes.
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              backgroundColor: ORG,
              color: '#000',
              fontFamily: DISP,
              padding: '14px 32px',
              textDecoration: 'none',
              borderRadius: 0,
            }}
          >
            Get Started
          </Link>
        </section>
      </main>
    </>
  );
}
