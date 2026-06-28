import { useState } from 'react'
import { useRouter } from 'next/router'
import { SeoPage } from '../components/SeoPageLayout'
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants'

// ─── Inline mock UI components ───────────────────────────────────────────────

function BrowserFrame({ url, children }) {
  return (
    <div style={{ border: `1px solid ${BDR}`, overflow: 'hidden', background: BG3 }}>
      <div style={{ background: '#111', borderBottom: `1px solid ${BDR}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ background: '#1e1e1e', borderRadius: 4, padding: '3px 12px', fontSize: 11, color: DIM, flex: 1, maxWidth: 320, fontFamily: SANS }}>
          rippingbombs.com/<span style={{ color: ORG }}>{url}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

function DashboardMockup() {
  return (
    <BrowserFrame url="jake-henderson">
      {/* Profile header */}
      <div style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${BDR}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `rgba(255,0,144,0.1)`, border: `2px solid rgba(255,0,144,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏌️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: DISP, fontSize: 20, color: TXT, letterSpacing: 0.5 }}>JAKE HENDERSON</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 2 }}>Member since Jan 2025 · Sydney, AU</div>
        </div>
        <div style={{ background: 'rgba(255,0,144,0.08)', border: `1px solid rgba(255,0,144,0.3)`, padding: '8px 14px', textAlign: 'center' }}>
          <div style={{ fontFamily: DISP, fontSize: 24, color: ORG, lineHeight: 1 }}>#847</div>
          <div style={{ fontFamily: SANS, fontSize: 9, color: DIM, letterSpacing: 2, marginTop: 2 }}>WORLD RANK</div>
        </div>
      </div>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${BDR}` }}>
        {[
          { label: 'BEST DRIVE', value: '312 yds' },
          { label: 'AVG (LAST 10)', value: '287 yds' },
          { label: 'TOTAL DRIVES', value: '48' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 18px', borderRight: i < 2 ? `1px solid ${BDR}` : 'none' }}>
            <div style={{ fontFamily: DISP, fontSize: 20, color: TXT }}>{s.value}</div>
            <div style={{ fontFamily: SANS, fontSize: 9, color: ORG, fontWeight: 700, letterSpacing: 2, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Drive history */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 10 }}>RECENT DRIVES</div>
        {[
          { date: '22 Jun 2025', venue: 'Ace Golf Sims', dist: '312', tag: '#1 at venue' },
          { date: '15 Jun 2025', venue: 'SwingZone Melbourne', dist: '298', tag: '#3 at venue' },
          { date: '3 Jun 2025',  venue: 'Ace Golf Sims', dist: '291', tag: '#2 at venue' },
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${BDR}` : 'none' }}>
            <div style={{ fontFamily: DISP, fontSize: 18, color: ORG, minWidth: 60 }}>{d.dist} yds</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: TXT }}>{d.venue}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{d.date}</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ORG, background: 'rgba(255,0,144,0.08)', padding: '2px 8px' }}>{d.tag}</div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

function RankingMockup() {
  return (
    <div style={{ border: `1px solid ${BDR}`, background: BG3, overflow: 'hidden' }}>
      <div style={{ background: BG2, borderBottom: `2px solid ${BDR}`, display: 'grid', gridTemplateColumns: '56px 1fr 80px', padding: '10px 20px' }}>
        {['RANK','GOLFER','BEST DRIVE'].map((h, i) => (
          <div key={i} style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG }}>{h}</div>
        ))}
      </div>
      {[
        { rank: 845, name: 'Chris Tamara', flag: '🇺🇸', dist: '334' },
        { rank: 846, name: 'Priya Nath',   flag: '🇦🇺', dist: '318' },
        { rank: 847, name: 'Jake Henderson', flag: '🇦🇺', dist: '312', isYou: true },
        { rank: 848, name: 'Tom Brannigan', flag: '🇬🇧', dist: '308' },
        { rank: 849, name: 'Luis Ferreira', flag: '🇧🇷', dist: '301' },
      ].map((p, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '56px 1fr 80px',
          padding: '12px 20px',
          borderBottom: i < 4 ? `1px solid ${BDR}` : 'none',
          background: p.isYou ? 'rgba(255,0,144,0.07)' : 'transparent',
          borderLeft: p.isYou ? `2px solid ${ORG}` : '2px solid transparent',
        }}>
          <div style={{ fontFamily: DISP, fontSize: 16, color: p.isYou ? ORG : MUT }}>#{p.rank}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: TXT }}>
            {p.flag} {p.name}
            {p.isYou && <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: ORG, marginLeft: 8, letterSpacing: 1 }}>YOU</span>}
          </div>
          <div style={{ fontFamily: DISP, fontSize: 16, color: p.isYou ? ORG : MUT }}>{p.dist} yds</div>
        </div>
      ))}
    </div>
  )
}

