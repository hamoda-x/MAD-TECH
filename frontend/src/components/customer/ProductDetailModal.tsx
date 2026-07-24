"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useLanguageStore } from "@/store/languageStore";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProductDetailModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

function getPrice(value: number | string): number {
  return typeof value === "string" ? Number.parseFloat(value) : value;
}

function generateWhatsAppUrl(product: Product, price: number, lang: string, whatsappNumber: string): string {
  const message = lang === "ar"
    ? encodeURIComponent(
        `مرحباً! أنا مهتم بطلب:\n\n*${product.name}*\nالسعر: $${price.toFixed(2)}\n\nيرجى تقديم مزيد من التفاصيل.`
      )
    : encodeURIComponent(
        `Hi! I'm interested in ordering:\n\n*${product.name}*\nPrice: $${price.toFixed(2)}\n\nPlease provide more details.`
      );
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}

export default function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const addItem = useCartStore((s) => s.addItem);
  const getWhatsAppNumber = useSettingsStore((s) => s.getWhatsAppNumber);
  const { t } = useTranslation();

  if (!open) return null;

  const price = getPrice(product.price);
  const whatsappUrl = generateWhatsAppUrl(product, price, lang, getWhatsAppNumber());
  const categoryLabel = product.category?.name || "غير محدد";

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price,
        imageUrl: product.imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleBackdropClick}
      dir={dir}
    >
      <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl border border-mad-border bg-mad-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-mad-dark/80 text-mad-text-secondary hover:text-mad-text-primary transition-colors"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-mad-dark overflow-hidden rounded-t-xl sm:rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
            {!imageError ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-16 w-16 sm:h-24 sm:w-24 text-mad-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {!product.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-lg bg-red-600/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white">
                  {t("outOfStock2")}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 sm:p-6">
            <span className="mb-2 inline-block w-fit rounded-full bg-mad-cyan/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-mad-cyan">
              {categoryLabel}
            </span>

            <h2 className="text-lg sm:text-xl font-bold text-mad-text-primary mb-2">
              {product.name}
            </h2>

            {product.description && (
              <p className="text-xs sm:text-sm text-mad-text-secondary mb-3 sm:mb-4">
                {product.description}
              </p>
            )}

            <div className="mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-mad-cyan">
                ${price.toFixed(2)}
              </span>
            </div>

            {product.isAvailable && (
              <div className="mb-4 sm:mb-6">
                <p className="mb-2 text-xs sm:text-sm font-medium text-mad-text-primary">
                  {t("quantity") || "الكمية"}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-mad-border bg-mad-dark text-mad-text-secondary hover:text-mad-text-primary transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 sm:w-12 text-center text-base sm:text-lg font-semibold text-mad-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-mad-border bg-mad-dark text-mad-text-secondary hover:text-mad-text-primary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2.5 sm:space-y-3">
              {product.isAvailable && (
                <button
                  onClick={handleAddToCart}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all ${
                    added
                      ? "bg-green-500"
                      : "bg-mad-cyan hover:bg-mad-cyan-light hover:shadow-lg hover:shadow-mad-cyan/25"
                  }`}
                >
                  {added ? (
                    <>
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t("addedToCart")}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      {t("addToCart")}
                    </>
                  )}
                </button>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {t("orderViaWhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
