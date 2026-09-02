import { supabase } from './supabaseClient';

// Mirrors nameToSlug() in dashboard.jsx / submit.jsx — keep in sync.
function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Event slugs are global (used in the public /e/[slug] URL), so a plain
// name-based slug could collide across venues — append a short suffix
// whenever the base slug is already taken.
export async function generateEventSlug(name) {
  const base = slugify(name) || 'event';
  let candidate = base;
  let n = 1;
  // Small, bounded loop — collisions on a random 4-char suffix space
  // are effectively impossible in practice, but this guards against it.
  while (true) {
    const { data, error } = await supabase.from('events').select('id').eq('slug', candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function createEvent(venueId, fields) {
  const slug = await generateEventSlug(fields.name);
  const { data, error } = await supabase
    .from('events')
    .insert({
      venueId,
      name: fields.name,
      slug,
      description: fields.description || null,
      startAt: fields.startAt,
      endAt: fields.endAt,
      status: fields.status || 'active',
      sponsorName: fields.sponsorName || null,
      sponsorLogoUrl: fields.sponsorLogoUrl || null,
      brandColor: fields.brandColor || null,
      minAge: fields.minAge ?? null,
      maxAge: fields.maxAge ?? null,
      gender: fields.gender || 'any',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(eventId, fields) {
  const { data, error } = await supabase.from('events').update(fields).eq('id', eventId).select().single();
  if (error) throw error;
  return data;
}

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

// Called when a player hits "Join" on the public event page, or is
// auto-joined via a locked ?event= link the first time they submit.
export async function joinEvent(eventId, org) {
  const { data: event, error: eventErr } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (eventErr) throw eventErr;

  const { eligible, reason } = checkEligibility(event, org);
  if (!eligible) return { ok: false, reason };

  const { error } = await supabase
    .from('event_participants')
    .upsert(
      { eventId, orgId: org.id, status: 'joined', joinedAt: new Date().toISOString() },
      { onConflict: 'eventId,orgId' }
    );
  if (error) throw error;
  return { ok: true };
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

// Invite a single already-found player by their account id — used when a
// venue picks someone from the name search rather than typing an email.
export async function invitePlayerById(eventId, orgId) {
  const { error } = await supabase
    .from('event_participants')
    .upsert(
      { eventId, orgId, status: 'invited', invitedAt: new Date().toISOString() },
      { onConflict: 'eventId,orgId' }
    );
  if (error) throw error;

  const { data: org } = await supabase.from('clubs').select('email').eq('id', orgId).single();
  if (org?.email) {
    fetch('/api/events/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, emails: [org.email] }),
    }).catch(() => {});
  }
}


// per matched account and hands the list to /api/events/invite to send
// the actual emails via Resend.
export async function inviteParticipants(eventId, emails) {
  const cleanEmails = emails.map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!cleanEmails.length) return { invited: 0, notFound: [] };

  const { data: orgs, error } = await supabase.from('clubs').select('id, email').in('email', cleanEmails);
  if (error) throw error;

  const found = orgs || [];
  const foundEmails = new Set(found.map(o => o.email.toLowerCase()));
  const notFound = cleanEmails.filter(e => !foundEmails.has(e));

  if (found.length) {
    const rows = found.map(o => ({ eventId, orgId: o.id, status: 'invited', invitedAt: new Date().toISOString() }));
    const { error: upsertErr } = await supabase.from('event_participants').upsert(rows, { onConflict: 'eventId,orgId' });
    if (upsertErr) throw upsertErr;
  }

  // Fire-and-forget — don't block the dashboard UI on email delivery.
  fetch('/api/events/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, emails: found.map(o => o.email) }),
  }).catch(() => {});

  return { invited: found.length, notFound };
}
