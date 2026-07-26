// pages/api/og/week-cover.js
//
// Generates the "WEEK XX" cover image for social posting — functions as a
// preview/index of all 6 divisions so people have a reason to keep
// swiping through to the individual category cards.
//
// Week numbering comes straight from lib/constants (nowWeek/prevWeek/
// weekLabel), so it can't drift out of sync with the live site.
//
// ?week=&year= — override the target week (year is the ISO week-year).
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview against seeded data. Never pass this from the real
// weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-cover?week=32&year=2026

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { BG, BG2, BDR, TXT, MUT, DIM, ORG, nowWeek, prevWeek, weekLabel } from '../../../lib/constants';

export const config = { runtime: 'edge' };

const DISP_FAMILY = 'Bebas Neue';
const SANS_FAMILY = 'Inter';
const UNIT = 'yds';

// Short labels keep the leaders list from wrapping — full division names
// still used for computeDivision() matching.
const DIVISIONS = [
  { key: 'Men', label: 'Men' },
  { key: 'Men High Handicap', label: 'Men HC' },
  { key: 'Women', label: 'Women' },
  { key: 'Women High Handicap', label: 'Women HC' },
  { key: 'Youth', label: 'Youth' },
  { key: 'Seniors', label: 'Seniors' },
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

// Flags: use flagcdn's w80 source (crisper than upscaling a 40x30 file)
// displayed smaller for a high-DPI-sharp result.
function Flag({ code, width, height }) {
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      width={width}
      height={height}
      style={{ marginLeft: 10, objectFit: 'cover' }}
    />
  );
}

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const qWeek = searchParams.get('week');
  const qYear = searchParams.get('year');
  const includeDemo = searchParams.get('includeDemo') === '1';

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
  if (error) return new Response(`Error: ${error.message}`, { status: 500 });

  const withDivision = data.map((e) => ({
    ...e,
    dist: Number(e.dist),
    country: e.clubs?.country || null,
    division: computeDivision(e),
  }));

  // Top entry per division, for the leaders preview list.
  const leaders = DIVISIONS.map(({ key, label }) => {
    const top = withDivision.filter((e) => e.division === key).sort((a, b) => b.dist - a.dist)[0] || null;
    return { label, entry: top };
  });

  const [displayFont, sansRegular, sansBold] = await Promise.all([
    loadFont('Bebas+Neue', 400, 'RIPPING BOMBS WEEKLY CHAMPIONSHIP 0123456789'),
    loadFont('Inter', 400, LATIN_SAMPLE),
    loadFont('Inter', 700, LATIN_SAMPLE),
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
          padding: '60px 64px',
          fontFamily: SANS_FAMILY,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', color: MUT, fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>
              RIPPING BOMBS
            </div>
            <div style={{ display: 'flex', color: BDR, fontSize: 14, margin: '0 10px' }}>·</div>
            <div style={{ display: 'flex', color: ORG, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
              🏆 WEEKLY CHAMPIONSHIP
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              color: TXT,
              fontSize: 118,
              lineHeight: 0.95,
              marginTop: 8,
              fontFamily: DISP_FAMILY,
            }}
          >
            WEEK {target.w}
          </div>
          <div style={{ display: 'flex', color: MUT, fontSize: 22, marginTop: 6 }}>{weekLabel(target)}</div>
        </div>

        <div style={{ display: 'flex', height: 1, backgroundColor: BDR, margin: '28px 0' }} />

        {/* Leaders preview — fills remaining space, spread evenly */}
        <div style={{ display: 'flex', color: ORG, fontSize: 15, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
          THIS WEEK'S LEADERS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-evenly' }}>
          {leaders.map(({ label, entry }, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${BDR}`,
                paddingBottom: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', color: DIM, fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
                  {label.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                  {entry ? (
                    <>
                      <div style={{ display: 'flex', color: TXT, fontSize: 34, fontWeight: 700 }}>
                        {entry.player}
                      </div>
                      <Flag code={entry.country} width={32} height={24} />
                    </>
                  ) : (
                    <div style={{ display: 'flex', color: DIM, fontSize: 26 }}>No entries yet</div>
                  )}
                </div>
              </div>
              {entry && (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', color: ORG, fontSize: 56, fontFamily: DISP_FAMILY }}>
                    {entry.dist}
                  </div>
                  <div style={{ display: 'flex', color: DIM, fontSize: 20, marginLeft: 6 }}>{UNIT}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA footer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', color: ORG, fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
            FULL RESULTS IN EACH CATEGORY BELOW ↓
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
}
