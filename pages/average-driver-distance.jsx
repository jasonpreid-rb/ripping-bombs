import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
export default function Page() {
  return (
    <SeoPage title="Average Driver Distance — What Should You Be Hitting? | Ripping Bombs" description="How far does the average golfer hit their driver? Real-world distance data by handicap, age, and gender — plus how you compare to the world's longest amateur hitters.">
      <SeoH1>Average Driver Distance — What Should You Be Hitting?</SeoH1>
      <SeoP>Most amateur golfers overestimate how far they hit their driver. The number in your head — usually taken from your best-ever shot on a downhill hole with a tailwind — rarely reflects your actual carry distance. Here's what the data really shows.</SeoP>

      <SeoH2>Average Driver Distance By Handicap</SeoH2>
      <SeoTable
        headers={['Handicap Range', 'Average Driver Distance (yards)']}
        rows={[
          ['Scratch (0)', '265–285'],
          ['1–5', '250–270'],
          ['6–12', '230–255'],
          ['13–20', '210–235'],
          ['21–28', '190–215'],
          ['28+', '170–195'],
        ]}
      />
      <SeoP>These figures reflect real carry distances on a flat course in neutral conditions — not GPS-assisted total distance including roll. If you're tracking your drives with a launch monitor or simulator, your numbers may differ slightly due to turf vs mat carry.</SeoP>

      <SeoH2>Average Driver Distance By Age</SeoH2>
      <SeoTable
        headers={['Age Group', 'Average Driver Distance (yards)']}
        rows={[
          ['Under 20', '220–260'],
          ['20–30', '240–275'],
          ['30–40', '235–265'],
          ['40–50', '220–250'],
          ['50–60', '200–230'],
          ['60+', '175–210'],
        ]}
      />
      <SeoP>Peak driver distance typically falls between ages 25 and 35. After 50, most golfers lose 1–2 yards per year on average, though fitness and technique can significantly offset that decline.</SeoP>

      <SeoH2>How Far Should You Hit Your Driver?</SeoH2>
      <SeoP>There's no single right answer — it depends on your swing speed, ball speed, and launch conditions. A general benchmark: if your driver swing speed is around 90 mph, you should be carrying the ball approximately 230 yards with an optimised setup. Every additional 1 mph of swing speed is worth roughly 2.5 yards of carry distance.</SeoP>

      <SeoH2>What The Trackman Data Shows</SeoH2>
      <SeoP>Trackman's aggregate data from tour and amateur players consistently shows that most recreational golfers leave significant distance on the table — not from lack of speed, but from suboptimal launch angle, spin rate, or contact quality. The average male amateur carries their driver around 215 yards. The PGA Tour average is approximately 275–280 yards carry.</SeoP>

      <SeoH2>How Does Your Longest Drive Compare Globally?</SeoH2>
      <SeoP>Ripping Bombs is a free global registry for amateur longest drive results. Whether you play on a real course or a golf simulator, you can register and submit your best drive to appear on the worldwide leaderboard — ranked by age group, handicap, and gender. It's a simple way to see where your distance stands against players around the world.</SeoP>
      <SeoCTA />
    </SeoPage>
  );
}
