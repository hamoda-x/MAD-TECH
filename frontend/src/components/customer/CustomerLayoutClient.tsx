"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api";
import { useSettingsStore } from "@/store/settingsStore";
import MaintenancePage from "@/components/customer/MaintenancePage";
import MADTechHeader from "@/components/customer/MADTechHeader";
import MADTechFooter from "@/components/customer/MADTechFooter";
import SearchModal from "@/components/customer/SearchModal";
import { Product } from "@/types";

export default function CustomerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, setSettings } = useSettingsStore();
  const [checking, setChecking] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const data = await getSettings();
        if (!cancelled) {
          setSettings(data);
        }
      } catch {
        // If API fails, use cached settings if available
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch {
        // Ignore errors on refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [setSettings]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mad-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mad-accent border-t-transparent" />
      </div>
    );
  }

  const isMaintenance = settings?.maintenanceMode === true;

  if (isMaintenance) {
    return (
      <MaintenancePage
        storeName={settings?.storeName}
        message={settings?.maintenanceMessage || undefined}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MADTechHeader onSearchOpen={() => setIsSearchOpen(true)} />
      <main className="flex-1 pt-16 sm:pt-[72px] md:pt-20">{children}</main>
      <MADTechFooter />

      {/* Search Modal */}
      <SearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductSelect={(product) => {
          setSelectedProduct(product);
          // You can navigate to product page or open detail modal
        }}
      />
    </div>
  );
}
