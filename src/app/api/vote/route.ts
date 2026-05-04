import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma, IdentifierType, TopicStatus } from "@prisma/client";
import { getPresentationTopicById } from "@/lib/demo-data";
import {
  demoVoterKey,
  hasDemoAlreadyVoted,
  incrementDemoVote,
  recordDemoVoter,
} from "@/lib/demo-vote-state";
import { prisma } from "@/lib/prisma";
import { isPresentationMode } from "@/lib/presentation-mode";
import { voteBodySchema } from "@/lib/validation";
import { hashVoterIdentifier } from "@/lib/voter-hash";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, assertSameOrigin } from "@/lib/request-guards";
import { closeExpiredTopics, topicIsOpenForVoting } from "@/lib/topics";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  const ip = clientIp(request);
  const rl = rateLimit(`vote:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many votes. Try again shortly.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = voteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { topicId, optionId, identifier, identifierType } = parsed.data;

  if (isPresentationMode()) {
    const topic = getPresentationTopicById(topicId);
    if (!topic || topic.status === TopicStatus.DRAFT) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    if (!topicIsOpenForVoting(topic)) {
      return NextResponse.json(
        { error: "Voting is not open for this topic" },
        { status: 400 },
      );
    }
    const option = topic.options.find((o) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }
    const voterKey = demoVoterKey(identifierType, identifier);
    if (hasDemoAlreadyVoted(topicId, voterKey)) {
      return NextResponse.json(
        {
          error: "already_voted",
          message: "You have already voted on this topic.",
        },
        { status: 409 },
      );
    }
    incrementDemoVote(topicId, optionId);
    recordDemoVoter(topicId, voterKey);
    const updated = getPresentationTopicById(topicId);
    return NextResponse.json({ ok: true, topic: updated });
  }

  await closeExpiredTopics();

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { options: true },
  });
  if (!topic || topic.status === TopicStatus.DRAFT) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }
  if (!topicIsOpenForVoting(topic)) {
    return NextResponse.json(
      { error: "Voting is not open for this topic" },
      { status: 400 },
    );
  }
  const option = topic.options.find((o) => o.id === optionId);
  if (!option) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const idType =
    identifierType === "EMAIL" ? IdentifierType.EMAIL : IdentifierType.PHONE;
  const voterIdentifierHash = hashVoterIdentifier(identifier, identifierType);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          topicId,
          optionId,
          voterIdentifierHash,
          identifierType: idType,
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
        { error: "already_voted", message: "You have already voted on this topic." },
        { status: 409 },
      );
    }
    throw e;
  }

  const updated = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { options: { orderBy: { optionText: "asc" } } },
  });

  return NextResponse.json({ ok: true, topic: updated });
}
