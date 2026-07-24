import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import translations, { type TranslationKey } from "@/lib/i18n/translations";

type Lang = "ar" | "en";
type Dir = "rtl" | "ltr";

interface LanguageState {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

function getDirection(lang: Lang): Dir {
  return lang === "ar" ? "rtl" : "ltr";
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: "ar",
      dir: "rtl",
      setLang: (lang) => {
        const dir = getDirection(lang);
        set({ lang, dir });
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.setAttribute("dir", dir);
          root.setAttribute("lang", lang);
        }
      },
      t: (key: TranslationKey) => translations[get().lang][key] || key,
    }),
    {
      name: "mad-tech-lang",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            const dir = getDirection(state.lang);
            state.dir = dir;
            if (typeof document !== "undefined") {
              const root = document.documentElement;
              root.setAttribute("dir", dir);
              root.setAttribute("lang", state.lang);
            }
          }
        };
      },
    }
  )
);
