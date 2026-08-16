import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { fmtDate, tier, nowWeek, weekLabel, prevWeek, nextWeek, sameWeek } from '../../lib/constants';
import { BadgePill, countryFlag } from '../../components/UI';
import PlayerAvatar from '../../components/PlayerAvatar';

function toSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('status', 'approved');

  if (!clubs) return { notFound: true };

  const org = clubs.find(c => (c.customSlug || toSlug(c.courseName)) === slug);
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

  const simOrgIds = [...new Set(entries.filter(e => e.is_simulator).map(e => e.orgId))];
  let simOrgs = [];
  if (simOrgIds.length) {
    const { data } = await supabase
      .from('clubs')
      .select('id, fullName, avatarUrl')
      .in('id', simOrgIds);
    simOrgs = data || [];
  }

  return { props: { org, clubEntries: entries, simOrgs } };
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

    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FF0090'; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H - 8, W, 8);
    ctx.strokeStyle = 'rgba(255,0,144,0.04)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const draw = (flagImg, logoImg) => {
      drawRBLogo(ctx, 80, 58, 80);
      if (flagImg) ctx.drawImage(flagImg, W - 160, 58, 80, 60);
      ctx.strokeStyle = 'rgba(255,0,144,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(W - 80, 150); ctx.stroke();
      if (logoImg) {
        const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
        const lh = 90, lw = lh * aspect;
        ctx.drawImage(logoImg, (W - lw) / 2, 168, lw, lh);
      }
      ctx.fillStyle = '#FF0090'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
      ctx.fillText('CLUB LEADERBOARD', W / 2, logoImg ? 290 : 210);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 58px Arial Black, Arial';
      const name = org.courseName.toUpperCase();
      const displayName = name.length > 20 ? name.slice(0, 20) + '...' : name;
      ctx.fillText(displayName, W / 2, logoImg ? 370 : 290);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '30px Arial';
      ctx.fillText(org.location || '', W / 2, logoImg ? 420 : 340);
      if (best) {
        ctx.fillStyle = 'rgba(255,0,144,0.7)'; ctx.font = 'bold 22px Arial';
        ctx.fillText('CLUB RECORD', W / 2, 490);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 280px Arial Black, Arial';
        ctx.fillText(String(best.dist), W / 2, 760);
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = 'bold 48px Arial';
        ctx.fillText((ul || 'yds').toUpperCase(), W / 2, 820);
        const badgeW = 320, badgeH = 44, badgeX = (W - badgeW) / 2, badgeY = 845;
        ctx.strokeStyle = 'rgba(255,0,144,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = 'rgba(255,0,144,0.08)'; ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Arial';
        ctx.fillText('RECORD HOLDER', W / 2, badgeY + 29);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px Arial Black, Arial';
        ctx.fillText(best.player.toUpperCase(), W / 2, 960);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '26px Arial';
        ctx.fillText(`${best.club}  |  HCP ${best.hcp}  |  ${fmtDate(best.date)}`, W / 2, 1000);
      }
      ctx.strokeStyle = 'rgba(255,0,144,0.3)'; ctx.lineWidth = 1;
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

    const flagCode = (org.country || '').toLowerCase().trim();
    const flagSrc = flagCode ? `https://flagcdn.com/80x60/${flagCode}.png` : null;
    Promise.all([loadImg(flagSrc), loadImg(org.logo || null)]).then(([flagImg, logoImg]) => draw(flagImg, logoImg));
  });
}

