// pages/api/og/week-division.js
//
// Generates one division's leaderboard card (top 5) for social posting.
// Edge function using @vercel/og (Satori).
//
// Usage: https://rippingbombs.com/api/og/week-division?week=32&year=2026&division=Men
// division must be one of DIVISIONS below (URL-encode spaces, e.g.
// "Men%20High%20Handicap").

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const ORG = '#FF0090';
const BG = '#0A0A0F';
const BG2 = '#15151D';
const TXT = '#FFFFFF';
const DIM = '#8A8A97';
const BDR = '#2A2A35';

const DIVISIONS = [
  'Men',
  'Men High Handicap',
  'Women',
  'Women High Handicap',
  'Youth',
  'Seniors',
];

// --- Period math (mirrors period-report.js / week-cover.js) -----------

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
  const weekEnd = new Date(thisMonday);
  const { year, weekNumber } = computeWeekNumber(weekStart);
  return { weekStart, weekEnd, weekNumber, year };
}

function getWeekByNumber(year, weekNumber) {
  const week1Start = getWeek1Start(year);
  const weekStart = new Date(week1Start);
  weekStart.setUTCDate(weekStart.getUTCDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  return { weekStart, weekEnd, weekNumber, year };
}

// --- Division logic (mirrors period-report.js) -------------------------

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

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const qWeek = searchParams.get('week');
  const qYear = searchParams.get('year');
  const division = searchParams.get('division');

  if (!division || !DIVISIONS.includes(division)) {
    return new Response(
      `Invalid or missing "division". Must be one of: ${DIVISIONS.join(', ')}`,
      { status: 400 }
    );
  }

  const target = qWeek && qYear
    ? getWeekByNumber(Number(qYear), Number(qWeek))
    : getLastClosedWeek();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('entries')
    .select('player, dist, date, gender, hcp, age, facility, orgId, clubs(country)')
    .gte('date', target.weekStart.toISOString().slice(0, 10))
    .lt('date', target.weekEnd.toISOString().slice(0, 10))
    .not('id', 'ilike', '%demo%')
    .not('orgId', 'ilike', '%demo%')
    .order('dist', { ascending: false });

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  const entries = data
    .map((e) => ({
      ...e,
      dist: Number(e.dist),
      country: e.clubs?.country || null,
      division: computeDivision(e),
    }))
    .filter((e) => e.division === division)
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 5);

  const dateLabel = `${target.weekStart.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })} – ${new Date(target.weekEnd.getTime() - 86400000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 40 }}>
          <div style={{ display: 'flex', color: DIM, fontSize: 24, letterSpacing: 3 }}>
            RIPPING BOMBS · WEEK {target.weekNumber} · {dateLabel}
          </div>
          <div style={{ display: 'flex', color: ORG, fontSize: 64, fontWeight: 800, marginTop: 12 }}>
            {division.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.length === 0 && (
            <div style={{ display: 'flex', color: DIM, fontSize: 32 }}>No entries this week</div>
          )}
          {entries.map((e, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: BG2,
                border: `2px solid ${i === 0 ? ORG : BDR}`,
                borderRadius: 20,
                padding: '24px 36px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: i === 0 ? ORG : DIM,
                  fontSize: 44,
                  fontWeight: 800,
                  width: 80,
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', color: TXT, fontSize: 36, fontWeight: 600 }}>
                  {e.player}
                </div>
                {e.facility && (
                  <div style={{ display: 'flex', color: DIM, fontSize: 22, marginTop: 4 }}>
                    {e.facility}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', color: ORG, fontSize: 48, fontWeight: 800 }}>
                {e.dist}m
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
