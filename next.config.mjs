/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'amsi.ci',
      },
      {
        protocol: 'https',
        hostname: 'abt-distribution.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
