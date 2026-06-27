import { useState } from 'react';
import { useRouter } from 'next/router';
import { RBLogoWhite } from './Logo';
import { ORG, MUT, BDR, DIM, SANS, DISP } from '../lib/constants';

// "Compatible with" marquee — brand logos live in /public/logos/.
// If a logo file is missing or fails to load, falls back to the brand name as text.
const SIM_BRANDS = [
  { name: 'Trackman', logo: '/logos/trackman.svg' },
  { name: 'Garmin Approach', logo: '/logos/garmin.svg' },
  { name: 'GCQuad', logo: '/logos/foresight-sports.svg' },
  { name: 'Full Swing', logo: '/logos/full-swing.svg' },
  { name: 'SkyTrak', logo: '/logos/skytrak.svg' },
];

function MarqueeLogo({ name, logo }) {
  const [failed, setFailed] = useState(false);
  const showLogo = logo && !failed;
  return (
    <div className="brand-chip" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 34, minWidth: 112, padding: '0 18px', border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.02)', transition: 'border-color .2s, background .2s', flexShrink: 0 }}>
      {showLogo ? (
        <div style={{ height: 22, width: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img
            className="brand-logo"
            src={logo}
            alt={name}
            width={76}
            height={22}
            onError={() => setFailed(true)}
            style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0) invert(1)', opacity: 0.55, transition: 'opacity .2s, filter .2s' }}
          />
        </div>
      ) : (
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{name}</span>
      )}
    </div>
  );
}

