"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useSettingsStore } from "@/store/settingsStore";

interface MADTechHeaderProps {
  onSearchOpen?: () => void;
}

export default function MADTechHeader({ onSearchOpen }: MADTechHeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { lang, setLang, dir } = useLanguageStore();
  const { t } = useTranslation();
  const getStoreName = useSettingsStore((s) => s.getStoreName);
  const storeName = getStoreName();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
  };

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/?category=GPU#featured", label: t("catGPU") },
    { href: "/?category=CPU#featured", label: t("catCPU") },
    { href: "/?category=RAM#featured", label: t("catRAM") },
    { href: "/?category=STORAGE#featured", label: t("catStorage") },
    { href: "/?category=OTHER#featured", label: t("catOther") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-mad-dark/95 backdrop-blur-xl shadow-lg shadow-black/30 border-b border-mad-border"
          : "bg-transparent"
      }`}
      dir={dir}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          {/* Right Side - Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-mad-cyan to-mad-purple rounded-xl flex items-center justify-center shadow-lg shadow-mad-cyan/30 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-lg sm:text-xl leading-none">MT</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-mad-cyan to-mad-purple bg-clip-text text-transparent hidden sm:block">
              {storeName || "MAD-TECH"}
            </span>
          </Link>

          {/* Center - Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-mad-cyan/10 text-mad-cyan"
                    : "text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Left Side - Actions */}
          <div className="flex items-center gap-2" dir="ltr">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-mad-text-secondary hover:text-mad-cyan hover:bg-mad-cyan/10 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-mad-cyan text-mad-dark text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-mad-cyan/30 animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="p-2.5 rounded-xl text-mad-text-secondary hover:text-mad-cyan hover:bg-mad-cyan/10 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-mad-dark-hover/80 text-mad-text-secondary hover:text-mad-cyan hover:bg-mad-cyan/10 transition-all duration-200 border border-mad-border hover:border-mad-cyan/30"
            >
              {lang === "ar" ? "AR" : "EN"}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-mad-text-secondary hover:text-mad-cyan hover:bg-mad-cyan/10 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden bg-mad-dark/98 backdrop-blur-xl border-t border-mad-border animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-mad-cyan/10 text-mad-cyan"
                    : "text-mad-text-secondary hover:text-mad-text-primary hover:bg-mad-dark-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
