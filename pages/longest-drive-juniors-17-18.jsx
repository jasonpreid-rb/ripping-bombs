import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Cadets (17–18)" description="Longest golf drives by cadet golfers aged 17–18. Verified competition results on Ripping Bombs." heading="Longest Drives — Cadets (17–18)" intro="Verified competition drives from cadet golfers aged 17–18." filter={e=>e.age>=17&&e.age<=18} {...props}/>;
}
