/**
 * Sanitizes input strings against XSS and injection
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Strips MongoDB operator injection keys ($where, $gt, etc.) and prototype pollution keys
 */
export function sanitizeObject<T = any>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as unknown as T;
  }

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Block Prototype Pollution
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }

    // Block Mongo Operator Injection from client
    if (key.startsWith("$")) {
      continue;
    }

    cleaned[key] = typeof value === "object" ? sanitizeObject(value) : value;
  }

  return cleaned as T;
}
