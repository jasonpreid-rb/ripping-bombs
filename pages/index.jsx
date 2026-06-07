import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BG2, BDR, DIM, SANS, DISP } from '../lib/constants';
import { fmtDate } from '../lib/constants';
import EmailSignup from '../components/EmailSignup';

const FLAG = cc => cc ? String.fromCodePoint(...[...cc.toUpperCase()].map(c=>0x1F1E6-65+c.charCodeAt(0))) : '';

export default function HomePage({ entries=[], orgs=[] }) {
  const router = useRouter();
  const approvedOrgs = orgs.filter(o=>o.status==='approved');
  const [openFaq, setOpenFaq] = useState(null);

  const orgFor = id => orgs.find(o=>o.id===id);

  const top5 = [...entries]
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .sort((a,b)=>b.dist-a.dist)
    .slice(0,5);

  const medals = ['🥇','🥈','🥉'];

  const faqs = [
    {q:'What is Ripping Bombs?',a:"Ripping Bombs is a global registry of longest drives from golf tournaments, events, and simulator sessions around the world — creating a unified leaderboard of the game's biggest hitters."},
    {q:'Who can register and submit?',a:"Anyone. Golf clubs, tournament organisers, driving ranges, and individual golfers with simulator access can all register for free and submit their longest drives to the global leaderboard."},
    {q:'Why should golf courses get involved?',a:"Courses benefit by turning one of golf's most exciting moments — the longest drive — into an ongoing attraction. Run official 'Big Hitter' competitions, increase engagement, attract younger golfers, and be featured as an official Ripping Bombs location."},
    {q:'Why should tournament organisers participate?',a:'Event organisers get an always-on longest drive leaderboard, increased player engagement, shareable results for social media, additional sponsorship opportunities, and a digital footprint beyond the tournament weekend.'},
    {q:'Can I submit simulator drives?',a:'Yes. Individual golfers can register a simulator account and submit drives recorded on a launch monitor or simulator, with a screenshot as evidence. Simulator entries are clearly badged on the leaderboard.'},
    {q:'How are drives verified?',a:'Verification depends on entry type. Club and event submissions require photo or scorecard evidence and are submitted by the organiser. Simulator submissions require a screenshot of the readout as evidence.'},
    {q:"Is this just for professionals?",a:"Not at all. Ripping Bombs is for everyone who plays golf — from casual weekend players to long drive competitors. If you've ever said 'I absolutely smoked that one,' you belong on the leaderboard."},
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

        {/* TOP 5 ALL-TIME */}
        <div style={{background:'#0e0e0e',borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`,padding:'40px 18px'}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:6}}>Live from the Registry</div>
                <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5}}>Top 5 Longest Drives All Time</div>
              </div>
              <button onClick={()=>router.push('/leaderboard')} style={{background:'transparent',border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontWeight:600,fontSize:11,padding:'8px 18px',cursor:'pointer',letterSpacing:.5,whiteSpace:'nowrap'}}>Full Leaderboard →</button>
            </div>

            {top5.length === 0 ? (
              <div style={{fontFamily:SANS,fontSize:13,color:DIM,textAlign:'center',padding:'32px 0'}}>No drives recorded yet — be the first.</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {top5.map((e,i)=>{
                  const org = orgFor(e.orgId);
                  const isSimulator = e.is_simulator === true;
                  return (
                    <div key={e.id} onClick={()=>router.push('/leaderboard')}
                      style={{background:i===0?'linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))':BG2,border:`1px solid ${i===0?'rgba(163,230,53,0.3)':BDR}`,padding:'16px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer',flexWrap:'wrap'}}
                      onMouseEnter={el=>el.currentTarget.style.borderColor='rgba(163,230,53,0.3)'}
                      onMouseLeave={el=>el.currentTarget.style.borderColor=i===0?'rgba(163,230,53,0.3)':BDR}>
                      {/* Rank */}
                      <div style={{fontFamily:DISP,fontSize:22,width:36,flexShrink:0,textAlign:'center'}}>
                        {medals[i]||<span style={{fontFamily:SANS,fontSize:13,color:DIM}}>#{i+1}</span>}
                      </div>
                      {/* Player + org */}
                      <div style={{flex:1,minWidth:140}}>
                        <div style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>
                          {e.player}
                          {org?.country&&<span style={{marginLeft:6}}>{FLAG(org.country)}</span>}
                        </div>
                        <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:2}}>
                          {isSimulator
                            ? <span style={{color:'rgba(163,230,53,0.6)'}}>🖥️ Simulator</span>
                            : org?.courseName||'—'}
                          {e.club&&<span style={{marginLeft:8,color:DIM}}>· {e.club}</span>}
                        </div>
                      </div>
                      {/* Distance */}
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:DISP,fontSize:32,color:ORG,letterSpacing:1,lineHeight:1}}>{e.dist}</div>
                        <div style={{fontFamily:SANS,fontSize:10,color:DIM,marginTop:2}}>yards</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{padding:'0 18px'}}>

          {/* FEATURE CARDS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:60,marginTop:60}}>
            {[
              {img:'https://images.pexels.com/photos/10463463/pexels-photo-10463463.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Global Long Drive Standings',body:'Compare verified drives from clubs, tournaments, and simulator sessions worldwide on one unified leaderboard.'},
              {img:'https://images.pexels.com/photos/12642295/pexels-photo-12642295.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Free for Clubs, Events & Individuals',body:'Golf clubs, tournament organisers, driving ranges, and individual simulator golfers can all register and submit for free.'},
              {img:'https://images.pexels.com/photos/6572962/pexels-photo-6572962.jpeg?auto=compress&cs=tinysrgb&w=600',title:'Recognition for Big Hitters',body:"Give golfers a place to showcase huge drives, earn rankings, and represent their club or themselves on a global platform."},
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
