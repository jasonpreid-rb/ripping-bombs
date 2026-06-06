import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Portugal" description="See the longest verified competition golf drives in Portugal. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Portugal" intro="Verified competition longest drive results from registered clubs and tournament organisers in Portugal." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='PT'; }} {...props}/>;
}
