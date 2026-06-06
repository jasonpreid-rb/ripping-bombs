import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drives In The United Kingdom" description="See the longest verified competition golf drives in the UK. Real results from registered clubs on Ripping Bombs." heading="Longest Golf Drives In The United Kingdom" intro="Verified competition longest drive results from registered clubs and tournament organisers in the United Kingdom." filter={e=>{ const org=props.orgs?.find(o=>o.id===e.orgId); return org?.country==='GB'; }} {...props}/>;
}
