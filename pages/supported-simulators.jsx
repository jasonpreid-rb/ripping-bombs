import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { ORG, MUT, TXT, BG2, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';

const SIMULATORS = [
  {
    id: 'trackman',
    name: 'TrackMan',
    tag: 'Industry standard, dual radar tracking',
    desc: "TrackMan is the most widely used launch monitor in competitive and professional golf, and it's a fully supported platform on Ripping Bombs. Whether you're running TrackMan 4 at a fitting bay or a TrackMan-equipped indoor simulator, your carry and total distance readouts are accepted as valid evidence for leaderboard submissions.",
    notes: [
      'Dual radar tracking for verified ball and club data',
      'Carry and total distance both visible on the standard readout screen',
      'Used at thousands of indoor golf venues and fitting centers worldwide',
    ],
  },
  {
    id: 'uneekor',
    name: 'Uneekor',
    tag: 'Camera-based, popular for home simulators',
    desc: "Uneekor's QED, EYE XO, and EYE MINI systems are camera-based launch monitors widely used in home and commercial simulator setups. Ripping Bombs accepts Uneekor screenshot evidence showing distance data from any Uneekor model.",
    notes: [
      'Camera-based ball and club tracking, no radar required',
      'Popular choice for home simulator builds',
      'QED, EYE XO and EYE MINI models all supported',
    ],
  },
  {
    id: 'skytrak',
    name: 'SkyTrak',
    tag: 'Affordable, widely used for home practice',
    desc: "SkyTrak and SkyTrak+ are among the most popular personal launch monitors for golfers building a home setup. Submissions from SkyTrak's distance readout are fully supported — just capture a clear screenshot showing your carry or total distance.",
    notes: [
      'One of the most accessible launch monitors for home use',
      'SkyTrak and SkyTrak+ both supported',
      'Pairs with most major simulator software',
    ],
  },
  {
    id: 'gcquad',
    name: 'Foresight GCQuad / GC3',
    tag: 'Camera-based precision tracking',
    desc: "Foresight Sports' GCQuad and GC3 launch monitors use quadrascopic camera tracking for highly precise ball and club data. Drives recorded on either system are accepted for Ripping Bombs submissions with a clear screenshot of the distance readout.",
    notes: [
      'Quadrascopic camera tracking for precision ball data',
      'GCQuad and GC3 models both supported',
      'Widely used in club fitting and teaching environments',
    ],
  },
  {
    id: 'full-swing',
    name: 'Full Swing',
    tag: 'Common in commercial simulator bays',
    desc: "Full Swing simulators are a fixture in commercial indoor golf venues and country club simulator rooms. If your facility runs Full Swing KIT, Pro, or Golf simulators, your recorded drives are accepted as valid submissions to the global leaderboard.",
    notes: [
      'Common in commercial and country club simulator bays',
      'KIT, Pro and Golf models all supported',
      'Great option if you compete from a public simulator venue',
    ],
  },
];

const FAQS = [
  { q: 'Which golf simulators does Ripping Bombs support?', a: 'TrackMan, Uneekor, SkyTrak, Foresight GCQuad/GC3, and Full Swing are all officially supported. Any launch monitor that displays carry or total distance with a clear, unedited screenshot can be used as submission evidence.' },
  { q: 'Can I enter a TrackMan long drive competition on Ripping Bombs?', a: "Yes. TrackMan is one of the most commonly used systems on the platform. Submit your driver distance with a screenshot of the TrackMan readout and it's added to the global leaderboard." },
  { q: 'Do I need a specific simulator brand to compete?', a: 'No. You can submit from any of the supported simulators, or even compare your numbers using our driving distance percentile calculator if you don\u2019t want to submit a leaderboard entry yet.' },
  { q: 'What if my simulator brand isn\u2019t listed?', a: 'Contact us — we\'re continually adding support for additional launch monitor brands and will review evidence from systems not yet listed.' },
  { q: 'Does the simulator need to be at a specific venue?', a: 'No. Home simulators, commercial bays, fitting centers, and country club setups are all eligible as long as the launch monitor brand is supported and the readout is clearly visible in your submission evidence.' },
];

export default function SupportedSimulators() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <SeoPage
      title="Supported Golf Simulators — TrackMan, Uneekor, SkyTrak, GCQuad, Full Swing | Ripping Bombs"
      description="Ripping Bombs supports drive submissions from TrackMan, Uneekor, SkyTrak, Foresight GCQuad/GC3, and Full Swing simulators. Compete in the TrackMan long drive competition and global leaderboard from any supported launch monitor."
    >
      <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:3, color:ORG, textTransform:'uppercase', marginBottom:10 }}>
        Simulator Compatibility
      </div>
      <SeoH1>Supported Golf Simulators</SeoH1>
      <SeoP>
        Ripping Bombs accepts drive submissions from all major golf simulator and launch monitor
        brands. Whether you're hitting drives on a TrackMan at a fitting bay, an Uneekor setup at
        home, or a commercial Full Swing simulator bay, your numbers count toward the global
        <Link href="/leaderboard" style={linkStyle}>leaderboard</Link> — and toward our <a href="/hall-of-fame" style={{ color:ORG, textDecoration:'underline' }}>Hall of Fame</a> records. Here's what's supported.
      </SeoP>

      {/* SIMULATOR SECTIONS */}
      <div style={{ display:'flex', flexDirection:'column', gap:2, marginTop:8, marginBottom:40 }}>
        {SIMULATORS.map((sim, i) => (
          <div key={sim.id} id={sim.id} style={{ background:BG2, border:`1px solid ${BDR}`, padding:'26px 24px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap', marginBottom:6 }}>
              <div style={{ fontFamily:DISP, fontSize:'clamp(22px,3vw,28px)', color:TXT, letterSpacing:.5 }}>{sim.name}</div>
              <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:1, color:ORG, textTransform:'uppercase' }}>{sim.tag}</div>
            </div>
            <div style={{ fontFamily:SANS, fontSize:14, color:MUT, lineHeight:1.8, marginBottom:14 }}>
              {sim.desc}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {sim.notes.map((note, j) => (
                <div key={j} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ color:ORG, fontFamily:SANS, fontSize:13, lineHeight:1.6 }}>✓</span>
                  <span style={{ fontFamily:SANS, fontSize:13, color:DIM, lineHeight:1.6 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA STRIP */}
      <div style={{ background:'rgba(255,0,144,0.05)', border:'1px solid rgba(255,0,144,0.2)', padding:'32px 24px', textAlign:'center', marginBottom:40 }}>
        <div style={{ fontFamily:DISP, fontSize:'clamp(22px,4vw,30px)', color:TXT, letterSpacing:1, marginBottom:10 }}>
          GOT A SIMULATOR? START SUBMITTING.
        </div>
        <div style={{ fontFamily:SANS, fontSize:13, color:MUT, maxWidth:480, margin:'0 auto 20px', lineHeight:1.7 }}>
          Register a free simulator account, submit your longest drive from any supported launch
          monitor, and see where you rank on the global leaderboard.
        </div>
        <button onClick={() => router.push('/register')} style={{ background:'transparent', border:`1px solid ${ORG}`, color:ORG, fontFamily:SANS, fontWeight:700, fontSize:13, padding:'12px 28px', cursor:'pointer', letterSpacing:.5 }}>
          REGISTER FREE →
        </button>
      </div>

      <SeoH2>Why Simulator Compatibility Matters</SeoH2>
      <SeoP>
        Long drive competition has moved far beyond the driving range. With more golfers training
        and competing on indoor simulators than ever, having a fair, verifiable submission process
        across every major launch monitor brand is essential. Ripping Bombs was built to let
        simulator golfers compete on equal footing with golfers submitting from the course.
      </SeoP>

      <SeoH2>TrackMan Long Drive Competition</SeoH2>
      <SeoP>
        TrackMan is the launch monitor most associated with serious long drive training, thanks to
        its dual radar precision and widespread use in fitting centers and indoor golf venues. If
        you're searching for a TrackMan long drive competition to enter, Ripping Bombs' global
        leaderboard accepts TrackMan submissions from anywhere in the world — home setups,
        commercial bays, or fitting sessions.
      </SeoP>

      <SeoH2>How to Submit a Simulator Drive</SeoH2>
      <SeoP>
        Register a free simulator account, then submit your driver distance with a clear screenshot
        of your launch monitor's readout showing carry or total distance. Your submission is reviewed
        and added to the leaderboard in your category — Men, Women, Youth, Senior, or High Handicap.
        Not sure how your numbers stack up first? Try our{' '}
        <a href="/how-far-do-i-drive-compared-to-others" style={{ color:ORG, textDecoration:'underline' }}>driving distance percentile calculator</a>,
        or check out our <a href="/recommended-range-finders" style={{ color:ORG, textDecoration:'underline' }}>recommended range finders</a> if you're dialing in your setup.
      </SeoP>

      {/* FAQ */}
      <SeoH2>FAQ</SeoH2>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {FAQS.map(({ q, a }, i) => (
          <div key={i} style={{ background:BG2, border:`1px solid ${openFaq===i?'rgba(255,0,144,0.25)':BDR}`, overflow:'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width:'100%', background:'none', border:'none', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', gap:16 }}>
              <span style={{ fontFamily:SANS, fontSize:14, fontWeight:600, color:TXT, textAlign:'left' }}>{q}</span>
              <span style={{ fontFamily:SANS, fontSize:18, color:ORG, flexShrink:0, transform:openFaq===i?'rotate(45deg)':'none', transition:'transform .2s' }}>+</span>
            </button>
            {openFaq===i && <div style={{ padding:'0 20px 18px', fontFamily:SANS, fontSize:13, color:MUT, lineHeight:1.75 }}>{a}</div>}
          </div>
        ))}
      </div>
    
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/long-drive-golf-equipment" style={linkStyle}>Long Drive Golf Equipment</Link>{' · '}
        <Link href="/recommended-range-finders" style={linkStyle}>Recommended Range Finders</Link>{' · '}
        <Link href="/sim-distance-real-or-fake" style={linkStyle}>Is Your Sim Distance Real Or Fake</Link>{' · '}
        <Link href="/simulator-golf-league" style={linkStyle}>Simulator Golf League</Link>
      </SeoP>
    </SeoPage>
  );
}
