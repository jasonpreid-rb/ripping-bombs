import { supabase } from './supabaseClient';

// Mirrors nameToSlug() in dashboard.jsx / submit.jsx — keep in sync.
export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request to ${url} failed`);
  return data;
}

// ——— Reads — unchanged, go straight through the anon client ———

export async function getVenueEvents(venueId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('venueId', venueId)
    .order('startAt', { ascending: false });
  if (error) throw error;
  const now = new Date();
  return {
    current: (data || []).filter(e => e.status !== 'cancelled' && new Date(e.endAt) >= now),
    previous: (data || []).filter(e => e.status === 'cancelled' || new Date(e.endAt) < now),
  };
}

export async function getEventBySlug(slug) {
  const { data: event, error } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!event) return null;

  const { data: venue } = await supabase.from('clubs').select('id, courseName, location, avatarUrl').eq('id', event.venueId).single();

  const { data: participants } = await supabase
    .from('event_participants')
    .select('*, clubs:orgId (id, fullName, avatarUrl, gender)')
    .eq('eventId', event.id)
    .neq('status', 'withdrawn');

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('eventId', event.id)
    .order('dist', { ascending: false });

  return { event, venue, participants: participants || [], entries: entries || [] };
}

// Checks a player account (a `clubs` row with accountType 'simulator')
// against an event's entry criteria. Returns { eligible, reason }.
export function checkEligibility(event, org) {
  if (!org) return { eligible: false, reason: 'You need an account to join.' };
  if (org.accountType !== 'simulator') return { eligible: false, reason: 'Only individual accounts can join events.' };

  if (event.gender && event.gender !== 'any') {
    if (!org.gender) return { eligible: false, reason: 'Add your gender in your profile to check eligibility.' };
    if (org.gender !== event.gender) return { eligible: false, reason: `This event is open to ${event.gender} players only.` };
  }

  if (event.minAge != null || event.maxAge != null) {
    if (!org.dob) return { eligible: false, reason: 'Add your date of birth in your profile to check eligibility.' };
    const dob = new Date(org.dob);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    if (event.minAge != null && age < event.minAge) return { eligible: false, reason: `This event is for ages ${event.minAge}+.` };
    if (event.maxAge != null && age > event.maxAge) return { eligible: false, reason: `This event is for ages up to ${event.maxAge}.` };
  }

  return { eligible: true, reason: null };
}

// Search registered players by name, for the "find a profile" invite flow —
// simulator accounts only (club accounts aren't players).
export async function searchPlayers(query) {
  const q = (query || '').trim();
  if (q.length < 2) return [];
  const { data, error } = await supabase
    .from('clubs')
    .select('id, fullName, avatarUrl, location')
    .eq('accountType', 'simulator')
    .ilike('fullName', `%${q}%`)
    .limit(8);
  if (error) throw error;
  return data || [];
}

// Pending, unseen invites for a player — shown as a dashboard notification.
export async function getPendingInvites(orgId) {
  const { data, error } = await supabase
    .from('event_participants')
    .select('id, events:eventId ( id, name, slug, startAt, venueId, clubs:venueId ( courseName ) )')
    .eq('orgId', orgId)
    .eq('status', 'invited')
    .is('seenAt', null);
  if (error) throw error;
  return data || [];
}

// ——— Writes — same names/signatures as before, now routed through the
// server-side API (service-role client) instead of the anon client ———

export async function createEvent(venueId, fields) {
  return postJson('/api/events/create', { venueId, fields });
}

export async function updateEvent(eventId, fields) {
  return postJson('/api/events/update', { eventId, fields });
}

// Called when a player hits "Join" on the public event page, or is
// auto-joined via a locked ?event= link the first time they submit.
export async function joinEvent(eventId, org) {
  return postJson('/api/events/join', { eventId, org });
}

// Invite a single already-found player by their account id — used when a
// venue picks someone from the name search rather than typing an email.
export async function invitePlayerById(eventId, orgId) {
  return postJson('/api/events/invite-player', { eventId, orgId });
}

// Venue invites known players by email — creates an 'invited' roster row
// per matched account.
export async function inviteParticipants(eventId, emails) {
  return postJson('/api/events/invite-participants', { eventId, emails });
}

// Marks an invite as seen so it stops showing.
export async function markInviteSeen(participantId) {
  return postJson('/api/events/mark-invite-seen', { participantId });
}
