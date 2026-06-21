import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
export default function Page({ entries=[] }) {
  const approved = entries.filter(e=>e.dist>0);
  const avgAll = approved.length?Math.round(approved.reduce((s,e)=>s+e.dist,0)/approved.length):230;
  const avgMale = approved.filter(e=>e.gender==='male').length?Math.round(approved.filter(e=>e.gender==='male').reduce((s,e)=>s+e.dist,0)/approved.filter(e=>e.gender==='male').length):240;
  const avgFemale = approved.filter(e=>e.gender==='female').length?Math.round(approved.filter(e=>e.gender==='female').reduce((s,e)=>s+e.dist,0)/approved.filter(e=>e.gender==='female').length):190;
  return (
    <SeoPage title="What Is A Good Drive In Golf? | Ripping Bombs" description="What counts as a good drive in golf? See real benchmarks by handicap, age and gender from verified competition data on Ripping Bombs.">
      <SeoH1>What Is A Good Drive In Golf?</SeoH1>
      <SeoP>The answer depends entirely on who you are and what standard you play to. A good drive for a beginner looks very different from a good drive for a scratch golfer — and both are completely valid. Here's a realistic breakdown based on verified competition data.</SeoP>
      <SeoH2>Average Competition Drive On Ripping Bombs</SeoH2>
      <SeoTable headers={['Category','Average Competition Drive']} rows={[['All golfers',`${avgAll} yards`],['Male golfers',`${avgMale} yards`],['Female golfers',`${avgFemale} yards`],['PGA Tour average','295–315 yards'],['LPGA Tour average','245–265 yards'],['Amateur male average','195–225 yards'],['Amateur female average','145–175 yards']]}/>
      <SeoH2>What's A Good Drive By Handicap?</SeoH2>
      <SeoTable headers={['Handicap','Good Competition Drive','Tour Comparison']} rows={[['Scratch & under','240–267 yards','Approaching tour amateur level'],['1–5 (low)','225–250 yards','Excellent club level distance'],['6–14 (mid)','200–235 yards','Good solid distance'],['15–28 (high)','175–210 yards','Perfectly respectable'],['28+ (beginner)','150–185 yards','Focus on consistency first']]}/>
      <SeoH2>Distance Isn't Everything</SeoH2>
      <SeoP>Driving distance, while exciting, is only one factor in a good golf game. Accuracy, short game, and course management contribute far more to scoring than raw distance. Many golfers who average 200 yards routinely beat players who hit it 50 yards further simply by keeping the ball in play.</SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' | '}
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/average-golf-drive-distance" style={linkStyle}>Average Golf Drive Distance</Link>{' | '}
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' | '}
        <Link href="/long-drive-golf-equipment" style={linkStyle}>Long Drive Golf Equipment</Link>{' | '}
        <Link href="/sim-distance-real-or-fake" style={linkStyle}>Is Your Sim Distance Real Or Fake</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
