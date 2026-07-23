"use client";

import { useDirectionStore } from "@/store/directionStore";
import { useThemeStore } from "@/store/themeStore";

export default function MADTechFooter() {
  const { isRtl } = useDirectionStore();
  const { isDark } = useThemeStore();

  return (
    <footer className={`mt-auto border-t border-mad-border ${
      isDark ? "bg-[#0d0d14]" : "bg-white"
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mad-accent text-xs font-bold text-white">
              MT
            </span>
            <span className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              MAD<span className="text-mad-accent">-</span>TECH
            </span>
          </div>
          <p className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            © {new Date().getFullYear()} MAD-TECH.{" "}
            {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
