// pages/api/weekly-images-notify.js
//
// Fires every Monday via Vercel Cron. Computes the week that just closed
// and emails you a preview of all 7 social images (1 cover + 6 division
// cards) so they can be viewed and saved manually.
//
// Week numbering is imported directly from lib/constants (nowWeek/
// prevWeek/weekLabel) — the exact same functions the OG image endpoints
// use — so this can never link to a different week than what those
// endpoints actually render.
//
// This does NOT go to the recipient list — it's a personal notification,
// sent only to the address in NOTIFY_EMAIL (or ?to= override for testing).
//
// Query overrides (all optional):
//   ?current=1       — use THIS week (in progress), not last closed week.
//                       Useful for an on-demand "results as they stand"
//                       send instead of waiting for Monday.
//   ?week=&year=     — target an explicit week/year directly.
//   ?to=             — override the recipient (testing).
//
// vercel.json cron entry (Monday 06:15 UTC — offset from period-report's
// 06:00 run so they don't hit Supabase at the exact same second):
// { "path": "/api/weekly-images-notify", "schedule": "15 6 * * 1" }

import { Resend } from 'resend';
import { nowWeek, prevWeek, weekLabel } from '../../lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

const DIVISIONS = [
  'Men',
  'Men High Handicap',
  'Women',
  'Women High Handicap',
  'Youth',
  'Seniors',
];

const SITE_URL = 'https://rippingbombs.com';

// --- Email ---------------------------------------------------------------

function buildImageUrls(target) {
  const base = `${SITE_URL}/api/og`;
  const qs = `week=${target.w}&year=${target.y}`;
  const cover = `${base}/week-cover?${qs}`;
  const divisions = DIVISIONS.map((d) => ({
    name: d,
    url: `${base}/week-division?${qs}&division=${encodeURIComponent(d)}`,
  }));
  return { cover, divisions };
}

function renderEmail(target, isCurrent, urls) {
  const label = weekLabel(target);

  const cards = urls.divisions
    .map(
      (d) => `
        <div style="margin-bottom:24px;">
          <p style="font-family:sans-serif;font-size:13px;color:#888;margin:0 0 6px;">${d.name}</p>
          <img src="${d.url}" width="360" style="display:block;border-radius:12px;" />
          <a href="${d.url}" style="font-family:sans-serif;font-size:12px;color:#FF0090;">Open full size ↗</a>
        </div>`
    )
    .join('');

  return `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
      <h1 style="color:#FF0090;">${label} social images ready</h1>
      <p style="color:#444;">
        ${isCurrent
          ? 'These reflect the week in progress — results as they currently stand, not a finalized week.'
          : 'Right-click / long-press each image to save, or open full size.'}
      </p>

      <p style="font-size:13px;color:#888;margin:24px 0 6px;">Cover</p>
      <img src="${urls.cover}" width="360" style="display:block;border-radius:12px;" />
      <a href="${urls.cover}" style="font-family:sans-serif;font-size:12px;color:#FF0090;">Open full size ↗</a>

      <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
      ${cards}
    </div>
  `;
}

// --- Handler ---------------------------------------------------------------

export default async function handler(req, res) {
  const isCron = req.headers['x-vercel-cron'] === '1';
  const hasSecret = req.query.secret === process.env.CRON_SECRET;
  if (!isCron && !hasSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const qWeek = req.query.week;
    const qYear = req.query.year;
    const isCurrent = req.query.current === '1';

    let target;
    if (qWeek && qYear) {
      target = { y: Number(qYear), w: Number(qWeek) };
    } else if (isCurrent) {
      target = nowWeek();
    } else {
      target = prevWeek(nowWeek());
    }

    const urls = buildImageUrls(target);

    const to = req.query.to || process.env.NOTIFY_EMAIL;
    if (!to) {
      return res.status(500).json({ error: 'No NOTIFY_EMAIL configured and no ?to= override given' });
    }

    await resend.emails.send({
      from: 'team@rippingbombs.com',
      to,
      subject: `Ripping Bombs — ${weekLabel(target)} social images ready`,
      html: renderEmail(target, isCurrent, urls),
    });

    return res.status(200).json({
      success: true,
      week: target.w,
      year: target.y,
      current: isCurrent,
      coverUrl: urls.cover,
      divisionUrls: urls.divisions,
    });
  } catch (err) {
    console.error('weekly-images-notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
