import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In Germany" description="See the longest verified competition golf drives in Germany. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In Germany" intro="Verified competition longest drive results from registered clubs and tournament organisers in Germany." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='DE'; }} {...props}/>;
}
