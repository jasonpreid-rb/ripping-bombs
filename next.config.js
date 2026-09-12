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
    ]
  },
}
module.exports = nextConfig
