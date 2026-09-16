// pages/fill-empty-golf-simulator-bays.jsx
//
// URL: rippingbombs.com/fill-empty-golf-simulator-bays
//
// Purpose:
//  1) SEO — targets searches from simulator venue owners looking for ways
//     to fill quiet bay time / off-peak hours
//  2) Informational — walks through running a scheduled, timed long drive
//     comp (the venue events feature) as the core tactic, using bay time
//     that would otherwise sit empty

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

const listStyle = { paddingLeft: 20, marginBottom: 16 };
const liStyle = { fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 8 };
const liStrong = { color: TXT, fontWeight: 700 };

// Simple 3-step timeline — plain SVG using the site's own color tokens, no
// image assets or external libraries needed. Short single-line labels only
// (no wrapped captions) so it stays legible when scaled down on mobile.
function TimelineDiagram() {
  const steps = ['Schedule It', 'Live Event', 'Results Lock In'];
  return (
    <svg viewBox="0 0 720 110" style={{ width: '100%', height: 'auto', display: 'block', margin: '24px 0' }} role="img" aria-label="Event timeline: schedule it, then live event, then results lock in">
      <line x1="90" y1="35" x2="630" y2="35" stroke={BDR} strokeWidth="2" />
      {steps.map((label, i) => {
        const cx = 90 + i * 270;
        return (
          <g key={label}>
            <circle cx={cx} cy="35" r="24" fill={BG3} stroke={ORG} strokeWidth="2" />
            <text x={cx} y="42" textAnchor="middle" fontFamily={SANS} fontSize="18" fontWeight="700" fill={ORG}>{i + 1}</text>
            <text x={cx} y="85" textAnchor="middle" fontFamily={SANS} fontSize="15" fontWeight="700" fill={TXT}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function FillEmptyGolfSimulatorBays() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Is this free to set up?', a: "Listing your venue, getting a leaderboard page, and having players submit drives is always free. Scheduling your own timed competition — the feature this page is about — is part of the TV Display & Sponsors tier, which includes a free trial." },
    { q: 'How long can an event run for?', a: "Whatever suits your bay time — a couple of hours for a quiet Tuesday evening, a full day, or spread across a whole weekend. You set the exact start and end date/time when you create it." },
    { q: 'Can I limit how many drives each player takes?', a: "Yes. Set a max attempts per player when you create the event — e.g. 3 swings each — so a comp night has a natural rhythm and doesn't turn into unlimited free play. Leave it blank for unlimited attempts." },
    { q: 'Do results still count on the main Ripping Bombs leaderboard?', a: "Yes. Every drive submitted during your event also feeds the global leaderboard and the relevant category leaderboards, in addition to your event's own leaderboard — so your venue gets exposure well beyond the people in the room that night." },
    { q: 'How do players find out about it and join?', a: "You get a shareable link and QR code for the event the moment you create it — put it on a poster, your socials, or a screen in the venue. Players tap in, and can also be invited directly by name or email if they already have an account." },
    { q: 'What happens once the event window closes?', a: "No further entries or new joins are accepted, and the leaderboard for that event locks in as the final result — a clean record of the night that you can point back to or share afterwards." },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <SeoPage
      title="How To Fill Empty Golf Simulator Bays | Ripping Bombs"
      description="Turn quiet bay time into paid comp nights. Schedule a timed long drive competition, cap entries per player, and get more bookings with Ripping Bombs."
    >
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <SeoH1>How To Fill Empty Golf Simulator Bays</SeoH1>

      <SeoP>
        Every simulator venue has the same problem: bays that sit empty on weekday afternoons, quiet evenings, or the hours between your regular leagues. That's paid time you're not getting back. The fastest way to change that isn't a discount code — it's giving people a reason to book that specific slot. A scheduled long drive competition, run through Ripping Bombs, does exactly that: a real event with a start time, an end time, and a leaderboard on the line.
      </SeoP>

      <SeoH2>Run A Scheduled Comp Night</SeoH2>
      <SeoP>
        Rather than an always-open leaderboard, you can now schedule an event with its own start and end date/time — a few hours for a single evening, a full day, or spread across a weekend. Only inside that window can players join and submit, so it behaves like a real ticketed comp rather than casual practice: a clear reason to show up at a specific time, not "whenever."
      </SeoP>
      <SeoP>
        You can also cap how many drives each player gets — say, 3 swings each — so a comp night has a proper rhythm and turns over bays at a predictable pace, instead of one player camping a bay indefinitely.
      </SeoP>

      <TimelineDiagram />

      <SeoH2>What You Can Configure</SeoH2>
      <SeoTable
        headers={['Setting', 'What It Does']}
        rows={[
          ['🗓️ Start & End Date/Time', 'Sets the exact window your event is live for — a few hours, a full day, or spread across several days. Joining and submitting only work inside this window.'],
          ['🎯 Max Attempts Per Player', 'Caps how many drives each player can submit — e.g. 3 swings each — so a comp night moves at a predictable pace. Leave blank for unlimited attempts.'],
          ['🎂 Age Range', 'Restrict entry to a specific age bracket, for a juniors-only or seniors-only event.'],
          ['🚻 Gender', "Restrict entry to men or women only, or leave open to everyone."],
          ['📝 Description', 'A short blurb shown on the event page — house rules, prizes, or what to expect on the night.'],
          ['🏷️ Sponsor Name & Logo', "Add a sponsor's branding to the event page if you've got one backing the night."],
        ]}
      />

      <SeoH2>How It Works</SeoH2>
      <ol style={listStyle}>
        <li style={liStyle}><span style={liStrong}>Pick your window</span> — set a start and end date/time from your venue dashboard. A quiet Tuesday evening, an off-peak afternoon slot, or a whole weekend.</li>
        <li style={liStyle}><span style={liStrong}>Set the rules</span> — configure any of the options above that fit your event; everything's optional except the name and the window.</li>
        <li style={liStyle}><span style={liStrong}>Share the link and QR code</span> — generated automatically the moment you create the event, ready for a poster, your socials, or a screen by the bays. You can also invite specific players by name or email.</li>
        <li style={liStyle}><span style={liStrong}>Players join and compete</span> — only during your scheduled window, with a live leaderboard updating as drives come in.</li>
        <li style={liStyle}><span style={liStrong}>Results lock in</span> — once the window closes, entries stop and the leaderboard for that event stands as the record of the night.</li>
        <li style={liStyle}><span style={liStrong}>Everything still feeds the global board</span> — every drive submitted also counts toward the main Ripping Bombs leaderboard, so your venue gets visibility beyond the people who were there.</li>
      </ol>

      <SeoH2>Why It Fills Bay Time</SeoH2>
      <SeoTable
        headers={['Benefit', 'What It Means For Your Venue']}
        rows={[
          ['📅 A Real Reason To Book That Slot', 'A scheduled event with a start and end time reads as a real occasion, not casual open practice — people book around it rather than dropping by whenever.'],
          ['🔄 Bays Turn Over Predictably', 'Capping attempts per player keeps a comp night moving instead of one group holding a bay for hours.'],
          ['🌙 Fills Your Quietest Hours', 'Run it exactly when you need bodies in bays — a slow weekday evening, an off-peak afternoon, or a weekend you want to fill.'],
          ['🔗 Shareable Before, During, And After', 'A link and QR code you can promote ahead of time, plus a live leaderboard that keeps players checking back during the event.'],
          ['🌍 Exposure Beyond The Room', 'Every drive also counts on the global Ripping Bombs leaderboard, seen by golfers well outside your venue.'],
          ['⚡ Zero Extra Setup', "Scheduling, the shareable link, the QR code, and the leaderboard are all generated automatically — nothing to build or host yourself."],
        ]}
      />

      <SeoH2>Other Ways To Use Quiet Bay Time</SeoH2>
      <SeoP>
        A scheduled comp night is the most direct fix, but it's worth combining with the basics: off-peak pricing for your emptiest hours, a standing weekly league that gives regulars a recurring reason to return, corporate or group bookings for slower daytime slots, and a junior or beginner session on a night that otherwise goes unused. A comp event works well layered on top of any of these — turn your existing off-peak league night into a scheduled, leaderboard-driven event and it becomes something people actively promote to each other.
      </SeoP>

      <SeoCTA />

      <SeoH2>FAQ</SeoH2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {faqs.map(({ q, a }, i) => (
          <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? 'rgba(163,230,53,0.25)' : BDR}`, overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 }}>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TXT, textAlign: 'left' }}>{q}</span>
              <span style={{ fontFamily: SANS, fontSize: 18, color: ORG, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openFaq === i && <div style={{ padding: '0 20px 18px', fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.75 }}>{a}</div>}
          </div>
        ))}
      </div>

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/club-and-simulator-venue-leaderboards" style={linkStyle}>Club & Simulator Venue Leaderboards</Link>{' | '}
        <Link href="/golf-club-longest-drive-competition-ideas" style={linkStyle}>Golf Club Longest Drive Competition Ideas</Link>{' | '}
        <Link href="/simulator-golf-competition" style={linkStyle}>Simulator Golf Competition</Link>{' | '}
        <Link href="/golf-long-drive-competition" style={linkStyle}>Golf Long Drive Competition</Link>
      </SeoP>
    </SeoPage>
  );
}
