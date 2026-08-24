'use client';

import React from 'react';
import { Users, Mail, Phone, Shield } from 'lucide-react';

export default function AdminCustomersPage() {
  const kunden = [
    { id: 'c-1', name: 'Brice Founder', email: 'brice.dev@example.com', phone: '+49 30 123-45678', orders: 4, total_spent: 3420, role: 'Administrator' },
    { id: 'c-2', name: 'Lisa Vance', email: 'customer.lisa@example.com', phone: '+49 30 876-5432', orders: 2, total_spent: 764, role: 'Kunde' },
    { id: 'c-3', name: 'Alexandre Mercer', email: 'alex.m@example.com', phone: '+49 30 341-9876', orders: 1, total_spent: 1150, role: 'Kunde' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kundenverwaltung (Customer Database)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verwalten Sie registrierte Kunden, Kontaktdaten und Zugriffsrechte.
          </p>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-56">Kunde</th>
                <th className="py-2.5 px-3 w-36">Telefon</th>
                <th className="py-2.5 px-3 w-28 text-center">Bestellungen</th>
                <th className="py-2.5 px-3 w-32 text-right">Gesamtausgaben</th>
                <th className="py-2.5 px-3 text-right w-28">Rolle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {kunden.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900 truncate text-xs" title={c.name}>{c.name}</div>
                    <div className="text-[10px] text-slate-400 truncate" title={c.email}>{c.email}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px] truncate">{c.phone}</td>
                  <td className="py-2 px-3 text-center font-bold text-slate-700">{c.orders} Stk.</td>
                  <td className="py-2 px-3 font-bold text-slate-900 text-right">{c.total_spent.toLocaleString('de-DE')} €</td>
                  <td className="py-2 px-3 text-right">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase">
                      {c.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
