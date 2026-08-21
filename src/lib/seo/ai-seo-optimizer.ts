/**
 * AI SEO Optimization Engine for TechNova E-Commerce Blog & Products
 */

export interface SEOAnalysisResult {
  seo_title: string;
  seo_description: string;
  suggested_slug: string;
  keywords: string[];
  seo_score: number;
  read_time_minutes: number;
  recommendations: {
    type: 'success' | 'warning' | 'error';
    message: string;
  }[];
}

export function optimizeBlogPostSEO(params: {
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  existingKeywords?: string[];
}): SEOAnalysisResult {
  const { title, excerpt, content, category = 'Technologie', existingKeywords = [] } = params;

  // 1. Calculate word count and reading time
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/[#*`_]/g, '');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 2. Generate Optimized SEO Meta Title (Target: 50-60 chars)
  let seoTitle = title.trim();
  if (seoTitle.length < 40) {
    seoTitle = `${seoTitle} | Kaufberater & Test 2026 - TechNova`;
  } else if (!seoTitle.includes('TechNova')) {
    seoTitle = `${seoTitle} - TechNova Store`;
  }
  if (seoTitle.length > 60) {
    seoTitle = seoTitle.substring(0, 57) + '...';
  }

  // 3. Generate Optimized SEO Meta Description (Target: 140-160 chars)
  let seoDesc = excerpt.trim() || plainText.substring(0, 150).trim();
  if (seoDesc.length < 100) {
    seoDesc = `${seoDesc} Entdecken Sie die neuesten Trends, Experten-Tipps und unabhängige Produkttests jetzt bei TechNova.`;
  }
  if (seoDesc.length > 160) {
    seoDesc = seoDesc.substring(0, 157) + '...';
  }

  // 4. Generate URL Slug
  const suggestedSlug = title
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // 5. Extract Keywords
  const extractedKeywords = new Set<string>(existingKeywords);
  const commonTechKeywords = [
    'TechNova',
    category,
    'Kaufberatung',
    'Testbericht',
    'Smartphone 2026',
    'Smart Home',
    'Deutschland',
  ];
  commonTechKeywords.forEach((kw) => extractedKeywords.add(kw));

  const keywords = Array.from(extractedKeywords).slice(0, 8);

  // 6. Calculate SEO Score & Generate Recommendations
  let score = 0;
  const recommendations: SEOAnalysisResult['recommendations'] = [];

  // Criterion A: Title Length (20 pts)
  if (seoTitle.length >= 45 && seoTitle.length <= 60) {
    score += 20;
    recommendations.push({
      type: 'success',
      message: `Titre SEO parfait (${seoTitle.length} caractères / cible: 50-60).`,
    });
  } else {
    score += 10;
    recommendations.push({
      type: 'warning',
      message: `Ajustez la longueur du titre SEO (${seoTitle.length} chars). Idéalement entre 50 et 60 caractères.`,
    });
  }

  // Criterion B: Meta Description (20 pts)
  if (seoDesc.length >= 130 && seoDesc.length <= 160) {
    score += 20;
    recommendations.push({
      type: 'success',
      message: `Méta description idéale (${seoDesc.length} caractères / cible: 140-160).`,
    });
  } else {
    score += 10;
    recommendations.push({
      type: 'warning',
      message: `La méta description fait ${seoDesc.length} chars. La longueur optimale est de 140-160 caractères.`,
    });
  }

  // Criterion C: Word Count (25 pts)
  if (wordCount >= 500) {
    score += 25;
    recommendations.push({
      type: 'success',
      message: `Contenu bien développé (${wordCount} mots). Bon pour le référencement Google.`,
    });
  } else if (wordCount >= 250) {
    score += 15;
    recommendations.push({
      type: 'warning',
      message: `Longueur de texte moyenne (${wordCount} mots). Visez 500+ mots pour un classement optimal.`,
    });
  } else {
    score += 5;
    recommendations.push({
      type: 'error',
      message: `Texte trop court (${wordCount} mots). Rédigez au moins 300 mots pour éviter le contenu maigre (thin content).`,
    });
  }

  // Criterion D: Keywords (15 pts)
  if (keywords.length >= 4) {
    score += 15;
    recommendations.push({
      type: 'success',
      message: `${keywords.length} mots-clés SEO ciblés définis.`,
    });
  } else {
    score += 5;
    recommendations.push({
      type: 'warning',
      message: 'Ajoutez au moins 4 mots-clés stratégiques.',
    });
  }

  // Criterion E: Slug (20 pts)
  if (suggestedSlug.length > 5 && suggestedSlug.length < 70) {
    score += 20;
    recommendations.push({
      type: 'success',
      message: `URL Slug propre et optimisée: /blog/${suggestedSlug}`,
    });
  } else {
    score += 10;
    recommendations.push({
      type: 'warning',
      message: 'Vérifiez la structure de l-URL slug.',
    });
  }

  return {
    seo_title: seoTitle,
    seo_description: seoDesc,
    suggested_slug: suggestedSlug,
    keywords,
    seo_score: Math.min(100, score),
    read_time_minutes: readTimeMinutes,
    recommendations,
  };
}
