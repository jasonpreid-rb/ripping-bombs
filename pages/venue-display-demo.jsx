// pages/venue-display-demo.jsx
//
// Public, self-contained clone of pages/venue-display/[slug].jsx for sales
// purposes. Same component, layout, styling, and rotation behavior as the
// real kiosk display — but fed hardcoded sample data instead of hitting
// Supabase, so it's safe to link to venues without a real club/slug.
//
// Live at: rippingbombs.com/venue-display-demo
//
// If you ever change the visual design of pages/venue-display/[slug].jsx,
// copy those changes here too — this file intentionally does NOT import
// from that page, so it can never break if a real venue's data is missing
// or a slug 404s.

import { useEffect, useState } from 'react';
import Head from 'next/head';

const ROTATE_MS = 16000;

const VENUE = {
  name: 'Highland Ridge Golf Club',
  location: 'Austin, TX',
};

const WEEK = 32;

const DIVISIONS = [
  {
    key: 'overall',
    eyebrow: 'Overall',
    title: 'Longest Drives',
    sub: 'This week · Overall division',
    unit: 'YDS',
    venue: [
      { name: 'Marcus Reid', countryCode: 'US', meta: 'HCP 4', distance: 341, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'HCP 8', distance: 336, photo: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Tyler Osei', countryCode: 'US', meta: 'HCP 2', distance: 329, photo: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Sam Whitfield', countryCode: 'GB', meta: 'HCP 11', distance: 324, photo: 'https://i.pravatar.cc/150?img=15' },
      { name: 'Jake Bonnano', countryCode: 'US', meta: 'HCP 6', distance: 318, photo: 'https://i.pravatar.cc/150?img=22' },
    ],
    global: [
      { name: 'Elias Vogt', countryCode: 'DE', meta: 'Ironwood GC, Munich', distance: 352, photo: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Marcus Reid', countryCode: 'US', meta: 'Highland Ridge GC', distance: 341, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Ryan Cassidy', countryCode: 'AU', meta: 'Coastal Pines, Perth', distance: 339, photo: 'https://i.pravatar.cc/150?img=8' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'Highland Ridge GC', distance: 336, photo: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Ollie Pratt', countryCode: 'GB', meta: 'The Fairways, Leeds', distance: 333, photo: 'https://i.pravatar.cc/150?img=17' },
    ],
    allTime: [
      { name: 'Marcus Reid', countryCode: 'US', meta: 'Set Mar 2026', distance: 351, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Anthony Cruz', countryCode: 'US', meta: 'Set Nov 2025', distance: 347, photo: 'https://i.pravatar.cc/150?img=19' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'Set Jan 2026', distance: 344, photo: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Tyler Osei', countryCode: 'US', meta: 'Set Jun 2026', distance: 340, photo: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Sam Whitfield', countryCode: 'GB', meta: 'Set Feb 2026', distance: 337, photo: 'https://i.pravatar.cc/150?img=15' },
    ],
  },
  {
    key: 'low',
    eyebrow: 'Low Handicap',
    title: 'Low HCP Division',
    sub: 'HCP 0–16',
    unit: 'YDS',
    venue: [
      { name: 'Tyler Osei', countryCode: 'US', meta: 'HCP 2', distance: 329, photo: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Marcus Reid', countryCode: 'US', meta: 'HCP 4', distance: 341, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Jake Bonnano', countryCode: 'US', meta: 'HCP 6', distance: 318, photo: 'https://i.pravatar.cc/150?img=22' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'HCP 8', distance: 336, photo: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Priya Nair', countryCode: 'US', meta: 'HCP 12', distance: 301, photo: 'https://i.pravatar.cc/150?img=47' },
    ],
    global: [
      { name: 'Elias Vogt', countryCode: 'DE', meta: 'Ironwood GC, Munich', distance: 352, photo: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Ryan Cassidy', countryCode: 'AU', meta: 'Coastal Pines, Perth', distance: 339, photo: 'https://i.pravatar.cc/150?img=8' },
      { name: 'Marcus Reid', countryCode: 'US', meta: 'Highland Ridge GC', distance: 341, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Tyler Osei', countryCode: 'US', meta: 'Highland Ridge GC', distance: 329, photo: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'Highland Ridge GC', distance: 336, photo: 'https://i.pravatar.cc/150?img=33' },
    ],
    allTime: [
      { name: 'Marcus Reid', countryCode: 'US', meta: 'Set Mar 2026', distance: 351, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Tyler Osei', countryCode: 'US', meta: 'Set Jun 2026', distance: 340, photo: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Devon Clarke', countryCode: 'CA', meta: 'Set Jan 2026', distance: 344, photo: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Jake Bonnano', countryCode: 'US', meta: 'Set May 2026', distance: 322, photo: 'https://i.pravatar.cc/150?img=22' },
      { name: 'Priya Nair', countryCode: 'US', meta: 'Set Apr 2026', distance: 309, photo: 'https://i.pravatar.cc/150?img=47' },
    ],
  },
  {
    key: 'women',
    eyebrow: 'Women',
    title: "Women's Division",
    sub: 'This week · All handicaps',
    unit: 'YDS',
    venue: [
      { name: 'Priya Nair', countryCode: 'US', meta: 'HCP 12', distance: 301, photo: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Casey Lindgren', countryCode: 'US', meta: 'HCP 9', distance: 294, photo: 'https://i.pravatar.cc/150?img=49' },
      { name: 'Freya Holt', countryCode: 'GB', meta: 'HCP 15', distance: 287, photo: 'https://i.pravatar.cc/150?img=44' },
      { name: 'Maddie Okafor', countryCode: 'CA', meta: 'HCP 18', distance: 279, photo: 'https://i.pravatar.cc/150?img=29' },
      { name: 'Renee Duval', countryCode: 'US', meta: 'HCP 21', distance: 271, photo: 'https://i.pravatar.cc/150?img=26' },
    ],
    global: [
      { name: 'Lena Brandt', countryCode: 'DE', meta: 'Ironwood GC, Munich', distance: 312, photo: 'https://i.pravatar.cc/150?img=31' },
      { name: 'Priya Nair', countryCode: 'US', meta: 'Highland Ridge GC', distance: 301, photo: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Casey Lindgren', countryCode: 'US', meta: 'Highland Ridge GC', distance: 294, photo: 'https://i.pravatar.cc/150?img=49' },
      { name: 'Zara Bishop', countryCode: 'AU', meta: 'Coastal Pines, Perth', distance: 290, photo: 'https://i.pravatar.cc/150?img=38' },
      { name: 'Freya Holt', countryCode: 'GB', meta: 'Highland Ridge GC', distance: 287, photo: 'https://i.pravatar.cc/150?img=44' },
    ],
    allTime: [
      { name: 'Priya Nair', countryCode: 'US', meta: 'Set Apr 2026', distance: 309, photo: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Casey Lindgren', countryCode: 'US', meta: 'Set Feb 2026', distance: 298, photo: 'https://i.pravatar.cc/150?img=49' },
      { name: 'Freya Holt', countryCode: 'GB', meta: 'Set Dec 2025', distance: 291, photo: 'https://i.pravatar.cc/150?img=44' },
      { name: 'Maddie Okafor', countryCode: 'CA', meta: 'Set Jun 2026', distance: 283, photo: 'https://i.pravatar.cc/150?img=29' },
      { name: 'Renee Duval', countryCode: 'US', meta: 'Set Mar 2026', distance: 275, photo: 'https://i.pravatar.cc/150?img=26' },
    ],
  },
  {
    key: 'seniors',
    eyebrow: 'Seniors',
    title: 'Seniors Division',
    sub: 'This week · Age 55+',
    unit: 'YDS',
    venue: [
      { name: 'Gary Fenwick', countryCode: 'US', meta: 'HCP 10', distance: 279, photo: 'https://i.pravatar.cc/150?img=51' },
      { name: 'Robert Chan', countryCode: 'CA', meta: 'HCP 14', distance: 271, photo: 'https://i.pravatar.cc/150?img=52' },
      { name: 'Ian Sutcliffe', countryCode: 'GB', meta: 'HCP 7', distance: 268, photo: 'https://i.pravatar.cc/150?img=53' },
      { name: 'Dale Morrison', countryCode: 'US', meta: 'HCP 16', distance: 259, photo: 'https://i.pravatar.cc/150?img=54' },
      { name: 'Frank Delvecchio', countryCode: 'US', meta: 'HCP 19', distance: 251, photo: 'https://i.pravatar.cc/150?img=55' },
    ],
    global: [
      { name: 'Klaus Richter', countryCode: 'DE', meta: 'Ironwood GC, Munich', distance: 288, photo: 'https://i.pravatar.cc/150?img=56' },
      { name: 'Gary Fenwick', countryCode: 'US', meta: 'Highland Ridge GC', distance: 279, photo: 'https://i.pravatar.cc/150?img=51' },
      { name: 'Neil Ashworth', countryCode: 'AU', meta: 'Coastal Pines, Perth', distance: 274, photo: 'https://i.pravatar.cc/150?img=57' },
      { name: 'Robert Chan', countryCode: 'CA', meta: 'Highland Ridge GC', distance: 271, photo: 'https://i.pravatar.cc/150?img=52' },
      { name: 'Ian Sutcliffe', countryCode: 'GB', meta: 'Highland Ridge GC', distance: 268, photo: 'https://i.pravatar.cc/150?img=53' },
    ],
    allTime: [
      { name: 'Gary Fenwick', countryCode: 'US', meta: 'Set Jan 2026', distance: 284, photo: 'https://i.pravatar.cc/150?img=51' },
      { name: 'Robert Chan', countryCode: 'CA', meta: 'Set May 2026', distance: 277, photo: 'https://i.pravatar.cc/150?img=52' },
      { name: 'Ian Sutcliffe', countryCode: 'GB', meta: 'Set Mar 2026', distance: 270, photo: 'https://i.pravatar.cc/150?img=53' },
      { name: 'Dale Morrison', countryCode: 'US', meta: 'Set Nov 2025', distance: 263, photo: 'https://i.pravatar.cc/150?img=54' },
      { name: 'Frank Delvecchio', countryCode: 'US', meta: 'Set Jun 2026', distance: 255, photo: 'https://i.pravatar.cc/150?img=55' },
    ],
  },
];

export default function VenueDisplayDemo() {
  const [current, setCurrent] = useState(0);
  const [entered, setEntered] = useState(true);
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    const rotate = setInterval(() => {
      setEntered(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % DIVISIONS.length);
        setEntered(true);
      }, 250);
    }, ROTATE_MS);
    return () => clearInterval(rotate);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const div = DIVISIONS[current];

  return (
    <>
      <Head>
        <title>{VENUE.name} — Live Leaderboard (Demo)</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="tv">
        <div className="demo-badge">Sample data · Demo</div>

        <header className="statusbar">
          <div className="venue-id">
            <div className="venue-mark">{initials(VENUE.name)}</div>
            <div className="venue-name-block">
              <div className="venue-name">{VENUE.name.toUpperCase()}</div>
              <div className="venue-loc">{VENUE.location}</div>
            </div>
          </div>

          <div className="status-right">
            <div className="live-pill"><span className="live-dot" />Week {WEEK}</div>
            <div className="clock">{clock}</div>
          </div>
        </header>

        <main className="stage">
          <div className="view-header">
            <div>
              <div className="view-eyebrow">{div.eyebrow}</div>
              <div className="view-title">{div.title}</div>
              <div className="view-sub">{div.sub}</div>
            </div>

            <div className="sponsor-stage">
              <span className="sponsor-stage-label">Presented by</span>
              <div className="sponsor-stage-placeholder">TITLEIST</div>
            </div>
          </div>

          <div className={`dual ${entered ? 'in' : ''}`}>
            <Column tag="venue" label="Venue" name={`${VENUE.name}, this week`} rows={div.venue} unit={div.unit} />
            <Column tag="global" label="Global" name="All venues, this week" rows={div.global} unit={div.unit} />
            <Column tag="alltime" label="All-Time" name={`${VENUE.name} record book`} rows={div.allTime} unit={div.unit} />
          </div>
        </main>

        <footer className="ticker">
          <div className="dots">
            {DIVISIONS.map((d, i) => (
              <span key={d.key} className={`dot ${i === current ? 'active' : ''}`} />
            ))}
          </div>
          <div className="cta">
            <div className="qr" />
            <div className="cta-text">
              Scan to submit your drive · <b>rippingbombs.com/your-venue</b>
            </div>
          </div>
          <div className="wordmark">RIPPING<b>BOMBS</b></div>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --bg: #08080c;
          --panel: #121218;
          --panel2: #1a1a22;
          --bdr: #25252f;
          --org: #ff0090;
          --gold: #e8c170;
          --silver: #c7ccd6;
          --bronze: #d99567;
          --txt: #f5f5f7;
          --mut: #8a8a96;
          --disp: 'Bebas Neue', sans-serif;
          --sans: 'Inter', sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }
        html, body { margin: 0; padding: 0; background: var(--bg); overflow: hidden; }
      `}</style>

      <style jsx>{`
        .tv {
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(ellipse 900px 500px at 50% -10%, rgba(255, 0, 144, 0.1), transparent 60%),
            var(--bg);
          color: var(--txt);
          font-family: var(--sans);
          position: relative;
        }
        .demo-badge {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 0, 144, 0.14);
          border: 1px solid rgba(255, 0, 144, 0.4);
          color: var(--org);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 5px;
          z-index: 5;
        }
        .statusbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 40px;
          border-bottom: 1px solid var(--bdr);
          flex-shrink: 0;
        }
        .venue-id { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .venue-mark {
          width: 40px; height: 40px; border-radius: 8px;
          background: linear-gradient(145deg, var(--org), #7a0048);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--disp); font-size: 20px;
        }
        .venue-name-block { display: flex; flex-direction: column; line-height: 1.15; }
        .venue-name { font-family: var(--disp); font-size: 22px; letter-spacing: 1px; }
        .venue-loc { font-size: 11px; color: var(--mut); letter-spacing: 1.5px; text-transform: uppercase; }
        .status-right { display: flex; align-items: center; gap: 28px; flex-shrink: 0; }
        .live-pill { display: flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--mut); }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--org); box-shadow: 0 0 8px 2px rgba(255, 0, 144, 0.6); animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .clock { font-family: var(--mono); font-size: 15px; letter-spacing: 1px; }

        .stage { flex: 1; padding: 34px 40px 10px; display: flex; flex-direction: column; min-height: 0; }

        .view-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; flex-shrink: 0; }
        .view-eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--org); font-weight: 700; }
        .view-title { font-family: var(--disp); font-size: 40px; letter-spacing: 1px; margin-top: 2px; }
        .view-sub { font-size: 13px; color: var(--mut); margin-top: 4px; }

        .sponsor-stage {
          display: flex;
          align-items: center;
          gap: 18px;
          background: var(--panel);
          border: 1px solid rgba(255, 0, 144, 0.3);
          border-radius: 14px;
          padding: 18px 30px;
          flex-shrink: 0;
        }
        .sponsor-stage-label { font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mut); white-space: nowrap; }
        .sponsor-stage-placeholder {
          font-family: var(--disp);
          font-size: 30px;
          letter-spacing: 1px;
          color: var(--txt);
          white-space: nowrap;
        }

        .dual {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          min-height: 0;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .dual.in { opacity: 1; transform: translateY(0); }
        .dual::before, .dual::after {
          content: ''; position: absolute; top: 4px; bottom: 4px; width: 1px;
          background: linear-gradient(to bottom, transparent, var(--bdr) 15%, var(--bdr) 85%, transparent);
        }
        .dual::before { left: calc(33.333% - 10px); }
        .dual::after { left: calc(66.666% - 10px); }

        .ticker { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 40px 22px; gap: 20px; }
        .dots { display: flex; gap: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bdr); transition: background 0.3s ease, transform 0.3s ease; }
        .dot.active { background: var(--org); transform: scale(1.25); }
        .cta { display: flex; align-items: center; gap: 12px; color: var(--mut); font-size: 12px; }
        .qr { width: 44px; height: 44px; background: #fff; border-radius: 6px; }
        .cta-text b { color: var(--txt); }
        .wordmark { font-family: var(--disp); font-size: 14px; letter-spacing: 1px; color: var(--mut); }
        .wordmark b { color: var(--org); }
      `}</style>
    </>
  );
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Column({ tag, label, name, rows, unit }) {
  return (
    <div className="col">
      <div className="col-head">
        <span className={`col-tag ${tag}`}>{label}</span>
        <span className="col-name">{name}</span>
      </div>
      <div className="rows">
        {rows.length === 0 && <div className="empty">No entries yet</div>}
        {rows.map((row, i) => (
          <Row key={i} rank={i + 1} row={row} unit={unit} />
        ))}
      </div>

      <style jsx>{`
        .col { display: flex; flex-direction: column; min-height: 0; }
        .col-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-shrink: 0; }
        .col-tag { font-size: 10px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; padding: 4px 9px; border-radius: 5px; white-space: nowrap; }
        .col-tag.venue { color: var(--org); background: rgba(255, 0, 144, 0.12); border: 1px solid rgba(255, 0, 144, 0.3); }
        .col-tag.global { color: #7fc8ff; background: rgba(127, 200, 255, 0.1); border: 1px solid rgba(127, 200, 255, 0.28); }
        .col-tag.alltime { color: var(--gold); background: rgba(232, 193, 112, 0.1); border: 1px solid rgba(232, 193, 112, 0.3); }
        .col-name { font-size: 12px; color: var(--mut); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rows { flex: 1; display: flex; flex-direction: column; gap: 9px; min-height: 0; }
        .empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--mut); font-size: 13px; background: var(--panel); border: 1px dashed var(--bdr); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Row({ rank, row, unit }) {
  const rankClass = rank <= 3 ? `r${rank}` : '';
  return (
    <div className={`row ${rankClass}`}>
      <div className="rank">{rank}</div>
      <div className="player">
        <div
          className="avatar"
          style={{ backgroundImage: row.photo ? `url(${row.photo})` : undefined }}
        />
        <div className="pname-block">
          <div className="pname">
            {row.countryCode && (
              <img
                src={`https://flagcdn.com/20x15/${row.countryCode.toLowerCase()}.png`}
                alt={row.countryCode}
                width={16}
                height={12}
                className="flag"
              />
            )}
            {row.name}
          </div>
          <div className="pmeta">{row.meta}</div>
        </div>
      </div>
      <div className="distance">
        {row.distance}
        <span className="unit">{unit}</span>
      </div>

      <style jsx>{`
        .flag {
          display: inline-block;
          vertical-align: middle;
          margin-right: 5px;
          border-radius: 2px;
          margin-top: -2px;
        }
        .row {
          display: flex; align-items: center; background: var(--panel);
          border: 1px solid var(--bdr); border-radius: 10px; padding: 0 14px;
          flex: 1; min-height: 0; position: relative; overflow: hidden;
        }
        .row::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: transparent; }
        .row.r1::before { background: var(--gold); box-shadow: 0 0 14px 1px rgba(232, 193, 112, 0.5); }
        .row.r2::before { background: var(--silver); }
        .row.r3::before { background: var(--bronze); }
        .row.r1 { background: linear-gradient(90deg, rgba(232, 193, 112, 0.08), var(--panel) 30%); border-color: rgba(232, 193, 112, 0.35); }
        .row.r2 { background: linear-gradient(90deg, rgba(199, 204, 214, 0.06), var(--panel) 30%); }
        .row.r3 { background: linear-gradient(90deg, rgba(217, 149, 103, 0.06), var(--panel) 30%); }

        .rank { font-family: var(--disp); font-size: 20px; width: 30px; flex-shrink: 0; color: var(--mut); }
        .row.r1 .rank { color: var(--gold); font-size: 24px; }
        .row.r2 .rank { color: var(--silver); font-size: 22px; }
        .row.r3 .rank { color: var(--bronze); font-size: 22px; }

        .player { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--panel2); border: 1px solid var(--bdr); flex-shrink: 0; background-size: cover; background-position: center; }
        .pname-block { min-width: 0; }
        .pname { font-weight: 700; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pmeta { font-size: 9.5px; color: var(--mut); letter-spacing: 0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .distance { font-family: var(--mono); font-weight: 700; font-size: 17px; flex-shrink: 0; display: flex; align-items: baseline; gap: 3px; }
        .distance .unit { font-size: 9.5px; color: var(--mut); font-weight: 500; }
        .row.r1 .distance { color: var(--gold); font-size: 19px; }
        .row.r2 .distance { color: var(--silver); }
        .row.r3 .distance { color: var(--bronze); }
      `}</style>
    </div>
  );
}
