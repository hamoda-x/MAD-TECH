"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useDirectionStore } from "@/store/directionStore";

const navLinks = [
  { label: "Home", labelAr: "الرئيسية", href: "/" },
  { label: "CPU", labelAr: "المعالج", href: "/?category=CPU" },
  { label: "GPU", labelAr: "الكرت الشاشة", href: "/?category=GPU" },
  { label: "RAM", labelAr: "الرام", href: "/?category=RAM" },
  { label: "MOUSE", labelAr: "الماوس", href: "/?category=PERIPHERAL" },
];

export default function MADTechHeader() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isDark, toggle } = useThemeStore();
  const { isRtl, toggleDirection } = useDirectionStore();

  return (
    <header className={`sticky top-0 z-40 border-b border-mad-border backdrop-blur-md transition-colors ${
      isDark ? "bg-[#0d0d14]/95" : "bg-white/95"
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mad-accent text-sm font-bold text-white font-ethnocentric">
            MT
          </span>
          <span className={`text-xl font-bold tracking-wider font-ethnocentric ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            MAD<span className="text-mad-accent">-</span>TECH
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-mad-accent ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {isRtl ? link.labelAr : link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDirection}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-mad-accent hover:text-mad-accent ${
              isDark 
                ? "border-gray-700 bg-gray-800 text-gray-400" 
                : "border-gray-300 bg-gray-100 text-gray-600"
            }`}
            aria-label={isRtl ? "Switch to LTR" : "Switch to RTL"}
          >
            <span className="text-xs font-bold">{isRtl ? "EN" : "عربي"}</span>
          </button>

          <button
            onClick={toggle}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-mad-accent hover:text-mad-accent ${
              isDark 
                ? "border-gray-700 bg-gray-800 text-gray-400" 
                : "border-gray-300 bg-gray-100 text-gray-600"
            }`}
            aria-label={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <Link
            href="/cart"
            className="relative flex items-center gap-2"
          >
            <svg
              className={`h-6 w-6 transition-colors hover:text-mad-accent ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-mad-accent text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
