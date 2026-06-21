import { ORG } from '../lib/constants';
import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
const linkStyle = { color: ORG, textDecoration: 'underline' };

export default function Page() {
  return (
    <SeoPage title="Golf Longest Drive Competition — How They Work | Ripping Bombs" description="Everything you need to know about golf longest drive competitions. How they work, how to run one, and how to get your club on the global leaderboard.">
      <SeoH1>Golf Longest Drive Competition — How They Work</SeoH1>
      <SeoP>The longest drive competition is one of golf's most popular and accessible side events. Whether it's run on a par-5 during a club day or as a standalone long drive contest, the format is simple: whoever hits the ball furthest wins.</SeoP>
      <SeoH2>What Is A Longest Drive Competition?</SeoH2>
      <SeoP>A longest drive competition asks players to hit one or more drives from a designated tee box, with the furthest ball that lands in a defined fairway area declared the winner. They're typically run as part of a larger golf event — a club championship, charity day, corporate golf day, or society event — but can also stand alone as a dedicated contest.</SeoP>
      <SeoH2>How To Run A Longest Drive Competition</SeoH2>
      <SeoTable headers={['Step','What To Do']} rows={[['1. Choose a hole','Pick a straight par-4 or par-5 with a wide fairway and clear landing zone'],['2. Set boundaries','Mark the fairway edges with cones or rope — drives must land in bounds to count'],['3. Allocate shots','Give each player 1–3 attempts depending on format and time available'],['4. Mark each drive','Use a tee peg or marker at the landing spot of each drive'],['5. Measure the winner','Measure from the tee to the furthest marker in the fairway'],['6. Record the result','Note the distance, player name, club used and handicap'],['7. Submit to Ripping Bombs','Register free and submit the result to the global leaderboard']]}/>
      <SeoH2>Why Register On Ripping Bombs?</SeoH2>
      <SeoP>Registering your club or event on Ripping Bombs gives your longest drive competition a permanent home on the global leaderboard. Every result you submit appears alongside drives from clubs and tournaments worldwide — giving your players genuine bragging rights and your event lasting exposure beyond the day itself.</SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/golf-club-longest-drive-competition-ideas" style={linkStyle}>Longest Drive Competition Ideas</Link>{' | '}
        <Link href="/how-to-promote-your-golf-event" style={linkStyle}>How To Promote Your Golf Event</Link>{' | '}
        <Link href="/longest-drive-amateur" style={linkStyle}>Longest Drive Amateur</Link>{' | '}
        <Link href="/simulator-golf-league" style={linkStyle}>Simulator Golf League</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
