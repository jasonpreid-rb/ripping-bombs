// POST /api/revalidate-leaderboard
// Called by the submit page right after a drive is saved. Rebuilds the
// statically-generated pages that list drives so a new entry appears
// immediately instead of after the 10-minute `revalidate` timer.
//
// Safe to leave unauthenticated: it only triggers a rebuild from the database
// (it can't write or leak anything). The throttle below stops anyone from
// using it to hammer rebuilds.

const PATHS = [
  '/',
  '/leaderboard',
  '/hall-of-fame',
  '/longest-drives-this-week',
  '/biggest-hitters-by-country',
  '/longest-mens-drive',
  '/longest-womens-drive',
  '/longest-drive-low-handicap',
  '/longest-drive-mid-handicap',
  '/longest-drive-high-handicap',
  '/longest-drive-seniors',
  '/longest-drive-juniors-u12',
  '/longest-drive-juniors-13-16',
  '/longest-drive-juniors-17-18',
];

// Per-instance throttle (serverless instances don't share memory, so this is
// best-effort, which is fine for the purpose).
let lastRun = 0;
const MIN_GAP_MS = 15 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const now = Date.now();
  if (now - lastRun < MIN_GAP_MS) {
    return res.status(200).json({ ok: true, throttled: true });
  }
  lastRun = now;

  // Pages that aren't statically generated (or don't exist) just fail
  // individually; allSettled keeps one bad path from blocking the rest.
  const results = await Promise.allSettled(PATHS.map(p => res.revalidate(p)));
  const revalidated = PATHS.filter((_, i) => results[i].status === 'fulfilled');

  return res.status(200).json({ ok: true, revalidated });
}
