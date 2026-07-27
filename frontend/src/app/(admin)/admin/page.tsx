"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReports, getVisitorStats } from "@/lib/api";
import { ReportsData, formatDate, formatPrice } from "@/types";
import type { VisitorData } from "@/lib/api";
import StatsCard from "@/components/admin/StatsCard";
import Loader from "@/components/shared/Loader";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statsIcons = {
  orders: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  revenue: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  completed: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  visitors: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-500",
  PENDING: "bg-amber-500/10 text-amber-500",
  CANCELLED: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "مكتمل",
  PENDING: "معلق",
  CANCELLED: "ملغي",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      getReports(),
      getVisitorStats(),
    ])
      .then(([reports, visitors]) => {
        setData(reports);
        setVisitorData(visitors);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("error"))
      )
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <Loader label={t("loading")} />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
        {error || t("error")}
      </div>
    );
  }

  return (
    <div dir={dir} className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mad-text">{t("dashboardTitle")}</h1>
          <p className="mt-1 text-xs sm:text-sm text-mad-muted">
            {t("dashboardSubtitle")}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 rounded-xl bg-mad-accent px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t("addProduct")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title={t("totalProducts")}
          value={data.totalOrders}
          icon={statsIcons.orders}
        />
        <StatsCard
          title={t("pendingOrders")}
          value={data.pendingOrders}
          accent="text-amber-500"
          icon={statsIcons.pending}
        />
        <StatsCard
          title={t("totalRevenue")}
          value={formatPrice(data.totalRevenue)}
          accent="text-green-500"
          icon={statsIcons.revenue}
        />
        <StatsCard
          title={t("totalOrders")}
          value={data.totalOrders.toLocaleString()}
          icon={statsIcons.completed}
        />
        <StatsCard
          title={lang === "ar" ? "زوار اليوم" : "Today's Visitors"}
          value={visitorData?.todayCount ?? 0}
          subtitle={lang === "ar" ? `${visitorData?.weekCount ?? 0} زائر هذا الأسبوع` : `${visitorData?.weekCount ?? 0} this week`}
          icon={statsIcons.visitors}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">{t("revenue")}</h2>
            <p className="mt-1 text-sm text-mad-muted">
              {formatPrice(data.totalRevenue)} {lang === "ar" ? "إجمالي" : "total"}
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mad-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--mad-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--mad-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--mad-surface)",
                    border: "1px solid var(--mad-border)",
                    borderRadius: "12px",
                    color: "var(--mad-text)",
                  }}
                  formatter={(value) => [`$${value}`, t("revenue")]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--mad-accent)"
                  strokeWidth={3}
                  dot={{ fill: "var(--mad-accent)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">{t("orders2")}</h2>
            <p className="mt-1 text-sm text-mad-muted">
              {data.totalOrders.toLocaleString()} {t("items")}
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ordersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mad-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--mad-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--mad-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--mad-surface)",
                    border: "1px solid var(--mad-border)",
                    borderRadius: "12px",
                    color: "var(--mad-text)",
                  }}
                  formatter={(value) => [value, t("orders2")]}
                />
                <Bar
                  dataKey="value"
                  fill="var(--mad-accent)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-mad-border bg-mad-surface">
          <div className="flex items-center justify-between border-b border-mad-border px-6 py-4">
            <h2 className="text-lg font-semibold text-mad-text">{t("recentOrders")}</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-mad-accent hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">{t("noOrdersYet")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mad-border text-mad-muted">
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">رقم الطلب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">المنتجات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mad-border">
                  {data.recentOrders.map((order, idx) => (
                    <tr key={order.id} className="transition-colors hover:bg-mad-bg/50">
                      <td className="px-6 py-4 text-mad-text">#{idx + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-mad-accent">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-mad-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusStyles[order.status] || ""
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-mad-text">
                        {order.itemCount} {t("items")}
                      </td>
                      <td className="px-6 py-4 font-medium text-mad-accent">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-mad-border bg-mad-surface">
          <div className="flex items-center justify-between border-b border-mad-border px-6 py-4">
            <h2 className="text-lg font-semibold text-mad-text">{t("topProducts")}</h2>
            <Link
              href="/admin/products"
              className="text-sm text-mad-accent hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">{t("noData")}</p>
          ) : (
            <div className="divide-y divide-mad-border">
              {data.topProducts.map((product, i) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-mad-bg/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mad-accent/10 text-sm font-bold text-mad-accent">
                      {i + 1}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mad-bg">
                      <svg className="h-6 w-6 text-mad-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-mad-text">{product.name}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-mad-text">
                      {formatPrice(product.revenue)}
                    </p>
                    <p className="text-xs text-mad-muted">
                      {product.quantity} {lang === "ar" ? "مبيعة" : "sold"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
