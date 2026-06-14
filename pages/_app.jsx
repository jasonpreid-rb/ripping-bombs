import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Layout from '../components/Layout';
import AdminPanel from '../components/AdminPanel';
import LaunchModal from '../components/LaunchModal';
import DemoSubmit from '../components/DemoSubmit';
import { initData, db } from '../lib/data';
import { ORGS_KEY, ENT_KEY, ADMIN_PW, SANS, ORG, MUT, BG2, BDR, TXT, DIM, DISP } from '../lib/constants';
import { todayStr } from '../lib/constants';
import { sendRegistrationNotification } from '../lib/email';
import { Analytics } from '@vercel/analytics/react';

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
  const [reg, setReg] = useState({
    type: 'club',
    fullName: '',
    position: '',
    courseName: '',
    location: '',
    country: '',
    email: '',
    pw: '',
    logo: '',
    simulator: '',
    gender: 'male',
  });
  const [lgn, setLgn] = useState({ email:'', pw:'', rememberMe: false });
  const [form, setForm] = useState({
    player: '',
    dist: '',
    club: '',
    hcp: '',
    age: '',
    photo: '',
    date: todayStr(),
    tournament: '',
    gender: 'male',
  });

  // Leaderboard filter state
  const [week, setWeek] = useState(null);
  const [allTime, setAllTime] = useState(false);
  const [fCountry, setFCountry] = useState('');
  const [fHcp, setFHcp] = useState('');
  const [fAge, setFAge] = useState('');
  const [fClub, setFClub] = useState('');
  const [fPlayer, setFPlayer] = useState('');
  const [fGender, setFGender] = useState('');
  const [fSimulator, setFSimulator] = useState('');
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
      // Restore remembered session
      const stored = localStorage.getItem('rb_club');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed._expiry && Date.now() < parsed._expiry) {
            setLoggedOrg(parsed);
          } else {
            localStorage.removeItem('rb_club');
          }
        } catch {}
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
    if (!isSimulator && (!reg.position || !reg.courseName || !reg.location || !reg.country)) { toast('Fill all required fields'); return; }
    if (orgs.find(o => o.email === reg.email)) { toast('Email already registered'); return; }

    const newOrg = {
      id: Date.now().toString(),
      fullName: reg.fullName,
      position: isSimulator ? 'Individual / Simulator' : reg.position,
      courseName: isSimulator ? `${reg.simulator ? reg.simulator + ' — ' : ''}${reg.fullName}` : reg.courseName,
      location: reg.location || '',
      country: reg.country || '',
      email: reg.email,
      pw: reg.pw,
      logo: reg.logo || '',
      status: isSimulator ? 'approved' : 'pending',
      badge: isSimulator ? 'simulator' : null,
      accountType: reg.type,
      simulator: reg.simulator || '',
      gender: reg.gender || 'male',
    };

    const ok = await db.insertOrg(newOrg);
    if (!ok) { toast('Registration failed — please try again'); return; }

    setOrgs(prev => [...prev, newOrg]);
    await sendRegistrationNotification(newOrg);
    setReg({ type:'club', fullName:'', position:'', courseName:'', location:'', country:'', email:'', pw:'', logo:'', simulator:'', gender:'male' });

    if (isSimulator) {
      setLoggedOrg(newOrg);
      toast('Account created! You can now submit simulator drives.');
      router.push('/submit');
    } else {
      toast('Registration submitted — awaiting admin approval');
      router.push('/');
    }
  }

  async function doLogin() {
    let org = orgs.find(o => o.email === lgn.email && o.pw === lgn.pw);

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

    if (lgn.rememberMe) {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('rb_club', JSON.stringify({ ...org, _expiry: expiry }));
    } else {
      sessionStorage.setItem('rb_club', JSON.stringify(org));
    }

    setLgn({ email:'', pw:'', rememberMe: false });
    toast(`Welcome, ${org.fullName}!`);
    router.push('/submit');
  }

  async function doForgotPassword() {
    if (!lgn.email) { toast('Enter your email address first'); return; }

    let org = orgs.find(o => o.email === lgn.email);
    if (!org) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        const { data } = await supabase
          .from('clubs')
          .select('*')
          .eq('email', lgn.email)
          .single();
        org = data;
      } catch {}
    }

    // Always show success to avoid email enumeration
    toast('If that email is registered, we\'ve sent your password.');

    if (org) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'forgot_password', org }),
      }).catch(() => {});
    }
  }

  async function doSubmit() {
    if (!loggedOrg) { toast('Not logged in'); return; }
    if (!form.dist || !form.club || !form.hcp || !form.age) { toast('Fill all required fields'); return; }
    if (!form.photo) { toast('Photo evidence required'); return; }

    const isSimulator = loggedOrg.accountType === 'simulator';

    // For club accounts, player name is required
    if (!isSimulator && !form.player) { toast('Fill all required fields'); return; }

    const e = {
      id: Date.now().toString(),
      orgId: loggedOrg.id,
      player: isSimulator ? loggedOrg.fullName : form.player,
      dist: Number(form.dist),
      club: form.club,
      hcp: Number(form.hcp),
      age: Number(form.age),
      photo: form.photo,
      date: form.date,
      tournament: isSimulator ? 'Simulator' : form.tournament,
      gender: isSimulator ? (loggedOrg.gender || 'male') : form.gender,
      is_simulator: isSimulator,
    };

    const ok = await db.insertEntry(e);
    if (!ok) { toast('Submission failed — please try again'); return; }

    setEntries(prev => [...prev, e]);

    // Send submission confirmation email to the club/simulator account
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'submission', org: loggedOrg, entry: e }),
    }).catch(() => {}); // fire and forget — don't block the UI

    setForm({ player:'', dist:'', club:'', hcp:'', age:'', photo:'', date:todayStr(), tournament:'', gender:'male' });
    toast('Drive submitted to the World Registry!');
  }

  const sharedProps = {
    orgs, setOrgs, entries, setEntries, loading, unit, setUnit, cvt, unitLbl,
    approvedOrgs, orgFor, pendingCount, loggedOrg, setLoggedOrg,
    toast, shareEnt, setShareEnt, detEnt, setDetEnt,
    reg, setReg, lgn, setLgn, form, setForm,
    doRegister, doLogin, doForgotPassword, doSubmit,
    week, setWeek, allTime, setAllTime,
    fCountry, setFCountry, fHcp, setFHcp, fAge, setFAge,
    fClub, setFClub, fPlayer, setFPlayer, fGender, setFGender,
    fSimulator, setFSimulator,
    sortBy, setSortBy,
  };

  if (showAdmin) return (
    <AdminPanel orgs={orgs} entries={entries} setOrgs={setOrgs} setEntries={setEntries}
      toast={toast} cvt={cvt} unitLbl={unitLbl}
      onClose={() => setShowAdmin(false)}/>
  );

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5RCJDKVBER"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5RCJDKVBER');
        `}
      </Script>

      <Layout loggedOrg={loggedOrg} onLogout={()=>{ setLoggedOrg(null); localStorage.removeItem('rb_club'); sessionStorage.removeItem('rb_club'); }} unit={unit} setUnit={setUnit}
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

      {/* Launch modal */}
      {showLaunch && <LaunchModal onClose={()=>{setShowLaunch(false);sessionStorage.setItem('rb_launch_seen','1');}}/>}

      {/* Vercel Analytics */}
      <Analytics />

      {/* Toast */}
      {toastMsg && (
        <div style={{position:'fixed',bottom:22,right:22,zIndex:9999,background:'#2e2e2e',border:`1px solid ${ORG}`,padding:'12px 20px',fontFamily:SANS,fontSize:12,color:ORG,boxShadow:'0 8px 30px rgba(0,0,0,0.12)'}}>
          ✓ {toastMsg}
          <span style={{marginLeft:12,cursor:'pointer',opacity:.6}} onClick={()=>setToastMsg(null)}>✕</span>
        </div>
      )}
    </>
  );
}
