import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoCTA } from '../components/SeoPageLayout';
import { ORG, TXT, MUT, DIM, BG2, BG3, BDR, SANS, DISP, COUNTRIES, toSlug, tier } from '../lib/constants';
import { countryFlag } from '../components/UI';

const linkStyle = { color: ORG, textDecoration: 'underline' };

// Same two exceptions the existing 15 country pages already use — every
// other country's page slug is just "longest-drive-" + toSlug(name).
function slugFor(country) {
  if (country.code === 'GB') return 'longest-drive-uk';
  if (country.code === 'US') return 'longest-drive-usa';
  return `longest-drive-${toSlug(country.name)}`;
}

// Equirectangular projection (x = lon, y = lat) of each country's rough
// centroid, mapped onto a 1000×460 viewBox. Approximate — this is a
// stylised directory map, not a survey-accurate one.
const COUNTRY_XY = {
  AF: [683.3, 145.7], AL: [555.6, 125.2], DZ: [508.3, 158.4], AR: [322.2, 316.9], AU: [875.0, 293.9],
  AT: [538.9, 109.9], BH: [638.9, 163.6], BE: [511.1, 102.2], BR: [347.2, 255.6], BG: [569.4, 120.1],
  KH: [791.7, 196.8], CA: [205.6, 86.9],  CL: [302.8, 319.4], CN: [791.7, 140.6], CO: [300.0, 219.8],
  HR: [544.4, 115.0], CZ: [541.7, 102.2], DK: [527.8, 86.9],  EG: [583.3, 161.0], FI: [572.2, 66.4],
  FR: [505.6, 109.9], DE: [527.8, 99.7],  GH: [497.2, 209.6], GR: [561.1, 130.3], HK: [816.7, 173.8],
  HU: [555.6, 109.9], IN: [716.7, 176.3], ID: [827.8, 235.1], IE: [477.8, 94.6],  IL: [597.2, 150.8],
  IT: [533.3, 120.1], JP: [883.3, 138.0], KE: [605.6, 227.4], KR: [855.6, 138.0], KW: [633.3, 155.9],
  MY: [783.3, 219.8], MX: [216.7, 171.2], MA: [483.3, 148.2], NL: [513.9, 97.1],  NZ: [983.3, 334.8],
  NG: [522.2, 207.0], NO: [525.0, 74.1],  OM: [658.3, 176.3], PK: [694.4, 153.3], PH: [838.9, 196.8],
  PL: [555.6, 97.1],  PT: [477.8, 130.3], QA: [641.7, 166.1], RO: [569.4, 112.4], RU: [761.1, 71.6],
  SA: [625.0, 168.7], SG: [788.9, 227.4], ZA: [566.7, 304.1], ES: [488.9, 127.8], SE: [541.7, 71.6],
  CH: [522.2, 109.9], TW: [836.1, 168.7], TH: [780.6, 191.7], TR: [597.2, 130.3], AE: [650.0, 168.7],
  GB: [494.4, 92.0],  US: [227.8, 130.3], UY: [344.4, 314.3], VN: [800.0, 189.1], ZW: [583.3, 278.6],
};

// Rough, stylised continent silhouettes — decorative context for the dots,
// not survey-accurate borders. Straight edges to match the site's
// sharp-corner design language rather than smooth coastlines.
const CONTINENTS = [
  'M130,50 L330,50 L330,160 L280,235 L195,240 L145,190 L105,120 Z',           // North America
  'M255,235 L355,230 L385,300 L355,405 L300,420 L265,375 L245,300 Z',        // South America
  'M455,60 L605,55 L615,140 L540,155 L465,140 L445,100 Z',                    // Europe
  'M455,150 L615,150 L625,260 L580,345 L515,345 L465,270 L445,200 Z',        // Africa
  'M605,40 L910,40 L925,225 L800,265 L695,225 L615,150 L600,90 Z',           // Asia
  'M825,260 L965,255 L975,330 L900,352 L825,320 Z',                          // Australia / Oceania
];

