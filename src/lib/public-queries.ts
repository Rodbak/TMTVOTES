import { TopicStatus } from "@prisma/client";
import {
  getPresentationTopicById,
  getPresentationTopicsActive,
  getPresentationTopicsClosed,
} from "./demo-data";
import { prisma } from "./prisma";
import { isPresentationMode } from "./presentation-mode";
import { closeExpiredTopics, topicIsOpenForVoting } from "./topics";

export async function getActiveTopicsForHome() {
  if (isPresentationMode()) {
    return getPresentationTopicsActive().filter((t) => topicIsOpenForVoting(t));
  }
  await closeExpiredTopics();
  const topics = await prisma.topic.findMany({
    where: { status: TopicStatus.ACTIVE },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      options: { orderBy: { optionText: "asc" } },
    },
  });
  return topics.filter((t) => topicIsOpenForVoting(t));
}

export async function getClosedTopicsForHome() {
  if (isPresentationMode()) {
    return getPresentationTopicsClosed();
  }
  await closeExpiredTopics();
  return prisma.topic.findMany({
    where: { status: TopicStatus.CLOSED },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      options: { orderBy: { optionText: "asc" } },
    },
  });
}

export async function getTopicPublic(id: string) {
  if (isPresentationMode()) {
    return getPresentationTopicById(id);
  }
  await closeExpiredTopics();
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { options: { orderBy: { optionText: "asc" } } },
  });
  if (!topic || topic.status === TopicStatus.DRAFT) return null;
  return topic;
}
