'use client';

import React from 'react';
import { Users, Mail, Phone, Shield } from 'lucide-react';

export default function AdminCustomersPage() {
  const customers = [
    { id: 'c-1', name: 'Brice Founder', email: 'brice.dev@example.com', phone: '+1 (555) 234-5678', orders: 4, total_spent: 3420, role: 'Administrateur' },
    { id: 'c-2', name: 'Lisa Vance', email: 'customer.lisa@example.com', phone: '+1 (555) 876-5432', orders: 2, total_spent: 764, role: 'Client' },
    { id: 'c-3', name: 'Alexandre Mercer', email: 'alex.m@example.com', phone: '+1 (555) 341-9876', orders: 1, total_spent: 1150, role: 'Client' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Base de Données Clients</h1>
        <p className="text-xs text-slate-400 mt-1">Gérez les acheteurs inscrits, les coordonnées et les rôles d&apos;accès.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Commandes Effectuées</th>
              <th className="p-4">Montant Cumulé</th>
              <th className="p-4 text-right">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/50">
                <td className="p-4">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.email}</div>
                </td>
                <td className="p-4 text-slate-400">{c.phone}</td>
                <td className="p-4 font-bold text-white">{c.orders} commandes</td>
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
