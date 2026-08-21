'use client';

import React from 'react';
import { Users, Mail, Phone, Shield } from 'lucide-react';

export default function AdminCustomersPage() {
  const Kunden = [
    { id: 'c-1', name: 'Brice Founder', email: 'brice.dev@example.com', phone: '+49 30 123-45678', Bestellungen: 4, total_spent: 3420, role: 'Administrator' },
    { id: 'c-2', name: 'Lisa Vance', email: 'customer.lisa@example.com', phone: '+49 30 876-5432', Bestellungen: 2, total_spent: 764, role: 'Kunde' },
    { id: 'c-3', name: 'Alexandre Mercer', email: 'alex.m@example.com', phone: '+49 30 341-9876', Bestellungen: 1, total_spent: 1150, role: 'Kunde' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Kundenverwaltung</h1>
        <p className="text-xs text-slate-400 mt-1">Verwalten Sie registrierte Kunden, Kontaktdaten und Zugriffsrechte.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">Kunde</th>
              <th className="p-4">Telefon</th>
              <th className="p-4">Bestellungen</th>
              <th className="p-4">Gesamtbetrag</th>
              <th className="p-4 text-right">Rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {Kunden.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/50">
                <td className="p-4">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.email}</div>
                </td>
                <td className="p-4 text-slate-400">{c.phone}</td>
                <td className="p-4 font-bold text-white">{c.Bestellungen} Bestellungen</td>
                <td className="p-4 font-black text-blue-400">{c.total_spent.toLocaleString('de-DE')} €</td>
                <td className="p-4 text-right">
                  <span className="bg-blue-500/10 text-blue-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    {c.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
