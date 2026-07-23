import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

interface OrderCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderBody {
  items?: OrderCartItem[];
}

function buildWhatsAppMessage(items: OrderCartItem[], totalAmount: number) {
  const lines = [
    "*MAD_TECH - طلب جديد*",
    "",
    "*تفاصيل المنتجات:*",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\n   الكمية: ${item.quantity}\n   السعر: $${item.price.toFixed(2)}`
    ),
    "",
    `*الإجمالي: $${totalAmount.toFixed(2)}*`,
    "",
    "شكراً لاختياركم MAD_TECH!",
  ];

  return lines.join("\n");
}

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const serialized = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required." },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (
        !item.id ||
        !item.name?.trim() ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          { error: "Invalid cart item payload." },
          { status: 400 }
        );
      }
    }

    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp number is not configured." },
        { status: 500 }
      );
    }

    const totalAmount = body.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        totalAmount,
        items: {
          create: body.items.map((item) => ({
            productId: item.id,
            productName: item.name.trim(),
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    const message = buildWhatsAppMessage(body.items, totalAmount);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json(
      {
        orderId: order.id,
        totalAmount: Number(order.totalAmount),
        whatsappUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
