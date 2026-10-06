interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for sliding window rate limiting
const store = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 60 }
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    store.set(identifier, record);
    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt: record.resetAt,
    };
  }

  existing.count += 1;

  if (existing.count > options.max) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  return {
    allowed: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
