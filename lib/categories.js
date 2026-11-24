// lib/categories.js
//
// Single source of truth for the High Handicap category cutoff.
// Players with hcp >= HIGH_HCP_THRESHOLD fall into "Men High Handicap" /
// "Women High Handicap"; everyone below it is "Men" / "Women".
//
// History: the cutoff was 20 until Nov 2026, when it moved to 15 to match
// the /longest-drive-high-handicap page and the player profile pages.
//
// Plain ES module with no dependencies, so it works in both the Next.js
// pages and the edge-runtime OG image routes.

export const HIGH_HCP_THRESHOLD = 15;

// ---------------------------------------------------------------------------
// Leaderboard "views": the category a drive belongs to, expressed as the same
// URL filters the leaderboard page reads (gender / hcp / age). Used after a
// submission to rank the player and to send them to the right leaderboard.
// ---------------------------------------------------------------------------

// Which leaderboard view a drive lands in. Youth and Senior take priority;
// everyone else is Men/Women, split at HIGH_HCP_THRESHOLD.
export function viewForEntry(e) {
  const age = Number(e.age);
  const hcp = Number(e.hcp);
  if (age < 16) return { id: 'youth', label: 'Youth', query: { age: 'u16' } };
  if (age >= 55) return { id: 'senior', label: 'Senior', query: { age: '55+' } };
  const female = e.gender === 'female';
  const high = hcp >= HIGH_HCP_THRESHOLD;
  return {
    id: `${female ? 'women' : 'men'}${high ? '-hh' : ''}`,
    label: `${female ? "Women's" : "Men's"}${high ? ' High Handicap' : ''}`,
    query: { gender: female ? 'female' : 'male', hcp: high ? 'o15' : 'u15' },
  };
}

// Same matching rules as the leaderboard's own filters for these values.
export function entryInView(e, q) {
  if (q.gender && e.gender !== q.gender) return false;
  if (q.hcp === 'u15' && !(Number(e.hcp) < HIGH_HCP_THRESHOLD)) return false;
  if (q.hcp === 'o15' && !(Number(e.hcp) >= HIGH_HCP_THRESHOLD)) return false;
  if (q.age === 'u16' && !(Number(e.age) < 16)) return false;
  if (q.age === '55+' && !(Number(e.age) >= 55)) return false;
  return true;
}

export function playerKeyOf(e) {
  return `${e.orgId}::${String(e.player || '').trim().toLowerCase()}`;
}

// All-time rank of a player in a view, the way the leaderboard shows it:
// only approved accounts, one row per player (their longest drive), by distance.
export function rankInView({ entries, isApproved, entry, query }) {
  const best = new Map();
  for (const x of entries) {
    if (!isApproved(x.orgId)) continue;
    const k = playerKeyOf(x);
    const cur = best.get(k);
    if (!cur || Number(x.dist) > Number(cur.dist)) best.set(k, x);
  }
  const rows = [...best.values()]
    .filter(x => entryInView(x, query))
    .sort((a, b) => Number(b.dist) - Number(a.dist));
  const idx = rows.findIndex(x => playerKeyOf(x) === playerKeyOf(entry));
  return { rank: idx + 1, total: rows.length };
}
