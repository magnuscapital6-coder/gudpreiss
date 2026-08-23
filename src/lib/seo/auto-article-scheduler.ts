import { getProducts, createBlogPost, getBlogPosts } from '@/lib/db/db-provider';
import { Product, BlogPost } from '@/types';
import { generateProductSEOArticle, GeneratedArticleResult } from './auto-article-generator';

export interface AutoArticleConfig {
  enabled: boolean;
  articlesPerProductPerDay: 1 | 2;
  lastRunTimestamp: string | null;
  totalArticlesGenerated: number;
}

export interface ProductCoverageItem {
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  articlesCount: number;
  lastGeneratedAt: string | null;
  latestArticleTitle: string | null;
  latestArticleSlug: string | null;
}

export interface BatchGenerationSummary {
  success: boolean;
  timestamp: string;
  productsProcessed: number;
  articlesCreated: number;
  articles: Partial<BlogPost>[];
  errors: string[];
}

// In-Memory state fallback for configuration and tracking
let globalConfig: AutoArticleConfig = {
  enabled: true,
  articlesPerProductPerDay: 2,
  lastRunTimestamp: new Date().toISOString(),
  totalArticlesGenerated: 0,
};

// Map storing generated articles history per product ID
const productArticlesHistoryMap = new Map<string, { count: number; lastGeneratedAt: string; latestTitle: string; latestSlug: string }>();

/**
 * Returns current scheduler configuration
 */
export function getAutoArticleGeneratorConfig(): AutoArticleConfig {
  return { ...globalConfig };
}

/**
 * Updates scheduler configuration settings
 */
export function updateAutoArticleGeneratorConfig(updates: Partial<AutoArticleConfig>): AutoArticleConfig {
  globalConfig = {
    ...globalConfig,
    ...updates,
  };
  return { ...globalConfig };
}

/**
 * Runs a complete batch generation cycle across all catalog products or a targeted product.
 * Generates 1 to 2 articles per product as configured.
 */
export async function runDailyAutoArticleGenerationBatch(options?: {
  productId?: string;
  rateLimitPerProduct?: 1 | 2;
  force?: boolean;
}): Promise<BatchGenerationSummary> {
  const timestamp = new Date().toISOString();
  const rateLimit = options?.rateLimitPerProduct || globalConfig.articlesPerProductPerDay || 2;
  const articlesCreated: Partial<BlogPost>[] = [];
  const errors: string[] = [];

  try {
    const allProducts = await getProducts();
    const targetProducts = options?.productId
      ? allProducts.filter((p) => p.id === options.productId || p.slug === options.productId)
      : allProducts;

    if (targetProducts.length === 0) {
      return {
        success: false,
        timestamp,
        productsProcessed: 0,
        articlesCreated: 0,
        articles: [],
        errors: ['Aucun produit trouvé dans le catalogue pour la génération d\'articles.'],
      };
    }

    for (const product of targetProducts) {
      const history = productArticlesHistoryMap.get(product.id) || {
        count: 0,
        lastGeneratedAt: '',
        latestTitle: '',
        latestSlug: '',
      };

      for (let i = 0; i < rateLimit; i++) {
        try {
          const generated: GeneratedArticleResult = generateProductSEOArticle(product, history.count + i);
          const created = await createBlogPost(generated.post);

          articlesCreated.push(created);

          // Update local history tracker
          history.count += 1;
          history.lastGeneratedAt = timestamp;
          history.latestTitle = created.title || '';
          history.latestSlug = created.slug || '';
          productArticlesHistoryMap.set(product.id, history);
        } catch (err: any) {
          errors.push(`Erreur génération pour ${product.name} (article #${i + 1}): ${err.message || err}`);
        }
      }
    }

    // Update global config stats
    globalConfig.lastRunTimestamp = timestamp;
    globalConfig.totalArticlesGenerated += articlesCreated.length;

    return {
      success: errors.length === 0,
      timestamp,
      productsProcessed: targetProducts.length,
      articlesCreated: articlesCreated.length,
      articles: articlesCreated,
      errors,
    };
  } catch (err: any) {
    return {
      success: false,
      timestamp,
      productsProcessed: 0,
      articlesCreated: 0,
      articles: [],
      errors: [err.message || 'Erreur inconnue lors du lot de génération.'],
    };
  }
}

/**
 * Returns coverage analytics per product
 */
export async function getProductCoverageAnalytics(): Promise<{
  totalProducts: number;
  coveredProductsCount: number;
  totalArticlesCount: number;
  coverageList: ProductCoverageItem[];
}> {
  const products = await getProducts();
  const allPosts = await getBlogPosts();

  const coverageList: ProductCoverageItem[] = products.map((product) => {
    // Find all posts mentioning product name or slug
    const matchingPosts = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(product.name.toLowerCase()) ||
        p.content.toLowerCase().includes(product.slug.toLowerCase()) ||
        (p.tags && p.tags.includes(product.brand_name || ''))
    );

    const history = productArticlesHistoryMap.get(product.id);
    const count = Math.max(matchingPosts.length, history?.count || 0);

    const latest = matchingPosts[0];

    return {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      categoryName: product.category_name || 'Général',
      articlesCount: count,
      lastGeneratedAt: history?.lastGeneratedAt || latest?.published_at || null,
      latestArticleTitle: history?.latestTitle || latest?.title || null,
      latestArticleSlug: history?.latestSlug || latest?.slug || null,
    };
  });

  const coveredCount = coverageList.filter((c) => c.articlesCount > 0).length;

  return {
    totalProducts: products.length,
    coveredProductsCount: coveredCount,
    totalArticlesCount: allPosts.length,
    coverageList,
  };
}
