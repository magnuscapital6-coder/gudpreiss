import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';
import { StoreSettingsProvider } from '@/context/store-settings-context';
import { GupreissChatWidget } from '@/components/ai/GupreissChatWidget';
import { CookieConsentBanner } from '@/components/store/privacy/CookieConsentBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de'),
  title: {
    default: 'E-Bikes & PlayStation 5 online kaufen | Gudpreiss Deutschland',
    template: '%s | Gudpreiss Deutschland',
  },
  description: 'Kaufen Sie Premium E-Bikes (SCOTT, CUBE, Haibike, Conway) & Sony PlayStation 5 Konsolen, DualSense Controller & VR2 günstig online bei Gudpreiss. Kostenloser Versand ab 50 € & 30 Tage Rückgabe in Deutschland.',
  keywords: [
    'e-bikes online kaufen deutschland',
    'elektrofahrrad kaufen',
    'cube e-bike angebote',
    'scott lumen eride',
    'playstation 5 pro kaufen',
    'ps5 konsole günstig',
    'dualsense controller sonderangebot',
    'gudpreiss store',
    'gudpreiss deutschland',
  ],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://gudpreiss.de',
    languages: {
      'de-DE': 'https://gudpreiss.de',
      'de': 'https://gudpreiss.de',
      'x-default': 'https://gudpreiss.de',
    },
  },
  openGraph: {
    title: 'Gudpreiss — E-Bikes & PlayStation 5 Store Deutschland',
    description: 'Beste Angebote für Elektrofahrräder von CUBE, SCOTT, Haibike sowie originale Sony PlayStation 5 Konsolen mit verifizierter Garantie.',
    url: 'https://gudpreiss.de',
    siteName: 'Gudpreiss',
    images: [
      {
        url: 'https://gudpreiss.de/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Gudpreiss Store Deutschland — E-Bikes & PlayStation 5',
        type: 'image/png',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gudpreiss — E-Bikes & PlayStation 5 Store Deutschland',
    description: 'Beste Angebote für Elektrofahrräder und Sony PlayStation 5 Konsolen mit schnellem Versand.',
    images: ['https://gudpreiss.de/opengraph-image'],
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
  // Enhanced JSON-LD Organization, OnlineStore & WebSite Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': 'https://gudpreiss.de/#store',
        name: 'Gudpreiss Deutschland',
        url: 'https://gudpreiss.de',
        logo: 'https://gudpreiss.de/icon.svg',
        image: 'https://gudpreiss.de/icon.svg',
        description: 'Offizieller E-Commerce Händler für Premium E-Bikes (CUBE, SCOTT, Haibike) und Sony PlayStation 5 Hardware in Deutschland.',
        priceRange: '€€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: 'Klarna, PayPal, Credit Card, Apple Pay, Google Pay, SEPA Direct Debit',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DE',
          addressLocality: 'Berlin',
          postalCode: '10115',
          streetAddress: 'Gudpreiss Straße 42',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+49-30-12345678',
          contactType: 'customer service',
          email: 'kontakt@gudpreiss.de',
          availableLanguage: ['German', 'English'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://gudpreiss.de/#website',
        url: 'https://gudpreiss.de',
        name: 'Gudpreiss Deutschland',
        publisher: {
          '@id': 'https://gudpreiss.de/#store',
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
                    <GupreissChatWidget />
                    <CookieConsentBanner />
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
