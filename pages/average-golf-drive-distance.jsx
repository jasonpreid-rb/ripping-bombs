import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG } from '../lib/constants';

const linkStyle = { color: ORG };
export default function Page({ entries=[] }) {
  const approved = entries.filter(e=>e.dist>0);
  const ageBrackets = [
    {label:'Under 25',filter:e=>e.age<25},
    {label:'25–40',filter:e=>e.age>=25&&e.age<40},
    {label:'40–55',filter:e=>e.age>=40&&e.age<55},
    {label:'55+',filter:e=>e.age>=55},
  ];
  const ageRows = ageBrackets.map(b=>{const g=approved.filter(b.filter);const avg=g.length?Math.round(g.reduce((s,e)=>s+e.dist,0)/g.length):null;return [b.label,avg?`${avg} yds`:'—',g.length];});
  const genderRows = ['male','female'].map(gender=>{const g=approved.filter(e=>e.gender===gender);const avg=g.length?Math.round(g.reduce((s,e)=>s+e.dist,0)/g.length):null;return [gender==='male'?'♂ Male':'♀ Female',avg?`${avg} yds`:'—',g.length];});
  return (
    <SeoPage title="Average Golf Drive Distance | Ripping Bombs" description="What is the average golf drive distance? See real data broken down by age and gender from verified competition results on Ripping Bombs.">
      <SeoH1>Average Golf Drive Distance</SeoH1>
      <SeoP>The average golf drive distance varies widely depending on age, gender, skill level, and whether we're talking about recreational rounds or competition shots. Here we break it down using verified competition data from the Ripping Bombs global database.</SeoP>
      <SeoH2>Average Competition Drive By Age</SeoH2>
      <SeoTable headers={['Age Group','Avg Competition Drive','Entries']} rows={ageRows}/>
      <SeoH2>Average Competition Drive By Gender</SeoH2>
      <SeoTable headers={['Gender','Avg Competition Drive','Entries']} rows={genderRows}/>
      <SeoH2>How Does This Compare To Tour Averages?</SeoH2>
      <SeoP>On the PGA Tour, the average driving distance is around 295–315 yards. The LPGA Tour average sits around 245–265 yards. For amateur club golfers, studies suggest average driving distances of around 195–220 yards for men and 140–175 yards for women across all ability levels.</SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/average-driver-distance-by-handicap" style={linkStyle}>Average Driver Distance By Handicap</Link>{' | '}
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' | '}
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>Driving Distance Percentile Calculator</Link>{' | '}
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' | '}
        <Link href="/what-is-a-good-drive-in-golf" style={linkStyle}>What Is A Good Drive In Golf</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
