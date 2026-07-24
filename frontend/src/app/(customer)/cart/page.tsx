"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/api";
import { formatPrice } from "@/types";
import CartItem from "@/components/customer/CartItem";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const { t } = useTranslation();

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    return { subtotal, itemCount };
  }, [items]);

  const validateForm = () => {
    const errors = { name: "", phone: "", address: "" };
    let isValid = true;

    if (!customerInfo.name.trim()) {
      errors.name = lang === "ar" ? "الاسم مطلوب" : "Name is required";
      isValid = false;
    }
    if (!customerInfo.phone.trim()) {
      errors.phone = lang === "ar" ? "رقم الجوال مطلوب" : "Phone number is required";
      isValid = false;
    }
    if (!customerInfo.address.trim()) {
      errors.address = lang === "ar" ? "العنوان مطلوب" : "Address is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setShowCustomerModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;

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

      const customerDetails = `\n\nالاسم: ${customerInfo.name}\nالجوال: ${customerInfo.phone}\nالعنوان: ${customerInfo.address}`;
      const whatsappUrl = result.whatsappUrl + encodeURIComponent(customerDetails);

      setSuccess(true);
      clearCart();
      setShowCustomerModal(false);
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir={dir}>
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-12">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold text-mad-text-primary">
            {lang === "ar" ? "تم إرسال طلبك بنجاح!" : "Order submitted successfully!"}
          </h1>
          <p className="mt-2 text-mad-text-secondary">
            {lang === "ar"
              ? "تم فتح واتساب لإرسال تفاصيل الطلب للمدير"
              : "WhatsApp opened to send order details to manager"}
          </p>
          <Link href="/" className="mt-6 inline-block">
            <button className="px-6 py-3 bg-mad-accent text-mad-dark font-semibold rounded-lg hover:bg-mad-accent-light transition-colors">
              {t("backToStore")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir={dir}>
        <div className="rounded-xl border border-mad-border bg-mad-card p-12">
          <p className="text-5xl">🛒</p>
          <h1 className="mt-4 text-2xl font-bold text-mad-text-primary">
            {t("cartEmpty")}
          </h1>
          <p className="mt-2 text-mad-text-secondary">{t("cartEmptyDesc")}</p>
          <Link href="/" className="mt-6 inline-block">
            <button className="px-6 py-3 bg-mad-accent text-mad-dark font-semibold rounded-lg hover:bg-mad-accent-light transition-colors">
              {t("browseProducts")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8" dir={dir}>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content - Products Table */}
        <div className="flex-1">
          {/* Table Header */}
          <div className="hidden sm:flex items-center gap-4 sm:gap-6 py-3 border-b border-mad-border text-mad-text-secondary text-sm font-medium">
            <div className="w-24 sm:w-28 text-left">
              {lang === "ar" ? "الإجمالي" : "Total"}
            </div>
            <div className="w-28 sm:w-32 text-center">
              {lang === "ar" ? "الكمية" : "Quantity"}
            </div>
            <div className="w-24 sm:w-28 text-center">
              {lang === "ar" ? "السعر" : "Price"}
            </div>
            <div className="flex-1">
              {lang === "ar" ? "المنتج" : "Product"}
            </div>
            <div className="w-8 sm:w-9"></div>
          </div>

          {/* Cart Items */}
          <div className="divide-y divide-mad-border">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <button
              onClick={clearCart}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {t("clearCart")}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 text-mad-text-primary border border-mad-border rounded-lg hover:bg-mad-dark transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              {lang === "ar" ? "متابعة التسوق" : "Continue Shopping"}
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:w-80 xl:w-96">
          <div className="rounded-xl border border-mad-border bg-mad-card p-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-mad-text-primary">
                {lang === "ar" ? "سلة التسوق" : "Shopping Cart"}
              </h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-mad-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p className="text-center text-mad-text-secondary text-sm mb-6">
              {lang === "ar" ? "الممنتجات التي أضفتها إلى سلتك" : "Products you added to your cart"}
            </p>

            {/* Order Summary */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-mad-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-mad-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3 className="text-lg font-semibold text-mad-text-primary">
                {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h3>
            </div>

            {/* Item Count */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-mad-text-secondary">
                {lang === "ar" ? "عدد المنتجات" : "Number of products"}
              </span>
              <span className="text-mad-text-primary font-medium">
                {summary.itemCount}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-2 pt-4 border-t border-mad-border">
              <span className="text-lg font-semibold text-mad-text-primary">
                {lang === "ar" ? "الإجمالي" : "Total"}
              </span>
              <span className="text-2xl font-bold text-mad-accent">
                {formatPrice(summary.subtotal)}
              </span>
            </div>
            <p className="text-xs text-mad-text-secondary text-left mb-6">
              {lang === "ar" ? "تشمل ضريبة القيمة المضافة" : "Includes VAT"}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              <span>{lang === "ar" ? "إتمام الطلب عبر واتساب" : "Complete order via WhatsApp"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <p className="text-xs text-mad-text-secondary text-center mt-3">
              {lang === "ar" ? "تواصل معنا على واتساب لإكمال طلبك" : "Contact us on WhatsApp to complete your order"}
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-mad-border">
              <div className="w-10 h-10 rounded-full bg-mad-accent/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-mad-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-mad-text-primary">
                  {lang === "ar" ? "تسوق آمن ومضمون" : "Safe and secure shopping"}
                </h4>
                <p className="text-xs text-mad-text-secondary">
                  {lang === "ar" ? "جميع منتجاتنا أصلية مع ضمان معتمد" : "All our products are original with certified warranty"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="mt-12 pt-8 border-t border-mad-border">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-mad-text-primary">
            {lang === "ar" ? "تابعنا" : "Follow us"}
          </h3>
        </div>
        <div className="flex items-center justify-center gap-6">
          {/* Facebook */}
          <a href="#" className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          {/* TikTok */}
          <a href="#" className="w-12 h-12 rounded-full bg-[#000000] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 10.86 4.48v-7.1a8.16 8.16 0 0 0 5.58 2.18v-3.45a4.85 4.85 0 0 1-2-.88V6.69h2z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Customer Info Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCustomerModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-mad-border bg-mad-card p-6 shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mad-accent/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-mad-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-mad-text-primary">
                  {lang === "ar" ? "بيانات العميل" : "Customer Information"}
                </h3>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-mad-text-primary mb-2">
                  {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                  className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${
                    formErrors.name ? "border-red-500" : "border-mad-border"
                  } text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors`}
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-mad-text-primary mb-2">
                  {lang === "ar" ? "رقم الجوال *" : "Phone Number *"}
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder={lang === "ar" ? "أدخل رقم جوالك" : "Enter your phone number"}
                  className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${
                    formErrors.phone ? "border-red-500" : "border-mad-border"
                  } text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors`}
                  dir="ltr"
                />
                {formErrors.phone && (
                  <p className="mt-1.5 text-xs text-red-400">{formErrors.phone}</p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-mad-text-primary mb-2">
                  {lang === "ar" ? "العنوان *" : "Address *"}
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder={lang === "ar" ? "أدخل عنوان التوصيل" : "Enter delivery address"}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${
                    formErrors.address ? "border-red-500" : "border-mad-border"
                  } text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors resize-none`}
                />
                {formErrors.address && (
                  <p className="mt-1.5 text-xs text-red-400">{formErrors.address}</p>
                )}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-mad-border text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark transition-colors font-medium"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{lang === "ar" ? "تأكيد الطلب" : "Confirm Order"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
