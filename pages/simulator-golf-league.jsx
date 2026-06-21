import Link from 'next/link';
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
import { ORG } from '../lib/constants';

const linkStyle = { color: ORG, textDecoration: 'underline' };

export default function Page() {
  return (
    <SeoPage title="Simulator Golf League | Compete For Your Country | Ripping Bombs" description="Join a simulator golf league anyone can compete in. Submit verified longest drive results from home and represent your country on a real global leaderboard.">
      <SeoH1>Simulator Golf League</SeoH1>
      <SeoP>You don't need a tour card, a sponsor, or a scratch <Link href="/golf-handicap-driving-distance" style={linkStyle}>handicap</Link> to represent your country in golf. With a simulator golf league, anyone with a launch monitor and a living room can step up to a genuinely international leaderboard — and that's exactly what Ripping Bombs is built for.</SeoP>
      <SeoH2>Everybody Is Welcome</SeoH2>
      <SeoP>Most competitive golf is gated by club membership, qualifying rounds, or invitation. A simulator golf league removes those barriers entirely. Junior, senior, high handicapper, scratch golfer — every category has its own leaderboard, so a 14-year-old on a Wilson Launch Pad and a low-single-figure player on a Trackman are both chasing a title that actually means something for their group. Check <Link href="/supported-simulators" style={linkStyle}>which simulators are supported</Link> to see if yours already qualifies.</SeoP>
      <SeoH2>Compete For Your Country, Not Just Your Club</SeoH2>
      <SeoP>Traditional longest drive competitions are local by nature — one club, one event, one day. A simulator league flips that. Submit a verified drive from your home setup and you're instantly measured against players across dozens of countries, with country flags and national rankings built into every leaderboard view. Curious where your numbers stack up? Try the <Link href="/how-far-do-i-drive-compared-to-others" style={linkStyle}>driver distance percentile calculator</Link> first.</SeoP>
      <SeoH2>One Of The Few Ways To Compete Internationally Without Going Pro</SeoH2>
      <SeoP>International golf competition has traditionally been reserved for tour professionals and elite amateurs with funding for travel. Simulator golf changes that economics completely. There's no flight, no entry fee for a regional qualifier, no need to take time off work. You compete from your own simulator, on your own schedule, against the same global field — which makes this one of the only realistic paths to international competition for the average golfer. Wondering how accurate your numbers really are? Read <Link href="/sim-distance-real-or-fake" style={linkStyle}>is your sim distance real or fake</Link>.</SeoP>
      <SeoTable headers={['Traditional Route','Simulator Golf League']} rows={[['Requires club membership or invite','Open registration, auto-approved']
        ,['Local field only','Global field, every submission']
        ,['Travel and entry costs','Compete from home']
        ,['One shot per event','One submission per week, every week']
        ,['Pro-only international stage','Open to every handicap and age group']]}/>
      <SeoH2>How It Works</SeoH2>
      <SeoP>Register a free simulator account, submit your longest drive with photo evidence from your session, and you're automatically placed into your age, gender, and handicap category on the weekly and all-time leaderboards. No approval queue, no waiting — simulator accounts go live instantly.</SeoP>
      <SeoP>Whether you're chasing a national flag next to your name or just want proof of your personal best against a real international field, Ripping Bombs gives every simulator golfer a genuine competitive stage.</SeoP>

      <SeoH2>Explore By Category</SeoH2>
      <SeoP>
        <Link href="/longest-drive-low-handicap" style={linkStyle}>Low Handicap</Link>{' | '}
        <Link href="/longest-drive-high-handicap" style={linkStyle}>High Handicap</Link>{' | '}
        <Link href="/longest-drive-seniors" style={linkStyle}>Seniors</Link>{' | '}
        <Link href="/longest-drive-juniors-13-16" style={linkStyle}>Juniors 13–16</Link>{' | '}
        <Link href="/longest-womens-drive" style={linkStyle}>Women's Longest Drive</Link>{' | '}
        <Link href="/hall-of-fame" style={linkStyle}>Hall Of Fame</Link>
      </SeoP>
      
      <SeoH2>Explore Related Pages</SeoH2>
      <SeoP>
        <Link href="/golf-club-longest-drive-competition-ideas" style={linkStyle}>Longest Drive Competition Ideas</Link>{' | '}
        <Link href="/golf-longest-drive-competition" style={linkStyle}>Golf Longest Drive Competition</Link>{' | '}
        <Link href="/how-to-promote-your-golf-event" style={linkStyle}>How To Promote Your Golf Event</Link>{' | '}
        <Link href="/longest-drive-amateur" style={linkStyle}>Longest Drive Amateur</Link>{' | '}
        <Link href="/sim-distance-real-or-fake" style={linkStyle}>Is Your Sim Distance Real Or Fake</Link>{' | '}
        <Link href="/supported-simulators" style={linkStyle}>Supported Simulators</Link>
      </SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
