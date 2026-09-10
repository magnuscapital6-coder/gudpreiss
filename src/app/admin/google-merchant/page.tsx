'use client';

import React, { useState, useEffect } from 'react';
import { getProducts } from '@/lib/db/db-provider';
import { validateCatalog, validateProduct } from '@/lib/merchant/validation-engine';
import { generateGoogleMerchantFeed } from '@/lib/merchant/feed-generator';
import { Product } from '@/types';
import { MerchantFeedPreview } from '@/components/admin/MerchantFeedPreview';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  FileCode,
  ShieldCheck,
  Package,
  Layers,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';
import Image from 'next/image';

export default function AdminGoogleMerchantPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<string | null>(null);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gudpreiss.de';
  const primaryFeedUrl = `${siteUrl}/feed/google-shopping.xml`;
  const secondaryFeedUrl = `${siteUrl}/google-merchant-feed.xml`;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prods = await getProducts();
      setProducts(prods);
      const xml = await generateGoogleMerchantFeed();
      setXmlContent(xml);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = validateCatalog(products);

  const filteredProducts = stats.products.filter((p) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'ready'
        ? p.merchant_status === 'READY_FOR_MERCHANT'
        : p.merchant_status === 'BLOCKED_MERCHANT';

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFeedUrl(id);
    setTimeout(() => setCopiedFeedUrl(null), 2000);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>GOOGLE MERCHANT CENTER COMPLIANCE ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Google Merchant &amp; Shopping Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion du flux XML dynamique, validation des données produits, schémas JSON-LD et Free Listings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser Audit</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-md shadow-emerald-900/20 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu Flux XML</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">{stats.score}%</span>
              <span className="text-xs text-slate-500 font-bold">Conforme</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${stats.score}%` }} />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            {stats.score === 100 ? '✅ Catalogue 100% prêt pour Google' : '⚠️ Des ajustements sont nécessaires'}
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Produits</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl font-black">{stats.total}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">Produits actifs en catalogue</p>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">100% Produits GudPreiss</span>
        </div>

        {/* Ready Count */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prêts Merchant</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.readyCount}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">Produits valides &amp; éligibles</p>
          </div>
          <span className="text-[11px] text-slate-500">Statut READY_FOR_MERCHANT</span>
        </div>

        {/* Blocked Count */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produits Bloqués</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl font-black text-rose-600">{stats.blockedCount}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">Blocages critiques à traiter</p>
          </div>
          <span className="text-[11px] text-slate-500">Statut BLOCKED_MERCHANT</span>
        </div>
      </div>

      {/* Feed URL Banner Section */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <FileCode className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">URLs Officiels des Flux Merchant Center</h2>
              <p className="text-xs text-slate-300">Synchronisation automatique à chaque modification produit</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-emerald-300">URL Principale Google Shopping</span>
            <div className="flex items-center justify-between gap-2 bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300">
              <span className="truncate">{primaryFeedUrl}</span>
              <button
                onClick={() => handleCopyUrl(primaryFeedUrl, 'primary')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copier URL"
              >
                {copiedFeedUrl === 'primary' ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-emerald-300">URL Secondaire Google Merchant</span>
            <div className="flex items-center justify-between gap-2 bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300">
              <span className="truncate">{secondaryFeedUrl}</span>
              <button
                onClick={() => handleCopyUrl(secondaryFeedUrl, 'secondary')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copier URL"
              >
                {copiedFeedUrl === 'secondary' ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black tracking-tight">Audit des Produits du Catalogue</h2>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Rechercher produit, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${filter === 'all' ? 'bg-white dark:bg-slate-900 shadow-xs text-emerald-600' : 'text-slate-500'}`}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-3 py-1.5 rounded-lg transition ${filter === 'ready' ? 'bg-white dark:bg-slate-900 shadow-xs text-emerald-600' : 'text-slate-500'}`}
              >
                Prêts ({stats.readyCount})
              </button>
              <button
                onClick={() => setFilter('blocked')}
                className={`px-3 py-1.5 rounded-lg transition ${filter === 'blocked' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-500'}`}
              >
                Bloqués ({stats.blockedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Prix EUR</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Google Category</th>
                <th className="py-3 px-4">Livraison</th>
                <th className="py-3 px-4">Statut Merchant</th>
                <th className="py-3 px-4 text-right">Détails Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Aucun produit ne correspond à la recherche.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/50 dark:border-slate-800">
                          {p.images && p.images[0] && (
                            <Image src={p.images[0]} alt={p.name} fill className="object-contain p-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.brand_name || 'GudPreiss'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{p.sku}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">{p.price.toFixed(2)} €</td>
                    <td className="py-3.5 px-4">{p.stock} unités</td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-[11px] text-slate-500" title={p.google_product_category}>
                      {p.google_product_category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                        {p.price >= 500 ? 'Gratuit (0 €)' : '49 € Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.merchant_status === 'READY_FOR_MERCHANT' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" /> READY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                          <XCircle className="w-3 h-3" /> BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.merchant_issues && p.merchant_issues.length > 0 ? (
                        <span className="text-[10px] text-rose-600 font-bold" title={p.merchant_issues.join(', ')}>
                          {p.merchant_issues.length} problème(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">100% Conforme</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* XML Preview Modal */}
      {showPreviewModal && (
        <MerchantFeedPreview xmlContent={xmlContent} onClose={() => setShowPreviewModal(false)} />
      )}
    </div>
  );
}
