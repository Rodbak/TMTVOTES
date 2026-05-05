import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { createTopicSchema } from "@/lib/validation";
import { listAllTopics } from "@/lib/topics-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const topics = await listAllTopics();
  return NextResponse.json({ topics });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { title, description, options, status, featured, startDate, endDate } =
    parsed.data;

  const topic = await prisma.topic.create({
    data: {
      title,
      description: description || "",
      status: status as TopicStatus,
      featured,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      options: {
        create: options.map((label, i) => ({
          optionText: label,
          position: i,
        })),
      },
    },
    include: { options: true },
  });

  return NextResponse.json({ ok: true, topic });
}
