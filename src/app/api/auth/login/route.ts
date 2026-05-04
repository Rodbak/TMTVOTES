import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signAdminToken, COOKIE, COOKIE_MAX_AGE } from "@/lib/jwt";
import { loginBodySchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/request-guards";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials payload" },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  const ok = await verifyPassword(password, admin.hashedPassword);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
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
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
