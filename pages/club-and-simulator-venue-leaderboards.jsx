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
//
// NOTE ON ASSUMPTIONS:
// This follows the same pattern as how-to-promote-your-golf-event.jsx
// (SeoPageLayout wrapper + title/description props, design tokens from
// lib/constants.js for inline styling). If SeoPageLayout's prop signature
// differs, or if the existing SEO pages use a shared <BenefitTable> /
// <Cta> component instead of inline styles, send over how-to-promote-your-golf-event.jsx
// and I'll line this up exactly.

import SeoPageLayout from '../components/SeoPageLayout';
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from '../lib/constants';

const styles = {
  wrap: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '40px 20px 80px',
    fontFamily: SANS,
    color: TXT,
  },
  h1: {
    fontFamily: DISP,
    fontSize: 36,
    lineHeight: 1.2,
    marginBottom: 16,
    color: TXT,
  },
  h2: {
    fontFamily: DISP,
    fontSize: 24,
    marginTop: 44,
    marginBottom: 12,
    color: TXT,
  },
  p: {
    fontSize: 16,
    lineHeight: 1.7,
    color: TXT,
    marginBottom: 16,
  },
  muted: {
    color: MUT,
  },
  ol: {
    paddingLeft: 22,
    marginBottom: 16,
  },
  li: {
    fontSize: 16,
    lineHeight: 1.7,
    marginBottom: 10,
    color: TXT,
  },
  link: {
    color: ORG,
    textDecoration: 'underline',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 12,
    marginBottom: 24,
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: BG2,
    borderBottom: `1px solid ${BDR}`,
    fontFamily: DISP,
    fontSize: 14,
    color: TXT,
  },
  td: {
    padding: '12px 14px',
    borderBottom: `1px solid ${BDR}`,
    fontSize: 15,
    lineHeight: 1.5,
    color: TXT,
    verticalAlign: 'top',
  },
  cta: {
    background: BG2,
    border: `1px solid ${BDR}`,
    borderRadius: 12,
    padding: '28px 24px',
    textAlign: 'center',
    margin: '36px 0',
  },
  ctaTitle: {
    fontFamily: DISP,
    fontSize: 20,
    marginBottom: 8,
    color: TXT,
  },
  ctaBtn: {
    display: 'inline-block',
    marginTop: 14,
    padding: '14px 28px',
    background: ORG,
    color: '#0e0e0e',
    fontFamily: DISP,
    fontWeight: 700,
    borderRadius: 8,
    textDecoration: 'none',
  },
  ctaBtnSecondary: {
    display: 'inline-block',
    marginTop: 14,
    marginLeft: 12,
    padding: '14px 28px',
    background: 'transparent',
    color: TXT,
    border: `1px solid ${BDR}`,
    fontFamily: DISP,
    fontWeight: 700,
    borderRadius: 8,
    textDecoration: 'none',
  },
  faqItem: {
    background: BG3,
    border: `1px solid ${BDR}`,
    borderRadius: 10,
    padding: '16px 18px',
    marginBottom: 12,
  },
  faqQ: {
    fontFamily: DISP,
    fontSize: 16,
    marginBottom: 6,
    color: TXT,
  },
  faqA: {
    fontSize: 15,
    lineHeight: 1.6,
    color: MUT,
    margin: 0,
  },
};

