import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart/',
          '/checkout/',
          '/account/',
          '/settings/',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
