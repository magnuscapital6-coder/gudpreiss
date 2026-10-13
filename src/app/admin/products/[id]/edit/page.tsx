'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductBySlug, updateProduct, getCategories } from '@/lib/db/db-provider';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Category, Product } from '@/types';
import { useToast } from '@/context/toast-context';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [brandName, setBrandName] = useState('Samsung');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      const [product, cats] = await Promise.all([
        getProductBySlug(productId, { includeInactive: true }),
        getCategories(),
      ]);
      setCategories(cats);

      if (product) {
        setName(product.name);
        setSlug(product.slug || '');
        setSku(product.sku);
        setPrice(String(product.price));
        setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : '');
        setCostPrice(product.cost_price ? String(product.cost_price) : '');
        setStock(String(product.stock));
        setBrandName(product.brand_name || 'GudPreiss');
        setShortDescription(product.short_description || '');
        setDescription(product.description);
        setImages(product.images || []);

        // Match the product's category to a real category so the dropdown
        // reflects the single source of truth (the admin categories list).
        const currentId = (product.category_id || '').toLowerCase().trim();
        const currentName = (product.category_name || '').toLowerCase().trim();
        const currentSlug = (product.slug || '').toLowerCase().trim();
        const matched = cats.find(
          (c) =>
            (currentId && c.id.toLowerCase().trim() === currentId) ||
            (currentName && c.name.toLowerCase().trim() === currentName) ||
            (currentId && c.slug.toLowerCase().trim() === currentId) ||
            (currentSlug && c.slug.toLowerCase().trim() === currentSlug)
        );
        if (matched) {
          setCategoryId(matched.id);
          setCategoryName(matched.name);
        } else {
          setCategoryId(product.category_id || '');
          setCategoryName(product.category_name || '');
        }
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [productId]);

  const handleCategoryChange = (selectedId: string) => {
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    setCategoryName(cat ? cat.name : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Bitte importieren Sie mindestens ein Produktbild.', 'Bild erforderlich');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<Product> = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        cost_price: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        category_name: categoryName,
        brand_name: brandName,
        short_description: shortDescription,
        description,
        images,
        on_sale: Boolean(compareAtPrice),
      };
      if (categoryId) payload.category_id = categoryId;

      await updateProduct(productId, payload);

      toast.success(`„${name}“ wurde erfolgreich aktualisiert.`, 'Produkt gespeichert');
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Fehler bei der Produktaktualisierung.', 'Speichern fehlgeschlagen');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Produktdetails werden geladen...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Produkten</span>
        </Link>
        <h1 className="text-xl font-black text-white">Produkt bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Produktname *</label>
            <input
              type="text"
              required
              placeholder="ex: Samsung Yantabalt Expe 5G"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Code SKU *</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prix de vente (€) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prix barré (€)</label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Quantité en stock *</label>
            <input
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="">— Catégorie wählen —</option>
              {categoryId && !categories.some((c) => c.id === categoryId) && categoryName && (
                <option value={categoryId}>{categoryName} (nicht zugeordnet)</option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-slate-500">
              Die Kategorien werden aus der Kategorienverwaltung geladen.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Marque</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Image Uploader */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Produktbilder (Direktimport) *
          </label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Kurzbeschreibung</label>
          <textarea
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Kurze Zusammenfassung, die auf der Produktseite und als Meta-Beschreibung erscheint..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Ausführliche Beschreibung</label>
          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Save className="w-4 h-4" />
          <span>ENREGISTRER LES MODIFICATIONS</span>
        </button>
      </form>
    </div>
  );
}
