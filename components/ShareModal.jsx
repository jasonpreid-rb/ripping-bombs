import { useState, useEffect, useRef } from 'react';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate } from '../lib/constants';
import { Overlay } from './UI';

export default function ShareModal({ entry, org, cvt, unitLbl, onClose }) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const driveUrl = `https://www.rippingbombs.com/drive/${entry.id}`;

  const drawRBLogo = (ctx, x, y, w) => {
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
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;

    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a3e635'; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H-8, W, 8);
    ctx.strokeStyle = 'rgba(163,230,53,0.04)'; ctx.lineWidth = 1;
    for (let x=0; x<W; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y=0; y<H; y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const drawContent = (flagImg, courseLogoImg) => {
      drawRBLogo(ctx, 80, 58, 80);
      if (flagImg) ctx.drawImage(flagImg, W-160, 58, 80, 60);
      ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80,150); ctx.lineTo(W-80,150); ctx.stroke();
      if (courseLogoImg) {
        const clAspect = courseLogoImg.naturalWidth / courseLogoImg.naturalHeight;
        const clH = 100, clW = clH * clAspect;
        ctx.drawImage(courseLogoImg, (W-clW)/2, 170, clW, clH);
      }
      ctx.fillStyle = '#a3e635'; ctx.font = 'bold 300px Arial Black, Arial'; ctx.textAlign = 'center';
      ctx.fillText(String(cvt(entry.dist)), W/2, 560);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = 'bold 48px Arial';
      ctx.fillText(unitLbl.toUpperCase(), W/2, 620);
      const badgeW=320, badgeH=44, badgeX=(W-badgeW)/2, badgeY=648;
      ctx.strokeStyle='rgba(163,230,53,0.5)'; ctx.lineWidth=1; ctx.strokeRect(badgeX,badgeY,badgeW,badgeH);
      ctx.fillStyle='rgba(163,230,53,0.08)'; ctx.fillRect(badgeX,badgeY,badgeW,badgeH);
      ctx.fillStyle='#a3e635'; ctx.font='bold 18px Arial'; ctx.letterSpacing='3px';
      ctx.fillText('✓  VERIFIED DISTANCE', W/2, badgeY+29);
      ctx.fillStyle='#ffffff'; ctx.font='bold 72px Arial Black, Arial'; ctx.letterSpacing='0px';
      ctx.fillText(entry.player.toUpperCase(), W/2, 790);
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='34px Arial';
      ctx.fillText(org?.courseName||'', W/2, 845);
      if (entry.facility) { ctx.fillStyle='rgba(163,230,53,0.6)'; ctx.font='italic 26px Arial'; ctx.fillText(entry.facility, W/2, 886); }
      if (entry.tournament) { ctx.fillStyle='rgba(163,230,53,0.7)'; ctx.font='italic 28px Arial'; ctx.fillText(entry.tournament, W/2, entry.facility ? 922 : 892); }
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='24px Arial';
      ctx.fillText(fmtDate(entry.date), W/2, (entry.tournament && entry.facility) ? 958 : entry.tournament ? 935 : entry.facility ? 922 : 900);
      ctx.strokeStyle='rgba(163,230,53,0.3)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(80,950); ctx.lineTo(W-80,950); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='24px Arial';
      ctx.fillText('rippingbombs.com', W/2, 990);
      setImageUrl(canvas.toDataURL('image/png'));
    };

    const flagSrc = org?.country ? `https://flagcdn.com/80x60/${org.country.toLowerCase()}.png` : null;
    const courseSrc = org?.logo || null;
    const loadImage = src => new Promise(resolve => {
      if (!src) return resolve(null);
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src;
    });
    Promise.all([loadImage(flagSrc), loadImage(courseSrc)])
      .then(([flagImg, courseLogoImg]) => drawContent(flagImg, courseLogoImg));
  }, [entry, org]);

  function downloadImage() {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `rippingbombs-${entry.player.replace(/\s+/g,'-').toLowerCase()}-${cvt(entry.dist)}${unitLbl}.png`;
    a.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(driveUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); });
  }

  const shareText = `⛳ ${entry.player} hit ${cvt(entry.dist)} ${unitLbl} at ${org?.courseName||'a course'} — check it out on Ripping Bombs!`;

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:ORG, marginBottom:6, textTransform:'uppercase' }}>Share This Drive</div>
      <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:.5, marginBottom:16 }}>{entry.player} — {cvt(entry.dist)} {unitLbl}</div>
      <canvas ref={canvasRef} style={{ display:'none' }}/>
      {imageUrl && <img src={imageUrl} alt="Share card" style={{ width:'100%', marginBottom:16, border:`1px solid ${BDR}` }}/>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText+' '+driveUrl)}`} target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#25D366', padding:'12px', textDecoration:'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:'#fff' }}>WhatsApp</span>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(driveUrl)}`} target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#1877F2', padding:'12px', textDecoration:'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:'#fff' }}>Facebook</span>
        </a>
        <button onClick={downloadImage}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', border:'none', padding:'12px', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:'#fff' }}>Save for Instagram</span>
        </button>
        <button onClick={copyLink}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:copied?'rgba(163,230,53,0.15)':'rgba(255,255,255,0.07)', border:`1px solid ${copied?ORG:BDR}`, padding:'12px', cursor:'pointer', transition:'all .2s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={copied?ORG:'#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:copied?ORG:'#fff' }}>{copied?'Copied!':'Copy Link'}</span>
        </button>
      </div>
      <button onClick={downloadImage} style={{ width:'100%', background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px', cursor:'pointer', letterSpacing:.5 }}>
        ↓ Download Share Image (PNG)
      </button>
      <div style={{ fontFamily:SANS, fontSize:10, color:DIM, marginTop:10, textAlign:'center' }}>For Instagram: save the image then share as a post or story</div>
    </Overlay>
  );
}
