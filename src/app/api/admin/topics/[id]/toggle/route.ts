import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { assertSameOrigin } from "@/lib/request-guards";

type Ctx = { params: { id: string } };

export async function POST(request: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const status = (body as { status?: string })?.status;
  if (status !== "ACTIVE" && status !== "CLOSED" && status !== "DRAFT") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const topic = await prisma.topic.update({
    where: { id },
    data: { status: status as TopicStatus },
    include: { options: true, _count: { select: { votes: true } } },
  });
  return NextResponse.json({ topic });
}
