// pages/api/venue-display/[slug].js
//
// Polled by the kiosk page (pages/venue-display/[slug].jsx) every 30s to
// pick up new entries without a full page reload. Also usable directly for
// testing: /api/venue-display/ironwood

import { createClient } from '@supabase/supabase-js';
import { getVenueDisplayData } from '../../../lib/venueDisplayData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Missing venue slug' });
  }

  try {
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, fullName, courseName, customSlug')
      .eq('customSlug', slug)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Paid-tier gate. Add a boolean "displayEnabled" column to clubs before
    // shipping this for real — until then this line is a no-op placeholder.
    // if (!club.displayEnabled) {
    //   return res.status(403).json({ error: 'TV display not enabled for this venue' });
    // }

    const displayName = club.courseName || club.fullName;
    const data = await getVenueDisplayData(supabase, club.id, displayName);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    console.error('venue-display API error:', err);
    return res.status(500).json({ error: 'Failed to load leaderboard data' });
  }
}
