import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In The United States" description="See the longest verified competition golf drives in USA. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In The United States" intro="Verified competition longest drive results from registered clubs and tournament organisers in The United States." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return (org?.country||'').toUpperCase()==='US'; }} showCategoryRecords {...props}/>;
}
