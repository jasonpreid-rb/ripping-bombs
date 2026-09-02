import '../styles/globals.css';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';
import Layout from '../components/Layout';
import AdminPanel from '../components/AdminPanel';
import LaunchModal from '../components/LaunchModal';
import CookieConsent from '../components/CookieConsent';
import { initData, db } from '../lib/data';
import { ORGS_KEY, ENT_KEY, ADMIN_PW, SANS, ORG, MUT, BG2, BDR, TXT, DIM, DISP } from '../lib/constants';
import { todayStr } from '../lib/constants';
import { sendRegistrationNotification, sendPlayerSubmissionNotice } from '../lib/email';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const canonicalUrl = `https://www.rippingbombs.com${router.asPath.split('?')[0].split('#')[0]}`;
  const [orgs, setOrgs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('yds');
  const [loggedOrg, setLoggedOrg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPw, setAdminPw] = useState({ show:false, val:'' });
  const [showLaunch, setShowLaunch] = useState(false);
  const [shareEnt, setShareEnt] = useState(null);
  const [detEnt, setDetEnt] = useState(null);

  // Form state
  const [reg, setReg] = useState({ type:'simulator', fullName:'', position:'', courseName:'', location:'', country:'', email:'', pw:'', logo:'', simulator:'' });
  const [lgn, setLgn] = useState({ email:'', pw:'' });
  const [form, setForm] = useState({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), tournament:'', gender:'male', venueId:'', facility:'', playerEmail:'', eventId:'' });

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
      const raw = localStorage.getItem('rb_club');
      if (raw) { try { setLoggedOrg(JSON.parse(raw)); } catch {} }
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

  async function doRegister(redirectTo) {
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
      status: 'approved',
      badge: isSimulator ? 'simulator' : null,
      accountType: reg.type,
      simulator: reg.simulator || '',
    };

    const ok = await db.insertOrg(newOrg);
    if (!ok) { toast('Registration failed — please try again'); return; }

    setOrgs(prev => [...prev, newOrg]);
    await sendRegistrationNotification(newOrg);
    setReg({ type:'simulator', fullName:'', position:'', courseName:'', location:'', country:'', email:'', pw:'', logo:'', simulator:'' });

    // Every account is auto-approved now — log them straight in and send to the dashboard
    setLoggedOrg(newOrg);
    localStorage.setItem('rb_club', JSON.stringify(newOrg));
    toast(isSimulator ? 'Account created! Welcome to Ripping Bombs.' : `Welcome, ${newOrg.courseName}!`);
    router.push(redirectTo || '/dashboard');
  }

  async function doLogin(redirectTo) {
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
    localStorage.setItem('rb_club', JSON.stringify(org));
    setLgn({ email:'', pw:'' });
    toast(`Welcome, ${org.fullName}!`);
    router.push(redirectTo || '/dashboard');
  }

  async function doSubmit() {
    if (!loggedOrg) { toast('Not logged in'); return false; }
    if (!form.player || !form.dist || !form.club || !form.hcp || !form.age) { toast('Fill all required fields'); return false; }
    if (!form.photo) { toast('Photo evidence required'); return false; }

    const isSimulator = loggedOrg.accountType === 'simulator';

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
      is_simulator: isSimulator,
      venueId: form.venueId || null,
      facility: form.facility || null,
      player_email: form.playerEmail || null,
      eventId: form.eventId || null,
    };

    const ok = await db.insertEntry(e);
    if (!ok) { toast('Submission failed — please try again'); return false; }

    if (!isSimulator && e.player_email) {
      sendPlayerSubmissionNotice(e, loggedOrg);
    }

    const updatedEntries = [...entries, e];
    setEntries(updatedEntries);

    // Rank within gender category (male/female), by distance desc
    const sameGender = updatedEntries
      .filter(x => x.gender === e.gender)
      .sort((a, b) => b.dist - a.dist);
    const rank = sameGender.findIndex(x => x.id === e.id) + 1;
    const total = sameGender.length;

    setForm({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), tournament:'', gender:'male', venueId:'', facility:'', playerEmail:'', eventId:'' });
    toast('Drive submitted to the World Registry!');
    return { ok: true, rank, total, gender: e.gender };
  }

  function startImpersonation(org) {
    const impersonated = { ...org, _impersonating: true };
    setLoggedOrg(impersonated);
    localStorage.setItem('rb_club', JSON.stringify(impersonated));
    setShowAdmin(false);
    toast(`Viewing as ${org.courseName || org.fullName}`);
    router.push('/dashboard');
  }

  function stopImpersonation() {
    setLoggedOrg(null);
    localStorage.removeItem('rb_club');
    setShowAdmin(true);
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
    orgs, setOrgs, entries, setEntries, loading, unit, setUnit, cvt, unitLbl,
    approvedOrgs, orgFor, pendingCount, loggedOrg, setLoggedOrg,
    toast, shareEnt, setShareEnt, detEnt, setDetEnt,
    reg, setReg, lgn, setLgn, form, setForm,
    doRegister, doLogin, doSubmit, updateProfileConsent,
    week, setWeek, allTime, setAllTime,
    fCountry, setFCountry, fHcp, setFHcp, fAge, setFAge,
    fClub, setFClub, fPlayer, setFPlayer, fGender, setFGender,
    sortBy, setSortBy,
  };

  // Full-screen TV/kiosk pages render on their own, with no site nav,
  // banner, or footer. Add any future kiosk-style route here.
  const isKioskRoute =
    router.pathname.startsWith('/venue-display/') ||
    router.pathname === '/venue-display-demo';

  if (isKioskRoute) {
    return (
      <>
        <Head><link rel="canonical" href={canonicalUrl} /></Head>
        <Component {...pageProps} {...sharedProps} />
        <Analytics />
      </>
    );
  }

  // NOTE: we intentionally do NOT block rendering on `loading` here.
  // Pages get their own real data via getStaticProps/getServerSideProps
  // (see index.jsx's staticEntries/staticOrgs pattern) and should render
  // immediately, both for SEO (Googlebot's initial HTML must contain real
  // content, not a placeholder) and for perceived performance. `loading`,
  // `orgs`, and `entries` are still passed down via sharedProps so any
  // page that genuinely depends on the client-fetched global store (e.g.
  // admin-adjacent or auth-dependent UI) can show its own local loading
  // state instead of blanking the entire app.

  if (showAdmin) return (
    <AdminPanel orgs={orgs} entries={entries} setOrgs={setOrgs} setEntries={setEntries}
      toast={toast} cvt={cvt} unitLbl={unitLbl} onImpersonate={startImpersonation}
      onClose={() => { setShowAdmin(false); localStorage.removeItem('rb_admin_auth'); }}/>
  );

  return (
    <>
      <Head><link rel="canonical" href={canonicalUrl} /></Head>
      <Layout loggedOrg={loggedOrg} onLogout={()=>{ setLoggedOrg(null); localStorage.removeItem('rb_club'); router.push('/'); }} unit={unit} setUnit={setUnit}
        onAdminClick={()=>setAdminPw({show:true,val:''})} pendingCount={pendingCount} onExitImpersonation={stopImpersonation}>
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

      {/* Launch modal — hidden */}
      {/* {showLaunch && <LaunchModal onClose={()=>{setShowLaunch(false);sessionStorage.setItem('rb_launch_seen','1');}}/>} */}

      {/* Toast */}
      {toastMsg && (
        <div style={{position:'fixed',bottom:22,right:22,zIndex:9999,background:'#2e2e2e',border:`1px solid ${ORG}`,padding:'12px 20px',fontFamily:SANS,fontSize:12,color:ORG,boxShadow:'0 8px 30px rgba(0,0,0,0.12)'}}>
          ✓ {toastMsg}
          <span style={{marginLeft:12,cursor:'pointer',opacity:.6}} onClick={()=>setToastMsg(null)}>✕</span>
        </div>
      )}

      <CookieConsent />
      <Analytics />
    </>
  );
}
