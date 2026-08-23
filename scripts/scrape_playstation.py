import os
import sys
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INITIAL_DATA_PATH = os.path.join(BASE_DIR, "src", "lib", "db", "initial-data.ts")

NEW_CATEGORIES = [
    {
        "id": "cat-ps5-konsolen",
        "name": "PlayStation Konsolen",
        "slug": "playstation-konsolen",
        "description": "Sony PlayStation 5 Pro, PS5 Slim, Digital Edition und exklusive Konsolen-Bundles.",
        "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
        "icon": "Gamepad2",
        "active": True,
        "sort_order": 1
    },
    {
        "id": "cat-ps5-controller",
        "name": "PlayStation Controller & Zubehör",
        "slug": "playstation-controller-zubehoer",
        "description": "DualSense Wireless Controller, DualSense Edge Pro, Ladestationen und Konsolen-Cover.",
        "image_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
        "icon": "Gamepad",
        "active": True,
        "sort_order": 2
    },
    {
        "id": "cat-ps5-audio-vr",
        "name": "PlayStation Audio & VR Headsets",
        "slug": "playstation-audio-vr",
        "description": "PlayStation VR2 Next-Gen VR-Headsets, Pulse Elite, Pulse Explore Earbuds & Pulse 3D.",
        "image_url": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80",
        "icon": "Headphones",
        "active": True,
        "sort_order": 3
    },
    {
        "id": "cat-ps5-speicher",
        "name": "PlayStation SSD & Speichererweiterung",
        "slug": "playstation-ssd-speicher",
        "description": "Offiziell lizenzierte M.2 NVMe SSDs mit Kühlkörper für maximale PS5 Speichererweiterung.",
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
        "icon": "HardDrive",
        "active": True,
        "sort_order": 4
    }
]

NEW_BRANDS = [
    {
        "id": "b-sony-playstation",
        "name": "Sony PlayStation",
        "slug": "sony-playstation",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/4e/PlayStation_single_color_logo.svg",
        "description": "Offizieller Hersteller der PlayStation 5, PS VR2, DualSense und originalem Zubehör.",
        "active": True,
        "created_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "b-logitech-g",
        "name": "Logitech G",
        "slug": "logitech-g",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Logitech_logo.svg",
        "description": "High-End Lenkräder, Pedale und Gaming-Equipment für PlayStation 5 und PC.",
        "active": True,
        "created_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "b-thrustmaster",
        "name": "Thrustmaster",
        "slug": "thrustmaster",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Thrustmaster_logo.svg/320px-Thrustmaster_logo.svg.png",
        "description": "Professionelles Sim-Racing Zubehör und Flight Sticks für PlayStation.",
        "active": True,
        "created_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "b-western-digital",
        "name": "Western Digital",
        "slug": "western-digital",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Western_Digital_logo.svg",
        "description": "Offiziell lizenzierte WD_BLACK High-Speed M.2 NVMe SSDs für PS5.",
        "active": True,
        "created_at": "2026-08-23T12:00:00.000Z"
    }
]

