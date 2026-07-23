"use client";

import { ProductCategory, CATEGORY_LABELS } from "@/types";
import { useDirectionStore } from "@/store/directionStore";

interface CategoryFilterProps {
  selected: ProductCategory | "ALL";
  onChange: (category: ProductCategory | "ALL") => void;
}

const categories: Array<ProductCategory | "ALL"> = [
  "ALL",
  "PC_BUILD",
  "CPU",
  "GPU",
  "RAM",
  "STORAGE",
  "MOTHERBOARD",
  "PSU",
  "CASE",
  "COOLING",
  "PERIPHERAL",
  "OTHER",
];

const CATEGORY_LABELS_EN: Record<ProductCategory, string> = {
  PC_BUILD: "PC Build",
  CPU: "Processor",
  GPU: "Graphics Card",
  RAM: "RAM",
  STORAGE: "Storage",
  MOTHERBOARD: "Motherboard",
  PSU: "Power Supply",
  CASE: "Case",
  COOLING: "Cooling",
  PERIPHERAL: "Peripheral",
  OTHER: "Other",
};

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  const { isRtl } = useDirectionStore();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            selected === cat
              ? "bg-mad-accent text-white font-medium"
              : "border border-mad-border bg-mad-surface text-mad-muted hover:border-mad-accent hover:text-mad-text"
          }`}
        >
          {cat === "ALL"
            ? (isRtl ? "الكل" : "All")
            : (isRtl ? CATEGORY_LABELS[cat] : CATEGORY_LABELS_EN[cat])}
        </button>
      ))}
    </div>
  );
}
