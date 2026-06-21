import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Youth (13–16)" description="Longest golf drives by youth golfers aged 13–16. Verified competition results on Ripping Bombs." heading="Longest Drives — Youth (13–16)" intro="Verified competition drives from youth golfers aged 13–16." filter={e=>e.age>=13&&e.age<=16} {...props}/>;
}
