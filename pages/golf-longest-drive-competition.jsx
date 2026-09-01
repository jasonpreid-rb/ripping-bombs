import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA, SeoTable } from "../components/SeoPageLayout";
import SeoFaq from "../components/SeoFaq";
import { SANS, DISP, ORG, TXT, MUT, BG2, BDR } from "../lib/constants";

export default function GolfLongestDriveCompetition() {
  return (
    <SeoPage
      title="Golf Longest Drive Competition — How to Run One & Register Results | Ripping Bombs"
      description="Everything you need to know about running a golf longest drive competition at your club — format, rules, prizes, and how to register your results on a global leaderboard."
    >
      <>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Competition Guide</p>
        <SeoH1>Golf Longest Drive Competition — How They Work</SeoH1>
        <SeoP>The longest drive competition is one of golf's most popular and accessible side events. Whether it's run on a par-5 during a club day or as a standalone contest, the format is simple: whoever hits the ball furthest wins. Here's everything you need to know — from format to results registration.</SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>What Is A Longest Drive Competition?</SeoH2>
        <SeoP>A longest drive competition asks players to hit one or more drives from a designated tee box, with the furthest ball landing in a defined fairway area declared the winner. It can run as a standalone event, a competition-within-a-competition on club day, or a fundraiser format — and generates genuine excitement, particularly when results are posted publicly and participants can compare against golfers worldwide.</SeoP>

        <SeoH2>Step-By-Step: Running The Competition</SeoH2>
        <SeoTable headers={['Step', 'What To Do']} rows={[
          ['1. Choose a hole', 'Pick a straight par-4 or par-5 with a wide fairway and clear landing zone'],
          ['2. Set boundaries', 'Mark the fairway edges with cones or rope — drives must land in bounds to count'],
          ['3. Allocate shots', 'Give each player 1–3 attempts depending on format and time available'],
          ['4. Mark each drive', 'Use a tee peg or marker at the landing spot of each drive'],
          ['5. Measure the winner', 'Measure from the tee to the furthest marker in the fairway'],
          ['6. Record the result', 'Note the distance, player name, club used and handicap'],
          ['7. Submit to Ripping Bombs', 'Register free and submit the result to the global leaderboard'],
        ]} />

        <SeoH2>Competition Formats</SeoH2>
        <SeoP>Beyond the single-hole classic, there are several proven formats depending on your event size and goals:</SeoP>
        {[
          { title: "Single Best Drive", body: "Each participant hits a set number of drives (typically 3–5) and their longest counts. Best for casual events and large groups — fast to run and easy to understand." },
          { title: "Category Leaderboard", body: "Divide participants by gender, age, or handicap band and award a winner per category. This levels the playing field and gives more players a shot at glory." },
          { title: "Live Knockout", body: "Bracket-style head-to-head rounds where the longer drive advances. Works brilliantly as a spectator format at club days and corporate events." },
          { title: "All-Day Qualifier", body: "Participants submit their best drive during a defined window — for example, the 10th tee across the competition day. No queue, no pressure, maximum participation." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "18px 22px", marginBottom: 14 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 14 }}>{title}</p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}

        <SeoH2>Rules & Measurement</SeoH2>
        <SeoP>Keep your rules clear and consistent before the event starts. A few standard decisions to make:</SeoP>
        <ul style={{ paddingLeft: 20, color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 2, marginBottom: 24 }}>
          <li>Driver only, or any club? (Driver-only is the norm for long drive formats)</li>
          <li>Must the ball finish in bounds or in a defined landing zone?</li>
          <li>How is distance measured — laser rangefinder, GPS, or on-course markers?</li>
          <li>Are simulators / launch monitors permitted, and if so, on what settings?</li>
          <li>Do you require photo or video evidence of the drive?</li>
        </ul>
        <SeoP>Ripping Bombs requires a photo or screenshot as evidence with every submission to ensure leaderboard integrity. This simple step dramatically reduces disputes and keeps the data trustworthy.</SeoP>

        <SeoH2>Categories to Consider</SeoH2>
        <SeoP>Splitting entrants into categories massively increases engagement — more winners means more excitement. Consider:</SeoP>
        <ul style={{ paddingLeft: 20, color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 2, marginBottom: 24 }}>
          <li>Men (open) — typically age 16–54, handicap under 20</li>
          <li>Men high handicap — handicap 20 and above</li>
          <li>Women (open)</li>
          <li>Women high handicap</li>
          <li>Seniors (55+)</li>
          <li>Youth / Juniors (under 16)</li>
        </ul>

        <SeoH2>Why Register On Ripping Bombs?</SeoH2>
        <SeoP>Registering your club or event on Ripping Bombs gives your longest drive competition a permanent home on the global leaderboard. Every result you submit appears alongside drives from clubs and tournaments worldwide — giving your players genuine bragging rights and your event lasting exposure beyond the day itself. Long drive competitions don't need big prize pots to be popular; recognition often goes further than cash:</SeoP>
        <ul style={{ paddingLeft: 20, color: MUT, fontFamily: SANS, fontSize: 14, lineHeight: 2, marginBottom: 24 }}>
          <li>A perpetual trophy or honours board listing</li>
          <li>Pro shop vouchers or club merchandise</li>
          <li>A lesson with the club pro</li>
          <li>A digital certificate and shareable leaderboard listing</li>
          <li>Bragging rights on the global Ripping Bombs leaderboard</li>
        </ul>

        <SeoCTA />

        <SeoFaq
          title="FAQs"
          faqs={[
            { q: "Do I need special equipment to run a longest drive competition?", a: "No. A standard driver, a measuring tape or rangefinder, and a designated tee area is all you need. For simulator events, any major launch monitor (Trackman, Foresight, Garmin, Bushnell) produces valid distance data." },
            { q: "Can I run a longest drive competition indoors on a simulator?", a: "Absolutely. Simulator competitions are fully supported on Ripping Bombs. Results are tagged accordingly on the leaderboard so outdoor and indoor records are clearly distinguished." },
            { q: "How do I register my club's competition results?", a: "Register your club on Ripping Bombs (it's free), get approved, and you can start submitting drives immediately." },
            { q: "What distance counts as a good longest drive?", a: "For male club golfers, anything over 280 yards is genuinely impressive. Elite amateurs regularly hit 310–330 yards. For women, 220+ yards is an excellent mark." },
          ]}
        />

        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Explore Related Pages</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/golf-club-longest-drive-competition-ideas", label: "Competition Ideas" },
              { href: "/how-to-promote-your-golf-event", label: "Promote Your Event" },
              { href: "/longest-drive-amateur", label: "Longest Drive Amateur" },
              { href: "/simulator-golf-league", label: "Simulator Golf League" },
              { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
              { href: "/simulator-golf-competition", label: "Simulator Competitions" },
              { href: "/what-is-a-good-drive-in-golf", label: "What Is a Good Drive?" },
              { href: "/average-golf-drive-distance", label: "Average Drive Distance" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </>
    </SeoPage>
  );
}
