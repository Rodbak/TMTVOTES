import { NextResponse } from "next/server";
import { listPublicTopics } from "@/lib/topics-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topics = await listPublicTopics();
    return NextResponse.json({ topics });
  } catch (e) {
    console.error("/api/topics", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
