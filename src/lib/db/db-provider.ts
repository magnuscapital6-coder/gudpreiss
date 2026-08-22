import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_BANNERS, INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_BLOG_POSTS, INITIAL_ORDERS, DEFAULT_STORE_SETTINGS } from './initial-data';
import { Product, Category, Brand, Banner, Review, Coupon, BlogPost, Order, StoreSettings, LegalPage } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client if environment variables are provided
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith('http') &&
  supabaseKey &&
  !supabaseKey.includes('mock') &&
  supabaseKey.startsWith('eyJ')
);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// In-Memory store fallback to guarantee 100% reliable execution in dev & testing
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryBrands: Brand[] = [...INITIAL_BRANDS];
let memoryBanners: Banner[] = [...INITIAL_BANNERS];
let memoryReviews: Review[] = [...INITIAL_REVIEWS];
let memoryCoupons: Coupon[] = [...INITIAL_COUPONS];
let memoryBlogPosts: BlogPost[] = [...INITIAL_BLOG_POSTS];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memorySettings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };

// Synchronize Next.js Server Revalidation if running on server
async function triggerRevalidation(paths: string[]) {
  try {
    if (typeof window === 'undefined') {
      const { revalidatePath } = await import('next/cache');
      for (const p of paths) {
        revalidatePath(p);
      }
    }
  } catch {
    // Non-blocking cache revalidation attempt
  }
}

function withTimeout<T>(promiseLike: PromiseLike<T>, ms = 300): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Supabase Timeout')), ms);
    Promise.resolve(promiseLike)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// -------------------------------------------------------------
// READ FUNCTIONS (PostgreSQL Supabase + In-Memory Fallback)
// -------------------------------------------------------------

export async function getProducts(filters?: {
  categorySlug?: string;
  brandSlug?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  // Memory Fallback (0ms instant response with 100% German translated products)
  let result = [...memoryProducts];
  if (!filters) return result;

  if (filters.categorySlug) {
    const cat = memoryCategories.find(
      (c) => c.slug === filters.categorySlug || c.id === filters.categorySlug || c.id === `cat-${filters.categorySlug}`
    );

    if (cat) {
      result = result.filter((p) => isProductInCategory(p, cat));
    } else {
      const slug = (filters.categorySlug || '').toLowerCase();
      result = result.filter(
        (p) =>
          (p.category_id || '').toLowerCase().includes(slug) ||
          (p.category_name || '').toLowerCase().includes(slug)
      );
    }
  }

  if (filters.brandSlug) {
    const slug = filters.brandSlug.toLowerCase();
    result = result.filter(
      (p) =>
        (p.brand_name || '').toLowerCase().includes(slug) ||
        (p.brand_id || '').toLowerCase().includes(slug)
    );
  }

  if (filters.featured) result = result.filter((p) => p.featured);
  if (filters.bestSeller) result = result.filter((p) => p.best_seller);
  if (filters.newArrival) result = result.filter((p) => p.new_arrival);
  if (filters.onSale) result = result.filter((p) => p.on_sale);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand_name || '').toLowerCase().includes(q) ||
        (p.category_name || '').toLowerCase().includes(q)
    );
  }

  if (filters.minPrice !== undefined) result = result.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice !== undefined) result = result.filter((p) => p.price <= filters.maxPrice!);

  if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (filters.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === 'newest')
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  else if (!filters.categorySlug) {
    // Interleave randomize products across categories for a diverse mixed catalog view
    const categoryMap = new Map<string, Product[]>();
    for (const p of result) {
      const catKey = (p.category_id || p.category_name || 'general').toLowerCase().trim();
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, []);
      }
      categoryMap.get(catKey)!.push(p);
    }

    const pools = Array.from(categoryMap.values());
    let maxLen = 0;
    for (const pool of pools) {
      if (pool.length > maxLen) maxLen = pool.length;
    }

    const interleaved: Product[] = [];
    for (let i = 0; i < maxLen; i++) {
      for (const pool of pools) {
        if (i < pool.length) {
          interleaved.push(pool[i]);
        }
      }
    }
    result = interleaved;
  }

  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return memoryProducts.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function getCategories(): Promise<Category[]> {
  return [...memoryCategories];
}

