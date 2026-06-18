import { useState } from 'react'
import { useRouter } from 'next/router'
import { SeoPage } from '../components/SeoPageLayout'
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants'

const POINTS = [
  { pos: '1st',  pts: 100, medal: '🥇' },
  { pos: '2nd',  pts: 70,  medal: '🥈' },
  { pos: '3rd',  pts: 50,  medal: '🥉' },
  { pos: '4th',  pts: 40,  medal: null },
  { pos: '5th',  pts: 30,  medal: null },
  { pos: '6th',  pts: 20,  medal: null },
  { pos: '7th+', pts: 10,  medal: null },
]

const CATEGORIES = [
  { icon: '♂',  label: 'Men',                 desc: 'Age 16–54, handicap under 20' },
  { icon: '♂',  label: 'Men High Handicap',   desc: 'Age 16–54, handicap 20 and above' },
  { icon: '♀',  label: 'Women',               desc: 'Age 16–54, handicap under 20' },
  { icon: '♀',  label: 'Women High Handicap', desc: 'Age 16–54, handicap 20 and above' },
  { icon: '🌱', label: 'Youth',               desc: 'Under 16' },
  { icon: '⭐', label: 'Senior',              desc: 'Age 55 and above' },
]

const FAQS = [
  { q: 'Who can enter the 2027 Championship?', a: 'Any registered simulator user. Registration is free and instant.' },
  { q: 'When does the season start?', a: 'The official championship season begins January 2027. Pre-season submissions build your record but do not earn points.' },
  { q: 'How often can I submit?', a: 'One valid drive per week counts toward the leaderboard. Only your best recorded drive of that week is used.' },
  { q: 'How are weekly points awarded?', a: 'Rankings are calculated within each category weekly: 1st = 100, 2nd = 70, 3rd = 50, 4th = 40, 5th = 30, 6th = 20, 7th+ = 10 points.' },
  { q: 'What counts as a valid drive?', a: 'A single driver shot recorded on an approved launch monitor or simulator with visible carry/total distance data.' },
  { q: 'What equipment is allowed?', a: 'TrackMan, Foresight (GCQuad / GC3), SkyTrak, Mevo+, and equivalent calibrated launch monitors.' },
  { q: 'Can I change category mid-season?', a: 'No. Once selected in January 2027, your category is locked for the full season.' },
  { q: 'Is it free to enter?', a: 'Yes — the competition is completely free to join and compete in.' },
]

