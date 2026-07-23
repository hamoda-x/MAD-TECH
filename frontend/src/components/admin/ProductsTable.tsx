"use client";

import Image from "next/image";
import { Product, CATEGORY_LABELS, formatPrice } from "@/types";
import Button from "@/components/shared/Button";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-mad-border bg-mad-surface p-12 text-center text-mad-muted">
        لا توجد منتجات. أضف منتجاً جديداً للبدء.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-mad-border">
      <table className="w-full text-sm">
        <thead className="border-b border-mad-border bg-mad-surface">
          <tr>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              الصورة
            </th>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              الاسم
            </th>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              الفئة
            </th>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              السعر
            </th>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              الحالة
            </th>
            <th className="px-4 py-3 text-right font-medium text-mad-muted">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mad-border bg-mad-bg">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-mad-surface/50">
              <td className="px-4 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white">
                {product.name}
              </td>
              <td className="px-4 py-3 text-mad-muted">
                {CATEGORY_LABELS[product.category]}
              </td>
              <td className="px-4 py-3 text-mad-accent">
                {formatPrice(product.price)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    product.isAvailable
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {product.isAvailable ? "متوفر" : "غير متوفر"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(product)}
                  >
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
