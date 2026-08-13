import { ImageResponse } from '@vercel/og';
import QRCode from 'qrcode';
import { supabase } from '../../../lib/supabaseClient';

// NOTE: intentionally NOT using the Edge runtime here. The `qrcode` package's
// server-side PNG renderer (used by QRCode.toDataURL) depends on `pngjs`,
// which extends Node's `stream.Duplex` internally — and `stream` is a Node
// core module the Edge Runtime does not support. That was silently throwing
// on every request and surfacing as a bare 500 with no stack trace. @vercel/og
// fully supports the Node.js runtime too, so we just don't opt into edge.

// ─── Poster canvas — A4 portrait @ 150dpi (print-safe, keeps Satori fast) ───
// If you want true 300dpi later, double these and test render time/timeout
// before shipping — Satori is much slower on very large canvases.
const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1754;

// ─── Background design ───
// Export your poster design (WITHOUT the QR code — leave that area blank)
// as a PNG at exactly POSTER_WIDTH x POSTER_HEIGHT and upload it to:
//   /public/posters/venue-poster-bg.png
// It's referenced below as an absolute production URL because Satori/OG
// fetches remote images rather than reading the local filesystem.
const POSTER_BG_URL = 'https://www.rippingbombs.com/posters/venue-poster-bg.png';

// ─── QR code placement ───
// Matches the text block's own right margin (102px) on the QR's left side
// for a balanced two-column layout, and vertically centers the QR against
// the "Scan to Register" text block (heading at y:1289 through the URL
// line) rather than just aligning to the top.
const QR_SIZE = 340;
const QR_X = 102;
const QR_Y = 1254;

export default async function handler(req) {
  const url = new URL(req.url);
  const venueId = url.pathname.split('/').pop();

  if (!venueId) {
    return new Response('Missing venueId', { status: 400 });
  }

  try {
    const { data: club, error } = await supabase
      .from('clubs')
      .select('id, courseName, accountType, status')
      .eq('id', venueId)
      .single();

    if (error || !club || club.accountType !== 'club' || club.status !== 'approved') {
      return new Response('Venue not found', { status: 404 });
    }

    const submissionUrl = `https://www.rippingbombs.com/submit?venue=${club.id}`;
    const qrDataUrl = await QRCode.toDataURL(submissionUrl, {
      width: QR_SIZE,
      margin: 1,
      color: { dark: '#000000ff', light: '#ffffffff' },
    });

    const filenameSafe = (club.courseName || 'venue').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return new ImageResponse(
      (
        <div style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT, display: 'flex', position: 'relative' }}>
          {/* Poster background — your design, full bleed */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POSTER_BG_URL}
            width={POSTER_WIDTH}
            height={POSTER_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
          />
          {/* QR code, stamped on top at the configured position */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            width={QR_SIZE}
            height={QR_SIZE}
            style={{ position: 'absolute', left: QR_X, top: QR_Y }}
          />
        </div>
      ),
      {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        headers: {
          'Content-Disposition': `attachment; filename="${filenameSafe}-poster.png"`,
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (err) {
    // Logs to Vercel function logs with a real stack trace instead of a
    // bare, unexplained 500 — check the Vercel dashboard's Logs tab for this.
    console.error('[poster] failed to generate poster for venueId=', venueId, err);
    return new Response('Failed to generate poster', { status: 500 });
  }
}