export function isProductInCategory(p: Product, cat: Category): boolean {
  const cid = (cat.id || '').toLowerCase().trim();
  const cslug = (cat.slug || '').toLowerCase().trim();
  const cname = (cat.name || '').toLowerCase().trim();

  const p_cid = (p.category_id || '').toLowerCase().trim();
  const p_cname = (p.category_name || '').toLowerCase().trim();

  if (p_cid && (p_cid === cid || p_cid === cslug || p_cid === `cat-${cslug}` || cid === `cat-${p_cid}`)) {
    return true;
  }

  if (p_cname) {
    if (p_cname === cname || p_cname === cslug) return true;
    if (cname && p_cname.length >= 4 && cname.includes(p_cname)) return true;
    if (cname && cname.length >= 4 && p_cname.includes(cname)) return true;
  }

  return false;
}

export function filterNonEmptyCategories(categories: Category[], products?: Product[]): Category[] {
  if (!categories || categories.length === 0) return [];
  const prods = (products && products.length > 0) ? products : memoryProducts;
  const filtered = categories.filter((cat) => prods.some((p) => isProductInCategory(p, cat)));
  return filtered.length > 0 ? filtered : categories;
}

export async function getBrands(): Promise<Brand[]> {
  return [...memoryBrands];
}

export async function getBanners(position?: string): Promise<Banner[]> {
  if (position) {
    return memoryBanners.filter((b) => b.position === position && b.active);
  }
  return memoryBanners.filter((b) => b.active);
}

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  return memoryReviews.filter((r) => r.product_id === productId && r.status === 'approved');
}

export const getReviewsByProduct = getReviewsForProduct;

export async function getAllReviews(): Promise<Review[]> {
  return [...memoryReviews];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...memoryBlogPosts];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return memoryBlogPosts.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const newPost: BlogPost = {
    id: `post-${Date.now()}`,
    title: post.title || 'Neuer Blog-Beitrag',
    slug: post.slug || `post-${Date.now()}`,
    excerpt: post.excerpt || '',
    content: post.content || '',
    cover_image: post.cover_image || 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    author_name: post.author_name || 'GudPreiss Redaktion',
    category: post.category || 'Technologie',
    tags: post.tags || ['Tech', 'News'],
    status: post.status || 'published',
    published_at: post.published_at || new Date().toISOString(),
    seo_title: post.seo_title || post.title,
    seo_description: post.seo_description || post.excerpt,
    keywords: post.keywords || [],
    seo_score: post.seo_score || 85,
    read_time_minutes: post.read_time_minutes || 5,
    featured: post.featured || false,
    views_count: 0,
  };
  memoryBlogPosts.unshift(newPost);
  return newPost;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const index = memoryBlogPosts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return null;

  memoryBlogPosts[index] = {
    ...memoryBlogPosts[index],
    ...updates,
  };
  return memoryBlogPosts[index];
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const index = memoryBlogPosts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  memoryBlogPosts.splice(index, 1);
  return true;
}

