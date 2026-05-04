import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { topicCreateSchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/request-guards";
import { closeExpiredTopics } from "@/lib/topics";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await closeExpiredTopics();
  const topics = await prisma.topic.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      options: { orderBy: { optionText: "asc" } },
      _count: { select: { votes: true } },
    },
  });
  return NextResponse.json({ topics });
}

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = topicCreateSchema.safeParse(body);
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
  const topic = await prisma.topic.create({
    data: {
      title: d.title,
      description: d.description,
      status: d.status as TopicStatus,
      featured: d.featured ?? false,
      startDate: parseDate(d.startDate),
      endDate: parseDate(d.endDate),
      options: {
        create: d.options.map((text) => ({ optionText: text, voteCount: 0 })),
      },
    },
    include: { options: true },
  });
  return NextResponse.json({ topic });
}
