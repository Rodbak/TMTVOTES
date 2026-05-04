import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/jwt";

/**
 * Fast gate: cookie must exist and look like a JWT.
 * Full signature verification happens in `getSessionAdmin()` on the server.
 * (Avoids Edge bundling issues with some `jose` code paths.)
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token || token.split(".").length !== 3) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/topics/:path*"],
};
