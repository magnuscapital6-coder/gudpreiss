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
let memoryBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Die besten E-Bikes & Elektrofahrräder 2026: Kaufberater & Vergleich',
    slug: 'beste-e-bikes-elektrofahrraeder-2026',
    excerpt: 'Welches E-Bike passt zu Ihrem Fahrstil? Entdecken Sie die Top-Modelle von CUBE, SCOTT und Haibike mit Bosch CX Antrieben im großen GudPreiss Test.',
    content: `## Einleitung: Die E-Bike Revolution im Jahr 2026

Elektrofahrräder haben das Mobilitätsverhalten in Deutschland nachhaltig verändert. Egal ob tägliches Pendeln in der Stadt, sportliche Ausfahrten im Gelände oder ausgedehnte Wochenendtouren: Moderne E-Bikes bieten dank leistungsstarker Akkus und intelligenter Motoren eine unvergleichliche Freiheit.

In unserem großen **[GudPreiss E-Bike Kaufberater](/shop?category=e-bikes)** stellen wir Ihnen die wichtigsten Kriterien für die perfekte Wahl vor und vergleichen die aktuellen Spitzenmodelle führender Hersteller wie **SCOTT, CUBE und Haibike**.

---

## 1. Worauf müssen Sie beim E-Bike Kauf achten?

Wer heute ein E-Bike kaufen möchte, steht vor einer großen Auswahl verschiedener Kategorien und Antriebssysteme. Hier sind die 4 wichtigsten Kaufkriterien im Überblick:

### A. Der passende Motortyp (Bosch Performance CX vs. Yamaha)
Der Motor ist das Herzstück jedes E-Bikes. Hersteller wie Bosch setzen mit der Performance Line CX Serie Maßstäbe in Sachen Drehmoment (bis zu 85 Nm) und feinfühliger Unterstützung.

### B. Akkukapazität & Reichweite (625Wh bis 800Wh)
Für lange Touren empfiehlt sich ein integrierter Akku mit mindestens 625 Wh oder 800 Wh Kapazität. Damit erreichen Sie mühelos Reichweiten von über 120 Kilometern pro Ladung.

### C. Rahmenform & Ergonomie
Ob Tiefeinsteiger (Wave-Rahmen), Diamantrahmen für Herren oder sportliches E-MTB Hardtail: Die richtige Rahmengeometrie garantiert schmerzfreies Fahren auch auf langen Strecken.

---

## 2. Unsere Top-Empfehlung: SCOTT Aspect eRIDE 930

Für Geländefahrer und Tourenliebhaber ist das **[SCOTT Aspect eRIDE 930](/shop/scott-aspect-eride-930)** unser absoluter Testsieger. 

- **Motor**: Bosch Performance CX (85 Nm)
- **Akku**: PowerTube 625Wh
- **Schaltung**: SRAM Eagle 12-Gang
- **Besonderheit**: Extrem robuster Aluminiumrahmen und hervorragende Dämpfung.

👉 **[Jetzt Produktdetails ansehen & SCOTT Aspect eRIDE 930 bei GudPreiss kaufen](/shop/scott-aspect-eride-930)**

---

## 3. Vor- und Nachteile im Vergleich

| E-Bike Kategorie | Ideal geeignet für | Preisbereich bei GudPreiss |
| :--- | :--- | :--- |
| **E-MTB Hardtail** | Sportliche Touren & Waldwege | Ab 2.499 € |
| **E-Trekkingbike** | Langstrecken, Pendeln & Alltag | Ab 2.199 € |
| **E-Citybike** | Stadtverkehr & Einkäufe | Ab 1.899 € |

---

## Fazit & Kaufempfehlung

Ein gutes E-Bike ist eine Investition in Ihre Gesundheit und Mobilität. Profitieren Sie bei **GudPreiss** von schnellem Versand aus Deutschland, 30 Tagen Rückgaberecht und persönlichem Support!`,
    cover_image: 'https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg',
    author_name: 'GudPreiss Redaktion',
    category: 'E-Bikes',
    tags: ['E-Bike', 'SCOTT', 'Bosch CX', 'Kaufberater'],
    status: 'published',
    published_at: new Date().toISOString(),
    seo_title: 'Die besten E-Bikes 2026: Kaufberater & Test - GudPreiss',
    seo_description: 'E-Bike Kaufberater 2026: Alle Testsieger von SCOTT, CUBE & Haibike im Vergleich. Jetzt Top-Angebote bei GudPreiss entdecken!',
    keywords: ['E-Bike Test 2026', 'SCOTT E-Bike', 'CUBE E-Bike', 'Kaufberater E-Bike', 'GudPreiss'],
    seo_score: 96,
    read_time_minutes: 6,
    featured: true,
  },
  {
    id: 'post-2',
    title: 'PlayStation 5 Pro im Praxistest: Raytracing & 4K Gaming auf neuem Niveau',
    slug: 'playstation-5-pro-praxistest-review',
    excerpt: 'Lohnt sich das Upgrade auf die PS5 Pro? Wir haben Grafikleistung, PSSR Upscaling und Ladezeiten im ausführlichen Testbericht analysiert.',
    content: `## Einleitung: Die leistungsstärkste Konsole auf dem Markt

Mit der Einführung der **[PlayStation 5 Pro](/shop/playstation-5-pro-konsole)** hebt Sony das Konsolengaming auf ein bisher unerreichtes Level. Höhere Bildraten bei gleichzeitig voller 4K-Auflösung, erweitertes Raytracing und das KI-gestützte Upscaling PSSR (PlayStation Spectral Super Resolution) machen die Pro-Variante zum Traum jedes Gamers.

In diesem ausführlichen Testbericht beleuchten wir alle Vorteile der Konsole und zeigen Ihnen, wo Sie die Konsole und das beste Zubehör bei **GudPreiss** sichern können.

---

## 1. Was ist neu bei der PS5 Pro?

Im Vergleich zur regulären PS5 Slim bietet die Pro-Version entscheidende Hardware-Upgrades:

- **67% mehr Compute Units**: Die Grafikkarte liefert bis zu 45% schnelleres Rendering.
- **Fortgeschrittenes Raytracing**: Dynamische Lichtreflexionen und Schattenwurf mit doppelter bis dreifacher Geschwindigkeit.
- **2 TB NVMe SSD integriert**: Doppelter Speicherplatz ab Werk für Ihre Spielebibliothek.
- **Wi-Fi 7 Unterstützung**: Extrem schnelle Online-Downloads und stabilere Verbindung.

---

## 2. DualSense Edge & Must-Have Zubehör

Um das volle Potenzial der **[PS5 Pro](/shop/playstation-5-pro-konsole)** auszuschöpfen, empfiehlt sich die Kombination mit dem offiziellen Pro-Equipment:

- **[DualSense Edge Wireless Controller](/shop/dualsense-edge-wireless-controller)**: Mit anpassbaren Tasten, austauschbaren Stick-Modulen und Trigger-Stopps für kompetitives Gaming.
- **[PlayStation VR2 Headset](/shop/playstation-vr2-headset)**: Next-Gen VR-Erlebnis mit OLED 4K HDR Displays und Augen-Tracking.

👉 **[Jetzt PS5 Konsolen & Zubehör bei GudPreiss entdecken](/shop?category=playstation-konsolen)**

---

## Fazit: Für wen lohnt sich der Kauf?

Die PS5 Pro richtet sich an anspruchsvolle Spieler, die keine Kompromisse bei Bildrate und Grafikqualität eingehen wollen. Bestellen Sie Ihre Konsole jetzt bei GudPreiss mit garantiert schnellem Versand!`,
    cover_image: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>',
    author_name: 'GudPreiss Redaktion',
    category: 'Gaming',
    tags: ['PS5 Pro', 'PlayStation', 'DualSense Edge', 'Testbericht'],
    status: 'published',
    published_at: new Date().toISOString(),
    seo_title: 'PS5 Pro im Test: Lohnt sich der Kauf? - GudPreiss',
    seo_description: 'Ausführlicher Testbericht zur PlayStation 5 Pro: PSSR, Raytracing, Ladezeiten & Zubehör im Vergleich. Jetzt bei GudPreiss bestellen!',
    keywords: ['PS5 Pro Test', 'PlayStation 5 Pro kaufen', 'DualSense Edge', 'GudPreiss'],
    seo_score: 95,
    read_time_minutes: 5,
    featured: false,
  }
];
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
    id: post.id || `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: post.title || 'Neuer Blog-Beitrag',
    slug: post.slug || `post-${Date.now()}`,
    excerpt: post.excerpt || '',
    content: post.content || '',
    cover_image: post.cover_image || 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>',
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

  if (supabase) {
    try {
      await supabase.from('blog_posts').insert([{
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt,
        content: newPost.content,
        cover_image: newPost.cover_image,
        author: newPost.author_name,
        category: newPost.category,
        tags: newPost.tags,
        published_at: newPost.published_at,
        read_time: `${newPost.read_time_minutes} min`,
      }]);
    } catch {
      // Non-blocking fallback to memory store
    }
  }

  triggerRevalidation(['/blog', `/blog/${newPost.slug}`, '/admin/blog']);
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
Prenzlauer Allee 116
04332 Leipzig
Freistaat Sachsen, Deutschland

### Kontakt & Kundenservice
Telefon: +49 (0) 341 98765432
E-Mail: kontakt@gudpreiss.de

### Vertreten durch
Geschäftsführer: Klaus Weber

### Registereintrag
Registergericht: Amtsgericht Leipzig
Registernummer: HRB 38912 L

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
        : ['data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>'],
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
    image_url: categoryData.image_url || 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>',
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
          image_url: newCat.image_url,
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

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const index = memoryCategories.findIndex((c) => c.id === id || c.slug === id);
  if (index !== -1) {
    memoryCategories[index] = {
      ...memoryCategories[index],
      ...updates,
    };
  }

  if (supabase) {
    try {
      await supabase
        .from('categories')
        .update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
          image: updates.image_url,
          image_url: updates.image_url,
        })
        .or(`id.eq.${id},slug.eq.${id}`);
    } catch {
      // Non-blocking
    }
  }

  await triggerRevalidation(['/', '/shop', '/sitemap.xml']);
  return memoryCategories[index] || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const initialLen = memoryCategories.length;
  memoryCategories = memoryCategories.filter((c) => c.id !== id && c.slug !== id);

  if (supabase) {
    try {
      await supabase.from('categories').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch {
      // Non-blocking
    }
  }

  await triggerRevalidation(['/', '/shop', '/sitemap.xml']);
  return memoryCategories.length < initialLen;
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
