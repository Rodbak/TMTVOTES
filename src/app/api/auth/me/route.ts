import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth-server";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
  return NextResponse.json({
    admin: { username: admin.username, displayName: admin.displayName },
  });
}
