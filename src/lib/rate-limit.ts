type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

/** Simple fixed-window rate limiter (per-process). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterMs: Math.max(0, b.reset - now) };
  }
  b.count += 1;
  return { ok: true };
}