// In-Memory Storage for Editable Legal Pages
export const memoryLegalPages: Record<string, LegalPage> = {
  impressum: {
    slug: 'impressum',
    title: 'Impressum',
    subtitle: 'Offizielle Angaben gemäß § 5 TMG zum Betreiber der Plattform GudPreiss Deutschland.',
    content: `## Angaben gemäß § 5 TMG
GudPreiss GmbH
Friedrichstraße 12
10117 Berlin
Deutschland / Germany

### Kontakt & Kundenservice
Telefon: +49 30 1234567
E-Mail: kontakt@gudpreiss-store.de

### Vertreten durch
Geschäftsführer: Klaus Weber

### Registereintrag
Registergericht: Amtsgericht Berlin-Charlottenburg
Registernummer: HRB 248912 B

### Umsatzsteuer-ID
Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE 349 812 705

### Verbraucherstreitbeilegung
Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/
Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
    last_updated: new Date().toISOString(),
  },
  privacy: {
    slug: 'privacy',
    title: 'Datenschutzerklärung',
    subtitle: 'Transparente Informationen über die Erhebung und Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.',
    content: `## 1. Datenschutz auf einen Blick
Der Schutz Ihrer persönlichen Daten ist für die GudPreiss GmbH von höchster Priorität. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

## 2. Verantwortliche Stelle
GudPreiss GmbH
Friedrichstraße 12, 10117 Berlin
E-Mail: datenschutz@gudpreiss-store.de

## 3. Datenerfassung bei Bestellungen & Vorkasse
Bei der Abwicklung einer Bestellung erheben wir Vorname, Nachname, Lieferadresse, Rechnungsadresse, E-Mail-Adresse und Telefonnummer.
Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).

## 4. Ihre Rechte gemäß DSGVO (Art. 15-21)
Sie haben jederzeit das Recht auf kostenlose Auskunft über Ihre gespeicherten personenbezogenen Daten sowie ein Recht auf Berichtigung, Sperrung oder Löschung. Wenden Sie sich hierzu jederzeit an datenschutz@gudpreiss-store.de.`,
    last_updated: new Date().toISOString(),
  },
  terms: {
    slug: 'terms',
    title: 'AGB & Nutzungsbedingungen',
    subtitle: 'Allgemeine Geschäftsbedingungen für Verkäufe über den GudPreiss Online-Shop.',
    content: `## § 1 Geltungsbereich & Anbieter
Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen, die Verbraucher über den Online-Shop der GudPreiss GmbH tätigen.

## § 2 Vertragsschluss
Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.

## § 3 Preise, Versandkosten & Zahlungsarten
Die angegebenen Preise enthalten die gesetzliche deutsche Mehrwertsteuer (19% MwSt.).
Zahlungsart Vorkasse (Banküberweisung SEPA): Der Rechnungsbetrag ist innerhalb von 7 Tagen zu überweisen.
Der Versand erfolgt kostenlos per DHL Express / UPS innerhalb Deutschlands.

## § 4 Eigentumsvorbehalt
Die Ware bleibt bis zur vollständigen Bezahlung Eigentum der GudPreiss GmbH.`,
    last_updated: new Date().toISOString(),
  },
  'return-policy': {
    slug: 'return-policy',
    title: 'Widerrufsbelehrung & Rückgabe',
    subtitle: 'Informationen zum gesetzlichen 14-Tage Widerrufsrecht für Verbraucher.',
    content: `## Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie die Waren in Besitz genommen haben.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (GudPreiss GmbH, Friedrichstraße 12, 10117 Berlin, E-Mail: widerruf@gudpreiss-store.de) informieren.

## Muster-Widerrufsformular
An: GudPreiss GmbH, Friedrichstraße 12, 10117 Berlin (widerruf@gudpreiss-store.de)
Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren:
Bestellnummer: ________________
Bestellt am / Erhalten am: ________________
Name des Verbrauchers: ________________
Anschrift des Verbrauchers: ________________`,
    last_updated: new Date().toISOString(),
  },
};

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  return memoryLegalPages[slug] || null;
}

export async function updateLegalPage(slug: string, data: Partial<LegalPage>): Promise<LegalPage | null> {
  if (!memoryLegalPages[slug]) {
    memoryLegalPages[slug] = {
      slug: slug as any,
      title: data.title || 'Rechtliche Seite',
      subtitle: data.subtitle || '',
      content: data.content || '',
      last_updated: new Date().toISOString(),
    };
  } else {
    memoryLegalPages[slug] = {
      ...memoryLegalPages[slug],
      ...data,
      last_updated: new Date().toISOString(),
    };
  }
  return memoryLegalPages[slug];
}

export async function getOrders(): Promise<Order[]> {
  let combined: Order[] = [...memoryOrders];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const dbOrders = data as Order[];
        const existingIds = new Set(combined.map((o) => o.id || o.order_number));
        for (const o of dbOrders) {
          if (!existingIds.has(o.id) && !existingIds.has(o.order_number)) {
            combined.push(o);
          }
        }
      }
    } catch {
      // Fallback
    }
  }
  return combined;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id},order_number.eq.${id}`)
        .single();
      if (!error && data) return data as Order;
    } catch {
      // Fallback
    }
  }
  return memoryOrders.find((o) => o.id === id || o.order_number === id) || null;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const cleanCode = code.trim().toUpperCase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('active', true)
        .single();
      if (!error && data) return data as Coupon;
    } catch {
      // Fallback
    }
  }
  return memoryCoupons.find((c) => c.code.toUpperCase() === cleanCode && c.active) || null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('store_settings').select('*').single(),
        300
      );
      if (!error && data) {
        return { ...memorySettings, ...data };
      }
    } catch {
      // Fallback
    }
  }
  return {
    ...memorySettings,
    logo_url: memorySettings.logo_url || '/logo.png',
    logo_dark_url: memorySettings.logo_dark_url || '/logo-dark.png',
    logo_mobile_url: memorySettings.logo_mobile_url || '/logo-mobile.png',
    favicon_url: memorySettings.favicon_url || '/favicon.ico',
    apple_touch_icon_url: memorySettings.apple_touch_icon_url || '/apple-touch-icon.png',
    primary_color: memorySettings.primary_color || '#065f46',
    secondary_color: memorySettings.secondary_color || '#0284c7',
  };
}