function PointsMockup() {
  const bars = [320, 280, 410, 390, 450, 600]
  const max = Math.max(...bars)
  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  return (
    <div style={{ border: `1px solid ${BDR}`, background: BG3, padding: '24px' }}>
      <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 6 }}>2027 CHAMPIONSHIP POINTS</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: DISP, fontSize: 36, color: TXT, lineHeight: 1 }}>2,450 <span style={{ color: ORG }}>pts</span></div>
        <div style={{ background: 'rgba(255,0,144,0.08)', border: `1px solid rgba(255,0,144,0.3)`, padding: '6px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: DISP, fontSize: 15, color: ORG }}>Top 18%</div>
          <div style={{ fontFamily: SANS, fontSize: 9, color: DIM }}>GLOBAL</div>
        </div>
      </div>
      {/* Bar chart */}
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <div style={{ fontFamily: SANS, fontSize: 9, color: DIM, letterSpacing: 1, marginBottom: 8 }}>POINTS PER MONTH</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{
                height: `${Math.round((h / max) * 100)}%`,
                background: i === bars.length - 1 ? ORG : 'rgba(255,0,144,0.25)',
                borderRadius: '2px 2px 0 0',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {months.map(m => (
            <div key={m} style={{ flex: 1, textAlign: 'center', fontFamily: SANS, fontSize: 9, color: DIM }}>{m}</div>
          ))}
        </div>
      </div>
      {/* Recent events */}
      <div style={{ marginTop: 16, borderTop: `1px solid ${BDR}`, paddingTop: 14 }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 8 }}>RECENT POINT EVENTS</div>
        {[
          { label: '312 yd drive — top 15% in category', pts: '+180' },
          { label: 'New personal best bonus', pts: '+250' },
          { label: 'Weekly challenge — 7th place', pts: '+10' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${BDR}` : 'none' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: MUT }}>{e.label}</span>
            <span style={{ fontFamily: DISP, fontSize: 15, color: ORG }}>{e.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Is my golfer profile free?', a: 'Yes, completely free. Register with your email and your profile, unique URL, and world ranking go live instantly.' },
  { q: 'Can I choose my own profile URL?', a: 'Your URL is automatically generated from your registered name when you sign up — so it ends up as something like rippingbombs.com/your-name. It goes live instantly and stays yours permanently.' },
  { q: 'How is my world ranking calculated?', a: 'Your ranking is based on your best recorded drive distance across all participating venues. It updates automatically every time a new drive is logged.' },
  { q: 'What is my drive history?', a: 'Every drive you log at a compatible simulator venue is recorded on your profile — distance, date, venue, and how it ranked at that venue on the day. You can track your progression over time and identify your peak.' },
  { q: 'What are the 2027 Championship points?', a: 'From January 2027, every weekly drive submission earns Championship points based on where you finish in your category that week. Points accumulate all season and determine your Championship standing. Registering now builds your record ahead of the season.' },
  { q: 'Can I share my profile?', a: 'Your profile URL is permanent and shareable on any platform. Put it in your Instagram bio. Drop it in the group chat. Let your drives speak for themselves.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GolferProfilePage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <SeoPage
      title="Your Golfer Profile, URL & World Ranking | Ripping Bombs"
      description="Register free and get your own golfer profile with a unique URL, personal dashboard, live world long-drive ranking, full drive history, and 2027 Championship points tracker."
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 80px' }}>

        {/* HERO */}
        <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://simlifegolf.com/wp-content/uploads/2022/12/20211013_133305-scaled.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35)', transform: 'scale(1.05)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.5))' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(72px,12vw,120px) 20px clamp(72px,12vw,100px)', maxWidth: 640 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 14, background: 'rgba(255,0,144,0.15)', border: '1px solid rgba(255,0,144,0.4)', padding: '5px 16px', display: 'inline-block' }}>
              Free for every registered golfer
            </div>
            <div style={{ fontFamily: DISP, fontSize: 'clamp(44px,8vw,76px)', color: '#fff', letterSpacing: 1, lineHeight: 0.95, marginBottom: 20, textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
              YOUR GAME.<br /><span style={{ color: ORG }}>YOUR PROFILE.</span><br />YOUR RANKING.
            </div>
            <div style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto 32px' }}>
              Register free and get your own profile page, a unique URL, a live world ranking, and a complete record of every drive you've ever hit on a compatible simulator.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/register')} style={{ background: ORG, color: '#000', fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: '14px 32px', border: 'none', cursor: 'pointer', letterSpacing: 0.5 }}>
                CLAIM YOUR PROFILE →
              </button>
              <button onClick={() => router.push('/leaderboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '14px 28px', cursor: 'pointer', letterSpacing: 0.5 }}>
                View Leaderboard
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 56 }} />

        {/* YOUR UNIQUE URL */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Your unique URL</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 16 }}>ONE LINK. YOUR WHOLE GAME.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>
            The moment you register, you get a permanent page at rippingbombs.com that's yours alone. Your name, your ranking, your drives — all in one place. Put the link in your Instagram bio, drop it in the group chat, or share it after your next session. It updates automatically every time you log a new drive.
          </div>
          {/* URL examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            {['jake-henderson', 'sarah-davies', 'tom-brannigan'].map(u => (
              <div key={u} style={{ background: BG2, border: `1px solid ${BDR}`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS }}>
                <span style={{ color: MUT, fontSize: 13 }}>rippingbombs.com/</span>
                <span style={{ color: ORG, fontWeight: 700, fontSize: 14 }}>{u}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.7 }}>
            Your URL is generated from your registered name when you sign up — no extra steps needed.
          </div>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Your dashboard</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 16 }}>EVERYTHING AT A GLANCE.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 24 }}>
            Your profile page is your personal long-drive dashboard. Every time you play at a compatible venue, your stats update automatically — no manual entry required.
          </div>
          <DashboardMockup />
          <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginTop: 12, textAlign: 'center' }}>
            Your live profile — world ranking, personal stats, and full drive history in one place.
          </div>
        </div>

        {/* WORLD RANKING */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>World ranking</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 16 }}>SEE EXACTLY WHERE YOU STAND.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>
            Your world ranking is a live benchmark of your best drive against every other registered golfer on the platform. It updates the moment a new drive is logged. Whether you're chasing the top 100 or just looking to beat your mates, you'll always know exactly where you sit.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 24 }}>
            Rankings are global — one leaderboard, every registered golfer in the world. Your position on it is real.
          </div>
          <RankingMockup />
        </div>

        {/* DRIVE HISTORY */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>Drive history</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 16 }}>EVERY BOMB, ON RECORD.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 24 }}>
            Your profile logs every drive you record at a participating venue — distance, date, venue name, and how it ranked at that venue on the day. Nothing disappears. Watch your progression over months, identify your peak, and track how different venues or conditions affect your game.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 2, background: BDR }}>
            {[
              { icon: '📍', label: 'Venue & date', desc: 'Every drive tied to where and when it was hit' },
              { icon: '📈', label: 'Progression over time', desc: 'Watch your average and best improve across sessions' },
              { icon: '🏆', label: 'Venue context', desc: 'See how your drive ranked on the venue leaderboard that day' },
            ].map((c, i) => (
              <div key={i} style={{ background: BG2, padding: '20px 22px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontFamily: DISP, fontSize: 17, color: TXT, letterSpacing: 0.5, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2027 POINTS */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 12 }}>2027 Championship points</div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 16 }}>EVERY DRIVE EARNS POINTS TOWARD THE 2027 CHAMPIONSHIP.</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>
            From January 2027, every weekly drive submission earns Championship points based on where you finish in your category that week. 1st in your category earns 100 points. Every submission earns at least 10. Points accumulate across the entire season and determine your Championship standing.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 24 }}>
            Your profile tracks your running points total, shows a monthly breakdown, and tells you where you sit in the global field. The sooner you start submitting, the bigger your head start.
          </div>
          <PointsMockup />
          <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, marginTop: 12, textAlign: 'center' }}>
            Live on your profile from January 2027 — points, monthly chart, and global percentile.
          </div>
        </div>

        {/* CTA STRIP */}
        <div style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)', padding: '40px 32px', textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: DISP, fontSize: 'clamp(24px,4vw,36px)', color: TXT, letterSpacing: 1, lineHeight: 1.1, marginBottom: 12 }}>
            CLAIM YOUR PROFILE.<br /><span style={{ color: ORG }}>IT'S FREE.</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Register today and your profile goes live instantly. Your world ranking, drive history, and 2027 points tracker are waiting.
          </div>
          <button onClick={() => router.push('/register')} style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: '14px 36px', cursor: 'pointer', letterSpacing: 0.5 }}>
            REGISTER FREE →
          </button>
        </div>

        {/* FAQ */}
        <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 20 }}>FAQ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? 'rgba(255,0,144,0.25)' : BDR}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 }}>
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
