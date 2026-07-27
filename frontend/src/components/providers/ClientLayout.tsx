"use client";

import { useEffect } from "react";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import VisitorTracker from "@/components/shared/VisitorTracker";
import { useLanguageStore } from "@/store/languageStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", dir);
    root.setAttribute("lang", lang);
  }, [dir, lang]);

  return (
    <SessionProvider>
      <ThemeProvider>
        <VisitorTracker />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
