"use client";

import { useEffect, useState } from "react";
import { getCategories, Category } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CategoryFilterProps {
  selected: string | "ALL";
  onChange: (categoryId: string | "ALL") => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const lang = useLanguageStore((s) => s.lang);
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

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      <button
        onClick={() => onChange("ALL")}
        className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
          selected === "ALL"
            ? "bg-mad-accent text-white font-medium"
            : "border border-mad-border bg-mad-surface text-mad-muted hover:border-mad-accent hover:text-mad-text"
        }`}
      >
        {t("all")}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
            selected === cat.id
              ? "bg-mad-accent text-white font-medium"
              : "border border-mad-border bg-mad-surface text-mad-muted hover:border-mad-accent hover:text-mad-text"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
