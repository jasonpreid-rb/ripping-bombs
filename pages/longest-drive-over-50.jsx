import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Over 50" description="Longest golf drives by golfers aged 50 and over. Verified competition results on Ripping Bombs." heading="Longest Drives — Over 50s" intro="The longest verified competition drives from golfers aged 50 and above." filter={e=>e.age>=50} {...props}/>;
}
