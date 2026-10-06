import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/analyze",
  "/my-analyses",
  "/analyses",
  "/resume-library",
  "/library",
  "/reports",
  "/settings",
  "/results",
  "/pricing",
];

const AUTH_PAGES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("atsly_token")?.value;
  const ip = getClientIp(req.headers);

  // 1. API Rate Limiting for sensitive endpoints
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
      const limit = checkRateLimit(`auth:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 });
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Too many authentication attempts. Please try again in 15 minutes.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limit.retryAfterSeconds || 60),
            },
          }
        );
      }
    } else if (pathname === "/api/analyses" && req.method === "POST") {
      const limit = checkRateLimit(`analyses:${ip}`, { windowMs: 5 * 60 * 1000, max: 20 });
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "You have triggered too many analyses in a short window. Please wait a few minutes.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limit.retryAfterSeconds || 60),
            },
          }
        );
      }
    } else if (pathname === "/api/resumes" && req.method === "POST") {
      const limit = checkRateLimit(`resumes:${ip}`, { windowMs: 5 * 60 * 1000, max: 30 });
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Too many resume uploads. Please wait a few moments before uploading again.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limit.retryAfterSeconds || 60),
            },
          }
        );
      }
    }
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // 2. If trying to access protected route without cookie, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If logged in and visiting login or signup page, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const res = NextResponse.next();

  // Add security headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analyze/:path*",
    "/my-analyses/:path*",
    "/analyses/:path*",
    "/resume-library/:path*",
    "/library/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/results/:path*",
    "/pricing/:path*",
    "/login",
    "/signup",
    "/api/auth/login",
    "/api/auth/register",
    "/api/analyses",
    "/api/resumes",
  ],
};
