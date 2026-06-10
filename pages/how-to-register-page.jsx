import Link from 'next/link'

export const metadata = {
  title: 'How to Register & Submit Your Drive | Ripping Bombs',
  description:
    'Join the world\'s largest amateur long drive registry. Register your club or simulator, submit your longest drive, and appear on the global leaderboard in minutes.',
}

const steps = [
  {
    num: 1,
    done: true,
    tag: { label: 'Free', cls: 'tagFree' },
    title: 'Create Your Account',
    desc: "Head to rippingbombs.com and click Register. You'll need a valid email address. No credit card, no subscription — the registry is completely free to use.",
    note: (
      <>
        <strong style={{ color: '#a3e635' }}>Club managers:</strong> select &ldquo;Golf Club / Venue&rdquo; during
        registration to unlock the club dashboard and member submission tools.
      </>
    ),
    reqs: null,
    lastStep: false,
  },
  {
    num: 2,
    done: false,
    tag: { label: 'Required', cls: 'tagRequired' },
    title: 'Register Your Club or Simulator',
    desc: 'Golf clubs must be registered before drives can be submitted against them. This takes about 2 minutes — just enter your club name, country, and a contact name. Simulator users register their setup (hardware type, software version) instead.',
    note: null,
    reqs: {
      heading: "What you'll need",
      items: [
        'Club name and country (or simulator make and model)',
        'Approximate GPS location or city',
        'Contact name for the submission',
        'For simulators: launch monitor type (Trackman, GCQuad, Foresight, etc.)',
      ],
    },
    lastStep: false,
  },
  {
    num: 3,
    done: false,
    tag: { label: 'Required', cls: 'tagRequired' },
    title: 'Record Your Drive',
    desc: 'Hit your driver on a real course or range. Your distance must be measured by a recognised method — GPS, laser rangefinder, official measuring wheel, or launch monitor. All distances are recorded in metres (we convert to yards automatically).',
    note: (
      <>
        <strong style={{ color: '#a3e635' }}>What counts:</strong> carry distance on a driving range, total distance on
        a course, or simulated carry on a calibrated launch monitor. Wind-assisted drives are welcome but tagged
        separately.
      </>
    ),
    reqs: null,
    lastStep: false,
  },
  {
    num: 4,
    done: false,
    tag: { label: 'Required', cls: 'tagRequired' },
    title: 'Submit Your Entry',
    desc: 'Log in and click &ldquo;Submit Drive.&rdquo; Enter the distance, date, location, and measurement method. If you beat a previous entry, your personal best updates automatically on the leaderboard.',
    note: null,
    reqs: {
      heading: 'Required for every submission',
      items: [
        'Distance in metres (yards also accepted)',
        'Date of drive',
        'Club or simulator name it was submitted under',
        'Measurement method',
        "Player's full name (or anonymised initials if preferred)",
      ],
    },
    lastStep: false,
  },
  {
    num: 5,
    done: false,
    tag: { label: 'Optional for some', cls: 'tagOptional' },
    title: 'Verification (Simulator Users)',
    desc: 'Outdoor drives are accepted on an honour system. Simulator users are asked to provide a screenshot of their launch monitor data showing the carry distance. This keeps simulator rankings credible and comparable worldwide.',
    note: (
      <>
        <strong style={{ color: '#a3e635' }}>Accepted screenshot formats:</strong> Trackman PDF export, GCQuad session
        summary, Foresight screenshot, or equivalent. Your data is stored privately — only the distance is displayed
        publicly.
      </>
    ),
    reqs: null,
    lastStep: false,
  },
  {
    num: 6,
    done: false,
    tag: { label: 'Done', cls: 'tagFree' },
    title: "You're on the Board",
    desc: 'Once approved (usually within 24 hours), your drive appears on the global leaderboard, your country leaderboard, and the relevant age group ranking. Share your ranking card directly from your profile.',
    note: (
      <>
        <strong style={{ color: '#a3e635' }}>Weekly entries:</strong> Submit every week to accumulate season points.
        The more you compete, the higher your{' '}
        <Link href="/2027-championship" style={{ color: '#a3e635' }}>
          Championship ranking
        </Link>
        .
      </>
    ),
    reqs: null,
    lastStep: true,
  },
]

