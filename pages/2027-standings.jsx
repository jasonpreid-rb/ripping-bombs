import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { SeoPage } from '../components/SeoPageLayout'
import { supabase } from '../lib/supabaseClient'
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants'
import {
  CHAMPIONSHIP_LIVE, SEASON_YEAR, DIST_UNIT, CHAMPIONSHIP_CATEGORIES, POINTS_TABLE, POINTS_FLOOR,
  buildChampionships, currentChampionshipIndex, computeStandings,
} from '../lib/championship'

async function fetchAll(table, cols) {
  let all = [], from = 0
  for (;;) {
    const { data, error } = await supabase.from(table).select(cols).range(from, from + 999)
    if (error) throw error
    all = all.concat(data || [])
    if (!data || data.length < 1000) break
    from += 1000
  }
  return all
}

// clubs table uses camelCase columns; the scoring code expects { id, name, country }.
// Only safe columns are ever selected (never pw or other private fields).
const CLUB_COLUMNS = 'id,courseName,fullName,country,instagram'
const normalizeClub = c => ({
  id: c.id,
  name: c.courseName || c.fullName || '',
  country: c.country || '',
  instagram: c.instagram || '',
})

// "@jason", "jason", "instagram.com/jason/" -> "@jason". Anything that doesn't
// look like a handle returns '' so nothing is shown under the name.
function igHandle(v) {
  let s = String(v || '').trim()
  if (!s) return ''
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^(www\.)?instagram\.com\//i, '')
  s = s.split(/[/?#]/)[0].replace(/^@+/, '').trim()
  return /^[A-Za-z0-9._]{1,30}$/.test(s) ? '@' + s : ''
}

const fmtDate = ts => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const fmtShort = ts => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function Flag({ code }) {
  if (!code) return <div style={{ width: 28, height: 19, background: BG3, border: `1px solid ${BDR}` }} />
  return <img src={`https://flagcdn.com/w40/${code}.png`} width={28} height={19} alt={code.toUpperCase()} style={{ display: 'block', objectFit: 'cover' }} />
}

// F1-style: "Sabrina SMITH"
function DriverName({ name, size = 16 }) {
  const parts = String(name || '').trim().split(/\s+/)
  const last = parts.length > 1 ? parts.pop() : null
  return (
    <span style={{ fontFamily: SANS, fontSize: size, color: TXT, letterSpacing: .3 }}>
      {parts.join(' ')}{last && <> <b style={{ textTransform: 'uppercase', fontWeight: 800 }}>{last}</b></>}
    </span>
  )
}

const posColor = p => (p === 1 ? ORG : p <= 3 ? TXT : DIM)

const CARD_CLIP = 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)'

// Top-3 podium: 2nd | 1st | 3rd, winner tallest in the middle
const PODIUM_SLOTS = [
  { pos: 2, h: 58, accent: '#c0c7d0', nameSize: 15, ptsSize: 30 },
  { pos: 1, h: 88, accent: ORG,       nameSize: 18, ptsSize: 40 },
  { pos: 3, h: 42, accent: '#cd7f32', nameSize: 15, ptsSize: 30 },
]

function Podium({ rows, handleOf, onOpen }) {
  if (!rows || rows.length === 0) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.12fr 1fr', gap: 8, alignItems: 'end', marginBottom: 22 }}>
      {PODIUM_SLOTS.map(slot => {
        const r = rows.find(x => x.position === slot.pos)
        if (!r) return <div key={slot.pos} />
        const first = slot.pos === 1
        const handle = handleOf(r)
        return (
          <button
            key={slot.pos}
            className="rb-pod"
            onClick={() => onOpen(r.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: 0, border: 'none',
              background: 'transparent', cursor: 'pointer', textAlign: 'center', minWidth: 0,
              filter: first ? 'drop-shadow(0 0 22px rgba(255,0,144,0.35))' : 'none',
            }}
          >
            <div style={{
              padding: first ? '18px 8px 14px' : '14px 8px 12px',
              background: `linear-gradient(180deg, ${BG3} 0%, ${BG2} 100%)`,
              borderTop: `3px solid ${slot.accent}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0,
            }}>
              <Flag code={r.country} />
              <div style={{ lineHeight: 1.15, wordBreak: 'break-word', maxWidth: '100%' }}>
                <DriverName name={r.player} size={slot.nameSize} />
              </div>
              {handle && (
                <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{handle}</div>
              )}
              <div>
                <div style={{ fontFamily: DISP, fontSize: slot.ptsSize, lineHeight: 1, color: first ? ORG : TXT }}>{r.points}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: 2, color: DIM, textTransform: 'uppercase', marginTop: 2 }}>pts</div>
              </div>
            </div>
            <div style={{
              height: slot.h, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: first ? `linear-gradient(135deg, ${ORG} 0%, #ff4db8 100%)` : `linear-gradient(180deg, ${BG3} 0%, ${BG2} 100%)`,
              borderTop: `3px solid ${slot.accent}`,
            }}>
              <span style={{ fontFamily: DISP, fontSize: first ? 54 : 40, lineHeight: 1, color: first ? '#000' : slot.accent, letterSpacing: 1 }}>{slot.pos}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function Standings2027Page() {
  const router = useRouter()
  const preview = router.isReady && router.query.preview === '1'
  const allowed = CHAMPIONSHIP_LIVE || preview
  // In preview the page runs on the CURRENT year so it uses today's real entries.
  // Add &year=2027 to see the actual 2027 calendar (empty until launch).
  const year = preview ? (Number(router.query.year) || new Date().getFullYear()) : SEASON_YEAR
  const champs = useMemo(() => buildChampionships(year), [year])

  const [entries, setEntries] = useState(null)
  const [clubs, setClubs] = useState([])
  const [error, setError] = useState('')
  const [tIndex, setTIndex] = useState(null)
  const [cat, setCat] = useState('men')
  const [now, setNow] = useState(null)
  const selectedKey = router.isReady && router.query.p ? String(router.query.p) : null

  useEffect(() => { setNow(Date.now()) }, [])

  useEffect(() => {
    if (!router.isReady || !allowed) return
    setTIndex(i => i ?? currentChampionshipIndex(champs))
    Promise.all([fetchAll('entries', '*'), fetchAll('clubs', CLUB_COLUMNS)])
      .then(([e, c]) => { setEntries(e); setClubs(c.map(normalizeClub)) })
      .catch(err => setError(err.message || 'Could not load standings'))
  }, [router.isReady, allowed, champs])

  // Standings for every category, so each tab can show how many players it holds
  const byCat = useMemo(() => {
    const out = {}
    if (!entries || !tIndex) return out
    CHAMPIONSHIP_CATEGORIES.forEach(c => {
      out[c.id] = computeStandings({ entries, clubs, championships: champs, championshipIndex: tIndex, categoryId: c.id })
    })
    return out
  }, [entries, clubs, champs, tIndex])
  const rows = byCat[cat] || []

  // Player's social handle (from their account), or '' if none
  const handleByOrg = useMemo(() => {
    const m = {}
    clubs.forEach(c => { m[c.id] = igHandle(c.instagram) })
    return m
  }, [clubs])
  const handleOf = r => handleByOrg[r.orgId] || ''

  const selected = selectedKey ? rows.find(r => r.key === selectedKey) : null
  const tour = champs.find(t => t.index === tIndex)

  const openPlayer = key => router.push({ pathname: router.pathname, query: { ...router.query, p: key } }, undefined, { shallow: true })
  const closePlayer = () => { const q = { ...router.query }; delete q.p; router.push({ pathname: router.pathname, query: q }, undefined, { shallow: true }) }

  const pill = active => ({
    fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
    padding: '9px 14px', background: active ? ORG : 'transparent', color: active ? '#000' : MUT,
    border: `1px solid ${active ? ORG : BDR}`, borderRadius: 0,
  })

  const champStatus = t => {
    if (now == null) return null
    if (now >= t.start && now <= t.end) return 'live'
    return now > t.end ? 'done' : 'soon'
  }

  const sectionLabel = {
    fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: DIM,
    textTransform: 'uppercase', marginBottom: 8,
  }

  return (
    <SeoPage title="2027 Championship Standings | Ripping Bombs" description="Ripping Bombs 2027 Golf Simulator League standings.">
      <Head><meta name="robots" content="noindex,nofollow" /></Head>
      <style>{`
        @keyframes rbPulse { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: .35; transform: scale(.75) } }
        .rb-champ { transition: transform .15s ease, filter .15s ease; }
        .rb-champ:hover { transform: translateY(-2px); filter: brightness(1.15); }
        .rb-chip { transition: transform .12s ease, box-shadow .15s ease, border-color .15s ease; }
        .rb-chip:hover { transform: translateY(-1px); border-color: ${ORG} !important; }
        .rb-pod { transition: transform .15s ease; }
        .rb-pod:hover { transform: translateY(-3px); }
      `}</style>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 0 80px' }}>

        {router.isReady && !allowed && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontFamily: DISP, fontSize: 36, color: TXT, letterSpacing: 1 }}>STANDINGS OPEN <span style={{ color: ORG }}>JANUARY 2027</span></div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginTop: 12 }}>The 2027 Golf Simulator League launches January 1.</div>
          </div>
        )}

        {allowed && (
          <>
            {!CHAMPIONSHIP_LIVE && (
              <div style={{ fontFamily: SANS, fontSize: 11, color: ORG, border: `1px dashed ${ORG}`, padding: '8px 12px', marginBottom: 20 }}>
                PREVIEW — not public, not linked in navigation. Using {year} entries.
              </div>
            )}

            {!selected && (
              <>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: 'uppercase', marginBottom: 10 }}>{year} Golf Simulator League · 4 Championships</div>
                <div style={{ fontFamily: DISP, fontSize: 'clamp(32px,6vw,48px)', color: TXT, letterSpacing: 1, lineHeight: 1, marginBottom: 28 }}>CHAMPIONSHIP STANDINGS</div>

                {/* Championships: angled race cards */}
                <div style={sectionLabel}>Championship</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 26 }}>
                  {champs.map(t => {
                    const active = tIndex === t.index
                    const status = champStatus(t)
                    return (
                      <button
                        key={t.index}
                        className="rb-champ"
                        onClick={() => setTIndex(t.index)}
                        style={{
                          position: 'relative', textAlign: 'left', cursor: 'pointer', border: 'none',
                          padding: '14px 16px 18px', clipPath: CARD_CLIP,
                          background: active
                            ? `linear-gradient(135deg, ${ORG} 0%, #ff4db8 100%)`
                            : `linear-gradient(180deg, ${BG3} 0%, ${BG2} 100%)`,
                          color: active ? '#000' : TXT,
                          boxShadow: active ? `0 0 28px rgba(255,0,144,0.35)` : 'none',
                        }}
                      >
                        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: active ? '#000' : BDR }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', opacity: active ? .75 : 1, color: active ? '#000' : DIM }}>
                            Champ {t.index}
                          </span>
                          {status && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: active ? '#000' : status === 'live' ? ORG : DIM }}>
                              {status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#000' : ORG, animation: 'rbPulse 1.4s ease-in-out infinite' }} />}
                              {status === 'live' ? 'Live' : status === 'done' ? 'Done' : 'Soon'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: DISP, fontSize: 26, letterSpacing: 1, lineHeight: 1 }}>{t.months.replace(/ – /g, '–').toUpperCase()}</div>
                      </button>
                    )
                  })}
                </div>

                {/* Categories: rounded chips with count bubbles */}
                <div style={sectionLabel}>Category</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                  {CHAMPIONSHIP_CATEGORIES.map(c => {
                    const active = cat === c.id
                    const count = entries ? (byCat[c.id] || []).length : null
                    const empty = count === 0
                    return (
                      <button
                        key={c.id}
                        className="rb-chip"
                        onClick={() => setCat(c.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase',
                          padding: '6px 6px 6px 16px', borderRadius: 999,
                          background: active ? ORG : 'rgba(255,255,255,0.03)',
                          color: active ? '#000' : empty ? DIM : TXT,
                          border: `1px solid ${active ? ORG : BDR}`,
                          opacity: empty && !active ? .55 : 1,
                          boxShadow: active ? '0 0 18px rgba(255,0,144,0.4)' : 'none',
                        }}
                      >
                        {c.label}
                        {count != null && (
                          <span style={{
                            minWidth: 24, height: 24, padding: '0 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800,
                            background: active ? '#000' : empty ? 'transparent' : 'rgba(255,0,144,0.18)',
                            color: active ? ORG : empty ? DIM : ORG,
                            border: empty && !active ? `1px solid ${BDR}` : 'none',
                          }}>{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {tour && <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginBottom: 16 }}>{tour.name} · {fmtDate(tour.start)} – {fmtDate(tour.end)} · points reset every championship</div>}

                {error && <div style={{ fontFamily: SANS, fontSize: 13, color: ORG }}>{error}</div>}
                {!entries && !error && <div style={{ fontFamily: SANS, fontSize: 13, color: DIM }}>Loading…</div>}

                {/* Podium: top 3 */}
                {entries && rows.length > 0 && <Podium rows={rows} handleOf={handleOf} onOpen={openPlayer} />}

                {entries && (
                  <div style={{ border: `1px solid ${BDR}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '56px 44px 1fr 80px', background: BG3, borderBottom: `2px solid ${BDR}` }}>
                      {['Pos', '', 'Player', 'Pts'].map((h, i) => (
                        <div key={i} style={{ padding: '10px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</div>
                      ))}
                    </div>
                    {rows.length === 0 && <div style={{ padding: 24, fontFamily: SANS, fontSize: 13, color: DIM }}>No qualifying drives in this championship and category yet.</div>}
                    {rows.map((r, i) => {
                      const handle = handleOf(r)
                      return (
                        <div key={r.key} onClick={() => openPlayer(r.key)} style={{
                          display: 'grid', gridTemplateColumns: '56px 44px 1fr 80px', alignItems: 'center', cursor: 'pointer',
                          borderBottom: i < rows.length - 1 ? `1px solid ${BDR}` : 'none',
                          borderLeft: `3px solid ${r.position === 1 ? ORG : r.position <= 3 ? MUT : 'transparent'}`,
                          background: r.position === 1 ? 'rgba(255,0,144,0.05)' : 'transparent',
                        }}>
                          <div style={{ padding: '14px', fontFamily: DISP, fontSize: 22, color: posColor(r.position) }}>{r.position}</div>
                          <div style={{ padding: '14px 0' }}><Flag code={r.country} /></div>
                          <div style={{ padding: '12px 14px', minWidth: 0 }}>
                            <DriverName name={r.player} />
                            {handle && <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{handle}</div>}
                          </div>
                          <div style={{ padding: '14px', fontFamily: DISP, fontSize: 24, color: r.position === 1 ? ORG : TXT, textAlign: 'right' }}>{r.points}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, lineHeight: 1.7, marginTop: 14 }}>
                  Weekly points: {POINTS_TABLE.map((p, i) => `${i + 1}${['st', 'nd', 'rd'][i] || 'th'} ${p}`).join(' · ')} · 7th+ {POINTS_FLOOR}. Ties are split by countback (most 1st places, then 2nd places, and so on), then longest drive. Tap a player for their scoring drives.
                </div>
              </>
            )}

            {selected && (
              <>
                <button onClick={closePlayer} style={{ ...pill(false), marginBottom: 20 }}>← Standings</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                  <div style={{ fontFamily: DISP, fontSize: 44, color: posColor(selected.position) }}>P{selected.position}</div>
                  <Flag code={selected.country} />
                  <div style={{ minWidth: 0 }}>
                    <DriverName name={selected.player} size={22} />
                    <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginTop: 2 }}>
                      {[
                        handleOf(selected),
                        CHAMPIONSHIP_CATEGORIES.find(c => c.id === cat)?.label,
                        tour ? `${tour.name} (${tour.months})` : '',
                      ].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontFamily: DISP, fontSize: 40, color: ORG, lineHeight: 1 }}>{selected.points}</div>
                    <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 2, color: DIM, textTransform: 'uppercase' }}>pts</div>
                  </div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: '10px 0 20px' }}>
                  {selected.weeks.length} week{selected.weeks.length === 1 ? '' : 's'} scored · {selected.wins} win{selected.wins === 1 ? '' : 's'} · best {selected.bestDist} {DIST_UNIT}
                </div>

                <div style={{ border: `1px solid ${BDR}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 90px 64px 64px', background: BG3, borderBottom: `2px solid ${BDR}` }}>
                    {['Week', 'Drive date', 'Distance', 'Rank', 'Pts'].map((h, i) => (
                      <div key={i} style={{ padding: '10px 12px', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ORG, textTransform: 'uppercase', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
                    ))}
                  </div>
                  {selected.weeks.map((w, i) => (
                    <div key={w.week} style={{ borderBottom: i < selected.weeks.length - 1 ? `1px solid ${BDR}` : 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 90px 64px 64px', alignItems: 'center' }}>
                        <div style={{ padding: '12px', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: TXT }}>W{w.week}</div>
                        <div style={{ padding: '12px', fontFamily: SANS, fontSize: 13, color: TXT }}>
                          {fmtDate(w.best.ts)}
                          <div style={{ fontSize: 10, color: DIM }}>{fmtShort(w.weekStart)} – {fmtShort(w.weekEnd)}</div>
                        </div>
                        <div style={{ padding: '12px', fontFamily: SANS, fontSize: 13, color: TXT, textAlign: 'right' }}>
                          {w.best.dist}
                          {typeof w.best.photo === 'string' && /^https?:/.test(w.best.photo) && (
                            <div><a href={w.best.photo} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: ORG }}>proof</a></div>
                          )}
                        </div>
                        <div style={{ padding: '12px', fontFamily: SANS, fontSize: 13, color: MUT, textAlign: 'right' }}>{w.rank}<span style={{ color: DIM }}>/{w.fieldSize}</span></div>
                        <div style={{ padding: '12px', fontFamily: DISP, fontSize: 20, color: w.rank === 1 ? ORG : TXT, textAlign: 'right' }}>{w.points}</div>
                      </div>
                      {w.extras.map((x, j) => (
                        <div key={j} style={{ padding: '0 12px 8px 76px', fontFamily: SANS, fontSize: 11, color: DIM }}>
                          Also submitted {fmtDate(x.ts)} — {x.dist} {DIST_UNIT} (not counted, best drive of the week is used)
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', background: BG2, borderTop: `2px solid ${BDR}` }}>
                    <div style={{ padding: '12px', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: 'uppercase' }}>Championship total</div>
                    <div style={{ padding: '12px', fontFamily: DISP, fontSize: 22, color: ORG, textAlign: 'right' }}>{selected.points}</div>
                  </div>
                </div>
              </>
            )}

            {router.isReady && selectedKey && entries && !selected && (
              <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, marginTop: 16 }}>That player isn't in this championship/category.</div>
            )}
          </>
        )}
      </div>
    </SeoPage>
  )
}