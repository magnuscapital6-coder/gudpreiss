import { NextRequest, NextResponse } from 'next/server';
import {
  calculateConversionScores,
  classifyVisitorProfile,
  evaluateIntervention,
  logCartAbandonment,
  getConversionAnalytics,
  getAbandonedCarts,
} from '@/lib/ai/conversion-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, signals = [], cartValue = 0, currentUrl = '/', abandonmentData } = body;

    if (action === 'evaluate') {
      const scores = calculateConversionScores(signals, cartValue);
      const profile = classifyVisitorProfile(scores, signals, cartValue);
      const intervention = evaluateIntervention(scores, profile, currentUrl, cartValue);

      return NextResponse.json({
        scores,
        profile,
        intervention,
      });
    }

    if (action === 'log_abandonment') {
      if (!abandonmentData) {
        return NextResponse.json({ error: 'Données d\'abandon manquantes' }, { status: 400 });
      }
      const record = logCartAbandonment(abandonmentData);
      return NextResponse.json({ success: true, record });
    }

    if (action === 'get_analytics') {
      const analytics = getConversionAnalytics();
      const abandonedCarts = getAbandonedCarts();
      return NextResponse.json({ analytics, abandonedCarts });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('[Conversion API Error]:', error);
    return NextResponse.json({ error: 'Erreur serveur conversion' }, { status: 500 });
  }
}
