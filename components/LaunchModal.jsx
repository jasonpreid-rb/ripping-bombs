import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, DIM, SANS, DISP } from '../lib/constants';

export default function LaunchModal({ onClose }) {
  const router = useRouter();
  const LAUNCH = new Date('2026-09-01T00:00:00');
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    function calc() {
      const diff = LAUNCH - new Date();
      if (diff <= 0) { setTimeLeft({ d:0,h:0,m:0,s:0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  function handleRegister() {
    onClose();
    router.push('/register');
  }

  function handleContact() {
    onClose();
    router.push('/contact');
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1a1a1a', border:'1px solid rgba(163,230,53,0.25)', width:'100%', maxWidth:560, padding:'40px 36px', position:'relative', boxShadow:'0 0 80px rgba(163,230,53,0.08)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', color:MUT, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>

        <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:16 }}>Official Platform Launch</div>
        <div style={{ fontFamily:DISP, fontSize:'clamp(32px,7vw,52px)', color:'#fff', letterSpacing:2, lineHeight:1, marginBottom:28 }}>
          LAUNCHING<br/>SEPTEMBER 2026
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:28 }}>
          {[['DAYS',timeLeft.d],['HRS',timeLeft.h],['MIN',timeLeft.m],['SEC',timeLeft.s]].map(([label,val])=>(
            <div key={label} style={{ background:'#242424', border:'1px solid rgba(163,230,53,0.15)', padding:'16px 8px', textAlign:'center' }}>
              <div style={{ fontFamily:DISP, fontSize:36, color:ORG, letterSpacing:2, lineHeight:1 }}>{pad(val??0)}</div>
              <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:2, color:MUT, marginTop:5, textTransform:'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily:SANS, fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.8, marginBottom:24 }}>
          Ripping Bombs is currently onboarding participating courses, clubs and launch events worldwide ahead of the official platform launch. Global rankings will be built through verified real-world competition results once events begin going live.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={handleRegister}
            style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'13px 24px', cursor:'pointer', letterSpacing:.5, transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.75'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            REGISTER YOUR CLUB →
          </button>
          <button onClick={handleContact}
            style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', fontFamily:SANS, fontWeight:600, fontSize:13, padding:'13px 24px', cursor:'pointer', letterSpacing:.5, transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.75'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            CONTACT / PARTNERSHIPS →
          </button>
        </div>

        <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:16, textAlign:'center' }}>
          Commercial partnerships, launch sponsorships and prize collaboration opportunities are now open.
        </div>
      </div>
    </div>
  );
}
