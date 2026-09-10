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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GudPreiss — E-Bikes, PlayStation 5 & Elektronik Online-Shop',
    template: '%s | GudPreiss',
  },
  description: 'Kaufen Sie hochwertige E-Bikes, PlayStation 5 Konsolen, Audio, Smartphones & Technik-Highlights bei GudPreiss. Kostenloser Speditions- & Paketversand ab 500 € in Deutschland.',
  keywords: [
    'e-bikes online kaufen',
    'playstation 5 pro deutschland',
    'dualsense controller ps5',
    'elektronik online shop deutschland',
    'gudpreiss',
    'smartphones und gadgets',
    'kopfhörer noise cancelling',
    'technik angebote'
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
    canonical: siteUrl,
    languages: {
      'de-DE': siteUrl,
      'de': siteUrl,
      'fr-FR': siteUrl,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    title: 'GudPreiss — E-Bikes, PlayStation 5 & Elektronik Online-Shop',
    description: 'Hochwertige E-Bikes, PlayStation 5 Konsolen, Zubehör & modernste Elektronik online bestellen bei GudPreiss mit schnellem Versand.',
    url: siteUrl,
    siteName: 'GudPreiss',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'GudPreiss — E-Bikes & PlayStation 5 Store Deutschland',
        type: 'image/png',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GudPreiss — E-Bikes, PlayStation 5 & Elektronik Online-Shop',
    description: 'Hochwertige E-Bikes, PlayStation 5 Konsolen, Zubehör & modernste Elektronik online bestellen bei GudPreiss mit schnellem Versand.',
    images: [`${siteUrl}/opengraph-image`],
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': `${siteUrl}/#store`,
        name: 'GudPreiss',
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        image: `${siteUrl}/icon.svg`,
        description: 'Spezialisierter Online-Händler für E-Bikes, PlayStation 5 Konsolen, IT & Unterhaltungselektronik in Deutschland.',
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: 'BankTransfer SEPA Vorkasse',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DE',
          addressLocality: 'Berlin',
          postalCode: '10117',
          streetAddress: 'Friedrichstraße 123',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+49-15731294173',
          contactType: 'customer service',
          email: 'kontakt@gudpreiss.de',
          availableLanguage: ['German'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'GudPreiss',
        publisher: {
          '@id': `${siteUrl}/#store`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/shop?search={search_term_string}`,
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
