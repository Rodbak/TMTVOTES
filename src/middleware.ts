import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/jwt";

/**
 * Cheap gate: cookie must exist and look like a JWT.
 * Full signature verification still happens in `getSessionAdmin()` and the API routes.
 * (Keeps the middleware Edge-bundle small.)
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token || token.split(".").length !== 3) {
    const url = new URL("/admin", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/topics/:path*"],
};
