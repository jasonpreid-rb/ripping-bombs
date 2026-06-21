import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Japan" description="See the longest verified competition golf drives in Japan. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Japan" intro="Verified competition longest drive results from registered clubs and tournament organisers in Japan." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='JP'; }} {...props}/>;
}
