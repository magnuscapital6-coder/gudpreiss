import React from 'react';
import { SkeletonTable, Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-7 bg-slate-800" />
        <Skeleton className="w-32 h-10 bg-slate-800 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <Skeleton className="w-24 h-3 bg-slate-800" />
            <Skeleton className="w-16 h-6 bg-slate-800" />
          </div>
        ))}
      </div>

      <SkeletonTable rows={6} />
    </div>
  );
}
