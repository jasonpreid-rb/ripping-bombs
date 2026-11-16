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

// ---- Visual pieces ------------------------------------------------------
// Everything below is presentation only. The GPS, lookup and submit logic above
// and in the page component is unchanged apart from a short vibration on lock.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buzz(ms) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  } catch {
    // vibration is optional
  }
}

// Eases 0 -> 1 once, when the component mounts. Jumps straight to 1 for
// people who ask their device for reduced motion.
function useCountUp(duration = 1300) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setP(1);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      setP(1 - Math.pow(1 - t, 4));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return p;
}

// Bezel ticks for the reticle, computed once.
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = ((i * 5 - 90) * Math.PI) / 180;
  const long = i % 6 === 0;
  const r1 = long ? 99 : 103;
  const r2 = 108;
  return {
    x1: (120 + r1 * Math.cos(a)).toFixed(2),
    y1: (120 + r1 * Math.sin(a)).toFixed(2),
    x2: (120 + r2 * Math.cos(a)).toFixed(2),
    y2: (120 + r2 * Math.sin(a)).toFixed(2),
    long,
  };
});

function SignalBars({ acc }) {
  const level = acc == null ? 0 : acc <= 10 ? 4 : acc <= 18 ? 3 : acc <= 25 ? 2 : 1;
  return (
    <span className="bars" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= level ? 'on' : ''} style={{ height: 4 + i * 3 }} />
      ))}
    </span>
  );
}

const STEP_LABELS = [
  { key: 'tee', label: 'Tee spot' },
  { key: 'ball', label: 'Ball' },
  { key: 'result', label: 'Result' },
];

function Stepper({ step }) {
  const idx = STEP_LABELS.findIndex((s) => s.key === step);
  return (
    <ol className="steps" aria-label="Progress">
      {STEP_LABELS.map((s, i) => (
        <li
          key={s.key}
          className={`${i <= idx ? 'done' : ''}${i === idx ? ' current' : ''}`}
          aria-current={i === idx ? 'step' : undefined}
        >
          <span className="node" aria-hidden="true" />
          <span className="lbl">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

// The instrument. The inner circle is the GPS accuracy: it shrinks as the
// signal improves, so a good fix is something you can see before you tap.
function Reticle({ acc, unit, busy, idle }) {
  const has = acc != null;
  const n = has ? Math.round(metersToUnit(acc, unit)) : null;
  const k = has ? Math.min(1, Math.max(0.2, 0.2 + (acc / 50) * 0.8)) : 1;
  return (
    <div className={`ret${busy ? ' busy' : ''}${idle ? ' idle' : ''}`}>
      <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="retSweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <g className="ret-ticks">
          {TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className={t.long ? 'long' : ''}
            />
          ))}
        </g>
        <circle className="ret-ring" cx="120" cy="120" r="96" />
        {!idle && (
          <circle
            className="ret-acc"
            cx="120"
            cy="120"
            r="96"
            style={{ transform: `scale(${k})` }}
          />
        )}
        <circle className="ret-pulse p1" cx="120" cy="120" r="96" />
        <circle className="ret-pulse p2" cx="120" cy="120" r="96" />
        <g className="ret-sweep">
          <path d="M120 120 L120 24 A96 96 0 0 0 52 52 Z" fill="url(#retSweep)" />
          <line x1="120" y1="120" x2="120" y2="24" className="ret-arm" />
        </g>
        <g className="ret-brackets">
          <path d="M58 72 V58 H72" />
          <path d="M168 58 H182 V72" />
          <path d="M182 168 V182 H168" />
          <path d="M72 182 H58 V168" />
        </g>
        <circle className="ret-hub" cx="120" cy="120" r="2.5" />
      </svg>
      <div className="ret-read" aria-hidden="true">
        <div className="ret-num">{idle ? 'Ready' : has ? `±${n}` : '–'}</div>
        <div className="ret-cap">
          {idle
            ? 'GPS starts when you tap'
            : has
            ? `${unit === 'm' ? 'meters' : 'yards'} accuracy`
            : 'searching'}
        </div>
      </div>
    </div>
  );
}

// Tee to ball, drawn to scale, with the GPS error band at the ball end.
function Trace({ meters, unc }) {
  const X0 = 28;
  const X1 = 316;
  const L = X1 - X0;
  const half = Math.min(26, Math.max(4, (unc / Math.max(meters, 1)) * L));
  return (
    <svg className="trace" viewBox="0 0 344 64" aria-hidden="true" focusable="false">
      <line x1={X0} y1="30" x2={X1} y2="30" className="trace-base" />
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1={X0 + (L * i) / 10}
          y1={i % 5 === 0 ? 22 : 25}
          x2={X0 + (L * i) / 10}
          y2={i % 5 === 0 ? 38 : 35}
          className="trace-tick"
        />
      ))}
      <rect x={X1 - half} y="17" width={half * 2} height="26" rx="3" className="trace-band" />
      <line x1={X0} y1="30" x2={X1} y2="30" className="trace-line" />
      <circle cx={X0} cy="30" r="6" className="trace-tee" />
      <circle cx={X1} cy="30" r="7" className="trace-ball" />
      <text x={X0} y="58" textAnchor="middle" className="trace-lbl">
        Tee
      </text>
      <text x={X1} y="58" textAnchor="middle" className="trace-lbl">
        Ball
      </text>
    </svg>
  );
}

