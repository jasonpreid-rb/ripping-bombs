// pages/api/og/week-division.js
//
// Generates one division's leaderboard card (top 5) for social posting.
// Edge function using @vercel/og (Satori).
//
// Flags are pre-fetched and converted to base64 data URIs BEFORE the image
// is built, so a failed remote fetch surfaces as a catchable error instead
// of silently truncating the render to an empty 200 response.
//
// ?week=&year= — override the target week (year is the ISO week-year).
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview against seeded data. Never pass this from the real
// weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-division?week=32&year=2026&division=Men
// division must be one of DIVISIONS below (URL-encode spaces, e.g.
// "Men%20High%20Handicap").

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { BG, BDR, TXT, MUT, DIM, ORG, nowWeek, prevWeek, weekLabel } from '../../../lib/constants';

export const config = { runtime: 'edge' };

const DISP_FAMILY = 'Bebas Neue';
const SANS_FAMILY = 'Inter';
const UNIT = 'yds';

const DIVISIONS = [
  'Men',
  'Men High Handicap',
  'Women',
  'Women High Handicap',
  'Youth',
  'Seniors',
];

const LATIN_SAMPLE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ0123456789 .,'-–·";

// --- Font loading ---------------------------------------------------------

async function loadFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`Could not resolve font: ${family} ${weight}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

// --- Flag pre-fetching ------------------------------------------------

async function flagDataUri(code) {
  if (!code) return null;
  try {
    const res = await fetch(`https://flagcdn.com/w80/${code.toLowerCase()}.png`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

// --- Week bounds (mirrors lib/constants' isoWeek/weekLabel math) --------

function computeWeekBounds({ y, w }) {
  const j4 = new Date(y, 0, 4);
  const mon = new Date(j4);
  mon.setDate(j4.getDate() - ((j4.getDay() + 6) % 7) + (w - 1) * 7);
  const end = new Date(mon);
  end.setDate(mon.getDate() + 7);
  return { weekStart: mon, weekEnd: end };
}

// --- Division logic (mirrors period-report.js) ---------------------------

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

const MEDAL = ['🥇', '🥈', '🥉'];

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  try {
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

    const target = qWeek && qYear ? { y: Number(qYear), w: Number(qWeek) } : prevWeek(nowWeek());
    const { weekStart, weekEnd } = computeWeekBounds(target);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabase
      .from('entries')
      .select('player, dist, date, gender, hcp, age, facility, orgId, clubs(country)')
      .gte('date', weekStart.toISOString().slice(0, 10))
      .lt('date', weekEnd.toISOString().slice(0, 10))
      .order('dist', { ascending: false });

    if (!includeDemo) {
      query = query.not('id', 'ilike', '%demo%').not('orgId', 'ilike', '%demo%');
    }

    const { data, error } = await query;
    if (error) throw new Error(`Supabase query failed: ${error.message}`);

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

    const [displayFont, sansRegular, sansBold, flagUris] = await Promise.all([
      loadFont('Bebas+Neue', 400, 'RIPPING BOMBS WEEKLY CHAMPIONSHIP MEN WOMEN HIGH HANDICAP YOUTH SENIORS 0123456789'),
      loadFont('Inter', 400, LATIN_SAMPLE),
      loadFont('Inter', 700, LATIN_SAMPLE),
      Promise.all(entries.map((e) => flagDataUri(e.country))),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: BG,
            padding: '56px 60px',
            fontFamily: SANS_FAMILY,
          }}
        >
          <div style={{ display: 'flex', color: ORG, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
            🏆 WEEKLY CHAMPIONSHIP · {weekLabel(target).toUpperCase()}
          </div>
          <div style={{ display: 'flex', color: ORG, fontSize: 84, fontFamily: DISP_FAMILY, marginTop: 6 }}>
            {division.toUpperCase()}
          </div>

          <div style={{ display: 'flex', height: 1, backgroundColor: BDR, margin: '20px 0 0' }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: entries.length ? 'space-evenly' : 'center',
            }}
          >
            {entries.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', color: MUT, fontSize: 30 }}>No drives recorded this week</div>
              </div>
            )}
            {entries.map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingBottom: i < entries.length - 1 ? 20 : 0,
                  borderBottom: i < entries.length - 1 ? `1px solid ${BDR}` : 'none',
                }}
              >
                <div style={{ display: 'flex', width: 76, fontSize: i < 3 ? 42 : 30, color: DIM, fontWeight: 700 }}>
                  {MEDAL[i] || `#${i + 1}`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', color: TXT, fontSize: 38, fontWeight: 700 }}>{e.player}</div>
                    {flagUris[i] && (
                      <img src={flagUris[i]} width={36} height={27} style={{ marginLeft: 12, objectFit: 'cover' }} />
                    )}
                  </div>
                  {e.facility && (
                    <div style={{ display: 'flex', color: MUT, fontSize: 20, marginTop: 4 }}>{e.facility}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', color: ORG, fontSize: 60, fontFamily: DISP_FAMILY }}>{e.dist}</div>
                  <div style={{ display: 'flex', color: DIM, fontSize: 20, marginLeft: 8 }}>{UNIT}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', height: 1, backgroundColor: BDR, margin: '0 0 20px' }} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', color: DIM, fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
              RIPPINGBOMBS.COM
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        fonts: [
          { name: DISP_FAMILY, data: displayFont, weight: 400, style: 'normal' },
          { name: SANS_FAMILY, data: sansRegular, weight: 400, style: 'normal' },
          { name: SANS_FAMILY, data: sansBold, weight: 700, style: 'normal' },
        ],
      }
    );
  } catch (err) {
    console.error('week-division error:', err);
    return new Response(`week-division failed: ${err.message}\n\n${err.stack || ''}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  }
}
