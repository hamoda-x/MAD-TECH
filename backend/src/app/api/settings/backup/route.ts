import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [settings, admin, products, orders, orderItems] = await Promise.all([
      prisma.storeSettings.findUnique({ where: { id: "singleton" } }),
      prisma.admin.findMany({ select: { id: true, username: true, passwordHash: true } }),
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
    ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: {
        settings,
        admin,
        products,
        orders,
        orderItems,
      },
    };

    const jsonContent = JSON.stringify(backup, null, 2);
    const filename = `mad-tech-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/settings/backup failed:", error);
    return NextResponse.json(
      { error: "Failed to create backup." },
      { status: 500 }
    );
  }
}

interface BackupData {
  version: string;
  createdAt: string;
  data: {
    settings?: Record<string, unknown> | null;
    admin?: Array<{ id: string; username: string; passwordHash: string }>;
    products?: Array<Record<string, unknown>>;
    orders?: Array<Record<string, unknown>>;
    orderItems?: Array<Record<string, unknown>>;
  };
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { backupData?: string };
    if (!body.backupData) {
      return NextResponse.json(
        { error: "Backup data is required." },
        { status: 400 }
      );
    }

    let backup: BackupData;
    try {
      backup = JSON.parse(body.backupData) as BackupData;
    } catch {
      return NextResponse.json(
        { error: "Invalid backup file format." },
        { status: 400 }
      );
    }

    if (!backup.data) {
      return NextResponse.json(
        { error: "Invalid backup structure." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.product.deleteMany();

      if (backup.data.settings) {
        const s = backup.data.settings;
        await tx.storeSettings.upsert({
          where: { id: "singleton" },
          update: {
            storeName: (s.storeName as string) || "MAD_TECH",
            storeDescription: (s.storeDescription as string) || null,
            whatsappNumber: (s.whatsappNumber as string) || "218910211234",
            maintenanceMode: (s.maintenanceMode as boolean) ?? false,
            maintenanceMessage: (s.maintenanceMessage as string) || null,
            primaryColor: (s.primaryColor as string) || "#0891b2",
            currency: (s.currency as string) || "USD",
          },
          create: {
            id: "singleton",
            storeName: (s.storeName as string) || "MAD_TECH",
            storeDescription: (s.storeDescription as string) || null,
            whatsappNumber: (s.whatsappNumber as string) || "218910211234",
            maintenanceMode: (s.maintenanceMode as boolean) ?? false,
            maintenanceMessage: (s.maintenanceMessage as string) || null,
            primaryColor: (s.primaryColor as string) || "#0891b2",
            currency: (s.currency as string) || "USD",
          },
        });
      }

      if (backup.data.admin && backup.data.admin.length > 0) {
        for (const a of backup.data.admin) {
          await tx.admin.upsert({
            where: { username: a.username },
            update: { passwordHash: a.passwordHash },
            create: { id: a.id, username: a.username, passwordHash: a.passwordHash },
          });
        }
      }

      if (backup.data.products && backup.data.products.length > 0) {
        for (const p of backup.data.products) {
          await tx.product.create({
            data: {
              id: p.id as string,
              name: p.name as string,
              description: p.description as string,
              price: p.price as number,
              imageUrl: p.imageUrl as string,
              category: p.category as never,
              isAvailable: (p.isAvailable as boolean) ?? true,
              createdAt: new Date(p.createdAt as string),
            },
          });
        }
      }

      if (backup.data.orders && backup.data.orders.length > 0) {
        for (const o of backup.data.orders) {
          await tx.order.create({
            data: {
              id: o.id as string,
              totalAmount: o.totalAmount as number,
              status: o.status as never,
              createdAt: new Date(o.createdAt as string),
            },
          });
        }
      }

      if (backup.data.orderItems && backup.data.orderItems.length > 0) {
        for (const item of backup.data.orderItems) {
          await tx.orderItem.create({
            data: {
              id: item.id as string,
              orderId: item.orderId as string,
              productId: (item.productId as string) || null,
              productName: item.productName as string,
              quantity: item.quantity as number,
              price: item.price as number,
            },
          });
        }
      }
    });

    return NextResponse.json({ message: "تمت الاستعادة بنجاح." });
  } catch (error) {
    console.error("POST /api/settings/backup (restore) failed:", error);
    return NextResponse.json(
      { error: "Failed to restore backup." },
      { status: 500 }
    );
  }
}
