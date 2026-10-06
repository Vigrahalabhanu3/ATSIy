import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: { message: "Successfully logged out." },
  });

  clearAuthCookie(response);
  return response;
}
