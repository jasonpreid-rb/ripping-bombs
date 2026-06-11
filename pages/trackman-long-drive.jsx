import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA, SeoTable } from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function TrackmanLongDrive() {
  return (
    <SeoPage
      title="Trackman Long Drive — Data, Competitions & Leaderboard Submissions | Ripping Bombs"
      description="Use Trackman to measure your longest drive, run an indoor long drive competition, and submit your results to the Ripping Bombs global leaderboard. Everything you need to know."
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Trackman & Launch Monitors</p>
        <SeoH1>Trackman Long Drive: Measure, Compete & Register Your Best</SeoH1>
        <SeoP>Trackman is the gold standard in golf ball-flight measurement. Whether you use it at a teaching facility, a simulator bay, or on the range, it produces the most accurate carry and total distance numbers available. Here's how to use that data for competition — and how to put it on the record.</SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>What Does Trackman Measure?</SeoH2>
        <SeoP>Trackman uses dual-radar technology to track both the club head through impact and the full flight of the ball. For long drive purposes, the key metrics are:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Carry Distance", desc: "How far the ball travelled through the air — the primary metric for long drive." },
            { label: "Total Distance", desc: "Carry plus roll. Varies significantly by surface, so carry is more comparable across sessions." },
            { label: "Ball Speed", desc: "Exit velocity off the clubface. The single biggest driver of distance." },
            { label: "Smash Factor", desc: "Ball speed divided by club head speed. Maximum is approximately 1.50 for a driver." },
            { label: "Launch Angle", desc: "Optimal is approximately 10–15 degrees for most golfers with a modern driver." },
            { label: "Spin Rate", desc: "Lower spin generally means more distance. Below 2,500 rpm is ideal for maximising carry." },
          ].map(({ label, desc }) => (
            <div key={label} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, fontSize: 12, marginBottom: 6 }}>{label}</p>
              <p style={{ color: MUT, fontFamily: SANS, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <SeoH2>What's a Good Trackman Long Drive Number?</SeoH2>
        <SeoP>Trackman data gives us the most accurate benchmarks available for amateur golfers. Typical carry distances by category:</SeoP>
        <SeoTable
          headers={["Category", "Average Carry", "Strong Amateur", "Elite Amateur"]}
          rows={[
            ["Men (scratch)", "245–255 yds", "265–280 yds", "290–310 yds"],
            ["Men (15 hcp)", "215–225 yds", "235–250 yds", "260–275 yds"],
            ["Women (scratch)", "190–200 yds", "205–220 yds", "225–240 yds"],
            ["Seniors (55+)", "210–220 yds", "230–245 yds", "255–270 yds"],
            ["Juniors (15–18)", "205–220 yds", "235–255 yds", "265–285 yds"],
          ]}
        />
        <SeoP>These are carry distance benchmarks under Trackman conditions with normal ball flight settings and no wind assist.</SeoP>

        <SeoH2>Running a Trackman Long Drive Competition</SeoH2>
        <SeoP>Trackman sessions are an excellent format for long drive contests because conditions are identical for every participant. Recommended setup:</SeoP>
        {[
          { title: "Standardise the environment", body: "Use Outdoor ball flight mode, flat terrain, zero wind. These settings produce the most valid and repeatable distance numbers." },
          { title: "Give each player 5 attempts", body: "Best carry distance counts. Five shots is enough to reward consistent striking without fatiguing the participant." },
          { title: "Screenshot every result", body: "Screenshot the Trackman display showing carry distance for the winning drive. This is required for Ripping Bombs submission." },
          { title: "Split into categories", body: "Even a small group benefits from male/female separation. Add handicap bands if you have enough participants." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "18px 22px", marginBottom: 14 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 14 }}>{title}</p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}

        <SeoH2>Submitting a Trackman Drive to Ripping Bombs</SeoH2>
        <SeoP>Ripping Bombs accepts Trackman drives as simulator submissions. The process:</SeoP>
        <ol style={{ paddingLeft: 20, color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 2.2, marginBottom: 24 }}>
          <li>Register a simulator account at rippingbombs.com/register (instant approval)</li>
          <li>Hit your drives on Trackman and screenshot the best carry distance</li>
          <li>Go to rippingbombs.com/submit and fill in the drive details</li>
          <li>Upload your Trackman screenshot as evidence</li>
          <li>Your drive appears on the global leaderboard immediately</li>
        </ol>

        <SeoCTA />

        <SeoH2>FAQs</SeoH2>
        {[
          { q: "Does it have to be Trackman specifically?", a: "No — Ripping Bombs accepts simulator submissions from any major launch monitor including Foresight, Garmin R10, Bushnell Launch Pro, FlightScope Mevo+, SkyTrak, and others. Trackman is just the most common in professional and coaching environments." },
          { q: "Is Trackman indoor distance the same as outdoor?", a: "Trackman's outdoor simulation mode is calibrated to produce results consistent with real outdoor conditions. Carry distances are generally within a few yards of what you'd see on a calm day on the range." },
          { q: "Can I use ball flight aids or distance boosts?", a: "No. All Ripping Bombs submissions must use standard outdoor ball flight with no assisted corrections or distance enhancements. The screenshot must reflect unassisted carry distance." },
          { q: "What if I hit the drive at a golf academy or driving range?", a: "That's fine. Your submission location doesn't need to be your home simulator. As long as you have the screenshot and the drive is yours, it's valid." },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: `1px solid ${BDR}`, paddingBottom: 18, marginBottom: 18 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: TXT, marginBottom: 6, fontSize: 14 }}>{q}</p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{a}</p>
          </div>
        ))}

        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Related Reading</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/simulator-golf-competition", label: "Simulator Competitions" },
              { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
              { href: "/average-driver-distance-by-handicap", label: "Distance by Handicap" },
              { href: "/long-drive-golf-equipment", label: "Long Drive Equipment" },
              { href: "/submit-your-longest-drive", label: "Submit Your Drive" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </SeoPage>
  );
}
