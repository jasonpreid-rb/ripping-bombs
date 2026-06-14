import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../../lib/constants';
import { BadgePill, countryFlag } from '../../components/UI';

function toSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('status', 'approved')
    .eq('accountType', 'club');

  if (!clubs) return { notFound: true };

  const org = clubs.find(c => toSlug(c.courseName) === slug);
  if (!org) return { notFound: true };

  const { data: ownEntries } = await supabase
    .from('entries')
    .select('*')
    .eq('orgId', org.id);

  const { data: venueEntries } = await supabase
    .from('entries')
    .select('*')
    .eq('venueId', org.id);

  const allEntries = [...(ownEntries || []), ...(venueEntries || [])];
  const seen = new Set();
  const entries = allEntries.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return { props: { org, clubEntries: entries } };
}

function generateShareImage(org, best, ul) {
  return new Promise(resolve => {
    const size = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, size, size);

    // Lime accent bar top
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(0, 0, size, 8);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 80) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }

    // Club name
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 62px Arial Black, Arial`;
    ctx.textAlign = 'center';
    const name = org.courseName.toUpperCase();
    ctx.fillText(name.length > 22 ? name.slice(0, 22) + '...' : name, size / 2, 200);

    // Location
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '28px Arial';
    ctx.fillText(`${org.location || ''}${org.country ? '  ' + org.country.toUpperCase() : ''}`, size / 2, 260);

    // Divider
    ctx.fillStyle = 'rgba(163,230,53,0.3)';
    ctx.fillRect(140, 300, size - 280, 1);

    if (best) {
      // Club record label
      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 18px Arial';
      ctx.letterSpacing = '4px';
      ctx.fillText('CLUB RECORD', size / 2, 370);

      // Distance
      ctx.fillStyle = '#a3e635';
      ctx.font = `bold 180px Arial Black, Arial`;
      ctx.fillText(best.dist, size / 2, 570);

      // Yards label
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '36px Arial';
      ctx.fillText(ul || 'yds', size / 2, 625);

      // Player name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Arial';
      ctx.fillText(best.player, size / 2, 710);

      // Details
      ctx.fillStyle = '#666666';
      ctx.font = '26px Arial';
      ctx.fillText(`${best.club}  |  HCP ${best.hcp}  |  ${fmtDate(best.date)}`, size / 2, 760);
    }

    // Divider
    ctx.fillStyle = 'rgba(163,230,53,0.3)';
    ctx.fillRect(140, 820, size - 280, 1);

    // Branding
    ctx.fillStyle = '#a3e635';
    ctx.font = 'bold 32px Arial Black, Arial';
    ctx.fillText('RIPPINGBOMBS.COM', size / 2, 890);

    ctx.fillStyle = '#555555';
    ctx.font = '22px Arial';
    ctx.fillText('The Global Home of Longest Drives', size / 2, 930);

    // Lime accent bar bottom
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(0, size - 8, size, 8);

    resolve(canvas.toDataURL('image/png'));
  });
}

function ShareBar({ org, best, canonicalUrl, ul }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const recordText = best
    ? `${best.player} holds the club record at ${best.dist} ${ul || 'yds'}`
    : 'Check out the leaderboard';

  const shareText = `${org.courseName} Longest Drive Leaderboard - ${recordText}. Powered by Ripping Bombs`;
  const encoded = encodeURIComponent(canonicalUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImage = async () => {
    setGenerating(true);
    const dataUrl = await generateShareImage(org, best, ul);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${org.courseName.toLowerCase().replace(/\s+/g, '-')}-leaderboard.png`;
    a.click();
    setGenerating(false);
  };

  const btnStyle = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: bg, color, border: `1px solid ${border || bg}`,
    fontFamily: SANS, fontWeight: 700, fontSize: 11,
    padding: '8px 14px', cursor: 'pointer', letterSpacing: 0.4,
    textDecoration: 'none', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ margin: '24px 0', padding: '16px 20px', background: BG2, border: `1px solid ${BDR}` }}>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: 'uppercase', marginBottom: 12 }}>Share This Leaderboard</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={handleCopy} style={btnStyle('transparent', copied ? '#4ade80' : ORG, copied ? '#4ade80' : ORG)}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a
          href={`https://wa.me/?text=${encodedText}%20${encoded}`}
          target="_blank" rel="noopener noreferrer"
          style={btnStyle('#25D366', '#fff', '#25D366')}>
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
          target="_blank" rel="noopener noreferrer"
          style={btnStyle('#1877F2', '#fff', '#1877F2')}>
          Facebook
        </a>
        <a
          href={`https://x.com/intent/tweet?text=${encodedText}&url=${encoded}`}
          target="_blank" rel="noopener noreferrer"
          style={btnStyle('#000', '#fff', '#333')}>
          X / Twitter
        </a>
        <button onClick={handleImage} disabled={generating} style={btnStyle(ORG, '#111', ORG)}>
          {generating ? 'Generating...' : 'Download Image'}
        </button>
      </div>
    </div>
  );
}

