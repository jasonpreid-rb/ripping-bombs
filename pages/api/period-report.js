// pages/api/period-report.js
//
// Fires daily via Vercel Cron. Only sends on the FIRST day of a new 4-week
// period (i.e. the Monday a new period opens) — the email recaps the period
// that just closed, so recipients land on a fresh, empty leaderboard and can
// act on it immediately. Period 1 always starts on the first Monday on/after Jan 1.
//
// vercel.json cron entry (runs once a day, checks internally if it's report day):
// { "path": "/api/period-report", "schedule": "0 6 * * *" }

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

const DIVISIONS = [
  'Men',
  'Men High Handicap',
  'Women',
  'Women High Handicap',
  'Youth',
  'Seniors',
];

// --- Period math -----------------------------------------------------

function getWeek1Start(year) {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dayOfWeek = jan1.getUTCDay(); // 0=Sun..6=Sat
  const daysToMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
  const week1Start = new Date(jan1);
  week1Start.setUTCDate(week1Start.getUTCDate() + daysToMonday);
  return week1Start;
}

// Build full period info (year, weeks, etc) for an explicit period index,
// counting from the Jan 1 anchor for the given year. periodIndex is 0-based.
function getPeriodByIndex(year, periodIndex) {
  const week1Start = getWeek1Start(year);
  const periodStart = new Date(week1Start);
  periodStart.setUTCDate(periodStart.getUTCDate() + periodIndex * 28);

  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(periodStart);
    weekStart.setUTCDate(weekStart.getUTCDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    weeks.push({ weekNumber: periodIndex * 4 + w + 1, weekStart, weekEnd });
  }

  return { year, periodIndex, periodStart, weeks };
}

// Figure out where "now" falls, and whether today is the first day of a new
// period (the day we want to send — recapping the period that just closed).
function getPeriodInfo(now = new Date()) {
  const year = now.getUTCFullYear();
  const week1Start = getWeek1Start(year);

  const daysSinceAnchor = Math.floor((now - week1Start) / 86400000);
  if (daysSinceAnchor < 0) return null; // orphan days before Week 1 (e.g. Jan 1-4)

  const weekIndex = Math.floor(daysSinceAnchor / 7); // 0-based
  const periodIndex = Math.floor(weekIndex / 4); // 0-based, period we're currently IN
  const isFirstDayOfPeriod = daysSinceAnchor % 28 === 0;

  // The period we report on is the one that just closed — i.e. the previous
  // one, unless we're sitting on Period 1's first day, in which case there's
  // nothing to report yet (no closed period exists).
  const reportPeriodIndex = periodIndex - 1;
  const reportPeriod =
    isFirstDayOfPeriod && reportPeriodIndex >= 0
      ? getPeriodByIndex(year, reportPeriodIndex)
      : null;

  return {
    year,
    periodIndex,
    isFirstDayOfPeriod,
    reportPeriod, // the closed period to email about, or null if nothing to send
  };
}

// --- Division logic -----------------------------------------------------
//
// There's no stored division column — it's computed from gender, hcp, age.
// This matches the category definitions in PROJECT_BRAIN.md (the live
// homepage category logic), which supersedes the earlier hcp-15 / "Women Low
// Handicap" spec — confirmed as the source of truth going forward.
//
// Priority: age brackets (Youth, Seniors) override gender/handicap brackets.
//
//   age < 16                -> Youth
//   age >= 55                -> Seniors
//   gender=male,   hcp < 20  -> Men
//   gender=male,   hcp >= 20 -> Men High Handicap
//   gender=female, hcp < 20  -> Women
//   gender=female, hcp >= 20 -> Women High Handicap

function computeDivision({ gender, hcp, age }) {
  const numAge = Number(age);
  const numHcp = Number(hcp);

  if (!Number.isNaN(numAge)) {
    if (numAge < 16) return 'Youth';
    if (numAge >= 55) return 'Seniors';
  }

  const isLowHandicap = !Number.isNaN(numHcp) && numHcp < 20;
  const isMale = (gender || '').toLowerCase() === 'male';

  if (isMale) {
    return isLowHandicap ? 'Men' : 'Men High Handicap';
  }
  return isLowHandicap ? 'Women' : 'Women High Handicap';
}

// --- Data ---------------------------------------------------------------

// Pulls top 3 per division for a week, excluding demo/sample entries.
// Demo entries always contain "demo" somewhere in their id (per PROJECT_BRAIN.md:
// e.g. "demo_1", "democlub2") — same applies to demo clubs via orgId.
// Country comes from the linked clubs row (entries.orgId -> clubs.id -> clubs.country),
// using Supabase's foreign-key embedding since that relationship already exists.
async function getTopEntriesForWeek(weekStart, weekEnd) {
  const { data, error } = await supabase
    .from('entries')
    .select('player, dist, date, gender, hcp, age, facility, orgId, venueId, clubs(country)')
    .gte('date', weekStart.toISOString().slice(0, 10))
    .lt('date', weekEnd.toISOString().slice(0, 10))
    .not('id', 'ilike', '%demo%')
    .not('orgId', 'ilike', '%demo%')
    .order('dist', { ascending: false });

  if (error) throw error;

  const withDivision = data.map((e) => ({
    ...e,
    dist: Number(e.dist), // some legacy entries store dist as a string
    country: e.clubs?.country || null,
    division: computeDivision(e),
  }));

  const byDivision = {};
  for (const division of DIVISIONS) {
    byDivision[division] = withDivision
      .filter((e) => e.division === division)
      .sort((a, b) => b.dist - a.dist)
      .slice(0, 3);
  }
  return byDivision;
}

