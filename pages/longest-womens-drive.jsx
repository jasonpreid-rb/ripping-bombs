import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Women's Golf Drive" description="See the longest women's golf drives recorded in competition worldwide. Verified results from registered clubs on Ripping Bombs." heading="Longest Women's Golf Drives" intro="The longest verified women's competition drives from registered clubs and events worldwide." filter={e=>e.gender==='female'} {...props}/>;
}
