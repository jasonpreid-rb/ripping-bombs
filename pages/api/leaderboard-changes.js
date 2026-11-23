// pages/api/leaderboard-changes.js
//
// Finds categories whose ALL-TIME top 3 changed recently, and returns the
// "before" and "after" boards as JSON for make_change_video.py.
//
//   GET /api/leaderboard-changes               -> changes in the last 7 days
//   GET /api/leaderboard-changes?days=14       -> last 14 days (1-90)
//   GET /api/leaderboard-changes?since=2026-11-16
//
// Auth: Authorization: Bearer <SOCIAL_DATA_TOKEN> (same token as weekly-social-data).
//
// How "before" is worked out: the all-time board as it stood before the cutoff
// date = the same homepage rules (approved accounts, one best drive per player,
// top 3 per category) applied only to drives dated BEFORE the cutoff. This
// relies on each drive's `date` being when it was posted; a drive entered later
// with an old date would be treated as already on the board.
//
// Change types: new_number_one, record_broken (same #1, higher distance),
// entered_top3, moved_up. Categories with no "before" board are skipped, and so
// are changes that only affect distances lower down.
//
// Keep CATEGORIES in sync with pages/index.jsx (same as weekly-social-data.js).

import crypto from 'crypto';
import { HIGH_HCP_THRESHOLD } from '../../lib/categories';
import { isSampleId } from '../../lib/data';

const DAY_MS = 86400000;
const TAG_MIN_AGE = 18; // keep in step with HANDLE_MIN_AGE in pages/register.jsx
const PAGE = 1000;
const MAX_PAGES = 50;

const CATEGORIES = [
  { key: 'mens',       label: 'Men',                 filter: e => e.gender === 'male'   && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) <  HIGH_HCP_THRESHOLD },
  { key: 'mens_hcp',   label: 'Men High Handicap',   filter: e => e.gender === 'male'   && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) >= HIGH_HCP_THRESHOLD },
  { key: 'womens',     label: 'Women',               filter: e => e.gender === 'female' && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) <  HIGH_HCP_THRESHOLD },
  { key: 'womens_hcp', label: 'Women High Handicap', filter: e => e.gender === 'female' && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) >= HIGH_HCP_THRESHOLD },
  { key: 'youth',      label: 'Youth (Under 16)',    filter: e => Number(e.age) < 16 },
  { key: 'senior',     label: 'Senior (55+)',        filter: e => Number(e.age) >= 55 },
];

const iso = d => d.toISOString().slice(0, 10);

function playerKey(e) {
  return `${e.orgId}|${String(e.player || '').trim().toLowerCase()}`;
}

// One row per player (their best drive). Same key as the homepage.
function bestPerPlayer(list) {
  const best = {};
  list.forEach(e => {
    const k = playerKey(e);
    if (!best[k] || Number(e.dist) > Number(best[k].dist)) best[k] = e;
  });
  return Object.values(best);
}

function cleanHandle(h) {
  const v = String(h || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
}

function authorised(req) {
  const token = process.env.SOCIAL_DATA_TOKEN;
  if (!token) return false;
  const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Reads every row, a page at a time (Supabase returns at most 1000 per request).
async function fetchAll(makeQuery) {
  const rows = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const { data, error } = await makeQuery().range(p * PAGE, (p + 1) * PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

function topThree(list, cat, orgById) {
  return bestPerPlayer(list.filter(cat.filter))
    .sort((a, b) => Number(b.dist) - Number(a.dist))
    .slice(0, 3)
    .map(e => {
      const org = orgById.get(e.orgId);
      const canTag = cat.key !== 'youth' && org.accountType !== 'club' && Number(e.age) >= TAG_MIN_AGE;
      return {
        id: playerKey(e),
        name: String(e.player || '').trim(),
        dist: Number(e.dist),
        instagram: canTag ? cleanHandle(org.instagram) : null,
      };
    });
}

function detect(before, after) {
  if (!before.length || !after.length) return null;
  const same = before.length === after.length && before.every((b, i) => b.id === after[i].id && b.dist === after[i].dist);
  if (same) return null;
  if (after[0].id !== before[0].id) return { type: 'new_number_one', mover: after[0].id };
  if (after[0].dist > before[0].dist) return { type: 'record_broken', mover: after[0].id };
  const beforeIdx = new Map(before.map((b, i) => [b.id, i]));
  for (let i = 1; i < after.length; i++) {
    if (!beforeIdx.has(after[i].id)) return { type: 'entered_top3', mover: after[i].id };
  }
  for (let i = 1; i < after.length; i++) {
    if (beforeIdx.get(after[i].id) > i) return { type: 'moved_up', mover: after[i].id };
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (!process.env.SOCIAL_DATA_TOKEN) return res.status(503).json({ error: 'SOCIAL_DATA_TOKEN is not set on the server' });
  if (!authorised(req)) return res.status(401).json({ error: 'Unauthorised' });

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let cutoff;
  if (req.query.since) {
    const s = String(req.query.since);
    const d = new Date(`${s}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(d.getTime())) return res.status(400).json({ error: 'since must be YYYY-MM-DD' });
    cutoff = d;
  } else {
    const days = Number(req.query.days || 7);
    if (!Number.isInteger(days) || days < 1 || days > 90) return res.status(400).json({ error: 'days must be a whole number from 1 to 90' });
    cutoff = new Date(today.getTime() - days * DAY_MS);
  }
  const cutoffStr = iso(cutoff);

  try {
    const { supabase } = await import('../../lib/supabaseClient');

    const entries = await fetchAll(() =>
      supabase.from('entries').select('id, orgId, player, dist, hcp, age, gender, date').order('id', { ascending: true })
    );
    const orgs = await fetchAll(() =>
      supabase.from('clubs').select('id, status, accountType, instagram').eq('status', 'approved').order('id', { ascending: true })
    );
    const orgById = new Map(orgs.map(o => [o.id, o]));

    const approved = entries.filter(e => orgById.has(e.orgId) && !isSampleId(e.id) && !isSampleId(e.orgId));
    const beforeEntries = approved.filter(e => !e.date || String(e.date).slice(0, 10) < cutoffStr);

    const changes = [];
    CATEGORIES.forEach(cat => {
      const before = topThree(beforeEntries, cat, orgById);
      const after = topThree(approved, cat, orgById);
      const found = detect(before, after);
      if (found) {
        changes.push({ key: cat.key, name: cat.label, tagAllowed: cat.key !== 'youth', type: found.type, mover: found.mover, before, after });
      }
    });

    return res.status(200).json({ since: cutoffStr, until: iso(today), changes });
  } catch (err) {
    console.error('leaderboard-changes error:', err);
    return res.status(502).json({ error: 'Could not load results' });
  }
}
