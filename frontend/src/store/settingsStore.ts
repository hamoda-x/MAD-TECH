import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreSettings } from "@/types";

interface SettingsState {
  settings: StoreSettings | null;
  loaded: boolean;
  setSettings: (settings: StoreSettings) => void;
  getStoreName: () => string;
  getWhatsAppNumber: () => string;
  isMaintenanceMode: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loaded: false,
      setSettings: (settings) => set({ settings, loaded: true }),
      getStoreName: () => get().settings?.storeName || "MAD_TECH",
      getWhatsAppNumber: () => get().settings?.whatsappNumber || "218910211234",
      isMaintenanceMode: () => get().settings?.maintenanceMode ?? false,
    }),
    {
      name: "mad-tech-settings",
      partialize: (state) => ({
        settings: state.settings,
        loaded: state.loaded,
      }),
    }
  )
);
