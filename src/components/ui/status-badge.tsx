'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
}

export function StatusBadge({ status, stockCount }: StatusBadgeProps) {
  const config = {
    in_stock: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: stockCount !== undefined ? `In Stock (${stockCount})` : 'In Stock',
    },
    low_stock: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: stockCount !== undefined ? `Low Stock (${stockCount})` : 'Low Stock',
    },
    out_of_stock: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Out of Stock',
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${item.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
}
