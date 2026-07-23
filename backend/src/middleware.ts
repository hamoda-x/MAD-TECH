import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function requireAdminToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export async function middleware(request: NextRequest) {
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

  if (isProtectedWrite || isProtectedAdminRead) {
    const token = await requireAdminToken(request);

    if (!token) {
      return handleCors(
        request,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }
  }

  return handleCors(request, NextResponse.next());
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
