import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';
import Layout from '../components/Layout';
import AdminPanel from '../components/AdminPanel';
import LaunchModal from '../components/LaunchModal';
import DemoSubmit from '../components/DemoSubmit';
import { initData, db } from '../lib/data';
import { ORGS_KEY, ENT_KEY, ADMIN_PW, SANS, ORG, MUT, BG2, BDR, TXT, DIM, DISP } from '../lib/constants';
import { todayStr } from '../lib/constants';
import { sendRegistrationNotification } from '../lib/email';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('yds');
  const [loggedOrg, setLoggedOrg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPw, setAdminPw] = useState({ show:false, val:'' });
  const [showDemo, setShowDemo] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const [shareEnt, setShareEnt] = useState(null);
  const [detEnt, setDetEnt] = useState(null);

  // Form state
  const [reg, setReg] = useState({ type:'simulator', fullName:'', position:'', courseName:'', location:'', country:'', email:'', pw:'', logo:'', simulator:'' });
  const [lgn, setLgn] = useState({ email:'', pw:'' });
  const [form, setForm] = useState({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), tournament:'', gender:'male' });

  // Leaderboard filter state
  const [week, setWeek] = useState(null);
  const [allTime, setAllTime] = useState(false);
  const [fCountry, setFCountry] = useState('');
  const [fHcp, setFHcp] = useState('');
  const [fAge, setFAge] = useState('');
  const [fClub, setFClub] = useState('');
  const [fPlayer, setFPlayer] = useState('');
  const [fGender, setFGender] = useState('');
  const [sortBy, setSortBy] = useState('dist');

  useEffect(() => {
    initData().then(({ orgs, entries }) => {
      setOrgs(orgs);
      setEntries(entries);
      setLoading(false);
    });
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('rb_admin_auth') === '1') setShowAdmin(true);
      if (!sessionStorage.getItem('rb_launch_seen')) {
        setTimeout(() => setShowLaunch(true), 10000);
      }
    }
  }, []);

  const toast = msg => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3200); };
  const cvt = d => unit === 'm' ? Math.round(d * 0.9144) : d;
  const unitLbl = unit === 'm' ? 'm' : 'yds';
  const approvedOrgs = orgs.filter(o => o.status === 'approved');
  const orgFor = id => orgs.find(o => o.id === id);
  const pendingCount = orgs.filter(o => o.status === 'pending').length;

  async function doRegister() {
    const isSimulator = reg.type === 'simulator';

    // Validation
    if (!reg.fullName || !reg.email || !reg.pw) { toast('Fill all required fields'); return; }
    if (isSimulator && !reg.simulator) { toast('Please select your simulator brand'); return; }
    if (!isSimulator && (!reg.position || !reg.courseName || !reg.location || !reg.country)) { toast('Fill all required fields'); return; }
    if (orgs.find(o => o.email === reg.email)) { toast('Email already registered'); return; }

    const newOrg = {
      id: Date.now().toString(),
      fullName: reg.fullName,
      position: isSimulator ? 'Individual / Simulator' : reg.position,
      courseName: isSimulator ? `${reg.simulator} — ${reg.fullName}` : reg.courseName,
      location: reg.location || '',
      country: reg.country || '',
      email: reg.email,
      pw: reg.pw,
      logo: reg.logo || '',
      status: isSimulator ? 'approved' : 'pending',
      badge: isSimulator ? 'simulator' : null,
      accountType: reg.type,
      simulator: reg.simulator || '',
    };

    const ok = await db.insertOrg(newOrg);
    if (!ok) { toast('Registration failed — please try again'); return; }

    setOrgs(prev => [...prev, newOrg]);
    await sendRegistrationNotification(newOrg);
    setReg({ type:'simulator', fullName:'', position:'', courseName:'', location:'', country:'', email:'', pw:'', logo:'', simulator:'' });

    if (isSimulator) {
      setLoggedOrg(newOrg);
      toast('Account created! You can now submit simulator drives.');
      router.push('/submit?welcome=1');
    } else {
      toast('Registration submitted — awaiting admin approval');
      router.push('/');
    }
  }

  async function doLogin() {
    // Search loaded orgs state first (already fetched from Supabase)
    let org = orgs.find(o => o.email === lgn.email && o.pw === lgn.pw);

    // If not found in state, query Supabase directly (handles edge case of stale state)
    if (!org) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        const { data } = await supabase
          .from('clubs')
          .select('*')
          .eq('email', lgn.email)
          .eq('pw', lgn.pw)
          .single();
        org = data;
      } catch {}
    }

    if (!org) { toast('Invalid credentials'); return; }
    if (org.status === 'pending') { toast('Awaiting admin approval'); return; }
    if (org.status !== 'approved') { toast('Account not active'); return; }

    setLoggedOrg(org);
    setLgn({ email:'', pw:'' });
    toast(`Welcome, ${org.fullName}!`);
    router.push('/submit');
  }

  async function doSubmit() {
    if (!loggedOrg) { toast('Not logged in'); return false; }
    if (!form.player || !form.dist || !form.club || !form.hcp || !form.age) { toast('Fill all required fields'); return false; }
    if (!form.photo) { toast('Photo evidence required'); return false; }

    const e = {
      id: Date.now().toString(),
      orgId: loggedOrg.id,
      player: form.player,
      dist: Number(form.dist),
      club: form.club,
      hcp: Number(form.hcp),
      age: Number(form.age),
      photo: form.photo,
      date: form.date,
      tournament: form.tournament,
      gender: form.gender,
    };

    const ok = await db.insertEntry(e);
    if (!ok) { toast('Submission failed — please try again'); return false; }

    const updatedEntries = [...entries, e];
    setEntries(updatedEntries);

    // Rank within gender category (male/female), by distance desc
    const sameGender = updatedEntries
      .filter(x => x.gender === e.gender)
      .sort((a, b) => b.dist - a.dist);
    const rank = sameGender.findIndex(x => x.id === e.id) + 1;
    const total = sameGender.length;

    setForm({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), tournament:'', gender:'male' });
    toast('Drive submitted to the World Registry!');
    return { ok: true, rank, total, gender: e.gender };
  }

  async function updateProfileConsent(orgId, consent) {
    const ok = await db.updateOrg(orgId, { profileConsent: consent });
    if (!ok) { toast('Could not save preference — please try again'); return false; }
    setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, profileConsent: consent } : o));
    setLoggedOrg(prev => prev && prev.id === orgId ? { ...prev, profileConsent: consent } : prev);
    if (consent) toast('Profile page created!');
    return true;
  }

  const sharedProps = {
    orgs, setOrgs, entries, setEntries, unit, setUnit, cvt, unitLbl,
    approvedOrgs, orgFor, pendingCount, loggedOrg, setLoggedOrg,
    toast, shareEnt, setShareEnt, detEnt, setDetEnt,
    reg, setReg, lgn, setLgn, form, setForm,
    doRegister, doLogin, doSubmit, updateProfileConsent,
    week, setWeek, allTime, setAllTime,
    fCountry, setFCountry, fHcp, setFHcp, fAge, setFAge,
    fClub, setFClub, fPlayer, setFPlayer, fGender, setFGender,
    sortBy, setSortBy,
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:SANS, color:MUT, fontSize:13, letterSpacing:2 }}>LOADING...</div>
    </div>
  );

  if (showAdmin) return (
    <AdminPanel orgs={orgs} entries={entries} setOrgs={setOrgs} setEntries={setEntries}
      toast={toast} cvt={cvt} unitLbl={unitLbl}
      onClose={() => { setShowAdmin(false); localStorage.removeItem('rb_admin_auth'); }}/>
  );

  return (
    <>
      <Layout loggedOrg={loggedOrg} onLogout={()=>setLoggedOrg(null)} unit={unit} setUnit={setUnit}
        onAdminClick={()=>setAdminPw({show:true,val:''})} pendingCount={pendingCount} onShowDemo={()=>setShowDemo(true)}>
        <Component {...pageProps} {...sharedProps}/>
      </Layout>

      {/* Admin password modal */}
      {adminPw.show && (
        <div onClick={()=>setAdminPw({show:false,val:''})} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:700,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(4px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:BG2,border:`1px solid rgba(255,255,255,0.1)`,width:'100%',maxWidth:400,padding:30,position:'relative'}}>
            <button onClick={()=>setAdminPw({show:false,val:''})} style={{position:'absolute',top:14,right:16,background:'none',border:'none',color:MUT,fontSize:20,cursor:'pointer'}}>✕</button>
            <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:1,marginBottom:20}}>Admin Access</div>
            <input type="password" value={adminPw.val} onChange={e=>setAdminPw({...adminPw,val:e.target.value})} placeholder="Enter admin password"
              style={{width:'100%',background:'#2e2e2e',border:`1px solid ${BDR}`,padding:'10px 14px',color:TXT,fontFamily:SANS,fontSize:14,outline:'none',marginBottom:14,boxSizing:'border-box'}}
              onKeyDown={e=>{if(e.key==='Enter'){if(adminPw.val===ADMIN_PW){setShowAdmin(true);localStorage.setItem('rb_admin_auth','1');setAdminPw({show:false,val:''});}else{toast('Incorrect password');}}}}/>
            <button onClick={()=>{if(adminPw.val===ADMIN_PW){setShowAdmin(true);localStorage.setItem('rb_admin_auth','1');setAdminPw({show:false,val:''});}else{toast('Incorrect password');}}}
              style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:'10px 22px',cursor:'pointer',width:'100%'}}>
              Enter Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Demo */}
      {showDemo && <DemoSubmit onClose={()=>setShowDemo(false)} cvt={cvt} unitLbl={unitLbl} toast={toast}/>}

      {/* Launch modal — hidden */}
      {/* {showLaunch && <LaunchModal onClose={()=>{setShowLaunch(false);sessionStorage.setItem('rb_launch_seen','1');}}/>} */}

      {/* Toast */}
      {toastMsg && (
        <div style={{position:'fixed',bottom:22,right:22,zIndex:9999,background:'#2e2e2e',border:`1px solid ${ORG}`,padding:'12px 20px',fontFamily:SANS,fontSize:12,color:ORG,boxShadow:'0 8px 30px rgba(0,0,0,0.12)'}}>
          ✓ {toastMsg}
          <span style={{marginLeft:12,cursor:'pointer',opacity:.6}} onClick={()=>setToastMsg(null)}>✕</span>
        </div>
      )}

      <Analytics />
    </>
  );
}
