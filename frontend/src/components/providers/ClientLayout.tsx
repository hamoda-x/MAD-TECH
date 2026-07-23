"use client";

import { useEffect } from "react";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { useThemeStore } from "@/store/themeStore";
import { useDirectionStore } from "@/store/directionStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const isRtl = useDirectionStore((s) => s.isRtl);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", isRtl ? "rtl" : "ltr");
    root.setAttribute("lang", isRtl ? "ar" : "en");
  }, [isRtl]);

  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
