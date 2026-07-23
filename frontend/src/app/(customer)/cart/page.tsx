"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/api";
import { formatPrice } from "@/types";
import CartItem from "@/components/customer/CartItem";
import WhatsAppButton from "@/components/customer/WhatsAppButton";
import Button from "@/components/shared/Button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } =
    useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const summary = useMemo(() => {
    const subtotal = getTotal();
    const itemCount = getItemCount();
    return { subtotal, itemCount };
  }, [getTotal, getItemCount]);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const result = await createOrder(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );

      setSuccess(true);
      clearCart();
      window.open(result.whatsappUrl, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إتمام الطلب");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-12">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold text-mad-text">تم إرسال طلبك بنجاح!</h1>
          <p className="mt-2 text-mad-muted">
            تم فتح واتساب لإرسال تفاصيل الطلب للمدير
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>العودة للمتجر</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-xl border border-mad-border bg-mad-surface p-12">
          <p className="text-5xl">🛒</p>
          <h1 className="mt-4 text-2xl font-bold text-mad-text">سلتك فارغة</h1>
          <p className="mt-2 text-mad-muted">أضف منتجات من المتجر للبدء</p>
          <Link href="/" className="mt-6 inline-block">
            <Button>تصفح المنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-mad-text">سلة التسوق</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-mad-border bg-mad-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-mad-text">ملخص الطلب</h2>
        
        <div className="space-y-3 border-b border-mad-border pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-mad-muted">عدد المنتجات</span>
            <span className="text-mad-text">{summary.itemCount} منتج</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mad-muted">المجموع الفرعي</span>
            <span className="text-mad-text">{formatPrice(summary.subtotal)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <span className="text-lg font-semibold text-mad-text">الإجمالي</span>
          <span className="text-2xl font-bold text-mad-accent">
            {formatPrice(summary.subtotal)}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <WhatsAppButton onClick={handleCheckout} loading={loading} />
          <Button
            variant="secondary"
            className="w-full"
            onClick={clearCart}
            disabled={loading}
          >
            تفريغ السلة
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-mad-muted">
          سيتم حفظ طلبك وتحويلك لواتساب لإرسال التفاصيل للمدير
        </p>
      </div>
    </div>
  );
}
