import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [orders, orderItems, totalProducts] = await Promise.all([
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.findMany(),
      prisma.product.count(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const item of orderItems) {
      const key = item.productName;
      const existing = productSales.get(key) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
      productSales.set(key, existing);
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 10).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      customerName: order.customerName,
    }));

    const now = new Date();
    const last7Days: { name: string; value: number }[] = [];
    const last7DaysOrders: { name: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      const dayOrders = orders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt < dayEnd
      );
      last7Days.push({
        name: dayLabel,
        value: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      });
      last7DaysOrders.push({
        name: dayLabel,
        value: dayOrders.length,
      });
    }

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      topProducts,
      recentOrders,
      revenueChart: last7Days,
      ordersChart: last7DaysOrders,
    });
  } catch (error) {
    console.error("GET /api/reports failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}
