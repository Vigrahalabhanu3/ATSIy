/**
 * ATSly Universal Secure API Client
 * Ensures dual-layer authentication (HttpOnly cookies + Bearer JWT token header)
 * across all network requests for resilient session management.
 */

export const TOKEN_STORAGE_KEY = "atsly_token";
export const USER_STORAGE_KEY = "atsly_user";
export const CONSENT_STORAGE_KEY = "atsly_cookie_consent";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.error("Failed to persist token to storage:", err);
  }
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error("Failed to persist user to storage:", err);
  }
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {}
}

/**
 * Universal fetch wrapper ensuring Bearer token and credentials are sent on every request
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Attach client JWT token if available
  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure JSON content-type if body is JSON string and not already specified
  if (
    init?.body &&
    typeof init.body === "string" &&
    !headers.has("Content-Type") &&
    init.body.startsWith("{")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include", // ALWAYS send HttpOnly cookies to keep session alive
  });

  return response;
}
