import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function OnlineGolfLongDriveLeaderboard() {
  return (
    <SeoPage
      title="Online Golf Long Drive Leaderboard — Track & Compare Your Longest Drives | Ripping Bombs"
      description="The world's first online golf long drive leaderboard. Register your club, submit drives, and see how your biggest hitters rank against golfers worldwide."
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Global Leaderboard</p>
        <SeoH1>The Online Golf Long Drive Leaderboard</SeoH1>
        <SeoP>For the first time, golfers and clubs worldwide can submit their longest drives to a single, publicly visible leaderboard — filtered by category, country, handicap, age group, and more. This is Ripping Bombs.</SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Why a Global Long Drive Leaderboard?</SeoH2>
        <SeoP>Every golf club has its big hitters — players who leave the rest of the field 50 yards behind off the tee. Until now, those numbers lived on a whiteboard, a spreadsheet, or in conversation. There was no way to know how your club's longest driver stacked up against golfers in another country, or another continent.</SeoP>
        <SeoP>Ripping Bombs changes that. By aggregating verified drive submissions from clubs and simulators worldwide, we're building the first genuine global registry for the longest golf drives ever hit by amateur players.</SeoP>

        <SeoH2>How the Leaderboard Works</SeoH2>
        <SeoP>The Ripping Bombs leaderboard is live and updated in real time as clubs submit new drives. It has two primary views:</SeoP>
        {[
          { title: "Weekly Leaderboard", body: "Shows the best drive per category for the current ISO week. Resets each Monday so there's always a live competition running. Great for clubs that run regular events." },
          { title: "All-Time Records", body: "The permanent archive — every verified drive ever submitted, sorted by distance. Filter by gender, country, age group, handicap band, club brand, or entry type to find the relevant record for any cohort." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "18px 22px", marginBottom: 14 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 14 }}>{title}</p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}

        <SeoH2>Leaderboard Categories</SeoH2>
        <SeoP>Drives are automatically sorted into the following categories based on the data submitted:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
          {["Men (age 16–54, hcp < 20)", "Men High Handicap (hcp ≥ 20)", "Women (age 16–54, hcp < 20)", "Women High Handicap", "Youth (under 16)", "Seniors (55+)"].map((cat) => (
            <div key={cat} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 16px", color: TXT, fontFamily: SANS, fontSize: 13, lineHeight: 1.5 }}>{cat}</div>
          ))}
        </div>

        <SeoH2>What Counts as a Valid Submission?</SeoH2>
        <SeoP>To maintain the integrity of the leaderboard, all submissions require:</SeoP>
        <ul style={{ paddingLeft: 20, color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 2, marginBottom: 24 }}>
          <li>Submission via a registered club or simulator account</li>
          <li>Player name, distance, club used, handicap index, age, and gender</li>
          <li>Photo or screenshot evidence of the drive or launch monitor reading</li>
        </ul>
        <SeoP>All club account submissions go through a manual approval step before appearing on the public leaderboard. Simulator submissions with launch monitor screenshots are processed automatically.</SeoP>

        <SeoH2>Outdoor vs Simulator Drives</SeoH2>
        <SeoP>Both are welcome on Ripping Bombs. Outdoor course drives and indoor simulator drives are labelled clearly on the leaderboard so the distinction is always visible. All-time records show the best drive regardless of entry type by default, with filters available if you want to view each type separately.</SeoP>
        <SeoP>This inclusive approach means golfers who train primarily on Trackman, Foresight, or other launch monitor platforms can compete meaningfully — while course-based drives retain their own distinct identity.</SeoP>

        <SeoCTA />

        <SeoH2>FAQs</SeoH2>
        {[
          { q: "Is the leaderboard free to view?", a: "Yes — the Ripping Bombs leaderboard is publicly visible to anyone. No account required to browse results." },
          { q: "How often is the leaderboard updated?", a: "Continuously. New approved submissions appear immediately. The weekly leaderboard resets at the start of each ISO week (Monday 00:00 UTC)." },
          { q: "Can I share my leaderboard position?", a: "Yes — every drive entry has a unique shareable URL and a one-click option to generate a branded share card for WhatsApp, Facebook, or Instagram." },
          { q: "Is there a leaderboard for specific countries?", a: "You can filter the leaderboard by country. We also have dedicated pages for country-specific longest drive records including the UK, Australia, USA, Ireland, Canada, and more." },
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
              { href: "/leaderboard", label: "Live Leaderboard" },
              { href: "/golf-long-drive-competition", label: "Run a Long Drive Comp" },
              { href: "/simulator-golf-competition", label: "Simulator Competitions" },
              { href: "/longest-drive-uk", label: "Longest Drive UK" },
              { href: "/longest-drive-australia", label: "Longest Drive Australia" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </SeoPage>
  );
}
