import { ChatMessage, RecommendedProductRef, HandoffTicket } from '@/types/ai';
import { DEFAULT_GUPREISS_CONFIG, searchKnowledgeBase, searchStoreProducts, addHandoffTicket } from './knowledge-base';

export interface ProcessChatInput {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  clientInfo?: { name?: string; email?: string };
}

export interface ProcessChatOutput {
  reply: string;
  recommendedProducts?: RecommendedProductRef[];
  actionsPerformed: string[];
  isEmailSent?: boolean;
  ticketId?: string;
  suggestedQuestions?: string[];
}

export async function processGupreissAgent({
  messages,
  clientInfo,
}: ProcessChatInput): Promise<ProcessChatOutput> {
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
  const lastUserMessageLower = lastUserMessage.toLowerCase();

  const actionsPerformed: string[] = [];
  let recommendedProducts: RecommendedProductRef[] = [];
  let isEmailSent = false;
  let ticketId: string | undefined = undefined;
  let reply = '';
  let suggestedQuestions: string[] = [];

  // 1. Detect Intent
  const isHumanHandoffRequest =
    lastUserMessageLower.includes('mensch') ||
    lastUserMessageLower.includes('kontakt') ||
    lastUserMessageLower.includes('mitarbeiter') ||
    lastUserMessageLower.includes('support') ||
    lastUserMessageLower.includes('team') ||
    lastUserMessageLower.includes('e-mail') ||
    lastUserMessageLower.includes('email') ||
    lastUserMessageLower.includes('sprechen') ||
    lastUserMessageLower.includes('beraten lassen') ||
    lastUserMessageLower.includes('angebot');

  const isProductSearch =
    lastUserMessageLower.includes('fahrrad') ||
    lastUserMessageLower.includes('e-bike') ||
    lastUserMessageLower.includes('bike') ||
    lastUserMessageLower.includes('ps5') ||
    lastUserMessageLower.includes('playstation') ||
    lastUserMessageLower.includes('konsole') ||
    lastUserMessageLower.includes('dualsense') ||
    lastUserMessageLower.includes('controller') ||
    lastUserMessageLower.includes('vr2') ||
    lastUserMessageLower.includes('preis') ||
    lastUserMessageLower.includes('kaufen') ||
    lastUserMessageLower.includes('modell') ||
    lastUserMessageLower.includes('suche') ||
    lastUserMessageLower.includes('empfehl');

  const isPolicySearch =
    lastUserMessageLower.includes('versand') ||
    lastUserMessageLower.includes('lieferung') ||
    lastUserMessageLower.includes('dauer') ||
    lastUserMessageLower.includes('rückgabe') ||
    lastUserMessageLower.includes('retoure') ||
    lastUserMessageLower.includes('garantie') ||
    lastUserMessageLower.includes('zahlung') ||
    lastUserMessageLower.includes('klarna') ||
    lastUserMessageLower.includes('paypal') ||
    lastUserMessageLower.includes('rechnung') ||
    lastUserMessageLower.includes('adresse') ||
    lastUserMessageLower.includes('wo sitz');

  // 2. Perform Product Knowledge Lookup
  if (isProductSearch) {
    actionsPerformed.push('Recherche im Produktsortiment');
    const matchedProducts = searchStoreProducts(lastUserMessage);
    if (matchedProducts.length > 0) {
      recommendedProducts = matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        compare_at_price: p.compare_at_price,
        image: p.images?.[0] || '',
        slug: p.slug,
        category_name: p.category_name,
        in_stock: p.stock !== undefined ? p.stock > 0 : true,
      }));
    }
  }

  // 3. Perform Policy Knowledge Lookup
  let policyContext = '';
  if (isPolicySearch) {
    actionsPerformed.push('Abfrage der offiziellen Wissensdatenbank');
    const matchedKB = searchKnowledgeBase(lastUserMessage);
    if (matchedKB.length > 0) {
      policyContext = matchedKB.map((k) => `■ ${k.title}: ${k.content}`).join('\n\n');
    }
  }

  // 4. Handle Human Handoff / Email Dispatch
  if (isHumanHandoffRequest) {
    actionsPerformed.push('Generierung des Kundensupport-Tickets');

    // Extract email or name if present in message
    const emailMatch = lastUserMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const extractedEmail = emailMatch ? emailMatch[0] : clientInfo?.email || 'Nicht angegeben';
    const extractedName = clientInfo?.name || 'Kunde';

    const newTicket: HandoffTicket = {
      id: `TICKET-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: extractedName,
      clientEmail: extractedEmail,
      subject: `Kundensupport-Anfrage: ${lastUserMessage.slice(0, 45)}...`,
      summary: `Der Kunde bittet um Übertragung an das Team. Anliegen: "${lastUserMessage}"`,
      initialRequest: lastUserMessage,
      actionsTaken: actionsPerformed,
      actionNeeded: 'Manuelle Rückmeldung durch den Kundenservice an kontakt@gudpreiss.de.',
      status: 'new',
      createdAt: new Date().toISOString(),
      conversationHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    };

    addHandoffTicket(newTicket);
    ticketId = newTicket.id;
    isEmailSent = true;
    actionsPerformed.push('E-Mail Benachrichtigung an kontakt@gudpreiss.de versendet');

    reply = `Vielen Dank! Ihre Anfrage (${newTicket.id}) wurde soeben erfolgreich an unser Kundenservice-Team unter **kontakt@gudpreiss.de** übermittelt.

Wir haben alle wichtigen Details aus unserer bisherigen Unterhaltung zusammengefasst, damit unser Team Ihr Anliegen zeitnah bearbeiten kann. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.`;

    suggestedQuestions = [
      '🔍 Noch weitere Produkte durchsuchen?',
      '📦 Wie sind die Versandzeiten?',
      '🏠 Zurück zur Startseite',
    ];

    return {
      reply,
      recommendedProducts,
      actionsPerformed,
      isEmailSent,
      ticketId,
      suggestedQuestions,
    };
  }

  // 5. Construct Autonomous AI Response
  if (recommendedProducts.length > 0) {
    const prodListText = recommendedProducts
      .map((p) => `• **${p.name}** für **${p.price.toFixed(2)} €** (${p.in_stock ? 'Auf Lager' : 'Geringer Bestand'})`)
      .join('\n');

    reply = `Basierend auf Ihren Angaben habe ich passende Angebote in unserem Sortiment gefunden:\n\n${prodListText}\n\nSie können die Produkte direkt über die nachfolgenden Karten aufrufen. Benötigen Sie weitere Informationen zu den technischen Daten oder zum Zubehör?`;
    suggestedQuestions = [
      '⚡ Welche E-Bikes haben Bosch Motoren?',
      '🎮 PS5 Pro Zubehör anzeigen',
      '🚚 Versandkosten prüfen',
    ];
  } else if (policyContext) {
    reply = `Hier sind die offiziellen Informationen zu Ihrer Anfrage:\n\n${policyContext}\n\nHaben Sie weitere Fragen zu den Bestellschritten oder Zahlungsarten?`;
    suggestedQuestions = [
      '💳 Welche Zahlungsmethoden gibt es?',
      '🔄 Wie funktioniert die 30 Tage Retoure?',
      '✉️ Kundenservice kontaktieren',
    ];
  } else if (lastUserMessageLower.includes('hallo') || lastUserMessageLower.includes('guten tag') || lastUserMessageLower.includes('hi')) {
    reply = `Hallo! Schön, dass Sie bei Gudpreiss sind. Ich bin **Gupreiss**, Ihr autonomer KI-Berater.\n\nIch kann Ihnen bei der Auswahl von **E-Bikes** (SCOTT, CUBE, Haibike), **PlayStation 5 Konsolen & Zubehör** sowie bei Fragen zu Lieferung, Rückgabe und Zahlungen helfen. Wie kann ich Sie heute unterstützen?`;
    suggestedQuestions = [
      '🚲 Welches E-Bike passt zu mir?',
      '🎮 PS5 Pro Angebote anzeigen',
      '📦 Versand & Lieferzeiten',
      '✉️ Ansprechpartner kontaktieren',
    ];
  } else {
    // Missing detail handling & polite clarification
    reply = `Ich habe Ihre Anfrage ("*${lastUserMessage}*") verstanden. Um Ihnen die exakt passende Lösung oder das ideale Angebot zu empfehlen:

• Suchen Sie eher ein **E-Bike** (z. B. E-Mountainbike, Trekking oder Citybike) oder **PlayStation 5 Hardware & Zubehör**?
• Haben Sie eine bestimmte Preisvorstellung oder bevorzugte Marke (wie CUBE, SCOTT, Sony)?

Gerne kann ich Ihre Anfrage auch direkt an unser Berater-Team unter **kontakt@gudpreiss.de** weiterleiten!`;

    suggestedQuestions = [
      '⚡ Empfehle mir ein E-Mountainbike',
      '🎮 Zeige PS5 Konsolen Angebote',
      '✉️ Anfrage an das Team senden',
    ];
  }

  return {
    reply,
    recommendedProducts,
    actionsPerformed,
    isEmailSent,
    ticketId,
    suggestedQuestions,
  };
}
