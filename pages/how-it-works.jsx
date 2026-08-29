import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from "../lib/constants";
import { SeoPage } from "../components/SeoPageLayout";

/**
 * HOW-IT-WORKS / "FIND YOUR GLOBAL RANK" PAGE
 * Drop into: pages/how-it-works.jsx (or wherever your route wants it)
 *
 * Assets referenced below — drop these into /public/how-it-works/:
 *   /public/how-it-works/rip-drive.mp4          (5s, muted, no audio track)
 *   /public/how-it-works/rip-drive-poster.jpg   (poster frame for the video)
 *   /public/how-it-works/best-shot.jpg          (simulator "Best Shot" screen)
 */

const steps = [
  {
    n: "01",
    label: "SWING AWAY",
    title: "Rip your shot.",
    body: "Every swing is tracked automatically — carry, total distance, ball speed, all of it, the moment you make contact.",
    media: "video",
  },
  {
    n: "02",
    label: "15 SECONDS, TOPS",
    title: "Snap it, upload it.",
    body: "When the sim flags your best shot, photograph the screen and upload it to Ripping Bombs. That's the whole step.",
    media: "image",
  },
  {
    n: "03",
    label: "INSTANT RESULT",
    title: "Get ranked.",
    body: "We verify the shot and slot it onto the leaderboard — global, country, and age group. This is exactly what shows up on your profile.",
    media: "rank",
  },
];

// Static example numbers for the rank panel — illustrative only, not live data.
const exampleRank = {
  global: { rank: 482, total: 6140, percentile: 8, chip: "Men (Open)" },
  country: { rank: 34, total: 812, percentile: 4, code: "us" },
  age: { rank: 19, total: 940, percentile: 2, chip: "Age 25–34" },
};

function RankColumn({ label, rank, total, percentile, chip, first }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        minWidth: 150,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingLeft: first ? 0 : "1.5rem",
        borderLeft: first ? "none" : "1px solid rgba(255,0,144,0.2)",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          color: MUT,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: DISP,
          fontSize: "2rem",
          fontWeight: 900,
          color: ORG,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        #{rank}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span
          style={{
            background: "rgba(255,0,144,0.16)",
            color: ORG,
            border: "1px solid rgba(255,0,144,0.3)",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          Top {percentile}%
        </span>
        <span style={{ fontSize: "0.74rem", color: MUT }}>of {total.toLocaleString()}</span>
      </div>
      {chip && (
        <span
          style={{
            alignSelf: "flex-start",
            background: "rgba(255,255,255,0.08)",
            color: MUT,
            border: `1px solid ${BDR}`,
            borderRadius: 20,
            padding: "3px 11px",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          {chip}
        </span>
      )}
    </div>
  );
}

function RankPanel() {
  return (
    <div className="rank-panel-wrap">
      <span className="rank-eyebrow">EXAMPLE — THIS IS WHAT YOUR PROFILE SHOWS</span>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,0,144,0.14), rgba(255,0,144,0.03))",
          border: "1px solid rgba(255,0,144,0.35)",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          rowGap: "1.25rem",
        }}
      >
        <RankColumn
          first
          label="Global Rank"
          rank={exampleRank.global.rank}
          total={exampleRank.global.total}
          percentile={exampleRank.global.percentile}
          chip={exampleRank.global.chip}
        />
        <RankColumn
          label="Country Rank"
          rank={exampleRank.country.rank}
          total={exampleRank.country.total}
          percentile={exampleRank.country.percentile}
          chip={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <img
                src={`https://flagcdn.com/w40/${exampleRank.country.code}.png`}
                alt=""
                style={{ width: 18, height: 13, objectFit: "cover", borderRadius: 2 }}
              />
              {exampleRank.country.code.toUpperCase()}
            </span>
          }
        />
        <RankColumn
          label="Age Group Rank"
          rank={exampleRank.age.rank}
          total={exampleRank.age.total}
          percentile={exampleRank.age.percentile}
          chip={exampleRank.age.chip}
        />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <SeoPage
      title="How It Works — Find Your Global Rank | Ripping Bombs"
      description="Three steps to see how your longest drive stacks up against golfers worldwide. Rip your shot, upload it, and get ranked instantly."
    >
      <main className="how">
        {/* HERO */}
        <section className="hero">
          <span className="eyebrow">HOW IT WORKS</span>
          <h1>
            Three steps.
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
            <article
              className="step"
              key={step.n}
              data-flip={step.media !== "rank" && i % 2 === 1}
              data-wide={step.media === "rank"}
            >
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
                  <div className="media-block">
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
                    <a
                      className="credit"
                      href="https://www.instagram.com/mattybombs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Footage: @Mattybombs
                    </a>
                  </div>
                )}
                {step.media === "image" && (
                  <div className="media-block">
                    <div className="frame frame-image">
                      <img
                        src="/how-it-works/best-shot.jpg"
                        alt="Simulator screen showing a Best Shot result with distance stats"
                      />
                    </div>
                    <a
                      className="credit"
                      href="https://www.instagram.com/mattybombs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Photo: @Mattybombs
                    </a>
                  </div>
                )}
                {step.media === "rank" && <RankPanel />}
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
          padding: 64px 0 48px;
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
          font-size: clamp(36px, 6vw, 64px);
          line-height: 1.03;
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
          margin: 0 auto;
          padding: 0 0 64px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .step {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          padding: 56px 0;
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
        .step[data-wide="true"] {
          grid-template-columns: 1fr;
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
          font-size: clamp(26px, 3vw, 34px);
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
        .step[data-wide="true"] .step-media {
          justify-content: stretch;
          margin-top: 8px;
        }
        .media-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .credit {
          font-family: ${SANS};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: ${DIM};
          text-decoration: none;
        }
        .credit:hover {
          color: ${ORG};
        }
        .frame {
          width: 100%;
          max-width: 280px;
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

        .rank-panel-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rank-eyebrow {
          font-family: ${SANS};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: ${DIM};
          text-transform: uppercase;
        }

        /* ---------- CTA ---------- */
        .cta {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 0 80px;
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
          .step {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 36px 0;
          }
          .step[data-flip="true"] {
            direction: ltr;
          }
          .frame {
            max-width: 220px;
            margin: 0 auto;
          }
        }
      `}</style>
    </SeoPage>
  );
}
