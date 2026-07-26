// pages/api/og/week-cover.js
//
// Generates the "WEEK XX RESULTS" cover image for social posting.
// Edge function using @vercel/og (Satori).
//
// Week numbering is imported directly from lib/constants (nowWeek/prevWeek/
// weekLabel — the same ISO-week system the live leaderboard uses), so this
// can never drift out of sync with what people see on the site.
//
// ?week=&year= — override the target week (year is the ISO week-year).
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview against seeded data. Never pass this from the real
// weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-cover?week=32&year=2026

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { BG, BG2, BDR, TXT, MUT, DIM, ORG, nowWeek, prevWeek, weekLabel, tier } from '../../../lib/constants';

export const config = { runtime: 'edge' };

const DISP_FAMILY = 'Bebas Neue';
const SANS_FAMILY = 'Inter';
const UNIT = 'yds';

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

// --- Week bounds (mirrors the Monday-anchor math inside lib/constants'
// isoWeek/weekLabel, so query boundaries line up exactly with what
// weekLabel() displays) -----------------------------------------------

function computeWeekBounds({ y, w }) {
  const j4 = new Date(y, 0, 4);
  const mon = new Date(j4);
  mon.setDate(j4.getDate() - ((j4.getDay() + 6) % 7) + (w - 1) * 7);
  const end = new Date(mon);
  end.setDate(mon.getDate() + 7);
  return { weekStart: mon, weekEnd: end };
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
    .select('player, dist, date, facility, orgId, clubs(country)')
    .gte('date', weekStart.toISOString().slice(0, 10))
    .lt('date', weekEnd.toISOString().slice(0, 10))
    .order('dist', { ascending: false })
    .limit(1);

  if (!includeDemo) {
    query = query.not('id', 'ilike', '%demo%').not('orgId', 'ilike', '%demo%');
  }

  const { data, error } = await query;
  if (error) return new Response(`Error: ${error.message}`, { status: 500 });

  const top = data?.[0]
    ? { ...data[0], dist: Number(data[0].dist), country: data[0].clubs?.country || null }
    : null;

  const [displayFont, sansRegular, sansBold] = await Promise.all([
    loadFont('Bebas+Neue', 400, 'RIPPING BOMBS WEEKLY CHAMPIONSHIP RESULTS LONGEST DRIVE OF THE 0123456789'),
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
          justifyContent: 'space-between',
          backgroundColor: BG,
          padding: '64px',
          fontFamily: SANS_FAMILY,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: MUT, fontSize: 15, fontWeight: 700, letterSpacing: 3 }}>
            RIPPING BOMBS
          </div>
          <div style={{ display: 'flex', color: ORG, fontSize: 15, fontWeight: 700, letterSpacing: 2, marginTop: 16 }}>
            🏆 WEEKLY CHAMPIONSHIP
          </div>
          <div
            style={{
              display: 'flex',
              color: TXT,
              fontSize: 150,
              lineHeight: 0.95,
              marginTop: 12,
              fontFamily: DISP_FAMILY,
            }}
          >
            WEEK {target.w}
          </div>
          <div style={{ display: 'flex', color: MUT, fontSize: 24, marginTop: 10 }}>
            {weekLabel(target)}
          </div>
        </div>

        <div style={{ display: 'flex', height: 1, backgroundColor: BDR, margin: '32px 0' }} />

        {top ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: BG2,
              border: `1px solid ${BDR}`,
              padding: '36px 40px',
            }}
          >
            <div style={{ display: 'flex', color: ORG, fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>
              LONGEST DRIVE OF THE WEEK
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 20 }}>
              <div style={{ display: 'flex', color: ORG, fontSize: 120, fontFamily: DISP_FAMILY }}>
                {top.dist}
              </div>
              <div style={{ display: 'flex', color: DIM, fontSize: 26, marginLeft: 8 }}>{UNIT}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
              <div style={{ display: 'flex', color: TXT, fontSize: 34, fontWeight: 700 }}>{top.player}</div>
              {top.country && (
                <img
                  src={`https://flagcdn.com/40x30/${top.country.toLowerCase()}.png`}
                  width={26}
                  height={19}
                  style={{ marginLeft: 12 }}
                />
              )}
              <div style={{ display: 'flex', color: ORG, fontSize: 20, marginLeft: 14 }}>{tier(top.dist)}</div>
            </div>
            {top.facility && (
              <div style={{ display: 'flex', color: MUT, fontSize: 20, marginTop: 8 }}>{top.facility}</div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: BG2,
              border: `1px solid ${BDR}`,
              padding: '36px 40px',
            }}
          >
            <div style={{ display: 'flex', color: MUT, fontSize: 26, fontWeight: 700 }}>
              No drives recorded this week
            </div>
          </div>
        )}
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
