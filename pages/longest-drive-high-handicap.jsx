import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive High Handicap (15+)" description="Longest golf drives by high handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — High Handicap (15+)" intro="Proof that big drives aren't just for low handicappers. Verified competition longest drives from high handicap golfers." filter={e=>e.hcp>=15} {...props}/>;
}
