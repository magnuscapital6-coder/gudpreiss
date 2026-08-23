import { describe, it, expect } from 'vitest';
import { generateProductSEOArticle } from '../src/lib/seo/auto-article-generator';
import { runDailyAutoArticleGenerationBatch } from '../src/lib/seo/auto-article-scheduler';
import { Product } from '../src/types';

const mockProduct: Product = {
  id: 'prod-test-ebike',
  name: 'SCOTT Aspect eRIDE 930 E-Mountainbike',
  slug: 'scott-aspect-eride-930',
  description: 'Un VTT électrique performant avec moteur Bosch Performance CX et batterie 625Wh.',
  price: 2799.0,
  compare_at_price: 3299.0,
  stock: 12,
  status: 'active',
  featured: true,
  best_seller: true,
  new_arrival: false,
  on_sale: true,
  category_id: 'cat-ebikes',
  category_name: 'E-Bikes & Elektrofahrräder',
  brand_id: 'brand-scott',
  brand_name: 'SCOTT',
  sku: 'SCOTT-ERIDE-930',
  low_stock_threshold: 3,
  weight_kg: 22.5,
  rating: 4.9,
  review_count: 18,
  images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80'],
  specifications: {
    'Moteur': 'Bosch Performance CX 85Nm',
    'Batterie': 'PowerTube 625Wh',
    'Cadre': 'Aluminium 6061',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Auto SEO Article Generator', () => {
  it('generates a natural language German SEO article targeting Google.de with high score and internal links', () => {
    const result = generateProductSEOArticle(mockProduct, 0);

    expect(result.post.title).toContain('SCOTT Aspect eRIDE 930');
    expect(result.post.title).toMatch(/(Test|Kaufberater)/);
    expect(result.post.content).toContain('/shop/scott-aspect-eride-930');
    expect(result.post.content).toContain('GudPreiss');
    expect(result.post.content).toContain('Spezifikationen');
    expect(result.post.seo_score).toBeGreaterThanOrEqual(90);
    expect(result.post.keywords).toContain('SCOTT Aspect eRIDE 930 E-Mountainbike');
  });

  it('runs a daily auto article generation batch for catalog products', async () => {
    const summary = await runDailyAutoArticleGenerationBatch({
      rateLimitPerProduct: 2,
    });

    expect(summary.success).toBe(true);
    expect(summary.productsProcessed).toBeGreaterThan(0);
    expect(summary.articlesCreated).toBeGreaterThan(0);
    expect(summary.articles.length).toBeGreaterThan(0);
  });
});
