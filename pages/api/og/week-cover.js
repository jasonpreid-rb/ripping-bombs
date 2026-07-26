// pages/api/og/week-cover.js
//
// Generates the "WEEK XX RESULTS" cover image for social posting.
// Edge function using @vercel/og (Satori). Called with ?week=&year= or,
// if omitted, defaults to the most recently CLOSED week (last Mon–Sun).
//
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview the design against seeded data. Never pass this from
// the real weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-cover?week=32&year=2026

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

// --- Design tokens ------------------------------------------------------
// ORG (#FF0090) is the confirmed brand pink — kept as-is. GOLD is new: it
// marks the #1 / leader position throughout, so color itself carries rank
// meaning rather than just decorating. Swap BG/BG2/TXT/DIM/BDR for your
// exact lib/constants values if they differ.
const ORG = '#FF0090';
const GOLD = '#FFB627';
const BG = '#0A0A0F';
const BG2 = '#15151D';
const TXT = '#F5F5F7';
const DIM = '#6E6E7A';
const BDR = '#232330';

const DISPLAY_FONT = 'Bebas Neue';

// --- Font loading ---------------------------------------------------------

async function loadDisplayFont() {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Bebas+Neue&text=${encodeURIComponent(
    'RIPPINGBOMS WEEK0123456789· LONGESTDRIVEOFTH m'
  )}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error('Could not resolve Bebas Neue font URL');
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

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

// --- Signature motif: ball flight arc -----------------------------------
// A row of dots tracing a parabola, fading in as they approach the landing
// point — a visual shorthand for "trajectory" that ties directly to what a
// longest-drive leaderboard measures.

function TrajectoryArc() {
  const dots = 9;
  const items = Array.from({ length: dots }).map((_, i) => {
    const t = i / (dots - 1); // 0..1
    const arcHeight = 70;
    const y = -Math.sin(t * Math.PI) * arcHeight; // parabola, peak at t=0.5
    const size = 6 + t * 10; // grows toward landing
    const opacity = 0.25 + t * 0.75;
    return { y, size, opacity };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 90, position: 'relative', width: '100%' }}>
      {items.map((d, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            position: 'absolute',
            left: `${(i / (dots - 1)) * 92}%`,
            bottom: 90 + d.y,
            width: d.size,
            height: d.size,
            borderRadius: 999,
            backgroundColor: i === dots - 1 ? GOLD : ORG,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const qWeek = searchParams.get('week');
  const qYear = searchParams.get('year');
  const includeDemo = searchParams.get('includeDemo') === '1';

  const target = qWeek && qYear
    ? getWeekByNumber(Number(qYear), Number(qWeek))
    : getLastClosedWeek();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let query = supabase
    .from('entries')
    .select('player, dist, date, facility, orgId, clubs(country)')
    .gte('date', target.weekStart.toISOString().slice(0, 10))
    .lt('date', target.weekEnd.toISOString().slice(0, 10))
    .order('dist', { ascending: false })
    .limit(1);

  if (!includeDemo) {
    query = query.not('id', 'ilike', '%demo%').not('orgId', 'ilike', '%demo%');
  }

  const { data, error } = await query;

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

  const displayFontData = await loadDisplayFont();

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
          backgroundImage: `linear-gradient(135deg, ${BG2} 0%, ${BG} 45%)`,
          padding: '76px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* corner accent */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: -120,
            right: -120,
            width: 340,
            height: 340,
            borderRadius: 999,
            backgroundImage: `linear-gradient(135deg, ${ORG}22 0%, ${ORG}00 70%)`,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, backgroundColor: GOLD, marginRight: 14 }} />
            <div style={{ display: 'flex', color: DIM, fontSize: 26, fontWeight: 600, letterSpacing: 6 }}>
              RIPPING BOMBS
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              color: TXT,
              fontSize: 168,
              lineHeight: 0.95,
              marginTop: 18,
              fontFamily: DISPLAY_FONT,
              letterSpacing: 2,
            }}
          >
            WEEK {target.weekNumber}
          </div>
          <div style={{ display: 'flex', color: ORG, fontSize: 32, fontFamily: DISPLAY_FONT, letterSpacing: 4, marginTop: 6 }}>
            RESULTS · {dateLabel.toUpperCase()}
          </div>
          <TrajectoryArc />
        </div>

        {top ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: BG2,
              border: `1px solid ${BDR}`,
              borderRadius: 28,
              padding: '44px 52px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, backgroundColor: GOLD, marginRight: 10 }} />
              <div style={{ display: 'flex', color: GOLD, fontSize: 24, fontWeight: 700, letterSpacing: 3 }}>
                LONGEST DRIVE OF THE WEEK
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 20 }}>
              <div style={{ display: 'flex', color: ORG, fontSize: 130, fontFamily: DISPLAY_FONT }}>
                {top.dist}
              </div>
              <div style={{ display: 'flex', color: ORG, fontSize: 56, fontFamily: DISPLAY_FONT, marginLeft: 6 }}>
                m
              </div>
              <div style={{ display: 'flex', color: TXT, fontSize: 40, marginLeft: 32, fontWeight: 600 }}>
                {top.player}
              </div>
            </div>
            {top.facility && (
              <div style={{ display: 'flex', color: DIM, fontSize: 24, marginTop: 6 }}>{top.facility}</div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: BG2,
              border: `1px dashed ${BDR}`,
              borderRadius: 28,
              padding: '44px 52px',
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
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [{ name: DISPLAY_FONT, data: displayFontData, weight: 400, style: 'normal' }],
    }
  );
}
