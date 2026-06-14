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

function drawRBLogo(ctx, x, y, w) {
  const h = w * (595.28 / 841.89);
  const scaleX = w / 841.89;
  const scaleY = h / 595.28;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(146.662,300.557); ctx.lineTo(22.035,521.864); ctx.lineTo(155.217,521.864);
  ctx.lineTo(279.933,300.406); ctx.lineTo(216.568,188.458); ctx.lineTo(369.538,188.458);
  ctx.lineTo(421.032,72.414); ctx.lineTo(17.521,72.414); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(695.492,293.872); ctx.lineTo(824.537,72.414); ctx.lineTo(820.016,72.414);
  ctx.lineTo(820.029,72.414); ctx.lineTo(686.834,72.414); ctx.lineTo(421.032,72.414);
  ctx.lineTo(472.527,188.458); ctx.lineTo(621.49,188.458); ctx.lineTo(562.133,293.872);
  ctx.lineTo(623.367,405.807); ctx.lineTo(472.527,405.807); ctx.lineTo(421.032,521.864);
  ctx.lineTo(686.834,521.851); ctx.lineTo(820.029,521.864); ctx.lineTo(820.016,521.851);
  ctx.lineTo(824.537,521.851); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function generateClubShareImage(org, best, ul) {
  return new Promise(resolve => {
    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background + accent bars + grid
    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a3e635'; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H - 8, W, 8);
    ctx.strokeStyle = 'rgba(163,230,53,0.04)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const draw = (flagImg, logoImg) => {
      // RB logo top left, flag top right
      drawRBLogo(ctx, 80, 58, 80);
      if (flagImg) ctx.drawImage(flagImg, W - 160, 58, 80, 60);

      // Top divider
      ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(W - 80, 150); ctx.stroke();

      // Club logo if available
      if (logoImg) {
        const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
        const lh = 90, lw = lh * aspect;
        ctx.drawImage(logoImg, (W - lw) / 2, 168, lw, lh);
      }

      // CLUB LEADERBOARD label
      ctx.fillStyle = '#a3e635'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
      ctx.fillText('CLUB LEADERBOARD', W / 2, logoImg ? 290 : 210);

      // Club name
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 58px Arial Black, Arial';
      const name = org.courseName.toUpperCase();
      const displayName = name.length > 20 ? name.slice(0, 20) + '...' : name;
      ctx.fillText(displayName, W / 2, logoImg ? 370 : 290);

      // Location
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '30px Arial';
      ctx.fillText(org.location || '', W / 2, logoImg ? 420 : 340);

      if (best) {
        // Record label
        ctx.fillStyle = 'rgba(163,230,53,0.7)'; ctx.font = 'bold 22px Arial';
        ctx.fillText('CLUB RECORD', W / 2, 490);

        // Big distance number
        ctx.fillStyle = '#a3e635'; ctx.font = 'bold 280px Arial Black, Arial';
        ctx.fillText(String(best.dist), W / 2, 760);

        // Units
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = 'bold 48px Arial';
        ctx.fillText((ul || 'yds').toUpperCase(), W / 2, 820);

        // Verified badge
        const badgeW = 320, badgeH = 44, badgeX = (W - badgeW) / 2, badgeY = 845;
        ctx.strokeStyle = 'rgba(163,230,53,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = 'rgba(163,230,53,0.08)'; ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = '#a3e635'; ctx.font = 'bold 18px Arial';
        ctx.fillText('RECORD HOLDER', W / 2, badgeY + 29);

        // Player name
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px Arial Black, Arial';
        ctx.fillText(best.player.toUpperCase(), W / 2, 960);

        // Details
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '26px Arial';
        ctx.fillText(`${best.club}  |  HCP ${best.hcp}  |  ${fmtDate(best.date)}`, W / 2, 1000);
      }

      // Bottom divider + URL
      ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 1030); ctx.lineTo(W - 80, 1030); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '24px Arial';
      ctx.fillText('rippingbombs.com', W / 2, 1058);

      resolve(canvas.toDataURL('image/png'));
    };

    const loadImg = src => new Promise(res => {
      if (!src) return res(null);
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => res(img); img.onerror = () => res(null); img.src = src;
    });

    Promise.all([
      loadImg(org.country ? `https://flagcdn.com/80x60/${org.country.toLowerCase()}.png` : null),
      loadImg(org.logo || null),
    ]).then(([flagImg, logoImg]) => draw(flagImg, logoImg));
  });
}

function ShareBar({ org, best, canonicalUrl, ul }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const shareText = `${org.courseName} Longest Drive Leaderboard${best ? ` — Club record: ${best.player} with ${best.dist} ${ul || 'yds'}` : ''}. Powered by Ripping Bombs`;
  const encoded = encodeURIComponent(canonicalUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleImage = async () => {
    setGenerating(true);
    const dataUrl = await generateClubShareImage(org, best, ul);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `rippingbombs-${org.courseName.toLowerCase().replace(/\s+/g, '-')}-leaderboard.png`;
    a.click();
    setGenerating(false);
  };

  const iconBtn = (href, onClick, icon, label) => {
    const style = {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      background: 'transparent', border: `1px solid ${BDR}`,
      color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 11,
      padding: '9px 16px', cursor: 'pointer', letterSpacing: 0.4,
      textDecoration: 'none', whiteSpace: 'nowrap', transition: 'border-color .15s',
    };
    return href
      ? <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{icon}<span>{label}</span></a>
      : <button onClick={onClick} style={style}>{icon}<span>{label}</span></button>;
  };

  // SVG icons in ORG green
  const IconLink   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
  const IconWA     = <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
  const IconFB     = <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  const IconX      = <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  const IconDL     = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

  return (
    <div style={{ margin: '24px 0', padding: '16px 20px', background: BG2, border: `1px solid ${BDR}` }}>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIM, textTransform: 'uppercase', marginBottom: 12 }}>Share This Leaderboard</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {iconBtn(null, handleCopy, IconLink, copied ? 'Copied!' : 'Copy Link')}
        {iconBtn(`https://wa.me/?text=${encodedText}%20${encoded}`, null, IconWA, 'WhatsApp')}
        {iconBtn(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, null, IconFB, 'Facebook')}
        {iconBtn(`https://x.com/intent/tweet?text=${encodedText}&url=${encoded}`, null, IconX, 'X / Twitter')}
        {iconBtn(null, handleImage, IconDL, generating ? 'Generating...' : 'Download Image')}
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
