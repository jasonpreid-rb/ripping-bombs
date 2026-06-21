import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Low Handicap (0–5)" description="Longest golf drives by low handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Low Handicap (0–5)" intro="Skill meets power. The longest verified competition drives from low handicap golfers worldwide." filter={e=>e.hcp>=0&&e.hcp<=5} {...props}/>;
}