function ShareBar({ org, best, canonicalUrl, ul }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleImage = async () => {
    setGenerating(true);
    try {
      const dataUrl = await generateClubShareImage(org, best, ul);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${toSlug(org.courseName)}-leaderboard.png`;
      a.click();
    } finally {
      setGenerating(false);
    }
  };

  const shareText = best
    ? `${best.player} just hit a ${best.dist}${ul} drive at ${org.courseName} — check the leaderboard on Ripping Bombs`
    : `Check out the ${org.courseName} longest drive leaderboard on Ripping Bombs`;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(canonicalUrl)}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${canonicalUrl}`)}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;

  const iconBtnStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'transparent', border: `1px solid ${BDR}`, borderRadius: 6, cursor: 'pointer', padding: 0 };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <button onClick={handleCopy} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: copied ? ORG : MUT, fontFamily: SANS, fontSize: 11, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', letterSpacing: 0.5 }}>
        {copied ? '✓ COPIED' : '⎘ COPY LINK'}
      </button>
      <button onClick={handleImage} disabled={generating} style={{ background: 'linear-gradient(135deg,#FF0090,#ff66c4)', border: 'none', color: '#fff', fontFamily: SANS, fontSize: 11, fontWeight: 700, padding: '7px 14px', cursor: 'pointer', letterSpacing: 0.5, opacity: generating ? 0.7 : 1 }}>
        {generating ? 'GENERATING...' : '↗ SHARE IMAGE'}
      </button>

      <span style={{ width: 1, height: 22, background: BDR, margin: '0 2px' }} />

      <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" title="Share on Facebook" aria-label="Share on Facebook" style={iconBtnStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a href={xShareUrl} target="_blank" rel="noopener noreferrer" title="Share on X" aria-label="Share on X" style={iconBtnStyle}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={ORG}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <button onClick={handleCopy} title="Copy link to share on Instagram" aria-label="Copy link to share on Instagram" style={iconBtnStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.44.645-1.44 1.44s.645 1.44 1.44 1.44 1.44-.644 1.44-1.44-.644-1.44-1.44-1.44z"/>
        </svg>
      </button>
      <button onClick={handleCopy} title="Copy link to share on TikTok" aria-label="Copy link to share on TikTok" style={iconBtnStyle}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={ORG}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      </button>
      <a href={waShareUrl} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" aria-label="Share on WhatsApp" style={iconBtnStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ORG}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}

