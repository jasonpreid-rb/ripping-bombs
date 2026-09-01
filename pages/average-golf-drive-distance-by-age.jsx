import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from "../components/SeoPageLayout";
import SeoFaq from "../components/SeoFaq";
import { SANS, DISP, ORG, TXT, MUT, DIM, BG2, BG3, BDR } from "../lib/constants";

/**
 * AVERAGE GOLF DRIVE DISTANCE BY AGE / HANDICAP — "Where Do I Rank?"
 * Drop into: pages/average-golf-drive-distance-by-age.jsx
 *
 * Targets the well-searched "average driving distance by age/handicap"
 * cluster (practical-golf.com, golfmonthly, mygolfdistance.com, Arccos/
 * Skillest reports all rank here) but flips the angle: instead of another
 * static bracket table, this page uses the tables as a hook into "get your
 * actual rank, not just a bracket" — global, country, age group, and
 * handicap group. That's the wedge against the existing top-ranking content,
 * which is all static blog tables with no personalization.
 *
 * Illustrative distance ranges below are rounded, commonly-cited amateur
 * averages (not a single proprietary source) — presented as context for the
 * hook, not as Ripping Bombs' own measured data. Keep them approximate.
 *
 * Assets referenced — drop into /public/average-drive/:
 *   /public/average-drive/dashboard-preview.jpg   (real dashboard screenshot,
 *      cropped to the rank strip + stat cards — see DASHBOARD SCREENSHOT note below)
 */

const AGE_DISTANCE = [
  { bracket: "Under 30", yards: "230–245" },
  { bracket: "30s", yards: "225–240" },
  { bracket: "40s", yards: "215–230" },
  { bracket: "50s", yards: "205–220" },
  { bracket: "60s", yards: "190–210" },
  { bracket: "70+", yards: "170–195" },
];

const HCP_DISTANCE = [
  { bracket: "Scratch / 0–5", yards: "245–265" },
  { bracket: "6–10", yards: "225–245" },
  { bracket: "11–15", yards: "210–225" },
  { bracket: "16–20", yards: "195–210" },
  { bracket: "21–27", yards: "180–195" },
  { bracket: "28+", yards: "165–180" },
];

// Static example numbers for the rank preview — illustrative only, matches
// the real dashboard's peer-group band labels (age band / handicap band).
const exampleRank = {
  global: { rank: 482, total: 6140, percentile: 8 },
  country: { rank: 34, total: 812, percentile: 4, code: "us" },
  age: { rank: 19, total: 940, percentile: 2, label: "Age 35–44" },
  hcp: { rank: 27, total: 1105, percentile: 2, label: "Handicap 11–15" },
};

function DistanceTable({ rows, leftLabel }) {
  return (
    <div style={{ border: `1px solid ${BDR}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <div style={{ display: "flex", background: BG2, borderBottom: `1px solid ${BDR}` }}>
        <div style={{ flex: 1, padding: "10px 16px", fontFamily: SANS, fontSize: 12, fontWeight: 700, color: DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{leftLabel}</div>
        <div style={{ flex: 1, padding: "10px 16px", fontFamily: SANS, fontSize: 12, fontWeight: 700, color: DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>Typical Total Distance</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.bracket} style={{ display: "flex", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${BDR}` }}>
          <div style={{ flex: 1, padding: "10px 16px", fontFamily: SANS, fontSize: 14, color: TXT }}>{r.bracket}</div>
          <div style={{ flex: 1, padding: "10px 16px", fontFamily: SANS, fontSize: 14, color: ORG, fontWeight: 700 }}>{r.yards} yds</div>
        </div>
      ))}
    </div>
  );
}

