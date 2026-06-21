import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';

export default function Page({ entries = [] }) {
  const approved = entries.filter(e => e.dist > 0);
  const brackets = [
    { label:'Scratch & Under (0 or less)', filter:e=>e.hcp<=0 },
    { label:'Low Handicap (1–5)',          filter:e=>e.hcp>=1&&e.hcp<=5 },
    { label:'Mid Handicap (6–14)',         filter:e=>e.hcp>=6&&e.hcp<=14 },
    { label:'High Handicap (15–28)',       filter:e=>e.hcp>=15&&e.hcp<=28 },
    { label:'Beginner (28+)',              filter:e=>e.hcp>28 },
  ];
  const rows = brackets.map(b => {
    const g = approved.filter(b.filter);
    const avg = g.length ? Math.round(g.reduce((s,e)=>s+e.dist,0)/g.length) : null;
    const best = g.length ? Math.max(...g.map(e=>e.dist)) : null;
    return [b.label, avg?`${avg} yds`:'—', best?`${best} yds`:'—', g.length];
  });

  return (
    <SeoPage title="Average Driver Distance By Handicap | Ripping Bombs" description="Find out the average driver distance by handicap. See real data from golfers worldwide on the Ripping Bombs global longest drive database.">
      <SeoH1>Average Driver Distance By Handicap</SeoH1>
      <SeoP>One of the most common questions in golf is: how far should I be hitting it for my <Link href="/golf-handicap-driving-distance" style={linkStyle}>handicap</Link>? The answer varies hugely depending on age, fitness, swing speed and equipment — but data from real competition results gives us the clearest picture.</SeoP>
      <SeoP>The figures below are drawn from verified competition longest drive results submitted to the Ripping Bombs global database by registered clubs and tournament organisers worldwide.</SeoP>
      <SeoH2>Average & Best Drives By Handicap</SeoH2>
      <SeoTable headers={['Handicap Bracket','Avg Competition Drive','Best Recorded Drive','Entries']} rows={rows}/>
      <SeoH2>What Affects Driving Distance?</SeoH2>
      <SeoP>Handicap is one indicator of skill, but driving distance is influenced by many other factors including swing speed, angle of attack, ball speed, smash factor, launch angle, and spin rate. A high handicapper with a fast swing can easily outdrive a scratch golfer with poor mechanics.</SeoP>
      <SeoP>On the PGA Tour, the average driving distance sits around 295–310 yards. For club golfers, the average is considerably lower — typically between 200–240 yards for recreational players. Competition longest drives represent the best hits from organised events rather than average shots.</SeoP>
      <SeoH2>How Does Your Drive Compare?</SeoH2>
      <SeoP>If your club runs a longest drive competition, you can register on Ripping Bombs and submit your results to appear on the global leaderboard. Compare your best drive against golfers from courses around the world.</SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/golf-handicap-driving-distance" style={linkStyle}>Golf Handicap And Driving Distance</Link>{' | '}
        <Link href="/average-golf-drive-distance" style={linkStyle}>Average Golf Drive Distance</Link>{' | '}
        <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>Driving Distance Percentile Calculator</Link>{' | '}
        <Link href="/how-to-hit-a-golf-ball-farther" style={linkStyle}>How To Hit A Golf Ball Farther</Link>{' | '}
        <Link href="/longest-drive-high-handicap" style={linkStyle}>Longest Drive High Handicap</Link>{' | '}
        <Link href="/longest-drive-low-handicap" style={linkStyle}>Longest Drive Low Handicap</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
