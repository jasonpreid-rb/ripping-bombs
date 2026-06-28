import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export default function ContactPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name:'', email:'', type:'general', message:'' });
  const [status, setStatus] = useState(null);

  async function handleSubmit() {
    if (!form.name||!form.email||!form.message) { setStatus('invalid'); return; }
    setStatus('sending');
    const typeLabel = { general:'General Enquiry', partnership:'Partnership / Sponsorship', press:'Press Enquiry', club:'Club Registration Query' }[form.type]||'Enquiry';
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          subject: `${typeLabel}: ${form.name}`,
          message: `Type: ${typeLabel}\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name:'', email:'', type:'general', message:'' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const inp = (val, onChange, placeholder, type='text') => (
    <input type={type} value={val} onChange={onChange} placeholder={placeholder}
      style={{ width:'100%', background:BG2, border:`1px solid ${BDR}`, padding:'11px 14px', color:TXT, fontFamily:SANS, fontSize:14, outline:'none', boxSizing:'border-box' }}
      onFocus={e=>e.target.style.borderColor=ORG} onBlur={e=>e.target.style.borderColor=BDR}/>
  );

  return (
    <>
      <Head>
        <title>Contact Us | Ripping Bombs</title>
        <meta name="description" content="Get in touch with the Ripping Bombs team. Contact us for general enquiries, partnerships, sponsorships or press."/>
      </Head>
      <div style={{ padding: isMobile ? '24px 16px 60px' : '28px 18px 80px', maxWidth:1000, margin:'0 auto' }}>
        <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>Get In Touch</div>
        <h1 style={{ fontFamily:DISP, fontSize:'clamp(28px,5vw,48px)', color:TXT, letterSpacing:1, marginBottom:12, lineHeight:1.1 }}>Contact Ripping Bombs</h1>
        <p style={{ fontFamily:SANS, fontSize:14, color:MUT, lineHeight:1.85, marginBottom: isMobile ? 28 : 40, maxWidth:580 }}>
          Whether you're a golf club looking to register, a brand interested in partnership opportunities, or a journalist covering the launch — we'd love to hear from you.
        </p>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 36 : 40, alignItems:'start' }}>
          {/* Form */}
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:20 }}>SEND A MESSAGE</div>
            {status==='success'
              ? <div style={{ background:'rgba(163,230,53,0.1)', border:'1px solid rgba(163,230,53,0.3)', padding:'20px 24px', fontFamily:SANS, fontSize:14, color:ORG, fontWeight:600 }}>✓ Message sent! We'll be in touch shortly.</div>
              : <>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Enquiry Type</label>
                    <div style={{ position:'relative' }}>
                      <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                        style={{ width:'100%', background:BG2, border:`1px solid ${BDR}`, padding:'11px 36px 11px 14px', color:TXT, fontFamily:SANS, fontSize:14, outline:'none', appearance:'none', boxSizing:'border-box' }}>
                        <option value="general">General Enquiry</option>
                        <option value="partnership">Partnership / Sponsorship</option>
                        <option value="press">Press Enquiry</option>
                        <option value="club">Club Registration Query</option>
                      </select>
                      <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:DIM, fontSize:10 }}>▾</span>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Your Name <span style={{ color:ORG }}>*</span></label>
                    {inp(form.name, e=>setForm({...form,name:e.target.value}), 'Full name')}
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Email Address <span style={{ color:ORG }}>*</span></label>
                    {inp(form.email, e=>setForm({...form,email:e.target.value}), 'your@email.com', 'email')}
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontFamily:SANS, fontSize:11, fontWeight:600, color:MUT, marginBottom:5, textTransform:'uppercase', letterSpacing:.8 }}>Message <span style={{ color:ORG }}>*</span></label>
                    <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your message..." rows={5}
                      style={{ width:'100%', background:BG2, border:`1px solid ${BDR}`, padding:'11px 14px', color:TXT, fontFamily:SANS, fontSize:14, outline:'none', resize:'none', boxSizing:'border-box' }}
                      onFocus={e=>e.target.style.borderColor=ORG} onBlur={e=>e.target.style.borderColor=BDR}/>
                  </div>
                  {status==='invalid'&&<div style={{ fontFamily:SANS, fontSize:11, color:'#f87171', marginBottom:10 }}>Please fill in all required fields</div>}
                  {status==='error'&&<div style={{ fontFamily:SANS, fontSize:11, color:'#f87171', marginBottom:10 }}>Something went wrong — please email team@rippingbombs.com</div>}
                  <button onClick={handleSubmit} disabled={status==='sending'}
                    style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'13px 32px', cursor:'pointer', letterSpacing:.5, opacity:status==='sending'?.6:1, width: isMobile ? '100%' : 'auto' }}>
                    {status==='sending'?'SENDING...':'SEND MESSAGE →'}
                  </button>
                </>
            }
          </div>

          {/* Details */}
          <div>
            <div style={{ fontFamily:DISP, fontSize:22, color:TXT, letterSpacing:1, marginBottom:20 }}>OUR DETAILS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:28 }}>
              {[
                { label:'Email', value:'team@rippingbombs.com', href:'mailto:team@rippingbombs.com' },
                { label:'Instagram', value:'@rippingbombs', href:'https://www.instagram.com/rippingbombs/' },
                { label:'Facebook', value:'Ripping Bombs', href:'https://www.facebook.com/rippingbombs/' },
                { label:'Head Office', value:'Munich, Bavaria, Germany' },
              ].map(({ label, value, href })=>(
                <div key={label} style={{ borderBottom:`1px solid ${BDR}`, paddingBottom:14 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:DIM, letterSpacing:1.2, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
                  {href
                    ? <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily:SANS, fontSize:14, color:ORG, textDecoration:'none' }}>{value}</a>
                    : <div style={{ fontFamily:SANS, fontSize:14, color:TXT }}>{value}</div>
                  }
                </div>
              ))}
            </div>

            <div style={{ background:'#0e0e0e', border:'1px solid rgba(163,230,53,0.2)', padding:'20px', marginBottom:24 }}>
              <div style={{ fontFamily:DISP, fontSize:18, color:'#fff', letterSpacing:1, marginBottom:6 }}>REGISTER YOUR CLUB</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:14 }}>Free to join. Start submitting your competition results to the global leaderboard.</div>
              <button onClick={()=>router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:12, padding:'10px 20px', cursor:'pointer', letterSpacing:.5, width: isMobile ? '100%' : 'auto' }}>REGISTER FREE →</button>
            </div>

            <div style={{ border:`1px solid ${BDR}`, overflow:'hidden', height: isMobile ? 200 : 280 }}>
              <iframe title="Ripping Bombs HQ Munich"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d85464.29936539!2d11.4907!3d48.1351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479e75f9a38c5fd9%3A0x10cb84a150bedc!2sMunich%2C%20Germany!5e0!3m2!1sen!2sde!4v1234567890"
                width="100%" height={isMobile ? 200 : 280} style={{ border:0, display:'block', filter:'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>
            <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:6 }}>Munich, Bavaria, Germany — European HQ</div>
          </div>
        </div>
      </div>
    </>
  );
}
