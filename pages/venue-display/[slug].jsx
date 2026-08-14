// pages/venue-display/[slug].jsx
//
// Full-screen kiosk leaderboard, meant to run in a browser on a TV at a
// venue (e.g. Chrome kiosk mode pointed at rippingbombs.com/venue-display/ironwood).
// Rotates through divisions; each screen shows Venue / Global / All-Time
// for that division, side by side.
//
// NOTE: this page intentionally does NOT use the sharedProps pattern from
// _app.jsx (entries/orgs/cvt/unitLbl) — it needs its own venue-scoped data,
// not the global dataset every other page gets.

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { getVenueDisplayData } from '../../lib/venueDisplayData';

const ROTATE_MS = 16000;
const POLL_MS = 30000;

const FLAGS = { US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪' };

// Matches the slug logic already used on the dashboard and /clubs/[slug] —
// venues that haven't explicitly saved a custom URL still resolve via their
// auto-generated courseName slug, instead of 404ing.
function nameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getServerSideProps({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Try an exact match on the saved custom slug first
  let { data: club } = await supabase
    .from('clubs')
    .select('id, fullName, courseName, location, country, customSlug')
    .eq('customSlug', params.slug)
    .maybeSingle();

  // Fall back to the auto-generated (courseName-based) slug — covers venues
  // that haven't opened the profile editor and explicitly saved a custom URL yet.
  if (!club) {
    const { data: candidates } = await supabase
      .from('clubs')
      .select('id, fullName, courseName, location, country, customSlug');
    club = (candidates || []).find(c => nameToSlug(c.courseName || c.fullName) === params.slug) || null;
  }

  if (!club) {
    return { notFound: true };
  }

  // Paid-tier gate — see TODO in pages/api/venue-display/[slug].js
  // if (!club.displayEnabled) return { notFound: true };

  const displayName = club.courseName || club.fullName;
  const initialData = await getVenueDisplayData(supabase, club.id, displayName);

  return {
    props: {
      slug: params.slug,
      venue: {
        name: displayName,
        location: [club.location, club.country].filter(Boolean).join(', '),
      },
      initialData,
    },
  };
}

export default function VenueDisplay({ slug, venue, initialData }) {
  const [data, setData] = useState(initialData);
  const [current, setCurrent] = useState(0);
  const [entered, setEntered] = useState(true);
  const pollRef = useRef(null);
  const rotateRef = useRef(null);

  // poll for fresh data
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/venue-display/${slug}`, { cache: 'no-store' });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error('poll failed', e);
      }
    }, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [slug]);

  // rotate divisions
  useEffect(() => {
    rotateRef.current = setInterval(() => {
      setEntered(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % data.divisions.length);
        setEntered(true);
      }, 250);
    }, ROTATE_MS);
    return () => clearInterval(rotateRef.current);
  }, [data.divisions.length]);

  const div = data.divisions[current];
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Head>
        <title>{venue.name} — Live Leaderboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="tv">
        <header className="statusbar">
          <div className="venue-id">
            <div className="venue-mark">{initials(venue.name)}</div>
            <div className="venue-name-block">
              <div className="venue-name">{venue.name.toUpperCase()}</div>
              <div className="venue-loc">{venue.location}</div>
            </div>
          </div>

          <div className="status-right">
            <div className="live-pill"><span className="live-dot" />Week {data.week}</div>
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

            {data.sponsor && (
              <a
                className="sponsor-stage"
                href={data.sponsor.link || undefined}
                target={data.sponsor.link ? '_blank' : undefined}
                rel={data.sponsor.link ? 'noopener noreferrer' : undefined}
                style={{ pointerEvents: data.sponsor.link ? 'auto' : 'none' }}
              >
                <span className="sponsor-stage-label">Presented by</span>
                <img className="sponsor-stage-logo" src={data.sponsor.logoUrl} alt={data.sponsor.name || 'Sponsor'} />
                {data.sponsor.name && <span className="sponsor-stage-name">{data.sponsor.name}</span>}
              </a>
            )}
          </div>

          <div className={`dual ${entered ? 'in' : ''}`}>
            <Column tag="venue" label="Venue" name={`${venue.name}, this week`} rows={div.venue} unit={div.unit} />
            <Column tag="global" label="Global" name="All venues, this week" rows={div.global} unit={div.unit} />
            <Column tag="alltime" label="All-Time" name={`${venue.name} record book`} rows={div.allTime} unit={div.unit} />
          </div>
        </main>

        <footer className="ticker">
          <div className="dots">
            {data.divisions.map((d, i) => (
              <span key={d.key} className={`dot ${i === current ? 'active' : ''}`} />
            ))}
          </div>
          <div className="cta">
            <div className="qr" />
            <div className="cta-text">
              Scan to submit your drive · <b>rippingbombs.com/{slug}</b>
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
          text-decoration: none;
          flex-shrink: 0;
        }
        .sponsor-stage-label { font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mut); white-space: nowrap; }
        .sponsor-stage-logo { height: 60px; max-width: 320px; object-fit: contain; }
        .sponsor-stage-name { font-size: 20px; font-weight: 700; color: var(--txt); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
            {row.countryCode && FLAGS[row.countryCode] ? `${FLAGS[row.countryCode]} ` : ''}
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
