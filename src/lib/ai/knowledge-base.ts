import { KnowledgeItem, GupreissConfig, HandoffTicket, AIAnalytics } from '@/types/ai';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/db/initial-data';
import { Product } from '@/types';

// Default Assistant Configuration
export const DEFAULT_GUPREISS_CONFIG: GupreissConfig = {
  enabled: true,
  name: 'Gupreiss',
  avatar: '/images/avatar.png',
  welcomeMessage: 'Hallo! Ich bin Gupreiss, Ihr persönlicher Einkaufs- und Service-Berater. Wie kann ich Ihnen heute bei E-Bikes, PlayStation oder Bestellungen helfen?',
  systemPrompt: `Du bist Gupreiss, der hochintelligente, autonome Kundenservice- und Verkaufs-Assistent von Gudpreiss (gudpreiss.de).
Deine primäre Aufgabe ist es, Kunden präzise, sachlich und verlässlich zu beraten.

WICHTIGE VERHALTENSREGELN & SICHERHEIT:
1. EXAKTHEIT: Erfinde NIEMALS Preise, Eigenschaften, Lagerbestände oder Richtlinien. Nutze ausschließlich die bereitgestellten Informationen.
2. UNVOLLSTÄNDIGE ANGABEN: Wenn der Kunde ungenaue Wünsche hat (z. B. "Ich suche ein Fahrrad"), stelle höfliche, gezielte Rückfragen (z. B. nach Einsatzbereich, Budget, Motorleistung oder Rahmenform).
3. PRODUKEMPFEHLUNGEN: Empfehle konkrete Produkte aus dem Katalog mit echtem Namen und genauer Preisangabe.
4. MENSCHLICHE ÜBERTRAGUNG: Wenn der Kunde ein persönliches Angebot, eine manuelle Bearbeitung wünscht oder ein komplexes Problem vorliegt, sammle Name, E-Mail und Anliegen und löse die E-Mail-Übermittlung an kontakt@gudpreiss.de aus.
5. BESTÄTIGUNG: Nach der E-Mail-Übertragung bestätige dem Kunden sofort, dass seine Nachricht mit allen Details an das Team gesendet wurde. Behaupte nie, dass ein Mensch bereits geantwortet hat.
6. TONFALL: Professionell, hilfsbereit, transparent und zuvorkommend.`,
  tone: 'expert',
  targetEmail: 'kontakt@gudpreiss.de',
  enableEmailHandoff: true,
  maxTokens: 800,
  model: 'gpt-4o-mini',
};

