export interface SourceProductMapping {
  slug: string;
  name: string;
  brand: string;
  color: string;
  model: string;
  source: string;
  primaryUrl: string;
  galleryUrls: string[];
  altPrimaryDe: string;
  altGalleryDe: string[];
}

export const EXACT_SOURCE_PRODUCT_CATALOG: SourceProductMapping[] = [
  // 1. Bose QuietComfort Ultra Headphones Schwarz
  {
    slug: 'amz-bose-quietcomfort-ultra-headphones-schwarz',
    name: 'Bose QuietComfort Ultra Headphones Schwarz',
    brand: 'Bose',
    color: 'Schwarz (Black)',
    model: 'QuietComfort Ultra',
    source: 'Bose Official / Amazon Certified DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Bose QuietComfort Ultra Headphones Schwarz - Premium Noise Cancelling Kopfhörer',
    altGalleryDe: [
      'Bose QuietComfort Ultra Kopfhörer Schwarz Seitenansicht',
      'Bose QuietComfort Ultra Over-Ear Polsterung und Bedienelemente'
    ]
  },
  // 2. Sony WH-1000XM5 Wireless Noise Cancelling Kopfhörer Schwarz
  {
    slug: 'amz-sony-wh-1000xm5-wireless-noise-cancelling-schwarz',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Kopfhörer Schwarz',
    brand: 'Sony',
    color: 'Schwarz (Black)',
    model: 'WH-1000XM5',
    source: 'Sony Official Store DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Sony WH-1000XM5 Wireless Noise Cancelling Kopfhörer Schwarz - Hauptansicht',
    altGalleryDe: [
      'Sony WH-1000XM5 Kopfhörer Schwarz Seitenprofil',
      'Sony WH-1000XM5 Tragekomfort und Ohrmuscheln'
    ]
  },
  // 3. Apple Watch Ultra 2 GPS + Cellular 49mm Titan
  {
    slug: 'amz-apple-watch-ultra-2-gps-cellular-49mm-titan',
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan',
    brand: 'Apple',
    color: 'Titan Natur (Natural Titanium)',
    model: 'Watch Ultra 2 49mm',
    source: 'Apple Store DE / Certified Retail',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan Gehäuse - Sportlich-robuste Ansicht',
    altGalleryDe: [
      'Apple Watch Ultra 2 Titan Gehäuseseite mit Digital Crown',
      'Apple Watch Ultra 2 Display und Ocean Armband Detail'
    ]
  },
  // 4. LG OLED evo C3 65 Zoll 4K Smart TV
  {
    slug: 'amz-lg-oled-evo-c3-65-zoll-4k-smart-tv',
    name: 'LG OLED evo C3 65 Zoll 4K Smart TV',
    brand: 'LG',
    color: 'Dunkelsilber (Dark Silver)',
    model: 'OLED65C37LA',
    source: 'LG DE Official',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'LG OLED evo C3 65 Zoll 4K Smart TV - Heimkino Frontansicht',
    altGalleryDe: [
      'LG OLED evo C3 Schlankes Display-Profil',
      'LG webOS Smart TV Benutzeroberfläche und Cinema HDR'
    ]
  },
  // 5. Dyson V15 Detect Extra Kabelloser Akkusauger
  {
    slug: 'amz-dyson-v15-detect-extra-kabelloser-akkusauger',
    name: 'Dyson V15 Detect Extra Kabelloser Akkusauger',
    brand: 'Dyson',
    color: 'Gelb / Nickel',
    model: 'V15 Detect Extra',
    source: 'Dyson DE Official',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Dyson V15 Detect Extra Kabelloser Akkusauger mit Laser-Stauberkennung',
    altGalleryDe: [
      'Dyson V15 Detect Zubehördüsen und Wandhalterung im Lieferumfang'
    ]
  },
  // 6. Sony PlayStation 5 Pro (2TB SSD)
  {
    slug: 'amz-sony-playstation-5-pro-2tb-digital-edition',
    name: 'Sony PlayStation 5 Pro 2TB Digital Edition',
    brand: 'Sony',
    color: 'Weiß / Schwarz (White/Black)',
    model: 'PlayStation 5 Pro 2TB',
    source: 'PlayStation Store DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Sony PlayStation 5 Pro 2TB Digital Edition Konsole - Frontansicht',
    altGalleryDe: [
      'Sony PlayStation 5 Pro Konsole Vertikalstand',
      'Sony PS5 Pro Konsole mit DualSense Controller'
    ]
  },
  // 7. Apple MacBook Air 15" M3
  {
    slug: 'amz-apple-macbook-air-15-m3-16gb-512gb-mitternacht',
    name: 'Apple MacBook Air 15" M3 16GB 512GB Mitternacht',
    brand: 'Apple',
    color: 'Mitternacht (Midnight)',
    model: 'MacBook Air 15" M3',
    source: 'Apple Store DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Apple MacBook Air 15 Zoll M3 Mitternacht - Schlankes Aluminium Design',
    altGalleryDe: [
      'Apple MacBook Air 15 M3 Gehäuseprofil und MagSafe Port',
      'Apple MacBook Air 15 Liquid Retina Display'
    ]
  },
  // 8. Samsung Galaxy S24 Ultra 5G
  {
    slug: 'amz-samsung-galaxy-s24-ultra-5g-512gb-titanium-gray',
    name: 'Samsung Galaxy S24 Ultra 5G 512GB Titanium Gray',
    brand: 'Samsung',
    color: 'Titanium Gray',
    model: 'Galaxy S24 Ultra',
    source: 'Samsung DE Official',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Samsung Galaxy S24 Ultra 5G 512GB Titanium Gray mit S Pen',
    altGalleryDe: [
      'Samsung Galaxy S24 Ultra Quad-Kamerasystem Rückseite'
    ]
  },
  // 9. Sony DualSense Wireless Controller Midnight Black
  {
    slug: 'amz-sony-dualsense-wireless-controller-midnight-black',
    name: 'Sony DualSense Wireless Controller Midnight Black',
    brand: 'Sony',
    color: 'Midnight Black',
    model: 'DualSense PS5 Controller',
    source: 'PlayStation Store DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Sony DualSense Wireless Controller PS5 Midnight Black - Ergonomisches Design',
    altGalleryDe: [
      'Sony DualSense Controller Midnight Black mit haptischem Feedback'
    ]
  },
  // 10. Apple iPhone 15 Pro Max 256GB Titan Natur
  {
    slug: 'amz-apple-iphone-15-pro-max-256gb-titan-natur',
    name: 'Apple iPhone 15 Pro Max 256GB Titan Natur',
    brand: 'Apple',
    color: 'Titan Natur (Natural Titanium)',
    model: 'iPhone 15 Pro Max',
    source: 'Apple Store DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'Apple iPhone 15 Pro Max 256GB Titan Natur - 6.7 Zoll Super Retina XDR',
    altGalleryDe: [
      'Apple iPhone 15 Pro Max Dreifach-Kamerasystem mit 5x Tele-Zoom'
    ]
  },
  // 11. CUBE Stereo Hybrid 140 HPC Race 750 Carbon E-Bike
  {
    slug: 'amz-cube-stereo-hybrid-140-hpc-race-750-carbon',
    name: 'CUBE Stereo Hybrid 140 HPC Race 750 Carbon E-Bike',
    brand: 'CUBE',
    color: 'Carbon / Grey',
    model: 'Stereo Hybrid 140 HPC Race 750',
    source: 'CUBE Bikes Official DE',
    primaryUrl: '',
    galleryUrls: [],
    altPrimaryDe: 'CUBE Stereo Hybrid 140 HPC Race 750 Carbon E-Bike Fully Mountainbike',
    altGalleryDe: [
      'CUBE Stereo Hybrid 140 HPC Carbon-Rahmen mit Bosch CX Motor',
      'CUBE Stereo Hybrid 140 RockShox 140mm Federgabel und Shimano XT Schaltung'
    ]
  }
];
