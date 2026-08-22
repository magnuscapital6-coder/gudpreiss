const fs = require('fs');
const path = require('path');

const abtProducts = JSON.parse(fs.readFileSync('scripts/abt-all-products.json', 'utf8'));
const abtCategories = JSON.parse(fs.readFileSync('scripts/abt-categories.json', 'utf8'));

console.log(`Processing ${abtProducts.length} products and ${abtCategories.length} categories...`);

// Category Translation & Mapping Dictionary (FR -> DE)
const catTranslationMap = {
  'aspirateurs': { name: 'Staubsauger & Reinigung', icon: 'Sparkles', desc: 'Hochwertige Staubsauger, Saugroboter und Reinigungsgeräte für Ihr Zuhause.' },
  'barbecue': { name: 'Grill & Outdoor-Küche', icon: 'Flame', desc: 'Erstklassige Barbecues, Gasgrills und Zubehör für beste Grillergebnisse.' },
  'bons-plans': { name: 'Sonderangebote & Deals', icon: 'Tag', desc: 'Exklusive Rabatte und Top-Angebote auf Haushaltsgeräte und Fitnessgeräte.' },
  'compteurs-gps': { name: 'GPS & Fahrradcomputer', icon: 'Navigation', desc: 'Präzise GPS-Navigationsgeräte und Fahrradcomputer für Outdoor-Sportler.' },
  'congelateurs': { name: 'Gefrierschränke & Truhen', icon: 'Snowflake', desc: 'Gefrierschränke und Gefriertruhen mit NoFrost-Technologie.' },
  'cuisson': { name: 'Kochen & Backen', icon: 'ChefHat', desc: 'Backöfen, Kochfelder, Mikrowellen und Dunstabzugshauben.' },
  'drones': { name: 'Drohnen & Luftaufnahmen', icon: 'Plane', desc: 'Kameradrohnen für professionelle Luftaufnahmen und Hobby-Piloten.' },
  'ecouteurs': { name: 'Kopfhörer & Audio', icon: 'Headphones', desc: 'Wireless Kopfhörer, Earbuds und Hi-Fi Audiogeräte.' },
  'electromenager': { name: 'Haushaltsgeräte', icon: 'Home', desc: 'Groß- und Kleingeräte für Küche, Wäschepflege und Haushalt.' },
  'espace-cafe': { name: 'Kaffeemaschinen & Espresso', icon: 'Coffee', desc: 'Kaffeevollautomaten, Siebträgermaschinen und Espressokocher.' },
  'fitness-musculation': { name: 'Fitness & Kraftsport', icon: 'Dumbbell', desc: 'Kraftstationen, Hanteln und Trainingsgeräte für Ihr Home-Gym.' },
  'fours': { name: 'Einbaubacköfen & Mikrowellen', icon: 'Flame', desc: 'Moderne Einbaubacköfen und Kombi-Mikrowellen.' },
  'gros-electromenager': { name: 'Großgeräte', icon: 'Box', desc: 'Waschmaschinen, Kühlschränke, Geschirrspüler und Trockner.' },
  'hifi-son': { name: 'Hi-Fi & Soundbar', icon: 'Volume2', desc: 'Soundbars, Heimkino-Systeme und Bluetooth-Lautsprecher.' },
  'image-son': { name: 'TV & Heimkino', icon: 'Tv', desc: 'Fernseher, Smart TVs, Beamer und Audio-Systeme.' },
  'lave-linge': { name: 'Waschmaschinen', icon: 'Shirt', desc: 'Energieeffiziente Waschmaschinen und Waschtrockner.' },
  'lave-vaisselle': { name: 'Geschirrspüler', icon: 'Utensils', desc: 'Einbau- und Stand-Geschirrspüler für strahlend sauberes Geschirr.' },
  'micro-ondes': { name: 'Mikrowellen', icon: 'Zap', desc: 'Mikrowellen mit Grill und Heißluftfunktion.' },
  'mobilite-urbaine': { name: 'E-Scooter & Mobilität', icon: 'Bike', desc: 'Elektro-Scooter, E-Bikes und urbane Mikromobilität.' },
  'multimedia': { name: 'Multimedia & Tech', icon: 'Laptop', desc: 'Smartphones, Tablets, Notebooks und Zubehör.' },
  'petits-appareils': { name: 'Küchenkleingeräte', icon: 'UtensilsCrossed', desc: 'Mixer, Toaster, Wasserkocher und Fritteusen.' },
  'plaques-de-cuisson': { name: 'Kochfelder & Induktion', icon: 'Flame', desc: 'Induktionskochfelder, Glaskeramik und Gaskochfelder.' },
  'promotions': { name: 'Aktionen & Rabatte', icon: 'Percent', desc: 'Aktuelle Sonderaktionen und preisreduzierte Markenprodukte.' },
  'refrigerateurs': { name: 'Kühlschränke', icon: 'Refrigerator', desc: 'Kühl-Gefrierkombinationen, Side-by-Side und Einbaukühlschränke.' },
  'robot-de-cuisine': { name: 'Küchenmaschinen', icon: 'Cpu', desc: 'Multifunktions-Küchenmaschinen und Food Processor.' },
  'seche-linge': { name: 'Wäschetrockner', icon: 'Wind', desc: 'Wärmepumpentrockner und Kondensationstrockner.' },
  'smartphones': { name: 'Smartphones & Handys', icon: 'Smartphone', desc: 'Neueste Smartphones von Top-Marken.' },
  'tablettes': { name: 'Tablets & E-Reader', icon: 'Tablet', desc: 'Tablets für Arbeit, Unterhaltung und kreatives Schaffen.' },
  'tapis-de-course': { name: 'Laufbänder', icon: 'Activity', desc: 'Profi-Laufbänder für Ausdauertraining zu Hause.' },
  'telephonie': { name: 'Telefonie & Zubehör', icon: 'Phone', desc: 'Festnetztelefone, Headsets und Smartphone-Zubehör.' },
  'televiseurs': { name: 'Fernseher & Smart TV', icon: 'Tv', desc: '4K OLED, QLED und LED Smart Fernseher.' },
  'training-fitness': { name: 'Ausdauertraining & Cardio', icon: 'HeartPulse', desc: 'Laufbänder, Ergometer, Crosstrainer und Rudergeräte.' },
  'velos-appartement': { name: 'Heimtrainer & Ergometer', icon: 'Bike', desc: 'Ergometer und Heimtrainer für effektives Cardio-Training.' },
  'velos-elliptiques': { name: 'Crosstrainer & Ellipsentrainer', icon: 'Activity', desc: 'Gelenkschonende Crosstrainer für Ganzkörper-Fitness.' }
};

