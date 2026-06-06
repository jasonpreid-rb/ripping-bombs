import Head from 'next/head';
import { useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants';
import EmailSignup from '../components/EmailSignup';

export default function HomePage({ entries=[], orgs=[] }) {
  async function testSupabase() {
  const { data, error } = await supabase
    .from("clubs")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}
  const router = useRouter();
  const approvedOrgs = orgs.filter(o=>o.status==='approved');
  const totalYards = entries.reduce((s,e)=>s+(e.dist||0),0);
  const countries = new Set(approvedOrgs.map(o=>(o.country||''))).size;
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { val: approvedOrgs.length>0?approvedOrgs.length+'+':'14+', label:'Clubs' },
    { val: totalYards>0?Math.round(totalYards/1000)+'K':'16K', label:'Yards Measured' },
    { val: countries>0?countries+'+':'13+', label:'Countries' },
    { val: entries.length>0?entries.length+'+':'50+', label:'Golfers' },
  ];

  const faqs = [
    {q:'What is Ripping Bombs?',a:"Ripping Bombs is a global registry of verified longest drives from golf tournaments and events around the world, creating a unified leaderboard of the game's biggest hitters."},
    {q:'Why should golf courses get involved?',a:"Courses benefit by turning one of golf's most exciting moments — the longest drive — into an ongoing attraction. Run official 'Big Hitter' competitions, increase engagement, attract younger golfers, and be featured as an official Ripping Bombs location."},
    {q:'Why should tournament organisers participate?',a:'Event organisers get an always-on longest drive leaderboard, increased player engagement, shareable results for social media, additional sponsorship opportunities, and a digital footprint beyond the tournament weekend.'},
    {q:'Why is only event-based submission allowed?',a:'To maintain accuracy and fairness, all entries must be the official longest drive winner of an event or designated hole, supported by photo or scorecard evidence, and submitted by the organiser.'},
    {q:'How are drives verified?',a:'Verification may include course or event confirmation, launch monitor data, photo or scorecard evidence, and organiser validation for official events.'},
    {q:"Is this just for professionals?",a:"No. Ripping Bombs is designed for everyone who plays golf — from casual players to long drive competitors. If you've ever said 'I absolutely smoked that one,' you belong on the leaderboard."},
    {q:"What's the goal of Ripping Bombs?",a:'To create the first global benchmark for driving distance in golf — a system where the best big hitters in the world can be recognised, ranked, and compared internationally.'},
  ];


  return (
  <>
    
      <Head>
        <title>Ripping Bombs | Global Longest Golf Drive Database</title>
        <meta name="description" content="Track and compare the longest golf drives from tournaments worldwide. Ripping Bombs is the global leaderboard for longest drive competitions."/>
        <meta property="og:title" content="Ripping Bombs | Global Longest Golf Drive Database"/>
        <meta property="og:description" content="The global home of competition longest drives. Free to join, free to submit."/>
        <meta property="og:url" content="https://www.rippingbombs.com"/>
        <meta property="og:type" content="website"/>
      </Head>
      <div style={{animation:'fi .4s ease'}}>
        {/* HERO */}
        <div style={{position:'relative',overflow:'hidden'}}>
          <video autoPlay muted loop playsInline poster="https://images.pexels.com/videos/33511561/tee-shot-33511561.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
            style={{width:'100%',height:'clamp(520px,60vw,620px)',objectFit:'cover',display:'block',filter:'brightness(0.45)'}}>
            <source src="https://videos.pexels.com/video-files/33511561/14252773_2560_1440_60fps.mp4" type="video/mp4"/>
          </video>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.55))'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'clamp(60px,12vw,80px) 20px',textAlign:'center'}}>
            <div style={{fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:4,color:ORG,textTransform:'uppercase',marginBottom:16,background:'rgba(163,230,53,0.15)',border:'1px solid rgba(163,230,53,0.4)',padding:'5px 16px',display:'inline-block'}}>
              The Global Home of Competition Longest Drives
            </div>
            <h1 style={{fontFamily:DISP,fontSize:'clamp(56px,10vw,110px)',color:'#ffffff',lineHeight:.95,letterSpacing:3,marginBottom:20,textShadow:'0 4px 32px rgba(0,0,0,0.5)'}}>
  COMPETE LOCALLY.<br/>RANK GLOBALLY.
