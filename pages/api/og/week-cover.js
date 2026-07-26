// pages/api/og/week-cover.js
//
// Generates the "WEEK XX RESULTS" cover image for social posting.
// Edge function using @vercel/og (Satori). Called with ?week=&year= or,
// if omitted, defaults to the most recently CLOSED week (last Mon–Sun).
//
// Usage: https://rippingbombs.com/api/og/week-cover?week=32&year=2026

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

// --- Design tokens ---------------------------------------------------
// Mirrors lib/constants — swap these for the exact hex values from that
// file if they differ (ORG confirmed as #FF0090 per project brand).
const ORG = '#FF0090';
const BG = '#0A0A0F';
const BG2 = '#15151D';
const TXT = '#FFFFFF';
const DIM = '#8A8A97';
const BDR = '#2A2A35';

// --- Period math (mirrors period-report.js) ---------------------------

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

// Given a date, find its week number using the same anchor logic as
// period-report.js (weekNumber = periodIndex*4 + w + 1, generalized).
// Handles the Jan 1 boundary by rolling back to the prior year's anchor
// if the date falls before this year's Week 1 start.
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

// Returns { weekStart, weekEnd, weekNumber, year } for the most recently
// CLOSED week (i.e. last Monday–Sunday, not the week currently in progress).
function getLastClosedWeek(now = new Date()) {
  const thisMonday = getMondayOnOrBefore(now);
  const weekStart = new Date(thisMonday);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const weekEnd = new Date(thisMonday); // exclusive
  const { year, weekNumber } = computeWeekNumber(weekStart);
  return { weekStart, weekEnd, weekNumber, year };
}

// Rebuilds a specific week's start/end from an explicit weekNumber/year
// (used when the query string overrides the default).
function getWeekByNumber(year, weekNumber) {
  const week1Start = getWeek1Start(year);
  const weekStart = new Date(week1Start);
  weekStart.setUTCDate(weekStart.getUTCDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  return { weekStart, weekEnd, weekNumber, year };
}

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const qWeek = searchParams.get('week');
  const qYear = searchParams.get('year');

  const target = qWeek && qYear
    ? getWeekByNumber(Number(qYear), Number(qWeek))
    : getLastClosedWeek();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('entries')
    .select('player, dist, date, facility, orgId, clubs(country)')
    .gte('date', target.weekStart.toISOString().slice(0, 10))
    .lt('date', target.weekEnd.toISOString().slice(0, 10))
    .not('id', 'ilike', '%demo%')
    .not('orgId', 'ilike', '%demo%')
    .order('dist', { ascending: false })
    .limit(1);

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  const top = data?.[0]
    ? { ...data[0], dist: Number(data[0].dist), country: data[0].clubs?.country || null }
    : null;

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
          justifyContent: 'space-between',
          backgroundColor: BG,
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: ORG, fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>
            RIPPING BOMBS
          </div>
          <div style={{ display: 'flex', color: TXT, fontSize: 110, fontWeight: 800, marginTop: 20 }}>
            WEEK {target.weekNumber}
          </div>
          <div style={{ display: 'flex', color: DIM, fontSize: 36, marginTop: 10 }}>
            RESULTS · {dateLabel}
          </div>
        </div>

        {top && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: BG2,
              border: `2px solid ${BDR}`,
              borderRadius: 24,
              padding: '40px 48px',
            }}
          >
            <div style={{ display: 'flex', color: DIM, fontSize: 26, letterSpacing: 2 }}>
              LONGEST DRIVE OF THE WEEK
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 16 }}>
              <div style={{ display: 'flex', color: ORG, fontSize: 90, fontWeight: 800 }}>
                {top.dist}m
              </div>
              <div style={{ display: 'flex', color: TXT, fontSize: 40, marginLeft: 28 }}>
                {top.player}
              </div>
            </div>
            {top.facility && (
              <div style={{ display: 'flex', color: DIM, fontSize: 24, marginTop: 8 }}>
                {top.facility}
              </div>
            )}
          </div>
        )}
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