export default function SimChampionshipPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <SeoPage
      title="Longest Sim Golf Drive Competition | Ripping Bombs"
      description="The Ripping Bombs Simulator Championship — a global longest drive leaderboard. One drive per week. Six categories. Seasonal points format."
    >
      {/* HERO — full bleed, outside content wrapper */}
      <div style={{position:'relative',width:'100vw',marginLeft:'calc(50% - 50vw)',marginRight:'calc(50% - 50vw)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:"url('https://breezypointresort.com/wp-content/uploads/2025/06/breezy-point-golf-simulator-01.webp')",backgroundSize:'cover',backgroundPosition:'center 40%',filter:'brightness(0.35)',transform:'scale(1.12)'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.55))'}}/>
          <div style={{position:'relative',zIndex:2,padding:'clamp(72px,12vw,120px) 20px clamp(72px,12vw,100px)',maxWidth:640}}>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:14,background:'rgba(255,0,144,0.15)',border:'1px solid rgba(255,0,144,0.4)',padding:'5px 16px',display:'inline-block'}}>
              Submit anywhere, anytime
            </div>
            <div style={{fontFamily:DISP,fontSize:'clamp(48px,8vw,80px)',color:'#fff',lineHeight:.95,marginBottom:20,textShadow:'0 4px 32px rgba(0,0,0,0.5)'}}>
              THE WORLD'S<br/><span style={{color:ORG}}>SIM GOLF</span><br/>DRIVE COMP
            </div>
            <div style={{fontFamily:SANS,fontSize:15,color:'rgba(255,255,255,0.75)',lineHeight:1.75,maxWidth:500,margin:'0 auto 32px'}}>
              A season-long simulator long drive competition. One recorded drive per week. Category-based rankings with cumulative points across the season.
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>router.push('/register')} style={{background:ORG,color:'#000',fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 32px',border:'none',cursor:'pointer',letterSpacing:.5}}>
                REGISTER FREE →
              </button>
              <button onClick={()=>router.push('/leaderboard')} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontFamily:SANS,fontWeight:600,fontSize:14,padding:'14px 28px',cursor:'pointer',letterSpacing:.5}}>
                View Leaderboard
              </button>
            </div>
          </div>
      </div>

      <div style={{maxWidth:760,margin:'0 auto',padding:'0 0 80px'}}>

        <div style={{marginBottom:56}}/>

        {/* WHY */}
        <div style={{marginBottom:56}}>
          <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:12}}>Why it matters</div>
          <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:16}}>A TRUE SEASON FORMAT, NOT A ONE-OFF EVENT</div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.85,marginBottom:16}}>
            The championship runs weekly across an entire season. Each player submits one validated drive per week, and rankings are determined within fixed categories.
          </div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.85}}>
            It is designed to reward both peak performance and consistency — not just one big hit.
          </div>
        </div>

        {/* POINTS TABLE */}
        <div style={{marginBottom:56}}>
          <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:12}}>Points system</div>
          <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:20}}>WEEKLY CATEGORY POINTS</div>
          <div style={{border:`1px solid ${BDR}`,overflow:'hidden',marginBottom:16}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',background:BG3,borderBottom:`2px solid ${BDR}`}}>
              {['Position','Points',''].map((h,i)=>(
                <div key={i} style={{padding:'10px 20px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,textTransform:'uppercase'}}>{h}</div>
              ))}
            </div>
            {POINTS.map((row,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:i<POINTS.length-1?`1px solid ${BDR}`:'none',background:i===0?'rgba(255,0,144,0.05)':'transparent'}}>
                <div style={{padding:'14px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT,display:'flex',alignItems:'center',gap:8}}>
                  {row.medal&&<span>{row.medal}</span>}{row.pos}
                </div>
                <div style={{padding:'14px 20px',fontFamily:DISP,fontSize:22,color:i===0?ORG:MUT,letterSpacing:.5}}>{row.pts}</div>
                <div style={{padding:'14px 20px',fontFamily:SANS,fontSize:12,color:DIM,display:'flex',alignItems:'center'}}>
                  {i===POINTS.length-1?'Every submission counts':i===0?'Weekly category winner':`Weekly category #${i+1}`}
                </div>
              </div>
            ))}
          </div>
          <div style={{fontFamily:SANS,fontSize:13,color:DIM,lineHeight:1.7}}>
            Points are awarded per category. You compete against others in your championship category only — not the global field.
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{marginBottom:56}}>
          <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:12}}>How it works</div>
          <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:24}}>SIMPLE WEEKLY FORMAT</div>
          {[
            {num:1,title:'Register a Simulator Account',body:'Free, takes under 2 minutes, auto-approved instantly. Select "Simulator / Individual" during registration.'},
            {num:2,title:'Choose Your Championship Category',body:'When the championship opens in January 2027, log in and select the one category you want to compete in for the season. This cannot be changed once selected.'},
            {num:3,title:'Submit One Drive Per Week',body:'Every week, submit your best drive with a screenshot of your launch monitor readout as evidence. Your weekly position earns you points. The more consistent you are, the higher you climb.'},
          ].map((step,i)=>(
            <div key={step.num} style={{display:'grid',gridTemplateColumns:'48px 1fr',gap:'0 20px'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:DISP,fontSize:20,color:ORG,background:'rgba(255,0,144,0.08)',border:`2px solid ${ORG}`,flexShrink:0}}>{step.num}</div>
                {i<2&&<div style={{width:2,flex:1,background:BDR,minHeight:24}}/>}
              </div>
              <div style={{paddingBottom:36,paddingTop:10}}>
                <div style={{fontFamily:DISP,fontSize:19,color:TXT,letterSpacing:.5,marginBottom:8}}>{step.title}</div>
                <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.75}}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <div style={{marginBottom:56}}>
          <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:12}}>Championships</div>
          <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:8}}>SIX COMPETITION CATEGORIES</div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.7,marginBottom:24}}>
            Every player competes in one category only. Pick the one that fits — there's a leaderboard for everyone.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:2,background:BDR}}>
            {CATEGORIES.map((cat,i)=>(
              <div key={i} style={{background:BG2,padding:'20px 22px'}}>
                <div style={{fontSize:22,marginBottom:8}}>{cat.icon}</div>
                <div style={{fontFamily:DISP,fontSize:17,color:TXT,letterSpacing:.5,marginBottom:4}}>{cat.label}</div>
                <div style={{fontFamily:SANS,fontSize:12,color:DIM}}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA STRIP */}
        <div style={{background:'rgba(255,0,144,0.05)',border:'1px solid rgba(255,0,144,0.2)',padding:'40px 32px',textAlign:'center',marginBottom:56}}>
          <div style={{fontFamily:DISP,fontSize:'clamp(24px,4vw,36px)',color:TXT,letterSpacing:1,lineHeight:1.1,marginBottom:12}}>
            THINK YOU'VE GOT A<br/><span style={{color:ORG}}>LONG DRIVE IN YOU?</span>
          </div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,maxWidth:420,margin:'0 auto 24px',lineHeight:1.7}}>
            Register your simulator account for free and start submitting drives to the global leaderboard today.
          </div>
          <button onClick={()=>router.push('/register')} style={{background:'transparent',border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 36px',cursor:'pointer',letterSpacing:.5}}>
            REGISTER FREE →
          </button>
        </div>

        {/* FAQ */}
        <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:.5,marginBottom:20}}>FAQ</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {FAQS.map(({q,a},i)=>(
            <div key={i} style={{background:BG2,border:`1px solid ${openFaq===i?'rgba(255,0,144,0.25)':BDR}`,overflow:'hidden'}}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',gap:16}}>
                <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:TXT,textAlign:'left'}}>{q}</span>
                <span style={{fontFamily:SANS,fontSize:18,color:ORG,flexShrink:0,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span>
              </button>
              {openFaq===i&&<div style={{padding:'0 20px 18px',fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.75}}>{a}</div>}
            </div>
          ))}
        </div>

      </div>
    </SeoPage>
  )
}
