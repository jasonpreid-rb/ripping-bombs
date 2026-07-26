// pages/api/weekly-images-notify.js
//
// Fires every Monday via Vercel Cron. Computes the week that just closed
// and emails Jason a link + preview of all 7 social images (1 cover +
// 6 division cards) so they can be viewed and saved manually.
//
// This does NOT go to the recipient list — it's a personal notification,
// sent only to the address in NOTIFY_EMAIL (or ?to= override for testing).
//
// vercel.json cron entry (Monday 06:15 UTC — offset from period-report's
// 06:00 run so they don't hit Supabase at the exact same second):
// { "path": "/api/weekly-images-notify", "schedule": "15 6 * * 1" }

import { Resend } from 'resend';

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

// --- Period math (mirrors period-report.js) -----------------------------

function getWeek1Start(year) {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dayOfWeek = jan1.getUTCDay();
  const daysToMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
  const week1Start = new Date(jan1);
  week1Start.setUTCDate(week1Start.getUTCDate() + daysToMonday);
  return week1Start;
}

function getMondayOnOrBefore(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay();
  const diff = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function computeWeekNumber(date) {
  let year = date.getUTCFullYear();
  let week1Start = getWeek1Start(year);
  if (date < week1Start) {
    year -= 1;
    week1Start = getWeek1Start(year);
  }
  const daysSinceAnchor = Math.floor((date - week1Start) / 86400000);
  return { year, weekNumber: Math.floor(daysSinceAnchor / 7) + 1 };
}

function getLastClosedWeek(now = new Date()) {
  const thisMonday = getMondayOnOrBefore(now);
  const weekStart = new Date(thisMonday);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const { year, weekNumber } = computeWeekNumber(weekStart);
  return { weekStart, weekNumber, year };
}

// --- Email ---------------------------------------------------------------

function buildImageUrls(year, weekNumber) {
  const base = `${SITE_URL}/api/og`;
  const cover = `${base}/week-cover?week=${weekNumber}&year=${year}`;
  const divisions = DIVISIONS.map((d) => ({
    name: d,
    url: `${base}/week-division?week=${weekNumber}&year=${year}&division=${encodeURIComponent(d)}`,
  }));
  return { cover, divisions };
}

function renderEmail(year, weekNumber, weekStart, urls) {
  const dateLabel = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

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
      <h1 style="color:#FF0090;">Week ${weekNumber} social images ready</h1>
      <p style="color:#444;">w/c ${dateLabel} — right-click / long-press each image to save, or open full size.</p>

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
    const { weekStart, weekNumber, year } = getLastClosedWeek(new Date());
    const urls = buildImageUrls(year, weekNumber);

    const to = req.query.to || process.env.NOTIFY_EMAIL;
    if (!to) {
      return res.status(500).json({ error: 'No NOTIFY_EMAIL configured and no ?to= override given' });
    }

    await resend.emails.send({
      from: 'team@rippingbombs.com',
      to,
      subject: `Ripping Bombs — Week ${weekNumber} social images ready`,
      html: renderEmail(year, weekNumber, weekStart, urls),
    });

    return res.status(200).json({
      success: true,
      week: weekNumber,
      year,
      coverUrl: urls.cover,
      divisionUrls: urls.divisions,
    });
  } catch (err) {
    console.error('weekly-images-notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
