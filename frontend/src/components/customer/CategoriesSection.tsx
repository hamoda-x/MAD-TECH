"use client";

import { ProductCategory } from "@/types";
import { useDirectionStore } from "@/store/directionStore";
import { useThemeStore } from "@/store/themeStore";

interface CategoryItem {
  name: string;
  nameAr: string;
  category: ProductCategory;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
}

const categories: CategoryItem[] = [
  {
    name: "Processors",
    nameAr: "المعالجات",
    category: "CPU",
    color: "text-yellow-400",
    lightColor: "text-yellow-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Graphics Cards",
    nameAr: "كرت الشاشة",
    category: "GPU",
    color: "text-purple-400",
    lightColor: "text-purple-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "RAM",
    nameAr: "الرام",
    category: "RAM",
    color: "text-green-400",
    lightColor: "text-green-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Storage",
    nameAr: "التخزين",
    category: "STORAGE",
    color: "text-orange-400",
    lightColor: "text-orange-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    name: "PC Cases",
    nameAr: "كيس الكمبيوتر",
    category: "CASE",
    color: "text-pink-400",
    lightColor: "text-pink-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    name: "Mouse",
    nameAr: "الماوس",
    category: "PERIPHERAL",
    color: "text-gray-400",
    lightColor: "text-gray-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <rect x="8" y="2" width="8" height="20" rx="4" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Keyboards",
    nameAr: "لوحة المفاتيح",
    category: "OTHER",
    color: "text-cyan-400",
    lightColor: "text-cyan-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Accessories",
    nameAr: "الملحقات",
    category: "COOLING",
    color: "text-green-400",
    lightColor: "text-green-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface CategoriesSectionProps {
  onCategorySelect: (category: ProductCategory | "ALL") => void;
}

export default function CategoriesSection({ onCategorySelect }: CategoriesSectionProps) {
  const { isRtl } = useDirectionStore();
  const { isDark } = useThemeStore();

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {isRtl ? "التصنيفات" : "Categories"}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-mad-accent to-transparent" />
        </div>

        <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onCategorySelect(cat.category)}
              className={`category-card group flex flex-col items-center justify-center gap-3 rounded-xl p-4 sm:p-6 ${
                isDark ? "hover:border-mad-accent/30" : "hover:border-mad-accent"
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                isDark ? "bg-mad-accent/10" : "bg-mad-accent/10"
              } ${isDark ? cat.color : cat.lightColor}`}>
                {cat.icon}
              </div>
              <span className={`text-center text-xs font-medium sm:text-sm ${
                isDark 
                  ? "text-gray-400 group-hover:text-white" 
                  : "text-gray-600 group-hover:text-gray-900"
              }`}>
                {isRtl ? cat.nameAr : cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
