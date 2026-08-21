'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { SectionHeader } from '@/components/ui/section-header';
import { useTranslation } from '@/context/language-context';

interface SecondFeaturedSectionProps {
  products: Product[];
}

export function SecondFeaturedSection({ products }: SecondFeaturedSectionProps) {
  const { t } = useTranslation();
  const secondProducts = products.slice(3, 6);

  return (
    <section className="my-4 sm:my-5">
      <SectionHeader title={t('home.featuredProducts')} viewAllHref="/shop" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {secondProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
