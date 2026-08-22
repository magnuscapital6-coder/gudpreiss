'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderTree, X } from 'lucide-react';
import { getCategories, createCategory } from '@/lib/db/db-provider';
import { Category } from '@/types';
import { useTranslation } from '@/context/language-context';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [Kategorien, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createCategory({
      name: name.trim(),
      description: description.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
    });

    setName('');
    setDescription('');
    setIsModalOpen(false);
    fetchCategories();
  };

  const filteredCategories = Kategorien.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('admin.Kategorien')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verwalten Sie die Kategorien des GudPreiss-Shops.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addCategory')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <input
          type="text"
          placeholder="Kategorie suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 outline-none"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 pl-5 font-bold text-slate-900 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-500" />
                    <span>{cat.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600">
                      Aktiv
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Category Modal (Bottom Sheet on Mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">{t('admin.addCategory')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategorienname</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Accessoires Gaming"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Kategorie erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
