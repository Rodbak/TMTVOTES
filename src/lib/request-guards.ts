import type { NextRequest } from "next/server";

/** Basic CSRF / cross-site mitigation for browser POSTs. */
export function assertSameOrigin(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const mode = request.headers.get("sec-fetch-mode");
  if (mode === "navigate") return false;
  return true;
}

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.ip ?? "unknown";
}
