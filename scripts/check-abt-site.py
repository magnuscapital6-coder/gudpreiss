import urllib.request
import re
import json
import xml.etree.ElementTree as ET

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

# Try wp-json woocommerce products first
wp_json_url = "https://abt-distribution.com/wp-json/wc/v3/products?per_page=100"
res = fetch_url(wp_json_url)
print("WP-JSON WC products length:", len(res))

if not res or "code" in res:
    # Try public wp/v2 or store API
    wp_store_url = "https://abt-distribution.com/wp-json/wc/store/v1/products?per_page=100"
    res = fetch_url(wp_store_url)
    print("WP Store API length:", len(res))

# Try sitemap
sitemap_url = "https://abt-distribution.com/sitemap_index.xml"
sitemap_xml = fetch_url(sitemap_url)
print("Sitemap XML length:", len(sitemap_xml))

if not sitemap_xml:
    sitemap_url = "https://abt-distribution.com/product-sitemap.xml"
    sitemap_xml = fetch_url(sitemap_url)
    print("Product Sitemap XML length:", len(sitemap_xml))

# Find product URLs in sitemap
product_urls = re.findall(r'<loc>(https://abt-distribution.com/(?:product|produit|boutique)/[^<]+)</loc>', sitemap_xml)
print("Found product URLs in sitemap:", len(product_urls))
