'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Product, Banner, Category } from '@/types';

// ── Skeleton placeholders shown while chunks load ─────────
function SectionSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className={`${height} bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse`} />
  );
}

function HeroSkeleton() {
  return <SectionSkeleton height="h-[500px]" />;
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SectionSkeleton key={i} height="h-64" />
      ))}
    </div>
  );
}

// ── Dynamic imports with ssr: false for code splitting ────
// Each component becomes its own chunk, loaded only when needed.
// The skeleton is rendered server-side and during initial client load.

const HeroSlider = dynamic(
  () => import('./HeroSlider').then((m) => m.HeroSlider),
  { ssr: false, loading: () => <HeroSkeleton /> }
);

const CategoryGridSection = dynamic(
  () => import('./CategoryGridSection').then((m) => m.CategoryGridSection),
  { ssr: false, loading: () => <SectionSkeleton height="h-32" /> }
);

const SpecialDealsSection = dynamic(
  () => import('./SpecialDealsSection').then((m) => m.SpecialDealsSection),
  { ssr: false, loading: () => <SectionSkeleton height="h-80" /> }
);

const FeaturedProductsSection = dynamic(
  () => import('./FeaturedProductsSection').then((m) => m.FeaturedProductsSection),
  { ssr: false, loading: () => <GridSkeleton /> }
);

const TopRatedSection = dynamic(
  () => import('./TopRatedSection').then((m) => m.TopRatedSection),
  { ssr: false, loading: () => <GridSkeleton /> }
);

const SmartHomeRoboticsSection = dynamic(
  () => import('./SmartHomeRoboticsSection').then((m) => m.SmartHomeRoboticsSection),
  { ssr: false, loading: () => <SectionSkeleton height="h-64" /> }
);

const TrustGuaranteeBar = dynamic(
  () => import('./TrustGuaranteeBar').then((m) => m.TrustGuaranteeBar),
  { ssr: false, loading: () => <SectionSkeleton height="h-24" /> }
);

const JustArrivedSection = dynamic(
  () => import('./JustArrivedSection').then((m) => m.JustArrivedSection),
  { ssr: false, loading: () => <GridSkeleton /> }
);

const CategoryPromoCards = dynamic(
  () => import('./CategoryPromoCards').then((m) => m.CategoryPromoCards),
  { ssr: false, loading: () => <SectionSkeleton height="h-40" /> }
);

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
      <CategoryPromoCards />
    </>
  );
}
