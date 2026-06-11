import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function SimulatorGolfCompetition() {
  return (
    <SeoPage
      title="Simulator Golf Competition — Run a Long Drive Contest on Any Launch Monitor | Ripping Bombs"
      description="How to run a golf long drive competition on a simulator. Compatible with Trackman, Foresight, Garmin, Bushnell, and more. Submit results to a global online leaderboard."
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Simulator Competitions</p>
        <SeoH1>Golf Long Drive Competitions on a Simulator</SeoH1>
        <SeoP>Indoor golf simulators have changed the game. With launch monitors now delivering data-accurate drive measurements, simulator long drive competitions are a legitimate — and increasingly popular — format. Here's how to run one, and how to put your results on the global map.</SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Why Simulator Competitions Work</SeoH2>
        <SeoP>The traditional long drive competition has one big constraint: you need a course, or at least a driving range. Simulator competitions remove that barrier entirely. Any facility with a launch monitor bay can run a properly tracked long drive contest — indoors, year-round, in any weather.</SeoP>
        <SeoP>Modern simulators produce carry distance measurements that are highly accurate and reproducible. Players hit under identical conditions, which in many ways makes the data more comparable than outdoor drives affected by wind, elevation, and firmness.</SeoP>

        <SeoH2>Compatible Launch Monitors</SeoH2>
        <SeoP>Ripping Bombs accepts simulator submissions from any major launch monitor platform. The submission requires a screenshot of the result as evidence. Widely used systems include:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginBottom: 24 }}>
          {["Trackman 4", "Foresight GCQuad", "Foresight GC3", "Garmin R10", "Bushnell Launch Pro", "FlightScope Mevo+", "SkyTrak", "Uneekor EYE XO", "Full Swing Kit", "Rapsodo MLM2Pro"].map((name) => (
            <div key={name} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 14px", color: TXT, fontFamily: SANS, fontSize: 13 }}>{name}</div>
          ))}
        </div>

        <SeoH2>How to Run a Simulator Long Drive Contest</SeoH2>
        {[
          { num: "01", title: "Set your conditions", body: "Agree on simulator settings before the contest starts: normal ball flight (no shot shape assist), outdoor conditions, flat lie. Standardise across all participants." },
          { num: "02", title: "Define the attempt format", body: "Typically 3–5 drives per participant with the longest counting. This gives players time to warm up within their attempts without inflating the session time." },
          { num: "03", title: "Screenshot every result", body: "Every attempt should be screenshotted on the launch monitor display showing the carry distance clearly. The winner's drive will need photo evidence for leaderboard submission." },
          { num: "04", title: "Run categories if possible", body: "Even with a small group, separating male and female participants — and optionally by handicap band — creates more winners and more reasons to participate." },
          { num: "05", title: "Submit to Ripping Bombs", body: "Register as a simulator account, upload the winning drive per category, and your results go live on the global leaderboard immediately." },
        ].map(({ num, title, body }) => (
          <div key={num} style={{ display: "flex", gap: 18, marginBottom: 20, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 800, color: ORG, fontSize: 12 }}>{num}</div>
            <div>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: TXT, marginBottom: 4, fontSize: 14 }}>{title}</p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}

        <SeoH2>Simulator vs Outdoor: How Results Are Shown</SeoH2>
        <SeoP>Ripping Bombs clearly distinguishes simulator entries from outdoor course drives with a visible badge on every listing. Simulator players compete on a level playing field with each other, while outdoor and indoor records can be compared side by side with full transparency.</SeoP>
        <SeoP>For facilities that run exclusively indoor events — including golf entertainment venues, indoor ranges, and home simulator setups — the simulator account type gives you a dedicated space on the leaderboard without any requirement for a physical golf club affiliation.</SeoP>

        <SeoH2>Simulator Account vs Club Account</SeoH2>
        {[
          { title: "Simulator Account", points: ["Auto-approved — no waiting for review", "One submission per week per account", "Labelled with simulator badge on leaderboard", "Ideal for individual users, home setups, or indoor venues"] },
          { title: "Club Account", points: ["Requires admin approval", "Unlimited submissions", "Submit drives for multiple named players", "Ideal for golf clubs running organised competitions"] },
        ].map(({ title, points }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "18px 22px", marginBottom: 14 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 10, fontSize: 14 }}>{title}</p>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {points.map((p) => <li key={p} style={{ color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 1.9 }}>{p}</li>)}
            </ul>
          </div>
        ))}

        <SeoCTA />

        <SeoH2>FAQs</SeoH2>
        {[
          { q: "Does the simulator setting matter?", a: "Yes. We recommend using standard outdoor conditions without any assisted ball flight. Using flat terrain with no wind assist produces the most comparable numbers across different systems and sessions." },
          { q: "What distance metric counts — carry or total?", a: "Carry distance is the standard for simulator submissions. If your launch monitor only shows total distance, include a note when submitting." },
          { q: "Can I enter as an individual, not a venue?", a: "Yes. Simulator accounts are available to individuals with home setups or personal launch monitors. You don't need to represent a business or venue." },
          { q: "Is there a minimum distance to appear on the leaderboard?", a: "No minimum. All verified submissions appear. The leaderboard is fully filtered so your submission will always find its relevant category and cohort." },
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
              { href: "/trackman-long-drive", label: "Trackman Long Drive" },
              { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
              { href: "/golf-long-drive-competition", label: "Run a Competition" },
              { href: "/long-drive-golf-equipment", label: "Long Drive Equipment" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </SeoPage>
  );
}
