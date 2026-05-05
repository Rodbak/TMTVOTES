import { NextResponse } from "next/server";
import { getPublicTopic } from "@/lib/topics-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    const topic = await getPublicTopic(params.id);
    if (!topic) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ topic });
  } catch (e) {
    console.error("/api/topics/[id]", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
