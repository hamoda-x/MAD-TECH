"use client";

import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface MaintenancePageProps {
  storeName?: string;
  message?: string;
}

export default function MaintenancePage({
  storeName = "MAD_TECH",
  message,
}: MaintenancePageProps) {
  const dir = useLanguageStore((s) => s.dir);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-mad-dark" dir={dir}>
      <div className="text-center max-w-md">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10">
          <svg
            className="h-12 w-12 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4 font-ethnocentric text-mad-text-primary">
          {storeName}
        </h1>

        <h2 className="text-xl font-semibold mb-2 text-mad-text-primary">
          {t("storeUnderMaintenance")}
        </h2>

        <p className="mb-8 text-mad-text-secondary">
          {message || t("maintenanceDefault")}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-mad-text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          {t("maintenanceInProgress")}
        </div>
      </div>
    </div>
  );
}
