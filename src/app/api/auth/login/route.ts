import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_OPTIONS, COOKIE, signAdminToken } from "@/lib/jwt";
import { loginBodySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp } from "@/lib/request-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: limit.retryAfterMs },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return NextResponse.json(
      { error: "invalid_credentials" },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "invalid_credentials" },
      { status: 401 },
    );
  }

  const token = await signAdminToken({
    sub: admin.id,
    username: admin.username,
    displayName: admin.displayName,
  });

  const res = NextResponse.json({
    ok: true,
    admin: { username: admin.username, displayName: admin.displayName },
  });
  res.cookies.set(COOKIE, token, ADMIN_COOKIE_OPTIONS);
  return res;
}
