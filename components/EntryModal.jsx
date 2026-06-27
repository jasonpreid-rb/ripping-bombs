import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate, tier } from '../lib/constants';
import { Overlay, BadgePill, countryFlag } from './UI';
import { supabase } from '../lib/supabaseClient';

function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function EntryModal({ entry, org, onClose, onShare, cvt, unitLbl }) {
  const router = useRouter();
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    setPhoto(null);
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

  if (!entry) return null;

  const isSimulator = entry.is_simulator === true;
  const profileSlug = isSimulator && org?.fullName ? nameToSlug(org.fullName) : null;

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
        <img src={photo} alt="Drive evidence" style={{ width:'100%', maxHeight:180, objectFit:'cover', marginBottom:14 }}/>
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
          <button onClick={()=>{ onClose(); onShare(entry); }}
            style={{ width:'100%', background:`linear-gradient(135deg,${ORG},#ff66c4)`, border:'none', color:'#fff', fontFamily:SANS, fontWeight:700, fontSize:12, padding:'11px', cursor:'pointer', letterSpacing:.5 }}>
            ↗ SHARE THIS DRIVE
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
