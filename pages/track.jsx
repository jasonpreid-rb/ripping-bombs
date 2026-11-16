// pages/track.jsx
//
// Free GPS drive tracker. Anyone can measure a drive without an account.
// Submitting sends the player to /submit with the drive pre-filled. Logged-out
// players are taken through login/registration there and come straight back.

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  savePendingDrive,
  getPendingDrive,
  clearPendingDrive,
  formatDistance,
  metersToUnit,
  buildSubmitUrl,
  UNIT_KEY,
} from '../lib/pendingDrive';

// ---- Config -------------------------------------------------------------

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const MAX_ACCURACY_M = 50; // reject a mark if GPS is worse than this
const SAMPLE_MS = 3000; // how long to listen for the best fix when marking
const LOOKUP_RADIUS_M = 300; // nearby search radius for ranges/courses

// ---- GPS helpers --------------------------------------------------------

function sampleBest(ms = SAMPLE_MS, hardMs = 15000) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({ code: 'unsupported' });
      return;
    }
    let best = null;
    let done = false;
    let minElapsed = false;
    let watchId = null;
    let t1 = null;
    let t2 = null;

    const end = (fn, val) => {
      if (done) return;
      done = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      clearTimeout(t1);
      clearTimeout(t2);
      fn(val);
    };

    watchId = navigator.geolocation.watchPosition(
      (p) => {
        const c = p.coords;
        if (!best || c.accuracy < best.acc) {
          best = { lat: c.latitude, lng: c.longitude, acc: c.accuracy };
        }
        if (minElapsed) end(resolve, best);
      },
      (err) => {
        if (best) end(resolve, best);
        else end(reject, { code: err.code === 1 ? 'denied' : 'no-fix' });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: hardMs }
    );
    t1 = setTimeout(() => {
      minElapsed = true;
      if (best) end(resolve, best);
    }, ms);
    t2 = setTimeout(() => end(reject, { code: 'no-fix' }), hardMs);
  });
}

function distanceMeters(a, b) {
  const R = 6371008.8;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function gpsQuality(acc) {
  if (acc == null) return { label: 'Waiting for GPS', cls: 'wait' };
  const r = Math.round(acc);
  if (acc <= 10) return { label: `Strong GPS signal (±${r} m)`, cls: 'good' };
  if (acc <= 25) return { label: `Fair GPS signal (±${r} m)`, cls: 'fair' };
  return { label: `Weak GPS signal (±${r} m). Move to open sky.`, cls: 'weak' };
}

function describeError(e) {
  switch (e && e.code) {
    case 'denied':
      return 'Location is blocked. Allow location for this site in your browser settings, then reload the page.';
    case 'unsupported':
      return "This browser can't access GPS. Try Safari or Chrome on your phone.";
    case 'weak':
      return `GPS is too weak right now (±${Math.round(e.acc)} m). Wait for the signal to improve, then try again.`;
    default:
      return "Couldn't get a GPS fix. Move to open sky and try again.";
  }
}

// ---- Course / range lookup (OpenStreetMap via Overpass) -----------------

async function findPlaces(lat, lng, signal) {
  const la = lat.toFixed(5);
  const lo = lng.toFixed(5);
  const query = `[out:json][timeout:12];
is_in(${la},${lo})->.a;
(
  area.a["leisure"="golf_course"];
  area.a["golf"="driving_range"];
  nwr(around:${LOOKUP_RADIUS_M},${la},${lo})["leisure"="golf_course"];
  nwr(around:${LOOKUP_RADIUS_M},${la},${lo})["golf"="driving_range"];
);
out tags center;`;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
    signal,
  });
  if (!res.ok) throw new Error('lookup failed: ' + res.status);
  const json = await res.json();

  // Areas that contain the tee point come first, then nearby matches.
  const elements = (json.elements || []).slice().sort((x, y) => {
    return (y.type === 'area' ? 1 : 0) - (x.type === 'area' ? 1 : 0);
  });
  const seen = new Set();
  const items = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'];
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ name, kind: tags.golf === 'driving_range' ? 'range' : 'course' });
  }
  return items.slice(0, 5);
}

// ---- Result card (used as the evidence image on /submit) -----------------

function fitFont(ctx, text, maxWidth, startSize, weight, family) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

