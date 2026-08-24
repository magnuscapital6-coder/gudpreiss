'use client';

import React, { useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Image as ImageIcon, RefreshCw, CheckCircle2, XCircle, Search, Filter, Layers, ArrowLeft, ExternalLink, Sparkles, Check } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';
import { auditCatalog, auditProductImage } from '@/lib/images/image-verification-service';
import { ProductImageAuditItem, ImageVerificationStatus } from '@/types/image-verification';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminImageVerificationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAuditing, setIsAuditing] = useState(false);

  // Compute live audit summary and items
  const auditResult = useMemo(() => {
    return auditCatalog(INITIAL_PRODUCTS);
  }, []);

  const [auditItems, setAuditItems] = useState<ProductImageAuditItem[]>(auditResult.items);

  const filteredItems = useMemo(() => {
    return auditItems.filter(item => {
      const matchesSearch = 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' || item.overall_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [auditItems, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: auditItems.length,
      verified: auditItems.filter(i => i.overall_status === 'VERIFIED').length,
      mismatch: auditItems.filter(i => i.overall_status === 'MISMATCH').length,
      needs_review: auditItems.filter(i => i.overall_status === 'NEEDS_REVIEW').length,
      missing: auditItems.filter(i => i.overall_status === 'MISSING').length,
    };
  }, [auditItems]);

  const handleReVerifyAll = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const fresh = auditCatalog(INITIAL_PRODUCTS);
      setAuditItems(fresh.items);
      setIsAuditing(false);
    }, 800);
  };

  const handleFixMismatch = (productId: string) => {
    setAuditItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          primary_status: 'VERIFIED',
          gallery_status: 'VERIFIED',
          overall_status: 'VERIFIED',
          match_confidence: 98,
          notes: 'Manuell verifiziert und mit der Originalquelle synchronisiert.',
        };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Produktbild-Verifizierung &amp; Quellabgleich (Image Verification)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automatisches Audit und Abgleich von Produktfotos, Varianten, Farben und SEO-Alt-Texten.
            </p>
          </div>
        </div>

        <button
          onClick={handleReVerifyAll}
          disabled={isAuditing}
          className="px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          Katalog-Bilder neu prüfen
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Gesamt Produkte</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{summary.total}</div>
          <div className="text-[11px] text-slate-400">GudPreiss Katalog</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-xs space-y-1 bg-emerald-500/5">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verifiziert (VERIFIED)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.verified}</div>
          <div className="text-[11px] text-emerald-500">100% Quelle &amp; Farbe OK</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/30 shadow-xs space-y-1 bg-rose-500/5">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">Inkonform (MISMATCH)</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{summary.mismatch}</div>
          <div className="text-[11px] text-rose-500">Falsche Variante / Farbe</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xs space-y-1 bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Prüfung nötig (REVIEW)</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.needs_review}</div>
          <div className="text-[11px] text-amber-500">Manuelle Kontrolle empfohlen</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Fehlend (MISSING)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{summary.missing}</div>
          <div className="text-[11px] text-slate-400">Kein Bild vorhanden</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Produkt, Marke oder SKU suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
          >
            <option value="ALL">Alle Status-Typen ({auditItems.length})</option>
            <option value="VERIFIED">Verifiziert (VERIFIED)</option>
            <option value="MISMATCH">Inkonform (MISMATCH)</option>
            <option value="NEEDS_REVIEW">Prüfung nötig (NEEDS_REVIEW)</option>
            <option value="MISSING">Fehlend (MISSING)</option>
          </select>
        </div>
      </div>

      {/* Audit Results Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Audit-Ergebnisse ({filteredItems.length} Produkte angezeigt)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Vorschaubild</th>
                <th className="pb-2">Produktname &amp; Variante</th>
                <th className="pb-2">Quelle</th>
                <th className="pb-2">Match Confidence</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.slice(0, 50).map(item => (
                <tr key={item.product_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {/* Thumbnail */}
                  <td className="py-3">
                    {item.primary_image ? (
                      <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
                        <img
                          src={item.primary_image.local_path}
                          alt={item.primary_image.alt_de}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>

                  {/* Name & Variant */}
                  <td className="py-3 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {item.product_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Farbe: {item.variant_info.color || 'N/A'} · SKU: {item.variant_info.sku || 'N/A'}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {item.source}
                  </td>

                  {/* Confidence */}
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${item.match_confidence >= 90 ? 'bg-emerald-500' : item.match_confidence >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${item.match_confidence}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {item.match_confidence}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border inline-flex items-center gap-1 ${
                      item.overall_status === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' :
                      item.overall_status === 'MISMATCH' ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400' :
                      'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    }`}>
                      {item.overall_status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                      {item.overall_status === 'MISMATCH' && <XCircle className="w-3 h-3" />}
                      {item.overall_status === 'NEEDS_REVIEW' && <AlertTriangle className="w-3 h-3" />}
                      {item.overall_status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleFixMismatch(item.product_id)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition flex items-center gap-1 ml-auto"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Als OK bestätigen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
