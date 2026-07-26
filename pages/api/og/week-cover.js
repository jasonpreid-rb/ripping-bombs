// pages/api/og/week-cover.js
//
// Generates the "WEEK XX" cover image for social posting — a preview of
// all 6 divisions' leaders, with a swipe prompt into the category cards.
//
// Week numbering comes straight from lib/constants (nowWeek/prevWeek/
// weekLabel), so it can't drift out of sync with the live site.
//
// Flags and the brand icon are pre-fetched and converted to base64 data
// URIs BEFORE the image is built — if a remote fetch fails during Satori's
// own render/stream step, the whole response silently truncates to an
// empty 200 with no error. Resolving images ourselves first means any
// failure happens somewhere we can actually catch and report.
//
// ?week=&year= — override the target week (year is the ISO week-year).
// ?includeDemo=1 — TEST ONLY. Bypasses the demo/sample data exclusion so
// you can preview against seeded data. Never pass this from the real
// weekly-images-notify cron.
//
// Usage: https://rippingbombs.com/api/og/week-cover?week=32&year=2026

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { BDR, TXT, MUT, DIM, ORG, nowWeek, prevWeek, weekLabel } from '../../../lib/constants';

export const config = { runtime: 'edge' };

const DISP_FAMILY = 'Bebas Neue';
const SANS_FAMILY = 'Inter';
const UNIT = 'yds';

// True black for social — the site's actual BG (#1a1a1a) reads washed out
// at 1080px on a phone feed, so this deliberately diverges from that token.
const IMG_BG = '#000000';

// Assumes public/favicon.png — update if the icon lives at a different path.
const ICON_URL = 'https://rippingbombs.com/favicon.png';

const DIVISIONS = [
  { key: 'Men', label: 'Men' },
  { key: 'Men High Handicap', label: 'Men HC' },
  { key: 'Women', label: 'Women' },
  { key: 'Women High Handicap', label: 'Women HC' },
  { key: 'Youth', label: 'Youth' },
  { key: 'Seniors', label: 'Seniors' },
];

const LATIN_SAMPLE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ0123456789 .,'-–·→";

// --- Font loading ---------------------------------------------------------

async function loadFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`Could not resolve font: ${family} ${weight}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

// --- Remote image pre-fetching --------------------------------------------
// Returns a base64 data URI, or null if the fetch fails (so a bad image
// never takes down the whole render).

async function imageDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const contentType = res.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
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

// --- Handler -----------------------------------------------------------

export default async function handler(req) {
  try {
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
    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const withDivision = data.map((e) => ({
      ...e,
      dist: Number(e.dist),
      country: e.clubs?.country || null,
      division: computeDivision(e),
    }));

    const leaders = DIVISIONS.map(({ key, label }) => {
      const top = withDivision.filter((e) => e.division === key).sort((a, b) => b.dist - a.dist)[0] || null;
      return { label, entry: top };
    });

    const [displayFont, sansRegular, sansBold, iconUri, flagUris] = await Promise.all([
      loadFont('Bebas+Neue', 400, 'RIPPING BOMBS WEEKLY CHAMPIONSHIP 0123456789'),
      loadFont('Inter', 400, LATIN_SAMPLE),
      loadFont('Inter', 700, LATIN_SAMPLE),
      imageDataUri(ICON_URL),
      Promise.all(leaders.map(({ entry }) => imageDataUri(entry?.country ? `https://flagcdn.com/w80/${entry.country.toLowerCase()}.png` : null))),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: IMG_BG,
            padding: '60px 64px',
            fontFamily: SANS_FAMILY,
            position: 'relative',
          }}
        >
          {iconUri && (
            <img
              src={iconUri}
              width={56}
              height={56}
              style={{ position: 'absolute', top: 56, right: 56, objectFit: 'contain' }}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', color: ORG, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
              🏆 WEEKLY CHAMPIONSHIP
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

          <div style={{ display: 'flex', color: ORG, fontSize: 15, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
            THIS WEEK'S LEADERS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' }}>
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
                        {flagUris[i] && (
                          <img src={flagUris[i]} width={32} height={24} style={{ marginLeft: 10, objectFit: 'cover' }} />
                        )}
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

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', color: ORG, fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              SWIPE FOR FULL RESULTS →
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
    console.error('week-cover error:', err);
    return new Response(`week-cover failed: ${err.message}\n\n${err.stack || ''}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  }
}
