import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

async function getOrCreateSettings() {
  let settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { id: "singleton" },
    });
  }

  return settings;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      storeName?: string;
      storeDescription?: string;
      whatsappNumber?: string;
      maintenanceMode?: boolean;
      maintenanceMessage?: string;
      primaryColor?: string;
      currency?: string;
    };

    const settings = await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...(body.storeName !== undefined && { storeName: body.storeName.trim() }),
        ...(body.storeDescription !== undefined && { storeDescription: body.storeDescription?.trim() || null }),
        ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber.trim() }),
        ...(body.maintenanceMode !== undefined && { maintenanceMode: body.maintenanceMode }),
        ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage?.trim() || null }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.currency !== undefined && { currency: body.currency.trim() }),
      },
      create: {
        id: "singleton",
        storeName: body.storeName?.trim() || "MAD_TECH",
        storeDescription: body.storeDescription?.trim() || null,
        whatsappNumber: body.whatsappNumber?.trim() || "218910211234",
        maintenanceMode: body.maintenanceMode ?? false,
        maintenanceMessage: body.maintenanceMessage?.trim() || null,
        primaryColor: body.primaryColor || "#0891b2",
        currency: body.currency?.trim() || "USD",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/settings failed:", error);
    return NextResponse.json(
      { error: "Failed to update settings." },
      { status: 500 }
    );
  }
}
