import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from "../components/SeoPageLayout";
import SeoFaq from "../components/SeoFaq";
import { SANS, DISP, ORG, TXT, MUT, DIM, BG2, BG3, BDR } from "../lib/constants";

/**
 * ENJOY GOLF WHEN YOU CAN'T BREAK PAR — "There's a scoreboard you CAN win"
 * Drop into: pages/enjoy-golf-when-you-cant-break-par.jsx
 *
 * Targets the "how to enjoy golf when you're not good at it" / "will I ever
 * break 100/90/80/par" search cluster — a large, well-established cluster of
 * mindset + stats content (NCGA, Bogeylicious, Golf Monthly, GolfSpy, etc.)
 * that all ends the same way: "play forward tees, lower expectations, focus
 * on fun." None of it offers an alternative scoreboard. That's the wedge:
 * score is nearly impossible to move for most golfers, but distance is
 * measurable, comparable, and — against the right peer group — genuinely
 * winnable. This page leans into the "you'll probably never break par"
 * reality on purpose, then pivots to the one leaderboard where that's not
 * the point.
 *
 * The percentages below are rounded, illustrative figures reflecting the
 * general pattern across commonly cited sources (NGF, USGA handicap data,
 * Shot Scope, MyGolfSpy) — those sources disagree with each other by a wide
 * margin at the "break 80" and "break par" end, so treat these as directional,
 * not authoritative, and don't attribute them to a single source.
 */

const SCORE_LADDER = [
  { label: "Break 100", pct: 55, width: "55%" },
  { label: "Break 90", pct: 25, width: "25%" },
  { label: "Break 80", pct: 10, width: "10%" },
  { label: "Break Par", pct: 1, width: "2%" },
];

// Example numbers for the rank preview — illustrative only, matches the
// real dashboard's peer-group band conventions (age band / handicap band).
const exampleRank = {
  global: { rank: 482, total: 6140, percentile: 8 },
  country: { rank: 34, total: 812, percentile: 4, code: "us" },
  age: { rank: 19, total: 940, percentile: 2, label: "Age 35–44" },
  hcp: { rank: 27, total: 1105, percentile: 2, label: "Handicap 18–24" },
};

