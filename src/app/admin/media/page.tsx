'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
  Filter
} from 'lucide-react';
import { getProducts } from '@/lib/db/db-provider';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  category?: string;
  created_at?: string;
}

const SVG_FALLBACK =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Media%3C%2Ftext%3E%3C%2Fsvg%3E';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      const items: MediaItem[] = [];

      products.forEach((p) => {
        if (p.images && p.images.length > 0) {
          p.images.forEach((imgUrl, idx) => {
            if (imgUrl) {
              items.push({
                id: `media-${p.id}-${idx}`,
                name: `${p.name} ${p.images.length > 1 ? `(#${idx + 1})` : ''}`,
                url: imgUrl,
                category: p.category_name || 'Produkte',
              });
            }
          });
        }
      });

      // Restore custom uploaded items from localStorage if available
      const stored = localStorage.getItem('gudpreiss_custom_media');
      if (stored) {
        try {
          const customItems = JSON.parse(stored);
          if (Array.isArray(customItems)) {
            items.unshift(...customItems);
          }
        } catch (e) {}
      }

      setMediaItems(items);
    } catch (err) {
      console.error('Fehler beim Laden der Medien:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newItem: MediaItem = {
            id: `custom-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: event.target.result as string,
            category: 'Upload',
            created_at: new Date().toISOString(),
          };

          setMediaItems((prev) => {
            const updated = [newItem, ...prev];
            const customOnly = updated.filter((item) => item.category === 'Upload');
            localStorage.setItem('gudpreiss_custom_media', JSON.stringify(customOnly));
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const newItem: MediaItem = {
      id: `custom-${Date.now()}`,
      name: 'Importiertes Bild',
      url: customUrlInput.trim(),
      category: 'Upload',
      created_at: new Date().toISOString(),
    };

    setMediaItems((prev) => {
      const updated = [newItem, ...prev];
      const customOnly = updated.filter((item) => item.category === 'Upload');
      localStorage.setItem('gudpreiss_custom_media', JSON.stringify(customOnly));
      return updated;
    });

    setCustomUrlInput('');
    setShowUrlField(false);
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      const customOnly = updated.filter((item) => item.category === 'Upload');
      localStorage.setItem('gudpreiss_custom_media', JSON.stringify(customOnly));
      return updated;
    });
  };

  const filteredItems = mediaItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 text-slate-900 dark:text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-extrabold tracking-tight">
              Medienbibliothek (Media Library)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verwalten Sie alle Produktmedien und Bilddaten aus der Datenbank ({mediaItems.length} Dateien).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUrlField(!showUrlField)}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL Import</span>
          </button>

          <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Bild hochladen</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showUrlField && (
        <form onSubmit={handleAddUrl} className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <input
            type="url"
            placeholder="https://example.com/produktbild.jpg"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
          >
            Hinzufügen
          </button>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Medien durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={loadMedia}
          disabled={isLoading}
          className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Neu laden</span>
        </button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Medienbibliothek wird geladen...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Keine Medien für Ihre Suchanfrage gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 flex flex-col justify-between transition hover:border-emerald-500/50"
            >
              <div className="relative w-full h-36 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2">
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain select-none transition group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = SVG_FALLBACK;
                  }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate flex-1" title={item.name}>
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{item.category || 'Medien'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.id, item.url)}
                      title="Bild-URL kopieren"
                      className="p-1 text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {item.category === 'Upload' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Medie löschen"
                        className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
