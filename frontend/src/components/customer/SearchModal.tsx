"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { getProducts } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

function getPrice(value: number | string): number {
  return typeof value === "string" ? Number.parseFloat(value) : value;
}

export default function SearchModal({ open, onClose, onProductSelect }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dir = useLanguageStore((s) => s.dir);
  const { t } = useTranslation();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ available: true });
        const filtered = data.filter((product: Product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-mad-dark border border-mad-border rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-mad-border">
          <svg className="h-5 w-5 text-mad-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchProducts")}
            className="flex-1 bg-transparent text-mad-text-primary placeholder-mad-text-secondary outline-none text-base"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark-hover transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-mad-cyan border-t-transparent mx-auto" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-mad-text-secondary">
              {t("noProductsCategory")}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {results.map((product) => {
                const price = getPrice(product.price);
                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      onProductSelect?.(product);
                      onClose();
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-mad-dark-hover transition-colors text-right"
                  >
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-mad-dark shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mad-text-primary truncate">{product.name}</p>
                      <p className="text-sm font-bold text-mad-cyan">${price.toFixed(2)}</p>
                    </div>
                    <svg className="h-4 w-4 text-mad-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-mad-text-secondary text-sm">
              {t("searchHint")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
