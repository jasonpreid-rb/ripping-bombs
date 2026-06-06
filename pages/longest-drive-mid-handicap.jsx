import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Mid Handicap (6–14)" description="Longest golf drives by mid handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Mid Handicap (6–14)" intro="Where the game is won and lost. The longest verified competition drives from mid handicap golfers." filter={e=>e.hcp>=6&&e.hcp<=14} {...props}/>;
}
