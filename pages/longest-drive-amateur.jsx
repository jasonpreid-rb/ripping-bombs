import { FilteredLeaderboard } from '../components/SeoPageLayout';
export default function Page(props) {
  return <FilteredLeaderboard title="Longest Drive Amateur Golfers (HCP 10+)" description="Longest golf drives by amateur golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Amateur Golfers (HCP 10+)" intro="Verified competition longest drives from amateur golfers with handicap 10 and above." filter={e=>e.hcp>=10} {...props}/>;
}
