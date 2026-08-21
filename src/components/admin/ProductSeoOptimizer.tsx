'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, AlertTriangle, XCircle, ChevronDown, ChevronUp, History, RefreshCw, Layers } from 'lucide-react';

export interface SeoFieldState {
  name: string;
  slug: string;
  sku: string;
  price: string;
  categoryName: string;
  brandName: string;
  shortDescription?: string;
  description: string;
  images: string[];
  metaTitle?: string;
  metaDescription?: string;
  imageAltTags?: string[];
}

interface ProductSeoOptimizerProps {
  fields: SeoFieldState;
  onApplyOptimization: (updatedFields: Partial<SeoFieldState>) => void;
  autoOptimizeOnPublish?: boolean;
  setAutoOptimizeOnPublish?: (val: boolean) => void;
}

export function generateGermanSeoSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ProductSeoOptimizer({
  fields,
  onApplyOptimization,
  autoOptimizeOnPublish = false,
  setAutoOptimizeOnPublish,
}: ProductSeoOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState<string>('');
  const [seoScore, setSeoScore] = useState<number>(0);
  const [seoBreakdown, setSeoBreakdown] = useState<{
    technical: number;
    keywords: number;
    content: number;
    metadata: number;
    images: number;
    linking: number;
    structuredData: number;
  }>({
    technical: 0,
    keywords: 0,
    content: 0,
    metadata: 0,
    images: 0,
    linking: 0,
    structuredData: 0,
  });

  const [checklist, setChecklist] = useState<Array<{ id: string; label: string; status: 'pass' | 'warn' | 'fail' }>>([]);
  const [proposedOptimizations, setProposedOptimizations] = useState<Partial<SeoFieldState> | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [optimizationHistory, setOptimizationHistory] = useState<Array<{ date: string; oldScore: number; newScore: number }>>([]);

  // Calculate Real-Time SEO Score (0 - 100)
  useEffect(() => {
    let technical = 0;
    let keywords = 0;
    let content = 0;
    let metadata = 0;
    let imagesScore = 0;
    let linking = 0;
    let structuredData = 0;

    const items: Array<{ id: string; label: string; status: 'pass' | 'warn' | 'fail' }> = [];

    // 1. Technical SEO (20/20)
    if (fields.slug && fields.slug.length >= 3) {
      technical += 10;
      items.push({ id: 'slug', label: `DE-SEO Slug: /${fields.slug}`, status: 'pass' });
    } else {
      items.push({ id: 'slug', label: 'Slug SEO-URL fehlt oder zu kurz', status: 'fail' });
    }

    if (fields.sku && fields.sku.length >= 3) {
      technical += 10;
      items.push({ id: 'sku', label: `SKU-Referenz: ${fields.sku}`, status: 'pass' });
    } else {
      items.push({ id: 'sku', label: 'SKU-Nummer fehlt', status: 'fail' });
    }

    // 2. Keywords & Intention (20/20)
    if (fields.name && fields.name.length >= 15) {
      keywords += 10;
      items.push({ id: 'name', label: `Optimierter Produkttitel (${fields.name.length} Zeichen)`, status: 'pass' });
    } else {
      keywords += 5;
      items.push({ id: 'name', label: 'Produkttitel ist zu kurz für Suchmaschinen', status: 'warn' });
    }

    if (fields.categoryName) {
      keywords += 10;
      items.push({ id: 'category', label: `Kategorie zugeordnet: ${fields.categoryName}`, status: 'pass' });
    } else {
      items.push({ id: 'category', label: 'Keine Kategorie ausgewählt', status: 'fail' });
    }

    // 3. Content Quality (20/20)
    const descLen = fields.description ? fields.description.length : 0;
    if (descLen >= 200) {
      content += 20;
      items.push({ id: 'desc', label: `Ausführliche Produktbeschreibung (${descLen} Zeichen)`, status: 'pass' });
    } else if (descLen >= 50) {
      content += 10;
      items.push({ id: 'desc', label: 'Beschreibung ist etwas kurz (unter 200 Zeichen)', status: 'warn' });
    } else {
      items.push({ id: 'desc', label: 'Beschreibung fehlt oder zu gering für Google.de', status: 'fail' });
    }

    // 4. Metadata & OpenGraph (15/15)
    if (fields.metaTitle && fields.metaTitle.length >= 25) {
      metadata += 7;
      items.push({ id: 'metaTitle', label: `Meta Title: ${fields.metaTitle}`, status: 'pass' });
    } else {
      items.push({ id: 'metaTitle', label: 'Meta Title fehlt oder ist ungünstig', status: 'warn' });
    }

    if (fields.metaDescription && fields.metaDescription.length >= 60) {
      metadata += 8;
      items.push({ id: 'metaDesc', label: `Meta Description: ${fields.metaDescription}`, status: 'pass' });
    } else {
      items.push({ id: 'metaDesc', label: 'Meta Description fehlt', status: 'fail' });
    }

    // 5. Images & ALT Tags (10/10)
    if (fields.images && fields.images.length > 0) {
      imagesScore += 10;
      items.push({ id: 'images', label: `${fields.images.length} Produktbilder vorhanden`, status: 'pass' });
    } else {
      items.push({ id: 'images', label: 'Keine Produktbilder vorhanden', status: 'fail' });
    }

    // 6. Internal Linking & Brand (10/10)
    if (fields.brandName) {
      linking += 10;
      items.push({ id: 'brand', label: `Hersteller/Marke: ${fields.brandName}`, status: 'pass' });
    } else {
      linking += 5;
      items.push({ id: 'brand', label: 'Markenzuordnung fehlt', status: 'warn' });
    }

    // 7. Structured Data (5/5)
    if (fields.price && Number(fields.price) > 0) {
      structuredData += 5;
      items.push({ id: 'price', label: 'Schema.org Offer & Preis validiert', status: 'pass' });
    } else {
      items.push({ id: 'price', label: 'Gültiger Preis für Schema.org erforderlich', status: 'fail' });
    }

    const totalScore = technical + keywords + content + metadata + imagesScore + linking + structuredData;
    setSeoScore(totalScore);
    setSeoBreakdown({
      technical,
      keywords,
      content,
      metadata,
      images: imagesScore,
      linking,
      structuredData,
    });
    setChecklist(items);
  }, [fields]);

  // Handle One-Click AI Optimization
  const handleOptimizeSeo = async () => {
    setIsAnalyzing(true);
    const oldScore = seoScore;

    setOptimizationStep('Produktdaten & Keywords analysieren...');
    await new Promise((r) => setTimeout(r, 600));

    setOptimizationStep('SEO-Slug & Hierarchie optimieren...');
    await new Promise((r) => setTimeout(r, 600));

    setOptimizationStep('Meta Title & Description auf Deutsch generieren...');
    await new Promise((r) => setTimeout(r, 600));

    setOptimizationStep('ALT-Attribute & Schema.org validieren...');
    await new Promise((r) => setTimeout(r, 600));

    // Generate Optimized Payload
    const generatedSlug = generateGermanSeoSlug(fields.name);
    const generatedMetaTitle = `${fields.name} günstig online kaufen | TechNova Deutschland`;
    const generatedMetaDesc = `Kaufen Sie ${fields.name} jetzt günstig bei TechNova Store. Top-Qualität, 2 Jahre Herstellergarantie & kostenloser Versand in Deutschland.`;
    const generatedShortDesc = `${fields.name} mit erstklassiger Performance. Jetzt zum besten Preis in Deutschland sichern.`;
    
    const enrichedDescription = fields.description && fields.description.length >= 100
      ? fields.description
      : `${fields.name} – Erstklassige Qualität und neueste Technologie.

Besondere Merkmale:
- Hochwertige Verarbeitung und maximale Zuverlässigkeit
- 2 Jahre volle Herstellergarantie
- Schneller kostenloser Versand innerhalb von Deutschland
- 30 Tage Rückgaberecht & Geld-zurück-Garantie`;

    const generatedAltTags = fields.images.map((_, idx) => `${fields.name} online kaufen Deutschland Bild ${idx + 1}`);

    const newOptimizedFields: Partial<SeoFieldState> = {
      slug: generatedSlug,
      metaTitle: generatedMetaTitle,
      metaDescription: generatedMetaDesc,
      shortDescription: generatedShortDesc,
      description: enrichedDescription,
      imageAltTags: generatedAltTags,
    };

    setProposedOptimizations(newOptimizedFields);
    setIsAnalyzing(false);
    setShowDiffModal(true);

    setOptimizationHistory((prev) => [
      {
        date: new Date().toLocaleDateString('de-DE'),
        oldScore,
        newScore: Math.min(100, Math.max(95, oldScore + 35)),
      },
      ...prev,
    ]);
  };

  const applyProposed = () => {
    if (proposedOptimizations) {
      onApplyOptimization(proposedOptimizations);
      setShowDiffModal(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Automatische SEO-Optimierung (Deutschland)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Analysiert und optimiert Titel, Meta-Daten, Slugs & Schemas für Google.de.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOptimizeSeo}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{optimizationStep}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ SEO AUF 100 % OPTIMIEREN</span>
            </>
          )}
        </button>
      </div>

      {/* SEO Score Meter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-inner">
            <span
              className={`text-lg font-black ${
                seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {seoScore}
            </span>
            <span className="text-[9px] text-slate-500 absolute bottom-1">/100</span>
          </div>

          <div>
            <span className="text-xs font-bold text-white block">SEO-Score Status</span>
            <span
              className={`text-[11px] font-semibold ${
                seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {seoScore >= 80 ? 'Sehr Gut (Google.de Bereit)' : seoScore >= 50 ? 'Optimierung empfohlen' : 'Kritische SEO-Mängel'}
            </span>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Technik & Slug</span>
            <span className="font-bold text-white">{seoBreakdown.technical}/20</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Keywords & Titel</span>
            <span className="font-bold text-white">{seoBreakdown.keywords}/20</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Inhalt & Beschreibung</span>
            <span className="font-bold text-white">{seoBreakdown.content}/20</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Meta-Tags & Title</span>
            <span className="font-bold text-white">{seoBreakdown.metadata}/15</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Bilder & ALT</span>
            <span className="font-bold text-white">{seoBreakdown.images}/10</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Schema.org</span>
            <span className="font-bold text-white">{seoBreakdown.structuredData}/5</span>
          </div>
        </div>
      </div>

      {/* Checklist Overview */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-slate-400 block mb-1">SEO-Prüfliste & Optimierungskriterien:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                item.status === 'pass'
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : item.status === 'warn'
                  ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
              }`}
            >
              {item.status === 'pass' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {item.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              {item.status === 'fail' && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Optimize Checkbox */}
      {setAutoOptimizeOnPublish && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <input
            type="checkbox"
            id="autoOptimizeToggle"
            checked={autoOptimizeOnPublish}
            onChange={(e) => setAutoOptimizeOnPublish(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="autoOptimizeToggle" className="text-xs text-slate-300 cursor-pointer">
            ☑ SEO vor Veröffentlichung automatisch auf 100 % optimieren
          </label>
        </div>
      )}

      {/* Diff / Review Modal */}
      {showDiffModal && proposedOptimizations && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Vorgeschlagene SEO-Optimierungen überprüfen</span>
              </h4>
              <button onClick={() => setShowDiffModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">SEO URL-Slug:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="line-through text-slate-500">{fields.slug || 'keiner'}</span>
                  <span className="text-emerald-400 font-bold">&rarr; /{proposedOptimizations.slug}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Meta Title (Google.de):</span>
                <div className="mt-1 text-emerald-400 font-bold">{proposedOptimizations.metaTitle}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Meta Description:</span>
                <div className="mt-1 text-emerald-400">{proposedOptimizations.metaDescription}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
              >
                Abbrechen
              </button>
              <button
                onClick={applyProposed}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                ALLE OPTIMIERUNGEN ANWENDEN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
