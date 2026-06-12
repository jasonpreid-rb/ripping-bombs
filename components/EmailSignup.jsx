import { useState } from 'react';
import { ORG, MUT, DIM, SANS, DISP } from '../lib/constants';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSignup() {
    if (!email||!email.includes('@')) { setStatus('invalid'); return; }
    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          subject: `New Weekly Digest Subscriber: ${email}`,
          message: `Email: ${email}\n\nAdd them to your mailing list.`,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{background:'#0e0e0e',margin:'0',padding:'52px 18px'}}>
      <div style={{maxWidth:560,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:14}}>Weekly Digest</div>
        <div style={{fontFamily:DISP,fontSize:'clamp(24px,5vw,38px)',color:'#fff',letterSpacing:1,marginBottom:12,lineHeight:1.1}}>GET THE WEEK'S BIGGEST HITS IN YOUR INBOX</div>
        <div style={{fontFamily:SANS,fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:28,lineHeight:1.7}}>Every week we'll send you the longest verified competition drives from clubs and events around the world.</div>
        {status==='success'
          ?<div style={{background:'rgba(163,230,53,0.1)',border:'1px solid rgba(163,230,53,0.3)',padding:'16px 24px',fontFamily:SANS,fontSize:14,color:ORG,fontWeight:600}}>✓ You're in!</div>
          :<div style={{display:'flex',gap:0,maxWidth:440,margin:'0 auto',flexWrap:'wrap'}}>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setStatus(null);}} onKeyDown={e=>e.key==='Enter'&&handleSignup()} placeholder="Enter your email address"
              style={{flex:1,minWidth:200,background:'#1a1a1a',border:`1px solid ${status==='invalid'?'#f87171':'rgba(255,255,255,0.15)'}`,borderRight:'none',padding:'13px 16px',color:'#fff',fontFamily:SANS,fontSize:14,outline:'none'}}/>
            <button onClick={handleSignup} disabled={status==='sending'} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:'13px 24px',cursor:'pointer',letterSpacing:.5,opacity:status==='sending'?.6:1}}>
              {status==='sending'?'SENDING...':'SUBSCRIBE →'}
            </button>
          </div>}
        {status==='invalid'&&<div style={{fontFamily:SANS,fontSize:11,color:'#f87171',marginTop:8}}>Please enter a valid email address</div>}
        <div style={{fontFamily:SANS,fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:14}}>No spam, ever.</div>
      </div>
    </div>
  );
}
