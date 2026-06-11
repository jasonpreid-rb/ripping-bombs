import Head from "next/head";
import Link from "next/link";
import SeoPageLayout from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function TrackmanLongDrive() {
  return (
    <>
      <Head>
        <title>Trackman Long Drive — Data, Competitions & Leaderboard Submissions</title>
        <meta
          name="description"
          content="Use Trackman to measure your longest drive, run an indoor long drive competition, and submit your results to the Ripping Bombs global leaderboard. Everything you need to know."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.rippingbombs.com/trackman-long-drive" />
      </Head>

      <SeoPageLayout>
        <article style={{ color: TXT, fontFamily: SANS, maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

          {/* Hero */}
          <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Trackman & Launch Monitors
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            Trackman Long Drive: Measure, Compete & Register Your Best
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: MUT, marginBottom: 40 }}>
            Trackman is the gold standard in golf ball-flight measurement. Whether you use it at a teaching facility, a simulator bay, or on the range, it produces the most accurate carry and total distance numbers available. Here's how to use that data for competition — and how to put it on the record.
          </p>

          <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, marginBottom: 40 }} />

          {/* Section 1 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            What Does Trackman Measure?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Trackman uses dual-radar technology to track both the club head through impact and the full flight of the ball. For long drive purposes, the key metrics are:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { label: "Carry Distance", desc: "How far the ball travelled through the air — the primary metric for long drive." },
              { label: "Total Distance", desc: "Carry plus roll. Varies significantly by surface, so carry is more comparable across sessions." },
              { label: "Ball Speed", desc: "Exit velocity off the clubface. The single biggest driver of distance." },
              { label: "Smash Factor", desc: "Efficiency of strike. Ball speed ÷ club head speed. Max is ~1.50 for a driver." },
              { label: "Launch Angle", desc: "Optimal is approximately 10–15° for most golfers with a modern driver." },
              { label: "Spin Rate", desc: "Lower spin generally means more distance. Below 2,500 rpm is ideal for maximising carry." },
            ].map(({ label, desc }) => (
              <div key={label} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "16px" }}>
                <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, fontSize: 13, marginBottom: 6 }}>{label}</p>
                <p style={{ color: MUT, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Section 2 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            What's a Good Trackman Long Drive Number?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Trackman data gives us the most accurate benchmarks available for amateur golfers. Based on published data, typical carry distances by category are:
          </p>
          <div style={{ overflowX: "auto", marginBottom: 40 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BDR}` }}>
                  {["Category", "Average Carry", "Strong Amateur", "Elite Amateur"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: MUT, fontFamily: DISP, fontWeight: 600, fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Men (scratch)", "245–255 yds", "265–280 yds", "290–310 yds"],
                  ["Men (15 hcp)", "215–225 yds", "235–250 yds", "260–275 yds"],
                  ["Women (scratch)", "190–200 yds", "205–220 yds", "225–240 yds"],
                  ["Seniors (55+)", "210–220 yds", "230–245 yds", "255–270 yds"],
                  ["Juniors (15–18)", "205–220 yds", "235–255 yds", "265–285 yds"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BDR}`, background: i % 2 === 0 ? "transparent" : BG2 }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "12px 16px", color: j === 0 ? TXT : MUT }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40, fontSize: 14, fontStyle: "italic" }}>
            Note: These are carry distance benchmarks under Trackman conditions with normal ball flight settings and no wind assist.
          </p>

          {/* Section 3 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Running a Trackman Long Drive Competition
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Trackman sessions are an excellent format for long drive contests because conditions are identical for every participant. Recommended setup:
          </p>
          {[
            { title: "Standardise the environment", body: "Use 'Outdoor' ball flight mode, flat terrain, zero wind. These settings produce the most valid and repeatable distance numbers." },
            { title: "Give each player 5 attempts", body: "Best carry distance counts. 5 shots is enough to reward consistent striking without fatiguing the participant." },
            { title: "Screenshot every result", body: "Screenshot the Trackman display showing carry distance for the winning drive. This is required for Ripping Bombs submission." },
            { title: "Split into categories", body: "Even a small group benefits from male/female separation. Add handicap bands if you have enough participants." },
          ].map(({ title, body }) => (
            <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 15 }}>{title}</p>
              <p style={{ lineHeight: 1.7, color: MUT, margin: 0 }}>{body}</p>
            </div>
          ))}

          <div style={{ marginBottom: 40 }} />

          {/* Section 4 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Submitting a Trackman Drive to Ripping Bombs
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Ripping Bombs accepts Trackman drives as simulator submissions. The process:
          </p>
          <ol style={{ paddingLeft: 20, color: MUT, lineHeight: 2.2, marginBottom: 40 }}>
            <li>Register a simulator account at rippingbombs.com/register (instant approval)</li>
            <li>Hit your drives on Trackman and screenshot the best carry distance</li>
            <li>Go to rippingbombs.com/submit and fill in the drive details</li>
            <li>Upload your Trackman screenshot as evidence</li>
            <li>Your drive appears on the global leaderboard immediately</li>
          </ol>

          {/* CTA */}
          <div style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 28px", marginBottom: 40, textAlign: "center" }}>
            <h3 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>
              Put Your Trackman Drive on the Record
            </h3>
            <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
              Register a free simulator account and submit your best Trackman carry to the global long drive leaderboard.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
                Register Free
              </Link>
              <Link href="/submit" style={{ display: "inline-block", background: "transparent", color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none", border: `2px solid ${ORG}` }}>
                Submit a Drive
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>FAQs</h2>
          {[
            { q: "Does it have to be Trackman specifically?", a: "No — Ripping Bombs accepts simulator submissions from any major launch monitor including Foresight, Garmin R10, Bushnell Launch Pro, FlightScope Mevo+, SkyTrak, and others. Trackman is just the most common in professional and coaching environments." },
            { q: "Is Trackman indoor distance the same as outdoor?", a: "Trackman's outdoor simulation mode is calibrated to produce results consistent with real outdoor conditions. Carry distances are generally within a few yards of what you'd see on a calm day on the range." },
            { q: "Can I use ball flight aids or distance boosts?", a: "No. All Ripping Bombs submissions must use standard outdoor ball flight with no assisted corrections or distance enhancements. The screenshot must reflect unassisted carry distance." },
            { q: "What if I hit the drive at a golf academy or driving range?", a: "That's fine. Your submission location doesn't need to be your home simulator. As long as you have the screenshot and the drive is yours, it's valid." },
          ].map(({ q, a }) => (
            <div key={q} style={{ borderBottom: `1px solid ${BDR}`, paddingBottom: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{q}</p>
              <p style={{ color: MUT, lineHeight: 1.7, margin: 0 }}>{a}</p>
            </div>
          ))}

          {/* Internal links */}
          <div style={{ marginTop: 40 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Related Reading</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { href: "/simulator-golf-competition", label: "Simulator Competitions" },
                { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
                { href: "/average-driver-distance-by-handicap", label: "Distance by Handicap" },
                { href: "/long-drive-golf-equipment", label: "Long Drive Equipment" },
                { href: "/submit-your-longest-drive", label: "Submit Your Drive" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 14, textDecoration: "none", fontFamily: SANS }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </article>
      </SeoPageLayout>
    </>
  );
}
