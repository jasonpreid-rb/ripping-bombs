import Head from "next/head";
import Link from "next/link";
import SeoPageLayout from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function OnlineGolfLongDriveLeaderboard() {
  return (
    <>
      <Head>
        <title>Online Golf Long Drive Leaderboard — Track & Compare Your Longest Drives</title>
        <meta
          name="description"
          content="The world's first online golf long drive leaderboard. Register your club, submit drives, and see how your biggest hitters rank against golfers worldwide."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.rippingbombs.com/online-golf-long-drive-leaderboard" />
      </Head>

      <SeoPageLayout>
        <article style={{ color: TXT, fontFamily: SANS, maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

          {/* Hero */}
          <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Global Leaderboard
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            The Online Golf Long Drive Leaderboard
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: MUT, marginBottom: 40 }}>
            For the first time, golfers and clubs worldwide can submit their longest drives to a single, publicly visible leaderboard — filtered by category, country, handicap, age group, and more. This is Ripping Bombs.
          </p>

          <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, marginBottom: 40 }} />

          {/* Section 1 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Why a Global Long Drive Leaderboard?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Every golf club has its big hitters — players who leave the rest of the field 50 yards behind off the tee. Until now, those numbers lived on a whiteboard, a spreadsheet, or in conversation. There was no way to know how your club's longest driver stacked up against golfers in another country, or another continent.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            Ripping Bombs changes that. By aggregating verified drive submissions from clubs and simulators worldwide, we're building the first genuine global registry for the longest golf drives ever hit by amateur players.
          </p>

          {/* Section 2 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            How the Leaderboard Works
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            The Ripping Bombs leaderboard is live and updated in real time as clubs submit new drives. It has two primary views:
          </p>

          {[
            { title: "Weekly Leaderboard", body: "Shows the best drive per category for the current ISO week. Resets each Monday so there's always a live competition running. Great for clubs that run regular events." },
            { title: "All-Time Records", body: "The permanent archive — every verified drive ever submitted, sorted by distance. This is where records live. Filter by gender, country, age group, handicap band, club brand, or entry type to find the relevant record for any cohort." },
          ].map(({ title, body }) => (
            <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 15 }}>{title}</p>
              <p style={{ lineHeight: 1.7, color: MUT, margin: 0 }}>{body}</p>
            </div>
          ))}

          <div style={{ marginBottom: 40 }} />

          {/* Section 3 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Leaderboard Categories
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Drives are automatically sorted into the following categories based on the data submitted:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
            {["Men (age 16–54, hcp &lt; 20)", "Men High Handicap (hcp ≥ 20)", "Women (age 16–54, hcp &lt; 20)", "Women High Handicap", "Youth (under 16)", "Seniors (55+)"].map((cat) => (
              <div key={cat} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "14px 16px", color: TXT, fontSize: 14, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: cat }} />
            ))}
          </div>

          {/* Section 4 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            What Counts as a Valid Submission?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            To maintain the integrity of the leaderboard, all submissions require:
          </p>
          <ul style={{ paddingLeft: 20, color: MUT, lineHeight: 2, marginBottom: 24 }}>
            <li>Submission via a registered club or simulator account</li>
            <li>Player name, distance, club used, handicap index, age, and gender</li>
            <li>Photo or screenshot evidence of the drive or launch monitor reading</li>
          </ul>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            All club account submissions go through a manual approval step before appearing on the public leaderboard. Simulator submissions (with launch monitor screenshots) are processed automatically.
          </p>

          {/* Section 5 */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Outdoor vs Simulator Drives
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Both are welcome on Ripping Bombs. Outdoor course drives and indoor simulator drives are labelled clearly on the leaderboard so the distinction is always visible. All-time records show the best drive regardless of entry type by default, with filters available if you want to view each type separately.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            This inclusive approach means golfers who train primarily on Trackman, Foresight, or other launch monitor platforms can compete meaningfully — while course-based drives retain their own distinct identity.
          </p>

          {/* CTA */}
          <div style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 28px", marginBottom: 40, textAlign: "center" }}>
            <h3 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>
              See the Live Leaderboard
            </h3>
            <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
              Browse current weekly leaders and all-time records across every category — or register your club to start submitting.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/leaderboard" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
                View Leaderboard
              </Link>
              <Link href="/register" style={{ display: "inline-block", background: "transparent", color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none", border: `2px solid ${ORG}` }}>
                Register Your Club
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            FAQs
          </h2>
          {[
            { q: "Is the leaderboard free to view?", a: "Yes — the Ripping Bombs leaderboard is publicly visible to anyone. No account required to browse results." },
            { q: "How often is the leaderboard updated?", a: "Continuously. New approved submissions appear immediately. The weekly leaderboard resets at the start of each ISO week (Monday 00:00 UTC)." },
            { q: "Can I share my leaderboard position?", a: "Yes — every drive entry has a unique shareable URL and a one-click option to generate a branded share card for WhatsApp, Facebook, or Instagram." },
            { q: "Is there a leaderboard for specific countries?", a: "You can filter the leaderboard by country. We also have dedicated SEO pages for country-specific longest drive records including the UK, Australia, USA, Ireland, Canada, and more." },
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
                { href: "/leaderboard", label: "Live Leaderboard" },
                { href: "/golf-long-drive-competition", label: "Run a Long Drive Comp" },
                { href: "/simulator-golf-competition", label: "Simulator Competitions" },
                { href: "/longest-drive-uk", label: "Longest Drive UK" },
                { href: "/longest-drive-australia", label: "Longest Drive Australia" },
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
