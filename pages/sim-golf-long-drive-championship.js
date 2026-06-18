```jsx
import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';

export default function Page() {

  const steps = [
    ['Register Free', 'Create a simulator account and join the community'],
    ['Choose Category', 'Select one championship category when the season opens'],
    ['Submit Weekly', 'Upload one verified drive each week'],
    ['Earn Points', 'Weekly rankings determine your points total'],
    ['Climb Rankings', 'Points accumulate across the entire season'],
  ];

  const points = [
    ['1st', '100'],
    ['2nd', '70'],
    ['3rd', '50'],
    ['4th', '40'],
    ['5th', '30'],
    ['6th', '20'],
    ['All Other Entries', '10'],
  ];

  const categories = [
    ['Men', 'Age 16–54 · Handicap under 20'],
    ['Men High Handicap', 'Age 16–54 · Handicap 20+'],
    ['Women', 'Age 16–54 · Handicap under 20'],
    ['Women High Handicap', 'Age 16–54 · Handicap 20+'],
    ['Youth', 'Under 16'],
    ['Senior', 'Age 55+'],
  ];

  const equipment = [
    ['TrackMan', 'Accepted'],
    ['GCQuad / Foresight', 'Accepted'],
    ['Mevo+', 'Accepted'],
    ['Equivalent calibrated launch monitors', 'Accepted'],
  ];

  return (
    <SeoPage
      title="Simulator Golf Long Drive Championship | Online Sim Golf Competition | Ripping Bombs"
      description="Compete in the Simulator Golf Long Drive Championship. Submit one verified drive per week, earn points, climb the leaderboard, and compete all season."
    >

      <SeoH1>Simulator Golf Long Drive Championship</SeoH1>

      <SeoP>
        The Simulator Golf Long Drive Championship is a season-long online golf competition built around one simple concept:
        submit your best simulator drive each week and earn points toward your championship ranking.
      </SeoP>

      <SeoP>
        Unlike traditional long drive events that reward a single standout performance, this format rewards consistency.
        Every week creates another opportunity to improve your ranking and build your season record.
      </SeoP>

      <SeoH2>How Simulator Long Drive Competition Works</SeoH2>

      <SeoTable
        headers={['Step', 'Description']}
        rows={steps}
      />

      <SeoP>
        Weekly leaderboards reset regularly, but championship points continue accumulating throughout the season.
        The goal is simple: show up, submit consistently, and keep climbing.
      </SeoP>

      <SeoH2>What Makes This Different?</SeoH2>

      <SeoP>
        Most longest drive competitions are decided in a single day.
        The Ripping Bombs Simulator Championship is designed as an ongoing season where consistency becomes just as valuable as distance.
      </SeoP>

      <SeoP>
        Because simulator golf removes weather and travel barriers, competitors can participate from almost anywhere using supported launch monitor technology.
      </SeoP>

      <SeoH2>Weekly Championship Points</SeoH2>

      <SeoTable
        headers={['Position', 'Points']}
        rows={points}
      />

      <SeoP>
        Points are awarded within your selected category only.
        Every weekly submission contributes toward your overall championship position.
      </SeoP>

      <SeoH2>Championship Categories</SeoH2>

      <SeoTable
        headers={['Category', 'Eligibility']}
        rows={categories}
      />

      <SeoP>
        Players compete in one category for the season.
        Categories are designed to create fair competition across age, handicap, and player type.
      </SeoP>

      <SeoH2>Accepted Simulator Equipment</SeoH2>

      <SeoTable
        headers={['Equipment', 'Status']}
        rows={equipment}
      />

      <SeoP>
        Verified submissions require launch monitor evidence showing measured distance.
        This creates a consistent and trusted environment for all competitors.
      </SeoP>

      <SeoH2>Consistency Beats One Massive Drive</SeoH2>

      <SeoP>
        Winning this championship is not simply about producing one extraordinary shot.
        Players who consistently submit and accumulate points over months are positioned to move up the rankings.
      </SeoP>

      <SeoP>
        That combination of power and persistence is what makes simulator long drive competition unique.
      </SeoP>

      <SeoH2>Prepare Before January 2027</SeoH2>

      <SeoP>
        Registration is open before points begin accumulating.
        Joining early lets players establish their profile, submit drives, and become familiar with the leaderboard before the season begins.
      </SeoP>

      <SeoP>
        Ready to see where your distance stacks up?
        Learn more about the championship and start building your record today.
      </SeoP>

      <SeoCTA
        title="Ready To Compete?"
        description="Learn how the 2027 Simulator Championship works and start building your record."
        primaryText="VIEW 2027 CHAMPIONSHIP"
        primaryHref="/2027-championship"
        secondaryText="VIEW LEADERBOARD"
        secondaryHref="/leaderboard"
      />

    </SeoPage>
  );
}
```
