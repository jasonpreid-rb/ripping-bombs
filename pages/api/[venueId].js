import QRCode from 'qrcode';
import { supabase } from '../../../lib/supabaseClient';

// GET /api/qrcode/[venueId]?size=1000&download=1
//
// Generates a QR code PNG that links to this venue's pre-filled submission
// page: /submit?venue=[venueId]. Nothing is stored — the image is generated
// fresh on every request, so it's always correct even if the venue's
// details change later. Used on the venue's "Get QR Poster" page
// (pages/venue-qr.jsx) so they can download it and drop it into their own
// poster design.

export default async function handler(req, res) {
  const { venueId } = req.query;

  if (!venueId || Array.isArray(venueId)) {
    return res.status(400).json({ error: 'Missing venueId' });
  }

  // Only generate codes for real, approved club/venue accounts — this
  // stops anyone from generating a QR code pointing at a random or
  // unapproved id.
  const { data: club, error } = await supabase
    .from('clubs')
    .select('id, courseName, accountType, status')
    .eq('id', venueId)
    .single();

  if (error || !club || club.accountType !== 'club' || club.status !== 'approved') {
    return res.status(404).json({ error: 'Venue not found' });
  }

  const size = Math.min(Math.max(parseInt(req.query.size, 10) || 1000, 200), 2000);
  const targetUrl = `https://www.rippingbombs.com/submit?venue=${club.id}`;

  try {
    const buffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: size,
      margin: 2,
      color: {
        dark: '#000000ff',
        light: '#ffffffff',
      },
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    if (req.query.download === '1') {
      const filenameSafe = (club.courseName || 'venue').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameSafe}-qr-code.png"`);
    }

    return res.status(200).send(buffer);
  } catch (err) {
    console.error('[qrcode] generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
