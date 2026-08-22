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
    serverComponentsExternalPackages: ['pg'],
  async rewrites() {
    return [
      {
        source: '/admin/Produkte',
        destination: '/admin/products',
      },
      {
        source: '/admin/Produkte/:path*',
        destination: '/admin/products/:path*',
      },
      {
        source: '/admin/produkte',
        destination: '/admin/products',
      },
      {
        source: '/admin/produkte/:path*',
        destination: '/admin/products/:path*',
      },
      {
        source: '/admin/Blog',
        destination: '/admin/blog',
      },
      {
        source: '/admin/Blog/:path*',
        destination: '/admin/blog/:path*',
      },
    ];
  },
};

export default nextConfig;
