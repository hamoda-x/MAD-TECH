"use client";

import { useEffect, useState } from "react";
import { getCategories, Category } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CategoriesSectionProps {
  onCategorySelect: (categoryId: string | "ALL") => void;
  selectedCategory?: string | "ALL";
}

const categoryIcons: Record<string, React.ReactNode> = {
  CPU: (
    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  GPU: (
    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  RAM: (
    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  default: (
    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
};

export default function CategoriesSection({ onCategorySelect, selectedCategory = "ALL" }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const dir = useLanguageStore((s) => s.dir);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || categoryIcons.default;
  };

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-mad-dark" dir={dir}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 bg-mad-cyan rounded-full" />
            <h2 className="text-2xl sm:text-3xl font-bold text-mad-text-primary">
              {t("categoriesTitle")}
            </h2>
          </div>
          <button
            onClick={() => onCategorySelect("ALL")}
            className="flex items-center gap-2 text-sm text-mad-text-secondary hover:text-mad-cyan transition-colors group"
          >
            <span>{t("backToStore")}</span>
            <svg className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Categories Grid - Full Width */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl p-3 sm:p-4 md:p-5 transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-mad-cyan/10 border border-mad-cyan/50 shadow-lg shadow-mad-cyan/10"
                  : "category-card hover:bg-mad-cyan/5"
              }`}
            >
              <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-mad-cyan/20 text-mad-cyan"
                  : "bg-mad-dark-hover text-mad-text-secondary hover:text-mad-cyan"
              }`}>
                {getCategoryIcon(cat.slug)}
              </div>
              <span className={`text-center text-[10px] sm:text-xs font-medium transition-colors duration-300 leading-tight ${
                selectedCategory === cat.id
                  ? "text-mad-cyan"
                  : "text-mad-text-secondary"
              }`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