</h1>
<p style={{fontFamily:SANS,fontSize:16,color:'rgba(255,255,255,0.85)',maxWidth:520,margin:'0 auto 32px',lineHeight:1.7}}>
  Submit your longest drives from simulators, events, or qualifying locations worldwide.
</p>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 32px',borderRadius:0,cursor:'pointer',letterSpacing:.5}}>REGISTER NOW FREE →</button>
              <button onClick={()=>router.push('/leaderboard')} style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontFamily:SANS,fontWeight:600,fontSize:14,padding:'14px 28px',borderRadius:0,cursor:'pointer',letterSpacing:.5}}>View Leaderboard</button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:1,background:BDR,borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`}}>
          {stats.map(({val,label})=>(
            <div key={label} style={{background:BG2,padding:'28px 20px',textAlign:'center'}}>
              <div style={{fontFamily:DISP,fontSize:38,color:ORG,letterSpacing:1,lineHeight:1}}>{val}</div>
              <div style={{fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginTop:6,letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'0 18px'}}>
          {/* FEATURE CARDS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:60,marginTop:60}}>
            {[
              {img:'https://images.pexels.com/photos/10463463/pexels-photo-10463463.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Global Long Drive Standings',body:'Compare verified competition-winning drives with golfers from clubs and tournaments around the world.'},
              {img:'https://images.pexels.com/photos/12642295/pexels-photo-12642295.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Free Club & Tournament Registration',body:'Clubs, coaches, driving ranges, and event organisers can submit longest drive winners at no cost during launch.'},
              {img:'https://images.pexels.com/photos/6572962/pexels-photo-6572962.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Recognition for Big Hitters',body:"Give golfers a place to showcase huge drives, earn rankings, and represent their club on a global platform."},
            ].map(({img,title,body})=>(
              <div key={title} style={{background:BG2,border:`1px solid ${BDR}`,overflow:'hidden'}}>
                <div style={{height:160,overflow:'hidden'}}>
                  <img src={img} alt={title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
                <div style={{padding:'20px 22px 24px'}}>
                  <div style={{fontFamily:DISP,fontSize:21,color:TXT,letterSpacing:.5,marginBottom:8}}>{title}</div>
                  <div style={{fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.7}}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA STRIP */}
          <div style={{background:'rgba(163,230,53,0.05)',border:'1px solid rgba(163,230,53,0.2)',padding:'40px 32px',textAlign:'center',marginBottom:60}}>
            <div style={{fontFamily:DISP,fontSize:'clamp(24px,5vw,40px)',color:TXT,letterSpacing:1,marginBottom:10}}>FREE TO JOIN. FREE TO SUBMIT.</div>
            <div style={{fontFamily:SANS,fontSize:14,color:MUT,marginBottom:28}}>Built for golfers who love sending it.</div>
            <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 36px',borderRadius:0,cursor:'pointer'}}>REGISTER NOW FREE →</button>
          </div>

          {/* FAQ */}
          <div style={{marginBottom:60}}>
            <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:20}}>FAQ</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {faqs.map(({q,a},i)=>(
                <div key={i} style={{background:BG2,border:`1px solid ${openFaq===i?'rgba(163,230,53,0.25)':BDR}`,overflow:'hidden'}}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',gap:16}}>
                    <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:TXT,textAlign:'left'}}>{q}</span>
                    <span style={{fontFamily:SANS,fontSize:18,color:ORG,flexShrink:0,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span>
                  </button>
                  {openFaq===i&&<div style={{padding:'0 20px 18px',fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.75}}>{a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <EmailSignup/>
      </div>
    </>
  );
}
