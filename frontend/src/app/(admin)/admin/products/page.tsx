"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  getCategories,
  Category,
} from "@/lib/api";
import { Product, formatPrice } from "@/types";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Loader from "@/components/shared/Loader";
import StatsCard from "@/components/admin/StatsCard";

const statsIcons = {
  total: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  available: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  outOfStock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  price: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const statusOptions = [
  { value: "ALL", label: "جميع الحالات" },
  { value: "AVAILABLE", label: "متوفر" },
  { value: "OUT_OF_STOCK", label: "نفد المخزون" },
];

const priceRangeOptions = [
  { value: "ALL", label: "الكل" },
  { value: "0-100", label: "أقل من $100" },
  { value: "100-300", label: "$100 - $300" },
  { value: "300-500", label: "$300 - $500" },
  { value: "500+", label: "أكثر من $500" },
];

// categoryOptions will be built inside the component using the categories state

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "OUT_OF_STOCK">("ALL");
  const [priceRange, setPriceRange] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryOptions = useMemo(() => [
    { value: "ALL", label: "الكل" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ], [categories]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.isAvailable).length;
    const outOfStock = total - available;
    const avgPrice =
      total > 0
        ? products.reduce((sum, p) => sum + Number(p.price), 0) / total
        : 0;
    return { total, available, outOfStock, avgPrice };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" || product.categoryId === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && product.isAvailable) ||
        (statusFilter === "OUT_OF_STOCK" && !product.isAvailable);

      const price = Number(product.price);
      let matchesPrice = true;
      if (priceRange === "0-100") matchesPrice = price < 100;
      else if (priceRange === "100-300") matchesPrice = price >= 100 && price <= 300;
      else if (priceRange === "300-500") matchesPrice = price >= 300 && price <= 500;
      else if (priceRange === "500+") matchesPrice = price > 500;

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [products, search, categoryFilter, statusFilter, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      setFormOpen(false);
      setEditing(null);
      await loadProducts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف المنتج");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filteredProducts.map((p) => ({
      "اسم المنتج": p.name,
      "الوصف": p.description,
      "الفئة": p.category?.name || "غير محدد",
      "السعر": Number(p.price),
      "الحالة": p.isAvailable ? "متوفر" : "نفد المخزون",
      "تاريخ الإضافة": new Date(p.createdAt).toLocaleDateString("ar-JO"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
    const colWidths = [
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, "products-export.xlsx");
    setExportMenuOpen(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Products Report - MAD_TECH", 14, 20);
    doc.setFontSize(10);
    doc.text("Generated: " + new Date().toLocaleDateString("en-US"), 14, 28);

    const tableData = filteredProducts.map((p) => [
      p.name,
      p.category?.name || "Uncategorized",
      "$" + Number(p.price).toFixed(2),
      p.isAvailable ? "Available" : "Out of Stock",
      new Date(p.createdAt).toLocaleDateString("en-US"),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Name", "Category", "Price", "Status", "Date"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("products-export.pdf");
    setExportMenuOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-mad-muted">
            <a href="/admin" className="hover:text-mad-accent">لوحة التحكم</a>
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-mad-text">المنتجات</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-mad-text">إدارة المنتجات</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-mad-accent px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="إجمالي المنتجات"
          value={stats.total}
          subtitle="كل المنتجات"
          icon={statsIcons.total}
        />
        <StatsCard
          title="متوفر"
          value={stats.available}
          subtitle="من المنتجات"
          accent="text-green-500"
          icon={statsIcons.available}
        />
        <StatsCard
          title="نفد المخزون"
          value={stats.outOfStock}
          subtitle="من المنتجات"
          accent="text-red-500"
          changeType="negative"
          icon={statsIcons.outOfStock}
        />
        <StatsCard
          title="متوسط السعر"
          value={formatPrice(stats.avgPrice)}
          subtitle="متوسط الأسعار"
          accent="text-blue-500"
          icon={statsIcons.price}
        />
      </div>

      <div className="rounded-2xl border border-mad-border bg-mad-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-mad-border p-4">
          <div className="flex items-center gap-2">
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-mad-border px-4 py-2.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                تصدير
                <svg className={`h-4 w-4 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-mad-border bg-mad-surface shadow-xl">
                  <div className="p-2">
                    <button
                      onClick={handleExportExcel}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mad-text transition-colors hover:bg-mad-bg"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Excel</p>
                        <p className="text-xs text-mad-muted">ملف .xlsx</p>
                      </div>
                    </button>

                    <button
                      onClick={handleExportPDF}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mad-text transition-colors hover:bg-mad-bg"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">PDF</p>
                        <p className="text-xs text-mad-muted">ملف .pdf</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
            <button
              onClick={loadProducts}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3">
            <select
              id="productPriceRange"
              name="productPriceRange"
              value={priceRange}
              onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-mad-border bg-mad-bg px-4 py-2.5 text-sm text-mad-text outline-none transition-colors focus:border-mad-accent"
            >
              {priceRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              id="productCategoryFilter"
              name="productCategoryFilter"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-mad-border bg-mad-bg px-4 py-2.5 text-sm text-mad-text outline-none transition-colors focus:border-mad-accent"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              id="productStatusFilter"
              name="productStatusFilter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
              className="rounded-xl border border-mad-border bg-mad-bg px-4 py-2.5 text-sm text-mad-text outline-none transition-colors focus:border-mad-accent"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <svg
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mad-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                id="searchProducts"
                name="searchProducts"
                placeholder="ابحث في المنتجات..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-mad-border bg-mad-bg py-2.5 pr-10 pl-4 text-sm text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12"><Loader /></div>
        ) : (
          <ProductsTable
            products={paginatedProducts}
            onEdit={(p) => {
              setEditing(p);
              setFormOpen(true);
            }}
            onDelete={setDeleteTarget}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-mad-border px-6 py-4">
          <p className="text-sm text-mad-muted">
            عرض {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} إلى{" "}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من{" "}
            {filteredProducts.length} منتجات
          </p>
          <div className="flex items-center gap-3">
            <select
              id="productsPerPage"
              name="productsPerPage"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="rounded-lg border border-mad-border bg-mad-bg px-3 py-1.5 text-sm text-mad-text outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent disabled:opacity-40"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-mad-accent text-white"
                      : "border border-mad-border text-mad-muted hover:border-mad-accent hover:text-mad-accent"
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 3 && (
                <span className="px-1 text-mad-muted">...</span>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "تعديل منتج" : "إضافة منتج جديد"}
        size="lg"
      >
        <ProductForm
          key={editing?.id || "new"}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          loading={submitting}
        />
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
