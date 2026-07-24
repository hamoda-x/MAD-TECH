"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useLanguageStore } from "@/store/languageStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
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

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const { getWhatsAppNumber } = useSettingsStore();
  const { t } = useTranslation();
  const price = getPrice(product.price);
  const whatsappUrl = generateWhatsAppUrl(product, price, lang, getWhatsAppNumber());

  const rating = 4.5 + Math.random() * 0.5;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  return (
    <article
      className="product-card group flex flex-col overflow-hidden rounded-2xl cursor-pointer"
      dir={dir}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-mad-dark">
        {!imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-mad-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-medium text-white">
              {t("outOfStock2")}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name */}
        <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-mad-text-primary min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-mad-border"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-mad-text-secondary">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-2">
          <span className="text-lg sm:text-xl font-bold text-mad-cyan">${price.toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-4 flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-mad-dark-hover border border-mad-border px-4 py-2.5 text-sm font-medium text-mad-text-primary transition-all hover:bg-mad-cyan/10 hover:border-mad-cyan/30 hover:text-mad-cyan"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t("viewDetails")}</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition-all hover:scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
