import { useState } from 'react'
import { useRouter } from 'next/router'
import { SeoPage } from '../components/SeoPageLayout'
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants'

const CLUB_STEPS = [
  {
    num: 1,
    title: 'Register Your Club',
    desc: 'Sign up free in under 2 minutes. Enter your club name, country, and a contact name. Your account will be reviewed and approved within 24 hours.',
    reqs: ['Club name and country', 'Contact name and email', 'Approximate location or city'],
  },
  {
    num: 2,
    title: 'Submit Drives on Behalf of Players',
    desc: 'Once approved, log in and submit your longest drives from tournaments, events, or competitions. You submit on behalf of your players — enter their name, distance, club used, handicap, and age.',
    reqs: ['Player full name', 'Distance (yards or metres)', 'Club used', 'Handicap index', 'Player age and gender', 'Photo evidence'],
  },
  {
    num: 3,
    title: 'Instantly Live on the Leaderboard',
    desc: 'Drives go live on the global leaderboard immediately. Suspicious entries may be reviewed and removed. Repeated violations result in account suspension.',
    reqs: null,
  },
]

const SIM_STEPS = [
  {
    num: 1,
    title: 'Register Your Simulator Account',
    desc: 'Sign up free in under 2 minutes. Select "Simulator / Individual" during registration and enter your launch monitor type (Trackman, GCQuad, Foresight, etc.). Simulator accounts are auto-approved instantly.',
    reqs: ['Your name and email', 'Simulator make and model'],
  },
  {
    num: 2,
    title: 'Submit One Drive Per Week',
    desc: 'Log in and submit your best drive of the week. Upload a screenshot of your launch monitor readout as evidence. Only carry distance from a calibrated launch monitor is accepted. One submission per week enters you into the weekly competition and accumulates season points.',
    reqs: ['Distance in yards or metres', 'Screenshot of launch monitor readout', 'Date of drive'],
  },
  {
    num: 3,
    title: 'Instantly Live on the Leaderboard',
    desc: 'Your drive appears on the global leaderboard immediately, clearly badged as a simulator entry. Suspicious entries may be reviewed and removed. Repeated violations result in account suspension. A points leaderboard launches January 2027.',
    reqs: null,
  },
]

const CLUB_FAQS = [
  { q: 'Do I need approval before submitting?', a: 'Yes — club accounts require a quick review, usually completed within 24 hours. Once approved you can submit straight away.' },
  { q: 'Can I submit drives for multiple players?', a: 'Yes. As a club account you can submit drives on behalf of any of your members or tournament participants.' },
  { q: 'Is there a limit on how many drives I can submit?', a: 'No limit. You can submit as many drives as you like — from weekly club competitions, one-off events, or ongoing tournaments.' },
  { q: 'What photo evidence is required?', a: 'A photo showing the drive distance — this could be a GPS readout, laser rangefinder display, measuring wheel result, or any recognised measurement method.' },
  { q: 'What happens if an entry is flagged?', a: 'Suspicious entries are removed from the leaderboard pending review. If we cannot verify the drive it will be permanently removed. Repeated violations result in account suspension.' },
  { q: 'Is it free?', a: 'Yes. Registering and submitting drives is completely free for golf clubs and venues.' },
]

const SIM_FAQS = [
  { q: 'How many drives can I submit per week?', a: 'One drive per week. This counts toward your weekly competition entry and accumulates season points on the points leaderboard, launching January 2027.' },
  { q: 'What launch monitors are accepted?', a: 'Any calibrated launch monitor — Trackman, GCQuad, Foresight, Mevo+, and equivalents. The screenshot must clearly show the carry distance.' },
  { q: 'Are simulator drives on the same leaderboard as outdoor drives?', a: 'Simulator drives appear on the global leaderboard but are clearly badged as simulator entries, keeping outdoor and simulator results easy to distinguish.' },
  { q: 'What if my entry is flagged?', a: 'Suspicious entries are removed pending review. If we cannot verify the drive it will be permanently removed. Repeated violations result in account suspension.' },
  { q: 'When does the points leaderboard launch?', a: 'The season points leaderboard launches January 2027. Every weekly submission you make now accumulates points that will count toward your ranking.' },
  { q: 'Is it free?', a: 'Yes. Registering and submitting is completely free.' },
]

