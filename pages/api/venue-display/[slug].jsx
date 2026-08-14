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
      .select('id, fullName, courseName, location, country, customSlug')
      .eq('customSlug', slug)
      .maybeSingle();

    // Fall back to the auto-generated (courseName-based) slug
    if (!club) {
      const { data: candidates } = await supabase
        .from('clubs')
        .select('id, fullName, courseName, location, country, customSlug');
      club = (candidates || []).find(c => nameToSlug(c.courseName || c.fullName) === slug) || null;
    }

    if (!club) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Paid-tier gate — see matching TODO in pages/venue-display/[slug].jsx
    // if (!club.displayEnabled) return res.status(404).json({ error: 'Not enabled' });

    const displayName = club.courseName || club.fullName;
    const data = await getVenueDisplayData(supabase, club.id, displayName);

    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/venue-display] error:', err);
    return res.status(500).json({ error: 'Failed to load venue display data' });
  }
}
