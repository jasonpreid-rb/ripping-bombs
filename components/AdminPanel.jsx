import { useState, useMemo } from 'react';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP, ORGS_KEY, ENT_KEY, SEED_KEY } from '../lib/constants';
import { fmtDate, tier } from '../lib/constants';
import { SEED_ORGS, SEED_ENTRIES, db } from '../lib/data';
import { Btn, Pill, BadgePill, countryFlag } from './UI';
import { sendApprovalEmail, sendRegistrationNotification } from '../lib/email';

const TABS = ['Overview', 'Approvals', 'Clubs', 'Drives', 'Danger'];

// ── small helpers ────────────────────────────────────────────────────────────
const Stat = ({ val, label, accent }) => (
  <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px', textAlign:'center' }}>
    <div style={{ fontFamily:DISP, fontSize:36, color:accent||ORG, letterSpacing:1 }}>{val}</div>
    <div style={{ fontFamily:SANS, fontSize:11, color:MUT, marginTop:4, letterSpacing:.8, textTransform:'uppercase' }}>{label}</div>
  </div>
);

const InfoCell = ({ label, value }) => (
  <div style={{ background:BG3, padding:'8px 12px' }}>
    <div style={{ fontFamily:SANS, fontSize:9, color:DIM, letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>{label}</div>
    <div style={{ fontFamily:SANS, fontSize:12, color:TXT }}>{value||'—'}</div>
  </div>
);

const SearchBox = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ background:BG3, border:`1px solid ${BDR}`, padding:'8px 12px', color:TXT, fontFamily:SANS, fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' }}/>
);

// ── editable field ───────────────────────────────────────────────────────────
const EditField = ({ label, value, onChange }) => (
  <div>
    <div style={{ fontFamily:SANS, fontSize:9, color:DIM, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
    <input value={value||''} onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', background:'#111', border:`1px solid ${BDR}`, padding:'8px 10px', color:TXT, fontFamily:SANS, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
  </div>
);

export default function AdminPanel({ orgs, entries, setOrgs, setEntries, toast, onClose, cvt, unitLbl }) {
  const [tab, setTab]       = useState('Overview');
  const [selOrg, setSelOrg] = useState(null);
  const [editing, setEditing] = useState(null);   // holds edited fields while open
  const [clubSearch, setClubSearch]   = useState('');
  const [driveSearch, setDriveSearch] = useState('');

  const pending  = orgs.filter(o => o.status === 'pending');
  const approved = orgs.filter(o => o.status === 'approved');
  const disabled = orgs.filter(o => o.status === 'disabled');

  // drives per org
  const driveCount = useMemo(() => {
    const m = {};
    entries.forEach(e => { m[e.orgId] = (m[e.orgId]||0) + 1; });
    return m;
  }, [entries]);

  // clubs with zero submissions
  const noSubmissions = approved.filter(o => !driveCount[o.id]);

  async function setStatus(id, status) {
    const up = orgs.map(o => o.id===id ? {...o, status} : o);
    setOrgs(up);
    await db.updateOrg(id, { status });
  }

  async function saveEdit(org) {
    const up = orgs.map(o => o.id===org.id ? {...o, ...editing} : o);
    setOrgs(up);
    await db.updateOrg(org.id, editing);
    setEditing(null);
    setSelOrg({...org, ...editing});
    toast('Club details saved');
  }

  async function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id!==id));
    await db.deleteEntry(id);
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

  // filtered lists
  const filteredOrgs = orgs.filter(o => {
    const q = clubSearch.toLowerCase();
    return !q || o.courseName?.toLowerCase().includes(q) || o.fullName?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q);
  });

  const filteredEntries = [...entries].sort((a,b)=>b.dist-a.dist).filter(e => {
    const q = driveSearch.toLowerCase();
    if (!q) return true;
    const org = orgs.find(o=>o.id===e.orgId);
    return e.player?.toLowerCase().includes(q) || e.club?.toLowerCase().includes(q) || org?.courseName?.toLowerCase().includes(q);
  });

  const TabBtn = ({ id }) => {
    const badge = id==='Approvals' && pending.length > 0;
    return (
      <button onClick={()=>setTab(id)} style={{ background:tab===id?ORG:'transparent', border:tab===id?'none':`1px solid ${BDR}`, color:tab===id?'#111':MUT, fontFamily:SANS, fontWeight:600, fontSize:11, padding:'6px 14px', cursor:'pointer', letterSpacing:.5, position:'relative' }}>
        {id}{id==='Approvals'&&pending.length>0?` (${pending.length})`:''}
        {badge&&<span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, background:'#f87171', borderRadius:'50%' }}/>}
      </button>
    );
  };

  return (
    <div style={{ minHeight:'100vh', background:'#1a1a1a', color:TXT, fontFamily:SANS }}>

      {/* Header */}
      <div style={{ background:'#0e0e0e', borderBottom:`1px solid ${BDR}`, padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1 }}>Admin Dashboard</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TABS.map(t=><TabBtn key={t} id={t}/>)}
          <button onClick={onClose} style={{ background:'none', border:`1px solid rgba(220,60,60,0.3)`, color:'#f87171', fontFamily:SANS, fontWeight:600, fontSize:11, padding:'6px 14px', cursor:'pointer' }}>← Back to Site</button>
        </div>
      </div>

      <div style={{ padding:'28px 22px', maxWidth:1100, margin:'0 auto' }}>

        {/* ── OVERVIEW ── */}
        {tab==='Overview'&&(
          <div>
            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
              <Stat val={orgs.length} label="Registered"/>
              <Stat val={approved.length} label="Approved"/>
              <Stat val={pending.length} label="Pending" accent={pending.length>0?'#f87171':ORG}/>
              <Stat val={disabled.length} label="Disabled" accent={MUT}/>
              <Stat val={entries.length} label="Total Drives"/>
              <Stat val={noSubmissions.length} label="No Submissions Yet" accent={noSubmissions.length>0?'#fb923c':ORG}/>
            </div>

            {/* Pending approvals – inline action */}
            {pending.length>0&&(
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:'#f87171', textTransform:'uppercase', marginBottom:10 }}>⚠ Awaiting Approval</div>
                {pending.map(org=>(
                  <div key={org.id} style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'14px 18px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{org.courseName}{org.country&&countryFlag(org.country)}</div>
                      <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginTop:2 }}>{org.fullName} · {org.email} · {org.location}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); await sendRegistrationNotification(org); const ok=await sendApprovalEmail(org); toast(ok?'Approved & notified':'Approved (email failed)'); }}>✓ Approve</Btn>
                      <Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'rejected'); toast('Rejected'); }}>✕ Reject</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved clubs with no submissions */}
            {noSubmissions.length>0&&(
              <div>
                <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:'#fb923c', textTransform:'uppercase', marginBottom:10 }}>📭 Approved — No Drives Submitted Yet</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:8 }}>
                  {noSubmissions.map(org=>(
                    <div key={org.id} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'12px 14px' }}>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>{org.courseName}{org.country&&countryFlag(org.country)}</div>
                      <div style={{ fontFamily:SANS, fontSize:11, color:MUT, marginTop:2 }}>{org.location}</div>
                      <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:2 }}>{org.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pending.length===0&&noSubmissions.length===0&&(
              <div style={{ fontFamily:SANS, fontSize:13, color:DIM, textAlign:'center', padding:'40px 0' }}>✓ All caught up — no pending approvals or missing submissions.</div>
            )}
          </div>
        )}

        {/* ── APPROVALS ── */}
        {tab==='Approvals'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:16 }}>Pending Approvals ({pending.length})</div>
            {pending.length===0&&<div style={{ fontFamily:SANS, fontSize:14, color:DIM, textAlign:'center', padding:'48px 0' }}>✓ No pending registrations</div>}
            {pending.map(org=>(
              <div key={org.id} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'18px 20px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:TXT, marginBottom:3 }}>{org.courseName}{org.country&&countryFlag(org.country)}</div>
                    <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{org.fullName} · {org.position}</div>
                    <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{org.location} · {org.email}</div>
                    <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:4 }}>Type: {org.accountType==='simulator'?'🖥️ Simulator':'🏌️ Golf Club/Event'}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); await sendRegistrationNotification(org); const ok=await sendApprovalEmail(org); toast(ok?'Club approved — notified':'Club approved (email failed)'); }}>✓ Approve & Notify</Btn>
                    <Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'rejected'); toast('Registration rejected'); }}>✕ Reject</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CLUBS ── */}
        {tab==='Clubs'&&(
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
              <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1 }}>All Clubs & Accounts ({orgs.length})</div>
              <div style={{ width:280 }}><SearchBox value={clubSearch} onChange={setClubSearch} placeholder="Search name, location, email…"/></div>
            </div>

            {filteredOrgs.length===0&&<div style={{ fontFamily:SANS, fontSize:13, color:DIM, textAlign:'center', padding:'40px 0' }}>No results</div>}

            {filteredOrgs.map(org=>{
              const isOpen = selOrg?.id===org.id;
              const drives = driveCount[org.id]||0;
              return (
                <div key={org.id} style={{ background:BG2, border:`1px solid ${isOpen?ORG:BDR}`, marginBottom:6, overflow:'hidden' }}>
                  {/* Row */}
                  <div onClick={()=>{ setSelOrg(isOpen?null:org); setEditing(null); }} style={{ padding:'13px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT }}>{org.courseName}</span>
                      {org.country&&countryFlag(org.country)}
                      <span style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{org.location}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:SANS, fontSize:11, color:drives>0?ORG:DIM, fontWeight:600 }}>{drives} drive{drives!==1?'s':''}</span>
                      <Pill label={org.status} color={org.status}/>
                      {org.badge&&<BadgePill badge={org.badge} small/>}
                    </div>
                  </div>

                  {/* Expanded detail + edit */}
                  {isOpen&&(
                    <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${BDR}` }}>
                      {editing ? (
                        <div>
                          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:ORG, letterSpacing:1.5, textTransform:'uppercase', margin:'14px 0 10px' }}>Editing Details</div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                            <EditField label="Course / Name"  value={editing.courseName} onChange={v=>setEditing({...editing,courseName:v})}/>
                            <EditField label="Full Name"      value={editing.fullName}   onChange={v=>setEditing({...editing,fullName:v})}/>
                            <EditField label="Position"       value={editing.position}   onChange={v=>setEditing({...editing,position:v})}/>
                            <EditField label="Email"          value={editing.email}      onChange={v=>setEditing({...editing,email:v})}/>
                            <EditField label="Location"       value={editing.location}   onChange={v=>setEditing({...editing,location:v})}/>
                            <EditField label="Country Code"   value={editing.country}    onChange={v=>setEditing({...editing,country:v})}/>
                          </div>
                          <div style={{ display:'flex', gap:8 }}>
                            <Btn variant="approve" small onClick={()=>saveEdit(org)}>Save Changes</Btn>
                            <Btn small onClick={()=>setEditing(null)}>Cancel</Btn>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8, margin:'14px 0 12px' }}>
                            <InfoCell label="Full Name"  value={org.fullName}/>
                            <InfoCell label="Position"   value={org.position}/>
                            <InfoCell label="Email"      value={org.email}/>
                            <InfoCell label="Country"    value={org.country}/>
                            <InfoCell label="Type"       value={org.accountType==='simulator'?'🖥️ Simulator':'🏌️ Club/Event'}/>
                            <InfoCell label="Drives"     value={`${drives} submitted`}/>
                          </div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <Btn small onClick={()=>setEditing({courseName:org.courseName,fullName:org.fullName,position:org.position,email:org.email,location:org.location,country:org.country})}>✎ Edit Details</Btn>
                            {org.status==='pending'&&<Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); const ok=await sendApprovalEmail(org); toast(ok?'Approved & notified':'Approved (email failed)'); }}>✓ Approve</Btn>}
                            {org.status==='approved'&&<Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'disabled'); toast('Disabled'); }}>Disable</Btn>}
                            {org.status==='disabled'&&<Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); toast('Re-enabled'); }}>Re-enable</Btn>}
                            <Btn variant="danger" small onClick={async()=>{ if(!confirm('Delete this club and all its data?')) return; setOrgs(prev=>prev.filter(o=>o.id!==org.id)); await db.deleteOrg(org.id); setSelOrg(null); toast('Club deleted'); }}>Delete</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DRIVES ── */}
        {tab==='Drives'&&(
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
              <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1 }}>All Drives ({entries.length})</div>
              <div style={{ width:280 }}><SearchBox value={driveSearch} onChange={setDriveSearch} placeholder="Search player, club brand, course…"/></div>
            </div>
            <div style={{ overflowX:'auto', border:`1px solid ${BDR}`, background:BG2 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
                <thead>
                  <tr>{['Player','Distance','Course','Club Brand','HCP','Date','Type','Delete'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.2, color:DIM, textTransform:'uppercase', textAlign:'left', borderBottom:`2px solid ${BDR}`, whiteSpace:'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filteredEntries.map(e=>{
                    const org = orgs.find(o=>o.id===e.orgId);
                    return (
                      <tr key={e.id} style={{ borderBottom:`1px solid ${BDR}` }}>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT, whiteSpace:'nowrap' }}>{e.player}</td>
                        <td style={{ padding:'10px 14px', fontFamily:DISP, fontSize:18, color:ORG, whiteSpace:'nowrap' }}>{cvt(e.dist)} <span style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{unitLbl}</span></td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{org?.courseName||'—'}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.club||'—'}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:12, color:MUT }}>{e.hcp}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:DIM, whiteSpace:'nowrap' }}>{fmtDate(e.date)}</td>
                        <td style={{ padding:'10px 14px', fontFamily:SANS, fontSize:11, color:e.is_simulator?MUT:ORG }}>{e.is_simulator?'🖥️ Sim':'🏌️ Official'}</td>
                        <td style={{ padding:'10px 14px' }}><Btn variant="danger" small onClick={()=>{ if(confirm('Delete this drive?')) deleteEntry(e.id); }}>Delete</Btn></td>
                      </tr>
                    );
                  })}
                  {filteredEntries.length===0&&<tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', fontFamily:SANS, fontSize:13, color:DIM }}>No drives found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DANGER ── */}
        {tab==='Danger'&&(
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:'#f87171', letterSpacing:1, marginBottom:16 }}>Danger Zone</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { title:'Reload Demo Data', body:"Resets all clubs and drives to the default sample data. Your real registrations will be lost.", action:()=>{ if(confirm('Reload demo data? This will overwrite all current data.')) resetData(); }, label:'Reload Demo Data' },
                { title:'Clear All Data',   body:'Permanently deletes all clubs, drives and data. Cannot be undone.',                            action:()=>{ if(confirm('Delete ALL data? This cannot be undone.')) clearAll(); },                label:'Clear All Data' },
              ].map(({title,body,action,label})=>(
                <div key={title} style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'20px 24px' }}>
                  <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT, marginBottom:4 }}>{title}</div>
                  <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:14 }}>{body}</div>
                  <Btn variant="danger" onClick={action}>{label}</Btn>
                </div>
              ))}
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', padding:'20px 24px' }}>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:TXT, marginBottom:4 }}>Log Out of Admin</div>
                <div style={{ fontFamily:SANS, fontSize:12, color:MUT, marginBottom:14 }}>Clears your admin session. You'll need to enter the password again to return.</div>
                <Btn variant="danger" onClick={()=>{ localStorage.removeItem('rb_admin_auth'); localStorage.removeItem('rb_admin_expiry'); onClose(); toast('Logged out of admin'); }}>Log Out</Btn>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
