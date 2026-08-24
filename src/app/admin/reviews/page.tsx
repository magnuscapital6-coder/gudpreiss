'use client';

import React, { useState, useEffect } from 'react';
import { getAllReviews, updateReviewStatus } from '@/lib/db/db-provider';
import { Review } from '@/types';
import { Star, Check, EyeOff, Trash2, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const revs = await getAllReviews();
      setReviews(revs);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'hidden') => {
    await updateReviewStatus(id, status);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kundenbewertungen &amp; Moderation ({reviews.length} Bewertungen)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bewertungen prüfen, freischalten oder ausblenden für eine transparente Shop-Qualität.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 p-4 space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Bewertungen werden geladen...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Keine Kundenbewertungen vorhanden.</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{rev.user_name}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(rev.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{rev.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rev.status === 'approved' ? (
                  <button
                    onClick={() => handleStatus(rev.id, 'hidden')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition"
                  >
                    Ausblenden
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatus(rev.id, 'approved')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition"
                  >
                    Freischalten
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
