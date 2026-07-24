"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReports } from "@/lib/api";
import { ReportsData, formatDate, formatPrice } from "@/types";
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

const revenueData = [
  { name: "03 أبريل", value: 400 },
  { name: "04 أبريل", value: 800 },
  { name: "05 أبريل", value: 600 },
  { name: "06 أبريل", value: 1200 },
  { name: "07 أبريل", value: 900 },
  { name: "08 أبريل", value: 1500 },
  { name: "09 أبريل", value: 1800 },
  { name: "10 أبريل", value: 1400 },
  { name: "11 أبريل", value: 2000 },
  { name: "12 أبريل", value: 1600 },
  { name: "13 أبريل", value: 2200 },
];

const ordersBarData = [
  { name: "07 مايو", value: 250 },
  { name: "08 مايو", value: 380 },
  { name: "09 مايو", value: 420 },
  { name: "10 مايو", value: 300 },
  { name: "11 مايو", value: 500 },
  { name: "12 مايو", value: 350 },
  { name: "13 مايو", value: 450 },
];

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
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-500",
  PENDING: "bg-amber-500/10 text-amber-500",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const { t } = useTranslation();

  useEffect(() => {
    getReports()
      .then(setData)
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
          <button className="flex items-center gap-2 rounded-xl border border-mad-border bg-mad-surface px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-mad-text transition-colors hover:border-mad-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            اليوم
          </button>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t("totalProducts")}
          value={data.totalOrders}
          change="+12% عن الشهر الماضي"
          changeType="positive"
          icon={statsIcons.orders}
        />
        <StatsCard
          title={t("pendingOrders")}
          value={data.pendingOrders}
          change="-20% عن الشهر الماضي"
          changeType="negative"
          accent="text-red-500"
          icon={statsIcons.pending}
        />
        <StatsCard
          title={t("totalRevenue")}
          value={formatPrice(data.totalRevenue)}
          change="+18% عن الشهر الماضي"
          changeType="positive"
          accent="text-green-500"
          icon={statsIcons.revenue}
        />
        <StatsCard
          title={t("totalOrders")}
          value={data.totalOrders.toLocaleString()}
          change="+18% عن الشهر الماضي"
          changeType="positive"
          icon={statsIcons.completed}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mad-text">{t("revenue")}</h2>
              <p className="mt-1 text-sm text-mad-muted">
                {formatPrice(data.totalRevenue)}
              </p>
              <p className="text-xs text-green-500">+18% عن الشهر الماضي</p>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-mad-border px-3 py-1.5 text-xs text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent">
              {t("last7days")}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mad-text">{t("orders2")}</h2>
              <p className="mt-1 text-sm text-mad-muted">
                {data.totalOrders.toLocaleString()} {t("items")}
              </p>
              <p className="text-xs text-green-500">+18% عن الشهر الماضي</p>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-mad-border px-3 py-1.5 text-xs text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent">
              {t("last7days")}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersBarData}>
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
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">المنتجات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mad-border">
                  {data.recentOrders.map((order, idx) => (
                    <tr key={order.id} className="transition-colors hover:bg-mad-bg/50">
                      <td className="px-6 py-4 text-mad-text">#{idx + 1}</td>
                      <td className="px-6 py-4 text-mad-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusStyles[order.status] || ""
                          }`}
                        >
                          {order.status === "COMPLETED" ? t("completed") : t("pending")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-mad-text">
                        {order.itemCount} {t("items")}
                      </td>
                      <td className="px-6 py-4 font-medium text-mad-accent">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-text">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                        </button>
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
                      <div className="mt-0.5 flex items-center gap-0.5">
                        {[...Array(5)].map((_, s) => (
                          <svg
                            key={s}
                            className={`h-3 w-3 ${s < 4 ? "text-amber-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-mad-text">
                      {formatPrice(product.revenue)}
                    </p>
                    <p className="text-xs text-mad-muted">
                      {product.quantity} مبيعة
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