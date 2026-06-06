import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';

export default function Page() {
  const participationRows = [
    ['Global Golfers', '67 million', 'up from 55M in 2016'],
    ['Global Golf Fans', '450 million+', '2024 estimate'],
    ['Golf Courses Worldwide', '38,000+', 'across 206 countries'],
    ['Off-Course Participants', '40% increase', 'since 2020'],
    ['US Golfers (2023)', '41.1 million', 'National Golf Foundation'],
  ];

  const demographicRows = [
    ['Female golfers', '~25%', 'of global golf participation'],
    ['Age 18–35 growth', '+2 million players', '2020–2023'],
    ['Junior programmes', 'At capacity', 'Europe & North America'],
    ['Topgolf-style venues', '600+', 'globally'],
  ];

  const countryRows = [
    ['United States', '~25 million', 'Largest golf market by participation'],
    ['Japan', '~9 million', 'Largest market in Asia'],
    ['United Kingdom', '~4 million', 'Strong membership club culture'],
    ['South Korea', '~5 million', 'Fastest-growing elite pipeline'],
    ['Australia', '~1.2 million', 'High per-capita participation'],
    ['Germany', '~650,000', 'Largest European market outside UK'],
  ];

  return (
    <SeoPage
      title="Popularity of Golf as a Sport | Golf Participation Stats 2025 | Ripping Bombs"
      description="How popular is golf? Explore global participation stats, growth trends, demographics, and which countries play the most golf in 2025."
    >
      <SeoH1>Popularity of Golf as a Sport</SeoH1>
      <SeoP>
        Golf is one of the most widely played sports in the world, with over 67 million active golfers across more than 200 countries. Far from declining, the sport has seen significant growth over the past five years — driven by a post-pandemic surge in participation, a wave of younger players, and the explosive rise of off-course formats like indoor simulators and driving range venues.
      </SeoP>

      <SeoH2>Global Golf Participation at a Glance</SeoH2>
      <SeoTable
        headers={['Metric', 'Figure', 'Notes']}
        rows={participationRows}
      />

      <SeoH2>Why Golf Grew After 2020</SeoH2>
      <SeoP>
        The COVID-19 pandemic acted as an unexpected catalyst for golf participation worldwide. As an outdoor, socially distanced activity, golf courses were among the first recreational venues permitted to reopen in many countries. Millions of people took up the game during this period — and unlike many pandemic hobbies, a substantial portion of those new golfers continued playing once restrictions lifted.
      </SeoP>
      <SeoP>
        Equipment manufacturers reported record sales between 2020 and 2022. Golf course bookings across the UK, US, and Australia remained significantly elevated through 2023 and into 2024. The sport effectively gained a multi-year boost in visibility and accessibility that its governing bodies have worked to sustain.
      </SeoP>

      <SeoH2>Who Is Playing Golf?</SeoH2>
      <SeoTable
        headers={['Demographic', 'Stat', 'Context']}
        rows={demographicRows}
      />
      <SeoP>
        The profile of the average golfer has shifted considerably. Women now represent around 25% of golfers globally — a figure that continues to rise, driven by targeted participation programmes and the influence of high-profile female professionals. The 18–35 age group, previously considered a weak spot for the sport, has grown substantially, partly due to the cultural crossover of golf into streetwear, social media, and entertainment formats like Topgolf.
      </SeoP>

      <SeoH2>Golf Participation by Country</SeoH2>
      <SeoTable
        headers={['Country', 'Estimated Golfers', 'Notes']}
        rows={countryRows}
      />

      <SeoH2>Is Golf Growing or Declining?</SeoH2>
      <SeoP>
        The data points clearly to growth. While traditional on-course participation had been flat or slightly declining in some markets prior to 2020, the post-pandemic period reversed that trend decisively. Off-course participation — defined as golf activity at driving ranges, simulators, and entertainment venues — has grown by an estimated 40% since 2020 and now accounts for a significant share of total golf engagement globally.
      </SeoP>
      <SeoP>
        Governing bodies including the R&A and USGA have published strategies specifically aimed at sustaining and accelerating this growth — with particular focus on women, juniors, and urban communities historically underserved by traditional golf clubs.
      </SeoP>

      <SeoH2>The Role of Off-Course Golf</SeoH2>
      <SeoP>
        Venues like Topgolf, Drive Shack, and indoor simulator centres have fundamentally changed how people engage with the sport. Many participants at these venues have never played a traditional round of golf and may never do so — but they represent a growing audience that follows the sport, purchases equipment, and contributes to its cultural relevance. The golf industry increasingly treats off-course participation as a legitimate and valuable part of the ecosystem.
      </SeoP>

      <SeoCTA />
    </SeoPage>
  );
}
