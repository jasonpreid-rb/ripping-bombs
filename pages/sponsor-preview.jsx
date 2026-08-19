import Head from 'next/head';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

// Standalone sponsor preview page.
// Intentionally NOT registered in lib/seoPages.js, NOT linked from nav/leaderboard,
// and NOT included in scripts/generate-sitemap.cjs — so it won't get indexed or
// affect the live site. It's just a private URL for review: /sponsor-preview
export default function SponsorPreview() {
  return (
    <>
      <Head>
        <title>Sponsor Preview | Ripping Bombs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{padding:'40px 18px 80px',maxWidth:1000,margin:'0 auto'}}>
        <h1 style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:1,marginBottom:6,fontWeight:400}}>
          Sponsor Block Preview
        </h1>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:30}}>
          Internal preview only — this page is not linked anywhere on the live site.
        </div>

        {/* --- Option A: logo + text --- */}
        <div style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:DIM,letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>
          Option A — Logo + wordmark
        </div>
        <a
          href="https://pissmissileballs.com/"
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:12,
            marginBottom:36,padding:'14px 16px',
            background:BG2,border:`1px solid ${BDR}`,
            textDecoration:'none',
          }}
        >
          <span style={{fontFamily:SANS,fontSize:11,color:DIM,letterSpacing:.5}}>Proudly brought to you by</span>
          <img
            src="https://pissmissileballs.com/cdn/shop/files/Group_3.svg?v=1762540896&width=600"
            alt="Piss Missile Balls"
            style={{height:22,width:'auto',display:'block'}}
          />
        </a>

        {/* --- Option B: logo only, larger, centered, yellow banner --- */}
        <div style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:DIM,letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>
          Option B — Logo only, banner style, brand yellow
        </div>
        <div style={{textAlign:'center',fontFamily:SANS,fontSize:10,color:DIM,letterSpacing:1.2,textTransform:'uppercase',marginBottom:8}}>
          Proudly brought to you by
        </div>
        <a
          href="https://pissmissileballs.com/"
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display:'flex',alignItems:'center',justifyContent:'center',
            marginBottom:36,padding:'22px 16px',
            background:'#F2F913',border:`1px solid ${BDR}`,
            textDecoration:'none',
          }}
        >
          <img
            src="https://pissmissileballs.com/cdn/shop/files/Group_3.svg?v=1762540896&width=600"
            alt="Piss Missile Balls"
            style={{height:52,width:'auto',display:'block'}}
          />
        </a>

        {/* --- Option C: compact top strip --- */}
        <div style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:DIM,letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>
          Option C — Compact strip
        </div>
        <a
          href="https://pissmissileballs.com/"
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            marginBottom:20,padding:'8px 16px',
            background:BG3,border:`1px solid ${BDR}`,
            textDecoration:'none',
          }}
        >
          <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>Sponsored by</span>
          <img
            src="https://pissmissileballs.com/cdn/shop/files/Group_3.svg?v=1762540896&width=600"
            alt="Piss Missile Balls"
            style={{height:16,width:'auto',display:'block'}}
          />
        </a>
      </div>
    </>
  );
}
