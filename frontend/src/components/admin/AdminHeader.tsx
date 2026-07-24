"use client";

import { useSession } from "next-auth/react";
import { useThemeStore } from "@/store/themeStore";

export default function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mad-border bg-mad-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
            aria-label="فتح القائمة"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div className="relative hidden sm:block">
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mad-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            id="searchGlobal"
            name="searchGlobal"
            placeholder="البحث عن منتج، طلب، عميل..."
            className="w-48 rounded-xl border border-mad-border bg-mad-bg py-2.5 pr-10 pl-4 text-sm text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent md:w-72 lg:w-96"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search */}
        <button
          className="sm:hidden flex h-10 w-10 items-center justify-center rounded-xl text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-accent"
          aria-label="بحث"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        <button
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-accent"
          aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}
        >
          {isDark ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-accent"
          aria-label="اللغة"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 border-r border-mad-border pr-2 sm:pr-4">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-mad-text">
              {session?.user?.name || "مدير"}
            </p>
            <p className="text-xs text-mad-muted">مدير المتجر</p>
          </div>
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-mad-accent text-sm font-bold text-white">
            {(session?.user?.name || "م")[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
