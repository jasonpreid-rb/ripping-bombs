import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { TXT, MUT, ORG, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { tier, todayStr, toB64 } from '../lib/constants';
import { Card, Field, PhotoField, Btn } from '../components/UI';

// Mirrors nameToSlug() in pages/profile/[slug].jsx — keep in sync
function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function SubmitPage({ loggedOrg, form, setForm, doSubmit, updateProfileConsent, cvt, unitLbl, entries=[], approvedOrgs=[] }) {
  const [consent, setConsent] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [rankResult, setRankResult] = useState(null);
  const router = useRouter();

  if (!loggedOrg) return (
    <div style={{ padding:'80px 18px', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize:28, color:TXT, marginBottom:12 }}>Not Logged In</div>
      <div style={{ fontFamily:SANS, fontSize:14, color:MUT, marginBottom:24 }}>Please log in to submit a drive.</div>
      <Btn onClick={()=>router.push('/login')}>Log In →</Btn>
    </div>
  );

  const isSimulator = loggedOrg.accountType === 'simulator';

  // Once-per-week check for simulator accounts
  const simulatorWeeklyBlock = (() => {
    if (!isSimulator) return null;
    const now = new Date();
    // Get Monday of current week
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    const existingThisWeek = entries.find(e =>
      e.orgId === loggedOrg.id &&
      e.is_simulator === true &&
      new Date(e.date) >= monday &&
      new Date(e.date) <= sunday
    );
    return existingThisWeek || null;
  })();

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

        {/* Post-registration welcome banner */}
        {isSimulator && router.query.welcome === '1' && (
          <div style={{ background:'rgba(255,0,144,0.08)', border:`1px solid ${ORG}`, padding:'16px 18px', marginBottom:20, fontFamily:SANS }}>
            <div style={{ fontSize:15, fontWeight:700, color:ORG, marginBottom:4 }}>🎉 You're in! Submit your first bomb.</div>
            <div style={{ fontSize:12, color:MUT, lineHeight:1.6 }}>
              Fill in the details below — you'll be live on the global leaderboard the moment you submit.
            </div>
          </div>
        )}

        {/* Simulator info banner */}
        {isSimulator && (
          <div style={{ background:'rgba(255,0,144,0.06)', border:'1px solid rgba(255,0,144,0.2)', padding:'12px 16px', marginBottom:20, fontFamily:SANS, fontSize:12, color:MUT, lineHeight:1.6 }}>
            🖥️ <span style={{ fontWeight:700, color:TXT }}>Simulator Drive</span> — A screenshot of your simulator readout is required as evidence. Your drive will appear on the global leaderboard with the simulator badge.
          </div>
        )}

        {/* Weekly limit block for simulator accounts */}
        {isSimulator && simulatorWeeklyBlock && (
          <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.3)', padding:'20px 20px', marginBottom:20, fontFamily:SANS }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#f87171', marginBottom:6 }}>⏱ Weekly Submission Limit Reached</div>
            <div style={{ fontSize:12, color:MUT, lineHeight:1.7 }}>
              You've already submitted a drive this week (<span style={{ color:TXT, fontWeight:600 }}>{simulatorWeeklyBlock.dist} yds on {simulatorWeeklyBlock.date}</span>). Simulator accounts are limited to one submission per week. Come back next Monday!
            </div>
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

            {/* Facility — optional, for all account types */}
            <div style={{ gridColumn:'1/-1' }}>
              <Field label="Facility Name (optional)" value={form.facility||''} onChange={e=>setForm({...form,facility:e.target.value})} placeholder="e.g. TopGolf Manchester, GolfZon World, The Range Dubai"/>
            </div>

            {/* Venue tag — simulator accounts can tag a club venue */}
            {isSimulator && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
                  Simulator Venue <span style={{ color: DIM, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={form.venueId || ''}
                    onChange={e => setForm({ ...form, venueId: e.target.value || null })}
                    style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: form.venueId ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">No venue / playing at home</option>
                    {approvedOrgs
                      .filter(o => o.accountType === 'club')
                      .sort((a, b) => a.courseName.localeCompare(b.courseName))
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.courseName}{o.location ? ` — ${o.location}` : ''}</option>
                      ))
                    }
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>&#9662;</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 5 }}>
                  Tagging a venue adds your drive to that venue's leaderboard.
                </div>
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
            <div style={{ background:'rgba(255,0,144,0.07)', border:'1px solid rgba(255,0,144,0.2)', padding:'9px 14px', marginBottom:14, fontFamily:SANS, fontSize:12, fontWeight:600, color:ORG }}>
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
          <div style={{ background:'rgba(255,0,144,0.04)', border:'1px solid rgba(255,0,144,0.2)', padding:'16px', marginBottom:16 }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{ width:18, height:18, accentColor:ORG, cursor:'pointer', flexShrink:0, marginTop:2 }}/>
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
            onClick={async () => {
              if (isSimulator && simulatorWeeklyBlock) { alert('You have already submitted a drive this week. Simulator accounts are limited to one submission per week.'); return; }
              if (!consent) { alert(isSimulator ? 'Please confirm your consent before submitting.' : 'Please confirm player consent before submitting.'); return; }
              // For simulator accounts, pre-fill player name and tournament from account
              if (isSimulator) {
                setForm(f => ({ ...f, player: loggedOrg.fullName, tournament: 'Simulator', gender: loggedOrg.gender || 'male' }));
              }
              const result = await doSubmit();
              if (result && result.ok) {
                setRankResult(result);
              }
            }}
            style={{ opacity:(consent && !(isSimulator && simulatorWeeklyBlock))?1:0.5 }}
          >
            Submit to World Registry →
          </Btn>
        </Card>
      </div>

      {/* Rank reveal — shown immediately after a successful submission */}
      {rankResult && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
          <div style={{ background:BG3, border:`1px solid ${BDR}`, width:'100%', maxWidth:440, padding:30, textAlign:'center' }}>
            <div style={{ fontFamily:DISP, fontSize:24, color:TXT, letterSpacing:.5, marginBottom:10 }}>
              🔥 You're Live!
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:MUT, lineHeight:1.7, marginBottom:8 }}>
              Your drive just hit the global leaderboard.
            </div>
            <div style={{ fontFamily:DISP, fontSize:42, color:ORG, letterSpacing:1, margin:'14px 0 6px' }}>
              #{rankResult.rank}
            </div>
            <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:24, textTransform:'uppercase', letterSpacing:.6 }}>
              of {rankResult.total} in {rankResult.gender === 'female' ? "Women's" : "Men's"} Longest Drive
            </div>
            <Btn
              full
              onClick={() => {
                setRankResult(null);
                if (isSimulator && loggedOrg.profileConsent === undefined) {
                  setShowProfilePrompt(true);
                }
              }}
            >
              Continue →
            </Btn>
          </div>
        </div>
      )}

      {/* Post-submission profile consent prompt — framed as a reward, not a gate */}
      {showProfilePrompt && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
          <div style={{ background:BG3, border:`1px solid ${BDR}`, width:'100%', maxWidth:440, padding:30 }}>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:.5, marginBottom:10 }}>
              🎉 Nice drive!
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:MUT, lineHeight:1.7, marginBottom:20 }}>
              Want a shareable public profile page at{' '}
              <span style={{ color:ORG, fontWeight:600 }}>rippingbombs.com/profile/{nameToSlug(loggedOrg.fullName)}</span>{' '}
              showing your stats and submitted drives? It's a great way to track your progress and show off your best results.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Btn full onClick={async () => { await updateProfileConsent(loggedOrg.id, false); setShowProfilePrompt(false); }} style={{ background:'transparent', border:`1px solid ${BDR}`, color:MUT }}>
                Not Now
              </Btn>
              <Btn full onClick={async () => { await updateProfileConsent(loggedOrg.id, true); setShowProfilePrompt(false); }}>
                Yes, Create It →
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
