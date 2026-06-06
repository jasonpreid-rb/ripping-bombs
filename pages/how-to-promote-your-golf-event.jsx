import { useState } from 'react';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { EJS_TEMPLATE_CONTACT } from '../lib/constants';
import { sendEmail } from '../lib/email';

export default function Page() {
  const [form,setForm]=useState({name:'',email:'',event:'',location:'',date:''});
  const [status,setStatus]=useState(null);
  async function submit(){
    if(!form.name||!form.email||!form.event){setStatus('invalid');return;}
    setStatus('sending');
    const ok=await sendEmail(`Event Registration Request: ${form.event}`,`A golfer has requested an event be added to Ripping Bombs:\n\nEvent: ${form.event}\nLocation: ${form.location||'—'}\nDate: ${form.date||'—'}\nSubmitted by: ${form.name}\nEmail: ${form.email}\n\nContact the organiser and invite them to register at https://www.rippingbombs.com`,EJS_TEMPLATE_CONTACT);
    setStatus(ok?'success':'error');
  }
  return (
    <SeoPage title="How To Promote Your Golf Event | Ripping Bombs" description="Learn how to promote your golf event and give it global exposure. Ripping Bombs connects golf events with players worldwide through verified longest drive leaderboards.">
      <SeoH1>How To Promote Your Golf Event</SeoH1>
      <SeoP>Running a golf event is one thing — getting the right players to hear about it, and giving participants something to remember and share, is another. Here's how forward-thinking tournament organisers and golf clubs are using Ripping Bombs to give their events a global audience.</SeoP>
      <SeoH2>Why Add Your Event To Ripping Bombs?</SeoH2>
      <SeoTable headers={['Benefit','What It Means For Your Event']} rows={[['Global Leaderboard Exposure','Your event\'s longest drive appears on a worldwide leaderboard seen by golfers in 50+ countries'],['Dedicated Event Page','A permanent URL for your event — shareable on social media, WhatsApp, and email'],['Google Indexed','Your event page is indexed by Google so players searching for events in your area can find you'],['Player Engagement','Participants can share their result directly from the leaderboard, extending your event\'s reach organically'],['Sponsorship Appeal','A verified, data-rich longest drive leaderboard adds value for distance-related sponsors'],['It\'s Free','No cost to register. No cost to submit results. Free for clubs and organisers during launch.']]}/>
      <SeoCTA/>
      <div style={{background:BG2,border:`1px solid ${BDR}`,padding:'32px 28px',marginTop:8}}>
        <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:1,marginBottom:6}}>Request An Event</div>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>Know of a golf event or club that should be on Ripping Bombs? Tell us about it and we'll contact the organisers directly.</div>
        {status==='success'
          ?<div style={{background:'rgba(163,230,53,0.1)',border:'1px solid rgba(163,230,53,0.3)',padding:16,fontFamily:SANS,fontSize:13,color:ORG}}>✓ Request received! We'll reach out to the event organisers.</div>
          :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[['Your Name *','name','Your full name'],['Your Email *','email','your@email.com'],['Event / Club Name *','event','e.g. Wentworth Charity Classic'],['Location','location','City, Country'],['Event Date','date','']].map(([label,key,placeholder])=>(
              <div key={key} style={{gridColumn:key==='event'?'1/-1':'auto'}}>
                <label style={{display:'block',fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:'uppercase',letterSpacing:.8}}>{label}</label>
                <input type={key==='date'?'date':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                  style={{width:'100%',background:BG3,border:`1px solid ${BDR}`,padding:'10px 14px',color:TXT,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            {status==='invalid'&&<div style={{gridColumn:'1/-1',fontFamily:SANS,fontSize:11,color:'#f87171'}}>Please fill in all required fields</div>}
            <div style={{gridColumn:'1/-1'}}>
              <button onClick={submit} disabled={status==='sending'} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:'11px 28px',cursor:'pointer',letterSpacing:.5,opacity:status==='sending'?.6:1}}>
                {status==='sending'?'SENDING...':'SUBMIT REQUEST →'}
              </button>
            </div>
          </div>
        }
      </div>
    </SeoPage>
  );
}
