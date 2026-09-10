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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sasuboisservice.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Brennholz, Holzpellets ENplus A1 & Ster Holz kaufen | SASU BOIS SERVICE',
    template: '%s | SASU BOIS SERVICE',
  },
  description: 'Kaufen Sie erstklassiges Brennholz (Buche & Eiche 25 cm, 30 cm, 33 cm, 50 cm), zertifizierte Holzpellets ENplus A1 & Stère Holz auf Palette bei SASU BOIS SERVICE. Kostenloser Speditionsversand ab 500 €.',
  keywords: [
    'brennholz kaufen 25 cm',
    'brennholz palette 2 m3',
    'holzpellets enplus a1 kaufen',
    'ster holz buche eiche',
    'holzbriketts ruf hartholz',
    'anzündholz nadelholz',
    'sasu bois service',
    'brennholz lieferung deutschland',
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
    title: 'SASU BOIS SERVICE — Brennholz & Holzpellets Spezialist',
    description: 'Hochwertiges Kaminholz, gestapelte Paletten (2 m³) und zertifizierte Holzpellets ENplus A1 mit kostenloser Speditionslieferung ab 500 €.',
    url: siteUrl,
    siteName: 'SASU BOIS SERVICE',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'SASU BOIS SERVICE — Brennholz, Pellets & Ster Holz',
        type: 'image/png',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SASU BOIS SERVICE — Brennholz & Holzpellets Online-Shop',
    description: 'Kaminfertiges Brennholz, Holzbriketts RUF & Holzpellets ENplus A1 mit schnelle Speditionslieferung.',
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
        name: 'SASU BOIS SERVICE',
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        image: `${siteUrl}/icon.svg`,
        description: 'Spezialisierter Online-Händler für Brennholz, Holzpellets ENplus A1, Stère Holz und Holzbriketts RUF.',
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: 'BankTransfer SEPA Vorkasse',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'FR',
          addressLocality: 'Caudry',
          postalCode: '59540',
          streetAddress: '29 Rue Auguste Marliot',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+49-15731294173',
          contactType: 'customer service',
          email: 'contact@sasuboisservice.com',
          availableLanguage: ['German', 'French'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'SASU BOIS SERVICE',
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
