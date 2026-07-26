// pages/api/og/week-division.js
//
// Generates one division's leaderboard card (top 5) for social posting.
// Edge function using @vercel/og (Satori).
//
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview the design against seeded data. Never pass this from
// the real weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-division?week=32&year=2026&division=Men
// division must be one of DIVISIONS below (URL-encode spaces, e.g.
// "Men%20High%20Handicap").

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const ORG = '#FF0090';
const GOLD = '#FFB627';
const BG = '#0A0A0F';
const BG2 = '#15151D';
const TXT = '#F5F5F7';
const DIM = '#6E6E7A';
const BDR = '#232330';

const DISPLAY_FONT = 'Bebas Neue';

const DIVISIONS = [
  'Men',
  'Men High Handicap',
  'Women',
  'Women High Handicap',
  'Youth',
  'Seniors',
];

// --- Font loading ---------------------------------------------------------

async function loadDisplayFont() {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Bebas+Neue&text=${encodeURIComponent(
    'RIPPINGBOMS WEEKMNHIGDCPOAY0123456789· m'
  )}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error('Could not resolve Bebas Neue font URL');
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

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
  const includeDemo = searchParams.get('includeDemo') === '1';

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

  let query = supabase
    .from('entries')
    .select('player, dist, date, gender, hcp, age, facility, orgId, clubs(country)')
    .gte('date', target.weekStart.toISOString().slice(0, 10))
    .lt('date', target.weekEnd.toISOString().slice(0, 10))
    .order('dist', { ascending: false });

  if (!includeDemo) {
    query = query.not('id', 'ilike', '%demo%').not('orgId', 'ilike', '%demo%');
  }

  const { data, error } = await query;

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

  const displayFontData = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          backgroundImage: `linear-gradient(135deg, ${BG2} 0%, ${BG} 45%)`,
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: -110,
            right: -110,
            width: 300,
            height: 300,
            borderRadius: 999,
            backgroundImage: `linear-gradient(135deg, ${ORG}22 0%, ${ORG}00 70%)`,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, backgroundColor: GOLD, marginRight: 10 }} />
            <div style={{ display: 'flex', color: DIM, fontSize: 22, fontWeight: 600, letterSpacing: 4 }}>
              RIPPING BOMBS · WEEK {target.weekNumber} · {dateLabel.toUpperCase()}
            </div>
          </div>
          <div style={{ display: 'flex', color: ORG, fontSize: 88, fontFamily: DISPLAY_FONT, marginTop: 8, letterSpacing: 1 }}>
            {division.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: BG2,
                border: `1px dashed ${BDR}`,
                borderRadius: 24,
                padding: '40px 36px',
              }}
            >
              <div style={{ display: 'flex', color: DIM, fontSize: 30, fontWeight: 600 }}>
                No drives logged this week
              </div>
              <div style={{ display: 'flex', color: DIM, fontSize: 22, marginTop: 8, opacity: 0.8 }}>
                Check back once entries come in
              </div>
            </div>
          )}
          {entries.map((e, i) => {
            const isLeader = i === 0;
            const accent = isLeader ? GOLD : ORG;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: BG2,
                  border: `1px solid ${isLeader ? GOLD : BDR}`,
                  borderRadius: 20,
                  padding: '22px 32px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    backgroundColor: isLeader ? GOLD : 'transparent',
                    border: isLeader ? 'none' : `2px solid ${BDR}`,
                    marginRight: 28,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      color: isLeader ? BG : DIM,
                      fontSize: 30,
                      fontFamily: DISPLAY_FONT,
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', color: TXT, fontSize: 34, fontWeight: 600 }}>
                    {e.player}
                  </div>
                  {e.facility && (
                    <div style={{ display: 'flex', color: DIM, fontSize: 20, marginTop: 4 }}>
                      {e.facility}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', color: accent, fontSize: 52, fontFamily: DISPLAY_FONT }}>
                    {e.dist}
                  </div>
                  <div style={{ display: 'flex', color: accent, fontSize: 26, fontFamily: DISPLAY_FONT, marginLeft: 4 }}>
                    m
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [{ name: DISPLAY_FONT, data: displayFontData, weight: 400, style: 'normal' }],
    }
  );
}