PLAYSTATION_PRODUCTS = [
    {
        "id": "prod-ps5-pro-2tb",
        "name": "Sony PlayStation 5 Pro (2TB SSD Edition)",
        "slug": "sony-playstation-5-pro-2tb-ssd",
        "description": "Die PlayStation 5 Pro ist die leistungsstärkste Konsole von Sony. Mit fortschrittlicher PSSR (PlayStation Spectral Super Resolution) KI-Skalierung, 2TB ultraschnellem NVMe SSD-Speicher, verbessertem Raytracing und Wi-Fi 7 Unterstützung bietet sie 4K Gaming bei flüssigen 60 FPS und bis zu 120 FPS bei kompatiblen Titeln.",
        "short_description": "Sony PS5 Pro Konsole mit 2TB SSD, PSSR KI-Upscaling, verbessertem Raytracing und Wi-Fi 7 | 2 Jahre Garantie & Gratis Versand.",
        "sku": "CFI-7000-2TB",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-konsolen",
        "category_name": "PlayStation Konsolen",
        "price": 799.99,
        "compare_at_price": 849.99,
        "cost_price": 680.00,
        "stock": 18,
        "low_stock_threshold": 5,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": True,
        "on_sale": True,
        "weight_kg": 3.1,
        "rating": 4.9,
        "review_count": 142,
        "images": [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Speicherkapazität": "2TB NVMe Custom SSD",
            "Auflösung": "4K Ultra HD (bis zu 8K Support)",
            "Bildwiederholfrequenz": "Bis zu 120 Hz (4K / 120 FPS)",
            "Technologie": "PSSR KI-Upscaling, Hardware Raytracing",
            "WLAN": "Wi-Fi 7 (802.11be)",
            "Anschlüsse": "HDMI 2.1, 2x USB-C, 2x USB-A, Gigabit LAN",
            "Audio": "Tempest 3D AudioTech",
            "Lieferumfang": "PS5 Pro Konsole, DualSense Wireless Controller, 2TB SSD (integriert), HDMI 2.1 Kabel, Stromkabel"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-ps5-slim-disc-1tb",
        "name": "Sony PlayStation 5 Slim (Disc Edition 1TB)",
        "slug": "sony-playstation-5-slim-disc-edition-1tb",
        "description": "Die PS5 Slim bringt geballte Gaming-Leistung in einem schlankeren, kompakteren Gehäuse mit 1TB interne SSD. Ausgestattet mit abnehmbarem Ultra HD Blu-ray-Laufwerk, DualSense Wireless-Controller und vollem Support für Tempest 3D AudioTech und Raytracing.",
        "short_description": "Sony PlayStation 5 Slim mit UHD Blu-ray Laufwerk und 1TB SSD Speicher.",
        "sku": "CFI-2000-DISC",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-konsolen",
        "category_name": "PlayStation Konsolen",
        "price": 549.99,
        "compare_at_price": 599.99,
        "cost_price": 460.00,
        "stock": 25,
        "low_stock_threshold": 5,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 3.2,
        "rating": 4.8,
        "review_count": 310,
        "images": [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Speicherkapazität": "1TB Custom NVMe SSD",
            "Laufwerk": "Ultra HD Blu-ray Disc-Laufwerk",
            "Auflösung": "4K Ultra HD bei 120Hz",
            "Audio": "Tempest 3D AudioTech",
            "Gewicht": "3.2 kg"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-ps5-slim-digital-1tb",
        "name": "Sony PlayStation 5 Slim Digital Edition (1TB)",
        "slug": "sony-playstation-5-slim-digital-edition-1tb",
        "description": "Reines digitales Gaming ohne Disc-Laufwerk. Die PS5 Digital Edition Slim bietet 1TB ultraschnellen SSD-Speicher, atemberaubende 4K-Grafik und volle Kompatibilität mit dem nachträglich installierbaren PS5 Disc-Laufwerk.",
        "short_description": "Sony PS5 Slim Digital Edition mit 1TB SSD Speicher.",
        "sku": "CFI-2000-DIGITAL",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-konsolen",
        "category_name": "PlayStation Konsolen",
        "price": 449.99,
        "compare_at_price": 499.99,
        "cost_price": 380.00,
        "stock": 30,
        "low_stock_threshold": 5,
        "status": "active",
        "featured": True,
        "best_seller": False,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 2.6,
        "rating": 4.8,
        "review_count": 188,
        "images": [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Speicherkapazität": "1TB Custom NVMe SSD",
            "Laufwerk": "Ohne Laufwerk (optional nachrüstbar)",
            "Auflösung": "4K Ultra HD bei 120Hz"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-ps5-bundle-astro-bot",
        "name": "Sony PlayStation 5 Slim + ASTRO BOT Bundle",
        "slug": "sony-playstation-5-slim-astro-bot-bundle",
        "description": "Erleben Sie den preisgekrönten visualisierungseffektvollen Spielspaß von ASTRO BOT zusammen mit der PlayStation 5 Slim (Disc Edition 1TB). Inklusive ASTRO BOT Vollversion und exklusivem DualSense Controller Feedback.",
        "short_description": "PS5 Slim Konsole (1TB Disc Edition) inkl. ASTRO BOT Spiel.",
        "sku": "CFI-2000-ASTRO",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-konsolen",
        "category_name": "PlayStation Konsolen",
        "price": 579.99,
        "compare_at_price": 629.99,
        "cost_price": 490.00,
        "stock": 12,
        "low_stock_threshold": 3,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": True,
        "on_sale": True,
        "weight_kg": 3.4,
        "rating": 5.0,
        "review_count": 94,
        "images": [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Inhalt": "PS5 Slim 1TB Disc Edition, ASTRO BOT Spielcode, DualSense Controller",
            "Speicherkapazität": "1TB NVMe SSD"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-dualsense-white",
        "name": "Sony DualSense Wireless Controller (Original White)",
        "slug": "sony-dualsense-wireless-controller-white",
        "description": "Der revolutionäre DualSense Wireless-Controller für PS5 bietet haptisches Feedback, dynamische adaptive Trigger und ein integriertes Mikrofon in einem stilvollen zweifarbigen Design.",
        "short_description": "Original Sony DualSense Controller für PS5 in Weiß mit haptischem Feedback.",
        "sku": "CFI-ZCT1W",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-controller",
        "category_name": "PlayStation Controller & Zubehör",
        "price": 69.99,
        "compare_at_price": 74.99,
        "cost_price": 48.00,
        "stock": 50,
        "low_stock_threshold": 10,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 0.28,
        "rating": 4.9,
        "review_count": 520,
        "images": [
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Farbe": "Original Weiß / Schwarz",
            "Features": "Haptisches Feedback, Adaptive Trigger, Integriertes Mikrofon, USB-C",
            "Akkutyp": "Lithium-Ionen"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-dualsense-midnight-black",
        "name": "Sony DualSense Wireless Controller (Midnight Black)",
        "slug": "sony-dualsense-wireless-controller-midnight-black",
        "description": "Entdecken Sie das elegante Midnight Black Design des DualSense Wireless-Controllers. Inspiriert von den Weiten des Nachthimmels.",
        "short_description": "DualSense Controller in edlem Midnight Black für PS5.",
        "sku": "CFI-ZCT1K",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-controller",
        "category_name": "PlayStation Controller & Zubehör",
        "price": 69.99,
        "compare_at_price": 74.99,
        "cost_price": 48.00,
        "stock": 40,
        "low_stock_threshold": 8,
        "status": "active",
        "featured": False,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 0.28,
        "rating": 4.9,
        "review_count": 410,
        "images": ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"],
        "specifications": {
            "Farbe": "Midnight Black (Schwarz)",
            "Features": "Haptisches Feedback, Adaptive Trigger, USB-C"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-dualsense-edge-pro",
        "name": "Sony DualSense Edge Pro Wireless Controller",
        "slug": "sony-dualsense-edge-pro-wireless-controller",
        "description": "Der ultrakustomisierbare Pro-Controller für PlayStation 5. Bietet austauschbare Stick-Module, anpassbare Rücktasten (Rückpaddles), einstellbare Trigger-Stopps, speicherbare Profiltasten und eine praktische Schutztasche.",
        "short_description": "Pro-Controller mit austauschbaren Sticks, Rücktasten und konfigurierbaren Profilen.",
        "sku": "CFI-ZCP1",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-controller",
        "category_name": "PlayStation Controller & Zubehör",
        "price": 239.99,
        "compare_at_price": 249.99,
        "cost_price": 185.00,
        "stock": 15,
        "low_stock_threshold": 3,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 0.33,
        "rating": 4.9,
        "review_count": 210,
        "images": [
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Features": "Austauschbare Stick-Caps & Module, 2 Rücktasten (Paddles), Trigger-Stopps",
            "Lieferumfang": "DualSense Edge Controller, Paddles, Stick-Kappen, USB-C Kabel, Case"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-playstation-portal-remote",
        "name": "PlayStation Portal Remote Player für PS5",
        "slug": "playstation-portal-remote-player-ps5",
        "description": "Spielen Sie Ihre PS5-Spiele überall im Heimnetzwerk auf einem brillant leuchtenden 8-Zoll Full-HD-LCD-Bildschirm bei 60 FPS. Bietet alle DualSense-Features wie haptisches Feedback und adaptive Trigger.",
        "short_description": "Handheld Remote Player mit 8-Zoll 1080p Display und DualSense Bedienelementen.",
        "sku": "CFI-Y1001",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-controller",
        "category_name": "PlayStation Controller & Zubehör",
        "price": 219.99,
        "compare_at_price": 229.99,
        "cost_price": 175.00,
        "stock": 18,
        "low_stock_threshold": 4,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": True,
        "on_sale": True,
        "weight_kg": 0.53,
        "rating": 4.8,
        "review_count": 165,
        "images": [
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Bildschirm": "8-Zoll LCD Touchscreen (1920x1080 Full HD)",
            "Bildwiederholrate": "60 FPS Streaming",
            "Konnektivität": "Wi-Fi, PlayStation Link Audio, 3.5mm Klinke"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-ps-vr2-headset",
        "name": "Sony PlayStation VR2 Headset",
        "slug": "sony-playstation-vr2-headset",
        "description": "Erleben Sie Next-Gen Virtual Reality auf der PS5. Mit 4K HDR OLED-Displays (2000x2040 pro Auge), intelligentem Eye-Tracking, Headset-Feedback und den intuitiven PlayStation VR2 Sense-Controllern.",
        "short_description": "Next-Gen VR-Headset mit 4K HDR OLED, Eye-Tracking und VR2 Sense-Controllern.",
        "sku": "CFI-ZVR1",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-audio-vr",
        "category_name": "PlayStation Audio & VR Headsets",
        "price": 599.99,
        "compare_at_price": 649.99,
        "cost_price": 480.00,
        "stock": 14,
        "low_stock_threshold": 3,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 0.56,
        "rating": 4.9,
        "review_count": 175,
        "images": [
            "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=1200&q=80"
        ],
        "specifications": {
            "Display": "OLED (2000 x 2040 Pixel pro Auge)",
            "Bildwiederholfrequenz": "90 Hz, 120 Hz",
            "Sichtfeld": "Ca. 110 Grad",
            "Sensoren": "6-Achsen-Bewegungssensor, IR-Kamera Eye-Tracking"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-pulse-elite-headset",
        "name": "Sony Pulse Elite Wireless Headset für PS5",
        "slug": "sony-pulse-elite-wireless-headset-ps5",
        "description": "Erstklassiger Sound dank Magnetostat-Treibern aus Studioqualität. Bietet verlustfreie PlayStation Link Wireless-Konnektivität, ein einziehbares Mikrofon mit KI-unterstützter Rauschunterdrückung.",
        "short_description": "Over-Ear Wireless Headset mit Magnetostat-Treibern & KI-Rauschunterdrückung.",
        "sku": "CFI-ZWH2",
        "brand_id": "b-sony-playstation",
        "brand_name": "Sony PlayStation",
        "category_id": "cat-ps5-audio-vr",
        "category_name": "PlayStation Audio & VR Headsets",
        "price": 149.99,
        "compare_at_price": 159.99,
        "cost_price": 110.00,
        "stock": 22,
        "low_stock_threshold": 4,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": True,
        "on_sale": True,
        "weight_kg": 0.34,
        "rating": 4.9,
        "review_count": 115,
        "images": ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80"],
        "specifications": {
            "Treiber": "Planar-Magnetostatische Treiber",
            "Akkulaufzeit": "Bis zu 30 Stunden",
            "Verbindung": "PlayStation Link & Bluetooth Dual-Connectivity"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-wd-black-sn850x-2tb-heatsink",
        "name": "WD_BLACK SN850X 2TB NVMe M.2 SSD mit Kühlkörper (PS5 Lizenz)",
        "slug": "wd-black-sn850x-2tb-nvme-ssd-heatsink-ps5",
        "description": "Offiziell von PlayStation lizensierte M.2 NVMe PCIe Gen4 SSD mit integriertem Aluminium-Heatsink. Erreicht blitzschnelle Lesegeschwindigkeiten von bis zu 7.300 MB/s für unmittelbare Ladezeiten.",
        "short_description": "Offizielle PS5 M.2 SSD mit 2TB Speicher und 7.300 MB/s Lesegeschwindigkeit.",
        "sku": "WDBBWY0020BNC-WNSN",
        "brand_id": "b-western-digital",
        "brand_name": "Western Digital",
        "category_id": "cat-ps5-speicher",
        "category_name": "PlayStation SSD & Speichereweiterung",
        "price": 189.99,
        "compare_at_price": 219.99,
        "cost_price": 135.00,
        "stock": 30,
        "low_stock_threshold": 5,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 0.05,
        "rating": 5.0,
        "review_count": 290,
        "images": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80"],
        "specifications": {
            "Kapazität": "2TB (2000 GB)",
            "Schnittstelle": "PCIe Gen4 x4 NVMe M.2 2280",
            "Lesegeschwindigkeit": "Bis zu 7.300 MB/s",
            "Kühlkörper": "Integriertes Heatsink"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    },
    {
        "id": "prod-logitech-g923-ps5",
        "name": "Logitech G923 TRUEFORCE Rennlenkrad & Pedale für PS5/PS4/PC",
        "slug": "logitech-g923-trueforce-racing-wheel-ps5",
        "description": "Spüren Sie die Physik der Strecke. TRUEFORCE High-Definition-Force-Feedback verbindet sich direkt mit den Spielmotoren. Ausgestattet mit programmierbarer Doppelkupplung und Lederlenkrad.",
        "short_description": "Profi-Rennlenkrad mit TRUEFORCE Haptik & 3-Pedal-Set für PS5 & PC.",
        "sku": "941-000149",
        "brand_id": "b-logitech-g",
        "brand_name": "Logitech G",
        "category_id": "cat-ps5-controller",
        "category_name": "PlayStation Controller & Zubehör",
        "price": 349.99,
        "compare_at_price": 399.99,
        "cost_price": 255.00,
        "stock": 16,
        "low_stock_threshold": 3,
        "status": "active",
        "featured": True,
        "best_seller": True,
        "new_arrival": False,
        "on_sale": True,
        "weight_kg": 5.4,
        "rating": 4.8,
        "review_count": 178,
        "images": ["https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"],
        "specifications": {
            "Technologie": "TRUEFORCE Feedback",
            "Material": "Handgenähtes Leder, Aluminium-Schaltwippen",
            "Pedale": "Progressives Bremspedal-Set"
        },
        "created_at": "2026-08-23T12:00:00.000Z",
        "updated_at": "2026-08-23T12:00:00.000Z"
    }
]

def main():
    print("🚀 Starting PlayStation Product Import into GudPreiss Database...", flush=True)
    
    with open(INITIAL_DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Prepend categories
    for cat in reversed(NEW_CATEGORIES):
        if cat["id"] not in content:
            cat_str = json.dumps(cat, indent=4, ensure_ascii=False)
            content = content.replace("export const INITIAL_CATEGORIES: Category[] = [", f"export const INITIAL_CATEGORIES: Category[] = [\n  {cat_str},")

    # Prepend brands
    for br in reversed(NEW_BRANDS):
        if br["id"] not in content:
            br_str = json.dumps(br, indent=4, ensure_ascii=False)
            content = content.replace("export const INITIAL_BRANDS: Brand[] = [", f"export const INITIAL_BRANDS: Brand[] = [\n  {br_str},")

    # Prepend products
    prod_split = content.split("export const INITIAL_PRODUCTS: Product[] = [")
    header = prod_split[0]
    tail = prod_split[1]

    new_prods_str = json.dumps(PLAYSTATION_PRODUCTS, indent=2, ensure_ascii=False)[1:-1]
    updated_content = header + "export const INITIAL_PRODUCTS: Product[] = [\n" + new_prods_str + ",\n" + tail

    with open(INITIAL_DATA_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"🎉 Successfully imported PlayStation Consoles & Accessories into {INITIAL_DATA_PATH}!", flush=True)

if __name__ == "__main__":
    main()
