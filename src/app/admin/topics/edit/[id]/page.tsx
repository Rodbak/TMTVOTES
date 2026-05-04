import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { TopicForm } from "../../topic-form";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EditTopicPage({ params }: Props) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: { options: { orderBy: { optionText: "asc" } } },
  });
  if (!topic) notFound();

  return (
    <div className="min-h-screen bg-tmt-bg px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/dashboard" className="text-sm text-tmt-cyan hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-tmt-text">Edit topic</h1>
        <div className="mt-8 glass rounded-2xl p-6">
          <TopicForm mode="edit" initial={topic} />
        </div>
      </div>
    </div>
  );
}
