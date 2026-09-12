/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/golf-long-drive-competition',
        destination: '/golf-longest-drive-competition',
        permanent: true,
      },
      // Cluster 1 (average distance) — merged into average-golf-drive-distance-by-age,
      // which had the more developed content (live rank-preview hook vs static tables).
      { source: '/average-driver-distance', destination: '/average-golf-drive-distance-by-age', permanent: true },
      { source: '/average-driver-distance-by-handicap', destination: '/average-golf-drive-distance-by-age', permanent: true },
      { source: '/average-golf-drive-distance', destination: '/average-golf-drive-distance-by-age', permanent: true },
      { source: '/golf-handicap-driving-distance', destination: '/average-golf-drive-distance-by-age', permanent: true },
      // Near-duplicate of 2027-championship.jsx (same points system, categories,
      // and season structure) — merged rather than left to compete against it.
      { source: '/sim-golf-long-drive-championship', destination: '/2027-championship', permanent: true },
      // Cluster 2 (simulator leagues & rankings) — merged into
      // indoor-golf-league-ranking-system, which had the more developed
      // content (live RBR# ranking data vs static templates).
      { source: '/indoor-golf-league', destination: '/indoor-golf-league-ranking-system', permanent: true },
      { source: '/simulator-golf-league', destination: '/indoor-golf-league-ranking-system', permanent: true },
      { source: '/golf-simulator-leaderboard', destination: '/indoor-golf-league-ranking-system', permanent: true },
      // Cluster 3 (running a longest-drive event) — merged into
      // golf-longest-drive-competition, the broadest/most-searched phrasing.
      // how-to-host-a-golf-simulator-event's working "Request an Event" form
      // and venue-booking content were carried over, not just discarded.
      { source: '/longest-drive-challenge', destination: '/golf-longest-drive-competition', permanent: true },
      { source: '/golf-club-longest-drive-competition-ideas', destination: '/golf-longest-drive-competition', permanent: true },
      { source: '/how-to-host-a-golf-simulator-event', destination: '/golf-longest-drive-competition', permanent: true },
      { source: '/how-to-promote-your-golf-event', destination: '/golf-longest-drive-competition', permanent: true },
      { source: '/simulator-golf-competition', destination: '/golf-longest-drive-competition', permanent: true },
    ]
  },
}
module.exports = nextConfig
