"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguageStore } from "@/store/languageStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function HeroSection() {
  const dir = useLanguageStore((s) => s.dir);
  const { getWhatsAppNumber } = useSettingsStore();
  const whatsappNumber = getWhatsAppNumber();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-mad-dark" dir={dir}>
      {/* Background Image - Full Coverage */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/user.png"
          alt="Gaming PC Setup"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-l from-mad-dark/95 via-mad-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-mad-dark via-transparent to-mad-dark/30" />
      </div>

      {/* Content */}
      <div className="relative w-full min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl" dir={dir}>
            {/* Badge */}
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-mad-cyan/30 bg-mad-cyan/10 px-4 sm:px-5 py-2 backdrop-blur-sm animate-fade-in">
              <svg className="h-4 w-4 text-mad-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-mad-cyan">
                {t("heroTag")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] font-ethnocentric text-mad-text-primary animate-fade-in">
              {t("heroTitle1")}
              <br />
              <span className="text-glow text-mad-cyan">{t("heroTitle2")}</span>
            </h1>

            {/* Description */}
            <p className="mt-4 sm:mt-6 max-w-lg text-base sm:text-lg md:text-xl text-mad-text-secondary animate-fade-in">
              {t("heroDesc")}
            </p>

            {/* Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 animate-fade-in">
              <Link
                href="#featured"
                className="inline-flex items-center gap-2 rounded-xl bg-mad-cyan px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-mad-dark transition-all hover:bg-mad-cyan-light hover:scale-105 accent-glow"
              >
                {t("shopNow")}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn inline-flex items-center gap-2 rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:scale-105 transition-transform"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mad-dark via-mad-dark/80 to-transparent pt-8 pb-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="feature-badge flex items-center gap-3 rounded-xl p-3 sm:p-4 hover:bg-mad-cyan/5 transition-colors">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-mad-cyan/10 shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-mad-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-mad-text-primary truncate">{t("featureWarranty")}</p>
                <p className="text-[10px] sm:text-xs text-mad-text-secondary truncate">{t("featureWarrantyDesc")}</p>
              </div>
            </div>

            <div className="feature-badge flex items-center gap-3 rounded-xl p-3 sm:p-4 hover:bg-mad-cyan/5 transition-colors">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-mad-cyan/10 shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-mad-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-mad-text-primary truncate">{t("featureSupport")}</p>
                <p className="text-[10px] sm:text-xs text-mad-text-secondary truncate">{t("featureSupportDesc")}</p>
              </div>
            </div>

            <div className="feature-badge flex items-center gap-3 rounded-xl p-3 sm:p-4 hover:bg-mad-cyan/5 transition-colors">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-mad-cyan/10 shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-mad-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-mad-text-primary truncate">{t("featureFastShipping")}</p>
                <p className="text-[10px] sm:text-xs text-mad-text-secondary truncate">{t("featureFastShippingDesc")}</p>
              </div>
            </div>

            <div className="feature-badge flex items-center gap-3 rounded-xl p-3 sm:p-4 hover:bg-mad-cyan/5 transition-colors">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-mad-cyan/10 shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-mad-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-mad-text-primary truncate">{t("featureSecure")}</p>
                <p className="text-[10px] sm:text-xs text-mad-text-secondary truncate">{t("featureSecureDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
