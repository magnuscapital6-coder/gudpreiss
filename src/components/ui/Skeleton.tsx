'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonTitle({ className = 'w-48 h-6' }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function SkeletonButton({ className = 'w-32 h-10' }: { className?: string }) {
  return <Skeleton className={`rounded-xl ${className}`} />;
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <Skeleton className="w-1/3 h-3" />
      <Skeleton className="w-3/4 h-4" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 w-full h-[400px] flex flex-col justify-between">
      <div className="space-y-3 max-w-lg">
        <Skeleton className="w-32 h-6 bg-slate-800" />
        <Skeleton className="w-full h-10 bg-slate-800" />
        <Skeleton className="w-3/4 h-4 bg-slate-800" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-36 h-12 bg-slate-800 rounded-xl" />
        <Skeleton className="w-36 h-12 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <Skeleton className="w-32 h-4 bg-slate-800" />
        <Skeleton className="w-20 h-4 bg-slate-800" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/50">
          <Skeleton className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
          <Skeleton className="flex-1 h-4 bg-slate-800" />
          <Skeleton className="w-20 h-4 bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCheckout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto p-4 sm:p-8">
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <Skeleton className="w-48 h-6" />
        <div className="space-y-3 pt-2">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <Skeleton className="w-36 h-5 bg-slate-800" />
        <div className="space-y-3">
          <Skeleton className="w-full h-16 bg-slate-800" />
          <Skeleton className="w-full h-16 bg-slate-800" />
        </div>
        <Skeleton className="w-full h-12 bg-emerald-600/40 rounded-xl" />
      </div>
    </div>
  );
}
