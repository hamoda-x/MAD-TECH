import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

async function checkMaintenance(): Promise<boolean> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" },
      select: { maintenanceMode: true },
    });
    return settings?.maintenanceMode ?? false;
  } catch {
    return false;
  }
}

interface CreateProductBody {
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

function validateProductPayload(body: CreateProductBody) {
  const errors: string[] = [];

  if (!body.name?.trim()) {
    errors.push("Product name is required.");
  }

  if (!body.description?.trim()) {
    errors.push("Product description is required.");
  }

  if (!body.imageUrl?.trim()) {
    errors.push("Product image URL is required.");
  }

  if (!body.categoryId) {
    errors.push("Product category is required.");
  }

  const price = body.price !== undefined ? parsePrice(body.price) : null;
  if (price === null) {
    errors.push("Valid product price is required.");
  }

  return { errors, price };
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      const maintenance = await checkMaintenance();
      if (maintenance) {
        return NextResponse.json(
          { error: "المتجر مغلق للصيانة", maintenance: true },
          { status: 503 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const availableOnly = searchParams.get("available") === "true";

    const where: {
      categoryId?: string;
      isAvailable?: boolean;
    } = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (availableOnly) {
      where.isAvailable = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateProductBody;
    const { errors, price } = validateProductPayload(body);

    if (errors.length > 0 || price === null) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name!.trim(),
        description: body.description!.trim(),
        price,
        imageUrl: body.imageUrl!.trim(),
        categoryId: body.categoryId!,
        isAvailable: body.isAvailable ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products failed:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
