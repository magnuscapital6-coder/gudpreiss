'use client';

import React, { useState, useEffect } from 'react';
import { getLegalPage, updateLegalPage } from '@/lib/db/db-provider';
import { LegalPage } from '@/types';
import { Scale, Save, Eye, CheckCircle2, ShieldCheck, FileText, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function AdminLegalPagesEditor() {
  const [activeTab, setActiveTab] = useState<'impressum' | 'privacy' | 'terms' | 'return-policy'>('impressum');
  const [pageData, setPageData] = useState<LegalPage>({
    slug: 'impressum',
    title: '',
    subtitle: '',
    content: '',
    last_updated: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPage(activeTab);
  }, [activeTab]);

  async function loadPage(slug: string) {
    setIsLoading(true);
    try {
      const data = await getLegalPage(slug);
      if (data) {
        setPageData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateLegalPage(activeTab, {
        title: pageData.title,
        subtitle: pageData.subtitle,
        content: pageData.content,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern der rechtlichen Seite.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { slug: 'impressum', label: 'Impressum', icon: Scale, link: '/impressum' },
    { slug: 'privacy', label: 'Datenschutzerklärung (DSGVO)', icon: ShieldCheck, link: '/privacy' },
    { slug: 'terms', label: 'AGB & Bedingungen', icon: FileText, link: '/terms' },
    { slug: 'return-policy', label: 'Widerrufsbelehrung & Rückgabe', icon: RefreshCcw, link: '/return-policy' },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-white max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-black tracking-tight">Rechtliche Seiten Verwalten (Legal CMS)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bearbeiten Sie Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung in Echtzeit.
          </p>
        </div>

        <Link
          href={tabs.find((t) => t.slug === activeTab)?.link || '/impressum'}
          target="_blank"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Live-Vorschau Anzeigen</span>
        </Link>
      </div>

      {/* Tabs selector */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActiveTab(t.slug as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Form */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse">
          Lade rechtliche Seite...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {saveSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Die Änderungen wurden erfolgreich gespeichert und sind sofort live auf der Website!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Seitentitel *</label>
              <input
                type="text"
                required
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Untertitel / Einleitung</label>
              <input
                type="text"
                value={pageData.subtitle}
                onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Rechtlicher Inhalt (Markdown / HTML Format)</label>
              <textarea
                rows={16}
                required
                value={pageData.content}
                onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono leading-relaxed text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              Zuletzt aktualisiert: {pageData.last_updated ? new Date(pageData.last_updated).toLocaleString('de-DE') : 'Jetzt'}
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SPEICHERN LÄUFT...' : 'ÄNDERUNGEN SPEICHERN & VERÖFFENTLICHEN'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
