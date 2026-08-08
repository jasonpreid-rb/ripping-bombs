import Head from 'next/head';

// This was previously public/increase-bookings-poster.html — a raw static
// file, which hit a Next.js routing conflict (public/ .html files can be
// shadowed by Next's own page-resolution logic). Converting it to a normal
// page sidesteps that entirely, since every other page in the app already
// routes correctly this way.
//
// Note: the URL changes slightly as a result — Next.js pages don't use
// file extensions in their routes, so this now lives at
// /increase-bookings-poster (no ".html"), not /increase-bookings-poster.html.
// If you have that exact .html URL saved anywhere external (an email
// template, a printed QR code, etc.), let me know and I'll add a rewrite
// in next.config.js so the old URL keeps working and forwards here.

export default function IncreaseBookingsPoster() {
  return (
    <>
      <Head>
        <title>Ripping Bombs — Venue Poster</title>
      </Head>

      <style jsx global>{`
        @page { size: A4 portrait; margin: 0; }
        html, body {
          margin: 0; padding: 0;
          background: #4a4a4a;
        }
        @media print {
          html, body { background: none; }
          #poster-sheet { box-shadow: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div
          id="poster-sheet"
          style={{
            position: 'relative',
            width: '210mm',
            height: '297mm',
            backgroundImage: "url('/posters/venue-poster-bg.png')",
            backgroundSize: '210mm 297mm',
            backgroundRepeat: 'no-repeat',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Generic marketing QR — always points to /register, not venue-specific.
              For a real venue's personalized poster with their own auto-connect
              QR code, use /api/poster/[venueId] instead (see pages/venue-qr.jsx).
              Placement verified against the actual design: blank region
              x:0-470px, y:1250-1620px on the 1240x1754px source, converted to mm
              at 150dpi so it lines up regardless of print scaling. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://www.rippingbombs.com/register&margin=0"
            alt="Scan to register on Ripping Bombs"
            style={{ position: 'absolute', left: '6.26mm', top: '218.4mm', width: '57.6mm', height: '57.6mm' }}
          />
        </div>
      </div>
    </>
  );
}