// Mirrors nameToSlug() in pages/profile/[slug].jsx — keep in sync
function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function Layout({ children, loggedOrg, onLogout, unit, setUnit, onAdminClick, pendingCount, onShowDemo }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isM = unit === 'm';
  const isActive = path => router.pathname === path;
  const navTo = path => { router.push(path); setMenuOpen(false); };

  const NavBtn = ({ href, label }) => (
    <button onClick={() => navTo(href)} style={{ background: isActive(href) ? ORG : 'transparent', border: isActive(href) ? 'none' : '1px solid rgba(255,255,255,0.15)', color: isActive(href) ? '#111' : 'rgba(255,255,255,0.7)', fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '7px 16px', borderRadius: 0, cursor: 'pointer', letterSpacing: .3 }}>{label}</button>
  );

  const UnitToggle = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span onClick={() => setUnit('yds')} style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: isM ? 'rgba(255,255,255,0.4)' : '#fff', userSelect: 'none' }}>yds</span>
      <div onClick={() => setUnit(isM ? 'yds' : 'm')} style={{ width: 42, height: 24, borderRadius: 12, background: isM ? ORG : 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: isM ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .22s' }}/>
      </div>
      <span onClick={() => setUnit('m')} style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: isM ? '#fff' : 'rgba(255,255,255,0.4)', userSelect: 'none' }}>m</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#f0f0f0', fontFamily: SANS }}>

      {/* Announcement Banner — hidden on mobile via .promo-banner CSS rule */}
      {!bannerDismissed && (
        <div className="promo-banner" style={{ background: ORG, padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 101 }}>
          <div onClick={() => router.push('/register')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: .5, textTransform: 'uppercase' }}>
              Submit Your Drive — Rank Globally, Instantly — FREE
            </span>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: '#000', textDecoration: 'underline' }}>Register now</span>
          </div>
          <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>✕</button>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        .desktop-nav{display:flex}
        .bottom-tabbar{display:none}
        @media(max-width:680px){
          .desktop-nav{display:none!important}
          .promo-banner{display:none!important}
          .site-header{padding:10px 14px!important}
          main{padding-bottom:calc(64px + env(safe-area-inset-bottom))!important}
          .bottom-tabbar{
            display:flex!important;
            position:fixed;left:0;right:0;bottom:0;z-index:200;
            background:rgba(14,14,14,0.98);
            border-top:1px solid rgba(255,255,255,0.08);
            backdrop-filter:blur(16px);
            padding:6px 6px calc(6px + env(safe-area-inset-bottom));
            justify-content:space-between;
            align-items:flex-end;
          }
        }
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .brand-row:hover .brand-logo{opacity:1;filter:grayscale(1) brightness(0) invert(1);}
        .brand-row:hover .brand-chip{border-color:rgba(255,0,144,0.25);background:rgba(255,0,144,0.04);}
      `}</style>

      {/* HEADER */}
      <div className="site-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(14,14,14,0.97)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', padding: '14px 22px' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navTo('/')}><RBLogoWhite height={30}/></div>
        <div className="desktop-nav" style={{ gap: 10, alignItems: 'center' }}>
          <UnitToggle/>
          <NavBtn href="/leaderboard" label="Leaderboard"/>
          <NavBtn href="/hall-of-fame" label="Hall of Fame"/>
          <NavBtn href="/contact" label="Contact"/>
          <button onClick={onShowDemo} style={{ background: 'transparent', border: '1px solid rgba(255,0,144,0.4)', color: ORG, fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '7px 14px', borderRadius: 0, cursor: 'pointer' }}>Try Demo</button>
          {loggedOrg
            ? <><NavBtn href="/dashboard" label="Dashboard"/><NavBtn href="/submit" label="Submit Drive"/><button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(220,80,80,0.3)', color: '#f87171', fontFamily: SANS, fontWeight: 600, fontSize: 12, padding: '7px 14px', cursor: 'pointer', borderRadius: 0 }}>Log Out</button></>
            : <><NavBtn href="/login" label="Login"/><button onClick={() => navTo('/register')} style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: '7px 16px', borderRadius: 0, cursor: 'pointer' }}>Register</button></>
          }
          <button onClick={onAdminClick} style={{ position: 'relative', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, color: 'rgba(255,255,255,0.5)', fontSize: 14, padding: '6px 10px', cursor: 'pointer' }}>
            ⚙{pendingCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 9, height: 9, background: ORG, borderRadius: '50%', display: 'block' }}/>}
          </button>
        </div>
      </div>

      <style>{`
        .more-panel{top:58px}
        @media(max-width:680px){.more-panel{top:50px}}
      `}</style>

      {menuOpen && (
        <div className="more-panel" style={{ position: 'fixed', left: 0, right: 0, background: 'rgba(14,14,14,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 99, padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideDown .2s ease' }}>
          {[['Leaderboard','/leaderboard'],['Hall of Fame','/hall-of-fame'],['Contact','/contact'],['Login','/login'],['Register','/register']].map(([label,href]) => (
            <button key={href} onClick={() => navTo(href)} style={{ background: isActive(href) ? ORG : 'transparent', border: isActive(href) ? 'none' : '1px solid rgba(255,255,255,0.12)', color: isActive(href) ? '#111' : 'rgba(255,255,255,0.8)', fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 0, cursor: 'pointer', textAlign: 'left' }}>{label}</button>
          ))}
          <button onClick={() => { onShowDemo(); setMenuOpen(false); }} style={{ background: 'transparent', border: '1px solid rgba(255,0,144,0.4)', color: ORG, fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 0, cursor: 'pointer', textAlign: 'left' }}>Try Demo</button>
          {loggedOrg && <>
            <button onClick={() => navTo('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 0, cursor: 'pointer', textAlign: 'left' }}>Dashboard</button>
            <button onClick={() => navTo('/submit')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 0, cursor: 'pointer', textAlign: 'left' }}>Submit Drive</button>
            <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: 'none', border: '1px solid rgba(220,80,80,0.3)', color: '#f87171', fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', borderRadius: 0 }}>Log Out</button>
          </>}
        </div>
      )}

      <main>{children}</main>

      {/* Bottom tab bar — mobile only, app-style nav */}
      <div className="bottom-tabbar">
        {[
          { href: '/', label: 'Home', icon: '⌂' },
          { href: '/leaderboard', label: 'Ranks', icon: '☰' },
        ].map(t => (
          <button key={t.href} onClick={() => navTo(t.href)} style={{ flex: 1, background: 'none', border: 'none', color: isActive(t.href) ? ORG : 'rgba(255,255,255,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0 2px', cursor: 'pointer' }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}

        {/* Center raised submit button */}
        <button onClick={() => navTo('/submit')} style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', top: -16, background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ width: 50, height: 50, borderRadius: '50%', background: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#111', boxShadow: '0 4px 16px rgba(255,0,144,0.45)', border: '3px solid #1a1a1a' }}>＋</span>
        </button>

        <button onClick={() => navTo(loggedOrg ? '/dashboard' : '/login')} style={{ flex: 1, background: 'none', border: 'none', color: isActive('/dashboard') ? ORG : 'rgba(255,255,255,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0 2px', cursor: 'pointer' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>☻</span>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600 }}>{loggedOrg ? 'Dashboard' : 'Login'}</span>
        </button>

        <button onClick={() => setMenuOpen(m => !m)} style={{ flex: 1, background: 'none', border: 'none', color: menuOpen ? ORG : 'rgba(255,255,255,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0 2px', cursor: 'pointer' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>⋯</span>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600 }}>More</span>
        </button>
      </div>

      <div style={{ background:'#0e0e0e', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'18px 16px' }}>
        <div onClick={() => navTo('/supported-simulators')} style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.18)', textTransform:'uppercase', textAlign:'center', marginBottom:12, cursor:'pointer' }}>Compatible with →</div>
        <div className="brand-row" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10 }}>
          {SIM_BRANDS.map((brand, i) => (
            <MarqueeLogo key={i} name={brand.name} logo={brand.logo}/>
          ))}
        </div>
      </div>
      <SiteFooter/>
    </div>
  );
}

function SiteFooter() {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  async function sendEnquiry() {
    if (!enquiry.name||!enquiry.email||!enquiry.message) return;
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          subject: `Ripping Bombs Enquiry from ${enquiry.name}`,
          message: `Name: ${enquiry.name}\nEmail: ${enquiry.email}\n\nMessage:\n${enquiry.message}`,
        }),
      });
      setSent(res.ok ? 'success' : 'error');
      if (res.ok) setEnquiry({ name: '', email: '', message: '' });
    } catch {
      setSent('error');
    }
    setTimeout(() => setSent(false), 5000);
  }

  const inp = (val, onChange, placeholder, type='text', multi=false) => {
    const s = { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', padding:'9px 12px', color:'#fff', fontFamily:SANS, fontSize:13, outline:'none', resize:'none', boxSizing:'border-box' };
    return multi ? <textarea value={val} onChange={onChange} placeholder={placeholder} rows={3} style={s}/> : <input type={type} value={val} onChange={onChange} placeholder={placeholder} style={s}/>;
  };

  return (
    <footer style={{ background: '#0e0e0e', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 60 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '52px 18px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 36, marginBottom: 40 }}>
          <div>
            <RBLogoWhite height={32}/>
            <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 14, marginBottom: 20, lineHeight: 1.7 }}>The global home of competition longest drives. Free to join, free to submit.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Leaderboard','/leaderboard'],['Clubs & Events','/clubs'],['Register','/register'],['Login','/login'],['Contact Us','/contact']].map(([l,h]) => (
                <span key={h} onClick={() => router.push(h)} style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }} onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.55)'}>{l}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: DIM, marginBottom: 12, textTransform: 'uppercase' }}>Leaderboards</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['Global Leaderboard','/leaderboard'],['Hall of Fame','/hall-of-fame'],["Longest Men's Drives",'/longest-mens-drive'],["Longest Women's Drives",'/longest-womens-drive'],['Low Handicap','/longest-drive-low-handicap'],['Mid Handicap','/longest-drive-mid-handicap'],['High Handicap','/longest-drive-high-handicap'],['Seniors (55+)','/longest-drive-seniors'],['Juniors (U12)','/longest-drive-juniors-u12'],['Youth (13-16)','/longest-drive-juniors-13-16'],['Cadets (17-18)','/longest-drive-juniors-17-18']].map(([l,h]) => (
                <a key={h} href={h} style={{ display: 'block', fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: DIM, marginBottom: 12, textTransform: 'uppercase' }}>Golf Guides</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 20 }}>
              {[['Avg Distance By Handicap','/average-driver-distance-by-handicap'],['Longest Drives This Week','/longest-drives-this-week'],['How To Hit Farther','/how-to-hit-a-golf-ball-farther'],['Average Drive Distance','/average-golf-drive-distance'],['Longest Drive Ever','/longest-golf-drive-ever'],['What Is A Good Drive?','/what-is-a-good-drive-in-golf'],['Club Competition Ideas','/golf-club-longest-drive-competition-ideas'],['Long Drive Equipment','/long-drive-golf-equipment'],['Handicap & Distance','/golf-handicap-driving-distance'],['Promote Your Event','/how-to-promote-your-golf-event'],['Supported Simulators','/supported-simulators']].map(([l,h]) => (
                <a key={h} href={h} style={{ display: 'block', fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>{l}</a>
              ))}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: DIM, marginBottom: 10, textTransform: 'uppercase' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/rippingbombs/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', padding: '9px 14px', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: '#fff' }}>Instagram</span>
              </a>
              <a href="https://www.facebook.com/rippingbombs/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1877F2', padding: '9px 14px', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: '#fff' }}>Facebook</span>
              </a>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: DISP, fontSize: 18, color: '#fff', letterSpacing: 1, marginBottom: 14 }}>GET IN TOUCH</div>
            {sent === 'success'
              ? <div style={{ background: 'rgba(255,0,144,0.1)', border: '1px solid rgba(255,0,144,0.3)', padding: 16, fontFamily: SANS, fontSize: 13, color: ORG }}>✓ Message sent!</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inp(enquiry.name, e=>setEnquiry({...enquiry,name:e.target.value}), 'Your name')}
                  {inp(enquiry.email, e=>setEnquiry({...enquiry,email:e.target.value}), 'Your email', 'email')}
                  {inp(enquiry.message, e=>setEnquiry({...enquiry,message:e.target.value}), 'Your message...', 'text', true)}
                  <button onClick={sendEnquiry} style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: '10px 20px', cursor: 'pointer', letterSpacing: .5 }}>Send Enquiry →</button>
                </div>
            }
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2026 rippingbombs.com · HRH Collective LTD</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>The global home of competition longest drives</div>
        </div>
      </div>
    </footer>
  );
}
