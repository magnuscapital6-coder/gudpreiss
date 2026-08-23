'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/db/db-provider';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ProductSeoOptimizer, generateGermanSeoSlug } from '@/components/admin/ProductSeoOptimizer';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [gtin, setGtin] = useState('');
  const [mpn, setMpn] = useState('');
  const [condition, setCondition] = useState<'new' | 'refurbished' | 'used'>('new');
  const [googleProductCategory, setGoogleProductCategory] = useState('Electronics > Tech');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [categoryName, setCategoryName] = useState('Smartphones');
  const [brandName, setBrandName] = useState('Samsung');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([
    'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>'
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Bitte importieren Sie mindestens ein Produktbild.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createProduct({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: sku || `SKU-${Date.now()}`,
        gtin: gtin || `4012345${Math.floor(100000 + Math.random() * 900000)}`,
        mpn: mpn || sku || `MPN-${Date.now()}`,
        condition,
        google_product_category: googleProductCategory,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        cost_price: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        category_name: categoryName,
        brand_name: brandName,
        description,
        images,
        featured: true,
        best_seller: false,
        new_arrival: true,
        on_sale: Boolean(compareAtPrice),
      });

      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      alert('Fehler bei der Produkterstellung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Produkten</span>
        </Link>
        <h1 className="text-xl font-black text-white">Créer un Produit Tech</h1>
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
              placeholder="ex: SAM-YANT-002"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Google Merchant Center & Identifiers (GTIN, MPN, Condition) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-3">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Google Merchant Center Identifikatoren (Deutschland)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Code GTIN / EAN (Barcode)</label>
              <input
                type="text"
                placeholder="ex: 4012345678901"
                value={gtin}
                onChange={(e) => setGtin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Code MPN (Hersteller-Teilenummer)</label>
              <input
                type="text"
                placeholder="ex: MPN-SAM-901"
                value={mpn}
                onChange={(e) => setMpn(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Zustand (Condition)</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="new">Neu (New)</option>
                <option value="refurbished">Generalüberholt (Refurbished)</option>
                <option value="used">Gebraucht (Used)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Google Produkttkategorie</label>
            <input
              type="text"
              placeholder="ex: Electronics > Communications > Telephony > Mobile Phones"
              value={googleProductCategory}
              onChange={(e) => setGoogleProductCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prix de vente (€) *</label>
            <input
              type="number"
              required
              placeholder="999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prix barré (€)</label>
            <input
              type="number"
              placeholder="1199"
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
            <label className="block text-xs font-bold text-slate-600 mb-1">Marque</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Direct Image File Drag & Drop Uploader */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Importation directe d&apos;images du produit *
          </label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Description détaillée</label>
          <textarea
            rows={4}
            required
            placeholder="Spécifications techniques, fonctionnalités et contenu de la boîte..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* SEO 100% Optimizer Engine Widget */}
        <ProductSeoOptimizer
          fields={{
            name,
            slug,
            sku,
            price,
            categoryName,
            brandName,
            description,
            images,
          }}
          onApplyOptimization={(updates) => {
            if (updates.slug) setSlug(updates.slug);
            if (updates.description) setDescription(updates.description);
          }}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>PRODUKT SPEICHERN & AUTOMATISCH IM SHOP VERÖFFENTLICHEN</span>
        </button>
      </form>
    </div>
  );
}
