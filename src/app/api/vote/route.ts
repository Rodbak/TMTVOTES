import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma, TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { voteBodySchema } from "@/lib/validation";
import { hashIp, hashVoterIdentifier } from "@/lib/voter-hash";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp } from "@/lib/request-utils";
import { getPublicTopic, topicIsOpenForVoting } from "@/lib/topics-service";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const ip = clientIp(request);
  const limit = rateLimit(`vote:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many votes from this network. Try again shortly.",
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = voteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { topicId, optionId, identifier, identifierType, turnstileToken } =
    parsed.data;

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      {
        error: "captcha_failed",
        message:
          turnstile.reason === "missing_token"
            ? "Please complete the human-check before voting."
            : "Captcha verification failed. Refresh and try again.",
      },
      { status: 400 },
    );
  }

  const fullTopic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { options: true },
  });
  if (!fullTopic || fullTopic.status === TopicStatus.DRAFT) {
    return NextResponse.json({ error: "topic_not_found" }, { status: 404 });
  }
  if (!topicIsOpenForVoting(fullTopic)) {
    return NextResponse.json(
      { error: "voting_closed", message: "Voting is not open for this topic." },
      { status: 400 },
    );
  }
  const option = fullTopic.options.find((o) => o.id === optionId);
  if (!option) {
    return NextResponse.json({ error: "invalid_option" }, { status: 400 });
  }

  const voterIdentifierHash = hashVoterIdentifier(identifier, identifierType);
  const ipHash = hashIp(ip);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          topicId,
          optionId,
          voterIdentifierHash,
          identifierType,
          ipHash,
        },
      });
      await tx.option.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } },
      });
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "already_voted",
          message: "You have already voted on this topic.",
        },
        { status: 409 },
      );
    }
    console.error("/api/vote", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const updated = await getPublicTopic(topicId);
  return NextResponse.json({ ok: true, topic: updated });
}