export default function ClubAndSimulatorVenueLeaderboards() {
  return (
    <SeoPageLayout
      title="Free Leaderboard Pages For Golf Clubs & Simulator Venues | Ripping Bombs"
      description="Every golf club and simulator venue gets a free, auto-generated leaderboard page with its own URL. Simulator players tag your venue and their drives rank automatically."
    >
      <div style={styles.wrap}>
        <h1 style={styles.h1}>
          Every Golf Club & Simulator Venue Gets Its Own Free Leaderboard Page
        </h1>

        <p style={styles.p}>
          When a golf club, course, or simulator venue registers on Ripping
          Bombs, we automatically create a dedicated leaderboard page for
          them — a permanent, public page showing the venue's longest drives,
          club record, and player rankings. Simulator users can tag that
          venue when they submit a drive, so every result feeds straight into
          the venue's own leaderboard as well as the global one. There's
          nothing to build, design, or maintain.
        </p>

        <h2 style={styles.h2}>How It Works</h2>
        <ol style={styles.ol}>
          <li style={styles.li}>
            <strong>Register your venue</strong> — free, takes about two
            minutes at{' '}
            <a href="/register" style={styles.link}>
              rippingbombs.com/register
            </a>
            .
          </li>
          <li style={styles.li}>
            <strong>Your page goes live</strong> — at a permanent URL like{' '}
            <span style={styles.muted}>
              rippingbombs.com/clubs/your-venue-name
            </span>
            .
          </li>
          <li style={styles.li}>
            <strong>Players tag your venue</strong> — anyone using a
            simulator (or playing your course) selects your venue when they
            submit a drive.
          </li>
          <li style={styles.li}>
            <strong>Your leaderboard updates itself</strong> — weekly
            rankings and the all-time club record update automatically, no
            manual input needed.
          </li>
          <li style={styles.li}>
            <strong>Share the link</strong> — on social media, in
            newsletters, on a screen in your simulator bay, or via a QR code
            on the wall.
          </li>
        </ol>

        <h2 style={styles.h2}>What A Venue Page Looks Like</h2>
        <p style={styles.p}>
          Each page shows the venue name, location, and badges; the current
          club record holder (player, equipment, handicap, and distance); a
          full weekly leaderboard with rank, player, distance, club, handicap,
          age, gender, and date; an all-time view; and a running total of
          drives and players recorded for that venue. Simulator users see a
          "Tag your drive to this venue" prompt right on the page.
        </p>
        <p style={styles.p}>
          See a live example:{' '}
          <a href="/clubs/bethpage-black" style={styles.link}>
            rippingbombs.com/clubs/bethpage-black
          </a>
        </p>

        <h2 style={styles.h2}>Why It's Good For Your Venue</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Benefit</th>
              <th style={styles.th}>What It Means For Your Venue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Free SEO & Search Visibility</td>
              <td style={styles.td}>
                Your page is indexed by Google, so people searching for your
                venue's name, or for "longest drive leaderboard" near you,
                can find you — at no cost.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>A Permanent, Shareable URL</td>
              <td style={styles.td}>
                One link for your social bios, email signatures, in-venue
                signage, or a QR code by the simulator bays.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>Built-In Player Engagement</td>
              <td style={styles.td}>
                Members and simulator users keep coming back to beat their
                own drive, climb the weekly leaderboard, or chase the club
                record.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>A Reason To Return Every Week</td>
              <td style={styles.td}>
                Each simulator account can submit one drive per week. That
                weekly cadence gives players a built-in reason to come back
                to your venue and try to beat their previous result.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>Global Leaderboard Exposure</td>
              <td style={styles.td}>
                Every drive submitted — not just personal bests — appears on
                Ripping Bombs' global leaderboard (and the relevant category
                leaderboards), seen by golfers across 50+ countries, as well
                as on your venue's own page.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>Free Word-Of-Mouth Marketing</td>
              <td style={styles.td}>
                Players can share their result directly from the
                leaderboard — with your venue attached — to WhatsApp,
                Instagram, and Facebook.
              </td>
            </tr>
            <tr>
              <td style={styles.td}>Zero Cost, Zero Setup</td>
              <td style={styles.td}>
                Pages are generated automatically on registration. Nothing to
                build, host, or maintain on your end.
              </td>
            </tr>
          </tbody>
        </table>

        <h2 style={styles.h2}>For Simulator Players</h2>
        <p style={styles.p}>
          Any registered simulator user can select a "home" venue — whether
          that's a simulator centre, your golf club, or wherever they
          practise — when they register or submit a drive. That drive then
          counts toward both the global leaderboard and that venue's own
          leaderboard, building up a record of activity for the venue over
          time.
        </p>
        <p style={styles.p}>
          Simulator accounts can submit one drive per week. In practice, that
          means a player visits, takes their best shot at that week's
          leaderboard, then has a built-in reason to come back the following
          week and try to beat it — at your venue, on your simulators.
        </p>

        <div style={styles.cta}>
          <div style={styles.ctaTitle}>Get Your Venue's Free Leaderboard Page</div>
          <p style={{ ...styles.p, marginBottom: 0 }}>
            Free to register. Free for players to submit. Live in minutes.
          </p>
          <a href="/register" style={styles.ctaBtn}>
            REGISTER YOUR VENUE FREE →
          </a>
          <a href="/clubs" style={styles.ctaBtnSecondary}>
            BROWSE EXISTING VENUE PAGES
          </a>
        </div>

        <h2 style={styles.h2}>FAQ</h2>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>Is there any cost?</div>
          <p style={styles.faqA}>
            No. It's free to register your venue and free for players to
            submit drives.
          </p>
        </div>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>
            How often can simulator players submit a drive?
          </div>
          <p style={styles.faqA}>
            Once per week per simulator account. It keeps the weekly
            leaderboard fresh and gives players a reason to come back to your
            venue regularly.
          </p>
        </div>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>Do we need to design or build anything?</div>
          <p style={styles.faqA}>
            No. Your page is generated automatically from your registration
            details and populates as players submit and tag drives to your
            venue.
          </p>
        </div>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>
            Is this only for golf simulator venues, or traditional clubs too?
          </div>
          <p style={styles.faqA}>
            Both. Any registered golf club, course, or simulator venue gets a
            page, and simulator players can tag any of them as their home
            venue.
          </p>
        </div>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>Can we add our logo or branding?</div>
          <p style={styles.faqA}>
            Yes — add a logo when you register and it will appear on your
            venue page.
          </p>
        </div>

        <div style={styles.faqItem}>
          <div style={styles.faqQ}>
            What if players have already been tagging us, but we haven't
            registered yet?
          </div>
          <p style={styles.faqA}>
            Register your venue at the link above so you can claim and manage
            your page, or{' '}
            <a href="/contact" style={styles.link}>
              get in touch
            </a>{' '}
            and we'll help set it up.
          </p>
        </div>

        <div style={styles.cta}>
          <div style={styles.ctaTitle}>Ready To Claim Your Venue's Page?</div>
          <a href="/register" style={styles.ctaBtn}>
            REGISTER YOUR VENUE FREE →
          </a>
        </div>
      </div>
    </SeoPageLayout>
  );
}