// Official Platform Knowledge Base
export const DEFAULT_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-shipping',
    category: 'shipping',
    title: 'Versandoptionen & Lieferzeiten',
    content: `Gudpreiss liefert klimaneutral deutschlandweit und in die EU mit DHL und DPD Premium.
- Kostenloser Versand ab 50 € Bestellwert (sonst 4,90 € Versendungspauschale).
- Standard-Lieferzeit: 1 bis 3 Werktage.
- E-Bikes werden vollständig vormontiert im Spezialkarton per Spedition geliefert (Lieferzeit 2-4 Werktage mit Terminavisierung).
- Sendungsverfolgung erhalten Sie direkt nach Versand per E-Mail oder auf /track.`,
    keywords: ['versand', 'lieferung', 'versandkosten', 'lieferzeit', 'dhl', 'dpd', 'kostenlos', 'track', 'spedition'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-returns',
    category: 'returns',
    title: 'Rückgabe & Widerrufsrecht',
    content: `30 Tage kostenloses Rückgaberecht ohne Angabe von Gründen.
- Artikel müssen in Originalverpackung und unbeschädigtem Zustand zurückgesendet werden.
- Kostenloses Retourenlabel kann auf /return-policy oder über unseren Support angefordert werden.
- Erstattung erfolgt innerhalb von 3-5 Werktagen nach Eingang der Retoure auf das ursprüngliche Zahlungsmittel.`,
    keywords: ['rückgabe', 'retoure', 'widerruf', 'geld zurück', 'umtausch', '30 tage', 'erstattung'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-payment',
    category: 'payment',
    title: 'Zahlungsmethoden',
    content: `Folgende sichere Zahlungsmethoden stehen zur Verfügung:
- Klarna (Kauf auf Rechnung nach 30 Tagen, Ratenkauf).
- PayPal & PayPal Später Bezahlen.
- Kreditkarte (Visa, Mastercard, American Express).
- Apple Pay & Google Pay.
- SEPA Lastschrift & Sofortüberweisung.`,
    keywords: ['zahlung', 'behandeln', 'klarna', 'rechnung', 'paypal', 'kreditkarte', 'ratenkauf', 'apple pay', 'sepa'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-warranty',
    category: 'warranty',
    title: 'Garantie & Gewährleistung',
    content: `Alle Produkte bei Gudpreiss haben 2 Jahre volle Herstellergarantie und gesetzliche Gewährleistung.
- Für E-Bikes bieten wir zusätzlich 1 Jahr Akku-Kapazitätsgarantie (mindestens 70% Leistung).
- Bei Defekten erhalten Sie ein kostenloses Ersatzgerät oder eine Express-Reparatur.`,
    keywords: ['garantie', 'gewährleistung', 'defekt', 'schaden', 'reparatur', 'akku', '2 jahre'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-contact',
    category: 'general',
    title: 'Kontakt & Kundenservice',
    content: `E-Mail Support: kontakt@gudpreiss.de
Telefonische Beratung: +49 30 12345678 (Mo-Fr 09:00 - 18:00 Uhr)
Standort: Gudpreiss GmbH, Gudpreiss Straße 42, 10115 Berlin, Deutschland.`,
    keywords: ['kontakt', 'email', 'telefon', 'support', 'adresse', 'öffnungszeiten', 'hilfe'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-ps5-hardware',
    category: 'products',
    title: 'PlayStation 5 Konsolen & Zubehör Angebot',
    content: `Gudpreiss führt das offizielle Sony PlayStation Sortiment auf Lager:
- PS5 Pro 2TB Edition (ab 799,99 €)
- PS5 Slim Digital Edition (ab 449,99 €) & Disc Edition (ab 549,99 €)
- DualSense Wireless Controller in allen Farben (Weiß, Midnight Black, Cosmic Red, Cobalt Blue, Starlight Blue)
- DualSense Edge High-Performance Controller
- PlayStation VR2 Headset & Horizon Bundle
- PlayStation Portal Remote Player (ab 219,99 €)
- Pulse Elite Wireless Headset & Pulse Explore Earbuds.`,
    keywords: ['playstation', 'ps5', 'ps5 pro', 'dualsense', 'vr2', 'portal', 'pulse', 'sony', 'zubehör', 'konsole'],
    updatedAt: '2026-08-23',
  },
  {
    id: 'kb-ebikes',
    category: 'products',
    title: 'E-Bikes Sortiment & Marken',
    content: `Über 45 E-Bike Modelle führender Marken wie SCOTT, CUBE, Haibike, Conway, Kalkhoff, Winora:
- E-Mountainbikes (Fully & Hardtail) z. B. SCOTT Lumen eRIDE, CUBE Stereo Hybrid 140/160, Conway Ryvon.
- E-Trekkingbikes z. B. Kalkhoff Endeavour, CUBE Kathmandu Hybrid.
- E-Citybikes z. B. Winora Sinus, CUBE Supreme Hybrid.
- Ausgestattet mit Bosch Performance CX / SX, Shimano EP8, Mahle oder Yamaha Antrieben.`,
    keywords: ['e-bike', 'fahrrad', 'elektrofahrrad', 'scott', 'cube', 'haibike', 'conway', 'kalkhoff', 'winora', 'bosch', 'ep8', 'mtb', 'trekking'],
    updatedAt: '2026-08-23',
  },
];

// Memory store for tickets and analytics
let HANDOFF_TICKETS_STORE: HandoffTicket[] = [
  {
    id: 'TICKET-1001',
    clientName: 'Stefan Müller',
    clientEmail: 'stefan.m@example.de',
    subject: 'Anfrage bzgl. Inzahlungnahme E-Bike',
    summary: 'Kunde möchte sein altes Trekkingbike in Zahlung geben beim Kauf eines CUBE Stereo Hybrid.',
    initialRequest: 'Nehmt ihr alte Fahrräder in Zahlung beim Kauf eines neuen CUBE E-Bikes?',
    actionsTaken: ['Wissensdatenbank durchsucht', 'Support-E-Mail generiert'],
    actionNeeded: 'Manuelles Angebot durch den Vertrieb erstellen.',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conversationHistory: [
      { role: 'user', content: 'Nehmt ihr alte Fahrräder in Zahlung?' },
      { role: 'assistant', content: 'Wir bieten individuelle Inzahlungnahmen an. Ich leite Ihre Anfrage gerne an unser Team weiter.' }
    ]
  }
];

export function getHandoffTickets(): HandoffTicket[] {
  return HANDOFF_TICKETS_STORE;
}

export function addHandoffTicket(ticket: HandoffTicket): HandoffTicket {
  HANDOFF_TICKETS_STORE.unshift(ticket);
  return ticket;
}

export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  const q = query.toLowerCase();
  return DEFAULT_KNOWLEDGE_BASE.filter(item => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.keywords.some(kw => q.includes(kw) || kw.includes(q))
    );
  });
}

export function searchStoreProducts(query: string, maxPrice?: number): Product[] {
  const q = query.toLowerCase();
  return INITIAL_PRODUCTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.brand_name ? p.brand_name.toLowerCase().includes(q) : false) ||
      (p.category_name ? p.category_name.toLowerCase().includes(q) : false) ||
      p.description.toLowerCase().includes(q);
    const matchesPrice = maxPrice ? p.price <= maxPrice : true;
    return matchesSearch && matchesPrice;
  }).slice(0, 5);
}

export function getAIAnalytics(): AIAnalytics {
  const totalConvs = 142;
  const totalMsgs = 486;
  const transferred = HANDOFF_TICKETS_STORE.length + 18;
  const resolved = totalConvs - transferred;
  
  return {
    totalConversations: totalConvs,
    totalMessages: totalMsgs,
    resolvedByAI: resolved,
    transferredToHuman: transferred,
    transferRatePercent: Math.round((transferred / totalConvs) * 100),
    avgResponseTimeMs: 1200,
    frequentQuestions: [
      { question: 'Welches E-Bike ist gut für Berge geeignet?', count: 42 },
      { question: 'Ist die PS5 Pro 2TB auf Lager?', count: 38 },
      { question: 'Wie funktioniert die 30 Tage Rückgabe?', count: 29 },
      { question: 'Bietet ihr Klarna Ratenkauf an?', count: 24 },
      { question: 'Wann kommt meine Lieferung an?', count: 19 },
    ],
    recentTicketsCount: HANDOFF_TICKETS_STORE.length,
  };
}
