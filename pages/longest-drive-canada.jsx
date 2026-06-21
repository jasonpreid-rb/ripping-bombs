import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Canada" description="See the longest verified competition golf drives in Canada. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Canada" intro="Verified competition longest drive results from registered clubs and tournament organisers in Canada." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='CA'; }} {...props}/>;
}
