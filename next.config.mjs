/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
    serverComponentsExternalPackages: ['pg'],
  },
  async rewrites() {
    return [
      { source: '/admin/Produkte', destination: '/admin/products' },
      { source: '/admin/Produkte/:path*', destination: '/admin/products/:path*' },
      { source: '/admin/produkte', destination: '/admin/products' },
      { source: '/admin/produkte/:path*', destination: '/admin/products/:path*' },
      { source: '/admin/Kategorien', destination: '/admin/categories' },
      { source: '/admin/Kategorien/:path*', destination: '/admin/categories/:path*' },
      { source: '/admin/kategorien', destination: '/admin/categories' },
      { source: '/admin/kategorien/:path*', destination: '/admin/categories/:path*' },
      { source: '/admin/Bestellungen', destination: '/admin/orders' },
      { source: '/admin/Bestellungen/:path*', destination: '/admin/orders/:path*' },
      { source: '/admin/bestellungen', destination: '/admin/orders' },
      { source: '/admin/bestellungen/:path*', destination: '/admin/orders/:path*' },
      { source: '/admin/Lagerbestand', destination: '/admin/inventory' },
      { source: '/admin/Lagerbestand/:path*', destination: '/admin/inventory/:path*' },
      { source: '/admin/lagerbestand', destination: '/admin/inventory' },
      { source: '/admin/lagerbestand/:path*', destination: '/admin/inventory/:path*' },
      { source: '/admin/Marketing', destination: '/admin/marketing' },
      { source: '/admin/Marketing/:path*', destination: '/admin/marketing/:path*' },
      { source: '/admin/Bewertungen', destination: '/admin/reviews' },
      { source: '/admin/Bewertungen/:path*', destination: '/admin/reviews/:path*' },
      { source: '/admin/bewertungen', destination: '/admin/reviews' },
      { source: '/admin/bewertungen/:path*', destination: '/admin/reviews/:path*' },
      { source: '/admin/Kunden', destination: '/admin/customers' },
      { source: '/admin/Kunden/:path*', destination: '/admin/customers/:path*' },
      { source: '/admin/kunden', destination: '/admin/customers' },
      { source: '/admin/kunden/:path*', destination: '/admin/customers/:path*' },
      { source: '/admin/Medien', destination: '/admin/media' },
      { source: '/admin/Medien/:path*', destination: '/admin/media/:path*' },
      { source: '/admin/medien', destination: '/admin/media' },
      { source: '/admin/medien/:path*', destination: '/admin/media/:path*' },
      { source: '/admin/Blog', destination: '/admin/blog' },
      { source: '/admin/Blog/:path*', destination: '/admin/blog/:path*' },
      { source: '/Blog', destination: '/blog' },
      { source: '/Blog/:path*', destination: '/blog/:path*' },
    ];
  },
};

export default nextConfig;
