import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/jwt";
import { assertSameOrigin } from "@/lib/request-guards";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
