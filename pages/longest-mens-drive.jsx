import Link from 'next/link';
import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Men's Golf Drive" description="See the longest men's golf drives recorded in competition worldwide. Verified results from registered clubs on Ripping Bombs." heading="Longest Men's Golf Drives" intro="The longest verified men's competition drives from registered clubs and events worldwide. All entries are official longest drive competition winners." filter={e=>e.gender==='male'||!e.gender} {...props}/>;
}
