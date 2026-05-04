import { TopicStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { isPresentationMode } from "./presentation-mode";

/** Auto-close ACTIVE topics past endDate. */
export async function closeExpiredTopics(): Promise<void> {
  if (isPresentationMode()) return;
  const now = new Date();
  await prisma.topic.updateMany({
    where: {
      status: TopicStatus.ACTIVE,
      endDate: { lt: now },
    },
    data: { status: TopicStatus.CLOSED },
  });
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
