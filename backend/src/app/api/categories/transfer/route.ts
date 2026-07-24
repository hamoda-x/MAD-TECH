import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sourceCategoryId, targetCategoryId } = body;

    if (!sourceCategoryId || !targetCategoryId) {
      return NextResponse.json(
        { error: "Source and target category IDs are required" },
        { status: 400 }
      );
    }

    if (sourceCategoryId === targetCategoryId) {
      return NextResponse.json(
        { error: "Source and target categories cannot be the same" },
        { status: 400 }
      );
    }

    const targetCategory = await prisma.category.findUnique({
      where: { id: targetCategoryId },
    });
    if (!targetCategory) {
      return NextResponse.json(
        { error: "Target category not found" },
        { status: 404 }
      );
    }

    await prisma.product.updateMany({
      where: { categoryId: sourceCategoryId },
      data: { categoryId: targetCategoryId },
    });

    await prisma.category.delete({ where: { id: sourceCategoryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to transfer products:", error);
    return NextResponse.json(
      { error: "Failed to transfer products" },
      { status: 500 }
    );
  }
}
