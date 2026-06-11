import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function SubmitYourLongestDrive() {
  return (
    <SeoPage
      title="Submit Your Longest Drive — Register & Add Your Drive to the Global Leaderboard | Ripping Bombs"
      description="Ready to submit your longest golf drive? Register your club or simulator account and add your best drive to the Ripping Bombs global long drive leaderboard — free."
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Submit a Drive</p>
        <SeoH1>Submit Your Longest Drive to the Global Leaderboard</SeoH1>
        <SeoP>Ripping Bombs is the world's longest golf drive registry. Anyone can submit — golf clubs, simulator users, and individual players. Here's exactly how it works and what you need to get your drive on the record.</SeoP>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 14, padding: "13px 28px", borderRadius: 8, textDecoration: "none" }}>Register &amp; Submit Now</Link>
          <Link href="/leaderboard" style={{ display: "inline-block", background: "transparent", color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 14, padding: "13px 28px", borderRadius: 8, textDecoration: "none", border: `2px solid ${ORG}` }}>View the Leaderboard</Link>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>Two Ways to Submit</SeoH2>
        <SeoP>Choose the account type that matches how you play:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
          {[
            {
              type: "Club Account",
              ideal: "Golf clubs & tournaments",
              points: ["Submit drives for multiple players", "Full competition history for your club", "Drives reviewed before going live", "Unlimited submissions", "Perfect for weekly club competitions"],
              cta: "Register a Club",
            },
            {
              type: "Simulator Account",
              ideal: "Individuals & indoor venues",
              points: ["Instant auto-approval", "One submission per week", "Requires launch monitor screenshot", "Labelled with simulator badge", "No golf club affiliation needed"],
              cta: "Register Simulator",
            },
          ].map(({ type, ideal, points, cta }) => (
            <div key={type} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "20px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: DISP, fontWeight: 800, color: TXT, fontSize: 15, marginBottom: 4 }}>{type}</p>
              <p style={{ color: ORG, fontFamily: SANS, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{ideal}</p>
              <ul style={{ paddingLeft: 16, margin: 0, flex: 1 }}>
                {points.map((p) => <li key={p} style={{ color: MUT, fontFamily: SANS, lineHeight: 1.9, fontSize: 13 }}>{p}</li>)}
              </ul>
              <Link href="/register" style={{ display: "block", marginTop: 18, textAlign: "center", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 13, padding: "11px 0", borderRadius: 8, textDecoration: "none" }}>{cta}</Link>
            </div>
          ))}
        </div>

        <SeoH2>Step-by-Step: How to Submit</SeoH2>
        {[
          { num: "01", title: "Register your account", body: "Go to rippingbombs.com/register and choose Club or Simulator. Club accounts are reviewed and approved by our team. Simulator accounts are approved instantly." },
          { num: "02", title: "Log in to your dashboard", body: "Once approved, log in at rippingbombs.com/login. You'll see your club dashboard where existing submissions are listed." },
          { num: "03", title: "Go to Submit", body: "Navigate to rippingbombs.com/submit. Fill in the drive details: player name, distance, club used, handicap index, age, gender, tournament name (optional), and date." },
          { num: "04", title: "Upload photo evidence", body: "All submissions require a photo. For course drives, a photo of the ball position or a rangefinder reading works well. For simulator drives, screenshot your launch monitor display." },
          { num: "05", title: "Submit and check the leaderboard", body: "Hit Submit. Club submissions go through an approval step and appear shortly after. Simulator submissions go live immediately." },
        ].map(({ num, title, body }) => (
          <div key={num} style={{ display: "flex", gap: 18, marginBottom: 20, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 800, color: ORG, fontSize: 12 }}>{num}</div>
            <div>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: TXT, marginBottom: 4, fontSize: 14 }}>{title}</p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}

        <SeoH2>What Information Do I Need?</SeoH2>
        <SeoP>Each drive submission requires:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Player Name", note: "Full name" },
            { label: "Distance", note: "In yards" },
            { label: "Club Used", note: "Brand and model" },
            { label: "Handicap Index", note: "Current HCP" },
            { label: "Age", note: "Player's age" },
            { label: "Gender", note: "Male or female" },
            { label: "Date", note: "When the drive was hit" },
            { label: "Photo Evidence", note: "Required for all submissions" },
          ].map(({ label, note }) => (
            <div key={label} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 14px" }}>
              <p style={{ fontFamily: DISP, fontWeight: 700, color: TXT, fontSize: 13, marginBottom: 3 }}>{label}</p>
              <p style={{ color: MUT, fontFamily: SANS, fontSize: 12, margin: 0 }}>{note}</p>
            </div>
          ))}
        </div>

        <SeoH2>Where Will My Drive Appear?</SeoH2>
        <SeoP>Once approved, your drive appears on the weekly leaderboard for the current ISO week (which resets every Monday), and on the all-time leaderboard where it stays permanently.</SeoP>
        <SeoP>Your drive is automatically sorted into the correct category based on age, handicap, and gender — Men, Women, High Handicap, Seniors, or Youth. Every drive also gets a unique shareable link and a one-click share card for WhatsApp, Facebook, or Instagram.</SeoP>

        <SeoCTA />

        <SeoH2>FAQs</SeoH2>
        {[
          { q: "Is it free to submit?", a: "Yes. Ripping Bombs is completely free for clubs and simulator users. Registration, submission, and viewing the leaderboard are all free." },
          { q: "How long does approval take for club accounts?", a: "Club account applications are typically reviewed within 24–48 hours. Simulator accounts are approved instantly." },
          { q: "Can I submit drives from multiple players at my club?", a: "Yes. Club accounts can submit drives on behalf of any number of players. Each drive is tagged to the player by name." },
          { q: "What if I entered the wrong distance?", a: "Contact us via the contact page and we'll correct or remove the entry." },
          { q: "Does the drive need to be hit recently?", a: "No strict recency requirement, but the date of the drive must be accurately recorded. Drives appear on the weekly leaderboard for the week in which they were hit." },
          { q: "Can individual players (not clubs) submit drives?", a: "Individual players should register a simulator account if they have a launch monitor. For course drives, ask your club to register and submit on your behalf." },
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
              { href: "/register", label: "Register" },
              { href: "/online-golf-long-drive-leaderboard", label: "View Leaderboard" },
              { href: "/golf-long-drive-competition", label: "Run a Competition" },
              { href: "/simulator-golf-competition", label: "Simulator Competitions" },
              { href: "/trackman-long-drive", label: "Trackman Long Drive" },
              { href: "/how-to-register-page", label: "Registration Guide" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </SeoPage>
  );
}
