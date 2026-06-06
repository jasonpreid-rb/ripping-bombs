import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Juniors Under 12" description="Longest golf drives by junior golfers under 12. Verified competition results on Ripping Bombs." heading="Longest Drives — Juniors (Under 12)" intro="The next generation of big hitters. Verified results from junior golfers aged 11 and under." filter={e=>e.age<=11} {...props}/>;
}
