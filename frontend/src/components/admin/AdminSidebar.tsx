"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/orders", label: "الطلبات", icon: "🛒" },
  { href: "/admin/reports", label: "التقارير", icon: "📈" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useThemeStore();

  const NavContent = () => (
    <>
      <div className="border-b border-mad-border p-6">
        <Link href="/admin" className="text-xl font-bold text-mad-accent">
          MAD<span className="text-mad-text">_TECH</span>
        </Link>
        <p className="mt-1 text-xs text-mad-muted">لوحة تحكم المدير</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-mad-accent/10 text-mad-accent"
                  : "text-mad-muted hover:bg-mad-border/50 hover:text-mad-text"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-mad-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="truncate text-sm text-mad-text">
            {session?.user?.name || "مدير"}
          </p>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
            aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg border border-mad-border px-4 py-2 text-sm text-mad-muted transition-colors hover:border-red-500 hover:text-red-400"
        >
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-mad-border bg-mad-surface p-2 text-mad-muted lg:hidden hover:text-mad-text"
        aria-label="فتح القائمة"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-l border-mad-border bg-mad-surface transition-transform lg:relative lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