// Registered club/simulator emails, excluding demo/sample accounts.
// TODO: once an opt-out column exists (see unsubscribe flow), add
// .eq('emailOptOut', false) here to respect it.
async function getRecipients() {
  const { data, error } = await supabase
    .from('clubs')
    .select('id, email')
    .not('id', 'ilike', '%demo%')
    .not('email', 'is', null);

  if (error) throw error;
  return data.filter((r) => r.email && r.email.trim() !== '');
}

// --- Email ----------------------------------------------------------

// Mirrors components/UI.jsx's countryFlag() — same flagcdn.com source, so
// the report matches what the site itself renders. Returns an <img> tag
// rather than emoji, since emoji flags render inconsistently across email clients.
function countryFlagImg(code) {
  if (!code) return '';
  return `<img src="https://flagcdn.com/40x30/${code.toLowerCase()}.png" alt="${code}" width="20" height="15" style="object-fit:cover;vertical-align:middle;" />`;
}

function renderWeekSection(weekNumber, weekStart, byDivision) {
  const dateLabel = weekStart.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const divisionRows = DIVISIONS.map((division) => {
    const entries = byDivision[division];
    if (!entries || entries.length === 0) {
      return `<tr><td colspan="4" style="padding:6px 12px;color:#888;">${division}: no entries</td></tr>`;
    }
    const rows = entries
      .map(
        (e, i) =>
          `<tr>
            <td style="padding:4px 12px;">${i + 1}</td>
            <td style="padding:4px 6px;">${countryFlagImg(e.country)}</td>
            <td style="padding:4px 12px;">${e.player}</td>
            <td style="padding:4px 12px;">${e.dist}m</td>
          </tr>`
      )
      .join('');
    return `<tr><td colspan="4" style="padding:10px 12px 2px;font-weight:bold;color:#FF0090;">${division}</td></tr>${rows}`;
  }).join('');

  return `
    <h2 style="font-family:sans-serif;">Week ${weekNumber} <span style="color:#888;font-weight:normal;">(w/c ${dateLabel})</span></h2>
    <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      ${divisionRows}
    </table>
  `;
}

async function sendReport(reportPeriod, weeklyResults, recipientEmail, clubId) {
  const sections = weeklyResults
    .map((r, i) => renderWeekSection(r.weekNumber, reportPeriod.weeks[i].weekStart, r.byDivision))
    .join('<hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />');

  // Placeholder unsubscribe token — just the club id, base64-encoded.
  // NOT cryptographically signed. Fine for now since there's no real opt-out
  // column yet to act on; swap for a proper signed token (e.g. HMAC with a
  // server secret) once the unsubscribe endpoint and emailOptOut column exist.
  const unsubToken = Buffer.from(String(clubId)).toString('base64');

  const html = `
    <div style="max-width:600px;margin:0 auto;">
      <h1 style="font-family:sans-serif;color:#FF0090;">Ripping Bombs — 4-Week Report</h1>
      <p style="font-family:sans-serif;color:#444;">Period ${reportPeriod.periodIndex + 1}, ${reportPeriod.year} — top 3 drives per division, week by week.</p>
      ${sections}
      <p style="font-family:sans-serif;font-size:11px;color:#999;margin-top:24px;">
        <a href="https://rippingbombs.com/unsubscribe?token=${unsubToken}" style="color:#999;">Unsubscribe from these emails</a>
      </p>
    </div>
  `;

  await resend.emails.send({
    from: 'team@rippingbombs.com',
    to: recipientEmail,
    subject: `Ripping Bombs — Period ${reportPeriod.periodIndex + 1} Report (${reportPeriod.year})`,
    html,
  });
}

// --- Handler ----------------------------------------------------------

export default async function handler(req, res) {
  const isCron = req.headers['x-vercel-cron'] === '1';
  const hasSecret = req.query.secret === process.env.CRON_SECRET;
  if (!isCron && !hasSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const info = getPeriodInfo(now);
    const force = req.query.force === '1';

    // In force mode (manual testing), report on the most recently completed
    // period even if today isn't actually a send day.
    let reportPeriod = info?.reportPeriod;
    if (force && !reportPeriod) {
      const year = info?.year ?? now.getUTCFullYear();
      const fallbackIndex = Math.max((info?.periodIndex ?? 0) - 1, 0);
      reportPeriod = getPeriodByIndex(year, fallbackIndex);
    }

    if (!reportPeriod) {
      return res.status(200).json({
        skipped: true,
        reason: !info
          ? 'before Week 1 (orphan days)'
          : !info.isFirstDayOfPeriod
          ? 'not the first day of a new period'
          : 'no completed period to report on yet (Period 1 just started)',
      });
    }

    const weeklyResults = [];
    for (const week of reportPeriod.weeks) {
      const byDivision = await getTopEntriesForWeek(week.weekStart, week.weekEnd);
      weeklyResults.push({ weekNumber: week.weekNumber, byDivision });
    }

    // ?to=someone@example.com overrides recipients for manual testing —
    // sends just the one test email instead of the full registered list.
    const testOverride = req.query.to;
    const recipients = testOverride
      ? [{ id: 'test', email: testOverride }]
      : await getRecipients();

    let sentCount = 0;
    const failures = [];
    for (const r of recipients) {
      try {
        await sendReport(reportPeriod, weeklyResults, r.email, r.id);
        sentCount++;
      } catch (sendErr) {
        failures.push({ email: r.email, error: sendErr.message });
      }
    }

    return res.status(200).json({
      success: true,
      period: reportPeriod.periodIndex + 1,
      year: reportPeriod.year,
      sentCount,
      totalRecipients: recipients.length,
      failures,
    });
  } catch (err) {
    console.error('period-report error:', err);
    return res.status(500).json({ error: err.message });
  }
}
