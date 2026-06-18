import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';

export default function Page() {

  const formatRows = [
    ['Defined Attempt Window', 'Players receive a fixed number of swings (usually 3–10 recorded attempts per session or qualifier round)'],
    ['Driver Requirement', 'Driver is required, but shaft/head setup is typically unrestricted unless specified by event rules'],
    ['Simulator Compatibility', 'Events are run on approved simulator setups where calibration and conditions are verified'],
    ['Leaderboard Validation', 'Only officially submitted or verified drives count toward rankings'],
    ['Standardised Conditions', 'Flat fairway, no wind manipulation, and consistent ball/tee settings where possible']
  ];

  const performanceRows = [
    ['Club Head Speed', 'Key driver of distance; elite players exceed 140–150+ mph'],
    ['Ball Speed', 'Direct output of strike efficiency; typically 200–240+ mph for top hitters'],
    ['Launch Angle', 'Optimised launch windows produce maximum carry and total distance'],
    ['Spin Rate', 'Lower spin generally increases roll and total distance in sim environments'],
  ];

  const simPlatforms = [
    ['TrackMan', 'Radar-based system widely used in professional fittings and high-end competition'],
    ['Foresight (GCQuad / GCQuad)', 'Photometric system known for precision strike and spin data used in coaching and competition'],
    ['SkyTrak', 'Consumer-focused simulator often used for entry-level and home competition formats'],
    ['GSPro / E6 Connect', 'Software platforms used to run virtual courses and structured competition formats across hardware systems'],
  ];

  return (
    <SeoPage
      title="Simulator Golf Long Drive Championship | Sim Golf Distance Competition | Ripping Bombs"
      description="The Simulator Golf Long Drive Championship is a global sim golf competition focused on maximum driving distance. Compete, rank, and test your longest drive in virtual golf environments."
    >

      <SeoH1>Simulator Golf Long Drive Championship</SeoH1>

      <SeoP>
        The Simulator Golf Long Drive Championship is a competitive format built around one core idea: 
        <strong>maximum driving distance in a controlled simulator environment</strong>. 
        It brings together golf simulator players, long drive enthusiasts, and competitive hitters to test how far the ball can travel under standardised conditions.
      </SeoP>

      <SeoP>
        Unlike traditional golf, where scoring and course management define success, this format strips the game back to its most explosive element — the tee shot. Each player’s longest valid drive is recorded for ranking purposes.
      </SeoP>

      <SeoH2>How the Championship Format Works</SeoH2>

      <SeoTable
        headers={['Component', 'Description']}
        rows={formatRows}
      />

      <SeoP>
        The structure is designed to remove ambiguity and create a fair global comparison of driving distance. 
        Every participant competes under a consistent ruleset appropriate to their simulator environment.
      </SeoP>

      <SeoH2>What Determines Distance in Simulator Golf?</SeoH2>

      <SeoP>
        Long drive performance in simulator golf is driven by a combination of speed, launch conditions, and strike quality. 
        While raw strength plays a role, optimisation of swing mechanics and launch data is often more important than brute force.
      </SeoP>

      <SeoTable
        headers={['Metric', 'Role in Distance']}
        rows={performanceRows}
      />

      <SeoP>
        In elite simulator long drive conditions, total distance can exceed 400–450 yards depending on settings, strike quality, and launch optimisation.
      </SeoP>

      <SeoH2>Simulator Platforms Used in Competition</SeoH2>

      <SeoP>
        The championship is designed to be platform-agnostic, meaning players can compete across multiple simulator systems as long as conditions are standardised.
      </SeoP>

      <SeoTable
        headers={['Platform', 'Description']}
        rows={simPlatforms}
      />

      <SeoH2>Why Simulator Long Drive Is Growing</SeoH2>

      <SeoP>
        Simulator golf has unlocked a new form of competition that was previously limited by geography, weather, and access to facilities. 
        Long drive formats are particularly well suited to this environment because they are simple, repeatable, and highly shareable.
      </SeoP>

      <SeoP>
        Players can now compete in distance-based events year-round, from anywhere in the world, without needing to attend physical tournaments. 
        This has created a new category of digital-first golf competition that sits between gaming, sport, and performance analytics.
      </SeoP>

      <SeoH2>The Future of Long Drive Competition</SeoH2>

      <SeoP>
        As simulator accuracy continues to improve, long drive competition is expected to evolve into a recognised digital sport category. 
        Leaderboards, seasonal championships, and community-driven events will likely become the standard format for participation.
      </SeoP>

      <SeoP>
        The Simulator Golf Long Drive Championship represents the early structure of that shift — where raw driving power becomes a measurable, comparable global metric.
      </SeoP>

      <SeoCTA />

    </SeoPage>
  );
}