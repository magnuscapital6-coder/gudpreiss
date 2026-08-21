'use client';

import React from 'react';
import { Award, ShieldCheck, RefreshCw, Leaf, Truck } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function TrustGuaranteeBar() {
  const trustItems = [
    {
      icon: Award,
      title: 'Erstklassige Qualität',
      subtitle: 'Hochwertige Materialien',
    },
    {
      icon: ShieldCheck,
      title: 'Sichere Kasse',
      subtitle: '100% Sichere Zahlung',
    },
    {
      icon: RefreshCw,
      title: 'Zufriedenheitsgarantie',
      subtitle: '30 Tage Geld-zurück',
    },
    {
      icon: Leaf,
      title: 'Umweltfreundlich',
      subtitle: 'Nachhaltige Verpackung',
    },
    {
      icon: Truck,
      title: 'Schnelle Lieferung',
      subtitle: 'Zuverlässiger Versand',
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-[20px] py-4 px-4 sm:px-8 my-6 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60 dark:divide-slate-800/60">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <AnimatedSection key={idx} delay={idx * 0.08} direction="up">
              <div className={`flex items-center gap-3 ${idx > 0 ? 'pt-3 sm:pt-0 sm:pl-4' : ''}`}>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-900 dark:text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}
