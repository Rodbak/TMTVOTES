import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { isDbConnectionError } from "@/lib/is-db-connection-error";
import { getTopicPublic } from "@/lib/public-queries";
import { VoteClient } from "./vote-client";

export const dynamic = "force-dynamic";

type Props = { params: { topicId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const topic = await getTopicPublic(params.topicId);
    if (!topic) return { title: "Vote" };
    return {
      title: `Vote | ${topic.title}`,
      description: topic.description.slice(0, 160),
      openGraph: { title: topic.title, description: topic.description.slice(0, 200) },
    };
  } catch {
    return { title: "Vote" };
  }
}

export default async function VotePage({ params }: Props) {
  let topic;
  try {
    topic = await getTopicPublic(params.topicId);
  } catch (e) {
    if (isDbConnectionError(e)) {
      return (
        <>
          <SiteHeader />
          <DatabaseUnavailable />
          <SiteFooter />
        </>
      );
    }
    throw e;
  }
  if (!topic) notFound();
  return <VoteClient topic={topic} />;
}
