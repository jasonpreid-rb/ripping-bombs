// lib/championship.js
// 2027 Golf Simulator League — four 3-month championships. Pure scoring logic. No DB writes, no new tables.
// Everything is computed on the fly from the existing `entries` + `clubs` data.

export const CHAMPIONSHIP_LIVE = false   // flip to true on launch day
export const SEASON_YEAR = 2027
export const DIST_UNIT = 'yds'           // change if entries are stored in metres

export const POINTS_TABLE = [100, 70, 50, 40, 30, 20] // 1st..6th
export const POINTS_FLOOR = 10                          // 7th and below

export const CHAMPIONSHIP_CATEGORIES = [
  { id: 'men',      label: 'Men' },
  { id: 'men-hh',   label: 'Men High Handicap' },
  { id: 'women',    label: 'Women' },
  { id: 'women-hh', label: 'Women High Handicap' },
  { id: 'youth',    label: 'Youth' },
  { id: 'senior',   label: 'Senior' },
]

const DAY = 86400000
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const WEEKS_PER_CHAMPIONSHIP = 13

// Four separate championships, one per calendar quarter (UTC):
// 1 Jan–Mar · 2 Apr–Jun · 3 Jul–Sep · 4 Oct–Dec
export function buildChampionships(year = SEASON_YEAR) {
  return [0, 1, 2, 3].map(i => ({
    index: i + 1,
    name: `Championship ${i + 1}`,
    months: `${MONTHS[i * 3]} – ${MONTHS[i * 3 + 2]}`,
    start: Date.UTC(year, i * 3, 1),
    end: Date.UTC(year, i * 3 + 3, 1) - 1,
  }))
}

export function currentChampionshipIndex(list, now = Date.now()) {
  const c = list.find(c => now >= c.start && now <= c.end)
  return c ? c.index : 1
}

// Weeks count from the championship's first day. Any leftover days at the
// end of the quarter fold into week 13.
export function weekOf(ts, champ) {
  return Math.min(WEEKS_PER_CHAMPIONSHIP, Math.floor((ts - champ.start) / (7 * DAY)) + 1)
}
export function weekBounds(w, champ) {
  const start = champ.start + (w - 1) * 7 * DAY
  const end = w >= WEEKS_PER_CHAMPIONSHIP ? champ.end : start + 7 * DAY - 1
  return { start, end }
}

export function pointsForRank(rank) {
  return rank <= POINTS_TABLE.length ? POINTS_TABLE[rank - 1] : POINTS_FLOOR
}

export function parseTs(d) {
  const ts = Date.parse(d)
  return Number.isFinite(ts) ? ts : null
}

export function playerKey(e) {
  return `${e.orgId}|${String(e.player || '').trim().toLowerCase()}`
}

// Category rules from the championship page.
export function categoryOf(e) {
  const age = Number(e.age)
  const hcp = Number(e.hcp)
  if (age < 16) return 'youth'
  if (age >= 55) return 'senior'
  const female = /^(f|w)/i.test(String(e.gender || ''))
  const high = hcp >= 15
  return female ? (high ? 'women-hh' : 'women') : (high ? 'men-hh' : 'men')
}

// entries: rows from `entries`; clubs: rows from `clubs` (id, name, country)
export function computeStandings({ entries, clubs, championships, championshipIndex, categoryId }) {
  const clubById = {}
  ;(clubs || []).forEach(c => { clubById[c.id] = c })
  const champ = championships.find(c => c.index === championshipIndex)

  // Eligible drives: simulator, not a venue custom event, valid distance + date, inside this championship
  const clean = []
  for (const e of entries || []) {
    if (!e.is_simulator || e.eventId) continue
    const dist = Number(e.dist)
    const ts = parseTs(e.date)
    if (!(dist > 0) || ts == null || ts < champ.start || ts > champ.end) continue
    clean.push({ ...e, dist, ts, key: playerKey(e) })
  }
  clean.sort((a, b) => a.ts - b.ts)

  // Interim "lock": a player's category for this championship is taken from their
  // first drive in it. Swap for the real category-selection lookup once that exists.
  const lock = {}
  for (const e of clean) if (!lock[e.key]) lock[e.key] = categoryOf(e)

  const inScope = clean.filter(e => lock[e.key] === categoryId)

  // Group by week, then by player (best drive of the week counts)
  const weeks = {}
  for (const e of inScope) {
    const w = weekOf(e.ts, champ)
    ;(weeks[w] = weeks[w] || {})[e.key] = (weeks[w][e.key] || []).concat(e)
  }

  const players = {}
  for (const w of Object.keys(weeks).map(Number).sort((a, b) => a - b)) {
    const ranked = Object.entries(weeks[w]).map(([key, list]) => {
      const sorted = [...list].sort((a, b) => b.dist - a.dist || a.ts - b.ts)
      return { key, best: sorted[0], extras: sorted.slice(1) }
    }).sort((a, b) => b.best.dist - a.best.dist || a.best.ts - b.best.ts)

    const bounds = weekBounds(w, champ)
    ranked.forEach((r, i) => {
      const rank = i + 1
      const club = clubById[r.best.orgId] || {}
      const p = players[r.key] = players[r.key] || {
        key: r.key, player: r.best.player, orgId: r.best.orgId,
        venue: club.name || '', country: (club.country || '').toLowerCase(),
        points: 0, ranks: [], bestDist: 0, weeks: [],
      }
      const pts = pointsForRank(rank)
      p.points += pts
      p.ranks.push(rank)
      p.bestDist = Math.max(p.bestDist, r.best.dist)
      p.weeks.push({
        week: w, weekStart: bounds.start, weekEnd: bounds.end,
        rank, points: pts, fieldSize: ranked.length,
        best: r.best, extras: r.extras,
      })
    })
  }

  // F1-style order: points, then countback of 1st/2nd/3rd… finishes, then best drive
  const countback = p => [1, 2, 3, 4, 5, 6].map(n => p.ranks.filter(r => r === n).length)
  const rows = Object.values(players).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const ca = countback(a), cb = countback(b)
    for (let i = 0; i < ca.length; i++) if (cb[i] !== ca[i]) return cb[i] - ca[i]
    if (b.bestDist !== a.bestDist) return b.bestDist - a.bestDist
    return String(a.player).localeCompare(String(b.player))
  })
  rows.forEach((r, i) => { r.position = i + 1; r.wins = r.ranks.filter(x => x === 1).length })
  return rows
}
