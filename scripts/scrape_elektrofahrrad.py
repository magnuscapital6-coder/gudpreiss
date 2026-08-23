import os
import sys
import re
import json
import subprocess
import time
from html import unescape
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH_DIR = os.path.join(os.path.expanduser("~"), ".gemini", "antigravity", "brain", "7370416a-bf4d-4528-a6bb-65265d48175e", "scratch")
INITIAL_DATA_PATH = os.path.join(BASE_DIR, "src", "lib", "db", "initial-data.ts")

os.makedirs(SCRATCH_DIR, exist_ok=True)

def fetch_url(url):
    cmd = [
        "curl.exe", "-L", "-s",
        "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=15)
        return res.stdout
    except Exception as e:
        return ""

def parse_german_price(price_str):
    if not price_str:
        return 0.0
    price_str = price_str.replace('€', '').replace('EUR', '').strip()
    if ',' in price_str:
        parts = price_str.split(',')
        integer_part = re.sub(r'[^\d]', '', parts[0])
        decimal_part = re.sub(r'[^\d]', '', parts[1])
        if not integer_part:
            return 0.0
        val = float(f"{integer_part}.{decimal_part}")
    else:
        clean = re.sub(r'[^\d]', '', price_str)
        if not clean:
            return 0.0
        val = float(clean)
        if val > 20000:
            val = val / 100.0
    return round(val, 2)

def get_candidate_urls():
    high_priority = []
    normal_priority = []
    
    p_file = os.path.join(SCRATCH_DIR, "product_urls.txt")
    if os.path.exists(p_file):
        with open(p_file, 'r', encoding='utf-8') as f:
            for line in f:
                u = line.strip()
                if u and not u.endswith('/') and any(brand in u.lower() for brand in ['cube-', 'haibike-', 'scott-', 'ghost-', 'kalkhoff-', 'winora-', 'cannondale-', 'diamant-', 'conway-', 'raymon-', 'focus-']):
                    if not any(acc in u.lower() for acc in ['helm', 'tasche', 'zubehoer', 'bekleidung', 'ersatzteile', 'trikot', 'handschuh', 'schloss', 'pumpe', 'klappe', 'halterung', 'kabel', 'strebensatz', 'adapter', 'set', 'guard', 'board', 'blech']):
                        if any(bm in u.lower() for bm in ['hybrid', 'e-bike', 'ebike', 'mountainbike', 'trekking', 'fully', 'hardtail', 'city', 'reaction', 'stereo', 'kathmandu', 'nuride', 'supreme', 'allmtn', 'adventr', 'endeavour', 'tria', 'moterra', 'hardnine', 'hardseven']):
                            if u not in high_priority:
                                high_priority.append(u)
                        else:
                            if u not in normal_priority:
                                normal_priority.append(u)
                        
    candidates = high_priority + normal_priority
    print(f"Found {len(high_priority)} high priority bike URLs out of {len(candidates)} total candidates", flush=True)
    return candidates

def parse_product_page(url):
    html = fetch_url(url)
    if not html or len(html) < 2000:
        return None

    # Title
    title_match = re.search(r'<h1[^>]*class="[^"]*product-detail-name[^"]*"[^>]*>(.*?)</h1>', html, re.DOTALL)
    if not title_match:
        title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    if not title_match:
        return None
    
    title = unescape(re.sub(r'<[^>]+>', '', title_match.group(1)).strip())
    title = re.sub(r'\s*\|\s*elektrofahrrad\.de.*$', '', title, flags=re.IGNORECASE)
    
    if len(title) < 5:
        return None

    title_lower = title.lower()

    # Reject non-bike items & accessories
    reject_keywords = [
        'cubeguard', 'muddy board', 'strebensatz', 'federklappe', 'snapband', 'helm', 'tasche', 
        'rucksack', 'trikot', 'hose', 'schuh', 'handschuh', 'brille', 'schloss', 'pumpe', 'pedal', 
        'ständer', 'gepäckträger', 'schutzblech', 'beleuchtung', 'licht', 'flasche', 'trinkflasche', 
        'sattel', 'griffe', 'klingel', 'korb', 'reifen', 'schlauch', 'adapter', 'cover', 'kabel', 
        'halterung', 'hülle', 'ventil', 'bremsbelag', 'set', 'kit', 'akku-cover', 'ladegerät', 'display-halterung'
    ]
    if any(k in title_lower for k in reject_keywords):
        return None

    # Specs extraction
    specs = {}
    table_rows = re.findall(r'<tr[^>]*>\s*<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>\s*</tr>', html, re.DOTALL)
    if not table_rows:
        table_rows = re.findall(r'<div[^>]*properties-label[^>]*>(.*?)</div>\s*<div[^>]*properties-value[^>]*>(.*?)</div>', html, re.DOTALL)

    for label, val in table_rows:
        clean_label = re.sub(r'<[^>]+>', '', label).strip().rstrip(':')
        clean_val = re.sub(r'<[^>]+>', '', val).strip()
        if clean_label and clean_val:
            specs[clean_label] = clean_val

    # Require authentic bicycle indicators
    bike_type = specs.get('Fahrrad-Typ', '').lower()
    has_bike_specs = 'e-bike' in bike_type or 'mountainbike' in bike_type or 'trekking' in bike_type or 'city' in bike_type or 'hardtail' in bike_type or 'fully' in bike_type
    has_bike_model = any(k in title_lower for k in ['hybrid', 'e-bike', 'ebike', 'pedelec', 'mountainbike', 'trekking', 'fully', 'hardtail', 'city', 'tour', 'stereo', 'reaction', 'nuride', 'kathmandu', 'suprissa', 'supreme', 'tourray', 'allmtn', 'adventr', 'sduro', 'xduro', 'macina', 'endeavour', 'tria', 'moterra', 'hardnine', 'hardseven', 'passage', 'ryvon', 'xyron', 'cairon', 'lumen'])

    if not (has_bike_specs or has_bike_model):
        return None

    # Price
    price_match = re.search(r'itemprop="price"\s+content="([^"]+)"', html)
    if not price_match:
        price_match = re.search(r'class="[^"]*product-detail-price[^"]*"[^>]*>\s*([\d\.,]+)', html)
    
    if not price_match:
        return None
    
    price = parse_german_price(price_match.group(1))
    if price < 1100:
        return None

    slug = url.split('/')[-1].replace('.html', '').lower()
    product_id = f"prod-ebike-{slug[:40]}"

    # Compare at price
    compare_match = re.search(r'class="[^"]*list-price[^"]*"[^>]*>\s*([\d\.,]+)', html)
    compare_at_price = None
    if compare_match:
        compare_at_price = parse_german_price(compare_match.group(1))
            
    if not compare_at_price or compare_at_price <= price:
        compare_at_price = round(price * 1.12, 2)

    # Brand
    brand_match = re.search(r'itemprop="brand"[^>]*content="([^"]+)"', html)
    if not brand_match:
        brand_match = re.search(r'class="[^"]*product-detail-manufacturer-logo"[^>]*alt="([^"]+)"', html)
    brand_name = unescape(brand_match.group(1)).strip() if brand_match else ""
    
    if not brand_name:
        for b in ['Cube', 'Haibike', 'Scott', 'Ghost', 'Kalkhoff', 'Winora', 'Cannondale', 'Conway', 'Focus', 'Raymon', 'Diamant']:
            if b.lower() in title_lower:
                brand_name = b
                break
    if not brand_name:
        brand_name = "CUBE"
        
    brand_upper = brand_name.upper()
    if 'CUBE' in brand_upper:
        brand_name = 'CUBE'
    elif 'HAIBIKE' in brand_upper:
        brand_name = 'Haibike'
    elif 'SCOTT' in brand_upper:
        brand_name = 'SCOTT'
    elif 'GHOST' in brand_upper:
        brand_name = 'GHOST'
    elif 'KALKHOFF' in brand_upper:
        brand_name = 'Kalkhoff'
    elif 'WINORA' in brand_upper:
        brand_name = 'Winora'
    elif 'CANNONDALE' in brand_upper:
        brand_name = 'Cannondale'
    elif 'DIAMANT' in brand_upper:
        brand_name = 'Diamant'

    brand_id = f"b-{brand_name.lower().replace(' ', '-')}"

    # SKU
    sku_match = re.search(r'itemprop="sku"\s+content="([^"]+)"', html)
    sku = sku_match.group(1).strip() if sku_match else f"EBK-{slug[:12].upper()}"

    # Description
    desc_match = re.search(r'itemprop="description"[^>]*>(.*?)</div>', html, re.DOTALL)
    if not desc_match:
        desc_match = re.search(r'class="[^"]*product-detail-description-text[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
    
    if desc_match:
        raw_desc = unescape(re.sub(r'<[^>]+>', ' ', desc_match.group(1))).strip()
        description = re.sub(r'\s+', ' ', raw_desc)
    else:
        description = f"{title} - Höchste Performance und Komfort mit modernem Elektro-Antrieb. Perfekt ausgestattet für Trails, Touren und Alltag."

    short_description = (description[:180] + "...") if len(description) > 180 else description

    # Images
    images = []
    full_imgs = re.findall(r'data-full-image="([^"]+)"', html)
    for img_url in full_imgs:
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        if img_url not in images and not any(x in img_url.lower() for x in ['logo', 'icon', 'banner', 'badge', 'payment', 'siegel']):
            images.append(img_url)
            
    if not images:
        fallback_imgs = re.findall(r'src="(https://elektrofahrrad\.de/media/[^"]+\.(?:jpg|png|webp))"', html)
        for img_url in fallback_imgs:
            if img_url not in images and not any(x in img_url.lower() for x in ['logo', 'icon', 'banner', 'badge', 'payment', 'siegel']):
                images.append(img_url)

    if not images:
        images = ["https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg"]

    # Category determination
    url_lower = url.lower()
    
    if 'fully' in bike_type or 'fully' in title_lower or 'fully' in url_lower:
        cat_id = "cat-e-mtb-fully"
        cat_name = "E-Mountainbike Fully"
    elif 'hardtail' in bike_type or 'hardtail' in title_lower or 'hardtail' in url_lower:
        cat_id = "cat-e-mtb-hardtail"
        cat_name = "E-Mountainbike Hardtail"
    elif 'trekking' in bike_type or 'trekking' in title_lower or 'trekking' in url_lower:
        cat_id = "cat-e-trekking"
        cat_name = "E-Trekkingrad"
    elif 'city' in bike_type or 'city' in title_lower or 'city' in url_lower or 'tiefeinsteiger' in title_lower:
        cat_id = "cat-e-city"
        cat_name = "E-Citybike"
    else:
        cat_id = "cat-ebikes"
        cat_name = "E-Bikes & Elektrofahrräder"

    return {
        "id": product_id,
        "name": title,
        "slug": slug,
        "description": description,
        "short_description": short_description,
        "sku": sku,
        "brand_id": brand_id,
        "brand_name": brand_name,
        "category_id": cat_id,
        "category_name": cat_name,
        "price": price,
        "compare_at_price": compare_at_price,
        "cost_price": round(price * 0.65, 2),
        "stock": 14,
        "low_stock_threshold": 4,
        "status": "active",
        "featured": True,
        "best_seller": price > 3000,
        "new_arrival": True,
        "on_sale": compare_at_price > price,
        "weight_kg": 24.2,
        "rating": 4.9,
        "review_count": 32,
        "images": images,
        "specifications": specs,
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    }

def main():
    print("⚡ Starting Parallel E-Bike Scraper for Elektrofahrrad.de...", flush=True)
    candidates = get_candidate_urls()
    
    scraped_products = []
    seen_ids = set()
    scraped_brands = {}
    target_count = 48

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(parse_product_page, u): u for u in candidates}
        for future in as_completed(futures):
            if len(scraped_products) >= target_count:
                executor.shutdown(wait=False, cancel_futures=True)
                break
            try:
                p = future.result()
                if p and p["id"] not in seen_ids:
                    seen_ids.add(p["id"])
                    scraped_products.append(p)
                    print(f"[{len(scraped_products)}/{target_count}] Scraped E-Bike: {p['name']} ({p['price']} EUR) - Brand: {p['brand_name']} - Cat: {p['category_name']}", flush=True)
                    
                    b_id = p["brand_id"]
                    if b_id not in scraped_brands:
                        scraped_brands[b_id] = {
                            "id": b_id,
                            "name": p["brand_name"],
                            "slug": p["brand_name"].lower().replace(' ', '-'),
                            "logo_url": f"https://elektrofahrrad.de/media/21/49/ce/1738580975/hersteller-{p['brand_name'].lower()}-logo.png",
                            "description": f"Offizieller Partner & E-Bikes von {p['brand_name']}.",
                            "active": True,
                            "created_at": "2026-08-23T12:00:00.000Z"
                        }
            except Exception as err:
                pass

    print(f"\n✅ Total Authentic E-Bikes Scraped: {len(scraped_products)}", flush=True)

    json_path = os.path.join(SCRATCH_DIR, "scraped_bikes.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(scraped_products, f, indent=2, ensure_ascii=False)

    print(f"Saved scraped data to {json_path}", flush=True)

    # Integrate into initial-data.ts
    with open(INITIAL_DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    new_categories = [
        {
            "id": "cat-ebikes",
            "name": "E-Bikes & Elektrofahrräder",
            "slug": "e-bikes",
            "description": "Premium Elektrofahrräder, E-MTBs, E-Trekking- und E-Citybikes bester Marken.",
            "image_url": "https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg",
            "icon": "Zap",
            "active": True,
            "sort_order": 1
        },
        {
            "id": "cat-e-mtb-hardtail",
            "name": "E-Mountainbike Hardtail",
            "slug": "e-mtb-hardtail",
            "description": "Sportliche E-MTB Hardtails mit Bosch CX Antrieben für Gelände und Touren.",
            "image_url": "https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg",
            "icon": "Mountain",
            "active": True,
            "sort_order": 2
        },
        {
            "id": "cat-e-mtb-fully",
            "name": "E-Mountainbike Fully",
            "slug": "e-mtb-fully",
            "description": "Vollgefederte E-MTBs für maximalen Komfort und Traktion im rauem Terrain.",
            "image_url": "https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg",
            "icon": "ShieldAlert",
            "active": True,
            "sort_order": 3
        },
        {
            "id": "cat-e-trekking",
            "name": "E-Trekkingrad",
            "slug": "e-trekkingrad",
            "description": "Vielseitige E-Trekkingräder für Langstrecken, Pendeln und Ausflüge.",
            "image_url": "https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg",
            "icon": "Navigation",
            "active": True,
            "sort_order": 4
        },
        {
            "id": "cat-e-city",
            "name": "E-Citybike",
            "slug": "e-citybike",
            "description": "Komfortable E-Citybikes mit tiefem Einstieg für den urbanen Alltag.",
            "image_url": "https://elektrofahrrad.de/media/3c/42/de/1756805204/108420-Cube-Reaction-Hybrid-Race-800-polarlight-n-prism-2026-EBike-Hardtail-Mountainbike-00.jpg",
            "icon": "Bike",
            "active": True,
            "sort_order": 5
        }
    ]

    prod_split = content.split("export const INITIAL_PRODUCTS: Product[] = [")
    header = prod_split[0]
    tail_split = prod_split[1].split(";\n\nexport const INITIAL_BANNERS")
    old_products_body = tail_split[0]
    footer = ";\n\nexport const INITIAL_BANNERS" + tail_split[1]

    for cat in reversed(new_categories):
        if cat["id"] not in header:
            cat_str = json.dumps(cat, indent=4, ensure_ascii=False)
            header = header.replace("export const INITIAL_CATEGORIES: Category[] = [", f"export const INITIAL_CATEGORIES: Category[] = [\n  {cat_str},")

    for br in reversed(list(scraped_brands.values())):
        if br["id"] not in header:
            br_str = json.dumps(br, indent=4, ensure_ascii=False)
            header = header.replace("export const INITIAL_BRANDS: Brand[] = [", f"export const INITIAL_BRANDS: Brand[] = [\n  {br_str},")

    new_prods_json = json.dumps(scraped_products, indent=2, ensure_ascii=False)[1:-1]
    new_full_content = header + "export const INITIAL_PRODUCTS: Product[] = [\n" + new_prods_json + ",\n" + old_products_body + footer

    with open(INITIAL_DATA_PATH, 'w', encoding='utf-8') as f:
        f.write(new_full_content)
        
    print(f"🎉 Updated {INITIAL_DATA_PATH} with {len(scraped_products)} scraped E-Bikes!", flush=True)

if __name__ == "__main__":
    main()
