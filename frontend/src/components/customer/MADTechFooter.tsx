"use client";

import { useLanguageStore } from "@/store/languageStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MADTechFooter() {
  const dir = useLanguageStore((s) => s.dir);
  const getStoreName = useSettingsStore((s) => s.getStoreName);
  const storeName = getStoreName();
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-mad-border bg-mad-dark" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-mad-cyan to-mad-purple rounded-xl flex items-center justify-center shadow-lg shadow-mad-cyan/30">
              <span className="text-white font-black text-lg leading-none">MT</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-mad-cyan to-mad-purple bg-clip-text text-transparent">
              {storeName || "MAD-TECH"}
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-mad-text-secondary">
            © {new Date().getFullYear()} {storeName || "MAD-TECH"}.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