export default function ClubPage({ org, clubEntries, cvt, unitLbl }) {
  const [week, setWeek] = useState(nowWeek());
  const [allTime, setAllTime] = useState(false);

  const sorted = [...clubEntries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const best = sorted[0];
  const weekEntries = allTime ? sorted : sorted.filter(e => sameWeek(e.date, week));
  const totalPlayers = new Set(clubEntries.map(e => e.player)).size;
  const simCount = clubEntries.filter(e => e.is_simulator).length;
  const officialCount = clubEntries.filter(e => !e.is_simulator).length;

  const cv = cvt || (d => d);
  const ul = unitLbl || 'yds';
  const canonicalUrl = `https://www.rippingbombs.com/clubs/${toSlug(org.courseName)}`;
  const metaDesc = `Longest drive leaderboard for ${org.courseName}, ${org.location}. ${clubEntries.length} drives recorded on Ripping Bombs.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: org.courseName,
    url: canonicalUrl,
    description: metaDesc,
    ...(org.location && { location: { '@type': 'Place', name: `${org.location}${org.country ? ', ' + org.country.toUpperCase() : ''}` } }),
    sport: 'Golf',
  };

  const rankLabel = i => i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `#${i + 1}`;

  return (
    <>
      <Head>
        <title>{org.courseName} Longest Drive Leaderboard | Ripping Bombs</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${org.courseName} | Ripping Bombs`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Ripping Bombs" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div style={{ padding: '28px 18px 80px', maxWidth: 1000, margin: '0 auto' }}>

        <Link href="/clubs" style={{ fontFamily: SANS, fontSize: 12, color: DIM, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
          &larr; All Clubs
        </Link>

        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            {org.logo && <img src={org.logo} alt={org.courseName} style={{ width: 56, height: 56, objectFit: 'cover', border: `1px solid ${BDR}` }} />}
            <div>
              <h1 style={{ fontFamily: DISP, fontSize: 'clamp(26px,5vw,40px)', color: TXT, letterSpacing: 1, lineHeight: 1.1, margin: '0 0 6px' }}>
                {org.courseName} {org.country && countryFlag(org.country)}
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>{org.location}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {org.badge && <BadgePill badge={org.badge} />}
            {org.is_founding_member && (
              <span style={{ fontFamily: SANS, fontSize: 12, color: ORG }}>&#10022; Founding Member</span>
            )}
            <span style={{ fontFamily: SANS, fontSize: 11, color: MUT, background: BG3, border: `1px solid ${BDR}`, padding: '2px 9px' }}>
              {clubEntries.length} drives &middot; {totalPlayers} players
            </span>
            {simCount > 0 && (
              <span style={{ fontFamily: SANS, fontSize: 11, color: DIM, background: BG3, border: `1px solid ${BDR}`, padding: '2px 9px' }}>
                {officialCount} official &middot; {simCount} simulator
              </span>
            )}
          </div>
        </div>

        {best && (
          <div style={{ background: 'linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))', border: '1px solid rgba(163,230,53,0.22)', padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 6, textTransform: 'uppercase' }}>Club Record</div>
              <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: .5 }}>{best.player}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, marginTop: 3 }}>
                {best.club} &middot; HCP {best.hcp} &middot; {fmtDate(best.date)}
                {best.is_simulator && <span style={{ marginLeft: 6, color: DIM }}>(simulator)</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: DISP, fontSize: 48, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{cv(best.dist)}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>{ul}</div>
            </div>
          </div>
        )}

        <ShareBar org={org} best={best} canonicalUrl={canonicalUrl} ul={ul} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <button onClick={() => setAllTime(v => !v)}
            style={{ background: allTime ? ORG : 'transparent', border: `1px solid ${allTime ? ORG : BDR}`, color: allTime ? '#111' : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '7px 14px', cursor: 'pointer' }}>
            {allTime ? 'All Time (on)' : 'All Time'}
          </button>
          {!allTime && (
            <>
              <button onClick={() => setWeek(prevWeek(week))} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: SANS, fontSize: 13, padding: '7px 12px', cursor: 'pointer' }}>&lsaquo;</button>
              <span style={{ fontFamily: SANS, fontSize: 13, color: TXT, fontWeight: 600 }}>{weekLabel(week)}</span>
              <button onClick={() => setWeek(nextWeek(week))} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, fontFamily: SANS, fontSize: 13, padding: '7px 12px', cursor: 'pointer' }}>&rsaquo;</button>
            </>
          )}
        </div>

        <div style={{ overflowX: 'auto', border: `1px solid ${BDR}`, background: BG2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                {['Rank', 'Player', 'Distance', 'Club', 'HCP', 'Age', 'Gender', 'Date', 'Tier'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: DIM, textTransform: 'uppercase', textAlign: 'left', borderBottom: `2px solid ${BDR}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekEntries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: i < 3 ? ORG : DIM, fontWeight: i < 3 ? 700 : 400 }}>{rankLabel(i)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT }}>{e.player}</div>
                    {e.is_simulator && <div style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>simulator</div>}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: DISP, fontSize: 20, color: ORG, whiteSpace: 'nowrap' }}>
                    {cv(e.dist)} <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{ul}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.club}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.hcp}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.age}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.gender === 'female' ? 'Female' : 'Male'}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 11, color: DIM, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: ORG }}>{tier(e.dist)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {weekEntries.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: DIM, fontFamily: SANS, fontSize: 13 }}>
              No drives for this period
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, borderTop: `1px solid ${BDR}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>Simulator player? Tag your drive to this venue.</div>
          <Link href="/register" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: ORG, textDecoration: 'none', border: `1px solid ${ORG}`, padding: '10px 20px', letterSpacing: 0.5 }}>
            REGISTER FREE &rarr;
          </Link>
        </div>

      </div>
    </>
  );
}
