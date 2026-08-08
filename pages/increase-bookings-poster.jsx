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
          /* Hide everything on the page except the poster itself — this
             works regardless of Layout's markup, since it hides by
             default and only un-hides the poster sheet and its children. */
          body * { visibility: hidden; }
          #poster-sheet, #poster-sheet * { visibility: visible; }
          #poster-sheet {
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: none !important;
          }
          html, body { background: none; }
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
              Placement: left margin matches the text block's own right margin
              (102px / 17.27mm) for a balanced two-column layout, vertically
              centered against the "Scan to Register" text block. Converted to
              mm at 150dpi so it lines up regardless of print scaling. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://www.rippingbombs.com/register&margin=0"
            alt="Scan to register on Ripping Bombs"
            style={{ position: 'absolute', left: '17.27mm', top: '212.35mm', width: '57.6mm', height: '57.6mm' }}
          />
        </div>
      </div>
    </>
  );
}
