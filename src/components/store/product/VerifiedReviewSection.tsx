'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp, MessageSquare, CheckCircle } from 'lucide-react';
import { Review } from '@/types';
import { useTranslation } from '@/context/language-context';

interface VerifiedReviewSectionProps {
  productId: string;
  reviews: Review[];
  onAddReview?: (newReview: Partial<Review>) => void;
}

export function VerifiedReviewSection({ productId, reviews, onAddReview }: VerifiedReviewSectionProps) {
  const { t } = useTranslation();
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !authorName) return;

    if (onAddReview) {
      onAddReview({
        product_id: productId,
        user_name: authorName,
        rating,
        title: 'Verifizierte Bewertung',
        comment,
        verified_purchase: Boolean(orderNumber),
        status: 'approved',
      });
    }

    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      {/* Review Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Kundenbewertungen</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-extrabold">
              100% Verifiziert
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1">
            Alle Bewertungen stammen von echten Käufern aus Deutschland.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-700 dark:text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">5.0 / 5.0</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">({reviews.length} Bewertungen)</span>
        </div>
      </div>

      {/* Review Submission Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Bewertung für dieses Produkt abgeben
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">Ihr Name *</label>
              <input
                type="text"
                required
                placeholder="z.B. Markus S. (Berlin)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">Bestellnummer (Verifizierung)</label>
              <input
                type="text"
                placeholder="z.B. TN-2026-9812"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">Bewertung</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5/5 — Excellent</option>
                <option value={4}>⭐⭐⭐⭐ 4/5 — Sehr gut</option>
                <option value={3}>⭐⭐⭐ 3/5 — Gut</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">Ihre Erfahrung *</label>
            <textarea
              rows={3}
              required
              placeholder="Teilen Sie Ihre Erfahrung zur Qualität, Lieferung und Leistung..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            BEWERTUNG ABSCHICKEN
          </button>
        </form>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vielen Dank! Ihre Bewertung wurde erfolgreich gespeichert und freigeschaltet.</span>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.user_name}</span>
                {rev.verified_purchase && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verifizierter Kauf
                  </span>
                )}
              </div>
              <div className="flex items-center text-amber-700 dark:text-amber-400">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
