import Head from "next/head";
import Link from "next/link";
import SeoPageLayout from "../components/SeoPageLayout";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function SubmitYourLongestDrive() {
  return (
    <>
      <Head>
        <title>Submit Your Longest Drive — Register & Add Your Drive to the Global Leaderboard</title>
        <meta
          name="description"
          content="Ready to submit your longest golf drive? Register your club or simulator account and add your best drive to the Ripping Bombs global long drive leaderboard — free."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.rippingbombs.com/submit-your-longest-drive" />
      </Head>

      <SeoPageLayout>
        <article style={{ color: TXT, fontFamily: SANS, maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

          {/* Hero */}
          <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Submit a Drive
          </p>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            Submit Your Longest Drive to the Global Leaderboard
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: MUT, marginBottom: 32 }}>
            Ripping Bombs is the world's longest golf drive registry. Anyone can submit — golf clubs, simulator users, and individual players. Here's exactly how it works and what you need to get your drive on the record.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Register &amp; Submit Now
            </Link>
            <Link href="/leaderboard" style={{ display: "inline-block", background: "transparent", color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none", border: `2px solid ${ORG}` }}>
              View the Leaderboard
            </Link>
          </div>

          <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, marginBottom: 40 }} />

          {/* Section 1 — two account types */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Two Ways to Submit
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Choose the account type that matches how you play:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
            {[
              {
                type: "Club Account",
                ideal: "Golf clubs & tournaments",
                points: [
                  "Submit drives for multiple players",
                  "Full competition history for your club",
                  "Drives approved by Ripping Bombs admin",
                  "Unlimited submissions",
                  "Perfect for weekly club competitions",
                ],
                cta: { href: "/register", label: "Register a Club" },
              },
              {
                type: "Simulator Account",
                ideal: "Individuals & indoor venues",
                points: [
                  "Instant auto-approval",
                  "One submission per week",
                  "Requires launch monitor screenshot",
                  "Labelled with simulator badge",
                  "No golf club affiliation needed",
                ],
                cta: { href: "/register", label: "Register Simulator" },
              },
            ].map(({ type, ideal, points, cta }) => (
              <div key={type} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "24px", display: "flex", flexDirection: "column" }}>
                <p style={{ fontFamily: DISP, fontWeight: 800, color: "#fff", fontSize: 17, marginBottom: 4 }}>{type}</p>
                <p style={{ color: ORG, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{ideal}</p>
                <ul style={{ paddingLeft: 16, margin: 0, flex: 1 }}>
                  {points.map((p) => <li key={p} style={{ color: MUT, lineHeight: 1.9, fontSize: 14 }}>{p}</li>)}
                </ul>
                <Link href={cta.href} style={{ display: "block", marginTop: 20, textAlign: "center", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 8, textDecoration: "none" }}>
                  {cta.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Section 2 — step by step */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Step-by-Step: How to Submit
          </h2>
          {[
            { num: "01", title: "Register your account", body: "Go to rippingbombs.com/register and choose Club or Simulator. Fill in your details. Club accounts are reviewed and approved by our team. Simulator accounts are approved instantly." },
            { num: "02", title: "Log in to your dashboard", body: "Once approved, log in at rippingbombs.com/login. You'll see your club dashboard where existing submissions are listed." },
            { num: "03", title: "Go to Submit", body: "Navigate to rippingbombs.com/submit. Fill in the drive details: player name, distance, club used, handicap index, age, gender, tournament name (optional), and date." },
            { num: "04", title: "Upload photo evidence", body: "All submissions require a photo. For course drives, a photo of the ball position or a rangefinder reading works well. For simulator drives, screenshot your launch monitor display showing carry distance." },
            { num: "05", title: "Submit and check the leaderboard", body: "Hit Submit. Club account submissions go through an approval step and appear shortly after. Simulator submissions go live immediately. Then check the leaderboard to see where you rank." },
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

          {/* Section 3 — what's required */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            What Information Do I Need?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 16 }}>
            Each drive submission requires:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { label: "Player Name", note: "Full name" },
              { label: "Distance", note: "In yards" },
              { label: "Club Used", note: "Brand and model" },
              { label: "Handicap Index", note: "Current HCP" },
              { label: "Age", note: "Player's age" },
              { label: "Gender", note: "Male or female" },
              { label: "Date", note: "When the drive was hit" },
              { label: "Photo Evidence", note: "Required" },
            ].map(({ label, note }) => (
              <div key={label} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ fontFamily: DISP, fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 4 }}>{label}</p>
                <p style={{ color: MUT, fontSize: 13, margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>

          {/* Section 4 — leaderboard */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Where Will My Drive Appear?
          </h2>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Once approved, your drive appears on two places: the weekly leaderboard for the current ISO week (the competition resets every Monday), and the all-time leaderboard where it stays permanently.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 24 }}>
            Your drive is automatically sorted into the correct category based on the age, handicap, and gender data you submit — Men, Women, High Handicap, Seniors, or Youth. You don't need to choose a category manually.
          </p>
          <p style={{ lineHeight: 1.8, color: MUT, marginBottom: 40 }}>
            Every drive also gets a unique shareable link and a one-click share card you can post to WhatsApp, Facebook, or Instagram.
          </p>

          {/* CTA block */}
          <div style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 28px", marginBottom: 40, textAlign: "center" }}>
            <h3 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>
              Ready to Submit?
            </h3>
            <p style={{ color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
              Registration is free and takes under two minutes. Start building your club's record on the global leaderboard today.
            </p>
            <Link href="/register" style={{ display: "inline-block", background: ORG, color: "#000", fontFamily: DISP, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Register &amp; Submit Your Drive
            </Link>
          </div>

          {/* FAQs */}
          <h2 style={{ fontFamily: DISP, fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>FAQs</h2>
          {[
            { q: "Is it free to submit?", a: "Yes. Ripping Bombs is completely free for clubs and simulator users. Registration is free, submission is free, and viewing the leaderboard is free." },
            { q: "How long does approval take for club accounts?", a: "Club account applications are typically reviewed within 24–48 hours. Simulator accounts are approved instantly." },
            { q: "Can I submit drives from multiple players at my club?", a: "Yes. Club accounts can submit drives on behalf of any number of players. Each drive is tagged to the player by name." },
            { q: "What if I entered the wrong distance?", a: "Contact us via the contact page and we'll correct or remove the entry. All data is modifiable by our admin team." },
            { q: "Does the drive need to be hit recently?", a: "No strict recency requirement, but the date of the drive must be accurately recorded. Drives appear on the weekly leaderboard for the week in which they were hit." },
            { q: "Can individual players (not clubs) submit drives?", a: "Individual players should register a simulator account if they have a launch monitor. If you hit the drive on a course during an organised competition at a club, ask your club to register and submit on your behalf." },
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
                { href: "/register", label: "Register" },
                { href: "/online-golf-long-drive-leaderboard", label: "View Leaderboard" },
                { href: "/golf-long-drive-competition", label: "Run a Competition" },
                { href: "/simulator-golf-competition", label: "Simulator Competitions" },
                { href: "/trackman-long-drive", label: "Trackman Long Drive" },
                { href: "/how-to-register-page", label: "Registration Guide" },
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
