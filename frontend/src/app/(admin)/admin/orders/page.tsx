"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { Order, formatDate, formatPrice } from "@/types";
import Loader from "@/components/shared/Loader";
import StatsCard from "@/components/admin/StatsCard";
import Modal from "@/components/shared/Modal";
import { useLanguageStore } from "@/store/languageStore";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "CANCELLED";

export default function AdminOrdersPage() {
  const dir = useLanguageStore((s) => s.dir);
  const lang = useLanguageStore((s) => s.lang);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

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
      setCompletingId(orderId);
      await updateOrderStatus(orderId, "COMPLETED");
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث حالة الطلب");
    } finally {
      setCompletingId(null);
    }
  }, [loadOrders]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      setCancellingId(orderId);
      await updateOrderStatus(orderId, "CANCELLED");
      setShowCancelConfirm(null);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إلغاء الطلب");
    } finally {
      setCancellingId(null);
    }
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.customerPhone && order.customerPhone.includes(search)) ||
        order.items.some((item) => item.productName.toLowerCase().includes(searchLower));

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
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      totalRevenue: orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }, [orders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-600";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-amber-500/10 text-amber-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "مكتمل";
      case "CANCELLED": return "ملغي";
      default: return "معلق";
    }
  };

  if (loading) return <Loader label="جاري تحميل الطلبات..." />;

  return (
    <div className="space-y-4 sm:space-y-6" dir={dir}>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="إجمالي الطلبات" value={stats.total} icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        } />
        <StatsCard title="الإيرادات" value={formatPrice(stats.totalRevenue)} changeType="positive" accent="text-green-500" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        } />
        <StatsCard title="طلبات معلقة" value={stats.pending} changeType="negative" accent="text-amber-500" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        } />
        <StatsCard title="طلبات ملغاة" value={stats.cancelled} changeType="negative" accent="text-red-500" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        } />
      </div>

      <div className="rounded-2xl border border-mad-border bg-mad-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-mad-border p-4">
          <button onClick={loadOrders} className="flex h-10 w-10 items-center justify-center rounded-xl border border-mad-border text-mad-muted transition-colors hover:border-mad-accent hover:text-mad-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
            className="rounded-xl border border-mad-border bg-mad-bg px-4 py-2.5 text-sm text-mad-text outline-none transition-colors focus:border-mad-accent"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PENDING">معلق</option>
            <option value="COMPLETED">مكتمل</option>
            <option value="CANCELLED">ملغي</option>
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mad-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل، الهاتف..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-mad-border bg-mad-bg py-2.5 pr-10 pl-4 text-sm text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
            />
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-mad-muted">
            <svg className="mx-auto mb-4 h-12 w-12 text-mad-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mad-border text-mad-muted">
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">#</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">رقم الطلب</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">المنتجات</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">المبلغ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase">الحالة</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mad-border">
                {paginatedOrders.map((order, idx) => (
                  <tr key={order.id} className="transition-colors hover:bg-mad-bg/50">
                    <td className="px-4 py-4 text-mad-muted">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-medium text-mad-accent">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4 text-mad-text">{order.customerName || "—"}</td>
                    <td className="px-4 py-4 text-mad-muted" dir="ltr">{order.customerPhone || "—"}</td>
                    <td className="px-4 py-4 text-mad-muted">{order.items.length} منتج</td>
                    <td className="px-4 py-4 font-medium text-mad-accent">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-4 text-mad-muted text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mad-muted transition-colors hover:bg-mad-bg hover:text-mad-text"
                          title="التفاصيل"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        {order.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              disabled={completingId === order.id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-green-500 transition-colors hover:bg-green-500/10 disabled:opacity-50"
                              title="إكمال"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(order.id)}
                              disabled={cancellingId === order.id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              title="إلغاء"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-mad-border px-6 py-4">
          <p className="text-sm text-mad-muted">
            عرض {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} إلى{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} من {filteredOrders.length} طلبات
          </p>
          <div className="flex items-center gap-3">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="rounded-lg border border-mad-border bg-mad-bg px-3 py-1.5 text-sm text-mad-text outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted hover:border-mad-accent hover:text-mad-accent disabled:opacity-40">السابق</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${currentPage === page ? "bg-mad-accent text-white" : "border border-mad-border text-mad-muted hover:border-mad-accent"}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="rounded-lg border border-mad-border px-3 py-1.5 text-sm text-mad-muted hover:border-mad-accent disabled:opacity-40">التالي</button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`تفاصيل الطلب ${selectedOrder?.orderNumber || ""}`} size="xl">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-mad-text flex items-center gap-2">
                  <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  بيانات العميل
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-mad-muted">الاسم</span><span className="text-mad-text font-medium">{selectedOrder.customerName || "—"}</span></div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex justify-between"><span className="text-mad-muted">الهاتف</span><span className="text-mad-text" dir="ltr">{selectedOrder.customerPhone || "—"}</span></div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex justify-between"><span className="text-mad-muted">العنوان</span><span className="text-mad-text font-medium">{selectedOrder.customerAddress || "—"}</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-mad-text flex items-center gap-2">
                  <svg className="h-4 w-4 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
                  بيانات الطلب
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-mad-muted">رقم الطلب</span><span className="font-mono font-medium text-mad-accent">{selectedOrder.orderNumber}</span></div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex justify-between"><span className="text-mad-muted">التاريخ</span><span className="text-mad-text">{formatDate(selectedOrder.createdAt)}</span></div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex justify-between"><span className="text-mad-muted">الحالة</span><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>{getStatusLabel(selectedOrder.status)}</span></div>
                  <div className="h-px bg-mad-border" />
                  <div className="flex justify-between"><span className="text-mad-muted font-medium">المجموع</span><span className="text-lg font-bold text-mad-accent">{formatPrice(selectedOrder.totalAmount)}</span></div>
                </div>
              </div>
            </div>

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
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium text-mad-text">{item.productName}</td>
                      <td className="px-4 py-3 text-center text-sm text-mad-text">{item.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm text-mad-text">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-left text-sm font-medium text-mad-text">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-mad-border bg-mad-bg">
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-mad-text">المجموع الكلي</td>
                    <td className="px-4 py-3 text-left text-lg font-bold text-mad-accent">{formatPrice(selectedOrder.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal open={!!showCancelConfirm} onClose={() => setShowCancelConfirm(null)} title="تأكيد إلغاء الطلب" size="md">
        <div className="space-y-4">
          <p className="text-sm text-mad-muted">هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancelConfirm(null)} className="flex-1 rounded-xl border border-mad-border px-4 py-3 text-sm font-medium text-mad-text hover:bg-mad-bg transition-colors">إلغاء</button>
            <button
              onClick={() => showCancelConfirm && handleCancelOrder(showCancelConfirm)}
              disabled={!!cancellingId}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {cancellingId ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : null}
              تأكيد الإلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
