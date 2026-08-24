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
    ]
  },
}
module.exports = nextConfig
