// pages/for-venues.jsx
//
// Sales/showcase page for venue outreach. Frames the live demo display
// (pages/venue-display-demo.jsx) inside a CSS TV-bezel mockup so it reads
// as "this is what it looks like on your screen" rather than a bare embed.
//
// NOTE ON DESIGN TOKENS: this imports the site's shared tokens the way the
// rest of the marketing pages do. If your actual export names in
// lib/constants differ from the ones below (ORG, TXT, MUT, DIM, BDR, BG2,
// BG3, SANS, DISP), just adjust the import line and the usages accordingly
// — the values themselves aren't guessed, only the names might not match
// 1:1 depending on how constants.js is currently structured.

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from '../lib/constants';

export default function ForVenues() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Bring Ripping Bombs to Your Venue — Live TV Leaderboard</title>
        <meta
          name="description"
          content="A live, always-on longest-drive leaderboard for your golf simulator bays or driving range — see exactly what it looks like on your TV."
        />
      </Head>

      <div className="page">
        <section className="hero">
          <div className="eyebrow">FOR VENUES</div>
          <h1>
            A leaderboard your players<br />can't stop watching
          </h1>
          <p className="sub">
            Drop this on any TV in your bays or clubhouse. It updates itself, rotates through
            divisions automatically, and gives every golfer a reason to come back and chase
            the board. Here's exactly what it looks like, running live right now.
          </p>
        </section>

        <section className="tv-wrap">
          <div className="tv-frame">
            <div className="tv-cam" />
            <div className="tv-screen">
              <iframe
                className="live-embed"
                src="/venue-display-demo"
                title="Live leaderboard demo"
                loading="lazy"
              />
              <img
                className="mobile-shot"
                src="/images/tv-demo-preview.svg"
                alt="Sample longest-drive leaderboard shown on a venue TV"
                loading="lazy"
              />
            </div>
          </div>
          <div className="tv-stand" />
          <div className="tv-base" />
        </section>

        <section className="proof">
          <div className="proof-item">
            <div className="proof-num">01</div>
            <div>
              <div className="proof-title">Works on any smart TV</div>
              <div className="proof-body">Chromecast, Fire Stick, a browser in kiosk mode — if it can open a webpage, it can run this.</div>
            </div>
          </div>
          <div className="proof-item">
            <div className="proof-num">02</div>
            <div>
              <div className="proof-title">Updates itself, no admin work</div>
              <div className="proof-body">New drives appear automatically. Nobody at your front desk has to touch it.</div>
            </div>
          </div>
          <div className="proof-item">
            <div className="proof-num">03</div>
            <div>
              <div className="proof-title">Your venue on the global stage</div>
              <div className="proof-body">Your top drives show up against every other Ripping Bombs venue, not just your own walls.</div>
            </div>
          </div>
        </section>

        <section className="cta-block">
          <h2>Want this running at your venue?</h2>
          <p>Takes about five minutes to set up. No hardware to buy.</p>
          <div className="cta-row">
            <a className="btn primary" href="mailto:hello@rippingbombs.com?subject=Set%20up%20venue%20display">
              Get in touch
            </a>
            <button className="btn ghost" onClick={() => router.push('/venue-display-demo')}>
              Open live demo in full screen
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          background: ${BG2 || '#08080c'};
          color: ${TXT || '#f5f5f7'};
          font-family: ${SANS || "'Inter', sans-serif"};
          min-height: 100vh;
          padding: 80px 24px 100px;
        }
        .hero {
          max-width: 720px;
          margin: 0 auto 56px;
          text-align: center;
        }
        .eyebrow {
          font-size: 12px;
          letter-spacing: 3px;
          font-weight: 700;
          color: ${ORG || '#ff0090'};
          margin-bottom: 16px;
        }
        h1 {
          font-family: ${DISP || "'Bebas Neue', sans-serif"};
          font-size: 52px;
          line-height: 1.05;
          letter-spacing: 0.5px;
          margin: 0 0 20px;
        }
        .sub {
          font-size: 16px;
          line-height: 1.6;
          color: ${MUT || '#8a8a96'};
          max-width: 560px;
          margin: 0 auto;
        }

        .tv-wrap {
          max-width: 980px;
          margin: 0 auto 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tv-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #0c0c10;
          border-radius: 16px;
          padding: 18px;
          box-shadow:
            0 30px 80px -20px rgba(0, 0, 0, 0.7),
            0 0 0 1px ${BDR || '#25252f'};
        }
        .tv-cam {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1e1e26;
        }
        .tv-screen {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
        }
        .tv-screen iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        .tv-screen .mobile-shot {
          display: none;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @media (max-width: 640px) {
          .tv-screen .live-embed { display: none; }
          .tv-screen .mobile-shot { display: block; }
        }
        .tv-stand {
          width: 8px;
          height: 36px;
          background: linear-gradient(180deg, #0c0c10, #050507);
        }
        .tv-base {
          width: 160px;
          height: 10px;
          border-radius: 5px;
          background: #0c0c10;
          margin-top: -2px;
          box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.6);
        }

        .proof {
          max-width: 900px;
          margin: 0 auto 80px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .proof-item {
          background: ${BG3 || '#121218'};
          border: 1px solid ${BDR || '#25252f'};
          border-radius: 12px;
          padding: 24px;
        }
        .proof-num {
          font-family: ${DISP || "'Bebas Neue', sans-serif"};
          font-size: 22px;
          color: ${ORG || '#ff0090'};
          margin-bottom: 10px;
        }
        .proof-title {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 6px;
        }
        .proof-body {
          font-size: 13.5px;
          line-height: 1.55;
          color: ${MUT || '#8a8a96'};
        }

        .cta-block {
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
        }
        .cta-block h2 {
          font-family: ${DISP || "'Bebas Neue', sans-serif"};
          font-size: 30px;
          letter-spacing: 0.5px;
          margin: 0 0 10px;
        }
        .cta-block p {
          color: ${MUT || '#8a8a96'};
          margin: 0 0 28px;
          font-size: 14.5px;
        }
        .cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          border-radius: 0;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          border: 1px solid transparent;
        }
        .btn.primary {
          background: ${ORG || '#ff0090'};
          color: #08080c;
        }
        .btn.ghost {
          background: transparent;
          color: ${TXT || '#f5f5f7'};
          border-color: ${BDR || '#25252f'};
        }

        @media (max-width: 640px) {
          h1 { font-size: 36px; }
          .proof { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
