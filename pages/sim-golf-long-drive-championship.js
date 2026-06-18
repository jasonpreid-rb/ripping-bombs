```jsx
import {
  SeoPage,
  SeoH1,
  SeoH2,
  SeoP,
  SeoTable,
  SeoCTA,
} from '../components/SeoPageLayout'

export default function Page() {

  const rows = [
    ['Register', 'Create a free simulator account'],
    ['Choose Category', 'Select your championship division'],
    ['Submit Weekly', 'Upload one verified drive each week'],
    ['Earn Points', 'Weekly ranking determines points'],
    ['Build Ranking', 'Points accumulate all season'],
  ]

  const points = [
    ['1st', '100'],
    ['2nd', '70'],
    ['3rd', '50'],
    ['4th', '40'],
    ['5th', '30'],
    ['6th', '20'],
    ['All Others', '10'],
  ]

  return (
    <SeoPage
      title="Simulator Golf Long Drive Championship | Ripping Bombs"
      description="Season-long simulator golf competition. Submit one drive per week and earn points toward the championship."
    >

      <SeoH1>
        Simulator Golf Long Drive Championship
      </SeoH1>

      <SeoP>
        The Simulator Golf Long Drive Championship is a season-long online golf competition where players submit one verified drive each week and earn points toward a championship ranking.
      </SeoP>

      <SeoP>
        Unlike traditional longest drive events, consistency matters. Every week creates another opportunity to improve your position.
      </SeoP>

      <SeoH2>
        How The Championship Works
      </SeoH2>

      <SeoTable
        headers={['Step', 'Description']}
        rows={rows}
      />

      <SeoP>
        Weekly leaderboards reset, but championship points continue building throughout the season.
      </SeoP>

      <SeoH2>
        Weekly Points
      </SeoH2>

      <SeoTable
        headers={['Position', 'Points']}
        rows={points}
      />

      <SeoP>
        Compete inside your selected category and build your record over time.
      </SeoP>

      <SeoH2>
        Why Simulator Long Drive Is Different
      </SeoH2>

      <SeoP>
        No travel. No weather delays. Just one verified drive each week and a season-long championship built around consistency and distance.
      </SeoP>

      <SeoCTA />

    </SeoPage>
  )
}
```
