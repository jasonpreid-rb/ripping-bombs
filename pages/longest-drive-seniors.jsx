import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Golf Drive Seniors (55+)" description="Longest golf drives by senior golfers aged 55 and over. Verified competition results on Ripping Bombs." heading="Longest Drives — Seniors (55+)" intro="Age is just a number. Verified competition drives from senior golfers aged 55 and above." filter={e=>e.age>=55} {...props}/>;
}