function ResultHero({ result, unit, changeUnit }) {
  const p = useCountUp();
  const exact = metersToUnit(result.meters, unit);
  const full = Math.round(exact);
  const shown = Math.round(exact * p);
  const otherUnit = unit === 'm' ? 'yd' : 'm';
  const other = Math.round(metersToUnit(result.meters, otherUnit));
  return (
    <div className="stage result-stage">
      <div className="result">
        <div
          className="num"
          role="img"
          aria-label={`${full} ${unit === 'm' ? 'meters' : 'yards'}`}
        >
          {shown}
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
          <p className="muted alt">
            {other} {otherUnit === 'm' ? 'meters' : 'yards'}
          </p>
        </div>
      </div>
      <Trace meters={result.meters} unc={result.unc} />
    </div>
  );
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
      buzz(30);
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
      buzz(60);
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
            <div className="enter" key="intro">
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

              <div className="stage q-wait">
                <Reticle acc={null} unit={unit} idle />
              </div>

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
            </div>
          )}

          {(step === 'tee' || step === 'ball') && (
            <div className="enter" key={step}>
              <Stepper step={step} />
              <p className={`gps ${quality.cls}`} role="status" aria-live="polite">
                <SignalBars acc={liveAcc} />
                {quality.label}
              </p>

              <div className={`stage q-${quality.cls}`}>
                <Reticle acc={liveAcc} unit={unit} busy={busy} />
                <div className="lockbar" aria-hidden="true">
                  {busy && <i />}
                </div>
              </div>

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
                  <p className="locked">
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Tee spot locked
                  </p>
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
            </div>
          )}

          {step === 'result' && result && (
            <div className="enter" key="result">
              <Stepper step="result" />
              <ResultHero key={result.at} result={result} unit={unit} changeUnit={changeUnit} />
              {resultNote && <p className="note">{resultNote}</p>}

              <section className="panel" aria-label="Where you hit">
                <h2>Where did you hit?</h2>
                <p className="muted">Optional. It helps rank ranges and courses.</p>

                {places.status === 'loading' && (
                  <p className="muted scanning" role="status">
                    <span className="scan" aria-hidden="true" />
                    Looking for nearby ranges and courses…
                  </p>
                )}

                {places.items.length > 0 && (
                  <fieldset className="choices">
                    <legend className="sr">Nearby ranges and courses</legend>
                    {places.items.map((p, i) => (
                      <label key={p.name} className={`choice${placeChoice === i ? ' on' : ''}`}>
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
                    <label className={`choice${placeChoice === 'other' ? ' on' : ''}`}>
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
            </div>
          )}

          {error && (
            <p className="error" role="alert" key={error}>
              {error}
            </p>
          )}
        </div>

        <style jsx global>{`
          .rb {
            --bg: #1a1a1a; /* matches the site background in Layout */
            --panel: #232323;
            --panel-2: #1d1d20;
            --line: #363636;
            --grid: rgba(255, 255, 255, 0.045);
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
          .rb .wrap {
            max-width: 480px;
            margin: 0 auto;
          }
          .rb h1 {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-weight: 400;
            font-size: 44px;
            line-height: 1;
            margin: 0 0 16px;
          }
          .rb h2 {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-weight: 400;
            font-size: 28px;
            line-height: 1.1;
            margin: 20px 0 6px;
          }
          .rb .panel h2 {
            margin-top: 0;
          }
          .rb p {
            margin: 0 0 12px;
          }
          .rb .lead {
            color: var(--text);
            max-width: 38ch;
          }
          .rb .muted {
            color: var(--muted);
            font-size: 14px;
          }
          .rb .strong {
            font-weight: 600;
          }
          .rb .fine {
            margin-top: 16px;
          }
          .rb .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
          }
          .rb .panel p:last-child {
            margin-bottom: 0;
          }
          .rb .pending {
            border-color: var(--pink);
          }
          .rb .row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          /* ---- Buttons ---- */
          .rb .btn {
            font: inherit;
            font-weight: 600;
            border-radius: 12px;
            border: 1px solid var(--line);
            background: transparent;
            color: var(--text);
            padding: 12px 16px;
            min-height: 48px;
            cursor: pointer;
            transition: transform 0.12s ease, filter 0.15s ease, border-color 0.15s ease;
          }
          .rb .btn:active:not(:disabled) {
            transform: scale(0.985);
          }
          .rb .btn.primary {
            background: var(--pink);
            border-color: var(--pink);
            color: #fff;
          }
          .rb .btn.primary:hover:not(:disabled) {
            filter: brightness(1.1);
          }
          .rb .btn.big {
            display: block;
            width: 100%;
            min-height: 60px;
            font-size: 18px;
            margin: 16px 0 8px;
          }
          .rb .btn.ghost {
            display: block;
            width: 100%;
            color: var(--muted);
            margin-top: 8px;
          }
          .rb .btn.ghost:hover:not(:disabled) {
            border-color: var(--muted);
          }
          .rb .row .btn.ghost {
            width: auto;
            margin: 0;
          }
          .rb .btn:disabled {
            opacity: 0.6;
            cursor: default;
          }
          /* Moving stripes show that a lock or a render is in progress. */
          .rb .btn.primary:disabled {
            opacity: 0.85;
            background-image: repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.16) 0 10px,
              transparent 10px 20px
            );
            background-size: 28px 28px;
            animation: rbStripes 0.8s linear infinite;
          }
          .rb .btn:focus-visible,
          .rb .seg button:focus-visible,
          .rb .text:focus-visible,
          .rb .choice input:focus-visible {
            outline: 3px solid #fff;
            outline-offset: 2px;
          }

          /* ---- Step entrance (answers the tap that changed the step) ---- */
          .rb .enter {
            animation: rbEnter 0.32s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }

          /* ---- Progress ---- */
          .rb .steps {
            list-style: none;
            display: flex;
            margin: 0 0 18px;
            padding: 0;
          }
          .rb .steps li {
            flex: 1;
            position: relative;
            text-align: center;
            font-size: 13px;
            color: var(--muted);
          }
          .rb .steps li + li::before {
            content: '';
            position: absolute;
            top: 6px;
            left: -50%;
            width: 100%;
            height: 2px;
            background: var(--line);
            transition: background 0.5s ease;
          }
          .rb .steps li.done::before {
            background: var(--pink);
          }
          .rb .steps .node {
            position: relative;
            z-index: 1;
            display: block;
            width: 14px;
            height: 14px;
            margin: 0 auto 6px;
            border-radius: 50%;
            background: var(--bg);
            border: 2px solid var(--line);
            transition: background 0.3s ease, border-color 0.3s ease;
          }
          .rb .steps li.done .node {
            background: var(--pink);
            border-color: var(--pink);
          }
          .rb .steps li.current .node {
            box-shadow: 0 0 0 4px rgba(255, 0, 144, 0.25);
          }
          .rb .steps li.current {
            color: var(--text);
            font-weight: 600;
          }

          /* ---- GPS status ---- */
          .rb .gps {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 10px;
          }
          .rb .bars {
            display: inline-flex;
            align-items: flex-end;
            gap: 2px;
            height: 16px;
            flex: none;
          }
          .rb .bars i {
            display: block;
            width: 4px;
            border-radius: 1px;
            background: var(--line);
            transition: background 0.4s ease;
          }
          .rb .gps.good .bars i.on {
            background: var(--good);
          }
          .rb .gps.fair .bars i.on {
            background: var(--fair);
          }
          .rb .gps.weak .bars i.on {
            background: var(--weak);
          }

          /* ---- Instrument stage ---- */
          .rb .stage {
            --q: var(--muted);
            position: relative;
            overflow: hidden;
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 18px 18px 22px;
            margin: 0 0 6px;
            background-color: var(--panel-2);
            background-image: linear-gradient(var(--grid) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid) 1px, transparent 1px);
            background-size: 24px 24px;
            transition: border-color 0.5s ease;
          }
          .rb .stage::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(circle at center, transparent 45%, var(--panel-2) 100%);
          }
          .rb .stage.q-good {
            --q: var(--good);
            border-color: rgba(61, 220, 132, 0.45);
          }
          .rb .stage.q-fair {
            --q: var(--fair);
            border-color: rgba(255, 176, 32, 0.45);
          }
          .rb .stage.q-weak {
            --q: var(--weak);
            border-color: rgba(255, 90, 90, 0.5);
          }
          .rb .stage > * {
            position: relative;
            z-index: 1;
          }

          .rb .ret {
            position: relative;
            width: min(100%, 250px);
            aspect-ratio: 1;
            margin: 0 auto;
            color: var(--q);
          }
          .rb .ret svg {
            display: block;
            width: 100%;
            height: 100%;
            overflow: visible;
          }
          .rb .ret-ticks line {
            stroke: var(--line);
            stroke-width: 1.2;
          }
          .rb .ret-ticks line.long {
            stroke: var(--muted);
            stroke-width: 1.6;
          }
          .rb .ret-ring {
            fill: none;
            stroke: var(--line);
            stroke-width: 1.5;
          }
          .rb .ret-acc {
            fill: color-mix(in srgb, var(--q) 14%, transparent);
            stroke: var(--q);
            stroke-width: 1.5;
            stroke-dasharray: 4 4;
            transform-origin: 120px 120px;
            transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), stroke 0.4s ease;
          }
          .rb .ret-pulse {
            fill: none;
            stroke: var(--q);
            stroke-width: 1.5;
            transform-origin: 120px 120px;
            opacity: 0;
            animation: rbPulse 2.8s ease-out infinite;
          }
          .rb .ret-pulse.p2 {
            animation-delay: 1.4s;
          }
          .rb .ret-sweep {
            transform-origin: 120px 120px;
            animation: rbSweep 6s linear infinite;
          }
          .rb .ret-arm {
            stroke: var(--q);
            stroke-width: 1.5;
            opacity: 0.8;
          }
          .rb .ret-hub {
            fill: var(--q);
          }
          .rb .ret-brackets {
            fill: none;
            stroke: var(--text);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            transform-origin: 120px 120px;
            opacity: 0;
          }
          .rb .ret.busy .ret-sweep {
            animation-duration: 1.2s;
          }
          .rb .ret.busy .ret-pulse {
            animation-duration: 1.2s;
          }
          .rb .ret.busy .ret-pulse.p2 {
            animation-delay: 0.6s;
          }
          .rb .ret.busy .ret-brackets {
            opacity: 1;
            animation: rbLock 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) infinite;
          }
          .rb .ret.idle .ret-sweep {
            animation-duration: 12s;
            opacity: 0.6;
          }
          .rb .ret-read {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            pointer-events: none;
          }
          .rb .ret-num {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-size: clamp(40px, 13vw, 56px);
            line-height: 1;
            color: var(--text);
          }
          .rb .ret.idle .ret-num {
            font-size: clamp(32px, 10vw, 44px);
          }
          .rb .ret-cap {
            margin-top: 4px;
            font-size: 12px;
            color: var(--muted);
            max-width: 12ch;
            line-height: 1.25;
          }
          .rb .lockbar {
            height: 3px;
            margin-top: 16px;
            border-radius: 2px;
            background: var(--line);
            overflow: hidden;
          }
          .rb .lockbar i {
            display: block;
            height: 100%;
            width: 100%;
            background: var(--pink);
            transform-origin: left;
            animation: rbFill 3000ms linear both; /* keep in step with SAMPLE_MS */
          }
          .rb .locked {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin: 14px 0 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--good);
          }

          /* ---- Result ---- */
          .rb .result-stage {
            padding-bottom: 12px;
          }
          .rb .result {
            display: flex;
            align-items: flex-end;
            gap: 16px;
            margin: 4px 0 6px;
          }
          .rb .num {
            font-family: 'Bebas Neue', Impact, sans-serif;
            font-size: clamp(120px, 38vw, 190px);
            line-height: 0.85;
            color: var(--pink);
            font-variant-numeric: tabular-nums;
            animation: rbLand 0.9s ease-out 1.1s both;
          }
          .rb .unitcol {
            padding-bottom: 8px;
          }
          .rb .unitcol .muted {
            margin: 8px 0 0;
          }
          .rb .unitcol .alt {
            margin-top: 2px;
          }
          .rb .seg {
            display: inline-flex;
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
            background: var(--bg);
          }
          .rb .seg button {
            font: inherit;
            font-size: 14px;
            background: transparent;
            color: var(--muted);
            border: 0;
            padding: 10px 14px;
            min-height: 44px;
            cursor: pointer;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .rb .seg button.on {
            background: var(--text);
            color: var(--bg);
            font-weight: 600;
          }
          .rb .trace {
            display: block;
            width: 100%;
            height: auto;
            overflow: visible;
          }
          .rb .trace-base {
            stroke: var(--line);
            stroke-width: 3;
            stroke-linecap: round;
          }
          .rb .trace-tick {
            stroke: var(--muted);
            stroke-width: 1.2;
            opacity: 0.6;
          }
          .rb .trace-line {
            stroke: var(--pink);
            stroke-width: 3;
            stroke-linecap: round;
            stroke-dasharray: 288;
            animation: rbDraw 1.3s cubic-bezier(0.25, 0.7, 0.2, 1) both;
          }
          .rb .trace-tee {
            fill: var(--text);
          }
          .rb .trace-ball {
            fill: var(--pink);
            animation: rbFly 1.3s cubic-bezier(0.25, 0.7, 0.2, 1) both;
          }
          .rb .trace-band {
            fill: rgba(255, 0, 144, 0.16);
            stroke: var(--pink);
            stroke-width: 1;
            stroke-dasharray: 3 3;
            animation: rbBand 0.5s ease-out 1.1s both;
          }
          .rb .trace-lbl {
            fill: var(--muted);
            font-size: 11px;
            font-family: 'Inter', system-ui, sans-serif;
          }
          .rb .note {
            color: var(--fair);
            font-size: 14px;
          }

          /* ---- Place choice ---- */
          .rb .choices {
            border: 0;
            padding: 0;
            margin: 12px 0 0;
          }
          .rb .choice {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 48px;
            cursor: pointer;
            padding: 0 10px;
            margin: 0 -10px;
            border-radius: 10px;
            transition: background 0.15s ease;
          }
          .rb .choice.on {
            background: rgba(255, 0, 144, 0.1);
          }
          .rb .choice input {
            width: 20px;
            height: 20px;
            accent-color: var(--pink);
            flex: none;
          }
          .rb .scanning {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .rb .scan {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid var(--line);
            border-top-color: var(--pink);
            animation: rbSweep 0.8s linear infinite;
            flex: none;
          }
          .rb .text {
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
          .rb .error {
            color: var(--weak);
            margin-top: 16px;
            animation: rbShake 0.4s ease both;
          }
          .rb .sr {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
          }

          /* ---- Motion ---- */
          @keyframes rbEnter {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
          }
          @keyframes rbSweep {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes rbPulse {
            0% {
              opacity: 0.55;
              transform: scale(0.3);
            }
            100% {
              opacity: 0;
              transform: scale(1);
            }
          }
          @keyframes rbLock {
            0% {
              transform: scale(1.45);
              opacity: 0.2;
            }
            70%,
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes rbFill {
            from {
              transform: scaleX(0);
            }
          }
          @keyframes rbStripes {
            to {
              background-position: 28px 0;
            }
          }
          @keyframes rbDraw {
            from {
              stroke-dashoffset: 288;
            }
          }
          @keyframes rbFly {
            from {
              transform: translateX(-288px);
            }
          }
          @keyframes rbBand {
            from {
              opacity: 0;
            }
          }
          @keyframes rbLand {
            0% {
              text-shadow: 0 0 0 rgba(255, 0, 144, 0);
            }
            40% {
              text-shadow: 0 0 36px rgba(255, 0, 144, 0.6);
            }
            100% {
              text-shadow: 0 0 0 rgba(255, 0, 144, 0);
            }
          }
          @keyframes rbShake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .rb *,
            .rb *::before,
            .rb *::after {
              animation: none !important;
              transition: none !important;
            }
            .rb .ret-pulse {
              opacity: 0;
            }
            .rb .ret-sweep {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
}
