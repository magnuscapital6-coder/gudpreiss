'use client';

import React, { useState } from 'react';
import { createBlogPost } from '@/lib/db/db-provider';
import { optimizeBlogPostSEO, SEOAnalysisResult } from '@/lib/seo/ai-seo-optimizer';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Save, Eye, CheckCircle2, AlertCircle, HelpCircle, Globe } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Technologie');
  const [authorName, setAuthorName] = useState('TechNova Redaktion');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // SEO Fields State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('TechNova, Kaufberatung, Testbericht 2026');
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger AI SEO Optimization
  const handleOptimizeSEO = () => {
    if (!title && !content) {
      alert('Bitte geben Sie zuerst einen Titel oder Inhalt ein, um die KI-SEO-Optimierung auszuführen.');
      return;
    }

    setIsOptimizing(true);
    setTimeout(() => {
      const kwList = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);
      const result = optimizeBlogPostSEO({
        title,
        excerpt,
        content,
        category,
        existingKeywords: kwList,
      });

      setSeoTitle(result.seo_title);
      setSeoDescription(result.seo_description);
      setSlug(result.suggested_slug);
      setSeoAnalysis(result);
      setIsOptimizing(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const kwList = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);
      const score = seoAnalysis ? seoAnalysis.seo_score : 85;

      await createBlogPost({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        category,
        author_name: authorName,
        cover_image: coverImage,
        excerpt,
        content,
        status,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        keywords: kwList,
        seo_score: score,
      });

      router.push('/admin/blog');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern des Beitrags.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-white max-w-5xl mx-auto">
      {/* Back & Top Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Blog-Übersicht</span>
        </Link>

        <button
          type="button"
          onClick={handleOptimizeSEO}
          disabled={isOptimizing}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isOptimizing ? 'SEO WIRD ANALYSIERT...' : '✨ SEO OPTIMIEREN MIT KI'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-3">
            Artikel-Inhalt &amp; Metadaten
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Titel des Artikels *</label>
              <input
                type="text"
                required
                placeholder="ex: Die 10 besten Smartphones 2026 im Vergleich"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Technologie">Technologie</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Kaufberater">Kaufberater</option>
                  <option value="Testberichte">Testberichte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Autor Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-bold"
                >
                  <option value="published">Veröffentlicht / Published</option>
                  <option value="draft">Entwurf / Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Titelbild (Cover Image URL)</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Kurzbeschreibung (Excerpt)</label>
              <textarea
                rows={3}
                placeholder="Kurze Zusammenfassung für die Blog-Übersicht..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Vollständiger Text (Markdown / HTML)</label>
              <textarea
                rows={12}
                placeholder="Schreiben Sie hier Ihren ausführlichen Artikel..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* AI SEO Optimization Dashboard Box */}
        <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-extrabold uppercase tracking-wider text-emerald-400">
                KI-SEO Optimierungs-Cockpit
              </h3>
            </div>

            {seoAnalysis && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-extrabold">
                <span>SEO SCORE:</span>
                <span className="text-sm font-black">{seoAnalysis.seo_score}/100</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Google Meta Title (50-60 Zeichen)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Automatisch generiert mit KI..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Länge: {seoTitle.length} Zeichen</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Google Meta Description (140-160 Zeichen)</label>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Automatisch generiert mit KI..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Länge: {seoDescription.length} Zeichen</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: die-zehn-besten-smartphones-2026"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">SEO Mots-Clés / Keywords (kommagetrennt)</label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Google Live SERP Snippet Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Google SERP Live Vorschau</span>
              </div>

              <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 font-sans space-y-1 shadow-md">
                <div className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                  <span>https://technova.de</span>
                  <span>›</span>
                  <span>blog</span>
                  <span>›</span>
                  <span className="font-semibold text-slate-800">{slug || 'artikel-url'}</span>
                </div>
                <h4 className="text-base text-[#1a0dab] hover:underline font-semibold line-clamp-1 cursor-pointer">
                  {seoTitle || title || 'Titre de l-article dans les résultats Google'}
                </h4>
                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {seoDescription || excerpt || 'La méta description apparaîtra ici telle qu-elle sera affichée par le moteur de recherche Google.'}
                </p>
              </div>

              {/* Actionable Recommendations */}
              {seoAnalysis && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Empfehlungen &amp; Analyse</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {seoAnalysis.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                          rec.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Submit Footer */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'SPEICHERN LÄUFT...' : 'BEITRAG VERÖFFENTLICHEN & SPEICHERN'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
