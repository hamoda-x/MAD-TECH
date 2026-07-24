"use client";

import { useState, useEffect, useRef } from "react";
import {
  Product,
  formatPrice,
} from "@/types";
import Button from "@/components/shared/Button";
import { Input, Textarea, Select } from "@/components/shared/Input";
import ImageUpload from "@/components/admin/CloudinaryUpload";
import { getCategories, Category } from "@/lib/api";

interface ProductFormProps {
  initial?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
}

export default function ProductForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(
    initial ? String(Number(initial.price)) : ""
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const initialRef = useRef(initial);
  const categoryIdRef = useRef(categoryId);

  useEffect(() => {
    initialRef.current = initial;
    categoryIdRef.current = categoryId;
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
        if (!categoryIdRef.current && data.length > 0 && !initialRef.current) {
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedPrice = Number.parseFloat(price);
    if (!name.trim() || !description.trim() || !imageUrl.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("يرجى إدخال سعر صحيح.");
      return;
    }
    if (!categoryId) {
      setError("يرجى اختيار التصنيف.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        imageUrl: imageUrl.trim(),
        categoryId,
        isAvailable,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ المنتج");
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="اسم المنتج"
        name="productName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Textarea
        label="الوصف"
        name="productDescription"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        required
      />

      <Input
        label="السعر ($)"
        name="productPrice"
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        dir="ltr"
        required
      />

      {loadingCategories ? (
        <div>
          <label className="block text-sm font-medium text-mad-text mb-2">التصنيف</label>
          <div className="h-10 rounded-xl border border-mad-border bg-mad-bg animate-pulse" />
        </div>
      ) : (
        <Select
          label="التصنيف"
          name="productCategory"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />
      )}

      <ImageUpload imageUrl={imageUrl} onChange={setImageUrl} />

      <label className="flex items-center gap-2 text-sm text-mad-muted">
        <input
          type="checkbox"
          id="isAvailable"
          name="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="rounded border-mad-border bg-mad-bg text-mad-accent focus:ring-mad-accent"
        />
        متوفر للبيع
      </label>

      {initial && (
        <p className="text-xs text-mad-muted">
          السعر الحالي: {formatPrice(initial.price)}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? "حفظ التعديلات" : "إضافة المنتج"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
