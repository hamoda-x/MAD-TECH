"use client";

import { useState } from "react";
import { useLanguageStore } from "@/store/languageStore";

interface CustomerInfoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (info: { name: string; phone: string; address: string }) => void;
  loading?: boolean;
}

export default function CustomerInfoModal({ open, onClose, onConfirm, loading = false }: CustomerInfoModalProps) {
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
  const [formErrors, setFormErrors] = useState({ name: "", phone: "", address: "" });

  if (!open) return null;

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

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(customerInfo);
      setCustomerInfo({ name: "", phone: "", address: "" });
      setFormErrors({ name: "", phone: "", address: "" });
    }
  };

  const handleClose = () => {
    setCustomerInfo({ name: "", phone: "", address: "" });
    setFormErrors({ name: "", phone: "", address: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-mad-border bg-mad-card p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mad-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-mad-text-primary">
              {lang === "ar" ? "بيانات العميل" : "Customer Information"}
            </h3>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mad-text-primary mb-2">
              {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
              className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${formErrors.name ? "border-red-500" : "border-mad-border"} text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors`}
            />
            {formErrors.name && <p className="mt-1.5 text-xs text-red-400">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-mad-text-primary mb-2">
              {lang === "ar" ? "رقم الجوال *" : "Phone Number *"}
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              placeholder={lang === "ar" ? "أدخل رقم جوالك" : "Enter your phone number"}
              className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${formErrors.phone ? "border-red-500" : "border-mad-border"} text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors`}
              dir="ltr"
            />
            {formErrors.phone && <p className="mt-1.5 text-xs text-red-400">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-mad-text-primary mb-2">
              {lang === "ar" ? "العنوان *" : "Address *"}
            </label>
            <textarea
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              placeholder={lang === "ar" ? "أدخل عنوان التوصيل" : "Enter delivery address"}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl bg-mad-dark border ${formErrors.address ? "border-red-500" : "border-mad-border"} text-mad-text-primary placeholder-mad-text-secondary focus:outline-none focus:border-mad-accent transition-colors resize-none`}
            />
            {formErrors.address && <p className="mt-1.5 text-xs text-red-400">{formErrors.address}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl border border-mad-border text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark transition-colors font-medium"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{lang === "ar" ? "تأكيد" : "Confirm"}</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
