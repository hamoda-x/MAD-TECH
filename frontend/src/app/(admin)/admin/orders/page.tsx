"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { Order, formatDate, formatPrice } from "@/types";
import Loader from "@/components/shared/Loader";
import StatsCard from "@/components/admin/StatsCard";
import Modal from "@/components/shared/Modal";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED";

const statsIcons = {
  total: (
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
  pending: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

const statusOptions = [
  { value: "ALL", label: "جميع الحالات" },
  { value: "PENDING", label: "معلق" },
  { value: "COMPLETED", label: "مكتمل" },
];

const mockCustomers = [
  { name: "محمد أحمد", phone: "091 234 5678", address: "طرابلس, ليبيا" },
  { name: "سارة علي", phone: "092 345 6789", address: "بنغازي, ليبيا" },
  { name: "خالد حسن", phone: "093 456 7890", address: "misrata, ليبيا" },
  { name: "ريم يوسف", phone: "094 567 8901", address: "زنتان, ليبيا" },
  { name: "عمر الخطيب", phone: "095 678 9012", address: "الزاوية, ليبيا" },
];

const statusSteps = [
  { key: "payment", label: "تم الدفع" },
  { key: "confirm", label: "تم تأكيد الطلب" },
  { key: "collect", label: "تم جمع الطلب" },
  { key: "deliver", label: "تم تسليم الطلب" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ order: Order; customerIdx: number } | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompleteOrder = useCallback(async (orderId: string) => {
    try {
      setCompletingOrderId(orderId);
      await updateOrderStatus(orderId, "COMPLETED");
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث حالة الطلب");
    } finally {
      setCompletingOrderId(null);
    }
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    return orders.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(search.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }, [orders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCustomer = (index: number) => mockCustomers[index % mockCustomers.length];

  const getCompletedSteps = (order: Order) => {
    if (order.status === "COMPLETED") return statusSteps.length;
    if (order.status === "PENDING") return 1;
    return 0;
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filteredOrders.map((order, idx) => {
      const customer = getCustomer(idx);
      return {
        "رقم الطلب": `#${order.id.slice(0, 12)}`,
        "العميل": customer.name,
        "الهاتف": customer.phone,
        "العنوان": customer.address,
        "عدد المنتجات": order.items.length,
        "المنتجات": order.items.map((i) => i.productName).join(", "),
        "المجموع": Number(order.totalAmount),
        "الحالة": order.status === "COMPLETED" ? "مكتمل" : "معلق",
        "التاريخ": new Date(order.createdAt).toLocaleDateString("ar-JO"),
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
    ws["!cols"] = [
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 12 },
      { wch: 35 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
    ];
    XLSX.writeFile(wb, "orders-export.xlsx");
    setExportMenuOpen(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Orders Report - MAD_TECH", 14, 20);
    doc.setFontSize(10);
    doc.text("Generated: " + new Date().toLocaleDateString("en-US"), 14, 28);

    const tableData = filteredOrders.map((order, idx) => {
      const customer = getCustomer(idx);
      return [
        `#${order.id.slice(0, 12)}`,
        customer.name,
        customer.phone,
        order.items.length.toString(),
        "$" + Number(order.totalAmount).toFixed(2),
        order.status === "COMPLETED" ? "Completed" : "Pending",
        new Date(order.createdAt).toLocaleDateString("en-US"),
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [["Order ID", "Customer", "Phone", "Items", "Total", "Status", "Date"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("orders-export.pdf");
    setExportMenuOpen(false);
  };

  if (loading) return <Loader label="جاري تحميل الطلبات..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-mad-muted">
            <a href="/admin" className="hover:text-mad-accent">لوحة التحكم</a>
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-mad-text">الطلبات</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-mad-text">الطلبات</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="إجمالي الطلبات"
          value={stats.total}
          change="+12% عن الشهر الماضي"
          changeType="positive"
          icon={statsIcons.total}
        />
        <StatsCard
          title="الإيرادات"
          value={formatPrice(stats.totalRevenue)}
          change="+18% عن الشهر الماضي"
          changeType="positive"
          accent="text-green-500"
          icon={statsIcons.revenue}
        />
        <StatsCard
          title="الطلبات المكتملة"
          value={stats.completed}
          change="+25% عن الشهر الماضي"
          changeType="positive"
          accent="text-blue-500"
          icon={statsIcons.completed}
        />
        <StatsCard
          title="الطلبات المعلقة"
          value={stats.pending}
          change="— 0% عن الشهر الماضي"
          changeType="negative"
          accent="text-red-500"
          icon={statsIcons.pending}
        />
      </div>

      <div className="rounded-2xl border border-mad-border bg-mad-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-mad-border p-4">
          <div className="flex items-center gap-2">
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-mad-border px-4 py-2.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
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
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-mad-border bg-mad-surface shadow-xl">
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
            <button
              onClick={loadOrders}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3">
            <select
              id="orderStatusFilter"
              name="orderStatusFilter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
              className="rounded-xl border border-mad-border bg-mad-bg px-4 py-2.5 text-sm text-mad-text outline-none transition-colors focus:border-mad-accent"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
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
                id="searchOrders"
                name="searchOrders"
                placeholder="ابحث برقم الطلب أو اسم المنتج..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-mad-border bg-mad-bg py-2.5 pr-10 pl-4 text-sm text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12"><Loader /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-mad-muted">
            <svg className="mx-auto mb-4 h-12 w-12 text-mad-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة"}
          </div>
        ) : (
          <div className="divide-y divide-mad-border">
            {paginatedOrders.map((order, idx) => {
              const customer = getCustomer(idx);
              const completedSteps = getCompletedSteps(order);

              return (
                <div key={order.id} className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
                  <div className="flex items-center gap-3 lg:w-48">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mad-accent/10 text-mad-accent">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-mad-accent">
                        #{order.id.slice(0, 12)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-mad-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {formatDate(order.createdAt)}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-mad-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="font-medium text-mad-text">{customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-mad-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-mad-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>{customer.address}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="mb-3 text-xs font-medium text-mad-muted">
                      المنتجات ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mad-bg">
                            <svg className="h-5 w-5 text-mad-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-mad-text">{item.productName}</p>
                          </div>
                          <span className="text-xs text-mad-muted">× {item.quantity}</span>
                          <span className="text-sm font-medium text-mad-text">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-mad-muted">
                          + {order.items.length - 3} منتجات أخرى
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-56">
                    <p className="mb-3 text-xs font-medium text-mad-muted">حالة الطلب</p>
                    <div className="space-y-2.5">
                      {statusSteps.map((step, stepIdx) => {
                        const isCompleted = stepIdx < completedSteps;
                        return (
                          <div key={step.key} className="flex items-center gap-2.5">
                            <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                              isCompleted ? "bg-green-500 text-white" : "bg-mad-bg text-mad-muted/30"
                            }`}>
                              {isCompleted ? (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                              )}
                            </div>
                            <div>
                              <p className={`text-xs ${isCompleted ? "text-mad-text" : "text-mad-muted"}`}>
                                {step.label}
                              </p>
                              {isCompleted && (
                                <p className="text-[10px] text-mad-muted">
                                  {formatDate(order.createdAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <div className="mb-4 text-left">
                      <p className="text-xs text-mad-muted">المجموع</p>
                      <p className="text-xl font-bold text-mad-accent">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedOrder({ order, customerIdx: idx })}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-mad-border px-4 py-2.5 text-sm text-mad-text transition-colors hover:border-mad-accent hover:text-mad-accent"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        عرض التفاصيل
                      </button>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          disabled={completingOrderId === order.id}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-500 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                        >
                          {completingOrderId === order.id ? (
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          إكمال الطلب
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-text">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-mad-border px-6 py-4">
          <p className="text-sm text-mad-muted">
            عرض {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} إلى{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} من{" "}
            {filteredOrders.length} طلبات
          </p>
          <div className="flex items-center gap-3">
            <select
              id="ordersPerPage"
              name="ordersPerPage"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="rounded-lg border border-mad-border bg-mad-bg px-3 py-1.5 text-sm text-mad-text outline-none"
            >
              <option value={5}>5 لكل صفحة</option>
              <option value={10}>10 لكل صفحة</option>
              <option value={25}>25 لكل صفحة</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent disabled:opacity-40"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-mad-accent text-white"
                      : "border border-mad-border text-mad-muted hover:border-mad-accent hover:text-mad-accent"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`تفاصيل الطلب #${selectedOrder?.order.id.slice(0, 12) || ""}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-mad-text">
                  <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  بيانات العميل
                </h3>
                <div className="rounded-xl border border-mad-border bg-mad-bg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mad-accent/10 text-mad-accent">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-mad-text">{mockCustomers[selectedOrder.customerIdx % mockCustomers.length].name}</p>
                      <p className="text-xs text-mad-muted">العميل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-mad-text" dir="ltr">{mockCustomers[selectedOrder.customerIdx % mockCustomers.length].phone}</p>
                      <p className="text-xs text-mad-muted">الهاتف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-mad-text">{mockCustomers[selectedOrder.customerIdx % mockCustomers.length].address}</p>
                      <p className="text-xs text-mad-muted">العنوان</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-mad-text">
                  <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  بيانات الطلب
                </h3>
                <div className="rounded-xl border border-mad-border bg-mad-bg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mad-muted">رقم الطلب</span>
                    <span className="font-mono text-sm font-medium text-mad-accent">#{selectedOrder.order.id.slice(0, 12)}</span>
                  </div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mad-muted">التاريخ</span>
                    <span className="text-sm text-mad-text">{formatDate(selectedOrder.order.createdAt)}</span>
                  </div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mad-muted">الحالة</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedOrder.order.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {selectedOrder.order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                    </span>
                  </div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mad-muted">عدد المنتجات</span>
                    <span className="text-sm text-mad-text">{selectedOrder.order.items.length}</span>
                  </div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-mad-text">المجموع</span>
                    <span className="text-lg font-bold text-mad-accent">{formatPrice(selectedOrder.order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-mad-text">
                <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                المنتجات
              </h3>
              <div className="overflow-hidden rounded-xl border border-mad-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mad-border bg-mad-bg">
                      <th className="px-4 py-3 text-right text-xs font-medium text-mad-muted">المنتج</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-mad-muted">الكمية</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-mad-muted">السعر</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-mad-muted">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mad-border">
                    {selectedOrder.order.items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-mad-bg/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mad-bg">
                              <svg className="h-5 w-5 text-mad-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-mad-text">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-mad-text">{item.quantity}</td>
                        <td className="px-4 py-3 text-center text-sm text-mad-text">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3 text-left text-sm font-medium text-mad-text">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-mad-border bg-mad-bg">
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-mad-text">المجموع الكلي</td>
                      <td className="px-4 py-3 text-left text-lg font-bold text-mad-accent">{formatPrice(selectedOrder.order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-mad-text">
                <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                تاريخ ووقت الطلب
              </h3>
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mad-accent/10 text-mad-accent">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-mad-muted">التاريخ</p>
                      <p className="text-sm font-medium text-mad-text">{new Date(selectedOrder.order.createdAt).toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-mad-muted">الوقت</p>
                      <p className="text-sm font-medium text-mad-text" dir="ltr">{new Date(selectedOrder.order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
