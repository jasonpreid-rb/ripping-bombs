import Head from "next/head";
import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from "../lib/constants";
// If your SEO wrapper lives at a different path, adjust this import.
import SeoPageLayout from "../components/SeoPageLayout";

/**
 * HOW-IT-WORKS / "FIND YOUR GLOBAL RANK" PAGE
 * Drop into: pages/how-it-works.jsx (or wherever your route wants it)
 *
 * Assets referenced below — drop these into /public/how-it-works/:
 *   /public/how-it-works/rip-drive.mp4          (5s, muted, no audio track)
 *   /public/how-it-works/rip-drive-poster.jpg   (poster frame for the video)
 *   /public/how-it-works/best-shot.jpg          (simulator "Best Shot" screen)
 *
 * All four provided as separate files alongside this one.
 */

const steps = [
  {
    n: "01",
    label: "STEP INTO A BAY",
    title: "Find a bay.",
    body: "Walk up to any Trackman, GCQuad, or Full Swing simulator at a Ripping Bombs venue. No sign-up required to swing.",
  },
  {
    n: "02",
    label: "SWING AWAY",
    title: "Rip your drive.",
    body: "Every swing is tracked automatically — carry, total distance, ball speed, all of it, the moment you make contact.",
    media: "video",
  },
  {
    n: "03",
    label: "WATCH THE SCREEN",
    title: "Catch your best shot.",
    body: "When the sim flags a personal best, it flashes right there on screen. That's the number that counts.",
    media: "image",
  },
  {
    n: "04",
    label: "15 SECONDS, TOPS",
    title: "Snap it, upload it.",
    body: "Photograph that screen and upload it to Ripping Bombs. We verify it and lock in your distance.",
  },
  {
    n: "05",
    label: "INSTANT RESULT",
    title: "See your global rank.",
    body: "Your best drive gets slotted against every golfer on the leaderboard — worldwide, by category, live.",
  },
];

export default function HowItWorks() {
  return (
    <SeoPageLayout
      title="How It Works — Find Your Global Rank | Ripping Bombs"
      description="Five steps to see how your longest drive stacks up against golfers worldwide. Swing at any partner simulator, upload your best shot, and get ranked."
    >
      <Head>
        <meta property="og:title" content="How It Works — Ripping Bombs" />
      </Head>

      <main className="how">
        {/* HERO */}
        <section className="hero">
          <span className="eyebrow">HOW IT WORKS</span>
          <h1>
            Five steps.
            <br />
            One screenshot.
            <br />
            <span className="accent">Your global rank.</span>
          </h1>
          <p className="sub">
            You don&apos;t need a tournament to find out how far you really hit it.
            You need one good swing and a photo of the screen.
          </p>
        </section>

        {/* STEPS */}
        <section className="steps">
          {steps.map((step, i) => (
            <article className="step" key={step.n} data-flip={i % 2 === 1}>
              <div className="step-copy">
                <div className="step-head">
                  <span className="step-n">{step.n}</span>
                  <span className="step-label">{step.label}</span>
                </div>
                <h2>{step.title}</h2>
                <p>{step.body}</p>
              </div>

              <div className="step-media">
                {step.media === "video" && (
                  <div className="frame frame-video">
                    <video
                      src="/how-it-works/rip-drive.mp4"
                      poster="/how-it-works/rip-drive-poster.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                )}
                {step.media === "image" && (
                  <div className="frame frame-image">
                    <img
                      src="/how-it-works/best-shot.jpg"
                      alt="Simulator screen showing a Best Shot result with distance stats"
                    />
                  </div>
                )}
                {!step.media && (
                  <div className="frame frame-empty" aria-hidden="true">
                    <span className="frame-n">{step.n}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* CTA */}
        <section className="cta">
          <h3>Ready to find out where you stand?</h3>
          <p>Register now and get your best drive on the board.</p>
          <a className="cta-btn" href="https://www.rippingbombs.com/register">
            REGISTER NOW
          </a>
        </section>
      </main>

      <style jsx>{`
        .how {
          background: ${BG2};
          color: ${TXT};
          font-family: ${SANS};
        }

        /* ---------- HERO ---------- */
        .hero {
          max-width: 880px;
          margin: 0 auto;
          padding: 96px 24px 64px;
          text-align: left;
        }
        .eyebrow {
          display: inline-block;
          font-family: ${SANS};
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: ${ORG};
          border: 1px solid ${BDR};
          padding: 6px 12px;
          margin-bottom: 28px;
        }
        .hero h1 {
          font-family: ${DISP};
          font-size: clamp(40px, 7vw, 76px);
          line-height: 1.02;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
          text-transform: uppercase;
        }
        .hero h1 .accent {
          color: ${ORG};
        }
        .sub {
          font-size: 18px;
          line-height: 1.6;
          color: ${MUT};
          max-width: 560px;
          margin: 0;
        }

        /* ---------- STEPS ---------- */
        .steps {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px 96px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .step {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          padding: 64px 0;
          border-top: 1px solid ${BDR};
        }
        .step:last-child {
          border-bottom: 1px solid ${BDR};
        }
        .step[data-flip="true"] {
          direction: rtl;
        }
        .step[data-flip="true"] .step-copy,
        .step[data-flip="true"] .step-media {
          direction: ltr;
        }

        .step-head {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 18px;
        }
        .step-n {
          font-family: ${DISP};
          font-size: 15px;
          font-weight: 800;
          color: ${ORG};
          letter-spacing: 0.05em;
        }
        .step-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: ${DIM};
        }
        .step-copy h2 {
          font-family: ${DISP};
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.1;
          font-weight: 800;
          margin: 0 0 16px;
          text-transform: uppercase;
        }
        .step-copy p {
          font-size: 16px;
          line-height: 1.65;
          color: ${MUT};
          margin: 0;
          max-width: 440px;
        }

        .step-media {
          display: flex;
          justify-content: center;
        }
        .frame {
          width: 100%;
          max-width: 300px;
          aspect-ratio: 9 / 16;
          background: ${BG3};
          border: 1px solid ${BDR};
          overflow: hidden;
          position: relative;
        }
        .frame video,
        .frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .frame-empty {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .frame-n {
          font-family: ${DISP};
          font-size: 64px;
          font-weight: 800;
          color: ${BDR};
        }

        /* ---------- CTA ---------- */
        .cta {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 24px 120px;
          text-align: center;
        }
        .cta h3 {
          font-family: ${DISP};
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 800;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .cta p {
          color: ${MUT};
          font-size: 16px;
          margin: 0 0 32px;
        }
        .cta-btn {
          display: inline-block;
          background: ${ORG};
          color: ${TXT};
          font-family: ${SANS};
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.1em;
          padding: 16px 36px;
          border-radius: 0;
          text-decoration: none;
        }

        /* ---------- MOBILE ---------- */
        @media (max-width: 720px) {
          .hero {
            padding: 64px 20px 48px;
          }
          .steps {
            padding: 0 20px 64px;
          }
          .step {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 40px 0;
          }
          .step[data-flip="true"] {
            direction: ltr;
          }
          .frame {
            max-width: 240px;
            margin: 0 auto;
          }
        }
      `}</style>
    </SeoPageLayout>
  );
}
