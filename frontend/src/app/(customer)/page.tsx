"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import { Product, ProductCategory } from "@/types";
import ProductCard from "@/components/customer/ProductCard";
import HeroSection from "@/components/customer/HeroSection";
import CategoriesSection from "@/components/customer/CategoriesSection";
import Loader from "@/components/shared/Loader";
import { useDirectionStore } from "@/store/directionStore";
import { useThemeStore } from "@/store/themeStore";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
  const { isRtl } = useDirectionStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const params =
          category === "ALL"
            ? { available: true }
            : { category, available: true };
        const data = await getProducts(params);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : (isRtl ? "فشل تحميل المنتجات" : "Failed to load products"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, isRtl]);

  return (
    <div>
      <HeroSection />

      <CategoriesSection onCategorySelect={setCategory} />

      <section id="featured" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {isRtl ? "المنتجات المميزة" : "Featured Products"}
              </h2>
              <p className={`mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {isRtl ? "قطع مختارة بعناية للهاوية" : "Hand-picked components for enthusiasts"}
              </p>
            </div>
            {products.length > 0 && (
              <button
                onClick={() => setCategory("ALL")}
                className="rounded-lg border border-mad-accent/30 bg-mad-accent/10 px-4 py-2 text-sm font-medium text-mad-accent transition-colors hover:bg-mad-accent/20"
              >
                {isRtl ? "عرض الكل" : "View All"}
              </button>
            )}
          </div>

          {loading && <Loader />}

          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-center text-red-400">
              {error}
              <p className="mt-2 text-sm text-mad-muted">
                {isRtl ? "تأكد من تشغيل الباكند على المنفذ 3001" : "Make sure the backend is running on port 3001"}
              </p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className={`rounded-xl border p-12 text-center ${
              isDark 
                ? "border-gray-700 bg-[#16162a] text-gray-400" 
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}>
              {isRtl ? "لا توجد منتجات في هذه الفئة." : "No products found in this category."}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
