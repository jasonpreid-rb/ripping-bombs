// pages/api/venue-display/[slug].jsx
//
// JSON polling endpoint for the venue TV/screen leaderboard display.
// pages/venue-display/[slug].jsx (the SSR kiosk page) fetches this every
// 30 seconds for fresh data — see POLL_MS there.
//
// Shares its slug-resolution and data-shaping logic with the SSR page via
// lib/venueDisplayData.js, so the two never drift out of sync.

import { createClient } from '@supabase/supabase-js';
import { getVenueDisplayData } from '../../../lib/venueDisplayData';

// Matches the slug logic used on the dashboard, /clubs/[slug], and the SSR
// venue-display page — venues without an explicitly-saved custom URL still
// resolve via their auto-generated courseName slug.
function nameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// A venue can view its TV display once it's either started its 3-month free
// trial (and that trial hasn't lapsed) or is on a paid subscription.
// Kept in sync with the same check in pages/venue-display/[slug].jsx.
const TRIAL_DAYS = 90;
function isDisplayActive(club) {
  if (club?.display_subscribed) return true;
  if (!club?.display_trial_started_at) return false;
  const daysElapsed = (Date.now() - new Date(club.display_trial_started_at).getTime()) / 86400000;
  return daysElapsed < TRIAL_DAYS;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { slug } = req.query;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Try an exact match on the saved custom slug first
    let { data: club } = await supabase
      .from('clubs')
      .select('id, fullName, courseName, location, country, customSlug, display_trial_started_at, display_subscribed')
      .eq('customSlug', slug)
      .maybeSingle();

    // Fall back to the auto-generated (courseName-based) slug
    if (!club) {
      const { data: candidates } = await supabase
        .from('clubs')
        .select('id, fullName, courseName, location, country, customSlug, display_trial_started_at, display_subscribed');
      club = (candidates || []).find(c => nameToSlug(c.courseName || c.fullName) === slug) || null;
    }

    if (!club) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (!isDisplayActive(club)) {
      return res.status(404).json({ error: 'TV Display not active for this venue' });
    }

    const displayName = club.courseName || club.fullName;
    const data = await getVenueDisplayData(supabase, club.id, displayName);

    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/venue-display] error:', err);
    return res.status(500).json({ error: 'Failed to load venue display data' });
  }
}
