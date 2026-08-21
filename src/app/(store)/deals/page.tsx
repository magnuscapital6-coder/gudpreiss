import React from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/store/product/ProductCard';
import { getProducts } from '@/lib/db/db-provider';
import { Flame } from 'lucide-react';

export const metadata = {
  title: 'Hot Gadgets Deals & Flash Discounts | GudPreiss',
  description: 'Special offers and discount tech gadgets up to 25% off.',
};

export default async function DealsPage() {
  const products = await getProducts({ onSale: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hot Gadgets Deals</h1>
            <p className="text-xs text-slate-500 mt-1">Save up to 25% on flagship smartphones, ultrabooks, and smart home tech.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
