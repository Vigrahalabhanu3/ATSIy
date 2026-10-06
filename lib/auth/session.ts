import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./jwt";

export const AUTH_COOKIE_NAME = "atsly_token";
export const SESSION_INDICATOR_COOKIE = "atsly_session";

export async function getAuthenticatedUser(req?: Request): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    // 1. Check Authorization Bearer header first
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    // 2. NextRequest cookies object if available
    if (!token && "cookies" in req && typeof (req as any).cookies?.get === "function") {
      token = (req as any).cookies.get(AUTH_COOKIE_NAME)?.value;
    }

    // 3. Raw Cookie header parsing
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const matches = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`));
        if (matches && matches[1]) {
          token = decodeURIComponent(matches[1].trim());
        }
      }
    }
  }

  // 4. Fallback to next/headers cookies() in server components / route handlers
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Not in a request cookies() context
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(response: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60; // 7 days

  // Primary HttpOnly authentication cookie
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Client-accessible session presence indicator
  response.cookies.set({
    name: SESSION_INDICATOR_COOKIE,
    value: "active",
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: SESSION_INDICATOR_COOKIE,
    value: "",
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function createAuthCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    isProd ? "; Secure" : ""
  }`;
}

export function clearAuthCookieHeader(): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
    isProd ? "; Secure" : ""
  }`;
}
