'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2, X, FolderTree, Package, CheckCircle2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from '@/lib/db/db-provider';
import { Category, Product } from '@/types';
import { useTranslation } from '@/context/language-context';
import { getValidImageUrl } from '@/lib/image-fallback';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selection & Bulk Actions State
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedCategoryIds.length === filteredCategories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCategoryIds.length === 0) return;
    const count = selectedCategoryIds.length;
    if (confirm(`Möchten Sie die ${count} ausgewählten Kategorien wirklich löschen?`)) {
      setIsLoading(true);
      for (const id of selectedCategoryIds) {
        await deleteCategory(id);
      }
      setSelectedCategoryIds([]);
      await fetchData();
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E');
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
      setSelectedCategoryIds((prev) => prev.filter((item) => item !== id));
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
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        slug,
        description: description.trim(),
        image_url: finalImage,
      });
    } else {
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

  const isAllSelected =
    filteredCategories.length > 0 && selectedCategoryIds.length === filteredCategories.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kategorienverwaltung (Categories)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kategorien strukturieren und Bildmedien verwalten ({categories.length} Kategorien).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Kategorie hinzufügen</span>
        </button>
      </div>

      {/* Bulk Action Banner */}
      {selectedCategoryIds.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-black text-xs flex items-center justify-center">
              {selectedCategoryIds.length}
            </span>
            <span className="text-xs font-bold">Kategorien ausgewählt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategoryIds([])}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
            >
              Abbrechen
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Löschen
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Kategorie nach Name oder Slug suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Zero-Overflow Compact Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 w-48">Kategorie</th>
                <th className="py-2.5 px-3 w-32">Slug</th>
                <th className="py-2.5 px-3 w-44">Beschreibung</th>
                <th className="py-2.5 px-3 w-24 text-center">Produkte</th>
                <th className="py-2.5 px-3 text-right w-36">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Kategorien werden geladen...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Keine Kategorien gefunden.</td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  const validImg = getValidImageUrl(cat.image_url, cat.slug);
                  const prodCount = products.filter(
                    (p) =>
                      (p.category_id || '').toLowerCase() === cat.id.toLowerCase() ||
                      (p.category_name || '').toLowerCase() === cat.name.toLowerCase() ||
                      (p.category_id || '').toLowerCase().includes(cat.slug.toLowerCase())
                  ).length;

                  // Truncate strings to prevent any table overflow
                  const truncatedName = cat.name.length > 22 ? cat.name.substring(0, 22) + '...' : cat.name;
                  const truncatedSlug = cat.slug.length > 18 ? cat.slug.substring(0, 18) + '...' : cat.slug;
                  const truncatedDesc = cat.description
                    ? cat.description.length > 30
                      ? cat.description.substring(0, 30) + '...'
                      : cat.description
                    : '—';

                  return (
                    <tr
                      key={cat.id}
                      className={`transition ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(cat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 relative bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            <Image src={validImg} alt={cat.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate text-xs" title={cat.name}>
                              {truncatedName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500 truncate" title={cat.slug}>
                        {truncatedSlug}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-xs truncate" title={cat.description || ''}>
                        {truncatedDesc}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {prodCount} Stk.
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] rounded-md border border-slate-200 flex items-center gap-1 transition"
                            title="Kategorie bearbeiten"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Bearbeiten</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-[11px] rounded-md border border-slate-200 flex items-center gap-1 transition"
                            title="Kategorie löschen"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Löschen</span>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategoriename *
                </label>
                <input
                  type="text"
                  placeholder="z.B. Smart Home & Audio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  rows={3}
                  placeholder="Kurze Beschreibung der Kategorie..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bild URL / Pfad
                </label>
                <input
                  type="text"
                  placeholder="/images/categories/smarthome.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
                >
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
