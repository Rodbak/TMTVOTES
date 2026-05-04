import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { topicUpdateSchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/request-guards";

type Ctx = { params: { id: string } };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = ctx.params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      options: { orderBy: { optionText: "asc" } },
      _count: { select: { votes: true } },
    },
  });
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ topic });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
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
  const parsed = topicUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const parseDate = (s: string | null | undefined) => {
    if (!s || !String(s).trim()) return null;
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? null : t;
  };
  const existing = await prisma.topic.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const topic = await prisma.$transaction(async (tx) => {
    if (d.options) {
      await tx.vote.deleteMany({ where: { topicId: id } });
      await tx.option.deleteMany({ where: { topicId: id } });
      await tx.option.createMany({
        data: d.options.map((text) => ({
          topicId: id,
          optionText: text,
          voteCount: 0,
        })),
      });
    }
    return tx.topic.update({
      where: { id },
      data: {
        title: d.title ?? undefined,
        description: d.description ?? undefined,
        status: (d.status as TopicStatus | undefined) ?? undefined,
        featured: d.featured ?? undefined,
        startDate:
          d.startDate === undefined
            ? undefined
            : d.startDate === null || d.startDate === ""
              ? null
              : parseDate(d.startDate),
        endDate:
          d.endDate === undefined
            ? undefined
            : d.endDate === null || d.endDate === ""
              ? null
              : parseDate(d.endDate),
      },
      include: { options: { orderBy: { optionText: "asc" } } },
    });
  });

  return NextResponse.json({ topic });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = ctx.params;
  try {
    await prisma.topic.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
