import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 space-y-8">
      <Skeleton className="w-48 h-4" />
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <Skeleton className="w-full h-[400px] rounded-2xl" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-full h-24" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="flex-1 h-12 rounded-2xl" />
              <Skeleton className="flex-1 h-12 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
