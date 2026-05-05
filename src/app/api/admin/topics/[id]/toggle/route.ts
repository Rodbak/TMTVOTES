import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const existing = await prisma.topic.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const next =
    existing.status === TopicStatus.ACTIVE
      ? TopicStatus.CLOSED
      : TopicStatus.ACTIVE;

  const topic = await prisma.topic.update({
    where: { id: params.id },
    data: { status: next },
  });

  return NextResponse.json({ ok: true, topic });
}
