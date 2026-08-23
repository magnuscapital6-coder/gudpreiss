'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { getBlogPosts } from '@/lib/db/db-provider';
import { BlogPost } from '@/types';
import { Search, Clock, User, Sparkles, ArrowRight, BookOpen, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
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
    loadData();
  }, []);

  const categories = ['all', 'Technologie', 'Smartphones', 'Smart Home', 'Kaufberater', 'Testberichte'];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 space-y-10">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Magazin, Tests &amp; Tech-Trends 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 max-w-xl mx-auto leading-relaxed">
            Unabhängige Testberichte, Experten-Kaufberater und News aus der Welt der Technik und Innovationen.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <div className="bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border-0 grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-[380px]">
              <Image
                src={featuredPost.cover_image}
                alt={featuredPost.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Highlight Beitrag
                </span>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight line-clamp-2">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:text-emerald-700 transition">
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{featuredPost.author_name}</span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5"
                >
                  <span>Artikel Lesen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Alle Kategorien' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Artikel suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-bold animate-pulse">
            Blog-Artikel werden geladen...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-3">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold">Keine Beiträge gefunden</h3>
            <p className="text-xs text-slate-500">Versuchen Sie es mit einer anderen Suche oder Kategorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-700" />
                        {post.read_time_minutes || 5} Min. Lesezeit
                      </span>
                      <span>•</span>
                      <span>{new Date(post.published_at).toLocaleDateString('de-DE')}</span>
                    </div>

                    <h3 className="text-base font-extrabold line-clamp-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-700 transition">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-600">{post.author_name}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-extrabold text-emerald-800 dark:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Lesen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
