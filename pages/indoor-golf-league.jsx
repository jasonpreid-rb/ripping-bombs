import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
export default function Page() {
  return (
    <SeoPage title="Indoor Golf League — How To Set One Up At Your Simulator Venue | Ripping Bombs" description="How to run an indoor golf league at a simulator venue. Formats, scoring systems, league structures, and how to keep competition running year-round.">
      <SeoH1>Indoor Golf League — How To Set One Up</SeoH1>
      <SeoP>Indoor golf leagues have become one of the fastest-growing formats in the game. With simulator technology now delivering highly accurate distance and ball flight data, it's possible to run a genuinely competitive league without ever stepping outside — making them especially popular through autumn and winter.</SeoP>

      <SeoH2>Why Indoor Golf Leagues Work So Well</SeoH2>
      <SeoTable
        headers={['Advantage', 'Why It Matters']}
        rows={[
          ['Weather independent', 'No cancellations — leagues run consistently week to week'],
          ['Fast format', 'A competitive round on a simulator can take 60–90 minutes vs 4+ hours outdoor'],
          ['Instant scoring', 'No manual scorecards — data is recorded automatically'],
          ['Accessible to all', 'Works for beginners who find a full outdoor round intimidating'],
          ['Evening-friendly', 'Perfect for after-work leagues that would be impossible outdoors in winter'],
          ['Consistent conditions', 'No wind, rain, or course conditions to create unfair variance'],
        ]}
      />

      <SeoH2>League Formats To Consider</SeoH2>
      <SeoTable
        headers={['Format', 'How It Works']}
        rows={[
          ['Strokeplay season', 'Players complete rounds over multiple weeks — lowest total score wins'],
          ['Stableford points', 'Points per hole based on handicap — rewards consistent play'],
          ['Match play draw', 'Weekly head-to-head matchups on a bracket or round-robin basis'],
          ['Longest drive season', 'Weekly longest drive submissions — season total or single best wins'],
          ['Combined format', 'Strokeplay + longest drive — overall champion wins both categories'],
          ['Team league', 'Groups of 2–4 share a bay and submit team best drives or combined scores'],
        ]}
      />

      <SeoH2>How Many Weeks Should A Season Run?</SeoH2>
      <SeoP>Most successful indoor leagues run 8–12 weeks, which is long enough to create meaningful standings but short enough to keep engagement high throughout. A 10-week format with a finals week works well — it gives latecomers time to catch up and keeps the top of the table competitive until the end.</SeoP>

      <SeoH2>Handicap Systems For Indoor Leagues</SeoH2>
      <SeoP>For strokeplay and Stableford formats, use players' existing WHS handicap index where possible. If you have non-registered players, a provisional handicap can be set after the first two rounds. For longest drive leagues, splitting into handicap bands (scratch to 12, 13 to 20, 21+) creates fairer categories than a pure open format.</SeoP>

      <SeoH2>Adding A Longest Drive Element To Your League</SeoH2>
      <SeoP>The most popular addition to indoor leagues is a weekly longest drive submission — one best drive per player per week, recorded and submitted to a running leaderboard. Ripping Bombs is built exactly for this: simulator venues can register for free and submit their players' weekly longest drives to a global leaderboard, with results tracked by season, category, and venue. It adds a competitive layer that keeps players coming back week after week.</SeoP>
      <SeoCTA />
    </SeoPage>
  );
}
