import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Nigeria" description="See the longest verified competition golf drives in Nigeria. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Nigeria" intro="Verified competition longest drive results from registered clubs and tournament organisers in Nigeria." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='NG'; }} {...props}/>;
}
