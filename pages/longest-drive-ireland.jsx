import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Ireland" description="See the longest verified competition golf drives in Ireland. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Ireland" intro="Verified competition longest drive results from registered clubs and tournament organisers in Ireland." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='IE'; }} {...props}/>;
}
