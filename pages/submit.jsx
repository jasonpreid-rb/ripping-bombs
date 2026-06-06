import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { TXT, MUT, ORG, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { tier, todayStr, toB64 } from '../lib/constants';
import { Card, Field, PhotoField, Btn } from '../components/UI';

export default function SubmitPage({ loggedOrg, form, setForm, doSubmit, cvt, unitLbl }) {
  const [consent, setConsent] = useState(false);
  const router = useRouter();

  if (!loggedOrg) return (
    <div style={{ padding:'80px 18px', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize:28, color:TXT, marginBottom:12 }}>Not Logged In</div>
      <div style={{ fontFamily:SANS, fontSize:14, color:MUT, marginBottom:24 }}>Please log in to submit a drive.</div>
      <Btn onClick={()=>router.push('/login')}>Log In →</Btn>
    </div>
  );

  const isSimulator = loggedOrg.accountType === 'simulator';

  return (
    <>
      <Head>
        <title>Submit A Drive | Ripping Bombs</title>
        <meta name="description" content="Submit your longest drive competition result to the Ripping Bombs global leaderboard." />
      </Head>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'28px 18px 80px' }}>
        <div style={{ fontFamily:DISP, fontSize:28, color:TXT, letterSpacing:1, marginBottom:4 }}>Submit a Drive</div>
        <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:22 }}>
          {isSimulator
            ? `${loggedOrg.fullName} · Simulator Drive`
            : `${loggedOrg.courseName} · ${loggedOrg.location}`}
        </div>

        {/* Simulator info banner */}
        {isSimulator && (
          <div style={{ background:'rgba(163,230,53,0.06)', border:'1px solid rgba(163,230,53,0.2)', padding:'12px 16px', marginBottom:20, fontFamily:SANS, fontSize:12, color:MUT, lineHeight:1.6 }}>
            🖥️ <span style={{ fontWeight:700, color:TXT }}>Simulator Drive</span> — A screenshot of your simulator readout is required as evidence. Your drive will appear on the global leaderboard with the simulator badge.
          </div>
        )}

        <Card>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>

            {/* Event name — locked to "Simulator" for simulator accounts */}
            {isSimulator ? (
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Event</label>
                <div style={{ background:BG3, border:`1px solid ${BDR}`, padding:'10px 14px', fontFamily:SANS, fontSize:14, color:DIM }}>Simulator</div>
              </div>
            ) : (
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Tournament / Event Name" value={form.tournament} onChange={e=>setForm({...form,tournament:e.target.value})} placeholder="e.g. Club Championship 2026"/>
              </div>
            )}

            {/* Player name — pre-filled and locked for simulator accounts */}
            {isSimulator ? (
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Player</label>
                <div style={{ background:BG3, border:`1px solid ${BDR}`, padding:'10px 14px', fontFamily:SANS, fontSize:14, color:DIM }}>{loggedOrg.fullName}</div>
              </div>
            ) : (
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Player Name" value={form.player} onChange={e=>setForm({...form,player:e.target.value})} placeholder="Full name" required/>
              </div>
            )}

            {/* Gender — only shown for club accounts, simulator uses gender from registration */}
            {!isSimulator && (
              <div>
                <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Gender <span style={{ color:ORG }}>*</span></label>
                <div style={{ display:'flex', gap:8 }}>
                  {['male','female'].map(g=>(
                    <button key={g} type="button" onClick={()=>setForm({...form,gender:g})}
                      style={{ flex:1, padding:'10px', background:form.gender===g?'transparent':BG3, border:`1px solid ${form.gender===g?ORG:BDR}`, color:form.gender===g?ORG:MUT, fontFamily:SANS, fontWeight:600, fontSize:12, cursor:'pointer', textTransform:'capitalize', letterSpacing:.5 }}>
                      {g==='male'?'♂ Male':'♀ Female'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Field label="Distance (yards)" type="number" value={form.dist} onChange={e=>setForm({...form,dist:e.target.value})} placeholder="245" min="50" max="600" required/>
            <Field label="Date of Drive" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
            <div style={{ gridColumn:'1/-1' }}><Field label="Club Brand & Model" value={form.club} onChange={e=>setForm({...form,club:e.target.value})} placeholder="TaylorMade Qi10 LS" required/></div>
            <Field label="Handicap" type="number" value={form.hcp} onChange={e=>setForm({...form,hcp:e.target.value})} placeholder="5" min="-10" max="54" required/>
            <Field label="Age" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="34" min="10" max="100" required/>
          </div>

          {form.dist&&Number(form.dist)>0&&(
            <div style={{ background:'rgba(163,230,53,0.07)', border:'1px solid rgba(163,230,53,0.2)', padding:'9px 14px', marginBottom:14, fontFamily:SANS, fontSize:12, fontWeight:600, color:ORG }}>
              {tier(Number(form.dist))} — {cvt(Number(form.dist))} {unitLbl}
            </div>
          )}

          <PhotoField
            label={isSimulator ? "Simulator Screenshot (required)" : "Photo Evidence (required)"}
            value={form.photo}
            onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }}
            required
          />

          {/* Consent */}
          <div style={{ background:'rgba(163,230,53,0.04)', border:'1px solid rgba(163,230,53,0.2)', padding:'16px', marginBottom:16 }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{ width:18, height:18, accentColor:'#a3e635', cursor:'pointer', flexShrink:0, marginTop:2 }}/>
              <div style={{ fontFamily:SANS, fontSize:12, color:MUT, lineHeight:1.6 }}>
                {isSimulator ? (
                  <>
                    <span style={{ fontWeight:700, color:TXT }}>I Consent</span><br/>
                    I consent to my details and drive data being submitted to the Ripping Bombs global leaderboard.
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight:700, color:TXT }}>Player Consent Confirmed</span><br/>
                    I confirm that I have notified the player named above and have their approval to submit their personal details to the Ripping Bombs global leaderboard.
                  </>
                )}
              </div>
            </label>
          </div>

          <Btn
            full
            onClick={() => {
              if (!consent) { alert(isSimulator ? 'Please confirm your consent before submitting.' : 'Please confirm player consent before submitting.'); return; }
              // For simulator accounts, pre-fill player name and tournament from account
              if (isSimulator) {
                setForm(f => ({ ...f, player: loggedOrg.fullName, tournament: 'Simulator', gender: loggedOrg.gender || 'male' }));
              }
              doSubmit();
            }}
            style={{ opacity:consent?1:0.5 }}
          >
            Submit to World Registry →
          </Btn>
        </Card>
      </div>
    </>
  );
}
