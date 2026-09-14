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
      description="Run a longest drive competition at your club or simulator venue — any format, any day, any time period. Create it free on Ripping Bombs and let players compete on a live leaderboard."
    >
      <>
        <p style={{ color: ORG, fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Competition Guide</p>
        <SeoH1>Golf Longest Drive Competition — How They Work</SeoH1>
        <SeoP>A longest drive competition is one of golf's most popular and accessible side events — whoever hits the ball furthest wins. On Ripping Bombs, any club or simulator venue can create one in minutes: name it, set a time period, and let players compete on a live leaderboard. It can run for a single evening or the whole season — a Tuesday Night Longdrive Comp, a Mid-Week Challenge, a Youth Shootout, whatever fits your venue.</SeoP>

        <hr style={{ border: "none", borderTop: `1px solid ${BDR}`, margin: "32px 0" }} />

        <SeoH2>How It Works</SeoH2>
        <SeoTable headers={['Step', 'What Happens']} rows={[
          ['1. Create the competition', 'Give it a name, pick a start and end date — anything from one evening to an entire season'],
          ['2. Set the criteria (optional)', 'Restrict entry by age, gender, or handicap if you want a specific category — e.g. an under-16 event'],
          ['3. Share the link', 'Every competition gets its own shareable link and QR code for players to join'],
          ['4. Players submit drives', 'Entrants log their distance with a photo or screenshot as evidence'],
          ['5. Leaderboard runs itself', 'Rankings update live for the length of the competition — no spreadsheets, no manual tallying'],
        ]} />

        <SeoH2>Any Time Period, Any Day</SeoH2>
        <SeoP>A competition doesn't need to be a big annual event. It can be as small as a single recurring night or as large as a season-long championship. A few examples of what venues have set up:</SeoP>
        {[
          { title: "Tuesday Night Longdrive Comp", body: "A weekly evening competition that keeps a regular crowd coming back — new leaderboard, new winner, every week." },
          { title: "Mid-Week Challenge", body: "A short window — say Monday to Friday — to fill quieter weekday hours with a bit of friendly competition." },
          { title: "Youth Shootout", body: "Entry restricted by age, giving junior players their own leaderboard and their own bragging rights." },
          { title: "Seasonal Championship", body: "Runs for months, crowning one champion at the end — great for building a storyline over a full season." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "18px 22px", marginBottom: 14 }}>
            <p style={{ fontFamily: DISP, fontWeight: 700, color: ORG, marginBottom: 6, fontSize: 14 }}>{title}</p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}

        <SeoH2>Running It On A Simulator</SeoH2>
        <SeoP>Simulator venues are increasingly popular for longest drive events — especially in winter or for evening leagues. Ripping Bombs accepts submissions from any major launch monitor platform, evidenced by a screenshot of the result:</SeoP>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {["Trackman 4", "Foresight GCQuad/GC3", "Garmin R10", "Bushnell Launch Pro", "FlightScope Mevo+", "SkyTrak", "Uneekor EYE XO", "Full Swing Kit", "Rapsodo MLM2Pro"].map((name) => (
            <div key={name} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 8, padding: "12px 14px", color: TXT, fontFamily: SANS, fontSize: 13 }}>{name}</div>
          ))}
        </div>
        <SeoP>A named event with a deadline and a live leaderboard beats open bay time every time — it turns quiet hours into booked ones. Setup takes about five minutes: create the competition with dates and criteria, share the instant link and QR code, invite players by name or email, and the leaderboard runs itself from there.</SeoP>

        <SeoH2>Why Register On Ripping Bombs?</SeoH2>
        <SeoP>Registering your club or event on Ripping Bombs gives your longest drive competition a permanent home on the global leaderboard. Every result you submit appears alongside drives from clubs and venues worldwide — giving your players genuine bragging rights and your event lasting exposure beyond the day itself. Competitions don't need big prize pots to be popular; recognition often goes further than cash:</SeoP>
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
            { q: "What kind of competition can I create?", a: "Anything — a one-night event, a weekly recurring comp, a season-long championship, or a category-restricted event like a youth or seniors shootout. You choose the name, dates, and entry criteria." },
            { q: "Do I need special equipment to run a longest drive competition?", a: "No. A standard driver, a measuring tape or rangefinder, and a designated tee area is all you need outdoors. For simulator events, any major launch monitor (Trackman, Foresight, Garmin, Bushnell) produces valid distance data." },
            { q: "Can I run a longest drive competition indoors on a simulator?", a: "Absolutely. Simulator competitions are fully supported on Ripping Bombs. Results are tagged accordingly so outdoor and indoor records are clearly distinguished." },
            { q: "How do I register my club's competition results?", a: "Register your club on Ripping Bombs (it's free), get approved, and you can start creating competitions and submitting drives immediately." },
            { q: "What distance counts as a good longest drive?", a: "For male club golfers, anything over 280 yards is genuinely impressive. Elite amateurs regularly hit 310–330 yards. For women, 220+ yards is an excellent mark." },
          ]}
        />

        <SeoH2>Promoting Your Event</SeoH2>
        <SeoP>Adding your competition to Ripping Bombs gives it exposure beyond the day itself:</SeoP>
        <SeoTable headers={['Benefit', 'What It Means For Your Event']} rows={[
          ['Global Leaderboard Exposure', "Your event's longest drive appears on a worldwide leaderboard seen by golfers in 50+ countries"],
          ['Dedicated Event Page', 'A permanent URL for your competition — shareable on social media, WhatsApp, and email'],
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
