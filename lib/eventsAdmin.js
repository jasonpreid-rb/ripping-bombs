import { supabaseAdmin } from './supabaseAdmin';
import { slugify, checkEligibility } from './events';

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
    const { data, error } = await supabaseAdmin.from('events').select('id').eq('slug', candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function createEvent(venueId, fields) {
  const slug = await generateEventSlug(fields.name);
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin.from('events').update(fields).eq('id', eventId).select().single();
  if (error) throw error;
  return data;
}

// Called when a player hits "Join" on the public event page, or is
// auto-joined via a locked ?event= link the first time they submit.
export async function joinEvent(eventId, org) {
  const { data: event, error: eventErr } = await supabaseAdmin.from('events').select('*').eq('id', eventId).single();
  if (eventErr) throw eventErr;

  const { eligible, reason } = checkEligibility(event, org);
  if (!eligible) return { ok: false, reason };

  const { error } = await supabaseAdmin
    .from('event_participants')
    .upsert(
      { eventId, orgId: org.id, status: 'joined', joinedAt: new Date().toISOString() },
      { onConflict: 'eventId,orgId' }
    );
  if (error) throw error;
  return { ok: true };
}

// Invite a single already-found player by their account id — used when a
// venue picks someone from the name search rather than typing an email.
// No email is sent — the player sees this as a notification on their
// dashboard next time they log in (see getPendingInvites/markInviteSeen).
export async function invitePlayerById(eventId, orgId) {
  const { error } = await supabaseAdmin
    .from('event_participants')
    .upsert(
      { eventId, orgId, status: 'invited', invitedAt: new Date().toISOString() },
      { onConflict: 'eventId,orgId' }
    );
  if (error) throw error;
}

// Venue invites known players by email — creates an 'invited' roster row
// per matched account. Same in-app notification as invitePlayerById, no email.
export async function inviteParticipants(eventId, emails) {
  const cleanEmails = emails.map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!cleanEmails.length) return { invited: 0, notFound: [] };

  const { data: orgs, error } = await supabaseAdmin.from('clubs').select('id, email').in('email', cleanEmails);
  if (error) throw error;

  const found = orgs || [];
  const foundEmails = new Set(found.map(o => o.email.toLowerCase()));
  const notFound = cleanEmails.filter(e => !foundEmails.has(e));

  if (found.length) {
    const rows = found.map(o => ({ eventId, orgId: o.id, status: 'invited', invitedAt: new Date().toISOString() }));
    const { error: upsertErr } = await supabaseAdmin.from('event_participants').upsert(rows, { onConflict: 'eventId,orgId' });
    if (upsertErr) throw upsertErr;
  }

  return { invited: found.length, notFound };
}

// Marks an invite as seen so it stops showing — called on dismiss, or when
// the player opens the event from the notification.
export async function markInviteSeen(participantId) {
  const { error } = await supabaseAdmin.from('event_participants').update({ seenAt: new Date().toISOString() }).eq('id', participantId);
  if (error) throw error;
}
