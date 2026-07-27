import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userAgent = request.headers.get("user-agent") || null;

    await prisma.visitor.create({
      data: {
        path: body.path || "/",
        userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/visitors failed:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayCount, weekCount, totalCount] = await Promise.all([
      prisma.visitor.count({ where: { date: { gte: todayStart } } }),
      prisma.visitor.count({ where: { date: { gte: weekAgo } } }),
      prisma.visitor.count(),
    ]);

    const dailyVisits = await prisma.visitor.groupBy({
      by: ["date"],
      where: { date: { gte: weekAgo } },
      _count: true,
      orderBy: { date: "asc" },
    });

    const dailyData = dailyVisits.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      count: d._count,
    }));

    return NextResponse.json({ todayCount, weekCount, totalCount, dailyData });
  } catch (error) {
    console.error("GET /api/visitors failed:", error);
    return NextResponse.json({ todayCount: 0, weekCount: 0, totalCount: 0, dailyData: [] });
  }
}