function RankChip({ label, rank, total, percentile, sub, first }) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        minWidth: 140,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingLeft: first ? 0 : "1.25rem",
        borderLeft: first ? "none" : "1px solid rgba(255,0,144,0.2)",
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: "0.7rem", color: MUT, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: DISP, fontSize: "1.8rem", fontWeight: 900, color: ORG, letterSpacing: "-0.03em", lineHeight: 1 }}>#{rank}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ background: "rgba(255,0,144,0.16)", color: ORG, border: "1px solid rgba(255,0,144,0.3)", borderRadius: 20, padding: "3px 9px", fontFamily: SANS, fontSize: "0.68rem", fontWeight: 700 }}>Top {percentile}%</span>
        <span style={{ fontFamily: SANS, fontSize: "0.7rem", color: MUT }}>of {total.toLocaleString()}</span>
      </div>
      {sub && (
        <span style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: "3px 10px", fontFamily: SANS, fontSize: "0.68rem", fontWeight: 600 }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function RankPreviewStrip() {
  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 12 }}>
        Example — four ranks from one submitted drive
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
        <RankChip first label="Global Rank" rank={exampleRank.global.rank} total={exampleRank.global.total} percentile={exampleRank.global.percentile} />
        <RankChip
          label="Country Rank"
          rank={exampleRank.country.rank}
          total={exampleRank.country.total}
          percentile={exampleRank.country.percentile}
          sub={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <img src={`https://flagcdn.com/w40/${exampleRank.country.code}.png`} alt="" style={{ width: 16, height: 12, objectFit: "cover", borderRadius: 2 }} />
              {exampleRank.country.code.toUpperCase()}
            </span>
          }
        />
        <RankChip label="Age Group Rank" rank={exampleRank.age.rank} total={exampleRank.age.total} percentile={exampleRank.age.percentile} sub={exampleRank.age.label} />
        <RankChip label="Handicap Group Rank" rank={exampleRank.hcp.rank} total={exampleRank.hcp.total} percentile={exampleRank.hcp.percentile} sub={exampleRank.hcp.label} />
      </div>
    </div>
  );
}

function DashboardScreenshot() {
  // DASHBOARD SCREENSHOT: swap the placeholder below for a real cropped
  // screenshot of a registered profile's dashboard (rank strip + stat cards
  // section from dashboard.jsx) once you have one that isn't a test account.
  // Keeping this as a live-styled recreation (RankPreviewStrip above) means
  // the page never ships with fake "screenshot" imagery — if you'd rather
  // use an actual PNG, replace this block with:
  //   <img src="/average-drive/dashboard-preview.jpg" alt="Ripping Bombs dashboard showing global, country, age group, and handicap group rank" style={{ width: "100%", borderRadius: 12, border: `1px solid ${BDR}` }} />
  return <RankPreviewStrip />;
}

