import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number | string;
  imageUrl?: string;
  categoryId?: string;
  isAvailable?: boolean;
}

function parsePrice(value: number | string): number | null {
  const price = typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(price) || price <= 0) {
    return null;
  }

  return price;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = (await request.json()) as UpdateProductBody;
    const errors: string[] = [];

    if (body.name !== undefined && !body.name.trim()) {
      errors.push("Product name cannot be empty.");
    }

    if (body.description !== undefined && !body.description.trim()) {
      errors.push("Product description cannot be empty.");
    }

    if (body.imageUrl !== undefined && !body.imageUrl.trim()) {
      errors.push("Product image URL cannot be empty.");
    }

    if (body.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });
      if (!categoryExists) {
        errors.push("Category not found.");
      }
    }

    let parsedPrice: number | undefined;
    if (body.price !== undefined) {
      const price = parsePrice(body.price);
      if (price === null) {
        errors.push("Valid product price is required.");
      } else {
        parsedPrice = price;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.description !== undefined && {
          description: body.description.trim(),
        }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl.trim() }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/products/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
