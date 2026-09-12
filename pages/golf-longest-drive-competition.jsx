import { useState } from "react";
import Link from "next/link";
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA, SeoTable } from "../components/SeoPageLayout";
import SeoFaq from "../components/SeoFaq";
import { SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR } from "../lib/constants";

export default function GolfLongestDriveCompetition() {
  const [form, setForm] = useState({ name: '', email: '', event: '', location: '', date: '' });
  const [status, setStatus] = useState(null);

  async function submitEventRequest() {
    if (!form.name || !form.email || !form.event) { setStatus('invalid'); return; }
    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          subject: `Event Registration Request: ${form.event}`,
          message: `A golfer has requested an event be added to Ripping Bombs:\n\nEvent: ${form.event}\nLocation: ${form.location || '—'}\nDate: ${form.date || '—'}\nSubmitted by: ${form.name}\nEmail: ${form.email}\n\nContact the organiser and invite them to register at https://www.rippingbombs.com`,
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <SeoPage
      title="Golf Longest Drive Competition Guide | Ripping Bombs"
      description="Everything you need to run a golf longest drive competition at your club — format, rules, prizes, and how to register results globally."
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

        <SeoH2>Setting Boundary Rules</SeoH2>
        <SeoP>The biggest source of disputes in a longest drive competition is boundary definition. Set these clearly before the first ball is hit:</SeoP>
        <SeoTable headers={['Rule Area', 'Recommended Approach']} rows={[
          ['Fairway boundaries', 'Mark with cones, rope, or spray paint — visible from the tee'],
          ['Must land in fairway', "The ball's first landing must be within the marked corridor"],
          ['Roll counts', 'Most competitions count final resting position, not carry — be explicit'],
          ['Measurement method', 'Tape measure from tee peg to ball position is standard'],
          ['Tie-break', 'Sudden death additional shots, or earliest submission in the day'],
        ]} />

        <SeoH2>Running It On A Simulator</SeoH2>
        <SeoP>Simulator venues are increasingly popular for longest drive events — especially in winter or for evening leagues. Ripping Bombs accepts submissions from any major launch monitor platform, evidenced by a screenshot of the result:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {["Trackman 4", "Foresight GCQuad/GC3", "Garmin R10", "Bushnell Launch Pro", "FlightScope Mevo+", "SkyTrak", "Uneekor EYE XO", "Full Swing Kit", "Rapsodo MLM2Pro"].map((name) => (
            <div key={name} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 14px", color: TXT, fontFamily: SANS, fontSize: 13 }}>{name}</div>
          ))}
        </div>
        <SeoP>A simulator/individual account is auto-approved instantly and limited to one submission per week — ideal for home setups and indoor venues. A club account requires admin approval but allows unlimited submissions for multiple named players, and is the better fit for clubs running organised competitions.</SeoP>

        <SeoH2>More Ideas To Make It Memorable</SeoH2>
        <SeoP>Run a seasonal leaderboard tracking longest drives at your club all year, and crown an annual champion — Ripping Bombs handles the ranking automatically. Or try a club record board: a permanent page showing your all-time longest drives, linkable from your own club website. A junior-vs-senior shootout is always a popular head-to-head format too.</SeoP>

        <SeoH2>Turn Empty Bays Into Bookings</SeoH2>
        <SeoP>
          For simulator venues specifically, a named event with a deadline and a live leaderboard beats open bay time every time. A weekday senior league, an after-school youth event, or an off-season sponsor challenge all turn dead hours into booked ones — and setup takes about five minutes: create the event with dates and criteria, share the instant link and QR code, invite players by name or email, and the leaderboard runs itself from there.
        </SeoP>

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

        <SeoH2>Promoting Your Event</SeoH2>
        <SeoP>Adding your competition to Ripping Bombs gives it exposure beyond the day itself:</SeoP>
        <SeoTable headers={['Benefit', 'What It Means For Your Event']} rows={[
          ['Global Leaderboard Exposure', "Your event's longest drive appears on a worldwide leaderboard seen by golfers in 50+ countries"],
          ['Dedicated Event Page', 'A permanent URL for your event — shareable on social media, WhatsApp, and email'],
          ['Google Indexed', 'Your event page is indexed by Google so players searching for events in your area can find you'],
          ['Player Engagement', "Participants can share their result directly from the leaderboard, extending your event's reach organically"],
          ["It's Free", 'No cost to register. No cost to submit results.'],
        ]} />

        <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '32px 28px', marginTop: 8, marginBottom: 40 }}>
          <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 6 }}>Request An Event</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 24 }}>Know of a golf event or club that should be on Ripping Bombs? Tell us about it and we'll contact the organisers directly.</div>
          {status === 'success'
            ? <div style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', padding: 16, fontFamily: SANS, fontSize: 13, color: ORG }}>✓ Request received! We'll reach out to the event organisers.</div>
            : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Your Name *', 'name', 'Your full name'], ['Your Email *', 'email', 'your@email.com'], ['Event / Club Name *', 'event', 'e.g. Wentworth Charity Classic'], ['Location', 'location', 'City, Country'], ['Event Date', 'date', '']].map(([label, key, placeholder]) => (
                <div key={key} style={{ gridColumn: key === 'event' ? '1/-1' : 'auto' }}>
                  <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>{label}</label>
                  <input type={key === 'date' ? 'date' : 'text'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                    style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 14px', color: TXT, fontFamily: SANS, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              {status === 'invalid' && <div style={{ gridColumn: '1/-1', fontFamily: SANS, fontSize: 11, color: '#f87171' }}>Please fill in all required fields</div>}
              <div style={{ gridColumn: '1/-1' }}>
                <button onClick={submitEventRequest} disabled={status === 'sending'} style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: '11px 28px', cursor: 'pointer', letterSpacing: .5, opacity: status === 'sending' ? .6 : 1 }}>
                  {status === 'sending' ? 'SENDING...' : 'SUBMIT REQUEST →'}
                </button>
              </div>
            </div>
          }
        </div>

        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: DISP, fontWeight: 700, color: MUT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Explore Related Pages</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/longest-drive-amateur", label: "Longest Drive Amateur" },
              { href: "/indoor-golf-league-ranking-system", label: "Indoor Golf League Ranking System" },
              { href: "/online-golf-long-drive-leaderboard", label: "Online Leaderboard" },
              { href: "/what-is-a-good-drive-in-golf", label: "What Is a Good Drive?" },
              { href: "/average-golf-drive-distance-by-age", label: "Average Drive Distance" },
              { href: "/club-and-simulator-venue-leaderboards", label: "Venue Leaderboards" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ background: BG2, color: ORG, border: `1px solid ${BDR}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS }}>{label}</Link>
            ))}
          </div>
        </div>
      </>
    </SeoPage>
  );
}