export default function HowToRegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState(null) // null | 'club' | 'sim'
  const [openFaq, setOpenFaq] = useState(null)

  const steps = mode === 'club' ? CLUB_STEPS : SIM_STEPS
  const faqs = mode === 'club' ? CLUB_FAQS : SIM_FAQS

  const handleMode = (m) => {
    setMode(m)
    setOpenFaq(null)
  }

  return (
    <SeoPage
      title="How to Register & Submit Your Drive | Ripping Bombs"
      description="Join the world's largest amateur long drive registry. Register your club or simulator, submit your longest drive, and appear on the global leaderboard instantly."
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 0 80px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Getting Started</div>
          <div style={{ fontFamily: DISP, fontSize: 'clamp(36px,6vw,56px)', color: TXT, letterSpacing: 1, lineHeight: 1, marginBottom: 16 }}>
            HOW TO <span style={{ color: ORG }}>REGISTER</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: MUT, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            From sign-up to leaderboard in under 5 minutes. Select your account type to get started.
          </div>
        </div>

        {/* PATH SELECTOR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: BDR, marginBottom: 48 }}>
          <button
            onClick={() => handleMode('club')}
            style={{
              background: mode === 'club' ? 'rgba(163,230,53,0.08)' : BG2,
              border: 'none',
              borderBottom: mode === 'club' ? `2px solid ${ORG}` : '2px solid transparent',
              padding: '28px 24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>⛳</div>
            <div style={{ fontFamily: DISP, fontSize: 18, color: mode === 'club' ? ORG : TXT, letterSpacing: .5, marginBottom: 6 }}>GOLF CLUB / VENUE</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6 }}>Register your club and submit longest drives on behalf of members and tournament players.</div>
          </button>
          <button
            onClick={() => handleMode('sim')}
            style={{
              background: mode === 'sim' ? 'rgba(163,230,53,0.08)' : BG2,
              border: 'none',
              borderBottom: mode === 'sim' ? `2px solid ${ORG}` : '2px solid transparent',
              padding: '28px 24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🖥️</div>
            <div style={{ fontFamily: DISP, fontSize: 18, color: mode === 'sim' ? ORG : TXT, letterSpacing: .5, marginBottom: 6 }}>SIMULATOR / INDIVIDUAL</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6 }}>Submit from Trackman, GCQuad, Foresight, or any launch monitor. One drive per week.</div>
          </button>
        </div>

        {/* PROMPT IF NO SELECTION */}
        {!mode && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: BG2, border: `1px solid ${BDR}` }}>
            <div style={{ fontFamily: SANS, fontSize: 13, color: DIM }}>↑ Select your account type above to see the steps</div>
          </div>
        )}

        {/* STEPS */}
        {mode && (
          <>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: MUT, textTransform: 'uppercase', marginBottom: 24, paddingBottom: 12, borderBottom: `1px solid ${BDR}` }}>
              {mode === 'club' ? 'Club / Venue' : 'Simulator / Individual'} — Step by step
            </div>

            {steps.map((step, i) => (
              <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 20px', position: 'relative' }}>
                {/* Number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: DISP, fontSize: 20, color: ORG, flexShrink: 0, position: 'relative', zIndex: 1,
                    background: 'rgba(163,230,53,0.08)', border: `2px solid ${ORG}`,
                  }}>{step.num}</div>
                  {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: BDR, minHeight: 24 }} />}
                </div>
                {/* Body */}
                <div style={{ paddingBottom: 40, paddingTop: 10 }}>
                  <div style={{ fontFamily: DISP, fontSize: 20, color: TXT, letterSpacing: .5, marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.75, marginBottom: step.reqs ? 16 : 0 }}>{step.desc}</div>
                  {step.reqs && (
                    <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '16px 20px' }}>
                      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: 'uppercase', marginBottom: 12 }}>You'll need</div>
                      {step.reqs.map((item, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: SANS, fontSize: 13, color: MUT, padding: '5px 0', borderBottom: j < step.reqs.length - 1 ? `1px solid ${BDR}` : 'none' }}>
                          <span style={{ color: ORG, fontSize: 11, marginTop: 2, flexShrink: 0 }}>→</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div style={{ background: 'rgba(163,230,53,0.05)', border: `1px solid rgba(163,230,53,0.2)`, padding: '32px 24px', textAlign: 'center', margin: '8px 0 48px' }}>
              <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: 1, marginBottom: 8 }}>
                {mode === 'club' ? 'READY TO REGISTER YOUR CLUB?' : 'READY TO SUBMIT YOUR FIRST DRIVE?'}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 20 }}>
                {mode === 'club' ? 'Free to join. No subscription.' : 'Free to join. Auto-approved instantly.'}
              </div>
              <button
                onClick={() => router.push('/register')}
                style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: '12px 32px', cursor: 'pointer', letterSpacing: .5 }}
              >
                REGISTER FREE →
              </button>
            </div>

            {/* FAQ */}
            <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: .5, marginBottom: 20 }}>FAQ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 60 }}>
              {faqs.map(({ q, a }, i) => (
                <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? 'rgba(163,230,53,0.25)' : BDR}`, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 }}
                  >
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TXT, textAlign: 'left' }}>{q}</span>
                    <span style={{ fontFamily: SANS, fontSize: 18, color: ORG, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 20px 18px', fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.75 }}>{a}</div>}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </SeoPage>
  )
}
