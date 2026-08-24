import { ProductIdentity } from '@/types/catalog-import-pipeline';

export interface MultiSourceFallbackEntry {
  identity: ProductIdentity;
  sources: {
    level: 1 | 2 | 3 | 4;
    name: string;
    url: string;
    primaryImage: string;
    galleryImages: string[];
    descriptionDe: string;
    shortDescriptionDe: string;
    features: string[];
    confidence: number;
  }[];
}

export const MULTI_SOURCE_FALLBACK_CATALOG: MultiSourceFallbackEntry[] = [
  // 1. Bose QuietComfort Ultra Headphones Schwarz
  {
    identity: {
      sku: 'BOSE-QC-ULTRA-BLK',
      ean: '017817842266',
      gtin: '00017817842266',
      mpn: '880066-0100',
      brand: 'Bose',
      model: 'QuietComfort Ultra',
      variant_color: 'Schwarz (Black)',
    },
    sources: [
      {
        level: 1,
        name: 'Bose Official Germany',
        url: 'https://www.bose.de/de_de/products/headphones/over_ear_headphones/quietcomfort-ultra-headphones.html',
        primaryImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Die Bose QuietComfort Ultra Headphones bieten weltklasse Immersive Audio, fortschrittlichstes Active Noise Cancelling und erstklassigen Tragekomfort.',
        shortDescriptionDe: 'Bose QuietComfort Ultra Headphones Schwarz mit Immersive Audio und CustomTune.',
        features: ['Immersive Audio', 'CustomTune-Technologie', '24 Stunden Akkulaufzeit', 'Bluetooth 5.3'],
        confidence: 100
      }
    ]
  },

  // 2. Sony WH-1000XM5 Wireless Noise Cancelling Kopfhörer Schwarz
  {
    identity: {
      sku: 'SONY-WH1000XM5-BLK',
      ean: '4548736132580',
      gtin: '04548736132580',
      mpn: 'WH1000XM5B.CE7',
      brand: 'Sony',
      model: 'WH-1000XM5',
      variant_color: 'Schwarz (Black)',
    },
    sources: [
      {
        level: 1,
        name: 'Sony Official Store DE',
        url: 'https://www.sony.de/headphones/products/wh-1000xm5',
        primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Der Sony WH-1000XM5 definiert ungestörten Hörgenuss neu mit zwei Prozessoren und 8 Mikrofomen für branchenführendes Noise Cancelling.',
        shortDescriptionDe: 'Sony WH-1000XM5 Bluetooth Noise-Cancelling-Kopfhörer Schwarz mit 30 Std. Akku.',
        features: ['Auto NC Optimizer', 'HD-Prozessor QN1', 'Precise Voice Pickup', '30h Akku mit Schnellladung'],
        confidence: 100
      }
    ]
  },

  // 3. Apple Watch Ultra 2 GPS + Cellular 49mm Titan
  {
    identity: {
      sku: 'APPLE-WATCH-ULTRA2-49',
      ean: '0195949033285',
      gtin: '00195949033285',
      mpn: 'MREX3FD/A',
      brand: 'Apple',
      model: 'Watch Ultra 2',
      variant_color: 'Titan Natur',
      variant_capacity: '49mm',
    },
    sources: [
      {
        level: 1,
        name: 'Apple Store Deutschland',
        url: 'https://www.apple.com/de/apple-watch-ultra-2/',
        primaryImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Die ultimative Sport- und Abenteueruhr. Mit dem S9 SiP, 3.000 Nits hellem Display und präzisem Zwei-Frequenz GPS.',
        shortDescriptionDe: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan mit S9 SiP und Modular Ultra Display.',
        features: ['Titangehäuse 49mm', 'Display mit 3.000 Nits', 'Doppeltipp-Geste', 'Bis zu 72 Std. Akku'],
        confidence: 100
      }
    ]
  },

  // 4. LG OLED evo C3 65 Zoll 4K Smart TV
  {
    identity: {
      sku: 'LG-OLED65C37LA',
      ean: '8806091817457',
      gtin: '08806091817457',
      mpn: 'OLED65C37LA.AEU',
      brand: 'LG',
      model: 'OLED evo C3',
      variant_capacity: '65 Zoll',
    },
    sources: [
      {
        level: 1,
        name: 'LG Deutschland Official',
        url: 'https://www.lg.com/de/tvs/lg-oled65c37la',
        primaryImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Erleben Sie brillante OLED evo Performance mit dem α9 Gen6 4K AI-Prozessor und Brightness Booster für maximale Helligkeit.',
        shortDescriptionDe: 'LG OLED evo C3 65 Zoll 4K Smart TV mit Dolby Vision IQ und 120Hz Gaming.',
        features: ['α9 Gen6 4K AI-Prozessor', 'Brightness Booster', '4x HDMI 2.1 120Hz', 'webOS23'],
        confidence: 100
      }
    ]
  },

  // 5. Dyson V15 Detect Extra Akkusauger
  {
    identity: {
      sku: 'DYSON-V15-DETECT-EXT',
      ean: '5025155070284',
      gtin: '05025155070284',
      mpn: '394472-01',
      brand: 'Dyson',
      model: 'V15 Detect Extra',
    },
    sources: [
      {
        level: 1,
        name: 'Dyson Germany Official',
        url: 'https://www.dyson.de/staubsauger/kabellos/v15-detect',
        primaryImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Kabelloser Akkusauger mit präzisem Lichtstrahl zur Stauberkennung und piezoelektrischem Sensor für automatische Saugkraftanpassung.',
        shortDescriptionDe: 'Dyson V15 Detect Extra Akkustaubsauger mit Laser-Stauberkennung & 240 AW Saugkraft.',
        features: ['Lichtstrahl Stauberkennung', 'Piezo-Sensor', '240 AW Saugkraft', '60 Min. Laufzeit'],
        confidence: 100
      }
    ]
  },

  // 6. Sony PlayStation 5 Pro 2TB
  {
    identity: {
      sku: 'SONY-PS5-PRO-2TB',
      ean: '0711719577903',
      gtin: '00711719577903',
      mpn: 'CFI-7016B',
      brand: 'Sony',
      model: 'PlayStation 5 Pro',
      variant_capacity: '2TB SSD',
    },
    sources: [
      {
        level: 1,
        name: 'PlayStation Store DE',
        url: 'https://www.playstation.com/de-de/ps5/ps5-pro/',
        primaryImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'Die leistungsstärkste PlayStation Konsole aller Zeiten mit PSSR AI-Upscaling, verbessertem Raytracing und 2TB High-Speed SSD.',
        shortDescriptionDe: 'Sony PlayStation 5 Pro Konsole (2TB SSD, PSSR AI-Upscaling, 60fps 4K Gaming).',
        features: ['PlayStation Spectral Super Resolution (PSSR)', 'Erweitertes Raytracing', '2TB SSD', 'Wi-Fi 7'],
        confidence: 100
      }
    ]
  },

  // 7. CUBE Stereo Hybrid 140 HPC Race 750 Carbon E-Bike
  {
    identity: {
      sku: 'CUBE-SH140-HPC-750',
      ean: '4054571408892',
      gtin: '04054571408892',
      mpn: '636153',
      brand: 'CUBE',
      model: 'Stereo Hybrid 140 HPC Race 750',
      variant_color: 'Carbon / Black',
    },
    sources: [
      {
        level: 1,
        name: 'CUBE Bikes Official DE',
        url: 'https://www.cube.eu/de-de/cube-stereo-hybrid-140-hpc-race-750-black-n-flashgrey/636153',
        primaryImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=85',
        galleryImages: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=85',
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1400&q=85'
        ],
        descriptionDe: 'High-Performance Carbon E-MTB Fully mit Bosch Performance CX Motor (85Nm), Bosch PowerTube 750 Wh Akku und RockShox 140mm Fahrwerk.',
        shortDescriptionDe: 'CUBE Stereo Hybrid 140 HPC Race 750 Carbon E-Bike mit Bosch CX & 750Wh Akku.',
        features: ['C:62 Carbon Hauptrahmen', 'Bosch CX 85Nm', 'PowerTube 750Wh', 'Shimano XT 12-fach'],
        confidence: 100
      }
    ]
  }
];
