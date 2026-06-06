import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Sweden" description="See the longest verified competition golf drives in Sweden. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Sweden" intro="Verified competition longest drive results from registered clubs and tournament organisers in Sweden." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='SE'; }} {...props}/>;
}
