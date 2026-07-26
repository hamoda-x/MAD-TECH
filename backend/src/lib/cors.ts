import { NextResponse } from "next/server";

export function corsHeaders(response: NextResponse): NextResponse {
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
