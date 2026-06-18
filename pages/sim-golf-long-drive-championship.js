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
  { q: 'Who can enter the 2027 Championship?', a: 'Any registered simulator user. Registration is free and instant.' },

  { q: 'When does the season start?', a: 'The official championship season begins January 2027. Pre-season submissions build your record but do not earn points.' },

  { q: 'How often can I submit?', a: 'One valid drive per week counts toward the leaderboard. Only your best recorded drive of that week is used.' },

  { q: 'How are weekly points awarded?', a: 'Rankings are calculated within each category weekly: 1st = 100, 2nd = 70, 3rd = 50, 4th = 40, 5th = 30, 6th = 20, 7th+ = 10 points.' },

  { q: 'What counts as a valid drive?', a: 'A single driver shot recorded on an approved launch monitor or simulator with visible carry/total distance data.' },

  { q: 'What equipment is allowed?', a: 'TrackMan, Foresight (GCQuad / GC3), SkyTrak, Mevo+, and equivalent calibrated launch monitors.' },

  { q: 'Can I change category mid-season?', a: 'No. Once selected in January 2027, your category is locked for the full season.' },

  { q: 'Is it free to enter?', a: 'Yes — the competition is completely free to join and compete in.' },
]

export default function Championship2027Page() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <SeoPage
      title="Longest Sim Golf Drive Competition| Ripping Bombs"
      description="The Ripping Bombs Simulator Championship — a global longest drive leaderboard. One drive per week. Six categories. Seasonal points format."
    >

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 80px' }}>

{/* HERO */}
<div style={{
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
}}>

  {/* Background */}
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(https://breezypointresort.com/wp-content/uploads/2025/06/breezy-point-golf-simulator-01.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%', // 🔥 focuses mid-impact zone
    transform: 'scale(1.12)' // 🔥 stronger crop
  }} />

  {/* DARK OVERLAY (key upgrade) */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: `
      linear-gradient(
        rgba(0,0,0,0.85),
        rgba(0,0,0,0.75)
      )
    `
  }} />

  {/* Content */}
  <div style={{
    position: 'relative',
    zIndex: 2,
    maxWidth: 760,
    padding: '0 20px'
  }}>

    <div style={{
      fontFamily: SANS,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 3,
      color: ORG,
      textTransform: 'uppercase',
      marginBottom: 10
    }}>
      Submit anywhere, anytime
    </div>

    <div style={{
      fontFamily: DISP,
      fontSize: 'clamp(48px,8vw,80px)',
      color: '#fff',
      lineHeight: 0.95,
      marginBottom: 12
    }}>
      THE WORLD'S<br /><span style={{ color: ORG }}>SIM GOLF</span><br />DRIVE COMP
    </div>

    <div style={{
      fontFamily: SANS,
      fontSize: 14,
      color: 'rgba(255,255,255,0.72)',
      lineHeight: 1.5,
      marginBottom: 18
    }}>
      A season-long simulator long drive competition. One recorded drive per week. Category-based rankings with cumulative points across the season.
    </div>

  </div>
<div></div>
</div>

        {/* WHY */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>
            Why it matters
          </div>

          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 16 }}>
            A TRUE SEASON FORMAT, NOT A ONE-OFF EVENT
          </div>

          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>
            The championship runs weekly across an entire season. Each player submits one validated drive per week, and rankings are determined within fixed categories.
          </div>

          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85 }}>
            It is designed to reward both peak performance and consistency — not just one big hit.
          </div>
        </div>

        {/* POINTS */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>
            Points system
          </div>

          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 20 }}>
            WEEKLY CATEGORY POINTS
          </div>

          <div style={{ border: `1px solid ${BDR}`, overflow: 'hidden' }}>
            {POINTS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < POINTS.length - 1 ? `1px solid ${BDR}` : 'none' }}>
                <div style={{ padding: '14px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 15, color: TXT }}>
                  {row.medal && <span>{row.medal} </span>}{row.pos}
                </div>
                <div style={{ padding: '14px 20px', fontFamily: DISP, fontSize: 22, color: i === 0 ? ORG : MUT }}>
                  {row.pts}
                </div>
                <div style={{ padding: '14px 20px', fontFamily: SANS, fontSize: 12, color: DIM }}>
                  Weekly ranking points within category
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>
            How it works
          </div>

          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, marginBottom: 24 }}>
            SIMPLE WEEKLY FORMAT
          </div>

          {[
            'Register your simulator account',
            'Select your category in January 2027 (locked for season)',
            'Submit one validated drive per week'
          ].map((t, i) => (
            <div key={i} style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 12 }}>
              {i + 1}. {t}
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, marginBottom: 24 }}>
            SIX COMPETITION CATEGORIES
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, background: BDR }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} style={{ background: BG2, padding: '20px 22px' }}>
                <div style={{ fontSize: 22 }}>{cat.icon}</div>
                <div style={{ fontFamily: DISP, fontSize: 16, color: TXT }}>{cat.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, marginBottom: 20 }}>
          FAQ
        </div>

        {FAQS.map((f, i) => (
          <div key={i} style={{ border: `1px solid ${BDR}`, marginBottom: 8 }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: '100%', padding: 16, textAlign: 'left', background: 'none', border: 'none', color: TXT }}
            >
              {f.q}
            </button>
            {openFaq === i && (
              <div style={{ padding: 16, color: MUT, fontFamily: SANS, fontSize: 13 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}

      </div>
    </SeoPage>
  )
}