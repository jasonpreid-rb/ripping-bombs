import { useState } from 'react'
import { useRouter } from 'next/router'
import { SeoPage } from '../components/SeoPageLayout'
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants'

const POINTS = [
  { pos: '1st', pts: 100, medal: '🥇' },
  { pos: '2nd', pts: 70,  medal: '🥈' },
  { pos: '3rd', pts: 50,  medal: '🥉' },
  { pos: '4th', pts: 40,  medal: null },
  { pos: '5th', pts: 30,  medal: null },
  { pos: '6th', pts: 20,  medal: null },
  { pos: '7th+', pts: 10, medal: null },
]

const CATEGORIES = [
  { icon: '♂',  label: 'Men',                 desc: 'Age 16–54, handicap under 20' },
  { icon: '♂',  label: 'Men High Handicap',   desc: 'Age 16–54, handicap 20 and above' },
  { icon: '♀',  label: 'Women',               desc: 'Age 16–54, handicap under 20' },
  { icon: '♀',  label: 'Women High Handicap', desc: 'Age 16–54, handicap 20 and above' },
  { icon: '🌱', label: 'Youth',               desc: 'Under 16' },
  { icon: '⭐', label: 'Senior',              desc: 'Age 55 and above' },
]

const FAQS = [
  { q: 'Who can enter the 2027 Championship?', a: 'Any registered simulator account. If you don\'t have an account yet, registration is free and takes under 2 minutes. Simulator accounts are auto-approved instantly.' },
  { q: 'When do I select my championship category?', a: 'Category selection opens in January 2027. You\'ll be prompted to choose when you log in. Pick the category that fits your age, gender, and handicap — you can only compete in one.' },
  { q: 'Can I change my category after selecting?', a: 'No. Once you\'ve selected your championship category for the season it is locked. Choose carefully.' },
  { q: 'How are weekly points awarded?', a: '1st place earns 100 points, 2nd earns 70, 3rd earns 50, 4th earns 40, 5th earns 30, 6th earns 20, and every other submission earns 10 points. You earn points every week you submit — consistency matters as much as distance.' },
  { q: 'Do my submissions before January 2027 count?', a: 'Points accumulation begins when the championship launches in January 2027. Submitting now builds your record and gets you on the leaderboard ahead of the season.' },
  { q: 'Is there a limit on weekly submissions?', a: 'One drive per week. Only your best drive of the week counts toward your weekly points total.' },
  { q: 'What equipment is accepted?', a: 'Any calibrated launch monitor — Trackman, GCQuad, Foresight, Mevo+, and equivalents. A screenshot of the readout showing carry distance is required as evidence.' },
  { q: 'Is entry free?', a: 'Yes. Registering and competing in the 2027 Championship is completely free.' },
]

export default function Championship2027Page() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <SeoPage
      title="2027 Simulator Championship | Ripping Bombs"
      description="The Ripping Bombs 2027 Simulator Championship — the world's largest online golf longest drive competition. One drive per week. Six categories. Points accumulate all season."
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 80px' }}>

       {/* HERO */}
<div
  style={{
     position: 'relative',
  width: '100vw',
  height: '60vh', // 🔥 MUCH shorter crop
  marginLeft: 'calc(50% - 50vw)',
  marginRight: 'calc(50% - 50vw)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
  }}
>
  {/* BACKGROUND IMAGE */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: "url('https://simlifegolf.com/wp-content/uploads/2022/12/20211013_133305-scaled.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(0.35)',
      transform: 'scale(1.05)',
      zIndex: 0
    }}
  />

  {/* DARK OVERLAY (key upgrade) */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: `
      linear-gradient(
        rgba(0,0,0,0.55),
        rgba(0,0,0,0.45)
      )
    `
  }} />


  {/* CONTENT */}
<div
  style={{
    position: 'relative',
    zIndex: 2,
    padding: '120px 0 100px'
  }}
>
    <div
      style={{
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 3,
        color: ORG,
        textTransform: 'uppercase',
        marginBottom: 16
      }}
    >
      Launching January 2027
    </div>

    <div
      style={{
        fontFamily: DISP,
        fontSize: 'clamp(48px,8vw,80px)',
        color: '#fff',
        letterSpacing: 1,
        lineHeight: 0.95,
        marginBottom: 20
      }}
    >
      THE WORLD'S BIGGEST<br />
      <span style={{ color: ORG }}>SIM DRIVE</span><br />
      COMP
    </div>

    <div
      style={{
        fontFamily: SANS,
        fontSize: 16,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 1.75,
        maxWidth: 500,
        margin: '0 auto 32px'
      }}
    >
      Six categories. One drive per week. Points accumulate all season. The Ripping Bombs 2027 Simulator Championship could be the largest amateur golf competition on the planet.
    </div>

    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button
        onClick={() => router.push('/register')}
        style={{
          background: ORG,
          color: '#000',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 14,
          padding: '14px 32px',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: 0.5
        }}
      >
        REGISTER FREE →
      </button>

      <button
        onClick={() => router.push('/leaderboard')}
        style={{
          background: 'transparent',
          border: `1px solid ${ORG}`,
          color: ORG,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 14,
          padding: '14px 28px',
          cursor: 'pointer',
          letterSpacing: 0.5
        }}
      >
        View Leaderboard
      </button>
    </div>
  </div>
