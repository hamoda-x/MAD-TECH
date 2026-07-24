"use client";

import { useLanguageStore } from "@/store/languageStore";

export function useTranslation() {
  const t = useLanguageStore((s) => s.t);
  return { t };
}
