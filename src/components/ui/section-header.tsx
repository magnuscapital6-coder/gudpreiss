'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, viewAllHref, children }: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-4 border-b border-border-soft pb-2.5 text-center sm:text-left gap-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-text-primary tracking-tight">
          {title}
        </h2>
        {children}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-[11px] font-semibold uppercase text-primary-500 hover:text-primary-600 tracking-wider flex items-center gap-1 transition"
        >
          <span>{t('home.viewAll')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