</div>

<div style={{ marginBottom: "40px" }} />

        {/* WHY IT'S BIG */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Why this is different</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 16 }}>A SEASON-LONG COMPETITION, OPEN TO EVERYONE</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>
            Most golf competitions are one-day events. You show up, you hit, you go home. The 2027 Ripping Bombs Simulator Championship is different — it runs all year, with a new weekly leaderboard resetting every Monday. Every drive you submit earns points. Every week is a chance to climb.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85 }}>
            Because it's open to any registered simulator user anywhere in the world, with no entry fee and no travel required, this has the potential to become the largest amateur golf competition ever run. If you own a launch monitor, you're eligible.
          </div>
        </div>

        {/* POINTS TABLE */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Points structure</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 20 }}>EARN POINTS EVERY WEEK</div>
          <div style={{ border: `1px solid ${BDR}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: BG3, borderBottom: `2px solid ${BDR}` }}>
              {['Position', 'Points', ''].map((h, i) => (
                <div key={i} style={{ padding: '10px 20px', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {POINTS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < POINTS.length - 1 ? `1px solid ${BDR}` : 'none', background: i === 0 ? 'rgba(163,230,53,0.05)' : 'transparent' }}>
                <div style={{ padding: '14px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 15, color: TXT, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {row.medal && <span>{row.medal}</span>}{row.pos}
                </div>
                <div style={{ padding: '14px 20px', fontFamily: DISP, fontSize: 22, color: i === 0 ? ORG : MUT, letterSpacing: .5 }}>{row.pts}</div>
                <div style={{ padding: '14px 20px', fontFamily: SANS, fontSize: 12, color: DIM, display: 'flex', alignItems: 'center' }}>
                  {i === POINTS.length - 1 ? 'Every submission counts' : i === 0 ? 'Weekly category winner' : `Weekly category #${i + 1}`}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.7 }}>
            Points are awarded per category. You compete against others in your championship category only — not the global field.
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>How it works</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 24 }}>THREE STEPS TO COMPETE</div>
          {[
            { num: 1, title: 'Register a Simulator Account', body: 'Free, takes under 2 minutes, auto-approved instantly. Select "Simulator / Individual" during registration.' },
            { num: 2, title: 'Choose Your Championship Category', body: 'When the championship opens in January 2027, log in and select the one category you want to compete in for the season. This cannot be changed once selected.' },
            { num: 3, title: 'Submit One Drive Per Week', body: 'Every week, submit your best drive with a screenshot of your launch monitor readout as evidence. Your weekly position earns you points. The more consistent you are, the higher you climb.' },
          ].map((step, i) => (
            <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISP, fontSize: 20, color: ORG, background: 'rgba(163,230,53,0.08)', border: `2px solid ${ORG}`, flexShrink: 0 }}>{step.num}</div>
                {i < 2 && <div style={{ width: 2, flex: 1, background: BDR, minHeight: 24 }} />}
              </div>
              <div style={{ paddingBottom: 36, paddingTop: 10 }}>
                <div style={{ fontFamily: DISP, fontSize: 19, color: TXT, letterSpacing: .5, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.75 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Championships</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 8 }}>SIX CATEGORIES. ONE FOR YOU.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.7, marginBottom: 24 }}>
            Every player competes in one category only. Pick the one that fits — there's a leaderboard for everyone.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, background: BDR }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} style={{ background: BG2, padding: '20px 22px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontFamily: DISP, fontSize: 17, color: TXT, letterSpacing: .5, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA STRIP */}
        <div style={{ background: 'rgba(163,230,53,0.05)', border: `1px solid rgba(163,230,53,0.2)`, padding: '40px 32px', textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: DISP, fontSize: 'clamp(24px,4vw,36px)', color: TXT, letterSpacing: 1, lineHeight: 1, marginBottom: 12 }}>
            START BUILDING YOUR<br /><span style={{ color: ORG }}>RECORD NOW</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
            Register today, submit weekly, and be ready when the championship opens in January 2027.
          </div>
          <button
            onClick={() => router.push('/register')}
            style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: '14px 36px', cursor: 'pointer', letterSpacing: .5 }}
          >
            REGISTER FREE →
          </button>
        </div>

        {/* FAQ */}
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: .5, marginBottom: 20 }}>FAQ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map(({ q, a }, i) => (
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

      </div>
    </SeoPage>
  )
}
