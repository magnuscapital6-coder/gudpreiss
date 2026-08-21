'use client';

import React from 'react';

interface BadgeProps {
  type: 'bestseller' | 'new' | 'sale' | 'hot' | 'limited' | 'custom';
  text?: string;
  className?: string;
}

export function Badge({ type, text, className = '' }: BadgeProps) {
  const styles = {
    bestseller: 'bg-[#F59E0B] text-white',
    new: 'bg-[#2563EB] text-white',
    sale: 'bg-[#EF4444] text-white',
    hot: 'bg-[#EA580C] text-white',
    limited: 'bg-[#7C3AED] text-white',
    custom: 'bg-slate-800 text-white',
  };

  const defaultText = {
    bestseller: 'BESTSELLER',
    new: 'NEW',
    sale: 'SALE',
    hot: 'HOT',
    limited: 'LIMITED',
    custom: text || '',
  };

  return (
    <span
      className={`inline-block text-[9px] font-bold tracking-wider uppercase leading-none rounded-[3px] px-[5px] py-[3px] shadow-small ${styles[type]} ${className}`}
    >
      {text || defaultText[type]}
    </span>
  );
}