const faqs = [
  {
    q: 'Do I need a golf handicap to register?',
    a: 'No. Ripping Bombs is open to all amateur golfers regardless of handicap, age, or skill level. If you can swing a driver, you can compete.',
  },
  {
    q: 'What if I beat my personal best drive?',
    a: 'Your leaderboard position automatically updates to reflect your new best. Your old drive stays in your history, but only your personal best counts for rankings.',
  },
  {
    q: 'Can I submit multiple drives per week?',
    a: 'Yes — but only your best drive of the week counts toward your weekly points total. Submitting often means more chances to post a season-best.',
  },
  {
    q: 'Is simulator distance the same as outdoor distance?',
    a: (
      <>
        Simulator drives are ranked separately to outdoor drives to keep comparisons fair. Carry distance from a
        calibrated launch monitor is accepted. See the full explanation on our{' '}
        <Link href="/how-simulator-verification-works" style={{ color: '#a3e635' }}>
          Simulator Verification
        </Link>{' '}
        page.
      </>
    ),
  },
  {
    q: 'How long does approval take?',
    a: "Most submissions are approved within 24 hours. During busy periods it may take up to 48 hours. You'll receive an email notification when your drive goes live.",
  },
]

export default function HowToRegisterPage() {
  return (
    <>
      <style>{`
        .htr-hero {
          padding: 72px 24px 56px;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .htr-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a3e635;
          margin-bottom: 16px;
        }
        .htr-h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: clamp(42px, 7vw, 72px);
          line-height: 0.95;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          margin-bottom: 20px;
          color: #f0f0f0;
        }
        .htr-h1 em {
          font-style: normal;
          color: #a3e635;
        }
        .htr-hero p {
          font-size: 17px;
          color: #aaa;
          max-width: 520px;
          margin: 0 auto 32px;
        }
        .htr-time {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 13px;
          color: #888;
        }
        .htr-time span { color: #a3e635; font-weight: 600; }

        .htr-path-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 64px;
        }
        .htr-path-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888;
          text-align: center;
          margin-bottom: 16px;
        }
        .htr-path-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          background: #2a2a2a;
          border-radius: 4px;
          overflow: hidden;
        }
        .htr-path-card {
          background: #1a1a1a;
          padding: 28px 24px;
        }
        .htr-path-card-active {
          background: #1a2200;
        }
        .htr-path-icon { font-size: 28px; margin-bottom: 10px; }
        .htr-path-card h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 20px;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: #f0f0f0;
        }
        .htr-path-card-active h3 { color: #a3e635; }
        .htr-path-card p { font-size: 14px; color: #888; }

        .htr-steps-section {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .htr-steps-header {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 32px;
          padding-bottom: 12px;
          border-bottom: 1px solid #2a2a2a;
        }
        .htr-step {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 0 20px;
          position: relative;
        }
        .htr-step-num-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .htr-step-num {
          width: 48px;
          height: 48px;
          background: #1a1a1a;
          border: 2px solid #2a2a2a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 18px;
          color: #a3e635;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .htr-step-num-done {
          background: #1a2200;
          border-color: #a3e635;
        }
        .htr-step-line {
          width: 2px;
          flex: 1;
          background: #2e2e2e;
          min-height: 24px;
        }
        .htr-step-body {
          padding-bottom: 40px;
          padding-top: 10px;
        }
        .htr-step-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 22px;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #f0f0f0;
        }
        .htr-step-desc {
          font-size: 15px;
          color: #bbb;
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .htr-step-note {
          background: #1a1a1a;
          border-left: 3px solid #a3e635;
          padding: 12px 16px;
          font-size: 14px;
          color: #aaa;
          border-radius: 0 2px 2px 0;
        }
        .htr-step-tag {
          display: inline-block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
          margin-bottom: 10px;
        }
        .htr-tag-free { background: #1a2200; color: #a3e635; }
        .htr-tag-required { background: #2a1a00; color: #f59e0b; }
        .htr-tag-optional { background: #1a1a2a; color: #818cf8; }

        .htr-req-box {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 20px;
          margin-top: 16px;
        }
        .htr-req-box h4 {
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
          margin-bottom: 12px;
        }
        .htr-req-list { list-style: none; padding: 0; margin: 0; }
        .htr-req-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #ccc;
          padding: 6px 0;
          border-bottom: 1px solid #2a2a2a;
        }
        .htr-req-list li:last-child { border-bottom: none; }
        .htr-req-arrow { color: #a3e635; font-size: 12px; margin-top: 2px; flex-shrink: 0; }

        .htr-faq-section {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .htr-faq-section h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 28px;
          text-transform: uppercase;
          margin-bottom: 24px;
          color: #f0f0f0;
        }
        .htr-faq-item { border-bottom: 1px solid #2a2a2a; padding: 18px 0; }
        .htr-faq-q {
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
          color: #f0f0f0;
        }
        .htr-faq-a { font-size: 14px; color: #aaa; line-height: 1.6; }

        .htr-cta {
          background: #0e1800;
          border-top: 1px solid #1e3000;
          border-bottom: 1px solid #1e3000;
          padding: 64px 24px;
          text-align: center;
        }
        .htr-cta h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: clamp(36px, 6vw, 56px);
          text-transform: uppercase;
          line-height: 0.95;
          margin-bottom: 16px;
          color: #f0f0f0;
        }
        .htr-cta h2 em { font-style: normal; color: #a3e635; }
        .htr-cta p { color: #888; font-size: 15px; margin-bottom: 28px; }
        .htr-btn-primary {
          display: inline-block;
          background: #a3e635;
          color: #000;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 14px 36px;
          border-radius: 2px;
        }
        .htr-btn-secondary {
          display: inline-block;
          border: 1px solid #2a2a2a;
          color: #ccc;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 13px 28px;
          border-radius: 2px;
          margin-left: 12px;
        }

        @media (max-width: 600px) {
          .htr-path-grid { grid-template-columns: 1fr; }
          .htr-btn-secondary { margin-left: 0; margin-top: 10px; display: block; }
          .htr-h1 { font-size: 48px; }
        }
      `}</style>

      {/* HERO */}
      <section className="htr-hero">
        <div className="htr-eyebrow">Getting Started</div>
        <h1 className="htr-h1">
          Register &amp; Submit
          <br />
          <em>Your Drive</em>
        </h1>
        <p>From sign-up to leaderboard in under 10 minutes. No handicap required. No green fees. Just your biggest hit.</p>
        <div className="htr-time">
          ⏱ <span>~5 minutes</span> to complete registration
        </div>
      </section>

      {/* PATH SELECTOR */}
      <section className="htr-path-section">
        <div className="htr-path-label">Choose your path</div>
        <div className="htr-path-grid">
          <div className={`htr-path-card htr-path-card-active`}>
            <div className="htr-path-icon">⛳</div>
            <h3>Golf Club / Venue</h3>
            <p>Register your club and submit drives on behalf of members. Ideal for PGA pros, club managers, and tournament organisers.</p>
          </div>
          <div className="htr-path-card">
            <div className="htr-path-icon">🖥️</div>
            <h3>Simulator / Individual</h3>
            <p>Submit from Trackman, GCQuad, Foresight, or any launch monitor. Includes a separate simulator leaderboard.</p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="htr-steps-section">
        <div className="htr-steps-header">Step-by-step process</div>

        {steps.map((step) => (
          <div className="htr-step" key={step.num}>
            <div className="htr-step-num-col">
              <div className={`htr-step-num${step.done ? ' htr-step-num-done' : ''}`}>
                {step.num}
              </div>
              {!step.lastStep && <div className="htr-step-line" />}
            </div>
            <div className="htr-step-body">
              <div className={`htr-step-tag htr-${step.tag.cls}`}>{step.tag.label}</div>
              <div className="htr-step-title">{step.title}</div>
              <div className="htr-step-desc">{step.desc}</div>
              {step.note && <div className="htr-step-note">{step.note}</div>}
              {step.reqs && (
                <div className="htr-req-box">
                  <h4>{step.reqs.heading}</h4>
                  <ul className="htr-req-list">
                    {step.reqs.items.map((item, i) => (
                      <li key={i}>
                        <span className="htr-req-arrow">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="htr-faq-section">
        <h2>Common Questions</h2>
        {faqs.map((faq, i) => (
          <div className="htr-faq-item" key={i}>
            <div className="htr-faq-q">{faq.q}</div>
            <div className="htr-faq-a">{faq.a}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <div className="htr-cta">
        <h2>
          Ready To Get
          <br />
          <em>On the Board?</em>
        </h2>
        <p>Join thousands of amateur golfers competing for the title of world&apos;s longest amateur driver.</p>
        <Link href="/register" className="htr-btn-primary">
          Register Free
        </Link>
        <Link href="/leaderboard" className="htr-btn-secondary">
          View Leaderboard
        </Link>
      </div>
    </>
  )
}
