"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, getStoredToken, setStoredUser, removeStoredToken, removeStoredUser } from "@/lib/api/client";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/analyze",
  "/my-analyses",
  "/analyses",
  "/resume-library",
  "/library",
  "/reports",
  "/settings",
  "/results",
];

const AUTH_PAGES = ["/login", "/signup"];

export default function SessionManager() {
  const pathname = usePathname();
  const router = useRouter();
  const checkingRef = useRef(false);

  useEffect(() => {
    async function verifySession() {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const isProtected = PROTECTED_ROUTES.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        );
        const isAuthPage = AUTH_PAGES.some(
          (page) => pathname === page || pathname.startsWith(`${page}/`)
        );

        // Check current session with dual-layer apiFetch (cookie + bearer header)
        const res = await apiFetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          const user = data.data?.user || data.user;
          if (user) {
            setStoredUser({ ...user, isLoggedIn: true });
          }

          // If on login/signup page and session is active, redirect to dashboard
          if (isAuthPage) {
            router.push("/dashboard");
          }
        } else if (res.status === 401) {
          // Token is invalid/expired
          removeStoredToken();
          removeStoredUser();

          // If on a protected route, redirect to login
          if (isProtected) {
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
          }
        }
      } catch (err) {
        console.warn("Session verification check error:", err);
      } finally {
        checkingRef.current = false;
      }
    }

    verifySession();
  }, [pathname, router]);

  return null;
}
