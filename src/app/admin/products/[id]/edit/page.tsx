'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductBySlug, updateProduct } from '@/lib/db/db-provider';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [categoryName, setCategoryName] = useState('Smartphones');
  const [brandName, setBrandName] = useState('Samsung');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      const product = await getProductBySlug(productId);
      if (product) {
        setName(product.name);
        setSlug(product.slug || '');
        setSku(product.sku);
        setPrice(String(product.price));
        setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : '');
        setCostPrice(product.cost_price ? String(product.cost_price) : '');
        setStock(String(product.stock));
        setCategoryName(product.category_name || 'Smartphones');
        setBrandName(product.brand_name || 'TechNova');
        setDescription(product.description);
        setImages(product.images || []);
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Bitte importieren Sie mindestens ein Produktbild.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProduct(productId, {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        cost_price: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        category_name: categoryName,
        brand_name: brandName,
        description,
        images,
        on_sale: Boolean(compareAtPrice),
      });

      router.push('/admin/Produkte');
    } catch (err) {
      console.error(err);
      alert('Fehler bei der Produktaktualisierung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Produktdetails werden geladen...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/Produkte" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Produkten</span>
        </Link>
        <h1 className="text-xl font-black text-white">Produkt bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Produktname *</label>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Code SKU *</label>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Prix de vente (€) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Prix barré (€)</label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Quantité en stock *</label>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Catégorie</label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Smartphones">Smartphones</option>
              <option value="Laptops & Computers">Ordinateurs & Laptops</option>
              <option value="Headphones & Audio">Casques & Audio</option>
              <option value="Game Controllers & Gaming">Manettes & Gaming</option>
              <option value="Smart Home & Robotics">Maison Connectée & Robotique</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Marque</label>
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
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Produktbilder (Direktimport) *
          </label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
          <textarea
            rows={4}
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
