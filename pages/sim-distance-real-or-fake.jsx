import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { SeoPage, SeoH2, SeoP } from '../components/SeoPageLayout'
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants'

const linkStyle = { color: ORG }

const SIGNALS = [
  { signal: 'Drive exceeds 350 yards on a flat hole', meaning: 'Worth double-checking spin/launch readings' },
  { signal: 'Same swing, different distance across sims', meaning: 'Software calibration issue, not your swing' },
  { signal: 'No outdoor or launch monitor confirmation', meaning: "Can't be verified against real-world data" },
  { signal: 'Consistent within 10% of your outdoor average', meaning: 'Likely accurate' },
]

const FAQS = [
  { q: 'Why does my sim show a longer drive than I hit outdoors?', a: 'Most simulators calculate carry and roll from launch angle, ball speed, and spin rate captured by a camera or radar unit. A slightly under-read spin rate can add 20-40 yards to a drive that never happened outdoors.' },
  { q: 'Why is the same swing different on GSPro vs TGC?', a: "Software defaults for firmware, wind, and altitude vary by platform, which is why identical swings can produce different numbers depending on which simulator you're using." },
  { q: 'Can I get my distance officially verified?', a: 'Yes. Register a free Ripping Bombs account and submit your drive with a screenshot of your launch monitor readout as evidence — it goes on the global leaderboard, ranked by age, gender, and handicap.' },
  { q: 'What if my number seems too good to be true?', a: "Check it against realistic benchmarks for your profile using our driver distance percentile calculator, then submit it for verification rather than relying on the sim's own leaderboard." },
]

export default function SimDistanceRealOrFake() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <SeoPage
      title="Is Your Golf Simulator Distance Real? | Ripping Bombs"
      description="GSPro, TGC, Awesome Golf, and Rapsodo can overstate your longest drive. Here's how to know if your number is real — and how to get it verified on a real leaderboard."
    >
      <div style={{maxWidth:760,margin:'0 auto',padding:'56px 18px 80px'}}>

        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:'uppercase',marginBottom:14}}>
          Simulator Distance
        </div>
        <div style={{fontFamily:DISP,fontSize:'clamp(32px,6vw,48px)',color:TXT,letterSpacing:.5,lineHeight:1.05,marginBottom:24}}>
          IS YOUR SIMULATOR LONGEST DRIVE ACTUALLY REAL?
        </div>

        <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.85,marginBottom:48}}>
          Every golf simulator forum has the same thread: someone posts a 380-yard drive
          from their GSPro or TGC session, and half the replies call it a glitch. The
          other half want to know how to do it themselves. If you've ever wondered
          whether your sim's longest-drive number reflects reality — or just generous
          launch monitor math — you're not alone.
        </div>

        {/* WHY SECTION */}
        <div style={{marginBottom:48}}>
          <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:.5,marginBottom:16}}>
            WHY SIMULATORS OVERSTATE DISTANCE
          </div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.85}}>
            Most simulators calculate carry and roll from launch angle, ball speed, and
            spin rate captured by a camera or radar unit. Small errors in spin reading
            get amplified at distance — a slightly under-read spin rate can add 20-40
            yards to a drive that never happened outdoors. Software defaults (firmness,
            wind, altitude) also vary by platform, which is why the same swing can
            produce wildly different numbers on GSPro vs TGC vs Awesome Golf. If you're
            chasing a competitive sim number specifically, our{' '}
            <Link href="/sim-golf-long-drive-championship" style={{color:ORG}}>
              simulator long drive championship guide
            </Link>{' '}
            breaks down which setups and venues produce the most consistent readings.
          </div>
        </div>

        {/* SIGNALS TABLE */}
        <div style={{marginBottom:48}}>
          <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:.5,marginBottom:20}}>
            HOW TO KNOW IF YOUR NUMBER IS LEGIT
          </div>
          <div style={{border:`1px solid ${BDR}`,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',background:BG3,borderBottom:`2px solid ${BDR}`}}>
              {['Signal','What it means'].map((h,i)=>(
                <div key={i} style={{padding:'10px 20px',fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,textTransform:'uppercase'}}>{h}</div>
              ))}
            </div>
            {SIGNALS.map((row,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:i<SIGNALS.length-1?`1px solid ${BDR}`:'none',background:BG2}}>
                <div style={{padding:'14px 20px',fontFamily:SANS,fontSize:13,color:TXT,lineHeight:1.5}}>{row.signal}</div>
                <div style={{padding:'14px 20px',fontFamily:SANS,fontSize:13,color:MUT,lineHeight:1.5}}>{row.meaning}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CALCULATOR LINK SECTION */}
        <div style={{marginBottom:48}}>
          <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:.5,marginBottom:16}}>
            WHAT'S A REALISTIC DISTANCE FOR YOUR PROFILE?
          </div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,lineHeight:1.85}}>
            Before you decide your number is suspicious — or brag about it — it helps to
            know what's actually realistic for your age, gender, and handicap. Run your
            numbers through our{' '}
            <Link href="/#distance-calculator" style={{color:ORG}}>
              driver distance percentile calculator
            </Link>{' '}
            to see where you genuinely rank against other golfers like you.
          </div>
        </div>

        {/* CTA STRIP */}
        <div style={{background:'rgba(255,0,144,0.05)',border:'1px solid rgba(255,0,144,0.2)',padding:'40px 32px',textAlign:'center',marginBottom:48}}>
          <div style={{fontFamily:DISP,fontSize:'clamp(22px,4vw,32px)',color:TXT,letterSpacing:1,lineHeight:1.1,marginBottom:12}}>
            GET A REAL NUMBER ON A<br/><span style={{color:ORG}}>REAL LEADERBOARD</span>
          </div>
          <div style={{fontFamily:SANS,fontSize:14,color:MUT,maxWidth:440,margin:'0 auto 24px',lineHeight:1.7}}>
            Ripping Bombs is a global longest drive registry for amateur golfers —
            verified submissions, ranked by age, gender, and handicap. No more arguing
            in a forum thread about whether your 400-yarder counts. Submit it, get
            verified, see where you actually rank on our{' '}
            <Link href="/leaderboard" style={{color:ORG}}>global leaderboard</Link>.
          </div>
          <button onClick={()=>router.push('/register')} style={{background:ORG,color:'#000',fontFamily:SANS,fontWeight:700,fontSize:14,padding:'14px 32px',border:'none',cursor:'pointer',letterSpacing:.5}}>
            SUBMIT YOUR LONGEST DRIVE →
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

        <SeoH2>Explore Related Pages</SeoH2>
        <SeoP>
          <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' | '}
          <Link href="/long-drive-golf-equipment" style={linkStyle}>Long Drive Golf Equipment</Link>{' | '}
          <Link href="/simulator-golf-league" style={linkStyle}>Simulator Golf League</Link>{' | '}
          <Link href="/supported-simulators" style={linkStyle}>Supported Simulators</Link>{' | '}
          <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>What Is A Good Drive In Golf</Link>
        </SeoP>

      </div>
    </SeoPage>
  )
}
