// pages/api/weekly-social-data.js
//
// Weekly results as JSON for the social video/caption script (make_video.py).
//
//   GET /api/weekly-social-data                 -> last full week (default; use on Monday)
//   GET /api/weekly-social-data?week=current    -> the week in progress
//   GET /api/weekly-social-data?week=2026-11-16 -> the week containing that date
//
// Auth: send  Authorization: Bearer <SOCIAL_DATA_TOKEN>  (set that env var in
// Vercel and .env.local). With no token configured the route refuses everyone.
//
// Rules mirror the homepage "Category Leaders" section (pages/index.jsx):
// Monday-start weeks, approved accounts only, one row per player (their best
// drive), top 3 per category. If you change CATEGORIES there, change them here.
// Differences from the homepage, on purpose:
//   - Weeks are calculated in UTC from the entry's date, so the answer doesn't
//     depend on the time zone of whoever (or whatever) is asking.
//   - Demo/sample rows (see isSampleId in lib/data.js) are left out.
//   - Instagram handles are only included for adult player accounts. Never for
//     Youth, never for under-18s, and never a venue's handle (a club account that
//     submits a drive for someone else would otherwise tag the club, not the player).

import crypto from 'crypto';
import { HIGH_HCP_THRESHOLD } from '../../lib/categories';
import { isSampleId } from '../../lib/data';

const DAY_MS = 86400000;
const TAG_MIN_AGE = 18; // keep in step with HANDLE_MIN_AGE in pages/register.jsx
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Keep in sync with CATEGORIES in pages/index.jsx.
const CATEGORIES = [
  { key: 'mens',       label: 'Men',                 filter: e => e.gender === 'male'   && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) <  HIGH_HCP_THRESHOLD },
  { key: 'mens_hcp',   label: 'Men High Handicap',   filter: e => e.gender === 'male'   && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) >= HIGH_HCP_THRESHOLD },
  { key: 'womens',     label: 'Women',               filter: e => e.gender === 'female' && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) <  HIGH_HCP_THRESHOLD },
  { key: 'womens_hcp', label: 'Women High Handicap', filter: e => e.gender === 'female' && Number(e.age) >= 16 && Number(e.age) <= 54 && Number(e.hcp) >= HIGH_HCP_THRESHOLD },
  { key: 'youth',      label: 'Youth (Under 16)',    filter: e => Number(e.age) < 16 },
  { key: 'senior',     label: 'Senior (55+)',        filter: e => Number(e.age) >= 55 },
];

function mondayOf(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sun
  d.setUTCDate(d.getUTCDate() + ((day === 0 ? -6 : 1) - day));
  return d;
}

const iso = d => d.toISOString().slice(0, 10);

// One row per player (their best drive). Same key as the homepage.
function bestPerPlayer(list) {
  const best = {};
  list.forEach(e => {
    const k = `${e.orgId}|${String(e.player || '').trim().toLowerCase()}`;
    if (!best[k] || Number(e.dist) > Number(best[k].dist)) best[k] = e;
  });
  return Object.values(best);
}

function cleanHandle(h) {
  let v = String(h || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (!process.env.SOCIAL_DATA_TOKEN) return res.status(503).json({ error: 'SOCIAL_DATA_TOKEN is not set on the server' });
  if (!authorised(req)) return res.status(401).json({ error: 'Unauthorised' });

  const which = String(req.query.week || 'last');
  let start;
  if (/^\d{4}-\d{2}-\d{2}$/.test(which)) {
    const d = new Date(`${which}T00:00:00Z`);
    if (isNaN(d.getTime())) return res.status(400).json({ error: 'Bad date' });
    start = mondayOf(d);
  } else if (which === 'current' || which === 'last') {
    start = mondayOf(new Date());
    if (which === 'last') start = new Date(start.getTime() - 7 * DAY_MS);
  } else {
    return res.status(400).json({ error: 'week must be last, current or YYYY-MM-DD' });
  }
  const end = new Date(start.getTime() + 7 * DAY_MS); // exclusive

  try {
    const { supabase } = await import('../../lib/supabaseClient');

    const { data: entries, error: eErr } = await supabase
      .from('entries')
      .select('id, orgId, player, dist, hcp, age, gender, is_simulator, date')
      .gte('date', iso(start))
      .lt('date', iso(end))
      .order('dist', { ascending: false })
      .limit(5000);
    if (eErr) throw eErr;

    const orgIds = [...new Set((entries || []).map(e => e.orgId).filter(Boolean))];
    let orgs = [];
    if (orgIds.length) {
      const { data, error: oErr } = await supabase
        .from('clubs')
        .select('id, status, accountType, instagram')
        .in('id', orgIds)
        .eq('status', 'approved');
      if (oErr) throw oErr;
      orgs = data || [];
    }
    const orgById = new Map(orgs.map(o => [o.id, o]));

    const approved = (entries || []).filter(e => orgById.has(e.orgId) && !isSampleId(e.id) && !isSampleId(e.orgId));

    const categories = CATEGORIES.map(cat => {
      const top = bestPerPlayer(approved.filter(cat.filter))
        .sort((a, b) => Number(b.dist) - Number(a.dist))
        .slice(0, 3);
      return {
        key: cat.key,
        name: cat.label,
        tagAllowed: cat.key !== 'youth',
        leaders: top.map(e => {
          const org = orgById.get(e.orgId);
          const canTag = cat.key !== 'youth' && org.accountType !== 'club' && Number(e.age) >= TAG_MIN_AGE;
          return {
            name: String(e.player || '').trim(),
            dist: Number(e.dist),
            instagram: canTag ? cleanHandle(org.instagram) : null,
          };
        }),
      };
    });

    return res.status(200).json({
      weekLabel: `Week of ${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}`,
      weekStart: iso(start),
      weekEnd: iso(new Date(end.getTime() - DAY_MS)),
      totalDrives: approved.length,
      categories,
    });
  } catch (err) {
    console.error('weekly-social-data error:', err);
    return res.status(502).json({ error: 'Could not load results' });
  }
}
