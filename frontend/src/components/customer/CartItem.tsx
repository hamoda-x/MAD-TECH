"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/store/cartStore";
import { formatPrice } from "@/types";
import Button from "@/components/shared/Button";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-mad-border bg-mad-surface p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-mad-bg">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-mad-text">{item.name}</h3>
          <button
            onClick={() => onRemove(item.id)}
            className="text-mad-muted transition-colors hover:text-red-400"
            aria-label="حذف"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="!px-2.5 !py-1"
            >
              −
            </Button>
            <span className="w-8 text-center text-sm text-mad-text">{item.quantity}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="!px-2.5 !py-1"
            >
              +
            </Button>
          </div>
          <span className="font-semibold text-mad-accent">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