export default function ClubPage({ org, clubEntries, simOrgs = [] }) {
  const [week, setWeek] = useState(nowWeek());
  const [allTime, setAllTime] = useState(true);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fPlayer, setFPlayer] = useState('');
  const [fGender, setFGender] = useState('');
  const [fHcp, setFHcp] = useState('');
  const [fAge, setFAge] = useState('');
  const [fClub, setFClub] = useState('');
  const [sortBy, setSortBy] = useState('dist');

  // Reset filters when view changes
  useEffect(() => {}, [allTime, week]);

  const hcpIn = (hcp, b) => {
    if (!b) return true;
    if (b === 'scratch') return hcp <= 0;
    if (b === 'low') return hcp > 0 && hcp <= 5;
    if (b === 'mid') return hcp > 5 && hcp <= 14;
    if (b === 'high') return hcp > 14 && hcp <= 28;
    if (b === 'beginner') return hcp > 28;
    return true;
  };

  const ageIn = (age, b) => {
    if (!b) return true;
    if (b === 'u25') return age < 25;
    if (b === '25-40') return age >= 25 && age < 40;
    if (b === '40-55') return age >= 40 && age < 55;
    if (b === '55+') return age >= 55;
    return true;
  };

  const sorted = [...clubEntries]
    .filter(e => allTime || sameWeek(e.date, week))
    .filter(e => !fPlayer || e.player.toLowerCase().includes(fPlayer.toLowerCase()))
    .filter(e => !fGender || e.gender === fGender)
    .filter(e => hcpIn(e.hcp, fHcp))
    .filter(e => ageIn(e.age, fAge))
    .filter(e => !fClub || e.club.toLowerCase().includes(fClub.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'hcp') return a.hcp - b.hcp;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      return Number(b.dist) - Number(a.dist);
    });

  const allSorted = [...clubEntries].sort((a, b) => Number(b.dist) - Number(a.dist));
  const best = allSorted[0];
  const totalPlayers = new Set(clubEntries.map(e => e.player)).size;
  const simCount = clubEntries.filter(e => e.is_simulator).length;
  const officialCount = clubEntries.filter(e => !e.is_simulator).length;
  const activeFilterCount = [fPlayer, fGender, fHcp, fAge, fClub].filter(Boolean).length;

  const ul = 'yds';
  const canonicalUrl = `https://www.rippingbombs.com/clubs/${toSlug(org.courseName)}`;
  const metaDesc = `Longest drive leaderboard for ${org.courseName}, ${org.location}. ${clubEntries.length} drives recorded on Ripping Bombs.`;
  const simOrgMap = Object.fromEntries((simOrgs || []).map(o => [o.id, o]));

  // Pages with no recorded drives yet are thin/near-duplicate content in
  // Google's eyes — noindex them until the venue has at least one real
  // submission, then they naturally become indexable and re-enter the
  // sitemap (see scripts/generate-sitemap.cjs).
  const isEmpty = clubEntries.length === 0;

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
        {isEmpty && <meta name="robots" content="noindex, follow" />}
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

        {/* Club record */}
        {best && (
          <div style={{ background: 'linear-gradient(135deg,rgba(255,0,144,0.1),rgba(255,0,144,0.03))', border: '1px solid rgba(255,0,144,0.2)', padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ORG, marginBottom: 6, textTransform: 'uppercase' }}>Club Record</div>
              <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, letterSpacing: .5 }}>{best.player}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, marginTop: 3 }}>
                {best.club} &middot; HCP {best.hcp} &middot; {fmtDate(best.date)}
                {best.is_simulator && <span style={{ marginLeft: 6, color: DIM }}>(simulator)</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: DISP, fontSize: 48, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{best.dist}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>{ul}</div>
            </div>
          </div>
        )}

        <ShareBar org={org} best={best} canonicalUrl={canonicalUrl} ul={ul} />

        {/* Weekly championship banner */}
        <div style={{ background: allTime ? BG2 : 'linear-gradient(135deg,rgba(255,0,144,0.14),rgba(255,0,144,0.03))', border: `1px solid ${allTime ? BDR : 'rgba(255,0,144,0.3)'}`, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => setWeek(prevWeek(week))} disabled={allTime} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: allTime ? DIM : MUT, fontFamily: SANS, fontSize: 14, padding: '8px 13px', cursor: allTime ? 'default' : 'pointer', opacity: allTime ? 0.4 : 1 }}>‹</button>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: allTime ? DIM : ORG, textTransform: 'uppercase', marginBottom: 3 }}>🏆 Weekly Championship</div>
              <div style={{ fontFamily: DISP, fontSize: 22, color: allTime ? MUT : TXT, letterSpacing: .5 }}>{allTime ? 'All-Time Leaderboard' : weekLabel(week)}</div>
            </div>
            <button onClick={() => setWeek(nextWeek(week))} disabled={allTime} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: allTime ? DIM : MUT, fontFamily: SANS, fontSize: 14, padding: '8px 13px', cursor: allTime ? 'default' : 'pointer', opacity: allTime ? 0.4 : 1 }}>›</button>
          </div>
          <button onClick={() => setAllTime(v => !v)} style={{ background: allTime ? ORG : 'transparent', border: `1px solid ${allTime ? ORG : BDR}`, color: allTime ? '#111' : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {allTime ? 'All Time ✓' : 'View All-Time →'}
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: filtersOpen ? 12 : 20, flexWrap: 'wrap' }}>
          <button onClick={() => setFiltersOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: filtersOpen ? BG3 : 'transparent', border: `1px solid ${BDR}`, color: TXT, fontFamily: SANS, fontWeight: 600, fontSize: 13, padding: '9px 14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, width: 14 }}>
              <span style={{ height: 2, background: TXT }} />
              <span style={{ height: 2, background: TXT }} />
              <span style={{ height: 2, background: TXT }} />
            </span>
            Filters
            {activeFilterCount > 0 && <span style={{ background: ORG, color: '#111', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px' }}>{activeFilterCount}</span>}
            <span style={{ fontSize: 10, color: DIM, marginLeft: 2 }}>{filtersOpen ? '▴' : '▾'}</span>
          </button>

          <div style={{ minWidth: 160 }}>
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', background: BG2, border: `1px solid ${BDR}`, padding: '9px 28px 9px 12px', color: TXT, fontFamily: SANS, fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                {[['dist','Sort: Distance'],['date','Sort: Date'],['hcp','Sort: Handicap'],['age','Sort: Age']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={() => { setFPlayer(''); setFGender(''); setFHcp(''); setFAge(''); setFClub(''); }} style={{ background: 'transparent', border: 'none', color: DIM, fontFamily: SANS, fontSize: 12, textDecoration: 'underline', cursor: 'pointer', padding: '9px 4px' }}>
              Clear filters
            </button>
          )}
        </div>

        {filtersOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 20, padding: '16px', background: BG2, border: `1px solid ${BDR}` }}>
            {[
              { label: 'Search Player', val: fPlayer, set: setFPlayer, ph: 'Player name' },
              { label: 'Gender', val: fGender, set: setFGender, ph: 'All', opts: [['','All'],['male','♂ Male'],['female','♀ Female']] },
              { label: 'Handicap', val: fHcp, set: setFHcp, ph: 'All', opts: [['','All'],['scratch','Scratch'],['low','Low (1–5)'],['mid','Mid (6–14)'],['high','High (15–28)'],['beginner','Beginner (28+']] },
              { label: 'Age Group', val: fAge, set: setFAge, ph: 'All', opts: [['','All'],['u25','Under 25'],['25-40','25–40'],['40-55','40–55'],['55+','55+']] },
              { label: 'Club Brand', val: fClub, set: setFClub, ph: 'e.g. TaylorMade' },
            ].map(({ label, val, set, ph, opts }) => (
              <div key={label}>
                <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DIM, letterSpacing: 1.2, marginBottom: 5, textTransform: 'uppercase' }}>{label}</div>
                {opts
                  ? <div style={{ position: 'relative' }}>
                      <select value={val} onChange={e => set(e.target.value)} style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '8px 28px 8px 10px', color: val ? TXT : DIM, fontFamily: SANS, fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
                    </div>
                  : <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '8px 10px', color: TXT, fontFamily: SANS, fontSize: 13, outline: 'none' }} />
                }
              </div>
            ))}
          </div>
        )}

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
              {sorted.map((e, i) => {
                // Only link to a profile if the entry came from a registered sim user
                // tagged to this venue (orgId !== venue id). Venue-submitted players
                // are not registered accounts and have no profile page.
                const simOrg = (e.is_simulator && e.orgId !== org.id) ? simOrgMap[e.orgId] : null;
                const profileSlug = simOrg?.fullName ? nameToSlug(simOrg.fullName) : null;
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: i < 3 ? ORG : DIM, fontWeight: i < 3 ? 700 : 400 }}>{rankLabel(i)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlayerAvatar fullName={simOrg?.fullName || e.player} avatarUrl={simOrg?.avatarUrl} size={28} />
                        <div>
                          {profileSlug ? (
                            <Link href={`/profile/${profileSlug}`} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: ORG, textDecoration: 'none', borderBottom: '1px solid rgba(255,0,144,0.3)' }}>
                              {e.player}
                            </Link>
                          ) : (
                            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT }}>{e.player}</div>
                          )}
                          {e.is_simulator && <div style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>simulator</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: DISP, fontSize: 20, color: ORG, whiteSpace: 'nowrap' }}>
                      {e.dist} <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{ul}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.club}</td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.hcp}</td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.age}</td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 12, color: MUT }}>{e.gender === 'female' ? 'Female' : 'Male'}</td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 11, color: DIM, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                    <td style={{ padding: '11px 14px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: ORG }}>{tier(e.dist)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: DIM, fontFamily: SANS, fontSize: 13 }}>
              No drives match your filters
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
