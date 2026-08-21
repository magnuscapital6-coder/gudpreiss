'use client';

import React, { useState, useEffect } from 'react';
import { getBlogPosts, deleteBlogPost } from '@/lib/db/db-provider';
import { BlogPost } from '@/types';
import { Plus, Edit, Trash2, Eye, Sparkles, Search, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Blog-Beitrag wirklich löschen?')) {
      await deleteBlogPost(id);
      loadData();
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-black tracking-tight">Blog-Beiträge &amp; KI-SEO Optimierung</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verwalten Sie Ihre Blog-Artikel und optimieren Sie das Google-Ranking mit dem KI-SEO Tool.
          </p>
        </div>

        <Link
          href="/admin/Blog/new"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Neuen Beitrag Erstellen</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Nach Titel oder Kategorie suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse">
          Blog-Beiträge werden geladen...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold">Keine Blog-Beiträge gefunden</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Erstellen Sie Ihren ersten SEO-optimierten Artikel für Ihren Store.
          </p>
          <Link
            href="/admin/Blog/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Ersten Artikel schreiben</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Titel &amp; Kategorie</th>
                  <th className="py-4 px-4">Autor</th>
                  <th className="py-4 px-4">SEO-Score</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Datum</th>
                  <th className="py-4 px-6 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPosts.map((post) => {
                  const score = post.seo_score || 85;
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">/Blog/{post.slug} • <span className="text-emerald-800 dark:text-emerald-400">{post.category}</span></div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {post.author_name}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          score >= 80
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>{score}/100 SEO</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                          post.status === 'published'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(post.published_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/Blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Vorschau"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/Blog/${post.id}/edit`}
                            className="p-2 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Bearbeiten & SEO"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
