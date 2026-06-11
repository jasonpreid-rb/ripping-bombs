import Head from "next/head";
import Link from "next/link";
import SeoPageLayout from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function GolfLongDriveCompetition() {
  return (
    <>
      <Head>
        <title>Golf Long Drive Competition — How to Run One & Register Results</title>
        <meta
          name="description"
          content="Everything you need to know about running a golf long drive competition at your club — format, rules, prizes, and how to register your results on a global leaderboard."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.rippingbombs.com/golf-long-drive-competition" />
      </Head>

      <SeoPageLayout>
        <article style={{ color: TXT, fontFamily: SANS, maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

          {/* Hero */}
          <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Competition Guide
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            Golf Long Drive Competitions: The Complete Guide
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: MUT, marginBottom: 40 }}>
            A long drive competition is one of the most crowd-pleasing events you can run at a golf club. Simple to organise, exciting to watch, and guaranteed to bring out the big hitters. Here's everything you need to know — from format to results registration.
          </p>

          <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, marginBottom: 40 }} />

          {/* Section 1 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            What is a Golf Long Drive Competition?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            A long drive competition challenges golfers to hit the single longest drive they can on a designated hole or range bay. Unlike stroke play, there's no score to total — the winner is simply whoever hits it furthest. It can run as a standalone event, a competition-within-a-competition, or a fun fundraiser format alongside your normal club calendar.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            The format is universally understood, requires minimal marshalling, and generates genuine excitement — particularly when results are posted publicly and participants can compare against golfers worldwide.
          </p>

          {/* Section 2 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Competition Formats
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            There are several proven formats to choose from depending on your event size and goals:
          </p>

          {[
            { title: "Single Best Drive", body: "Each participant hits a set number of drives (typically 3–5) and their longest counts. Best for casual events and large groups — fast to run and easy to understand." },
            { title: "Category Leaderboard", body: "Divide participants by gender, age, or handicap band and award a winner per category. This levels the playing field and gives more players a shot at glory." },
            { title: "Live Knockout", body: "Bracket-style head-to-head rounds where the longer drive advances. Works brilliantly as a spectator format at club days and corporate events." },
            { title: "All-Day Qualifier", body: "Participants submit their best drive during a defined window — for example, the 10th tee across the competition day. No queue, no pressure, maximum participation." },
          ].map(({ title, body }) => (
            <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 15 }}>{title}</p>
              <p style={{ lineHeight: 1.7, color: MUT, margin: 0 }}>{body}</p>
            </div>
          ))}

          <div style={{ marginBottom: 40 }} />

          {/* Section 3 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Rules & Measurement
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Keep your rules clear and consistent before the event starts. A few standard decisions to make:
          </p>
          <ul style={{ paddingLeft: 20, color: MUT, lineHeight: 2, marginBottom: 40 }}>
            <li>Driver only, or any club? (Driver-only is the norm for long drive formats)</li>
            <li>Must the ball finish in bounds / in a defined landing zone?</li>
            <li>How is distance measured — laser rangefinder, GPS, or on-course markers?</li>
            <li>Are simulators / launch monitors permitted, and if so, on what settings?</li>
            <li>Do you require photo or video evidence of the drive?</li>
          </ul>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            Ripping Bombs requires a photo or screenshot as evidence with every submission to ensure leaderboard integrity. This simple step dramatically reduces disputes and keeps the data trustworthy.
          </p>

          {/* Section 4 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Categories to Consider
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Splitting entrants into categories massively increases engagement — more winners means more excitement. Consider:
          </p>
          <ul style={{ paddingLeft: 20, color: MUT, lineHeight: 2, marginBottom: 40 }}>
            <li>Men (open) — typically age 16–54, handicap under 20</li>
            <li>Men high handicap — handicap 20 and above</li>
            <li>Women (open)</li>
            <li>Women high handicap</li>
            <li>Seniors (55+)</li>
            <li>Youth / Juniors (under 16)</li>
          </ul>

          {/* Section 5 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Prizes & Incentives
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Long drive competitions don't need big prize pots to be popular. Recognition often goes further than cash. Some ideas that work well at club level:
          </p>
          <ul style={{ paddingLeft: 20, color: MUT, lineHeight: 2, marginBottom: 40 }}>
            <li>A perpetual trophy or honours board listing — golfers love permanent recognition</li>
            <li>Pro shop vouchers or club merchandise</li>
            <li>Nearest-to-the-pin experience or a lesson with the club pro</li>
            <li>A digital certificate and shareable leaderboard listing (we handle this)</li>
            <li>Bragging rights on the global Ripping Bombs leaderboard</li>
          </ul>

          {/* Section 6 — CTA */}
          <div style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 28px", marginBottom: 40, textAlign: "center" }}>
            <h3 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>
              Put Your Club on the Global Map
            </h3>
            <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
              Ripping Bombs is the world's longest golf drive registry. Register your club for free, run your competition, and submit your results to a live global leaderboard.
            </p>
            <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Register Your Club — Free
            </Link>
          </div>

          {/* Section 7 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            FAQs
          </h2>
          {[
            { q: "Do I need special equipment to run a long drive competition?", a: "No. A standard driver, a measuring tape or rangefinder, and a designated tee area is all you need. For simulator events, any major launch monitor (Trackman, Foresight, Garmin, Bushnell) produces valid distance data." },
            { q: "Can I run a long drive competition indoors on a simulator?", a: "Absolutely. Simulator competitions are fully supported on Ripping Bombs. Results are tagged accordingly on the leaderboard so outdoor and indoor records are clearly distinguished." },
            { q: "How do I register my club's competition results?", a: "Register your club on Ripping Bombs (it's free), get approved, and you can start submitting drives immediately. Each submission includes player name, distance, club used, handicap, age, and photo evidence." },
            { q: "What distance counts as a good long drive?", a: "For male club golfers, anything over 280 yards is genuinely impressive. Elite amateurs regularly hit 310–330 yards. For women, 220+ yards is an excellent mark. Seniors and juniors have their own leaderboard categories with appropriate context." },
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
                { href: "/golf-longest-drive-competition", label: "Longest Drive Competition" },
                { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
                { href: "/simulator-golf-competition", label: "Simulator Competitions" },
                { href: "/what-is-a-good-drive-in-golf", label: "What Is a Good Drive?" },
                { href: "/average-golf-drive-distance", label: "Average Drive Distance" },
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
