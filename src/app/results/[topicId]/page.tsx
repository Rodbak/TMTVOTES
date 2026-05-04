import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TopicStatus } from "@prisma/client";
import { getTopicPublic } from "@/lib/public-queries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { isDbConnectionError } from "@/lib/is-db-connection-error";
import { ResultsClient } from "./results-client";

export const dynamic = "force-dynamic";

type Props = { params: { topicId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const topic = await getTopicPublic(params.topicId);
    if (!topic) return { title: "Results" };
    return {
      title: `Results | ${topic.title}`,
      description: `Live results for ${topic.title}`,
      openGraph: { title: `Results: ${topic.title}` },
    };
  } catch {
    return { title: "Results" };
  }
}

export default async function ResultsPage({ params }: Props) {
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
  if (!topic || topic.status === TopicStatus.DRAFT) notFound();

  return (
    <>
      <SiteHeader />
      <ResultsClient topic={topic} />
      <SiteFooter />
    </>
  );
}
