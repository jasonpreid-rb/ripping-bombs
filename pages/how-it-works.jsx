import { ORG, TXT, MUT, DIM, BDR, BG2, BG3, SANS, DISP } from "../lib/constants";
import { SeoPage } from "../components/SeoPageLayout";

/**
 * HOW-IT-WORKS / "FIND YOUR GLOBAL RANK" PAGE
 * Drop into: pages/how-it-works.jsx
 *
 * Assets referenced below — drop these into /public/how-it-works/:
 *   /public/how-it-works/rip-drive.mp4          (5s, muted, no audio track)
 *   /public/how-it-works/rip-drive-poster.jpg   (poster frame for the video)
 *   /public/how-it-works/best-shot.jpg          (simulator "Best Shot" screen)
 *
 * Note: SeoPage already wraps children in a div with
 * padding:'48px 18px 80px', maxWidth:1000, margin:'0 auto' — so nothing in
 * here adds its own outer horizontal padding or max-width; it just fills
 * that container, matching how index.jsx / [slug].jsx build their sections.
 */

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
      <span style={{ fontFamily: SANS, fontSize: "0.72rem", color: MUT, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontFamily: DISP, fontSize: "2rem", fontWeight: 900, color: ORG, letterSpacing: "-0.03em", lineHeight: 1 }}>
        #{rank}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ background: "rgba(255,0,144,0.16)", color: ORG, border: "1px solid rgba(255,0,144,0.3)", borderRadius: 20, padding: "3px 10px", fontFamily: SANS, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.02em" }}>
          Top {percentile}%
        </span>
        <span style={{ fontFamily: SANS, fontSize: "0.74rem", color: MUT }}>of {total.toLocaleString()}</span>
      </div>
      {chip && (
        <span style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: "3px 11px", fontFamily: SANS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.03em" }}>
          {chip}
        </span>
      )}
    </div>
  );
}

function ExampleRankStrip() {
  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 12 }}>
        Example — this is what your profile shows
      </div>
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
        <RankColumn first label="Global Rank" rank={exampleRank.global.rank} total={exampleRank.global.total} percentile={exampleRank.global.percentile} chip={exampleRank.global.chip} />
        <RankColumn
          label="Country Rank"
          rank={exampleRank.country.rank}
          total={exampleRank.country.total}
          percentile={exampleRank.country.percentile}
          chip={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <img src={`https://flagcdn.com/w40/${exampleRank.country.code}.png`} alt="" style={{ width: 18, height: 13, objectFit: "cover", borderRadius: 2 }} />
              {exampleRank.country.code.toUpperCase()}
            </span>
          }
        />
        <RankColumn label="Age Group Rank" rank={exampleRank.age.rank} total={exampleRank.age.total} percentile={exampleRank.age.percentile} chip={exampleRank.age.chip} />
      </div>
    </div>
  );
}

function MediaFrame({ src, poster, isVideo, alt }) {
  return (
    <div style={{ flexShrink: 0, width: "100%", maxWidth: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: "100%", aspectRatio: "9 / 16", background: BG3, border: `1px solid ${BDR}`, overflow: "hidden" }}>
        {isVideo ? (
          <video src={src} poster={poster} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>
      <a href="https://www.instagram.com/mattybombs" target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 11, color: DIM, textDecoration: "none" }}>
        {isVideo ? "Footage" : "Photo"}: @Mattybombs
      </a>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <SeoPage
      title="How It Works — Find Your Global Rank | Ripping Bombs"
      description="Three steps to see how your longest drive stacks up against golfers worldwide. Rip your shot, upload it, and get ranked instantly."
    >
      {/* HERO / STEP 1 — video sits here so it's visible above the fold */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: "uppercase", marginBottom: 14 }}>
          How It Works
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <h1 style={{ fontFamily: DISP, fontSize: "clamp(30px,5vw,48px)", color: TXT, letterSpacing: 1, lineHeight: 1.08, margin: "0 0 16px", textTransform: "uppercase" }}>
              Rip a drive.
              <br />
              Upload it.
              <br />
              <span style={{ color: ORG }}>Get your global rank.</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, lineHeight: 1.75, maxWidth: 440, margin: 0 }}>
              Three steps, about a minute total. Swing at any partner simulator, snap the result screen, and see exactly where you stand against golfers worldwide.
            </p>
          </div>
          <MediaFrame src="/how-it-works/rip-drive.mp4" poster="/how-it-works/rip-drive-poster.jpg" isVideo />
        </div>
      </div>

      {/* STEP 2 */}
      <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 40, marginBottom: 48, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 10 }}>
            Step 2 · 15 seconds, tops
          </div>
          <h2 style={{ fontFamily: DISP, fontSize: "clamp(22px,3vw,30px)", color: TXT, letterSpacing: 0.5, margin: "0 0 14px", textTransform: "uppercase" }}>
            Snap it. Upload it.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, lineHeight: 1.75, maxWidth: 440, margin: 0 }}>
            When the sim flags your best shot, photograph the screen and upload it to Ripping Bombs. That's the whole step — we take it from there.
          </p>
        </div>
        <MediaFrame src="/how-it-works/best-shot.jpg" alt="Simulator screen showing a Best Shot result with distance stats" />
      </div>

      {/* STEP 3 */}
      <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 40, marginBottom: 48 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 10 }}>
          Step 3 · Instant result
        </div>
        <h2 style={{ fontFamily: DISP, fontSize: "clamp(22px,3vw,30px)", color: TXT, letterSpacing: 0.5, margin: "0 0 14px", textTransform: "uppercase" }}>
          Get ranked.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, lineHeight: 1.75, maxWidth: 560, margin: "0 0 24px" }}>
          We verify the shot and slot it onto the leaderboard — global, country, and age group. This is exactly what shows up on your profile.
        </p>
        <ExampleRankStrip />
      </div>

      {/* CTA */}
      <div style={{ background: "rgba(255,0,144,0.05)", border: "1px solid rgba(255,0,144,0.2)", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: DISP, fontSize: "clamp(22px,5vw,36px)", color: TXT, letterSpacing: 1, marginBottom: 10 }}>
          READY TO FIND OUT WHERE YOU STAND?
        </div>
        <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 28 }}>Register now and get your best drive on the board.</div>
        <a
          href="https://www.rippingbombs.com/register"
          style={{ display: "inline-block", background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "14px 36px", borderRadius: 0, textDecoration: "none", letterSpacing: 0.5 }}
        >
          REGISTER NOW →
        </a>
      </div>
    </SeoPage>
  );
}
