"use client";

import { useState } from "react";
import {
  Product,
  ProductCategory,
  CATEGORY_LABELS,
  formatPrice,
} from "@/types";
import Button from "@/components/shared/Button";
import { Input, Textarea, Select } from "@/components/shared/Input";
import ImageUpload from "@/components/admin/CloudinaryUpload";

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
  category: ProductCategory;
  isAvailable: boolean;
}

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

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
  const [category, setCategory] = useState<ProductCategory>(
    initial?.category || "PC_BUILD"
  );
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [error, setError] = useState("");

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

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        imageUrl: imageUrl.trim(),
        category,
        isAvailable,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ المنتج");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="اسم المنتج"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Textarea
        label="الوصف"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        required
      />

      <Input
        label="السعر ($)"
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        dir="ltr"
        required
      />

      <Select
        label="الفئة"
        value={category}
        onChange={(e) => setCategory(e.target.value as ProductCategory)}
        options={categoryOptions}
      />

      <ImageUpload imageUrl={imageUrl} onChange={setImageUrl} />

      <label className="flex items-center gap-2 text-sm text-mad-muted">
        <input
          type="checkbox"
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
