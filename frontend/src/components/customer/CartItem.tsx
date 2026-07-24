"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/store/cartStore";
import { formatPrice } from "@/types";

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
    <div className="flex items-center gap-4 sm:gap-6 py-5 border-b border-mad-border last:border-b-0">
      {/* Total */}
      <div className="w-24 sm:w-28 text-left">
        <span className="text-mad-accent font-bold text-base sm:text-lg">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>

      {/* Quantity Controls */}
      <div className="w-28 sm:w-32 flex items-center justify-center">
        <div className="flex items-center border border-mad-border rounded-lg overflow-hidden">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-mad-text-secondary hover:bg-mad-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-medium text-mad-text bg-mad-dark">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-mad-text-secondary hover:bg-mad-dark transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Unit Price */}
      <div className="w-24 sm:w-28 text-center">
        <span className="text-mad-text-primary text-sm sm:text-base font-medium">
          {formatPrice(item.price)}
        </span>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-mad-text-primary truncate">
            {item.name}
          </h3>
        </div>
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-mad-dark border border-mad-border">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
        aria-label="حذف"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
}