export default function AverageGolfDriveDistanceByAge() {
  return (
    <SeoPage
      title="Average Golf Drive Distance by Age & Handicap — Find Your Real Rank | Ripping Bombs"
      description="See average golf drive distances by age, handicap, and gender — then get your own global, country, age group, and handicap group rank by submitting a drive on Ripping Bombs."
    >
      <>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          Compare Your Distance
        </p>
        <SeoH1>Average Golf Drive Distance by Age &amp; Handicap</SeoH1>
        <SeoP>
          Every golfer wants to know the same thing: is my drive actually long, or does it just feel long? The honest
          answer depends on who you're comparing yourself to — a 25-year-old scratch golfer and a 60-year-old 20-handicapper
          are playing a different game off the tee. Here's roughly where amateur golfers land by age and handicap, and a way
          to get your own exact rank instead of just a bracket.
        </SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Average Driving Distance by Age</SeoH2>
        <SeoP>
          Distance peaks in your 20s and 30s and declines gradually from there — usually 10–15 yards per decade once you're
          past 40, with the steepest drop-off after 60. These are total distance (carry plus roll) for male amateurs; women's
          average distances typically run 25–30% shorter across the same age curve.
        </SeoP>
        <DistanceTable rows={AGE_DISTANCE} leftLabel="Age Bracket" />

        <SeoH2>Average Driving Distance by Handicap</SeoH2>
        <SeoP>
          Handicap tracks distance even more closely than age does — scratch golfers typically out-drive 28+ handicappers by
          70–80 yards, and the gap holds at almost every age.
        </SeoP>
        <DistanceTable rows={HCP_DISTANCE} leftLabel="Handicap Range" />

        <SeoP>
          These ranges are useful for a rough gut check, but a bracket isn't a rank. "215–230 yards for your 40s" doesn't
          tell you if you're near the top or bottom of that bracket, how you stack up against golfers in your own country,
          or where you'd land against your specific handicap band. That takes an actual leaderboard.
        </SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Get Your Actual Rank, Not Just a Bracket</SeoH2>
        <SeoP>
          Ripping Bombs turns one submitted drive into four separate ranks: where you sit globally, against golfers in your
          own country, against your age group, and against your handicap group. Every golfer who registers gets ranked —
          you don't need to be a long drive competitor, just curious.
        </SeoP>
        <DashboardScreenshot />

        <SeoH2 style={{ marginTop: 40 }}>How It Works</SeoH2>
        {[
          { num: "01", title: "Rip a drive", body: "Hit your best drive at a partner simulator, on Trackman, Foresight, Garmin, or any launch monitor — or your longest measured drive on the course." },
          { num: "02", title: "Upload the result", body: "Photograph the result screen (or your on-course measurement) and upload it. Takes about 15 seconds." },
          { num: "03", title: "Get ranked", body: "We verify the shot and slot it onto the leaderboard — global, country, age group, and handicap group, all at once." },
        ].map(({ num, title, body }) => (
          <div key={num} style={{ display: "flex", gap: 18, marginBottom: 20, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 800, color: ORG, fontSize: 12 }}>
              {num}
            </div>
            <div>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: TXT, marginBottom: 4, fontSize: 14 }}>{title}</p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}
        <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, marginTop: -4 }}>
          Full walkthrough with example photos: <Link href="/how-it-works" style={{ color: ORG, textDecoration: "none" }}>How It Works →</Link>
        </p>

        <SeoCTA />

        <SeoFaq
          title="FAQs"
          faqs={[
            { q: "What counts as a good driving distance for my age?", a: "It depends more on handicap than age alone — a 55-year-old scratch golfer will typically out-drive a 25-year-old 20-handicapper. That's why Ripping Bombs ranks you against both an age group and a handicap group separately, not just one bracket." },
            { q: "How do I compare my drive to other golfers, not just a chart?", a: "Register and submit a photo of your longest drive — from a simulator or a verified on-course measurement. You'll get a global rank, a country rank, an age group rank, and a handicap group rank, updated as more golfers submit." },
            { q: "Do I need to be a long drive competitor to get ranked?", a: "No. Every registered golfer gets ranked, regardless of skill level. The age group and handicap group ranks exist specifically so casual and high-handicap golfers have a meaningful comparison, not just a leaderboard full of long drive specialists." },
            { q: "Does it work if I don't have access to a simulator?", a: "Yes — outdoor course drives are accepted too, clearly labelled separately from simulator entries so the two are never mixed unfairly." },
            { q: "Is registering and getting ranked free?", a: "Yes, the global leaderboard and your personal rank are free. There are optional paid tiers for venues that want a TV display, but ranking yourself as a golfer costs nothing." },
          ]}
        />

        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Related Reading</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/how-it-works", label: "How It Works" },
              { href: "/enjoy-golf-when-you-cant-break-par", label: "Can't Break Par? Read This" },
              { href: "/simulator-golf-competition", label: "Simulator Golf Competition" },
              { href: "/trackman-long-drive", label: "Trackman Long Drive" },
              { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
              { href: "/golf-longest-drive-competition", label: "Run a Competition" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </>
    </SeoPage>
  );
}