async function renderDriveCard({ meters, unc, placeName, at }) {
  const DISPLAY = '"Bebas Neue", Impact, sans-serif';
  const BODY = 'Inter, system-ui, sans-serif';
  try {
    await Promise.all([
      document.fonts.load(`200px ${DISPLAY}`),
      document.fonts.load(`600 40px ${BODY}`),
    ]);
  } catch {
    // fall back to the system fonts in the stacks above
  }

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const yd = Math.round(meters * 1.0936133);
  const m = Math.round(meters);
  const uncYd = Math.max(1, Math.round(unc * 1.0936133));

  ctx.fillStyle = '#0d0d10';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ff0090';
  ctx.fillRect(0, 0, W, 16);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f4f4f6';
  ctx.font = `64px ${DISPLAY}`;
  ctx.fillText('RIPPING BOMBS', 80, 140);
  ctx.fillStyle = '#a0a0ad';
  ctx.font = `500 34px ${BODY}`;
  ctx.fillText('GPS-tracked drive', 80, 192);

  // The one big thing: the distance.
  ctx.fillStyle = '#ff0090';
  ctx.font = `440px ${DISPLAY}`;
  ctx.fillText(String(yd), 80, 610);
  const numW = ctx.measureText(String(yd)).width;
  ctx.fillStyle = '#f4f4f6';
  ctx.font = `110px ${DISPLAY}`;
  ctx.fillText('YARDS', 80 + numW + 28, 610);

  ctx.fillStyle = '#a0a0ad';
  ctx.font = `500 36px ${BODY}`;
  ctx.fillText(`${m} meters. GPS accuracy ±${uncYd} yds.`, 80, 690);

  // Tee-to-ball line.
  const y = 800;
  ctx.strokeStyle = '#2b2b34';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(130, y);
  ctx.lineTo(950, y);
  ctx.stroke();
  ctx.fillStyle = '#f4f4f6';
  ctx.beginPath();
  ctx.arc(130, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff0090';
  ctx.beginPath();
  ctx.arc(950, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a0a0ad';
  ctx.font = `500 30px ${BODY}`;
  ctx.textAlign = 'center';
  ctx.fillText('Tee', 130, y + 62);
  ctx.fillText('Ball', 950, y + 62);
  ctx.textAlign = 'left';

  let nextY = 920;
  if (placeName) {
    ctx.fillStyle = '#f4f4f6';
    fitFont(ctx, placeName, 920, 56, 600, BODY);
    ctx.fillText(placeName, 80, nextY);
    nextY += 56;
  }
  ctx.fillStyle = '#a0a0ad';
  ctx.font = `500 32px ${BODY}`;
  const when = new Date(at);
  ctx.fillText(
    when.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    80,
    nextY
  );

  ctx.font = `500 26px ${BODY}`;
  ctx.fillText('Measured with the Ripping Bombs GPS tracker', 80, 1030);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// ---- Page ---------------------------------------------------------------

export default function TrackPage({ unit: siteUnit, setUnit: setSiteUnit }) {
  const router = useRouter();

  const [step, setStep] = useState('intro'); // intro | tee | ball | result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [liveAcc, setLiveAcc] = useState(null);
  const [localUnit, setLocalUnit] = useState('yd');
  // Use the site-wide yards/meters toggle from the header when it's available.
  const unit = siteUnit ? (siteUnit === 'm' ? 'm' : 'yd') : localUnit;
  const [tee, setTee] = useState(null);
  const [result, setResult] = useState(null); // { meters, unc, at }
  const [places, setPlaces] = useState({ status: 'idle', items: [] });
  const [placeChoice, setPlaceChoice] = useState(null); // index | 'other' | null
  const [manualName, setManualName] = useState('');
  const [pending, setPending] = useState(null);
  const lookupAbort = useRef(null);

  // Load saved unit and any unsent drive.
  useEffect(() => {
    try {
      const u = localStorage.getItem(UNIT_KEY);
      if (u === 'm' || u === 'yd') setLocalUnit(u);
    } catch {
      // ignore
    }
    setPending(getPendingDrive());
    return () => {
      if (lookupAbort.current) lookupAbort.current.abort();
    };
  }, []);

  // Live accuracy indicator while measuring. Starts only after the user taps start.
  const tracking = step === 'tee' || step === 'ball';
  useEffect(() => {
    if (!tracking || typeof navigator === 'undefined' || !navigator.geolocation) return undefined;
    const id = navigator.geolocation.watchPosition(
      (p) => setLiveAcc(p.coords.accuracy),
      (err) => {
        setLiveAcc(null);
        if (err.code === 1) setError(describeError({ code: 'denied' }));
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [tracking]);

  const changeUnit = (u) => {
    if (setSiteUnit) {
      setSiteUnit(u === 'm' ? 'm' : 'yds');
      return;
    }
    setLocalUnit(u);
    try {
      localStorage.setItem(UNIT_KEY, u);
    } catch {
      // ignore
    }
  };

  const takeFix = async () => {
    const fix = await sampleBest();
    if (fix.acc > MAX_ACCURACY_M) throw { code: 'weak', acc: fix.acc };
    return fix;
  };

  const startLookup = async (fix) => {
    if (lookupAbort.current) lookupAbort.current.abort();
    const controller = new AbortController();
    lookupAbort.current = controller;
    const timer = setTimeout(() => controller.abort(), 12000);
    setPlaces({ status: 'loading', items: [] });
    try {
      const items = await findPlaces(fix.lat, fix.lng, controller.signal);
      if (controller.signal.aborted && lookupAbort.current !== controller) return;
      setPlaces({ status: 'done', items });
      setPlaceChoice(items.length > 0 ? 0 : null);
    } catch {
      if (lookupAbort.current === controller) setPlaces({ status: 'error', items: [] });
    } finally {
      clearTimeout(timer);
    }
  };

  const markTee = async () => {
    setError('');
    setBusy(true);
    try {
      const fix = await takeFix();
      setTee(fix);
      setStep('ball');
      startLookup(fix);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const markBall = async () => {
    setError('');
    setBusy(true);
    try {
      const fix = await takeFix();
      const meters = distanceMeters(tee, fix);
      const unc = Math.sqrt(tee.acc ** 2 + fix.acc ** 2);
      const at = new Date().toISOString();
      const base = {
        distanceM: Math.round(meters * 10) / 10,
        accuracyM: Math.round(unc * 10) / 10,
        placeName: null,
        placeSource: null,
        method: 'gps',
        recordedAt: at,
      };
      let image = null;
      try {
        image = await renderDriveCard({ meters, unc, placeName: null, at });
      } catch {
        // the drive can still be submitted without the card
      }
      savePendingDrive(image ? { ...base, image } : base);
      setTee(null); // exact coordinates are not kept
      setResult({ meters, unc, at });
      setStep('result');
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const resetFlow = () => {
    if (lookupAbort.current) lookupAbort.current.abort();
    setError('');
    setTee(null);
    setResult(null);
    setPlaces({ status: 'idle', items: [] });
    setPlaceChoice(null);
    setManualName('');
    setStep('tee');
  };

  const chosenPlace = () => {
    if (typeof placeChoice === 'number' && places.items[placeChoice]) {
      return { name: places.items[placeChoice].name, source: 'osm' };
    }
    const typed = manualName.trim().slice(0, 80);
    return typed ? { name: typed, source: 'manual' } : { name: null, source: null };
  };

  const submit = async () => {
    if (!result || busy) return;
    setBusy(true);
    const place = chosenPlace();
    const drive = {
      distanceM: Math.round(result.meters * 10) / 10,
      accuracyM: Math.round(result.unc * 10) / 10,
      placeName: place.name,
      placeSource: place.source,
      method: 'gps',
      recordedAt: result.at,
    };
    try {
      drive.image = await renderDriveCard({
        meters: result.meters,
        unc: result.unc,
        placeName: place.name,
        at: result.at,
      });
    } catch {
      // submit without the card; /submit will ask for a photo instead
    }
    savePendingDrive(drive);
    router.push(buildSubmitUrl(drive));
  };

  const submitPending = () => {
    if (pending) router.push(buildSubmitUrl(pending));
  };

  const discardPending = () => {
    clearPendingDrive();
    setPending(null);
  };

  const quality = gpsQuality(liveAcc);
  const showManual =
    placeChoice === 'other' ||
    (places.status !== 'loading' && places.items.length === 0 && step === 'result');
  const resultNote = result
    ? result.meters < 20
      ? 'That is a very short drive. Check that you marked the right spots.'
      : result.meters > 550
      ? 'That is beyond a record-length drive. Check your marks before submitting.'
      : ''
    : '';

  return (
    <>
      <Head>
        <title>Track a drive with your phone's GPS | Ripping Bombs</title>
        <meta
          name="description"
          content="Measure how far you hit a golf ball using only your phone's GPS. Free, no account needed. Submit your drive to the Ripping Bombs leaderboard."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="rb">
        <div className="wrap">
          <h1>Track a drive</h1>

          {step === 'intro' && (
            <>
              {pending && (
                <section className="panel pending" aria-label="Unsent drive">
                  <p className="strong">
                    You have an unsent drive: {formatDistance(pending.distanceM, unit)}
                    {pending.placeName ? ` at ${pending.placeName}` : ''}.
                  </p>
                  <div className="row">
                    <button className="btn primary" onClick={submitPending}>
                      Submit it
                    </button>
                    <button className="btn ghost" onClick={discardPending}>
                      Delete it
                    </button>
                  </div>
                </section>
              )}

              <p className="lead">
                Hit a ball, walk to it, and your phone measures the distance with GPS. No account
                needed to try it.
              </p>
              <section className="panel">
                <p>
                  Your phone will ask for location access. It is used only to measure this drive and
                  find your range or course. To find the name, the tee location is sent to
                  OpenStreetMap's public lookup. Exact positions are never saved.
                </p>
              </section>
              <button className="btn primary big" onClick={resetFlow}>
                Allow location and start
              </button>
            </>
          )}

          {(step === 'tee' || step === 'ball') && (
            <>
              <p className={`gps ${quality.cls}`} role="status" aria-live="polite">
                <span className="dot" aria-hidden="true" />
                {quality.label}
              </p>

              {step === 'tee' ? (
                <>
                  <h2>Mark where you hit from</h2>
                  <p className="lead">Stand at your tee spot and hold the phone still.</p>
                  <button className="btn primary big" onClick={markTee} disabled={busy}>
                    {busy ? 'Locking position…' : 'Mark tee spot'}
                  </button>
                </>
              ) : (
                <>
                  <h2>Walk to your ball</h2>
                  <p className="lead">Stop right next to it, hold still, then mark its position.</p>
                  <button className="btn primary big" onClick={markBall} disabled={busy}>
                    {busy ? 'Locking position…' : 'Mark ball position'}
                  </button>
                  <button className="btn ghost" onClick={resetFlow} disabled={busy}>
                    Start over
                  </button>
                </>
              )}
            </>
          )}

          {step === 'result' && result && (
            <>
              <div className="result">
                <div className="num" aria-label={`${Math.round(metersToUnit(result.meters, unit))} ${unit === 'm' ? 'meters' : 'yards'}`}>
                  {Math.round(metersToUnit(result.meters, unit))}
                </div>
                <div className="unitcol">
                  <div className="seg" role="group" aria-label="Distance unit">
                    <button
                      className={unit === 'yd' ? 'on' : ''}
                      aria-pressed={unit === 'yd'}
                      onClick={() => changeUnit('yd')}
                    >
                      yards
                    </button>
                    <button
                      className={unit === 'm' ? 'on' : ''}
                      aria-pressed={unit === 'm'}
                      onClick={() => changeUnit('m')}
                    >
                      meters
                    </button>
                  </div>
                  <p className="muted">
                    GPS accuracy ±{Math.round(metersToUnit(result.unc, unit))} {unit === 'm' ? 'm' : 'yds'}
                  </p>
                </div>
              </div>
              {resultNote && <p className="note">{resultNote}</p>}

              <section className="panel" aria-label="Where you hit">
                <h2>Where did you hit?</h2>
                <p className="muted">Optional. It helps rank ranges and courses.</p>

                {places.status === 'loading' && (
                  <p className="muted" role="status">
                    Looking for nearby ranges and courses…
                  </p>
                )}

                {places.items.length > 0 && (
                  <fieldset className="choices">
                    <legend className="sr">Nearby ranges and courses</legend>
                    {places.items.map((p, i) => (
                      <label key={p.name} className="choice">
                        <input
                          type="radio"
                          name="place"
                          checked={placeChoice === i}
                          onChange={() => setPlaceChoice(i)}
                        />
                        <span>
                          {p.name} <span className="muted">({p.kind})</span>
                        </span>
                      </label>
                    ))}
                    <label className="choice">
                      <input
                        type="radio"
                        name="place"
                        checked={placeChoice === 'other'}
                        onChange={() => setPlaceChoice('other')}
                      />
                      <span>Somewhere else</span>
                    </label>
                  </fieldset>
                )}

                {places.status === 'error' && (
                  <p className="muted">Couldn't look up nearby places. You can type the name instead.</p>
                )}
                {places.status === 'done' && places.items.length === 0 && (
                  <p className="muted">No range or course found here. You can type the name instead.</p>
                )}

                {showManual && (
                  <input
                    className="text"
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Range or course name"
                    maxLength={80}
                    aria-label="Range or course name"
                  />
                )}
              </section>

              <button className="btn primary big" onClick={submit} disabled={busy}>
                {busy ? 'Preparing your result card…' : 'Submit to leaderboard'}
              </button>
              <button className="btn ghost" onClick={resetFlow}>
                Track another drive
              </button>
              <p className="muted fine">
                A result card is attached to your drive as evidence. Your drive stays on this device
                until you submit it, and you'll log in or create a free account to appear on the
                leaderboard.
              </p>
            </>
          )}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>

        <style jsx>{`
          .rb {
            --bg: #1a1a1a; /* matches the site background in Layout */
            --panel: #232323;
            --line: #363636;
            --text: #f4f4f6;
            --muted: #a0a0ad;
            --pink: #ff0090; /* swap for your ORG token */
            --good: #3ddc84;
            --fair: #ffb020;
            --weak: #ff5a5a;
            color: var(--text);
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            padding: 24px 16px 48px;
          }
          .wrap {
            max-width: 480px;
            margin: 0 auto;
          }
          h1 {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-weight: 400;
            font-size: 44px;
            line-height: 1;
            margin: 0 0 16px;
          }
          h2 {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-weight: 400;
            font-size: 28px;
            line-height: 1.1;
            margin: 20px 0 6px;
          }
          .panel h2 {
            margin-top: 0;
          }
          p {
            margin: 0 0 12px;
          }
          .lead {
            color: var(--text);
            max-width: 38ch;
          }
          .muted {
            color: var(--muted);
            font-size: 14px;
          }
          .strong {
            font-weight: 600;
          }
          .fine {
            margin-top: 16px;
          }
          .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
          }
          .panel p:last-child {
            margin-bottom: 0;
          }
          .pending {
            border-color: var(--pink);
          }
          .row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .btn {
            font: inherit;
            font-weight: 600;
            border-radius: 12px;
            border: 1px solid var(--line);
            background: transparent;
            color: var(--text);
            padding: 12px 16px;
            min-height: 48px;
            cursor: pointer;
          }
          .btn.primary {
            background: var(--pink);
            border-color: var(--pink);
            color: #fff;
          }
          .btn.big {
            display: block;
            width: 100%;
            min-height: 60px;
            font-size: 18px;
            margin: 16px 0 8px;
          }
          .btn.ghost {
            display: block;
            width: 100%;
            color: var(--muted);
            margin-top: 8px;
          }
          .row .btn.ghost {
            width: auto;
            margin: 0;
          }
          .btn:disabled {
            opacity: 0.6;
            cursor: default;
          }
          .btn:focus-visible,
          .seg button:focus-visible,
          .text:focus-visible,
          .choice input:focus-visible {
            outline: 3px solid #fff;
            outline-offset: 2px;
          }
          .gps {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 4px;
          }
          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--muted);
            flex: none;
          }
          .gps.good .dot {
            background: var(--good);
          }
          .gps.fair .dot {
            background: var(--fair);
          }
          .gps.weak .dot {
            background: var(--weak);
          }
          .result {
            display: flex;
            align-items: flex-end;
            gap: 16px;
            margin: 8px 0 4px;
          }
          .num {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-size: clamp(120px, 38vw, 190px);
            line-height: 0.85;
            color: var(--pink);
          }
          .unitcol {
            padding-bottom: 8px;
          }
          .unitcol .muted {
            margin: 8px 0 0;
          }
          .seg {
            display: inline-flex;
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
          }
          .seg button {
            font: inherit;
            font-size: 14px;
            background: transparent;
            color: var(--muted);
            border: 0;
            padding: 10px 14px;
            min-height: 44px;
            cursor: pointer;
          }
          .seg button.on {
            background: var(--text);
            color: var(--bg);
            font-weight: 600;
          }
          .note {
            color: var(--fair);
            font-size: 14px;
          }
          .choices {
            border: 0;
            padding: 0;
            margin: 12px 0 0;
          }
          .choice {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 48px;
            cursor: pointer;
          }
          .choice input {
            width: 20px;
            height: 20px;
            accent-color: var(--pink);
            flex: none;
          }
          .text {
            width: 100%;
            box-sizing: border-box;
            font: inherit;
            font-size: 16px;
            color: var(--text);
            background: var(--bg);
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 12px;
            min-height: 48px;
            margin-top: 12px;
          }
          .error {
            color: var(--weak);
            margin-top: 16px;
          }
          .sr {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
          }
        `}</style>
      </div>
    </>
  );
}
