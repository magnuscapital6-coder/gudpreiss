import React from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HomepageSections } from '@/components/store/home/HomepageSections';
import { getProducts, getBanners, getCategories } from '@/lib/db/db-provider';

export const revalidate = 60;

export const metadata = {
  title: 'E-Bikes & PlayStation 5 online kaufen | Gudpreiss Deutschland',
  description: 'Kaufen Sie Premium E-Bikes (SCOTT, CUBE, Haibike, Conway) & Sony PlayStation 5 Konsolen, DualSense Controller & VR2 günstig online bei Gudpreiss. Kostenloser Versand ab 50 € & 30 Tage Rückgabe in Deutschland.',
  alternates: {
    canonical: 'https://gudpreiss.de',
    languages: {
      'de-DE': 'https://gudpreiss.de',
      'de': 'https://gudpreiss.de',
      'x-default': 'https://gudpreiss.de',
    },
  },
};

export default async function HomePage() {
  const [products, banners, categories] = await Promise.all([
    getProducts(),
    getBanners(),
    getCategories(),
  ]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Wie schnell erfolgt der Versand innerhalb von Deutschland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Der Versand erfolgt innerhalb von 24 Stunden nach Zahlungseingang. Die Lieferung innerhalb von Deutschland dauert 1 bis 3 Werktage.',
        },
      },
      {
        '@type': 'Question',
        name: 'Bietet GudPreiss eine Garantie auf Elektronikprodukte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, alle Produkte enthalten eine volle 2-jährige Herstellergarantie sowie ein 30-tägiges Rückgaberecht.',
        },
      },
      {
        '@type': 'Question',
        name: 'Welche Zahlungsmethoden stehen zur Verfügung?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sie können sicher per SEPA-Banküberweisung, Vorkasse sowie allen gängigen Kreditkarten bezahlen.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-slate-950 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <CartDrawer />

      <main className="flex-1 mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8 space-y-4">
        <h1 className="sr-only">
          Gudpreiss Deutschland — E-Bikes, PlayStation 5 Konsolen &amp; Premium Elektronik Online Shop
        </h1>
        {/* All homepage sections loaded dynamically for code-splitting */}
        <HomepageSections products={products} banners={banners} categories={categories} />
      </main>

      <Footer />
    </div>
  );
}
