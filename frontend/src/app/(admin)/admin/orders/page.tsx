"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { Order, formatDate, formatPrice } from "@/types";
import Loader from "@/components/shared/Loader";
import Button from "@/components/shared/Button";
import { Input, Select } from "@/components/shared/Input";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

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

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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

  const handleStatusChange = async (
    id: string,
    status: "PENDING" | "COMPLETED"
  ) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader label="جاري تحميل الطلبات..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mad-text">الطلبات</h1>
        <p className="mt-1 text-sm text-mad-muted">
          {filteredOrders.length} من {orders.length} طلب
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-mad-border bg-mad-surface p-4">
          <p className="text-xs text-mad-muted">إجمالي الطلبات</p>
          <p className="mt-1 text-2xl font-bold text-mad-text">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-mad-border bg-mad-surface p-4">
          <p className="text-xs text-mad-muted">معلقة</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-mad-border bg-mad-surface p-4">
          <p className="text-xs text-mad-muted">مكتملة</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="rounded-lg border border-mad-border bg-mad-surface p-4">
          <p className="text-xs text-mad-muted">الإيرادات</p>
          <p className="mt-1 text-2xl font-bold text-mad-accent">{formatPrice(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="بحث بالرقم أو اسم المنتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: "ALL", label: "جميع الحالات" },
              { value: "PENDING", label: "معلق" },
              { value: "COMPLETED", label: "مكتمل" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-mad-border bg-mad-surface p-12 text-center text-mad-muted">
          {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-mad-border bg-mad-surface p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-mad-muted">
                    {order.id}
                  </p>
                  <p className="mt-1 text-sm text-mad-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-mad-accent">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                  </span>
                </div>
              </div>

              <ul className="mb-4 space-y-2 border-t border-mad-border pt-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-mad-muted"
                  >
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                {order.status === "PENDING" ? (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(order.id, "COMPLETED")}
                    loading={updatingId === order.id}
                  >
                    تحديد كمكتمل
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange(order.id, "PENDING")}
                    loading={updatingId === order.id}
                  >
                    إعادة للمعلق
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
