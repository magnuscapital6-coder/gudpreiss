'use client';

import React, { useState, useEffect } from 'react';
import { getAllReviews, updateReviewStatus } from '@/lib/db/db-provider';
import { Review } from '@/types';
import { Star, Check, EyeOff, Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function load() {
      const revs = await getAllReviews();
      setReviews(revs);
    }
    load();
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'hidden') => {
    await updateReviewStatus(id, status);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Modération des Avis Clients</h1>
        <p className="text-xs text-slate-400 mt-1">Approuvez, masquez ou modérez les avis déposés par les acheteurs.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 p-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="py-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">{rev.user_name}</span>
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs font-bold text-slate-200">{rev.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
            </div>

            <div className="flex items-center gap-2">
              {rev.status === 'approved' ? (
                <button
                  onClick={() => handleStatus(rev.id, 'hidden')}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg border border-slate-800"
                >
                  Masquer
                </button>
              ) : (
                <button
                  onClick={() => handleStatus(rev.id, 'approved')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg"
                >
                  Approuver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
