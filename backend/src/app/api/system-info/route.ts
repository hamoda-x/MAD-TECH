import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const totalRecords = productCount + orderCount;

    const version = process.env.npm_package_version || "1.0.0";

    return NextResponse.json({
      dbConnected,
      serverRunning: true,
      version,
      productCount,
      orderCount,
      totalRecords,
    });
  } catch (error) {
    console.error("GET /api/system-info failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch system info." },
      { status: 500 }
    );
  }
}
