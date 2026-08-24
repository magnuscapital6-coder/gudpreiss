import { NextRequest, NextResponse } from 'next/server';
import {
  runDailyAutoArticleGenerationBatch,
  getAutoArticleGeneratorConfig,
  updateAutoArticleGeneratorConfig,
  getProductCoverageAnalytics,
} from '@/lib/seo/auto-article-scheduler';

/**
 * GET /api/cron/auto-generate-articles
 * Cron entrypoint for automated daily article generation per product
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    // Required secret check — reject if CRON_SECRET is not set or doesn't match
    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: CRON_SECRET is not set' },
        { status: 500 },
      );
    }
    if (secretParam !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET token' }, { status: 401 });
    }

    const productId = searchParams.get('productId') || undefined;
    const rateLimitStr = searchParams.get('rateLimitPerProduct');
    const rateLimitPerProduct = rateLimitStr ? (parseInt(rateLimitStr, 10) as 1 | 2) : 2;

    const summary = await runDailyAutoArticleGenerationBatch({
      productId,
      rateLimitPerProduct,
    });

    return NextResponse.json({
      message: 'Automated daily product SEO articles generation completed successfully',
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error during article generation', details: error.message || error },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/auto-generate-articles
 * Admin API route to trigger immediate batch generation or update configuration
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin session for POST
    const { getServerSession } = await import('@/lib/supabase/server');
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'run';

    if (action === 'update_config') {
      const updated = updateAutoArticleGeneratorConfig({
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
        articlesPerProductPerDay: body.articlesPerProductPerDay === 1 ? 1 : 2,
      });

      return NextResponse.json({
        success: true,
        message: 'Configuration mise à jour avec succès',
        config: updated,
      });
    }

    if (action === 'get_stats') {
      const config = getAutoArticleGeneratorConfig();
      const analytics = await getProductCoverageAnalytics();
      return NextResponse.json({
        config,
        analytics,
      });
    }

    // Default action: run batch generation
    const productId = body.productId || undefined;
    const rateLimitPerProduct = body.articlesPerProductPerDay === 1 ? 1 : 2;

    const summary = await runDailyAutoArticleGenerationBatch({
      productId,
      rateLimitPerProduct,
    });

    return NextResponse.json({
      success: true,
      message: 'Génération automatique terminée avec succès',
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête', details: error.message || error },
      { status: 500 }
    );
  }
}
