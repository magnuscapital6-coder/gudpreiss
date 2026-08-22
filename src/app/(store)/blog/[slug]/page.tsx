'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/db/db-provider';
import { BlogPost } from '@/types';
import { Clock, User, ArrowLeft, Tag, Share2, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function SingleBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const found = await getBlogPostBySlug(slug);
        setPost(found);

        const all = await getBlogPosts();
        setRelatedPosts(all.filter((p) => p.slug !== slug).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500 font-bold animate-pulse">
          Artikel wird geladen...
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Header />
        <div className="flex-1 max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold">Artikel nicht gefunden</h2>
          <p className="text-xs text-slate-500">Der gesuchte Blog-Beitrag existiert nicht oder wurde verschoben.</p>
          <Link href="/blog" className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl">
            Zurück zur Blog-Übersicht
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full py-8 space-y-8">
        {/* Back Link & Category */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zu allen Artikeln</span>
          </Link>

          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-700 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-slate-200/80 dark:border-slate-800 py-3 text-xs text-slate-500 dark:text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <User className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                <span>{post.author_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{post.read_time_minutes || 5} Min. Lesezeit</span>
              </div>
              <span>•</span>
              <span>{new Date(post.published_at).toLocaleDateString('de-DE')}</span>
            </div>

            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Link Kopiert!' : 'Teilen'}</span>
            </button>
          </div>
        </div>

        {/* Cover Image Header */}
        <div className="relative h-64 sm:h-96 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
        </div>

        {/* Article Excerpt Callout */}
        {post.excerpt && (
          <div className="p-6 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-300 leading-relaxed">
            {post.excerpt}
          </div>
        )}

        {/* Article Content Renderer */}
        <article className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm whitespace-pre-wrap">
          {post.content}
        </article>

        {/* Keywords & Tags */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4">
            <Tag className="w-4 h-4 text-emerald-800 dark:text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-slate-500">SEO Tags:</span>
            {post.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-600 rounded-lg text-[11px] font-mono"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Related Articles Footer Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-xl font-extrabold tracking-tight">Ähnliche Artikel &amp; Ratgeber</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-4 space-y-3"
                >
                  <h3 className="font-bold text-xs line-clamp-2">{rel.title}</h3>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="text-emerald-800 dark:text-emerald-700 font-extrabold text-[11px] hover:underline"
                  >
                    Lesen →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
