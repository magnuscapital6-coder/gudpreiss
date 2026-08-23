'use client';

import { Product, Banner, Category } from '@/types';
import { HeroSlider } from './HeroSlider';
import { CategoryGridSection } from './CategoryGridSection';
import { SpecialDealsSection } from './SpecialDealsSection';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import { TopRatedSection } from './TopRatedSection';
import { SmartHomeRoboticsSection } from './SmartHomeRoboticsSection';
import { TrustGuaranteeBar } from './TrustGuaranteeBar';
import { JustArrivedSection } from './JustArrivedSection';
import { CategoryPromoCards } from './CategoryPromoCards';

// ── Exported wrapper component ────────────────────────────
interface HomepageSectionsProps {
  products: Product[];
  banners: Banner[];
  categories: Category[];
}

export function HomepageSections({ products, banners, categories }: HomepageSectionsProps) {
  const heroBanners = banners.filter((b) => b.position === 'hero');

  return (
    <>
      <HeroSlider banners={heroBanners} products={products} />
      <CategoryGridSection categories={categories} products={products} />
      <SpecialDealsSection products={products} />
      <FeaturedProductsSection products={products} />
      <TopRatedSection products={products} />
      <SmartHomeRoboticsSection products={products} />
      <TrustGuaranteeBar />
      <JustArrivedSection products={products} />
      <CategoryPromoCards products={products} />
    </>
  );
}
