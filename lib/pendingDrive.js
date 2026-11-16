// lib/pendingDrive.js
//
// Helpers for the /track GPS tracker.
//
// The most recent unsent drive is kept in this browser (localStorage) so the
// tracker can offer to resume it. The hand-off to the real submit flow is done
// through the URL, the same way the homepage instant-rank widget does it:
//
//   /submit?src=gps&dist=<yards>&facility=<place name>&date=<YYYY-MM-DD>
//
// /submit pre-fills the form from those params and, for logged-out players,
// carries them through /login or /register via the existing ?redirect= param.
// After a successful GPS submission, /submit calls clearPendingDrive().
//
// Stored shape (localStorage key: rb_pending_drive):
// {
//   distanceM:   number,         // metres, one decimal
//   accuracyM:   number,         // combined GPS uncertainty in metres
//   placeName:   string | null,  // range/course name, if chosen
//   placeSource: 'osm' | 'manual' | null,
//   method:      'gps',
//   recordedAt:  string,         // ISO timestamp
//   image:       string | null   // JPEG data URL of the generated result card
// }
//
// The image is too big for a URL, so /submit reads it from here and uses it as
// the evidence photo (only when its distance matches the ?dist= param).
//
// Exact tee/ball coordinates are never stored.

export const PENDING_DRIVE_KEY = 'rb_pending_drive';
export const UNIT_KEY = 'rb_track_unit';
export const YARDS_PER_METER = 1.0936133;

export function metersToUnit(meters, unit) {
  return unit === 'm' ? meters : meters * YARDS_PER_METER;
}

export function formatDistance(meters, unit) {
  return `${Math.round(metersToUnit(meters, unit))} ${unit === 'm' ? 'm' : 'yds'}`;
}

export function savePendingDrive(drive) {
  try {
    localStorage.setItem(PENDING_DRIVE_KEY, JSON.stringify(drive));
    return true;
  } catch {
    return false;
  }
}

export function getPendingDrive() {
  try {
    const raw = localStorage.getItem(PENDING_DRIVE_KEY);
    if (!raw) return null;
    const drive = JSON.parse(raw);
    if (!drive || typeof drive.distanceM !== 'number' || !isFinite(drive.distanceM)) return null;
    return drive;
  } catch {
    return null;
  }
}

export function clearPendingDrive() {
  try {
    localStorage.removeItem(PENDING_DRIVE_KEY);
  } catch {
    // ignore
  }
}

export const SUBMIT_PATH = '/submit';

// Builds the /submit URL for a saved drive. Distance is passed in yards because
// that is what the submit form's distance field expects.
export function buildSubmitUrl(drive) {
  const params = new URLSearchParams();
  params.set('src', 'gps');
  params.set('dist', String(Math.round(drive.distanceM * YARDS_PER_METER)));
  if (drive.placeName) params.set('facility', drive.placeName);
  const d = new Date(drive.recordedAt);
  const when = isNaN(d.getTime()) ? new Date() : d;
  const pad = (n) => String(n).padStart(2, '0');
  params.set('date', `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`);
  return `${SUBMIT_PATH}?${params.toString()}`;
}
