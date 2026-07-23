"use client";

import Image from "next/image";
import { Product, CATEGORY_LABELS, formatPrice } from "@/types";
import { useCartStore } from "@/store/cartStore";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

function getPrice(value: number | string): number {
  return typeof value === "string" ? Number.parseFloat(value) : value;
}

export default function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const price = getPrice(product.price);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="" size="lg">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-mad-bg md:w-1/2">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span className="absolute left-3 top-3 rounded-md bg-mad-bg/80 px-2 py-1 text-xs text-mad-accent backdrop-blur-sm">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          
          <div className="mt-4">
            <span className="text-3xl font-bold text-mad-accent">
              {formatPrice(price)}
            </span>
          </div>

          <p className="mt-4 flex-1 text-mad-muted">{product.description}</p>

          <div className="mt-6">
            {product.isAvailable ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                متوفر في المخزون
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                غير متوفر حالياً
              </span>
            )}
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={handleAdd}
            disabled={!product.isAvailable}
          >
            أضف للسلة
          </Button>
        </div>
      </div>
    </Modal>
  );
}