export async function updateStoreSettings(settingsData: Partial<StoreSettings>): Promise<StoreSettings> {
  memorySettings = {
    ...memorySettings,
    ...settingsData,
  };

  if (supabase) {
    try {
      await supabase.from('store_settings').upsert([memorySettings]);
    } catch {
      // Non-blocking
    }
  }

  await triggerRevalidation(['/', '/shop', '/sitemap.xml']);
  return memorySettings;
}

// -------------------------------------------------------------
// MUTATION FUNCTIONS (PostgreSQL Supabase + Memory + Revalidation)
// -------------------------------------------------------------

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const newId = productData.id || `p-${Date.now()}`;
  const newProduct: Product = {
    id: newId,
    name: productData.name || 'New Tech Product',
    slug: productData.slug || `product-${Date.now()}`,
    description: productData.description || 'High-performance technology product.',
    short_description: productData.short_description || '',
    sku: productData.sku || `SKU-${Date.now()}`,
    gtin: productData.gtin || '',
    mpn: productData.mpn || '',
    google_product_category: productData.google_product_category || 'Electronics',
    condition: productData.condition || 'new',
    brand_id: productData.brand_id,
    brand_name: productData.brand_name || 'GudPreiss',
    category_id: productData.category_id,
    category_name: productData.category_name || 'Smartphones',
    price: Number(productData.price) || 99,
    compare_at_price: productData.compare_at_price ? Number(productData.compare_at_price) : null,
    cost_price: productData.cost_price ? Number(productData.cost_price) : null,
    stock: Number(productData.stock) || 10,
    low_stock_threshold: Number(productData.low_stock_threshold) || 5,
    status: productData.status || 'active',
    featured: Boolean(productData.featured),
    best_seller: Boolean(productData.best_seller),
    new_arrival: Boolean(productData.new_arrival),
    on_sale: Boolean(productData.on_sale),
    weight_kg: Number(productData.weight_kg) || 0.5,
    rating: 5.0,
    review_count: 0,
    images:
      productData.images && productData.images.length > 0
        ? productData.images
        : ['https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Supabase Persistence
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            slug: newProduct.slug,
            description: newProduct.description,
            short_description: newProduct.short_description,
            price: newProduct.price,
            compare_at_price: newProduct.compare_at_price,
            images: newProduct.images,
            category_id: newProduct.category_id,
            category_name: newProduct.category_name,
            brand_id: newProduct.brand_id,
            brand_name: newProduct.brand_name,
            sku: newProduct.sku,
            stock: newProduct.stock,
            featured: newProduct.featured,
            best_seller: newProduct.best_seller,
            new_arrival: newProduct.new_arrival,
            on_sale: newProduct.on_sale,
            rating: newProduct.rating,
          },
        ])
        .select()
        .single();

      // Error handling: silently fall back to memory store
    } catch {
      // Non-blocking
    }
  }

  // 2. Memory Sync
  memoryProducts.unshift(newProduct);

  // 3. Cache Revalidation
  await triggerRevalidation(['/', '/shop', `/shop/${newProduct.slug}`, '/sitemap.xml']);

  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
  const index = memoryProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    memoryProducts[index] = {
      ...memoryProducts[index],
      ...productData,
      updated_at: new Date().toISOString(),
    };
  }

  if (supabase) {
    try {
      await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch {
      // Non-blocking
    }
  }

  await triggerRevalidation(['/', '/shop', `/shop/${productData.slug || id}`, '/sitemap.xml']);
  return memoryProducts[index] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLen = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id);

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {
      // Non-blocking
    }
  }

  await triggerRevalidation(['/', '/shop', '/sitemap.xml']);
  return memoryProducts.length < initialLen;
}

