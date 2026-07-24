"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { getReports } from "@/lib/api";
import { ReportsData, formatDate, formatPrice } from "@/types";
import StatsCard from "@/components/admin/StatsCard";
import Loader from "@/components/shared/Loader";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
  completed: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  avgOrder: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

const dateRanges = [
  { value: "today", label: "اليوم" },
  { value: "week", label: "هذا الأسبوع" },
  { value: "month", label: "هذا الشهر" },
  { value: "year", label: "السنة" },
];

const PIE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4"];

function filterByDateRange(orders: ReportsData["recentOrders"], range: string, dateFrom: string, dateTo: string) {
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    });
  }

  const now = new Date();
  const start = new Date();

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return orders;
  }

  return orders.filter((o) => new Date(o.createdAt) >= start);
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("week");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getReports()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "فشل تحميل التقارير")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    return filterByDateRange(data.recentOrders, dateRange, dateFrom, dateTo);
  }, [data, dateRange, dateFrom, dateTo]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, revenue: 0, completed: 0, avgOrder: 0, completionRate: 0 };

    const total = filteredOrders.length;
    const completed = filteredOrders.filter((o) => o.status === "COMPLETED").length;
    const revenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrder = total > 0 ? revenue / total : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, revenue, completed, avgOrder, completionRate };
  }, [data, filteredOrders]);

  const categorySales = useMemo(() => {
    if (!data) return [];
    const totalRevenue = data.topProducts.reduce((sum, p) => sum + p.revenue, 0);
    return data.topProducts.map((p) => ({
      name: p.name,
      value: p.revenue,
      percentage: totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0,
    }));
  }, [data]);

  const getDateRangeLabel = () => {
    if (dateFrom && dateTo) {
      return `من ${dateFrom} إلى ${dateTo}`;
    }
    const range = dateRanges.find((r) => r.value === dateRange);
    return range ? range.label : "";
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");

    const ordersSheet = filteredOrders.map((order, idx) => ({
      "#": idx + 1,
      "رقم الطلب": `#${order.id.slice(0, 12)}`,
      "التاريخ": formatDate(order.createdAt),
      "المنتجات": order.itemCount,
      "الإجمالي": Number(order.totalAmount),
      "الحالة": order.status === "COMPLETED" ? "مكتمل" : "معلق",
    }));

    const productsSheet = data?.topProducts.map((p, idx) => ({
      "#": idx + 1,
      "المنتج": p.name,
      "الكمية": p.quantity,
      "الإيراد": Number(p.revenue),
    })) || [];

    const summarySheet = [
      { "البيان": "إجمالي الطلبات", "القيمة": stats.total },
      { "البيان": "الإيرادات", "القيمة": stats.revenue },
      { "البيان": "الطلبات المكتملة", "القيمة": stats.completed },
      { "البيان": "متوسط قيمة الطلب", "القيمة": stats.avgOrder },
      { "البيان": "نسبة الإنجاز", "القيمة": stats.completionRate + "%" },
    ];

    const wb = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summarySheet);
    wsSummary["!cols"] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "ملخص");

    const wsOrders = XLSX.utils.json_to_sheet(ordersSheet);
    wsOrders["!cols"] = [{ wch: 5 }, { wch: 16 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsOrders, "الطلبات");

    const wsProducts = XLSX.utils.json_to_sheet(productsSheet);
    wsProducts["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsProducts, "المنتجات");

    XLSX.writeFile(wb, `reports-${dateRange}.xlsx`);
    setExportMenuOpen(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Reports - MAD_TECH", 14, 20);
    doc.setFontSize(10);
    doc.text("Period: " + getDateRangeLabel() + " | Generated: " + new Date().toLocaleDateString("en-US"), 14, 28);

    doc.setFontSize(12);
    doc.text("Summary", 14, 38);
    autoTable(doc, {
      startY: 42,
      head: [["Metric", "Value"]],
      body: [
        ["Total Orders", stats.total.toString()],
        ["Revenue", "$" + Number(stats.revenue).toFixed(2)],
        ["Completed", stats.completed.toString()],
        ["Avg Order", "$" + Number(stats.avgOrder).toFixed(2)],
        ["Completion Rate", stats.completionRate + "%"],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const ordersY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Recent Orders", 14, ordersY);
    autoTable(doc, {
      startY: ordersY + 4,
      head: [["#", "Order ID", "Date", "Items", "Total", "Status"]],
      body: filteredOrders.map((o, i) => [
        (i + 1).toString(),
        "#" + o.id.slice(0, 12),
        new Date(o.createdAt).toLocaleDateString("en-US"),
        o.itemCount.toString(),
        "$" + Number(o.totalAmount).toFixed(2),
        o.status === "COMPLETED" ? "Completed" : "Pending",
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const productsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Top Products", 14, productsY);
    autoTable(doc, {
      startY: productsY + 4,
      head: [["#", "Product", "Quantity", "Revenue"]],
      body: (data?.topProducts || []).map((p, i) => [
        (i + 1).toString(),
        p.name,
        p.quantity.toString(),
        "$" + Number(p.revenue).toFixed(2),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`reports-${dateRange}.pdf`);
    setExportMenuOpen(false);
  };

  if (loading) return <Loader label="جاري تحميل التقارير..." />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
        {error || "فشل تحميل التقارير"}
      </div>
    );
  }

  const completionRate = stats.completionRate;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-mad-muted">
            <a href="/admin" className="hover:text-mad-accent">لوحة التحكم</a>
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-mad-text">التقارير</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-mad-text">التقارير</h1>
        </div>
        <div ref={exportMenuRef} className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-2 rounded-xl bg-mad-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            تصدير
            <svg className={`h-4 w-4 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {exportMenuOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-mad-border bg-mad-surface shadow-xl">
              <div className="p-2">
                <button
                  onClick={handleExportExcel}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mad-text transition-colors hover:bg-mad-bg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-mad-muted">ملف .xlsx</p>
                  </div>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mad-text transition-colors hover:bg-mad-bg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-mad-muted">ملف .pdf</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {dateRanges.map((range) => {
          const isActive = dateRange === range.value;
          return (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-mad-accent text-white" : "border border-mad-border bg-mad-surface text-mad-muted hover:border-mad-accent hover:text-mad-accent"}`}
            >
              {range.label}
            </button>
          );
        })}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-mad-border bg-mad-surface px-3 py-2">
            <svg className="h-4 w-4 text-mad-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setDateRange(""); }}
              className="border-none bg-transparent text-sm text-mad-text outline-none [color-scheme:dark]"
              placeholder="من تاريخ"
            />
          </div>
          <span className="text-sm text-mad-muted">إلى</span>
          <div className="flex items-center gap-2 rounded-xl border border-mad-border bg-mad-surface px-3 py-2">
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setDateRange(""); }}
              className="border-none bg-transparent text-sm text-mad-text outline-none [color-scheme:dark]"
              placeholder="إلى تاريخ"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setDateRange("week"); }}
              className="flex items-center gap-1 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              مسح
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="إجمالي الطلبات" value={stats.total} change={getDateRangeLabel()} changeType="positive" icon={statsIcons.orders} />
        <StatsCard title="الإيرادات" value={formatPrice(stats.revenue)} change={getDateRangeLabel()} changeType="positive" accent="text-green-500" icon={statsIcons.revenue} />
        <StatsCard title="الطلبات المكتملة" value={stats.completed} change={"نسبة الإنجاز " + completionRate + "%"} changeType="positive" accent="text-blue-500" icon={statsIcons.completed} />
        <StatsCard title="متوسط قيمة الطلب" value={formatPrice(stats.avgOrder)} change={getDateRangeLabel()} changeType="positive" accent="text-purple-500" icon={statsIcons.avgOrder} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mad-text">الإيرادات</h2>
              <p className="mt-1 text-sm text-mad-accent">{formatPrice(stats.revenue)}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredOrders.length > 0 ? [
                { name: "المجموع", value: stats.revenue },
                { name: "المكتمل", value: filteredOrders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + o.totalAmount, 0) },
                { name: "المعلق", value: filteredOrders.filter((o) => o.status === "PENDING").reduce((s, o) => s + o.totalAmount, 0) },
              ] : [{ name: "لا بيانات", value: 0 }]}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mad-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--mad-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--mad-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--mad-surface)", border: "1px solid var(--mad-border)", borderRadius: "12px", color: "var(--mad-text)" }} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fill="url(#revenueGrad)" dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mad-text">عدد الطلبات</h2>
              <p className="mt-1 text-sm text-mad-accent">{stats.total}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredOrders.length > 0 ? [
                { name: "المجموع", value: stats.total },
                { name: "المكتمل", value: stats.completed },
                { name: "المعلق", value: stats.total - stats.completed },
              ] : [{ name: "لا بيانات", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mad-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--mad-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--mad-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--mad-surface)", border: "1px solid var(--mad-border)", borderRadius: "12px", color: "var(--mad-text)" }} />
                <Line type="monotone" dataKey="value" stroke="var(--mad-accent)" strokeWidth={3} dot={{ fill: "var(--mad-accent)", strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">المبيعات حسب المنتج</h2>
          </div>
          {categorySales.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد بيانات بعد</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySales} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categorySales.map((_, index) => (
                        <Cell key={"pie-" + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--mad-surface)", border: "1px solid var(--mad-border)", borderRadius: "12px", color: "var(--mad-text)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-bold text-mad-text">{formatPrice(stats.revenue)}</p>
                  <p className="text-xs text-mad-muted">إجمالي المبيعات</p>
                </div>
              </div>
              <div className="w-full space-y-2">
                {categorySales.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-mad-text">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-mad-muted">{formatPrice(item.value)}</span>
                      <span className="text-mad-muted">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-mad-border bg-mad-surface">
          <div className="flex items-center justify-between border-b border-mad-border px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-mad-text">المنتجات الأكثر مبيعاً</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد بيانات بعد</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mad-border text-mad-muted">
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">#</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">المنتج</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">النسبة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">الإيراد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mad-border">
                    {data.topProducts.map((product, i) => {
                      const totalRev = data.topProducts.reduce((s, p) => s + p.revenue, 0);
                      const pct = totalRev > 0 ? Math.round((product.revenue / totalRev) * 100) : 0;
                      return (
                        <tr key={product.name} className="transition-colors hover:bg-mad-bg/50">
                          <td className="px-6 py-4 text-mad-muted">{i + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mad-bg">
                                <svg className="h-5 w-5 text-mad-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-mad-text">{product.name}</p>
                                <p className="text-xs text-mad-muted">{product.quantity} طلب</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-24">
                              <div className="h-2 w-full rounded-full bg-mad-bg">
                                <div className="h-2 rounded-full bg-mad-accent" style={{ width: pct + "%" }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-mad-accent">{formatPrice(product.revenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-mad-border p-4">
                <Link href="/admin/products" className="flex items-center justify-center gap-2 text-sm text-mad-accent hover:underline">
                  <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  عرض جميع المنتجات
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-mad-border bg-mad-surface">
          <div className="flex items-center justify-between border-b border-mad-border px-6 py-4">
            <h2 className="text-lg font-semibold text-mad-text">الطلبات الأخيرة</h2>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد طلبات في هذه الفترة</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mad-border text-mad-muted">
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">#</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">رقم الطلب</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">التاريخ</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">المنتجات</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">الإجمالي</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mad-border">
                    {filteredOrders.map((order, idx) => (
                      <tr key={order.id} className="transition-colors hover:bg-mad-bg/50">
                        <td className="px-4 py-4 text-mad-muted">{idx + 1}</td>
                        <td className="px-4 py-4 font-mono text-xs text-mad-accent">#{order.id.slice(0, 12)}</td>
                        <td className="px-4 py-4 text-mad-muted">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-4 text-mad-text">{order.itemCount}</td>
                        <td className="px-4 py-4 font-medium text-mad-accent">{formatPrice(order.totalAmount)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "COMPLETED" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                            {order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-mad-border p-4">
                <Link href="/admin/orders" className="flex items-center justify-center gap-2 text-sm text-mad-accent hover:underline">
                  <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  عرض جميع الطلبات
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
