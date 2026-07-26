import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function requireAdminToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

async function isMaintenanceMode(): Promise<boolean> {
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

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const method = request.method;

    if (request.method === "OPTIONS") {
      return handleCors(request, new NextResponse(null, { status: 204 }));
    }

    const isProtectedWrite =
      pathname.startsWith("/api/products") && WRITE_METHODS.has(method);

    const isProtectedAdminRead =
      (pathname === "/api/orders" && method === "GET") ||
      pathname === "/api/reports" ||
      (pathname.startsWith("/api/orders/") && method === "PATCH");

    const isProtectedSettings =
      (pathname === "/api/settings" && method === "PUT") ||
      pathname === "/api/settings/change-password" ||
      pathname === "/api/settings/backup";

    if (isProtectedWrite || isProtectedAdminRead || isProtectedSettings) {
      const token = await requireAdminToken(request);

      if (!token) {
        return handleCors(
          request,
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
    }

    const isPublicProductsRead =
      pathname.startsWith("/api/products") && method === "GET";

    if (isPublicProductsRead) {
      const token = await requireAdminToken(request);
      if (!token) {
        const maintenance = await isMaintenanceMode();
        if (maintenance) {
          return handleCors(
            request,
            NextResponse.json(
              { error: "المتجر مغلق للصيانة", maintenance: true },
              { status: 503 }
            )
          );
        }
      }
    }

    const isPublicOrderCreate = pathname === "/api/orders" && method === "POST";
    if (isPublicOrderCreate) {
      const maintenance = await isMaintenanceMode();
      if (maintenance) {
        return handleCors(
          request,
          NextResponse.json(
            { error: "المتجر مغلق للصيانة", maintenance: true },
            { status: 503 }
          )
        );
      }
    }

    return handleCors(request, NextResponse.next());
  } catch (error) {
    console.error("Middleware error:", error);
    return handleCors(request, NextResponse.next());
  }
}

function handleCors(request: NextRequest, response: NextResponse) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  response.headers.set("Access-Control-Allow-Origin", frontendUrl);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
