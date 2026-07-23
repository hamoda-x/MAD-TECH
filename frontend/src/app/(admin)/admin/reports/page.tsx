"use client";

import { useEffect, useState } from "react";
import { getReports } from "@/lib/api";
import { ReportsData, formatDate, formatPrice } from "@/types";
import StatsCard from "@/components/admin/StatsCard";
import Loader from "@/components/shared/Loader";

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReports()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "فشل تحميل التقارير")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="جاري تحميل التقارير..." />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
        {error || "فشل تحميل التقارير"}
      </div>
    );
  }

  const completionRate = data.totalOrders > 0
    ? Math.round((data.completedOrders / data.totalOrders) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mad-text">التقارير</h1>
        <p className="mt-1 text-sm text-mad-muted">إحصائيات المبيعات والطلبات</p>
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
          title="نسبة الإتمام"
          value={`${completionRate}%`}
          accent="text-green-400"
        />
      </div>

      <div className="mb-6 rounded-xl border border-mad-border bg-mad-surface p-6">
        <h2 className="mb-4 font-semibold text-mad-text">ملخص الأداء</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-mad-accent">{data.totalOrders}</p>
            <p className="text-sm text-mad-muted">إجمالي الطلبات</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{data.completedOrders}</p>
            <p className="text-sm text-mad-muted">طلبات مكتملة</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{data.pendingOrders}</p>
            <p className="text-sm text-mad-muted">طلبات معلقة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

        <div className="rounded-xl border border-mad-border bg-mad-surface">
          <div className="border-b border-mad-border px-6 py-4">
            <h2 className="font-semibold text-mad-text">آخر الطلبات</h2>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-mad-muted">لا توجد طلبات بعد</p>
          ) : (
            <div className="divide-y divide-mad-border">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-mono text-xs text-mad-muted">
                      {order.id.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-mad-muted">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-mad-accent">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span
                      className={`text-xs ${
                        order.status === "COMPLETED"
                          ? "text-green-400"
                          : "text-amber-400"
                      }`}
                    >
                      {order.status === "COMPLETED" ? "مكتمل" : "معلق"}
                    </span>
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
