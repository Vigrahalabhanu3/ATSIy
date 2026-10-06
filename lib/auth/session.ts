import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";

export const AUTH_COOKIE_NAME = "atsly_token";

export async function getAuthenticatedUser(req?: Request): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    // Check Authorization header first
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check Cookie header if no Bearer token
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const matches = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
        if (matches) {
          token = decodeURIComponent(matches[1]);
        }
      }
    }
  }

  // Fallback to next/headers cookies()
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Not in request context
    }
  }

  if (!token) return null;
  return verifyToken(token);
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
