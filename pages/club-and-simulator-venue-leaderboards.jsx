// pages/club-and-simulator-venue-leaderboards.jsx
//
// URL: rippingbombs.com/club-and-simulator-venue-leaderboards
//
// Purpose:
//  1) SEO — targets searches from golf clubs / simulator venue owners looking
//     for a free leaderboard page for their venue
//  2) Informational — a single shareable link you can send to venues during
//     outreach, explaining the auto-generated /clubs/[slug] pages and the
//     "tag your drive to this venue" flow

import { useState } from 'react';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BDR, SANS, DISP } from '../lib/constants';

const linkStyle = { color: ORG };

const listStyle = { paddingLeft: 20, marginBottom: 16 };
const liStyle = { fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 8 };
const liStrong = { color: TXT, fontWeight: 700 };

export default function ClubAndSimulatorVenueLeaderboards() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Is there any cost?', a: "No. It's free to register your venue and free for players to submit drives." },
    { q: 'How quickly will our page go live?', a: "Simulator accounts are approved instantly. Club registrations are reviewed by our team first — you'll get a confirmation email once approved, and your venue page goes live straight away after that." },
    { q: 'Do we need to design or build anything?', a: "No. Your page is generated automatically from your registration details and populates as players submit and tag drives to your venue." },
    { q: 'Is this only for golf simulator venues, or traditional clubs too?', a: "Both. Any registered golf club, course, or simulator venue gets a page, and simulator players can tag any of them as their home venue." },
    { q: 'Can we add our logo or branding?', a: "Yes — add a logo when you register and it will appear on your venue page." },
    { q: "What if players have already been tagging us, but we haven't registered yet?", a: <>Register your venue using the link above so you can claim and manage your page, or <a href="/contact" style={linkStyle}>get in touch</a> and we'll help set it up.</> },
  ];

  return (
    <SeoPage
      title="Free Leaderboard Pages For Golf Clubs & Simulator Venues | Ripping Bombs"
      description="Every golf club and simulator venue gets a free, auto-generated leaderboard page with its own URL. Simulator players tag your venue and their drives rank automatically."
    >
      <SeoH1>Every Golf Club & Simulator Venue Gets Its Own Free Leaderboard Page</SeoH1>

      <SeoP>
        When a golf club, course, or simulator venue registers on Ripping Bombs and is approved, we automatically create a dedicated leaderboard page for them — a permanent, public page showing the venue's longest drives, club record, and player rankings. Simulator users can tag that venue when they submit a drive, so every result feeds straight into the venue's own leaderboard as well as the global one. There's nothing to build, design, or maintain.
      </SeoP>

      <SeoH2>How It Works</SeoH2>
      <ol style={listStyle}>
        <li style={liStyle}><span style={liStrong}>Register your venue</span> — free, takes about two minutes at <a href="/register" style={linkStyle}>rippingbombs.com/register</a>.</li>
        <li style={liStyle}><span style={liStrong}>We review and approve it</span> — club registrations are checked by our team before going live (simulator accounts are approved instantly). You'll get a confirmation email either way.</li>
        <li style={liStyle}><span style={liStrong}>Your page goes live</span> — at a permanent URL like rippingbombs.com/clubs/your-venue-name.</li>
        <li style={liStyle}><span style={liStrong}>Players tag your venue</span> — anyone using a simulator (or playing your course) selects your venue when they submit a drive.</li>
        <li style={liStyle}><span style={liStrong}>Your leaderboard updates itself</span> — weekly rankings and the all-time club record update automatically, no manual input needed.</li>
        <li style={liStyle}><span style={liStrong}>Share the link</span> — on social media, in newsletters, on a screen in your simulator bay, or via a QR code on the wall.</li>
      </ol>

      <SeoH2>What A Venue Page Looks Like</SeoH2>
      <SeoP>
        Each page shows the venue name, location, and badges; the current club record holder (player, equipment, handicap, and distance); a full weekly leaderboard with rank, player, distance, club, handicap, age, gender, and date; an all-time view; and a running total of drives and players recorded for that venue. Simulator users see a "Tag your drive to this venue" prompt right on the page.
      </SeoP>
      <SeoP>
        See a live example: <a href="/clubs/bethpage-black" style={linkStyle}>rippingbombs.com/clubs/bethpage-black</a>
      </SeoP>

      <SeoH2>Why It's Good For Your Venue</SeoH2>
      <SeoTable
        headers={['Benefit', 'What It Means For Your Venue']}
        rows={[
          ['Free SEO & Search Visibility', `Your page is indexed by Google, so people searching for your venue's name, or "longest drive leaderboard" near you, can find you — at no cost.`],
          ['A Permanent, Shareable URL', 'One link for your social bios, email signatures, in-venue signage, or a QR code by the simulator bays.'],
          ['Built-In Player Engagement', 'Members and simulator users keep coming back to beat their own drive, climb the weekly leaderboard, or chase the club record.'],
          ['A Reason To Return Every Week', 'Each simulator account can submit one drive per week. That weekly cadence gives players a built-in reason to come back to your venue and try to beat their previous result.'],
          ['Global Leaderboard Exposure', `Every drive submitted — not just personal bests — appears on Ripping Bombs' global leaderboard (and the relevant category leaderboards), seen by golfers across 50+ countries, as well as on your venue's own page.`],
          ['Free Word-Of-Mouth Marketing', 'Players can share their result directly from the leaderboard — with your venue attached — to WhatsApp, Instagram, and Facebook.'],
          ['Zero Cost, Zero Setup', 'Pages are generated automatically once your registration is approved. Nothing to build, host, or maintain on your end.'],
        ]}
      />

      <SeoH2>For Simulator Players</SeoH2>
      <SeoP>
        Any registered simulator user can select a "home" venue — whether that's a simulator centre, your golf club, or wherever they practise — when they register or submit a drive. That drive then counts toward both the global leaderboard and that venue's own leaderboard, building up a record of activity for the venue over time.
      </SeoP>
      <SeoP>
        Simulator accounts can submit one drive per week. In practice, that means a player visits, takes their best shot at that week's leaderboard, then has a built-in reason to come back the following week and try to beat it — at your venue, on your simulators.
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
    </SeoPage>
  );
}
