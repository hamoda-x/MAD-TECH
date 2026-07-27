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
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

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

async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const countToday = await prisma.order.count({
    where: {
      createdAt: { gte: todayStart, lt: todayEnd },
    },
  });

  const seq = String(countToday + 1).padStart(4, "0");
  return `MT-${dateStr}-${seq}`;
}

function buildWhatsAppMessage(
  orderNumber: string,
  items: OrderCartItem[],
  totalAmount: number,
  customerName?: string,
  customerPhone?: string,
  customerAddress?: string
) {
  const lines = [
    "*MAD_TECH - طلب جديد*",
    "",
    `*رقم الطلب: ${orderNumber}*`,
    "",
  ];

  if (customerName || customerPhone || customerAddress) {
    lines.push("*بيانات العميل:*");
    if (customerName) lines.push(`الاسم: ${customerName}`);
    if (customerPhone) lines.push(`الجوال: ${customerPhone}`);
    if (customerAddress) lines.push(`العنوان: ${customerAddress}`);
    lines.push("");
  }

  lines.push("*تفاصيل المنتجات:*");
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(`   الكمية: ${item.quantity} | السعر: $${item.price.toFixed(2)}`);
  });

  lines.push("");
  lines.push(`*الإجمالي: $${totalAmount.toFixed(2)}*`);
  lines.push("");
  lines.push("شكراً لاختياركم MAD_TECH!");

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
    const maintenance = await checkMaintenance();
    if (maintenance) {
      return NextResponse.json(
        { error: "المتجر مغلق للصيانة", maintenance: true },
        { status: 503 }
      );
    }

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

    let whatsappNumber: string | null = null;
    try {
      const settings = await prisma.storeSettings.findUnique({
        where: { id: "singleton" },
        select: { whatsappNumber: true },
      });
      whatsappNumber = settings?.whatsappNumber || null;
    } catch {
      whatsappNumber = null;
    }
    if (!whatsappNumber) {
      whatsappNumber = process.env.WHATSAPP_NUMBER || null;
    }
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

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName?.trim() || null,
        customerPhone: body.customerPhone?.trim() || null,
        customerAddress: body.customerAddress?.trim() || null,
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

    const message = buildWhatsAppMessage(
      orderNumber,
      body.items,
      totalAmount,
      body.customerName,
      body.customerPhone,
      body.customerAddress
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
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
