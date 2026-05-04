import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";

type Ctx = { params: { id: string } };

/** Audit list: hashed identifiers only (masked for display). */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = ctx.params;
  const votes = await prisma.vote.findMany({
    where: { topicId: id },
    orderBy: { votedAt: "desc" },
    select: {
      id: true,
      voterIdentifierHash: true,
      identifierType: true,
      votedAt: true,
      option: { select: { optionText: true } },
    },
  });
  const rows = votes.map((v) => ({
    id: v.id,
    identifierType: v.identifierType,
    votedAt: v.votedAt,
    choice: v.option.optionText,
    identifierMasked: `${v.voterIdentifierHash.slice(0, 6)}…${v.voterIdentifierHash.slice(-6)}`,
  }));
  return NextResponse.json({ voters: rows });
}
