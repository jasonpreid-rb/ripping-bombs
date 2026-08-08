import { ImageResponse } from '@vercel/og';
import QRCode from 'qrcode';

export const config = { runtime: 'edge' };

// Generic version of pages/api/poster/[venueId].js — used for the
// "Download Poster" button on pages/increase-golf-simulator-bookings.jsx,
// where there's no specific venue to look up yet (a prospective venue
// downloading this hasn't registered). The QR always points to /register.
// Same canvas, same background, same QR position as the personalized
// version, so the two stay visually identical.

const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1754;
const POSTER_BG_URL = 'https://www.rippingbombs.com/posters/venue-poster-bg.png';
const QR_SIZE = 340;
const QR_X = 102;
const QR_Y = 1254;

export default async function handler() {
  const qrDataUrl = await QRCode.toDataURL('https://www.rippingbombs.com/register', {
    width: QR_SIZE,
    margin: 1,
    color: { dark: '#000000ff', light: '#ffffffff' },
  });

  return new ImageResponse(
    (
      <div style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT, display: 'flex', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER_BG_URL}
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
        />
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
        'Content-Disposition': 'attachment; filename="ripping-bombs-venue-poster.png"',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
