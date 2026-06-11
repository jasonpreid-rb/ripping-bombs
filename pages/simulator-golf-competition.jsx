import Head from "next/head";
import Link from "next/link";
import SeoPageLayout from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function SimulatorGolfCompetition() {
  return (
    <>
      <Head>
        <title>Simulator Golf Competition — Run a Long Drive Contest on Any Launch Monitor</title>
        <meta
          name="description"
          content="How to run a golf long drive competition on a simulator. Compatible with Trackman, Foresight, Garmin, Bushnell, and more. Submit results to a global online leaderboard."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.rippingbombs.com/simulator-golf-competition" />
      </Head>

      <SeoPageLayout>
        <article style={{ color: TXT, fontFamily: SANS, maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

          {/* Hero */}
          <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Simulator Competitions
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            Golf Long Drive Competitions on a Simulator
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: MUT, marginBottom: 40 }}>
            Indoor golf simulators have changed the game. With launch monitors now delivering data-accurate drive measurements, simulator long drive competitions are a legitimate — and increasingly popular — format. Here's how to run one, and how to put your results on the global map.
          </p>

          <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, marginBottom: 40 }} />

          {/* Section 1 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Why Simulator Competitions Work
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            The traditional long drive competition has one big constraint: you need a course, or at least a driving range. Simulator competitions remove that barrier entirely. Any facility with a launch monitor bay can run a properly tracked long drive contest — indoors, year-round, in any weather.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            Modern simulators produce carry distance measurements that are highly accurate and reproducible. Players hit under identical conditions, which in many ways makes the data more comparable than outdoor drives affected by wind, elevation, and firmness.
          </p>

          {/* Section 2 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Compatible Launch Monitors
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Ripping Bombs accepts simulator submissions from any major launch monitor platform. The submission requires a screenshot of the result as evidence. Widely used systems include:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[
              "Trackman 4",
              "Foresight GCQuad",
              "Foresight GC3",
              "Garmin R10",
              "Bushnell Launch Pro",
              "FlightScope Mevo+",
              "SkyTrak",
              "Uneekor EYE XO",
              "Full Swing Kit",
              "Rapsodo MLM2Pro",
            ].map((name) => (
              <div key={name} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 16px", color: TXT, fontSize: 14 }}>
                {name}
              </div>
            ))}
          </div>

          {/* Section 3 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            How to Run a Simulator Long Drive Contest
          </h2>
          {[
            { num: "01", title: "Set your conditions", body: "Agree on simulator settings before the contest starts: normal ball flight (no shot shape assist), outdoor conditions, flat lie. Standardise across all participants." },
            { num: "02", title: "Define the attempt format", body: "Typically 3–5 drives per participant with the longest counting. This gives players time to warm up within their attempts without inflating the session time too much." },
            { num: "03", title: "Screenshot every result", body: "Every attempt should be screenshotted on the launch monitor display showing the carry distance clearly. The winner's drive will need photo evidence for leaderboard submission." },
            { num: "04", title: "Run categories if possible", body: "Even with a small group, separating male and female participants — and optionally by handicap band — creates more winners and more reasons to participate." },
            { num: "05", title: "Submit to Ripping Bombs", body: "Register as a simulator account, upload the winning drive per category, and your results go live on the global leaderboard immediately." },
          ].map(({ num, title, body }) => (
            <div key={num} style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 44, height: 44, background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 800, color: ORG, fontSize: 13 }}>{num}</div>
              <div>
                <p style={{ fontFamily: DISP, fontWeight: 700, color: "#fff", marginBottom: 6, fontSize: 15 }}>{title}</p>
                <p style={{ lineHeight: 1.7, color: MUT, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 40 }} />

          {/* Section 4 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Simulator vs Outdoor: How Results Are Shown
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Ripping Bombs clearly distinguishes simulator entries from outdoor course drives with a visible badge on every listing. This means simulator players compete on a level playing field with each other, while outdoor and indoor records can be compared side by side with full transparency.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            For facilities that run exclusively indoor events — including golf entertainment venues, indoor ranges, and home simulator setups — the simulator account type gives you a dedicated space on the leaderboard without any requirement for a physical golf club affiliation.
          </p>

          {/* Section 5 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Simulator Account vs Club Account
          </h2>
          {[
            { title: "Simulator Account", points: ["Auto-approved — no waiting for review", "One submission per week per account", "Labelled with simulator badge on leaderboard", "Ideal for individual users, home setups, or indoor venues"] },
            { title: "Club Account", points: ["Requires admin approval", "Unlimited submissions", "Submit drives for multiple named players", "Ideal for golf clubs running organised competitions"] },
          ].map(({ title, points }) => (
            <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 10, fontSize: 15 }}>{title}</p>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {points.map((p) => <li key={p} style={{ color: MUT, lineHeight: 1.9, fontSize: 15 }}>{p}</li>)}
              </ul>
            </div>
          ))}

          <div style={{ marginBottom: 40 }} />

          {/* CTA */}
          <div style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 28px", marginBottom: 40, textAlign: "center" }}>
            <h3 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>
              Register a Simulator Account
            </h3>
            <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
              Free, instant approval. Start submitting simulator drives to the global leaderboard today.
            </p>
            <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Register Simulator Account
            </Link>
          </div>

          {/* FAQs */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>FAQs</h2>
          {[
            { q: "Does the simulator setting matter?", a: "Yes. We recommend using standard outdoor conditions without any assisted ball flight. Using flat terrain with no wind assist produces the most comparable numbers across different systems and sessions." },
            { q: "What distance metric counts — carry or total?", a: "Carry distance is the standard for simulator submissions. If your launch monitor only shows total distance, include a note when submitting." },
            { q: "Can I enter as an individual, not a venue?", a: "Yes. Simulator accounts are available to individuals with home setups or personal launch monitors. You don't need to represent a business or venue." },
            { q: "Is there a minimum distance to appear on the leaderboard?", a: "No minimum. All verified submissions appear. The leaderboard is fully filtered so your submission will always find its relevant category and cohort." },
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
                { href: "/trackman-long-drive", label: "Trackman Long Drive" },
                { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
                { href: "/golf-long-drive-competition", label: "Run a Competition" },
                { href: "/long-drive-golf-equipment", label: "Long Drive Equipment" },
                { href: "/register", label: "Register Now" },
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
