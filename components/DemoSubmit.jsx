import { useState } from 'react';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { tier, todayStr, toB64, fmtDate } from '../lib/constants';
import { Overlay, Card, Field, PhotoField, Btn, BadgePill } from './UI';
import ShareModal from './ShareModal';

const DEMO_ORG_ID = 'demo_preview';

export default function DemoSubmit({ onClose, cvt, unitLbl, toast }) {
  const [form, setForm] = useState({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), courseName:'', location:'' });
  const [submitted, setSubmitted] = useState(null);
  const [consent, setConsent] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function doDemo() {
    if (!form.player||!form.dist||!form.club||!form.hcp||!form.age||!form.courseName) { toast('Fill all required fields'); return; }
    if (!consent) { toast('Please confirm player consent before continuing'); return; }
    const entry = { id:'demo_'+Date.now(), orgId:DEMO_ORG_ID, player:form.player, dist:Number(form.dist), club:form.club, hcp:Number(form.hcp), age:Number(form.age), photo:form.photo, date:form.date, _demo:true };
    const demoOrg = { id:DEMO_ORG_ID, courseName:form.courseName, location:form.location||'Demo Location', status:'approved', badge:null };
    setSubmitted({ entry, org:demoOrg });
  }

  if (submitted) return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:ORG, marginBottom:8, textTransform:'uppercase' }}>Preview — How Your Drive Would Look</div>
      <div style={{ textAlign:'center', padding:'20px 0 16px' }}>
        <div style={{ fontFamily:DISP, fontSize:64, color:ORG, letterSpacing:2, lineHeight:1 }}>{cvt(submitted.entry.dist)}</div>
        <div style={{ fontFamily:SANS, fontSize:16, color:MUT, marginBottom:8 }}>{unitLbl}</div>
        <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:ORG, marginBottom:16 }}>{tier(submitted.entry.dist)}</div>
        <div style={{ fontFamily:DISP, fontSize:26, color:TXT, letterSpacing:.5, marginBottom:4 }}>{submitted.entry.player}</div>
        <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{submitted.org.courseName} · {submitted.entry.club} · HCP {submitted.entry.hcp}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
        {[['Club',submitted.entry.club],['Handicap',submitted.entry.hcp],['Age',submitted.entry.age],['Date',fmtDate(submitted.entry.date)]].map(([k,v])=>(
          <div key={k} style={{ background:BG3, padding:'10px 14px' }}>
            <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:DIM, letterSpacing:1.2, marginBottom:3, textTransform:'uppercase' }}>{k}</div>
            <div style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:TXT }}>{String(v)}</div>
          </div>
        ))}
      </div>
      {submitted.entry.photo && <img src={submitted.entry.photo} alt="" style={{ width:'100%', maxHeight:160, objectFit:'cover', marginBottom:14 }}/>}
      <Btn full onClick={()=>setShareOpen(true)} style={{ marginBottom:8 }}>↗ Share This Drive</Btn>
      <Btn full variant="subtle" onClick={onClose}>Close Preview</Btn>
      {shareOpen && <ShareModal entry={submitted.entry} org={submitted.org} cvt={cvt} unitLbl={unitLbl} onClose={()=>setShareOpen(false)}/>}
    </Overlay>
  );

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:ORG, marginBottom:6, textTransform:'uppercase' }}>Try Demo — Preview Your Drive</div>
      <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:20 }}>See how your drive would look on the Ripping Bombs leaderboard. This won't be saved to the database.</div>
      <Field label="Your Name" value={form.player} onChange={e=>setForm({...form,player:e.target.value})} placeholder="Full name" required/>
      <Field label="Distance (yards)" type="number" value={form.dist} onChange={e=>setForm({...form,dist:e.target.value})} placeholder="245" min="50" max="400" required/>
      <Field label="Driver Brand & Model" value={form.club} onChange={e=>setForm({...form,club:e.target.value})} placeholder="TaylorMade Qi10 LS" required/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Handicap" type="number" value={form.hcp} onChange={e=>setForm({...form,hcp:e.target.value})} placeholder="5" min="-10" max="54" required/>
        <Field label="Age" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="34" min="10" max="100" required/>
      </div>
      <Field label="Course / Club Name" value={form.courseName} onChange={e=>setForm({...form,courseName:e.target.value})} placeholder="Augusta National Golf Club" required/>
      <Field label="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Augusta, Georgia"/>
      {form.dist&&Number(form.dist)>0&&<div style={{ background:'rgba(163,230,53,0.07)', border:'1px solid rgba(163,230,53,0.2)', padding:'9px 14px', marginBottom:14, fontFamily:SANS, fontSize:12, fontWeight:600, color:ORG }}>{tier(Number(form.dist))}</div>}
      <PhotoField label="Photo of Drive Marker (optional)" value={form.photo} onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }}/>
      <div style={{ background:'rgba(163,230,53,0.04)', border:'1px solid rgba(163,230,53,0.2)', padding:'14px', marginBottom:14 }}>
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }}>
          <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{ width:16, height:16, accentColor:'#a3e635', cursor:'pointer', flexShrink:0, marginTop:2 }}/>
          <div style={{ fontFamily:SANS, fontSize:11, color:MUT, lineHeight:1.6 }}>
            <span style={{ fontWeight:700, color:TXT }}>Player Consent Confirmed</span><br/>
            I confirm the player named above has authorised their details to be submitted.
          </div>
        </label>
      </div>
      <Btn full onClick={doDemo} style={{ opacity:consent?1:0.5 }}>Preview My Drive →</Btn>
    </Overlay>
  );
}