export default function BiggestHittersByCountry({ entries: propEntries=[], orgs: propOrgs=[], cvt, unitLbl, staticEntries=[], staticOrgs=[] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);
  const entries = staticEntries.length ? staticEntries : propEntries;
  const orgs = staticOrgs.length ? staticOrgs : propOrgs;

  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);
  const approved = entries
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .map(e => ({ ...e, dist: Number(e.dist) }));

  // Best verified drive per country
  const bestByCountry = {};
  approved.forEach(e => {
    const c = (orgFor(e.orgId)?.country || '').toUpperCase();
    if (!c) return;
    if (!bestByCountry[c] || e.dist > bestByCountry[c].dist) bestByCountry[c] = e;
  });

  const countryList = COUNTRIES.map(c => ({
    ...c,
    slug: slugFor(c),
    record: bestByCountry[c.code] || null,
  }));

  const withData = countryList.filter(c => c.record).sort((a, b) => b.record.dist - a.record.dist);
  const withoutData = countryList.filter(c => !c.record).sort((a, b) => a.name.localeCompare(b.name));
  const top10Countries = withData.slice(0, 10);

  const markerStyle = (rec) => {
    if (!rec) return { r: 4, fill: DIM, glow: 'none' };
    if (rec.dist >= 350) return { r: 10, fill: ORG, glow: `drop-shadow(0 0 8px ${ORG})` };
    if (rec.dist >= 300) return { r: 8, fill: ORG, glow: `drop-shadow(0 0 5px ${ORG})` };
    return { r: 6, fill: ORG, glow: `drop-shadow(0 0 2px ${ORG})` };
  };

  return (
    <SeoPage
      title="Biggest Hitters By Country — World Golf Distance Map | Ripping Bombs"
      description="An interactive world map of the longest verified golf drives by country. See which countries have the biggest hitters, and every country's own longest-drive record page."
    >
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Global Records
      </div>
      <SeoH1>Biggest Hitters By Country</SeoH1>
      <SeoP>
        Every verified longest-drive record on Ripping Bombs, mapped by country. The brighter and
        bigger the marker, the longer the record drive from that country — click any marker, or any
        country below, for its full record page. Don't see your country lit up yet?{' '}
        <Link href="/register" style={linkStyle}>Register free</Link> and put it on the board.
      </SeoP>

      {/* WORLD MAP */}
      <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px 16px 8px', marginBottom:16 }}>
        <svg viewBox="0 0 1000 460" style={{ width:'100%', height:'auto', display:'block' }}>
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill={BG3} stroke={BDR} strokeWidth="1" />
          ))}
          {countryList.map((c) => {
            const xy = COUNTRY_XY[c.code];
            if (!xy) return null;
            const m = markerStyle(c.record);
            return (
              <circle
                key={c.code}
                cx={xy[0]}
                cy={xy[1]}
                r={m.r}
                fill={m.fill}
                fillOpacity={c.record ? 0.9 : 0.5}
                style={{ filter:m.glow, cursor:'pointer', transition:'r .15s' }}
                onClick={() => router.push(`/${c.slug}`)}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{c.name}{c.record ? ` — ${cvt ? cvt(c.record.dist) : c.record.dist} ${unitLbl || 'yds'} (${c.record.player})` : ' — no verified drives yet'}</title>
              </circle>
            );
          })}
        </svg>

        {/* HOVER CALLOUT */}
        <div style={{ minHeight:36, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontSize:12, color:MUT, padding:'8px 0 14px' }}>
          {hovered ? (
            <span>
              {countryFlag(hovered.code)}{' '}
              <strong style={{ color:TXT }}>{hovered.name}</strong>
              {hovered.record
                ? <> — <span style={{ color:ORG, fontWeight:700 }}>{cvt ? cvt(hovered.record.dist) : hovered.record.dist} {unitLbl || 'yds'}</span> ({hovered.record.player})</>
                : ' — no verified drives yet'}
            </span>
          ) : (
            <span style={{ color:DIM }}>Hover or tap a marker for that country's record</span>
          )}
        </div>
      </div>

      {/* LEGEND / KEY */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:18, justifyContent:'center', marginBottom:40, fontFamily:SANS, fontSize:11, color:MUT }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:'50%', background:DIM, display:'inline-block' }} /> No verified drives yet</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:'50%', background:ORG, display:'inline-block' }} /> Record under 300 {unitLbl || 'yds'}</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:13, height:13, borderRadius:'50%', background:ORG, display:'inline-block', filter:`drop-shadow(0 0 4px ${ORG})` }} /> 300+ {unitLbl || 'yds'} (Pro)</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:16, height:16, borderRadius:'50%', background:ORG, display:'inline-block', filter:`drop-shadow(0 0 7px ${ORG})` }} /> 350+ {unitLbl || 'yds'} (Elite)</span>
      </div>

      {/* TOP 10 COUNTRIES */}
      <SeoH2>Top 10 Countries</SeoH2>
      {top10Countries.length > 0 ? (
        <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2, marginBottom:40 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:460 }}>
            <thead>
              <tr>
                {['Rank','Country','Player','Distance','Tier'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:ORG, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, background:BG3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10Countries.map((c, i) => (
                <tr key={c.code} style={{ borderBottom:`1px solid ${BDR}`, cursor:'pointer' }} onClick={() => router.push(`/${c.slug}`)}>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13, color:DIM }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{countryFlag(c.code)} {c.name}</td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13, color:MUT }}>{c.record.player}</td>
                  <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG }}>{cvt ? cvt(c.record.dist) : c.record.dist} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl || 'yds'}</span></td>
                  <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:13 }}>{tier(c.record.dist)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'28px', textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:SANS, fontSize:13, color:DIM }}>No country records yet — be the first.</div>
        </div>
      )}

      {/* FULL DIRECTORY */}
      <SeoH2>Every Country</SeoH2>
      <SeoP>Browse the full directory — every country tracked on Ripping Bombs, record holders first.</SeoP>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8, marginBottom:32 }}>
        {[...withData, ...withoutData].map(c => (
          <Link key={c.code} href={`/${c.slug}`} style={{ textDecoration:'none' }}>
            <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
              <span style={{ fontFamily:SANS, fontSize:13, color:TXT, display:'flex', alignItems:'center', gap:6 }}>
                {countryFlag(c.code)} {c.name}
              </span>
              {c.record ? (
                <span style={{ fontFamily:DISP, fontSize:15, color:ORG }}>{cvt ? cvt(c.record.dist) : c.record.dist} <span style={{ fontFamily:SANS, fontSize:9, color:DIM }}>{unitLbl || 'yds'}</span></span>
              ) : (
                <span style={{ fontFamily:SANS, fontSize:10, color:DIM, textTransform:'uppercase', letterSpacing:.5 }}>No record</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <SeoCTA />

      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/hall-of-fame" style={linkStyle}>Hall Of Fame</Link>{' | '}
        <Link href="/leaderboard" style={linkStyle}>Full Leaderboard</Link>{' | '}
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>Driving Distance Calculator</Link>
      </SeoP>
    </SeoPage>
  );
}
