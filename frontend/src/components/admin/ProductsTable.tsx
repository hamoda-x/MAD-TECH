"use client";

import Image from "next/image";
import { Product, formatDate, formatPrice } from "@/types";

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
      <div className="p-12 text-center text-mad-muted">
        <svg className="mx-auto mb-4 h-12 w-12 text-mad-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        لا توجد منتجات. أضف منتجاً جديداً للبدء.
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mad-border text-mad-muted">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  id="selectAllProducts"
                  name="selectAllProducts"
                  className="rounded border-mad-border bg-mad-bg text-mad-accent focus:ring-mad-accent"
                />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">المنتج</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">الفئة</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">السعر</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">الحالة</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">تاريخ الإضافة</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mad-border">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-mad-bg/50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    id={`selectProduct-${product.id}`}
                    name={`selectProduct-${product.id}`}
                    className="rounded border-mad-border bg-mad-bg text-mad-accent focus:ring-mad-accent"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-mad-bg">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-mad-text">{product.name}</p>
                      <p className="mt-0.5 max-w-[250px] truncate text-xs text-mad-muted">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full bg-mad-bg px-2.5 py-0.5 text-xs font-medium text-mad-text">
                    {product.category?.name || "غير محدد"}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-mad-text">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.isAvailable
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {product.isAvailable ? "متوفر" : "نفد المخزون"}
                  </span>
                </td>
                <td className="px-4 py-4 text-mad-muted">
                  <div className="text-sm">{formatDate(product.createdAt)}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-accent"
                      title="عرض"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-blue-500"
                      title="تعديل"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-red-500"
                      title="حذف"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-text"
                      title="المزيد"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden divide-y divide-mad-border">
        {products.map((product) => (
          <div key={product.id} className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-mad-bg">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-mad-text truncate">{product.name}</p>
                <p className="mt-0.5 text-xs text-mad-muted truncate">{product.description}</p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-mad-bg px-2 py-0.5 text-[10px] font-medium text-mad-text">
                    {product.category?.name || "غير محدد"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      product.isAvailable
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {product.isAvailable ? "متوفر" : "نفد"}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-mad-accent shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-mad-muted">{formatDate(product.createdAt)}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-blue-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
