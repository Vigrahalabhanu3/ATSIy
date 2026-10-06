import { NextResponse } from "next/server";
import { clearAuthCookieHeader } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: { message: "Successfully logged out." },
  });

  response.headers.set("Set-Cookie", clearAuthCookieHeader());
  return response;
}
