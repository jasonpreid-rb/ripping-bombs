import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP, profileSlugFor } from '../lib/constants';
import { fmtDate, tier } from '../lib/constants';
import { Overlay, BadgePill, countryFlag } from './UI';
import { supabase } from '../lib/supabaseClient';

export default function EntryModal({ entry, org, onClose, onShare, cvt, unitLbl }) {
  const router = useRouter();
  const [photo, setPhoto] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false); // full-size lightbox

  useEffect(() => {
    setPhoto(null);
    setPhotoOpen(false);
    if (!entry?.id) return;

    let cancelled = false;
    supabase
      .from('entries')
      .select('photo')
      .eq('id', entry.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.photo) setPhoto(data.photo);
      });

    return () => { cancelled = true; };
  }, [entry?.id]);

  useEffect(() => {
    if (!photoOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); setPhotoOpen(false); }
    };
    window.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [photoOpen]);

  if (!entry) return null;

  const profileSlug = profileSlugFor(org);

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:ORG, marginBottom:6, textTransform:'uppercase' }}>Drive Detail</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
        <span style={{ fontFamily:DISP, fontSize:52, color:ORG, letterSpacing:1, lineHeight:1 }}>{cvt(entry.dist)}</span>
        <span style={{ fontFamily:SANS, fontSize:16, color:MUT }}>{unitLbl}</span>
      </div>
      <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:ORG, marginBottom:12 }}>{tier(entry.dist)}</div>
      <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:.5, marginBottom:4 }}>
        {entry.player}
        {org?.country && countryFlag(org.country)}
      </div>
      <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:18 }}>
        {org?.courseName}{org?.is_founding_member&&<span title="Founding Member" style={{marginLeft:6,color:ORG,fontSize:13,cursor:'default'}}>✦</span>}{entry.tournament ? ` · ${entry.tournament}` : ''} · {fmtDate(entry.date)}
      </div>
      {org?.badge && <div style={{ marginBottom:14 }}><BadgePill badge={org.badge}/></div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        {[
          ['Club', entry.club],
          ['Handicap', entry.hcp],
          ['Age', `${entry.age} yrs`],
          ['Gender', entry.gender==='female'?'♀ Female':'♂ Male'],
          ['Event', entry.tournament||'—'],
          ['Course', org?.courseName||'—'],
          ['Location', org?.location||'—'],
          ['Date', fmtDate(entry.date)],
          ...(entry.facility ? [['Facility', entry.facility]] : []),
        ].map(([k,v])=>(
          <div key={k} style={{ background:BG3, padding:'10px 14px' }}>
            <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:DIM, letterSpacing:1.2, marginBottom:3, textTransform:'uppercase' }}>{k}</div>
            <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:TXT }}>{String(v)}</div>
          </div>
        ))}
      </div>

      {photo && (
        <button type="button" onClick={()=>setPhotoOpen(true)} aria-label="View full photo"
          style={{ position:'relative', display:'block', width:'100%', padding:0, border:'none', background:'none', cursor:'zoom-in', marginBottom:14 }}>
          <img src={photo} alt="Drive evidence" style={{ width:'100%', maxHeight:180, objectFit:'cover', display:'block' }}/>
          <span style={{ position:'absolute', right:8, bottom:8, background:'rgba(0,0,0,0.7)', color:'#fff', fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:.5, padding:'5px 10px' }}>⤢ VIEW FULL PHOTO</span>
        </button>
      )}

      {/* Full-size photo. Portalled to <body> so it can't be clipped or offset by
          the popup's own container, and clicks are stopped so closing the photo
          doesn't also close the popup underneath. */}
      {photoOpen && photo && typeof document !== 'undefined' && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Drive evidence photo"
          onClick={(e)=>{ e.stopPropagation(); setPhotoOpen(false); }}
          style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, cursor:'zoom-out' }}>
          <button type="button" onClick={(e)=>{ e.stopPropagation(); setPhotoOpen(false); }} aria-label="Close photo"
            style={{ position:'absolute', top:14, right:14, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
          <img src={photo} alt="Drive evidence (full size)" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block' }}/>
        </div>,
        document.body
      )}

      <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:8 }}>
        {profileSlug && (
          <button
            onClick={() => { onClose(); router.push(`/profile/${profileSlug}`); }}
            style={{ width:'100%', background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px', cursor:'pointer', letterSpacing:.5 }}>
            👤 VIEW PLAYER PROFILE
          </button>
        )}
        {onShare && (
          <button
            onClick={()=>{ onClose(); onShare(entry); }}
            aria-label="Share drive"
            title="Share"
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', padding:'8px', cursor:'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ORG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        )}
        <button onClick={onClose}
          style={{ width:'100%', background:'transparent', border:`1px solid rgba(255,255,255,0.15)`, color:MUT, fontFamily:SANS, fontWeight:600, fontSize:12, padding:'10px', cursor:'pointer' }}>
          Close
        </button>
      </div>
    </Overlay>
  );
}
