'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2, X, Image as ImageIcon, Check } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from '@/lib/db/db-provider';
import { Category, Product } from '@/types';
import { useTranslation } from '@/context/language-context';
import { getValidImageUrl } from '@/lib/image-fallback';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [Kategorien, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
    setCategories(cats);
    setProducts(prods);
    setIsLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(getValidImageUrl(cat.image_url, cat.slug));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diese Kategorie wirklich löschen?')) {
      await deleteCategory(id);
      fetchData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalImage = imageUrl.trim() || getValidImageUrl(undefined, slug);

    if (editingCategory) {
      // Update existing category
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        slug,
        description: description.trim(),
        image_url: finalImage,
      });
    } else {
      // Create new category
      await createCategory({
        name: name.trim(),
        slug,
        description: description.trim(),
        image_url: finalImage,
      });
    }

    setIsSaving(false);
    setIsModalOpen(false);
    fetchData();
  };

  const filteredCategories = Kategorien.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('admin.Kategorien')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verwalten und bearbeiten Sie Kategorien und deren Bilder für die Startseite ({Kategorien.length} Kategorien).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition cursor-pointer touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addCategory') || 'Kategorie hinzufügen'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Kategorie nach Name oder Slug suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 max-w-[280px]">Kategorie & Bild</th>
                <th className="py-3 px-3 w-36">Slug</th>
                <th className="py-3 px-3 w-48">Beschreibung</th>
                <th className="py-3 px-3 w-28">Produkte</th>
                <th className="py-3 px-4 w-24 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Kategorien werden geladen...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Keine Kategorien gefunden.</td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const validImg = getValidImageUrl(cat.image_url, cat.slug);
                  const prodCount = products.filter(
                    (p) =>
                      (p.category_id || '').toLowerCase() === cat.id.toLowerCase() ||
                      (p.category_name || '').toLowerCase() === cat.name.toLowerCase() ||
                      (p.category_id || '').toLowerCase().includes(cat.slug.toLowerCase())
                  ).length;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            <Image src={validImg} alt={cat.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{cat.name}</p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                              Home Card Visual Active
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] w-36 truncate">
                        {cat.slug}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 w-48 truncate" title={cat.description || ''}>
                        {cat.description || '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap w-28">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          {prodCount} Produkte
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap w-36">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 font-bold text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer"
                            title="Éditer la catégorie et son image"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Éditer</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-bold text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer"
                            title="Supprimer la catégorie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kategorienname *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Laptops & PCs, Smartwatches..."
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Category Visual Image URL with Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kategorien-Bild URL (Wird für Karten auf der Startseite verwendet) *
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <Image
                      src={getValidImageUrl(imageUrl, name || 'default')}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Live-Vorschau</p>
                    <p className="text-[10px] text-slate-400 truncate">Dieses Bild wird in den Startseiten-Karten gerendert</p>
                  </div>
                </div>

                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://abt-distribution.com/wp-content/uploads/..."
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Beschreibung
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung der Kategorie..."
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'WIRD GESPEICHERT...' : editingCategory ? 'ÄNDERUNGEN SPEICHERN' : 'KATEGORIE ERSTELLEN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
