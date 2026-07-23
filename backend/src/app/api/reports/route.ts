import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [orders, orderItems] = await Promise.all([
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.findMany(),
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
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/reports failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}
