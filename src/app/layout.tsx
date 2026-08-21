import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';
import { StoreSettingsProvider } from '@/context/store-settings-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de'),
  title: {
    default: 'Elektronik & Tech-Gadgets online kaufen | GudPreiss Deutschland',
    template: '%s | GudPreiss Deutschland',
  },
  description: 'Entdecken Sie neueste Smartphones, Laptops, Noise-Cancelling Kopfhörer & Smart-Home Roboter online bei GudPreiss. Kostenloser Versand & 30 Tage Rückgabe in Deutschland.',
  keywords: [
    'elektronik online kaufen',
    'smartphones kaufen deutschland',
    'laptops angebote',
    'kopfhörer testsieger',
    'gaming controller günstig',
    'smart home robotik',
    'gudpreiss store',
  ],
  alternates: {
    canonical: 'https://gudpreiss.de',
    languages: {
      'de-DE': 'https://gudpreiss.de',
      'de': 'https://gudpreiss.de',
      'x-default': 'https://gudpreiss.de',
    },
  },
  openGraph: {
    title: 'GudPreiss — Erstklassige Elektronik & Tech-Gadgets Deutschland',
    description: 'Beste Elektronik-Angebote mit verifizierten Testberichten und schnellem Versand in Deutschland.',
    url: 'https://gudpreiss.de',
    siteName: 'GudPreiss',
    locale: 'de_DE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD Organization & WebSite Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://gudpreiss.de/#organization',
        name: 'GudPreiss Deutschland',
        url: 'https://gudpreiss.de',
        logo: 'https://gudpreiss.de/logo.png',
        description: 'Erstklassiger E-Commerce Händler für Elektronik, Smartphones, Laptops und Smart Home in Deutschland.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DE',
          addressLocality: 'Berlin',
          postalCode: '10117',
          streetAddress: 'Friedrichstraße 12',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://gudpreiss.de/#website',
        url: 'https://gudpreiss.de',
        name: 'GudPreiss Deutschland',
        publisher: {
          '@id': 'https://gudpreiss.de/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://gudpreiss.de/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="de" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased text-slate-900 bg-background transition-colors duration-300`}>
        <StoreSettingsProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    {children}
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