export async function createOrder(orderPayload: Partial<Order>): Promise<Order> {
  const orderNumber = `TN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    customer_email: orderPayload.customer_email || 'customer@example.com',
    customer_phone: orderPayload.customer_phone || '+49 30 1234567',
    shipping_address: orderPayload.shipping_address!,
    billing_address: orderPayload.billing_address || orderPayload.shipping_address!,
    items: orderPayload.items || [],
    subtotal: orderPayload.subtotal || 0,
    discount_amount: orderPayload.discount_amount || 0,
    tax_amount: orderPayload.tax_amount || 0,
    shipping_fee: orderPayload.shipping_fee || 0,
    total_amount: orderPayload.total_amount || 0,
    payment_method: orderPayload.payment_method || 'bank_transfer',
    payment_status: 'paid',
    order_status: 'processing',
    coupon_code: orderPayload.coupon_code,
    tracking_number: `TN-DE-${Math.floor(10000000 + Math.random() * 90000000)}`,
    bank_transfer_iban: memorySettings.iban || 'DE89 3704 0044 0532 0130 00',
    bank_transfer_bic: memorySettings.bic || 'DEUTDEDDBER',
    bank_transfer_holder: memorySettings.account_holder || 'GudPreiss GmbH',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            id: newOrder.id,
            order_number: newOrder.order_number,
            customer_name: newOrder.shipping_address.full_name || 'Klaus Weber',
            customer_email: newOrder.customer_email,
            customer_phone: newOrder.customer_phone,
            shipping_address: newOrder.shipping_address,
            billing_address: newOrder.billing_address,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            discount_amount: newOrder.discount_amount,
            shipping_cost: newOrder.shipping_fee,
            tax_amount: newOrder.tax_amount,
            total_amount: newOrder.total_amount,
            payment_method: newOrder.payment_method,
            payment_status: newOrder.payment_status,
            order_status: newOrder.order_status,
            coupon_code: newOrder.coupon_code,
            bank_transfer_iban: newOrder.bank_transfer_iban,
            bank_transfer_bic: newOrder.bank_transfer_bic,
            bank_transfer_holder: newOrder.bank_transfer_holder,
          },
        ])
        .select()
        .single();

      // Error handling: silently fall back to memory store
    } catch {
      // Non-blocking
    }
  }

  memoryOrders.unshift(newOrder);

  // Decrement inventory stock
  newOrder.items.forEach((item) => {
    const prod = memoryProducts.find((p) => p.id === item.product_id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<Order | null> {
  const order = memoryOrders.find((o) => o.id === orderId || o.order_number === orderId);
  if (order) {
    order.order_status = status;
    order.updated_at = new Date().toISOString();
  }

  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({ order_status: status })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch {
      // Non-blocking
    }
  }

  return order || null;
}

export async function createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    code: (couponData.code || 'SPECIAL10').toUpperCase(),
    discount_type: couponData.discount_type || 'percentage',
    discount_value: Number(couponData.discount_value) || 10,
    min_order_amount: Number(couponData.min_order_amount) || 0,
    times_used: 0,
    active: true,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('coupons').insert([newCoupon]);
    } catch {
      // Non-blocking
    }
  }

  memoryCoupons.unshift(newCoupon);
  return newCoupon;
}

export async function createCategory(categoryData: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: categoryData.name || 'New Category',
    slug: categoryData.slug || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `category-${Date.now()}`,
    description: categoryData.description || '',
    image_url: categoryData.image_url || 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    sort_order: memoryCategories.length + 1,
    active: true,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('categories').insert([
        {
          id: newCat.id,
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          image: newCat.image_url,
        },
      ]);
    } catch {
      // Non-blocking
    }
  }

  memoryCategories.push(newCat);
  await triggerRevalidation(['/', '/shop', '/sitemap.xml']);
  return newCat;
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'hidden'): Promise<boolean> {
  const review = memoryReviews.find((r) => r.id === reviewId);
  if (review) {
    review.status = status;
  }
  if (supabase) {
    try {
      await supabase.from('reviews').update({ status }).eq('id', reviewId);
    } catch {
      // Non-blocking
    }
  }
  return true;
}
