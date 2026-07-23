"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReports } from "@/lib/api";
import { ReportsData, formatDate, formatPrice } from "@/types";
import StatsCard from "@/components/admin/StatsCard";
import Loader from "@/components/shared/Loader";
import Button from "@/components/shared/Button";

export default function AdminDashboardPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReports()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "فشل تحميل البيانات")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="جاري تحميل لوحة التحكم..." />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
        {error || "فشل تحميل البيانات"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mad-text">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-mad-muted">نظرة عامة على المتجر</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products">
            <Button>إدارة المنتجات</Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary">عرض الطلبات</Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="إجمالي الطلبات" value={data.totalOrders} />
        <StatsCard
          title="إجمالي الإيرادات"
          value={formatPrice(data.totalRevenue)}
        />
        <StatsCard
          title="طلبات معلقة"
          value={data.pendingOrders}
          accent="text-amber-400"
        />
        <StatsCard
          title="طلبات مكتملة"
          value={data.completedOrders}
          accent="text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-mad-border bg-mad-surface">
          <div className="border-b border-mad-border px-6 py-4">
            <h2 className="font-semibold text-mad-text">آخر الطلبات</h2>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد طلبات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mad-border text-mad-muted">
                    <th className="px-6 py-3 text-right">#</th>
                    <th className="px-6 py-3 text-right">المبلغ</th>
                    <th className="px-6 py-3 text-right">المنتجات</th>
                    <th className="px-6 py-3 text-right">الحالة</th>
                    <th className="px-6 py-3 text-right">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mad-border">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-3 font-mono text-xs text-mad-muted">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-mad-accent">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-3 text-mad-text">{order.itemCount}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            order.status === "COMPLETED"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-mad-muted">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-mad-border bg-mad-surface">
          <div className="border-b border-mad-border px-6 py-4">
            <h2 className="font-semibold text-mad-text">الأكثر مبيعاً</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد بيانات بعد</p>
          ) : (
            <div className="divide-y divide-mad-border">
              {data.topProducts.map((product, i) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mad-accent/10 text-sm font-bold text-mad-accent">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-mad-text">{product.name}</p>
                      <p className="text-xs text-mad-muted">
                        {product.quantity} قطعة
                      </p>
                    </div>
                  </div>
                  <span className="text-mad-accent">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
