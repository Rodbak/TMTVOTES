import { Prisma, TopicStatus } from "@prisma/client";
import { prisma } from "./prisma";

/** Public-shaped topic the API returns; deliberately small. */
export type PublicTopic = {
  id: string;
  title: string;
  desc: string;
  options: { id: string; label: string; voteCount: number }[];
  status: "active" | "closed" | "draft";
  featured: boolean;
};

function mapStatus(s: TopicStatus): PublicTopic["status"] {
  if (s === TopicStatus.ACTIVE) return "active";
  if (s === TopicStatus.CLOSED) return "closed";
  return "draft";
}

function shape(topic: Prisma.TopicGetPayload<{ include: { options: true } }>): PublicTopic {
  return {
    id: topic.id,
    title: topic.title,
    desc: topic.description,
    status: mapStatus(topic.status),
    featured: topic.featured,
    options: topic.options
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ id: o.id, label: o.optionText, voteCount: o.voteCount })),
  };
}

/** Auto-close ACTIVE topics whose endDate is in the past. */
export async function closeExpired(): Promise<void> {
  await prisma.topic.updateMany({
    where: { status: TopicStatus.ACTIVE, endDate: { lt: new Date() } },
    data: { status: TopicStatus.CLOSED },
  });
}

export async function listPublicTopics(): Promise<PublicTopic[]> {
  await closeExpired();
  const topics = await prisma.topic.findMany({
    where: { status: { in: [TopicStatus.ACTIVE, TopicStatus.CLOSED] } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { options: true },
  });
  return topics.map(shape);
}

export async function getPublicTopic(id: string): Promise<PublicTopic | null> {
  await closeExpired();
  const t = await prisma.topic.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!t || t.status === TopicStatus.DRAFT) return null;
  return shape(t);
}

export async function listAllTopics(): Promise<PublicTopic[]> {
  const topics = await prisma.topic.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { options: true },
  });
  return topics.map(shape);
}

export function topicIsOpenForVoting(topic: {
  status: TopicStatus;
  startDate: Date | null;
  endDate: Date | null;
}): boolean {
  if (topic.status !== TopicStatus.ACTIVE) return false;
  const now = Date.now();
  if (topic.startDate && topic.startDate.getTime() > now) return false;
  if (topic.endDate && topic.endDate.getTime() < now) return false;
  return true;
}
