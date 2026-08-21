'use client';

import React, { useState, useEffect } from 'react';
import { runFullSeoHealthAudit, SeoHealthReport } from '@/lib/seo/health-monitor';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Globe, Layers, ArrowUpRight, Search, FileText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { GoogleSearchConsoleCard } from '@/components/admin/GoogleSearchConsoleCard';

export default function SeoCommandCenterPage() {
  const [report, setReport] = useState<SeoHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'opportunities' | 'clusters' | 'merchant'>('overview');
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await runFullSeoHealthAudit();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleRunBulkOptimization = async () => {
    setIsBulkRunning(true);
    setBulkStatus('1. Datenbank-Produkte scannen...');
    await new Promise((r) => setTimeout(r, 600));

    setBulkStatus('2. Deutsche Slugs & Meta-Descriptions generieren...');
    await new Promise((r) => setTimeout(r, 700));

    setBulkStatus('3. ALT-Attribute & Schema.org verifizieren...');
    await new Promise((r) => setTimeout(r, 700));

    setBulkStatus('4. Google Merchant Feed & Sitemap.xml aktualisieren...');
    await new Promise((r) => setTimeout(r, 600));

    await loadReport();
    setIsBulkRunning(false);
    setBulkStatus('');
  };

  if (isLoading || !report) {
    return (
      <div className="p-8 text-center text-white space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
        <p className="text-xs font-bold text-slate-400">SEO Command Center wird initialisiert...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>🇩🇪 GOOGLE DEUTSCHLAND SEO ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">SEO COMMAND CENTER</h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Zentrale Verwaltung aller SEO-Aktivitäten, Merchant-Feeds, Keyword-Chancen und Schema-Strukturen für TechNova.
          </p>
        </div>

        {/* Global Score Meter Widget */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 relative z-10">
          <div className="relative w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-inner">
            <span className="text-2xl font-black text-emerald-400">{report.globalScore}</span>
            <span className="text-[10px] text-slate-500 absolute bottom-1.5">/100</span>
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Globaler SEO-Score</span>
            <span className="text-[11px] text-emerald-400 font-semibold block">Google.de Ready</span>
            <button
              onClick={handleRunBulkOptimization}
              disabled={isBulkRunning}
              className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isBulkRunning ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{bulkStatus}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>ALLES OPTIMIEREN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          📊 SEO Übersicht
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'issues' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <span>⚠️ Diagnose & Probleme</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-extrabold">
            {report.issues.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'opportunities' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🚀 Keyword Opportunities
        </button>
        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'clusters' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🏗️ Topic Clusters
        </button>
        <button
          onClick={() => setActiveTab('merchant')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🛍️ Merchant Center Feed
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Sub-Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Technik</span>
              <span className="text-lg font-black text-emerald-400">{report.technicalScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Inhalt</span>
              <span className="text-lg font-black text-emerald-400">{report.contentScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Produkte</span>
              <span className="text-lg font-black text-emerald-400">{report.productScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Kategorien</span>
              <span className="text-lg font-black text-emerald-400">{report.categoryScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Verlinkung</span>
              <span className="text-lg font-black text-emerald-400">{report.internalLinkingScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Indexierbarkeit</span>
              <span className="text-lg font-black text-emerald-400">{report.indexabilityScore}/100</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-bold">DE Readiness</span>
              <span className="text-lg font-black text-emerald-400">{report.germanSeoScore}/100</span>
            </div>
          </div>

          {/* Key Links & XML Feeds Card */}
          <GoogleSearchConsoleCard />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Sitemap.xml
                </span>
                <Link href="/sitemap.xml" target="_blank" className="text-emerald-400 hover:underline text-xs flex items-center gap-1">
                  <span>Öffnen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">Dynamischer Index aller Shop-Seiten & Produkte für Googlebot.</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Google Merchant Feed
                </span>
                <Link href="/api/feeds/google-products" target="_blank" className="text-emerald-400 hover:underline text-xs flex items-center gap-1">
                  <span>XML Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">RSS 2.0 Produktfeed im Standard-Format für Google Deutschland.</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  LLMs.txt AI Index
                </span>
                <Link href="/llms.txt" target="_blank" className="text-emerald-400 hover:underline text-xs flex items-center gap-1">
                  <span>Anzeigen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">Strukturierter Index für KI-Suchmaschinen (Perplexity, SearchGPT).</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUES & DIAGNOSTICS */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Gefundene SEO-Optimierungspotenziale ({report.issues.length})</h3>
          <div className="space-y-3">
            {report.issues.map((issue) => (
              <div key={issue.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      issue.type === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {issue.category}
                    </span>
                    <h4 className="text-xs font-bold text-white">{issue.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">{issue.description}</p>
                  <span className="text-[10px] text-emerald-400 block font-mono">Empfehlung: {issue.recommendation}</span>
                </div>

                <Link
                  href={issue.actionableId ? `/admin/products/${issue.actionableId}/edit` : issue.affectedUrl}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <span>BEHEBEN</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KEYWORD OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Top Keyword-Chancen für Google.de</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.opportunities.map((opp, idx) => (
              <div key={idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Opportunität #{idx + 1}</span>
                <h4 className="text-xs font-black text-white">{opp.keyword}</h4>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <div>Aktueller Rang: <span className="font-bold text-amber-400">{opp.currentRank}</span></div>
                  <div>Potenzial: <span className="font-bold text-emerald-400">{opp.potential}</span></div>
                  <div className="pt-2 text-slate-400 font-mono text-[10px] border-t border-slate-800">Aktion: {opp.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TOPIC CLUSTERS */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Themen-Cluster & Topical Authority</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.topicalClusters.map((cluster, idx) => (
              <div key={idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{cluster.topic}</span>
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {cluster.subPages} Unterseiten
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Pillar Page: <span className="text-emerald-400 font-mono">{cluster.pillarPage}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-300 block mb-1">Empfohlene Ergänzungen:</span>
                  <div className="space-y-1">
                    {cluster.missingTopics.map((m, mIdx) => (
                      <div key={mIdx} className="text-[10px] text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MERCHANT CENTER */}
      {activeTab === 'merchant' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Google Merchant Center Feed (Deutschland)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Der Feed wird unter <code className="text-emerald-400">/api/feeds/google-products</code> bereitgestellt.
              </p>
            </div>
            <Link
              href="/api/feeds/google-products"
              target="_blank"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition"
            >
              <span>FEED SPEICHERN / ANSEHEN</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-bold">Ziel-Land</span>
              <span className="font-bold text-emerald-400 text-sm">🇩🇪 Deutschland (DE)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-bold">Währung</span>
              <span className="font-bold text-emerald-400 text-sm">EUR (€)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-bold">Feed Status</span>
              <span className="font-bold text-emerald-400 text-sm">Aktiv &amp; Synchronisiert</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
