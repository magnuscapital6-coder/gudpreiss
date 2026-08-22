import React from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard global express shipping takes between 2 to 4 business days.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards via Stripe (Visa, Mastercard, AMEX) and Cash on Delivery.' },
    { q: 'Are all products covered by warranty?', a: 'Yes! All products sold on GudPreiss include a 2-Year Official Manufacturer Warranty.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return and exchange policy for unopened or defective products.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full py-12 space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="w-10 h-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4 space-y-1">
              <h2 className="font-bold text-slate-900 text-sm">{faq.q}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
