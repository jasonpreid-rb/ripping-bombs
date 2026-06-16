import { useState, useMemo, useEffect, useCallback } from 'react';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP, ORGS_KEY, ENT_KEY, SEED_KEY } from '../lib/constants';
import { fmtDate, tier } from '../lib/constants';
import { SEED_ORGS, SEED_ENTRIES, db } from '../lib/data';
import { Btn, Pill, BadgePill, countryFlag } from './UI';
import { sendApprovalEmail, sendRegistrationNotification } from '../lib/email';
import { supabase } from '../lib/supabaseClient';

const TABS = ['Overview', 'Approvals', 'Clubs', 'Drives', 'Founding', 'Danger'];
const FOUNDING_LIMIT = 50;

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

// ── founding member badge ─────────────────────────────────────────────────────
const FoundingBadge = () => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:3,
    background:'linear-gradient(135deg,#78350f,#92400e)',
    color:'#fbbf24', border:'1px solid #b45309',
    borderRadius:20, padding:'1px 7px',
    fontFamily:SANS, fontSize:'0.6rem', fontWeight:700,
    letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap',
  }}>
    ★ Founding
  </span>
);

// ── founding tab ─────────────────────────────────────────────────────────────
function FoundingTab({ toast }) {
  const [clubs, setClubs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // 'all' | 'founding' | 'regular'

  const foundingCount = clubs.filter(c => c.is_founding_member).length;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clubs')
      .select('id, fullName, courseName, email, location, country, status, accountType, is_founding_member')
      .order('id', { ascending: true });
    if (!error) setClubs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, current) => {
    if (!current && foundingCount >= FOUNDING_LIMIT) return;
    setToggling(id);
    const { error } = await supabase
      .from('clubs')
      .update({ is_founding_member: !current })
      .eq('id', id);
    if (!error) {
      setClubs(prev => prev.map(c => c.id === id ? { ...c, is_founding_member: !current } : c));
      toast(current ? 'Founding Member status removed' : '★ Founding Member granted!');
    } else {
      toast('Error updating — check console');
      console.error(error);
    }
    setToggling(null);
  };

  const filtered = clubs.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (c.fullName   || '').toLowerCase().includes(q) ||
      (c.courseName || '').toLowerCase().includes(q) ||
      (c.email      || '').toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ||
      (filter === 'founding' && c.is_founding_member) ||
      (filter === 'regular'  && !c.is_founding_member);
    return matchSearch && matchFilter;
  });

  const filterBtn = (key, label) => (
    <button key={key} onClick={() => setFilter(key)} style={{
      background: filter === key ? 'rgba(255,0,144,0.08)' : 'transparent',
      border: `1px solid ${filter === key ? ORG : BDR}`,
      color: filter === key ? ORG : MUT,
      fontFamily: SANS, fontSize: 11, padding: '5px 11px',
      cursor: 'pointer', letterSpacing: .5,
    }}>{label}</button>
  );

  return (
    <div>
      {/* Header + counter */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:4 }}>Founding Members</div>
          <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>First {FOUNDING_LIMIT} registrants receive lifetime recognition. Toggle on/off per club.</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:DISP, fontSize:36, letterSpacing:1, color: foundingCount >= FOUNDING_LIMIT ? '#f59e0b' : ORG, lineHeight:1 }}>
            {foundingCount}<span style={{ fontFamily:SANS, fontSize:16, color:MUT, fontWeight:400 }}> / {FOUNDING_LIMIT}</span>
          </div>
          <div style={{ fontFamily:SANS, fontSize:9, color:MUT, textTransform:'uppercase', letterSpacing:.8, marginTop:2 }}>Founding Members</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:3, background:BDR, borderRadius:99, marginBottom:16, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:99,
          background: foundingCount >= FOUNDING_LIMIT ? '#f59e0b' : ORG,
          width: `${Math.min((foundingCount / FOUNDING_LIMIT) * 100, 100)}%`,
          transition: 'width 0.4s ease',
        }}/>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, alignItems:'center' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, club, or email…" />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {filterBtn('all',      `All (${clubs.length})`)}
          {filterBtn('founding', `★ Founding (${foundingCount})`)}
          {filterBtn('regular',  `Regular (${clubs.length - foundingCount})`)}
        </div>
      </div>

      {/* List */}
      <div style={{ border:`1px solid ${BDR}`, background:BG2 }}>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', fontFamily:SANS, fontSize:13, color:DIM }}>Loading clubs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', fontFamily:SANS, fontSize:13, color:DIM }}>No clubs match your search.</div>
        ) : filtered.map((c, i) => {
          const atCap   = !c.is_founding_member && foundingCount >= FOUNDING_LIMIT;
          const spinning = toggling === c.id;
          return (
            <div key={c.id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 16px', gap:12,
              borderBottom: i < filtered.length - 1 ? `1px solid ${BDR}` : 'none',
              background: c.is_founding_member ? 'rgba(255,0,144,0.025)' : 'transparent',
            }}>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:2 }}>
                  <span style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>
                    {c.courseName || c.fullName || c.id}
                  </span>
                  {c.country && countryFlag(c.country)}
                  {c.is_founding_member && <FoundingBadge />}
                  <span style={{ fontFamily:SANS, fontSize:10, color:DIM, border:`1px solid ${BDR}`, padding:'1px 5px' }}>
                    {c.accountType === 'simulator' ? '🖥️ Sim' : '🏌️ Club'}
                  </span>
                </div>
                <div style={{ fontFamily:SANS, fontSize:11, color:MUT, display:'flex', gap:6, flexWrap:'wrap' }}>
                  {c.fullName && <span>{c.fullName}</span>}
                  {c.email    && <span>· {c.email}</span>}
                  {c.location && <span>· {c.location}</span>}
                  <span style={{ color:DIM }}>· {c.id}</span>
                </div>
              </div>

              {/* Toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                {atCap && <span style={{ fontFamily:SANS, fontSize:10, color:'#f59e0b' }}>Limit reached</span>}
                <button
                  onClick={() => handleToggle(c.id, c.is_founding_member)}
                  disabled={spinning || atCap}
                  style={{
                    fontFamily:SANS, fontSize:11, fontWeight:700,
                    padding:'5px 12px', cursor: spinning || atCap ? 'not-allowed' : 'pointer',
                    opacity: spinning || atCap ? 0.45 : 1,
                    border: `1px solid ${c.is_founding_member ? 'rgba(248,113,113,0.4)' : atCap ? BDR : 'rgba(255,0,144,0.4)'}`,
                    background: c.is_founding_member ? 'rgba(248,113,113,0.08)' : atCap ? 'transparent' : 'rgba(255,0,144,0.08)',
                    color: c.is_founding_member ? '#f87171' : atCap ? DIM : ORG,
                    minWidth:58, textAlign:'center',
                  }}
                >
                  {spinning ? '…' : c.is_founding_member ? 'Revoke' : 'Grant'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mini bar chart (pure CSS/SVG) ────────────────────────────────────────────
function MiniBarChart({ data, color = '#FF0090', height = 80 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, paddingTop:4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
          <div style={{ width:'100%', background:`${color}22`, position:'relative', height: height - 20, display:'flex', alignItems:'flex-end' }}>
            <div style={{
              width:'100%',
              height:`${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`,
              background: d.highlight ? color : `${color}88`,
              transition:'height .3s ease',
            }}/>
          </div>
          <div style={{ fontFamily:SANS, fontSize:8, color:DIM, textAlign:'center', letterSpacing:.3, whiteSpace:'nowrap', overflow:'hidden', maxWidth:'100%' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Launch readiness score ────────────────────────────────────────────────────
function LaunchScore({ orgs, entries }) {
  const approved   = orgs.filter(o => o.status === 'approved');
  const clubs      = approved.filter(o => o.accountType === 'club');
  const sims       = approved.filter(o => o.accountType === 'simulator');
  const withDrives = approved.filter(o => entries.some(e => e.orgId === o.id));
  const countries  = new Set(approved.map(o => o.country).filter(Boolean)).size;

  const checks = [
    { label: '10+ approved accounts',       done: approved.length >= 10,  weight: 15 },
    { label: '25+ approved accounts',       done: approved.length >= 25,  weight: 10 },
    { label: '5+ club accounts',            done: clubs.length >= 5,      weight: 15 },
    { label: '50+ total drives',            done: entries.length >= 50,   weight: 15 },
    { label: '200+ total drives',           done: entries.length >= 200,  weight: 10 },
    { label: '10+ accounts submitting',     done: withDrives.length >= 10,weight: 15 },
    { label: '5+ countries represented',   done: countries >= 5,          weight: 10 },
    { label: '10+ countries represented',  done: countries >= 10,         weight: 10 },
  ];

  const score = checks.reduce((s, c) => s + (c.done ? c.weight : 0), 0);
  const color = score >= 80 ? '#4ade80' : score >= 50 ? ORG : '#fb923c';

  return (
    <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px 22px' }}>
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:DIM, textTransform:'uppercase', marginBottom:12 }}>Launch Readiness</div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
        <div style={{ fontFamily:DISP, fontSize:52, color, letterSpacing:1, lineHeight:1 }}>{score}<span style={{ fontFamily:SANS, fontSize:18, color:MUT }}>%</span></div>
        <div style={{ flex:1 }}>
          <div style={{ height:6, background:BDR, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${score}%`, background:color, borderRadius:99, transition:'width .5s ease' }}/>
          </div>
          <div style={{ fontFamily:SANS, fontSize:11, color:MUT }}>
            {score >= 80 ? 'Ready to launch!' : score >= 50 ? 'Getting there — keep building' : 'Early stage — focus on registrations'}
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ color: c.done ? '#4ade80' : BDR, fontSize:12, flexShrink:0 }}>{c.done ? '✓' : '○'}</span>
            <span style={{ fontFamily:SANS, fontSize:11, color: c.done ? MUT : DIM }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ orgs, entries, pending, approved, noSubmissions, setStatus, sendApprovalEmail, sendRegistrationNotification, toast, cvt, unitLbl }) {
  // ── derived stats ──
  const clubs      = orgs.filter(o => o.accountType === 'club');
  const sims       = orgs.filter(o => o.accountType === 'simulator');
  const approvedClubs = approved.filter(o => o.accountType === 'club');
  const approvedSims  = approved.filter(o => o.accountType === 'simulator');
  const officialDrives   = entries.filter(e => !e.is_simulator);
  const simDrives        = entries.filter(e => e.is_simulator);
  const avgDist = entries.length ? Math.round(entries.reduce((s,e) => s + Number(e.dist), 0) / entries.length) : 0;
  const bestDrive = entries.length ? entries.reduce((b,e) => Number(e.dist) > Number(b.dist) ? e : b, entries[0]) : null;

  // ── country breakdown ──
  const countryMap = {};
  approved.forEach(o => { if (o.country) countryMap[o.country] = (countryMap[o.country]||0) + 1; });
  const topCountries = Object.entries(countryMap).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const totalCountries = Object.keys(countryMap).length;

  // ── weekly drives chart (last 12 weeks) ──
  function getISOWeek(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2,'0')}`;
  }

  const weekMap = {};
  entries.forEach(e => {
    const w = getISOWeek(e.date);
    weekMap[w] = (weekMap[w]||0) + 1;
  });
  const sortedWeeks = Object.keys(weekMap).sort().slice(-12);
  const currentWeek = getISOWeek(new Date().toISOString().split('T')[0]);
  const weekChartData = sortedWeeks.map(w => ({
    label: w.split('-W')[1] ? `W${w.split('-W')[1]}` : w,
    value: weekMap[w] || 0,
    highlight: w === currentWeek,
  }));

  // ── weekly active submitters ──
  const activeThisWeek = new Set(
    entries.filter(e => getISOWeek(e.date) === currentWeek).map(e => e.orgId)
  ).size;
  const lastWeekStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getISOWeek(d.toISOString().split('T')[0]);
  })();
  const activeLastWeek = new Set(
    entries.filter(e => getISOWeek(e.date) === lastWeekStr).map(e => e.orgId)
  ).size;

  // ── registrations per week chart ──
  const regWeekMap = {};
  orgs.forEach(o => {
    if (!o.id) return;
    // Use id as timestamp proxy (numeric ids)
    const ts = Number(o.id);
    if (!isNaN(ts) && ts > 1000000000000) {
      const d = new Date(ts).toISOString().split('T')[0];
      const w = getISOWeek(d);
      regWeekMap[w] = (regWeekMap[w]||0) + 1;
    }
  });
  const regWeeks = Object.keys(regWeekMap).sort().slice(-12);
  const regChartData = regWeeks.map(w => ({
    label: `W${w.split('-W')[1]||w}`,
    value: regWeekMap[w]||0,
    highlight: w === currentWeek,
  }));

  // ── top players ──
  const playerBest = {};
  entries.forEach(e => {
    if (!playerBest[e.player] || Number(e.dist) > Number(playerBest[e.player].dist)) {
      playerBest[e.player] = e;
    }
  });
  const topPlayers = Object.values(playerBest).sort((a,b) => Number(b.dist)-Number(a.dist)).slice(0,5);

  const SectionTitle = ({ children, color }) => (
    <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:color||DIM, textTransform:'uppercase', marginBottom:12 }}>{children}</div>
  );

  const BigStat = ({ val, label, sub, accent, warn }) => (
    <div style={{ background:BG2, border:`1px solid ${warn?'rgba(248,113,113,0.3)':BDR}`, padding:'18px 20px' }}>
      <div style={{ fontFamily:DISP, fontSize:38, color:accent||(warn?'#f87171':ORG), letterSpacing:1, lineHeight:1 }}>{val}</div>
      <div style={{ fontFamily:SANS, fontSize:10, color:MUT, marginTop:5, letterSpacing:.8, textTransform:'uppercase' }}>{label}</div>
      {sub && <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:3 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── Pending alert ── */}
      {pending.length > 0 && (
        <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.3)', padding:'16px 20px' }}>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:2, color:'#f87171', textTransform:'uppercase', marginBottom:10 }}>⚠ {pending.length} Pending Approval{pending.length>1?'s':''}</div>
          {pending.map(org => (
            <div key={org.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, padding:'8px 0', borderBottom:`1px solid rgba(248,113,113,0.1)` }}>
              <div>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:TXT }}>{org.courseName} {org.country&&countryFlag(org.country)}</div>
                <div style={{ fontFamily:SANS, fontSize:11, color:MUT }}>{org.fullName} · {org.email}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="approve" small onClick={async()=>{ await setStatus(org.id,'approved'); await sendRegistrationNotification(org); const ok=await sendApprovalEmail(org); toast(ok?'Approved & notified':'Approved (email failed)'); }}>✓ Approve</Btn>
                <Btn variant="danger" small onClick={async()=>{ await setStatus(org.id,'rejected'); toast('Rejected'); }}>✕ Reject</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Key metrics ── */}
      <div>
        <SectionTitle>Platform at a Glance</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
          <BigStat val={approved.length}       label="Approved Accounts"   sub={`${approvedClubs.length} clubs · ${approvedSims.length} sims`} />
          <BigStat val={pending.length}        label="Pending Approval"    warn={pending.length>0} />
          <BigStat val={entries.length}        label="Total Drives"        sub={`${officialDrives.length} official · ${simDrives.length} sim`} />
          <BigStat val={activeThisWeek}        label="Active This Week"    sub={`${activeLastWeek} last week`} />
          <BigStat val={totalCountries}        label="Countries"           sub="represented" />
          <BigStat val={avgDist ? `${avgDist}` : '—'} label="Avg Drive"   sub={avgDist ? unitLbl : ''} />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'18px 20px' }}>
          <SectionTitle>Drives Per Week</SectionTitle>
          {weekChartData.length > 0
            ? <MiniBarChart data={weekChartData} color={ORG} height={100} />
            : <div style={{ fontFamily:SANS, fontSize:12, color:DIM, padding:'20px 0' }}>No drive data yet</div>
          }
        </div>
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'18px 20px' }}>
          <SectionTitle>Registrations Per Week</SectionTitle>
          {regChartData.length > 0
            ? <MiniBarChart data={regChartData} color="#60a5fa" height={100} />
            : <div style={{ fontFamily:SANS, fontSize:12, color:DIM, padding:'20px 0' }}>No registration data yet</div>
          }
        </div>
      </div>

      {/* ── Launch readiness + Country breakdown ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <LaunchScore orgs={orgs} entries={entries} />

        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px 22px' }}>
          <SectionTitle>Top Countries</SectionTitle>
          {topCountries.length === 0
            ? <div style={{ fontFamily:SANS, fontSize:12, color:DIM }}>No data yet</div>
            : topCountries.map(([code, count]) => {
                const pct = Math.round((count / approved.length) * 100);
                return (
                  <div key={code} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {countryFlag(code)}
                        <span style={{ fontFamily:SANS, fontSize:12, color:TXT, textTransform:'uppercase', letterSpacing:.5 }}>{code}</span>
                      </div>
                      <span style={{ fontFamily:SANS, fontSize:11, color:MUT }}>{count} account{count>1?'s':''}</span>
                    </div>
                    <div style={{ height:3, background:BDR, borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:ORG, borderRadius:99 }}/>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* ── Top players + No submissions ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px 22px' }}>
          <SectionTitle>Top 5 Drives</SectionTitle>
          {topPlayers.length === 0
            ? <div style={{ fontFamily:SANS, fontSize:12, color:DIM }}>No drives yet</div>
            : topPlayers.map((e, i) => {
                const org = orgs.find(o => o.id === e.orgId);
                return (
                  <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${BDR}` }}>
                    <div style={{ fontFamily:DISP, fontSize:18, color:i===0?ORG:DIM, width:24, flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:TXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.player}</div>
                      <div style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{org?.courseName||'—'} · {fmtDate(e.date)}</div>
                    </div>
                    <div style={{ fontFamily:DISP, fontSize:20, color:i===0?ORG:MUT, flexShrink:0 }}>{cvt(e.dist)}<span style={{ fontFamily:SANS, fontSize:9, color:DIM, marginLeft:2 }}>{unitLbl}</span></div>
                  </div>
                );
              })
          }
        </div>

        <div style={{ background:BG2, border:`1px solid ${BDR}`, padding:'20px 22px' }}>
          <SectionTitle color="#fb923c">No Drives Submitted Yet ({noSubmissions.length})</SectionTitle>
          {noSubmissions.length === 0
            ? <div style={{ fontFamily:SANS, fontSize:12, color:'#4ade80' }}>✓ All approved accounts have submitted</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:220, overflowY:'auto' }}>
                {noSubmissions.map(org => (
                  <div key={org.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid ${BDR}` }}>
                    {org.country && countryFlag(org.country)}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:SANS, fontSize:12, color:TXT, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{org.courseName}</div>
                      <div style={{ fontFamily:SANS, fontSize:10, color:DIM }}>{org.email}</div>
                    </div>
                    <span style={{ fontFamily:SANS, fontSize:9, color:DIM, border:`1px solid ${BDR}`, padding:'1px 5px', flexShrink:0 }}>{org.accountType==='simulator'?'SIM':'CLUB'}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* ── Best drive callout ── */}
      {bestDrive && (
        <div style={{ background:'linear-gradient(135deg,rgba(255,0,144,0.08),rgba(255,0,144,0.02))', border:`1px solid rgba(255,0,144,0.25)`, padding:'20px 24px', display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:2, color:ORG, textTransform:'uppercase', marginBottom:4 }}>All-Time Record Drive</div>
            <div style={{ fontFamily:DISP, fontSize:48, color:ORG, letterSpacing:1, lineHeight:1 }}>{cvt(bestDrive.dist)} <span style={{ fontFamily:SANS, fontSize:16, color:MUT }}>{unitLbl}</span></div>
          </div>
          <div>
            <div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:TXT }}>{bestDrive.player}</div>
            <div style={{ fontFamily:SANS, fontSize:12, color:MUT }}>{fmtDate(bestDrive.date)}</div>
            <div style={{ fontFamily:SANS, fontSize:12, color:DIM }}>{bestDrive.club}</div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function AdminPanel({ orgs, entries, setOrgs, setEntries, toast, onClose, cvt, unitLbl }) {
  const [tab, setTab]       = useState('Overview');
  const [selOrg, setSelOrg] = useState(null);
  const [editing, setEditing] = useState(null);
  const [clubSearch, setClubSearch]   = useState('');
  const [driveSearch, setDriveSearch] = useState('');

  const pending  = orgs.filter(o => o.status === 'pending');
  const approved = orgs.filter(o => o.status === 'approved');
  const disabled = orgs.filter(o => o.status === 'disabled');

  const driveCount = useMemo(() => {
    const m = {};
    entries.forEach(e => { m[e.orgId] = (m[e.orgId]||0) + 1; });
    return m;
  }, [entries]);

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

  const filteredOrgs = orgs.filter(o => {
    const q = clubSearch.toLowerCase();
    return !q || o.courseName?.toLowerCase().includes(q) || o.fullName?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q);
  });

  const filteredEntries = [...entries].sort((a,b) => Number(b.dist) - Number(a.dist)).filter(e => {
    const q = driveSearch.toLowerCase();
    if (!q) return true;
    const org = orgs.find(o => o.id===e.orgId);
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
          <button onClick={()=>{ localStorage.removeItem('rb_admin_auth'); localStorage.removeItem('rb_admin_expiry'); onClose(); }} style={{ background:'rgba(248,113,113,0.12)', border:`1px solid rgba(248,113,113,0.4)`, color:'#f87171', fontFamily:SANS, fontWeight:700, fontSize:11, padding:'6px 14px', cursor:'pointer', letterSpacing:.5 }}>⏻ Log Out</button>
        </div>
      </div>

      <div style={{ padding:'28px 22px', maxWidth:1100, margin:'0 auto' }}>

        {/* ── OVERVIEW ── */}
        {tab==='Overview'&&(
          <OverviewTab orgs={orgs} entries={entries} pending={pending} approved={approved} noSubmissions={noSubmissions} setStatus={setStatus} sendApprovalEmail={sendApprovalEmail} sendRegistrationNotification={sendRegistrationNotification} toast={toast} cvt={cvt} unitLbl={unitLbl} />
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
                      {org.is_founding_member&&<FoundingBadge/>}
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

        {/* ── FOUNDING ── */}
        {tab==='Founding'&&(
          <FoundingTab toast={toast} />
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