function ScoreLadder() {
  return (
    <div style={{ border: `1px solid ${BDR}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      {SCORE_LADDER.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 16px",
            borderBottom: i === SCORE_LADDER.length - 1 ? "none" : `1px solid ${BDR}`,
            background: i % 2 === 0 ? "transparent" : BG2,
          }}
        >
          <div style={{ width: 92, flexShrink: 0, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: TXT }}>{row.label}</div>
          <div style={{ flex: 1, height: 10, background: BG3, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: row.width, height: "100%", background: ORG, borderRadius: 6 }} />
          </div>
          <div style={{ width: 56, flexShrink: 0, textAlign: "right", fontFamily: DISP, fontSize: 15, fontWeight: 800, color: ORG }}>~{row.pct}%</div>
        </div>
      ))}
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${BDR}`, background: BG2 }}>
        <span style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>Rough share of golfers who ever reach each milestone — every extra 10 strokes cuts the group by more than half.</span>
      </div>
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
        Example — one submitted drive, four ways to win
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

export default function EnjoyGolfWhenYouCantBreakPar() {
  return (
    <SeoPage
      title="Can't Break Par? Here's a Golf Scoreboard You Can Actually Win | Ripping Bombs"
      description="Score gets harder to move the better you get — most golfers never break 80, let alone par. Here's why, and a leaderboard where distance, not your scorecard, decides where you rank."
    >
      <>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          A Different Way to Win
        </p>
        <SeoH1>You'll Probably Never Break Par. Here's a Scoreboard You Can.</SeoH1>
        <SeoP>
          If you've spent a season chasing a lower score and ended up more frustrated than when you started, you're not
          doing it wrong — you're just playing the hardest version of the game there is. Breaking par is genuinely rare.
          Most golfers who play for decades never do it. That doesn't mean golf isn't worth it. It means score isn't the
          only scoreboard.
        </SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Why Par Feels Impossible — Because It Basically Is</SeoH2>
        <SeoP>
          Most golfers break 100 within a couple of seasons. Breaking 90 takes years for most. Breaking 80 puts you ahead
          of the vast majority of everyone who's ever picked up a club. And par? Depending on which study you look at,
          somewhere around 1 in 100 golfers — or fewer — ever shoots their own par, consistently, in their lifetime. Each
          milestone doesn't just get a little harder than the last one. It gets dramatically harder.
        </SeoP>
        <ScoreLadder />
        <SeoP>
          None of this is a reason to quit. It's just useful to know that if you feel stuck, you're not uniquely bad at
          golf — you're up against a curve that flattens out for almost everyone eventually. The good news is that
          shooting your best round ever was never the only way to walk off a course feeling like you won something.
        </SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Distance Doesn't Care About Your Scorecard</SeoH2>
        <SeoP>
          Your handicap punishes a bad back nine. Your longest drive doesn't. It's one swing, it's measurable, and unlike
          par, it's something you can compare fairly — against golfers your age, your gender, your handicap band, and
          your country, not just against the tour pros the word "par" was actually designed for.
        </SeoP>
        <SeoP>
          Ripping Bombs turns one submitted drive into four separate ranks, so a 20-handicapper who's never broken 100
          gets a leaderboard just as real as a scratch golfer's — global, country, age group, and handicap group, all at
          once. Everybody who registers gets ranked. Nobody gets left off because their score doesn't qualify.
        </SeoP>
        <RankPreviewStrip />

        <SeoH2 style={{ marginTop: 40 }}>How It Works</SeoH2>
        {[
          { num: "01", title: "Rip a drive", body: "Hit your best drive at a partner simulator — Trackman, Foresight, Garmin, or any launch monitor — or your longest measured drive on the course." },
          { num: "02", title: "Upload the result", body: "Photograph the result screen or your on-course measurement and upload it. Takes about 15 seconds, no handicap required." },
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
            { q: "What percentage of golfers actually break par?", a: "Estimates vary depending on the data source, but the pattern is consistent: it's a very small fraction, often cited as somewhere around 1% or less of all golfers. It's a realistic goal for very few people — not a sign anything is wrong with your game if you don't." },
            { q: "Is golf still worth playing if I never break 90?", a: "The vast majority of golfers who've played for years still haven't broken 90. Score is one measure of a round, not the only one — and it's not the only leaderboard available to you." },
            { q: "Do I need a low handicap to compete in a long drive leaderboard?", a: "No. Ripping Bombs ranks every registered golfer against a handicap group and an age group specifically so high-handicap and casual golfers have a fair comparison, not just a leaderboard full of scratch players." },
            { q: "I'm a beginner — can I still get ranked?", a: "Yes. There's no score or handicap requirement to register. One submitted drive gets you a global, country, age group, and handicap group rank." },
            { q: "What's a good way to make golf more fun if I'm stuck at the same score?", a: "Playing forward tees, playing formats like scramble or wolf, and setting non-score goals (like a personal-best drive) all help. Getting a genuine, fair comparison on something other than your scorecard — like your longest drive — is another way to have a measurable goal that isn't tied to breaking a plateau you've hit for years." },
          ]}
        />

        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Related Reading</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/average-golf-drive-distance-by-age", label: "Average Distance by Age & Handicap" },
              { href: "/golf-handicap-driving-distance", label: "Handicap & Driving Distance" },
              { href: "/longest-drive-high-handicap", label: "High Handicap Leaderboard" },
              { href: "/longest-drive-amateur", label: "Amateur Leaderboard" },
              { href: "/where-do-i-rank-globally", label: "Where Do I Rank Globally?" },
              { href: "/how-it-works", label: "How It Works" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </>
    </SeoPage>
  );
}
