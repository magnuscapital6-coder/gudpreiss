'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Play,
  Settings,
  CheckCircle2,
  RefreshCw,
  FileText,
  ShoppingBag,
  ExternalLink,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  Search,
} from 'lucide-react';
import { AutoArticleConfig, ProductCoverageItem } from '@/lib/seo/auto-article-scheduler';

export default function AdminAutoArticleGeneratorPage() {
  const [config, setConfig] = useState<AutoArticleConfig>({
    enabled: true,
    articlesPerProductPerDay: 2,
    lastRunTimestamp: new Date().toISOString(),
    totalArticlesGenerated: 0,
  });

  const [analytics, setAnalytics] = useState<{
    totalProducts: number;
    coveredProductsCount: number;
    totalArticlesCount: number;
    coverageList: ProductCoverageItem[];
  }>({
    totalProducts: 0,
    coveredProductsCount: 0,
    totalArticlesCount: 0,
    coverageList: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [searchProduct, setSearchProduct] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cron/auto-generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_stats' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await fetch('/api/cron/auto-generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          enabled: config.enabled,
          articlesPerProductPerDay: config.articlesPerProductPerDay,
        }),
      });
      setGenerationMessage('Configuration enregistrée avec succès !');
      setTimeout(() => setGenerationMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleRunBatchNow = async (productId?: string) => {
    setIsGeneratingBatch(true);
    setGenerationMessage('Génération automatique d\'articles en cours...');
    try {
      const res = await fetch('/api/cron/auto-generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          productId,
          articlesPerProductPerDay: config.articlesPerProductPerDay,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerationMessage(
          `Succès ! ${data.summary?.articlesCreated || 0} article(s) généré(s) et publié(s) sur ${
            data.summary?.productsProcessed || 0
          } produit(s).`
        );
        await loadData();
      } else {
        setGenerationMessage(`Attention : ${data.summary?.errors?.join(', ') || 'Erreur inconnue'}`);
      }
    } catch (err: any) {
      setGenerationMessage(`Erreur de connexion : ${err.message || err}`);
    } finally {
      setIsGeneratingBatch(false);
      setTimeout(() => setGenerationMessage(null), 6000);
    }
  };

  const filteredCoverage = analytics.coverageList.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-white max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RÉDACTION &amp; PUBLICATION AUTO SEO 24/7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Générateur Automatique d&apos;Articles par Produit
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Rédige et publie automatiquement <strong>1 à 2 articles par jour pour chaque produit</strong> du site.
            Articles optimisés SEO avec langage naturel, structuration H1/H2/H3, tableaux comparatifs, FAQs et maillage
            interne direct vers la boutique.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => handleRunBatchNow()}
            disabled={isGeneratingBatch}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingBatch ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Génération des Articles...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Lancer la Génération Auto Maintenant</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Feedback */}
      {generationMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{generationMessage}</span>
          </div>
          <button onClick={() => setGenerationMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Produits du Catalogue
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics.totalProducts}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider block">
            Produits Couverts
          </span>
          <p className="text-2xl font-black text-emerald-600">{analytics.coveredProductsCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block">
            Articles Auto Publiés
          </span>
          <p className="text-2xl font-black text-amber-500">{analytics.totalArticlesCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider block">
            Cadence Quotidienne
          </span>
          <p className="text-2xl font-black text-blue-500">{config.articlesPerProductPerDay} / jour / produit</p>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-black flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>Paramètres de Rédaction Quotidienne</span>
          </h2>
          <button
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
          >
            {isSavingConfig ? 'Enregistrement...' : 'Sauvegarder les Réglages'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Automatisation Quotidienne (Cron Job)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Active la rédaction et la publication automatique chaque jour via l&apos;API Cron.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Nombre d&apos;articles par jour et par produit
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, articlesPerProductPerDay: 1 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition ${
                  config.articlesPerProductPerDay === 1
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                1 Article / jour / produit
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, articlesPerProductPerDay: 2 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition ${
                  config.articlesPerProductPerDay === 2
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                2 Articles / jour / produit (Recommandé)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Table Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Couverture des Produits du Catalogue ({analytics.totalProducts})
            </h2>
            <p className="text-xs text-slate-500">
              Statut des articles générés automatiquement pour chaque produit du magasin.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Filtrer par produit ou catégorie..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-bold animate-pulse">
            Chargement des produits et articles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Produit &amp; Catégorie</th>
                  <th className="py-3 px-4">Articles Publiés</th>
                  <th className="py-3 px-4">Dernier Article Généré</th>
                  <th className="py-3 px-4 text-right">Action Génération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCoverage.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">{item.categoryName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-full font-black text-[11px]">
                        <FileText className="w-3 h-3" />
                        <span>{item.articlesCount} article(s)</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.latestArticleTitle ? (
                        <div className="space-y-0.5">
                          <Link
                            href={`/blog/${item.latestArticleSlug}`}
                            target="_blank"
                            className="font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 line-clamp-1 flex items-center gap-1"
                          >
                            <span>{item.latestArticleTitle}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </Link>
                          {item.lastGeneratedAt && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(item.lastGeneratedAt).toLocaleString('fr-FR')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Aucun article rédigé</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRunBatchNow(item.productId)}
                        disabled={isGeneratingBatch}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Générer 1 Article</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
