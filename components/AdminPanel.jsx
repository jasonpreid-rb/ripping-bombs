import { useState } from 'react';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP, ORGS_KEY, ENT_KEY, SEED_KEY } from '../lib/constants';
import { fmtDate, tier } from '../lib/constants';
import { SEED_ORGS, SEED_ENTRIES, db } from '../lib/data';
import { Btn, Pill, BadgePill, countryFlag } from './UI';
import { sendApprovalEmail, sendRegistrationNotification } from '../lib/email';

const TABS = ['Overview','Approvals','Courses','Drives','Danger'];

export default function AdminPanel({ orgs, entries, setOrgs, setEntries, toast, onClose, cvt, unitLbl }) {
  const [tab, setTab] = useState('Overview');
  const [selOrg, setSelOrg] = useState(null);

  const pending  = orgs.filter(o=>o.status==='pending');
  const approved = orgs.filter(o=>o.status==='approved');

  async function setStatus(id, status) {
    const up = orgs.map(o=>o.id===id?{...o,status}:o);
    setOrgs(up); await db.set(ORGS_KEY, up);
  }

  async function deleteEntry(id) {
    const up = entries.filter(e=>e.id!==id);
    setEntries(up); await db.set(ENT_KEY, up);
    toast('Drive deleted');
  }

  async function resetData() {
    await db.set(ORGS_KEY, SEED_ORGS);
    await db.set(ENT_KEY, SEED_ENTRIES);
    await db.set(SEED_KEY, true);
    setOrgs(SEED_ORGS); setEntries(SEED_ENTRIES);
    toast('Demo data reloaded');
  }

  async function clearAll() {
    await db.del(ORGS_KEY); await db.del(ENT_KEY); await db.del(SEED_KEY);
    setOrgs([]); setEntries([]);
    toast('All data cleared');
  }

  const TabBtn = ({id}) => (
    <button onClick={()=>setTab(id)} style={{ background:tab===id?ORG:'transparent', border:tab===id?'none':`1px solid ${BDR}`, color:tab===id?'#111':MUT, fontFamily:SANS, fontWeight:600, fontSize:11, padding:'6px 14px', cursor:'pointer', letterSpacing:.5, position:'relative' }}>
      {id}
      {id==='Approvals'&&pending.length>0&&<span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, background:'#f87171', borderRadius:'50%' }}/>}
    </button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#1a1a1a', color:TXT, fontFamily:SANS }}>
      <div style={{ background:'#0e0e0e', borderBottom:`1px solid ${BDR}`, padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1 }}>Admin Dashboard</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TABS.map(t=><TabBtn key={t} id={t}/>)}
          <button onClick={onClose} style={{ background:'none', border:`1px solid rgba(220,60,60,0.3)`, color:'#f87171', fontFamily:SANS, fontWeight:600, fontSize:11, padding:'6px 14px', cursor:'pointer' }}>← Back</button>
        </div>
      </div>

      <div style={{ padding:'28px 22px', maxWidth:1000, margin:'0 auto' }}>

        {/* OVERVIEW */}
        {tab==='Overview'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
              {[['Registered Clubs',orgs.length],['Approved',approved.length],['Pending',pending.length],['Total Drives',entries.length]].map(([label,val])=>(
                <div key={label} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px', textAlign:'center' }}>
                  <div style={{ fontFamily:DISP, fontSize:36, color:ORG, letterSpacing:1 }}>{val}</div>
                  <div style={{ fontFamily:SANS, fontSize:11, color:MUT, marginTop:4, letterSpacing:.8, textTransform:'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
            {pending.length>0&&(
              <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', padding:'14px 18px', marginBottom:20 }}>
                <div style={{ fontFamily:SANS, fontSize:13, color:'#f87171', fontWeight:600 }}>⚠ {pending.length} registration{pending.length>1?'s':''} awaiting approval</div>
              </div>
            )}
          </div>
        )}

        {/* APPROVALS */}
        {tab==='Approvals'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:16 }}>Pending Approvals ({pending.length})</div>
            {pending.length===0&&<div style={{ fontFamily:SANS, fontSize:14, color:DIM, textAlign:'center', padding:'48px 0' }}>No pending registrations</div>}
            {pending.map(org=>(
              <div key={org.id} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'18px 20px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:TXT, marginBottom:3 }}>{org.courseName}{org.country&&countryFlag(org.country)}</div>
                    <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{org.fullName} · {org.position}</div>
                    <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{org.location} · {org.email}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); await sendRegistrationNotification(org); const ok=await sendApprovalEmail(org); toast(ok?'Club approved — notified':'Club approved (email failed)'); }}>Approve & Notify</Btn>
                    <Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'rejected'); toast('Registration rejected'); }}>Reject</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COURSES */}
        {tab==='Courses'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:16 }}>All Registered Courses ({orgs.length})</div>
            {orgs.map(org=>(
              <div key={org.id} onClick={()=>setSelOrg(selOrg?.id===org.id?null:org)}
                style={{ background:BG2, border:`1px solid ${selOrg?.id===org.id?ORG:BDR}`, padding:'14px 18px', marginBottom:6, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <span style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{org.courseName}</span>
                    {org.country&&countryFlag(org.country)}
                    <span style={{ fontFamily:SANS, fontSize:12, color:MUT, marginLeft:10 }}>{org.location}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Pill label={org.status} color={org.status}/>
                    {org.badge&&<BadgePill badge={org.badge} small/>}
                  </div>
                </div>
                {selOrg?.id===org.id&&(
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${BDR}` }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                      {[['Full Name',org.fullName],['Position',org.position],['Email',org.email],['Country',org.country||'—']].map(([k,v])=>(
                        <div key={k} style={{ background:BG3, padding:'8px 12px' }}>
                          <div style={{ fontFamily:SANS, fontSize:9, color:DIM, letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>{k}</div>
                          <div style={{ fontFamily:SANS, fontSize:12, color:TXT }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {org.status==='pending'&&<Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); const ok=await sendApprovalEmail(org); toast(ok?'Approved & notified':'Approved (email failed)'); }}>Approve & Notify</Btn>}
                      {org.status==='approved'&&<Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'disabled'); toast('Course disabled'); }}>Disable</Btn>}
                      {org.status==='disabled'&&<Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); toast('Course re-enabled'); }}>Re-enable</Btn>}
                      <Btn variant="danger" small onClick={async()=>{ if(!confirm('Delete this course?')) return; const up=orgs.filter(o=>o.id!==org.id); setOrgs(up); await db.set(ORGS_KEY,up); setSelOrg(null); toast('Course deleted'); }}>Delete</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DRIVES */}
        {tab==='Drives'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:16 }}>All Drives ({entries.length})</div>
            <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
                <thead>
                  <tr>{['Player','Distance','Course','HCP','Date','Tier','Delete'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:DIM, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[...entries].sort((a,b)=>b.dist-a.dist).map(e=>{
                    const org=orgs.find(o=>o.id===e.orgId);
                    return (
                      <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}` }}>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>{e.player}</td>
                        <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG }}>{cvt(e.dist)} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl}</span></td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{org?.courseName||'—'}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.hcp}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM }}>{fmtDate(e.date)}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:10, color:ORG, fontWeight:600 }}>{tier(e.dist)}</td>
                        <td style={{ padding:'10px 14px' }}><Btn variant="danger" small onClick={()=>{ if(confirm('Delete this drive?')) deleteEntry(e.id); }}>Delete</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DANGER ZONE */}
        {tab==='Danger'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:'#f87171', letterSpacing:1, marginBottom:16 }}>Danger Zone</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'20px 24px' }}>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT, marginBottom:4 }}>Reload Demo Data</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:14 }}>Resets all clubs and drives to the default sample data. Your real registrations will be lost.</div>
                <Btn variant="danger" onClick={()=>{ if(confirm('Reload demo data? This will overwrite all current data.')) resetData(); }}>Reload Demo Data</Btn>
              </div>
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'20px 24px' }}>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT, marginBottom:4 }}>Clear All Data</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:14 }}>Permanently deletes all clubs, drives and data. Cannot be undone.</div>
                <Btn variant="danger" onClick={()=>{ if(confirm('Delete ALL data? This cannot be undone.')) clearAll(); }}>Clear All Data</Btn>
              </div>
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'20px 24px' }}>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT, marginBottom:4 }}>Log Out of Admin</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:14 }}>Clears your admin session. You'll need to enter the password again.</div>
                <Btn variant="danger" onClick={()=>{ localStorage.removeItem('rb_admin_auth'); onClose(); toast('Logged out of admin'); }}>Log Out of Admin</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
