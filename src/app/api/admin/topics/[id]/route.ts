import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { patchTopicSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const topic = await prisma.topic.update({
    where: { id: params.id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status as TopicStatus | undefined,
      featured: data.featured,
      startDate:
        data.startDate === null ? null : data.startDate ? new Date(data.startDate) : undefined,
      endDate:
        data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  return NextResponse.json({ ok: true, topic });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  await prisma.topic.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
