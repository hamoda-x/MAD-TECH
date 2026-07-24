"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  transferCategoryProducts,
  Category,
} from "@/lib/api";
import Modal from "@/components/shared/Modal";
import { useLanguageStore } from "@/store/languageStore";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteModal, setDeleteModal] = useState<Category | null>(null);
  const [transferModal, setTransferModal] = useState<Category | null>(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const dir = useLanguageStore((s) => s.dir);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل التصنيفات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setFormName("");
    setFormError("");
    setFormOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormError("");
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formName.trim()) {
      setFormError("اسم التصنيف مطلوب");
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      const slug = formName
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_")
        .replace(/[^A-Z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      if (!slug) {
        setFormError("اسم التصنيف يجب أن يحتوي على أحرف أو أرقام");
        setFormLoading(false);
        return;
      }

      if (editing) {
        await updateCategory(editing.id, { name: formName.trim(), slug });
      } else {
        await createCategory({ name: formName.trim(), slug });
      }

      setFormOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    if (cat._count && cat._count.products > 0) {
      setTransferModal(cat);
      setTransferTarget("");
    } else {
      setDeleteModal(cat);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    try {
      setActionLoading(true);
      await deleteCategory(deleteModal.id);
      setDeleteModal(null);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferAndDelete = async () => {
    if (!transferModal || !transferTarget) return;

    try {
      setActionLoading(true);
      await transferCategoryProducts(transferModal.id, transferTarget);
      setTransferModal(null);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div dir={dir}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mad-text">إدارة التصنيفات</h1>
          <p className="mt-1 text-sm text-mad-muted">إضافة وتعديل وحذف التصنيفات</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-mad-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mad-accent/90"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة تصنيف
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
          <button onClick={() => setError("")} className="mr-3 underline">إغلاق</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mad-accent border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-mad-border bg-mad-card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-mad-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <p className="mt-4 text-mad-muted">لا توجد تصنيفات بعد</p>
          <button onClick={handleAdd} className="mt-4 text-sm text-mad-accent hover:underline">أضف أول تصنيف</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-mad-border bg-mad-card p-5 transition-all hover:border-mad-accent/30 hover:shadow-lg hover:shadow-mad-accent/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mad-accent/10">
                  <svg className="h-6 w-6 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-lg text-mad-muted hover:text-mad-accent hover:bg-mad-accent/10 transition-colors"
                    title="تعديل"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat)}
                    className="p-2 rounded-lg text-mad-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="حذف"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-mad-text">{cat.name}</h3>
              <p className="mt-1 text-sm text-mad-muted font-mono">{cat.slug}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-mad-bg px-3 py-1 text-xs font-medium text-mad-text-secondary">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  {cat._count?.products || 0} منتج
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mad-text mb-2">اسم التصنيف</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="مثال: معالجات"
              className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted focus:border-mad-accent focus:outline-none"
              autoFocus
            />
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mad-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-mad-accent/90 disabled:opacity-50"
            >
              {formLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                editing ? "حفظ التعديلات" : "إضافة التصنيف"
              )}
            </button>
            <button
              onClick={() => setFormOpen(false)}
              className="flex-1 rounded-xl border border-mad-border px-4 py-3 text-sm font-medium text-mad-text transition-colors hover:bg-mad-bg"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="حذف التصنيف"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-mad-text-secondary">
            هل أنت متأكد من حذف التصنيف <span className="font-semibold text-mad-text">{deleteModal?.name}</span>؟
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "حذف"
              )}
            </button>
            <button
              onClick={() => setDeleteModal(null)}
              className="flex-1 rounded-xl border border-mad-border px-4 py-3 text-sm font-medium text-mad-text transition-colors hover:bg-mad-bg"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal (for categories with products) */}
      <Modal
        open={!!transferModal}
        onClose={() => setTransferModal(null)}
        title="تحويل المنتجات قبل الحذف"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-500">يحتوي على {transferModal?._count?.products} منتج</p>
                <p className="mt-1 text-sm text-mad-text-secondary">
                  يجب تحويل جميع المنتجات إلى تصنيف آخر قبل الحذف
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mad-text mb-2">اختر التصنيف الجديد</label>
            <select
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text focus:border-mad-accent focus:outline-none"
            >
              <option value="">-- اختر تصنيف --</option>
              {categories
                .filter((c) => c.id !== transferModal?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat._count?.products || 0} منتج)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTransferAndDelete}
              disabled={actionLoading || !transferTarget}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "تحويل وحذف"
              )}
            </button>
            <button
              onClick={() => setTransferModal(null)}
              className="flex-1 rounded-xl border border-mad-border px-4 py-3 text-sm font-medium text-mad-text transition-colors hover:bg-mad-bg"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