// Map Categories
const categoryMapById = {};
const gudCategories = [];

abtCategories.forEach((cat, index) => {
  const meta = catTranslationMap[cat.slug] || {
    name: cat.name.replace(/&amp;/g, '&'),
    icon: 'Package',
    desc: 'Hochwertige Markenprodukte im GudPreiss.'
  };

  const catObj = {
    id: `cat-abt-${cat.id}`,
    name: meta.name,
    slug: cat.slug,
    description: meta.desc,
    image_url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    icon: meta.icon,
    active: true,
    sort_order: index + 1
  };

  categoryMapById[cat.id] = catObj;
  gudCategories.push(catObj);
});

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// French to German Dictionary for Title & Description Translations (SEO Optimized)
function translateTextToGerman(text, categorySlug) {
  if (!text) return '';
  let result = text;

  const termReplacements = [
    [/Tapis de course/gi, 'Laufband Profi-Heimtrainer'],
    [/Vélo d'appartement/gi, 'Heimtrainer Fahrrad'],
    [/Vélo elliptique/gi, 'Crosstrainer Ellipsentrainer'],
    [/Rameur/gi, 'Rudergerät Fitness'],
    [/Aspirateur balai/gi, 'Akkusauger Stabsauger'],
    [/Aspirateur robot/gi, 'Saugroboter Wischroboter'],
    [/Aspirateur/gi, 'Staubsauger'],
    [/Lave-linge hublot/gi, 'Frontlader Waschmaschine'],
    [/Lave-linge/gi, 'Waschmaschine'],
    [/Lave-vaisselle/gi, 'Geschirrspüler'],
    [/Sèche-linge/gi, 'Wäschetrockner'],
    [/Réfrigérateur combiné/gi, 'Kühl-Gefrierkombination'],
    [/Réfrigérateur/gi, 'Kühlschrank'],
    [/Congélateur/gi, 'Gefrierschrank'],
    [/Plaque de cuisson induction/gi, 'Induktionskochfeld'],
    [/Plaque de cuisson/gi, 'Kochfeld'],
    [/Four encastrable/gi, 'Einbaubackofen'],
    [/Four/gi, 'Backofen'],
    [/Robot de cuisine/gi, 'Küchenmaschine'],
    [/Machine à café/gi, 'Kaffeevollautomat'],
    [/Téléviseur/gi, 'Smart TV Fernseher'],
    [/Barbecue/gi, 'Grill Barbecue'],
    [/Écouteurs sans fil/gi, 'Wireless Earbuds Kopfhörer'],
    [/Casque audio/gi, 'Hi-Fi Kopfhörer'],
    [/Montre connectée/gi, 'Smartwatch Fitness-Uhr'],
    [/Trottinette électrique/gi, 'E-Scooter Elektro-Tretroller'],
    [/Centrale à vapeur/gi, 'Dampfbügelstation'],
    [/Fer à repasser/gi, 'Dampfbügeleisen'],
    [/Friteuse sans huile/gi, 'Heißluftfritteuse Airfryer'],
    [/Climatiseur/gi, 'Klimagerät Klimaanlage'],
    [/Purificateur d'air/gi, 'Luftreiniger'],
    [/Le/g, 'Das'], [/La/g, 'Die'], [/Les/g, 'Die'], [/pour/g, 'für'],
    [/avec/g, 'mit'], [/haute qualité/gi, 'hoher Qualität'],
    [/performant/gi, 'leistungsstark'], [/puissant/gi, 'kraftvoll'],
    [/idéal pour/gi, 'ideal für'], [/conçu pour/gi, 'entwickelt für']
  ];

  termReplacements.forEach(([rgx, rep]) => {
    result = result.replace(rgx, rep);
  });

  return result;
}

// Convert ABT products to GudPreiss format
const gudProducts = [];
const gudBrandsMap = {};

abtProducts.forEach((p, idx) => {
  let rawPrice = p.prices ? Number(p.prices.price) / 100 : 299;
  let rawRegularPrice = p.prices && p.prices.regular_price ? Number(p.prices.regular_price) / 100 : rawPrice * 1.2;

  if (isNaN(rawPrice) || rawPrice <= 0) rawPrice = 199;
  if (isNaN(rawRegularPrice) || rawRegularPrice < rawPrice) rawRegularPrice = Math.round(rawPrice * 1.15);

  const cleanTitleFR = stripHtml(p.name);
  const germanTitle = translateTextToGerman(cleanTitleFR, p.categories?.[0]?.slug);
  const cleanShortDescFR = stripHtml(p.short_description || p.description || p.name);
  const germanShortDesc = translateTextToGerman(cleanShortDescFR).substring(0, 220);
  const cleanFullDescFR = stripHtml(p.description || p.short_description || p.name);
  const germanFullDesc = translateTextToGerman(cleanFullDescFR);

  const images = p.images && p.images.length > 0
    ? p.images.map(img => img.src)
    : ['https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'];

  const primaryCat = p.categories && p.categories.length > 0 ? categoryMapById[p.categories[0].id] : gudCategories[0];
  const catId = primaryCat ? primaryCat.id : gudCategories[0].id;
  const catName = primaryCat ? primaryCat.name : gudCategories[0].name;

  const titleWords = cleanTitleFR.split(' ');
  const brandName = titleWords.length > 1 ? titleWords[1] : 'GudPreiss';
  const brandId = `b-abt-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  if (!gudBrandsMap[brandId]) {
    gudBrandsMap[brandId] = {
      id: brandId,
      name: brandName,
      slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      logo_url: '/brands/samsung.png',
      active: true,
      created_at: new Date().toISOString()
    };
  }

  const seoSlug = `${p.slug}-de`.toLowerCase().replace(/[^a-z0-9-]/g, '');

  gudProducts.push({
    id: `prod-abt-${p.id || idx + 1}`,
    name: germanTitle,
    slug: seoSlug,
    description: `${germanFullDesc} - Kaufen Sie den ${germanTitle} zum besten Preis bei GudPreiss mit 2 Jahren Garantie und schnellem Versand in Deutschland & Europa.`,
    short_description: `${germanShortDesc} | 2 Jahre Garantie & Gratis Versand ab 150 €.`,
    sku: `ABT-${p.id || idx + 1000}`,
    brand_id: brandId,
    brand_name: brandName,
    category_id: catId,
    category_name: catName,
    price: Math.round(rawPrice),
    compare_at_price: Math.round(rawRegularPrice),
    cost_price: Math.round(rawPrice * 0.7),
    stock: Math.floor(Math.random() * 40) + 10,
    low_stock_threshold: 5,
    status: 'active',
    featured: idx < 12,
    best_seller: idx % 3 === 0,
    new_arrival: idx % 2 === 0,
    on_sale: rawRegularPrice > rawPrice,
    weight_kg: Math.round((Math.random() * 10 + 0.5) * 10) / 10,
    rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    review_count: Math.floor(Math.random() * 80) + 12,
    images: images,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
});

const brandsArray = Object.values(gudBrandsMap);

// Pure data module without 'use client' directive
const tsContent = `import { Product, Category, Brand, Banner, Coupon, StoreSettings, Review, BlogPost, Order } from '@/types';

export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(gudCategories, null, 2)};

export const INITIAL_BRANDS: Brand[] = ${JSON.stringify(brandsArray.slice(0, 20), null, 2)};

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(gudProducts, null, 2)};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: '${gudProducts[0]?.id || 'prod-abt-1'}',
    user_id: 'u-1',
    user_name: 'Markus Weber',
    rating: 5,
    title: 'Hervorragendes Produkt!',
    comment: 'Super Qualität, schnelle Lieferung und beste Performance.',
    verified_purchase: true,
    status: 'approved',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Die besten Haushalts- & Fitnessgeräte 2026',
    slug: 'beste-haushalts-fitness-geraete-2026',
    excerpt: 'Erfahren Sie alles über die neuesten Innovationen im Bereich Home-Gym & Smart Home.',
    content: 'Moderne Technik erleichtert den Alltag enorm...',
    cover_image: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    author_name: 'GudPreiss Redaktion',
    category: 'Technik',
    tags: ['Technik', 'Fitness', 'Haushalt'],
    status: 'published',
    published_at: new Date().toISOString(),
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'Top-Technologie Angebote',
    subtitle: 'Bis zu 15% Rabatt',
    description: 'Die neuste Technologie. Die besten Angebote im GudPreiss.',
    price_text: 'Ab 160 €',
    image_url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    cta_text: 'JETZT EINKAUFEN',
    cta_link: '/shop?on_sale=true',
    position: 'hero',
    sort_order: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 50,
    times_used: 12,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c-2',
    code: 'TECH2026',
    discount_type: 'fixed',
    discount_value: 25,
    min_order_amount: 200,
    times_used: 5,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'GudPreiss',
  contact_email: 'support@gudpreiss.store',
  contact_phone: '+49 (0) 800 555-TECH',
  currency: 'EUR',
  currency_symbol: '€',
  tax_rate: 0.19,
  free_shipping_threshold: 150,
  default_shipping_fee: 15,
  stripe_enabled: false,
  cod_enabled: false,
};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/db/initial-data.ts'), tsContent, 'utf8');
console.log('✓ Successfully re-generated initial-data.ts without use client directive!');
