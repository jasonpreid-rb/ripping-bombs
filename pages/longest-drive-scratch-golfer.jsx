import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Drive Scratch Golfers" description="Longest golf drives by scratch golfers (handicap 0 and under). Verified competition results on Ripping Bombs." heading="Longest Drives — Scratch Golfers (HCP 0 & Under)" intro="The elite end of the leaderboard. Verified competition longest drives from scratch and plus-handicap golfers." filter={e=>e.hcp<=0} {...props}/>;
}
