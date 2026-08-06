import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BG3 = '#1e1e1e';
const BDR = '#2a2a2a';
const DIM = '#555';

export default function VenueQrPage() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' && localStorage.getItem('rb_club');
    if (!raw) { router.replace('/login'); return; }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { router.replace('/login'); return; }

    if (parsed.accountType !== 'club') {
      // QR posters are for physical venues, not individual simulator accounts
      router.replace('/dashboard');
      return;
    }

    (async () => {
      const { data: freshClub } = await supabase.from('clubs').select('*').eq('id', parsed.id).single();
      setClub(freshClub || parsed);
      setLoading(false);
    })();
  }, []);

  if (loading || !club) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUT }}>
        Loading…
      </div>
    );
  }

  const submissionUrl = `https://www.rippingbombs.com/submit?venue=${club.id}`;
  const qrImageUrl = `/api/qrcode/${club.id}?size=1000`;
  const qrDownloadUrl = `/api/qrcode/${club.id}?size=1600&download=1`;

  const copyLink = () => {
    navigator.clipboard.writeText(submissionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Get Your QR Poster — {club.courseName} | Ripping Bombs</title>
      </Head>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem 4rem', color: TXT }}>
        <a href="/dashboard" style={{ fontFamily: 'sans-serif', fontSize: 12, color: DIM, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
          &larr; Dashboard
        </a>

        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '18px 0 6px' }}>
          Your QR Poster Assets
        </h1>
        <p style={{ color: MUT, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28 }}>
          Anyone who scans this QR code lands straight on a submission form with <strong style={{ color: TXT }}>{club.courseName}</strong> already
          selected as their venue — no searching for you in a dropdown. Print it, put it on a table tent, a wall, or a screen in your simulator bays.
        </p>

        <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt={`QR code for ${club.courseName}`} width={220} height={220} style={{ display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={`/api/poster/${club.id}`}
              style={{ background: ORG, border: `1px solid ${ORG}`, color: '#000', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 22px', textDecoration: 'none', letterSpacing: 0.5 }}
            >
              DOWNLOAD PRINT-READY POSTER &rarr;
            </a>
            <a
              href={qrDownloadUrl}
              style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: 'sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 22px', textDecoration: 'none', letterSpacing: 0.5 }}
            >
              QR CODE ONLY
            </a>
          </div>
        </div>

        <div style={{ background: BG3, border: `1px solid ${BDR}`, padding: '18px 20px', marginBottom: 28 }}>
          <div style={{ fontFamily: 'sans-serif', fontSize: 10, fontWeight: 700, color: DIM, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
            Your Submission Link
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <code style={{ fontFamily: 'monospace', fontSize: 13, color: TXT, wordBreak: 'break-all', flex: 1 }}>{submissionUrl}</code>
            <button
              onClick={copyLink}
              style={{ background: copied ? 'rgba(163,230,53,0.15)' : 'transparent', border: `1px solid ${copied ? '#a3e635' : BDR}`, color: copied ? '#a3e635' : TXT, fontFamily: 'sans-serif', fontWeight: 700, fontSize: 12, padding: '8px 16px', cursor: 'pointer', letterSpacing: 0.5, flexShrink: 0 }}
            >
              {copied ? 'COPIED ✓' : 'COPY'}
            </button>
          </div>
        </div>

        <div style={{ fontFamily: 'sans-serif', fontSize: 13, color: MUT, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: TXT }}>Print-Ready Poster</strong> is your venue's QR code stamped directly onto the official Ripping Bombs poster
            design at print resolution — just download and print, nothing to assemble.
          </p>
          <p>
            If you'd rather use your own design, grab <strong style={{ color: TXT }}>QR Code Only</strong> and drop it in yourself — keep a quiet-zone
            margin around it (roughly the width of one QR square on each side) and avoid stretching or recoloring the code so it stays scannable.
          </p>
        </div>
      </div>
    </>
  );
}
