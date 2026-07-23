"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/api";
import Button from "@/components/shared/Button";

interface ImageUploadProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ imageUrl, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة فقط");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const result = await uploadFile(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-mad-muted">صورة المنتج</label>

      {imageUrl && (
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-mad-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="معاينة"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        loading={uploading}
      >
        {imageUrl ? "تغيير الصورة" : "اختر صورة من الجهاز"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <p className="text-xs text-mad-muted">
        الصيغ المدعومة: JPG, PNG, WebP (حد أقصى 5MB)
      </p>
    </div>
  );
}
