"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "@/components/customer/ProductCard";
import ProductDetailModal from "@/components/customer/ProductDetailModal";
import HeroSection from "@/components/customer/HeroSection";
import CategoriesSection from "@/components/customer/CategoriesSection";
import Loader from "@/components/shared/Loader";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

const VALID_CATEGORIES = ["CPU", "GPU", "RAM", "STORAGE", "MOTHERBOARD", "PSU", "COOLING", "OTHER"];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string | "ALL">("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAll, setShowAll] = useState(false);
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("category");
    if (catParam && VALID_CATEGORIES.includes(catParam)) {
      setCategory(catParam);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const params =
          category === "ALL"
            ? { available: true }
            : { categoryId: category, available: true };
        const data = await getProducts(params);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, lang, t]);

  const displayedProducts = showAll ? products : products.slice(0, 8);

  return (
    <div dir={dir} className="min-h-screen bg-mad-dark">
      <HeroSection />

      <CategoriesSection
        onCategorySelect={setCategory}
        selectedCategory={category}
      />

      {/* Featured Products Section */}
      <section id="featured" className="py-10 sm:py-14 md:py-16 bg-mad-dark">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-mad-cyan rounded-full" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-mad-text-primary">
                  {t("featuredProducts")}
                </h2>
                <p className="mt-1 text-sm sm:text-base text-mad-text-secondary">
                  {t("featuredSubtitle")}
                </p>
              </div>
            </div>
            {category !== "ALL" && (
              <button
                onClick={() => setCategory("ALL")}
                className="flex items-center gap-2 text-sm text-mad-text-secondary hover:text-mad-cyan transition-colors group self-start"
              >
                <span>{t("backToStore")}</span>
                <svg className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && <Loader />}

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-8 text-center text-red-400">
              {error}
              <p className="mt-2 text-sm text-mad-text-secondary">
                {lang === "ar" ? "تأكد من تشغيل الباكند على المنفذ 3001" : "Make sure the backend is running on port 3001"}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-mad-border bg-mad-card p-12 text-center text-mad-text-secondary">
              {t("noProductsCategory")}
            </div>
          )}

          {/* Products Grid - Full Width */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>

              {/* Show More Button */}
              {!showAll && products.length > 8 && (
                <div className="mt-10 sm:mt-12 flex justify-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="flex items-center gap-2 rounded-xl border border-mad-border bg-mad-card px-8 py-3.5 text-sm font-medium text-mad-text-primary transition-all hover:bg-mad-cyan/10 hover:border-mad-cyan/30 hover:text-mad-cyan hover:scale-105"
                  >
                    <span>{t("showMore")}</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
